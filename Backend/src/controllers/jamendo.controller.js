// ── Jamendo API Controller — Fetch & Index Music into Vectorize + D1 ─────────
import { jsonResponse, errorResponse } from '../utils/http.js';

const JAMENDO_API = 'https://api.jamendo.com/v3.0';
const ACCOUNT_ID = 'e31df8959f3a5ef85ea543dd630aeb54';
const CF_AI_MODEL = '@cf/baai/bge-m3';

// Dual-mode: env.AI (remote/deployed) or CF REST API (local via token)
async function getEmbedding(text, env) {
  if (env.AI) {
    try {
      const result = await env.AI.run(CF_AI_MODEL, { text: [text] });
      return result.data?.[0] || result[0];
    } catch { /* fall through */ }
  }
  const token = env.CF_API_TOKEN;
  if (!token) throw new Error('AI unavailable locally. Set CF_API_TOKEN in [vars] or run dev:ai');
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${CF_AI_MODEL}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: [text] }) }
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'AI API error');
  return data.result.data[0];
}

// Build rich text representation of a track for embedding
function buildEmbedText(track) {
  return [
    `Title: ${track.name || ''}`,
    `Artist: ${track.artist_name || ''}`,
    `Album: ${track.album_name || ''}`,
    `Genre: ${track.musicinfo?.tags?.genres?.join(', ') || ''}`,
    `Mood: ${track.musicinfo?.tags?.moods?.join(', ') || ''}`,
    `Instruments: ${track.musicinfo?.tags?.instruments?.join(', ') || ''}`,
    `Tags: ${track.musicinfo?.tags?.genres?.join(', ') || ''}`,
    track.musicinfo?.description ? `Description: ${track.musicinfo.description}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export const JamendoController = {
  // ── GET /api/music/jamendo/search?q=... — Live Jamendo track search ─────────
  async search(request, env) {
    try {
      const url = new URL(request.url);
      const query = url.searchParams.get('q') || '';
      const limit = url.searchParams.get('limit') || '20';
      const clientId = env.JAMENDO_CLIENT_ID || '9eca7504';

      const res = await fetch(
        `${JAMENDO_API}/tracks/?client_id=${clientId}&format=json&limit=${limit}&namesearch=${encodeURIComponent(query)}&include=musicinfo&audioformat=mp32`
      );
      const data = await res.json();

      const tracks = (data.results || []).map((t) => ({
        id: `jamendo_${t.id}`,
        title: t.name,
        artist: t.artist_name,
        album: t.album_name,
        duration: t.duration,
        artwork: t.album_image,
        audioUrl: t.audio,
        genre: t.musicinfo?.tags?.genres?.[0] || '',
        license: t.license_ccurl,
        source: 'jamendo',
      }));

      return jsonResponse({ query, total: tracks.length, results: tracks });
    } catch (err) {
      return errorResponse(`Jamendo search failed: ${err.message}`, 500);
    }
  },

  // ── POST /api/music/jamendo/index?limit=50 — Batch index Jamendo tracks ─────
  async indexTracks(request, env) {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '30', 10);
      const genre = url.searchParams.get('genre') || '';
      const clientId = env.JAMENDO_CLIENT_ID || '9eca7504';

      const params = new URLSearchParams({
        client_id: clientId, format: 'json', limit: String(limit),
        include: 'musicinfo', audioformat: 'mp32', orderby: 'popularity_total',
      });
      if (genre) params.set('tags', genre);

      const res = await fetch(`${JAMENDO_API}/tracks/?${params}`);
      const data = await res.json();
      const tracks = data.results || [];

      let indexed = 0;
      const errors = [];

      for (const track of tracks) {
        try {
          const embText = buildEmbedText(track);
          const vector = await getEmbedding(embText, env);

          // Upsert into Vectorize
          await env.VECTORIZE.upsert([{
            id: `music:jamendo_${track.id}`,
            values: vector,
            metadata: { title: track.name, artist: track.artist_name, source: 'jamendo' },
          }]);

          // Upsert into D1 (INSERT OR REPLACE)
          await env.DB.prepare(
            `INSERT OR REPLACE INTO music (title, artist, description, video_key, thumbnail_key)
             VALUES (?, ?, ?, ?, ?)`
          )
            .bind(
              track.name,
              track.artist_name,
              `Genre: ${track.musicinfo?.tags?.genres?.join(',')}`,
              track.audio || '',
              track.album_image || ''
            )
            .run();

          indexed++;
        } catch (e) {
          errors.push({ id: track.id, error: e.message });
        }
      }

      return jsonResponse({ success: true, total: tracks.length, indexed, errors });
    } catch (err) {
      return errorResponse(`Jamendo indexing failed: ${err.message}`, 500);
    }
  },
};

const GENRE_MOOD_MAP = {
  sad: 'nhạc buồn, thất tình, tâm trạng, sâu lắng, cô đơn, khóc, chia tay, sad, heartbreak, lonely, emotional',
  happy: 'nhạc vui vẻ, yêu đời, tươi sáng, tích cực, vui tươi, happy, cheerful, uplifting, positive',
  energetic: 'nhạc ồn ào, khuấy động, bùng nổ, quẩy, hăng hái, sôi động, energetic, explosive, party',
  party: 'nhạc quẩy, ồn ào, khuấy động, tiệc tùng, sôi động, bar, club, dance, festival',
  relaxing: 'nhạc nhẹ, thư giãn, êm dịu, nhẹ nhàng, ngủ ngon, xả stress, relaxing, peaceful, calm',
  sleep: 'nhạc ngủ, thư giãn sâu, không lời, nhẹ nhàng, du dương, sleep, insomnia, meditation',
  workout: 'nhạc tập gym, thể thao, động lực, dồn dập, bốc lửa, workout, fitness, motivation',
  romantic: 'nhạc tình yêu, lãng mạn, đôi lứa, ngọt ngào, romantic, love, sweet',
  chillout: 'nhạc chill, nhẹ nhàng, quán cafe, học bài, làm việc, lofi, chillout, study, focus',
  pop: 'nhạc pop, nhạc trẻ, bắt tai, vui tươi, giai điệu, popular, catchy',
  rock: 'nhạc rock, guitar điện, mạnh mẽ, ồn ào, cá tính, rock, electric guitar',
  jazz: 'nhạc jazz, saxophone, piano, quán cafe, sang trọng, tinh tế, jazz, blues',
  classical: 'nhạc cổ điển, hòa tấu, không lời, piano, giao hưởng, violin, classical, symphony',
  acoustic: 'nhạc mộc, guitar gỗ, nhẹ nhàng, mộc mạc, bình yên, acoustic, folk',
  electronic: 'nhạc điện tử, edm, quẩy, sôi động, biến ảo, electronic, edm, synth',
};

export async function autoSeedJamendo(env) {
  console.log('⏰ [Cloudflare Cron Job] Auto-seeding Jamendo tracks to Remote D1...');
  const categories = Object.keys(GENRE_MOOD_MAP);
  let totalInserted = 0;

  for (const cat of categories) {
    try {
      const clientId = env.JAMENDO_CLIENT_ID || '9eca7504';
      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=10&include=musicinfo&audioformat=mp32&tags=${cat}`;
      const res = await fetch(url);
      const data = await res.json();
      const tracks = data.results || [];

      for (const track of tracks) {
        const title = track.name || '';
        const artist = track.artist_name || '';
        const tagExtra = GENRE_MOOD_MAP[cat] || '';
        const rawTags = (track.musicinfo?.tags?.genres || [])
          .concat(track.musicinfo?.tags?.moods || [])
          .concat(track.musicinfo?.tags?.instruments || [])
          .join(', ');
        const desc = `Categories: ${cat}, ${rawTags} | Keywords: ${tagExtra}`;
        const audioUrl = track.audio || '';
        const artwork = track.album_image || '';

        // Check for duplicate title & artist in D1
        const existing = await env.DB.prepare(
          'SELECT id FROM music WHERE LOWER(title) = LOWER(?) AND LOWER(artist) = LOWER(?)'
        )
          .bind(title, artist)
          .first();

        if (!existing) {
          await env.DB.prepare(
            `INSERT INTO music (title, artist, description, video_key, thumbnail_key) VALUES (?, ?, ?, ?, ?)`
          )
            .bind(title, artist, desc, audioUrl, artwork)
            .run();

          totalInserted++;
        }
      }
    } catch (err) {
      console.warn(`Cron seed error for genre ${cat}:`, err.message);
    }
  }

  console.log(`✅ [Cloudflare Cron Job Finished] Successfully seeded ${totalInserted} new non-duplicate tracks into D1 Remote.`);
  return totalInserted;
}
