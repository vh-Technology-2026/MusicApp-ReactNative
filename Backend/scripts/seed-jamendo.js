const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isRemote = process.argv.includes('--remote') || process.env.REMOTE === 'true';
const targetFlag = isRemote ? '--remote' : '--local';

const GENRE_MOOD_MAP = {
  // --- Cảm xúc & Hoạt động ---
  sad: 'nhạc buồn, thất tình, tâm trạng, sâu lắng, cô đơn, khóc, chia tay, sad, heartbreak, lonely, emotional',
  happy: 'nhạc vui vẻ, yêu đời, tươi sáng, tích cực, vui tươi, happy, cheerful, uplifting, positive',
  energetic: 'nhạc ồn ào, khuấy động, bùng nổ, quẩy, hăng hái, sôi động, energetic, explosive, party',
  party: 'nhạc quẩy, ồn ào, khuấy động, tiệc tùng, sôi động, bar, club, dance, festival',
  relaxing: 'nhạc nhẹ, thư giãn, êm dịu, nhẹ nhàng, ngủ ngon, xả stress, relaxing, peaceful, calm',
  sleep: 'nhạc ngủ, thư giãn sâu, không lời, nhẹ nhàng, du dương, sleep, insomnia, meditation',
  workout: 'nhạc tập gym, thể thao, động lực, dồn dập, bốc lửa, workout, fitness, motivation',
  romantic: 'nhạc tình yêu, lãng mạn, đôi lứa, ngọt ngào, romantic, love, sweet',
  chillout: 'nhạc chill, nhẹ nhàng, quán cafe, học bài, làm việc, lofi, chillout, study, focus',
  
  // --- Thể loại nhạc ---
  pop: 'nhạc pop, nhạc trẻ, bắt tai, vui tươi, giai điệu, popular, catchy',
  rock: 'nhạc rock, guitar điện, mạnh mẽ, ồn ào, cá tính, rock, electric guitar',
  metal: 'nhạc metal, gào hú, bốc lửa, ồn ào, dồn dập, mạnh mẽ, heavy metal, headbang',
  hiphop: 'nhạc hiphop, rap, sành điệu, nhịp điệu, beat, hiphop, rap, street',
  jazz: 'nhạc jazz, saxophone, piano, quán cafe, sang trọng, tinh tế, jazz, blues',
  classical: 'nhạc cổ điển, hòa tấu, không lời, piano, giao hưởng, violin, classical, symphony',
  acoustic: 'nhạc mộc, guitar gỗ, nhẹ nhàng, mộc mạc, bình yên, acoustic, folk',
  electronic: 'nhạc điện tử, edm, quẩy, sôi động, biến ảo, electronic, edm, synth',
  reggae: 'nhạc reggae, chill bãi biển, tự do, phượt, reggae, tropical',
  indie: 'nhạc indie, nghệ thuật, độc lạ, cá tính, sâu lắng, indie, alternative',
};

async function seed() {
  console.log(`🚀 Starting BULK SEEDING for ALL genres & moods (Target: ${isRemote ? 'Cloudflare Remote D1' : 'Local D1'})...`);

  const trackMap = new Map(); // deduplicate by jamendo track id
  const categories = Object.keys(GENRE_MOOD_MAP);

  for (const category of categories) {
    try {
      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=9eca7504&format=json&limit=15&include=musicinfo&audioformat=mp32&tags=${category}`;
      const res = await fetch(url);
      const data = await res.json();
      const tracks = data.results || [];
      console.log(`  └─ [${category.toUpperCase()}] Fetched ${tracks.length} tracks.`);
      
      tracks.forEach(t => {
        if (!trackMap.has(t.id)) {
          t._seededCategories = [category];
          trackMap.set(t.id, t);
        } else {
          trackMap.get(t.id)._seededCategories.push(category);
        }
      });
    } catch (e) {
      console.warn(`  ⚠️ Failed fetching category ${category}:`, e.message);
    }
  }

  const allTracks = Array.from(trackMap.values());

  if (allTracks.length === 0) {
    console.log('❌ No tracks fetched.');
    return;
  }

  console.log(`📦 Total unique tracks fetched: ${allTracks.length} across ${categories.length} categories.`);
  console.log('⏳ Generating SQL batch insert...');

  const statements = allTracks.map((track) => {
    const title = (track.name || '').replace(/'/g, "''");
    const artist = (track.artist_name || '').replace(/'/g, "''");
    
    const catExtras = track._seededCategories.map(c => GENRE_MOOD_MAP[c] || '').join(', ');
    const rawTags = (track.musicinfo?.tags?.genres || [])
      .concat(track.musicinfo?.tags?.moods || [])
      .concat(track.musicinfo?.tags?.instruments || [])
      .join(', ');

    const desc = `Categories: ${track._seededCategories.join(',')}, ${rawTags} | Keywords: ${catExtras}`.replace(/'/g, "''");
    const audioUrl = (track.audio || '').replace(/'/g, "''");
    const artwork = (track.album_image || '').replace(/'/g, "''");

    return `INSERT OR REPLACE INTO music (title, artist, description, video_key, thumbnail_key) VALUES ('${title}', '${artist}', '${desc}', '${audioUrl}', '${artwork}');`;
  });

  const tempSqlFile = path.join(__dirname, 'temp_seed.sql');
  fs.writeFileSync(tempSqlFile, statements.join('\n'), 'utf-8');

  console.log(`⚡ Executing BULK SQL insert into ${isRemote ? 'Remote D1 Cloud Database' : 'Local D1'}...`);
  try {
    execSync(`npx wrangler d1 execute react-native-db ${targetFlag} --file="${tempSqlFile}"`, { stdio: 'inherit' });
    console.log(`🎉 BULK SEED COMPLETE! Successfully inserted ${allTracks.length} unique tracks into ${isRemote ? 'Remote Cloudflare D1' : 'Local D1'} database!`);
  } catch (err) {
    console.error('❌ Error executing D1 bulk seed:', err.message);
  } finally {
    if (fs.existsSync(tempSqlFile)) {
      fs.unlinkSync(tempSqlFile);
    }
  }
}

seed();