const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isRemote = process.argv.includes('--remote') || process.env.REMOTE === 'true';
const targetFlag = isRemote ? '--remote' : '--local';

const GENRE_TAG_MAP = {
  chillout: 'nhạc nhẹ, thư giãn, chill, học bài, không lời, calm, study, ambient',
  ambient: 'nhạc nhẹ, thư giãn, không lời, ngủ ngon, tập trung, ambient, peaceful',
  pop: 'nhạc pop, nhạc trẻ, vui tươi, sôi động, catchy, popular',
  jazz: 'nhạc jazz, quán cafe, thư giãn, sang trọng, piano, saxophone',
  classical: 'nhạc cổ điển, không lời, piano, violin, học bài, tập trung, classical',
  acoustic: 'nhạc mộc, guitar, nhẹ nhàng, sâu lắng, acoustic',
  rock: 'nhạc rock, sôi động, mạnh mẽ, guitar điện, energetic',
  electronic: 'nhạc điện tử, edm, sôi động, dance, beat',
};

async function seed() {
  console.log(`🎵 Fetching multi-genre tracks from Jamendo API (Target: ${isRemote ? 'Cloudflare Remote D1' : 'Local D1'})...`);

  const allTracks = [];
  const genres = Object.keys(GENRE_TAG_MAP);

  for (const genre of genres) {
    try {
      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=9eca7504&format=json&limit=10&include=musicinfo&audioformat=mp32&tags=${genre}`;
      const res = await fetch(url);
      const data = await res.json();
      const tracks = data.results || [];
      console.log(`  └─ [${genre.toUpperCase()}] Found ${tracks.length} tracks.`);
      
      tracks.forEach(t => {
        t._seededGenre = genre;
        allTracks.push(t);
      });
    } catch (e) {
      console.warn(`  ⚠️ Failed fetching genre ${genre}:`, e.message);
    }
  }

  if (allTracks.length === 0) {
    console.log('❌ No tracks fetched.');
    return;
  }

  console.log(`📦 Total fetched: ${allTracks.length} tracks across ${genres.length} genres.`);
  console.log('⏳ Generating SQL batch insert...');

  const statements = allTracks.map((track) => {
    const title = (track.name || '').replace(/'/g, "''");
    const artist = (track.artist_name || '').replace(/'/g, "''");
    const tagExtra = GENRE_TAG_MAP[track._seededGenre] || '';
    const rawTags = (track.musicinfo?.tags?.genres || []).concat(track.musicinfo?.tags?.moods || []).join(', ');
    const desc = `Genre: ${track._seededGenre}, ${rawTags} | Keywords: ${tagExtra}`.replace(/'/g, "''");
    const audioUrl = (track.audio || '').replace(/'/g, "''");
    const artwork = (track.album_image || '').replace(/'/g, "''");

    return `INSERT OR REPLACE INTO music (title, artist, description, video_key, thumbnail_key) VALUES ('${title}', '${artist}', '${desc}', '${audioUrl}', '${artwork}');`;
  });

  const tempSqlFile = path.join(__dirname, 'temp_seed.sql');
  fs.writeFileSync(tempSqlFile, statements.join('\n'), 'utf-8');

  console.log(`⚡ Executing SQL batch insert into ${isRemote ? 'Remote D1 Cloud Database' : 'Local D1'}...`);
  try {
    execSync(`npx wrangler d1 execute react-native-db ${targetFlag} --file="${tempSqlFile}"`, { stdio: 'inherit' });
    console.log(`🎉 Successfully seeded ${allTracks.length} multi-genre tracks into ${isRemote ? 'Remote Cloudflare D1' : 'local D1'} database!`);
  } catch (err) {
    console.error('❌ Error executing D1 seed:', err.message);
  } finally {
    if (fs.existsSync(tempSqlFile)) {
      fs.unlinkSync(tempSqlFile);
    }
  }
}

seed();