
const fs = require('fs');
const path = require('path');

const MOVIES_JSON_PATH = path.join(process.cwd(), 'movies-data.json');
const API_BASE_URL = 'http://localhost:8080/api/movies';

async function uploadMoviesToDB() {
  try {
    console.log('📤 Starting upload to database...\n');
    
    if (!fs.existsSync(MOVIES_JSON_PATH)) {
      console.error('❌ movies-data.json file not found!');
      console.log('💡 Run: node scripts/importMovies.cjs first');
      process.exit(1);
    }
    
    const moviesData = JSON.parse(fs.readFileSync(MOVIES_JSON_PATH, 'utf-8'));
    console.log(`📊 Found ${moviesData.length} movies to upload\n`);
    
    const response = await fetch(`${API_BASE_URL}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(moviesData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log('✨ Upload successful!');
    console.log(`📊 Uploaded ${result.count} movies`);
    console.log(`\n✅ Movies are now in the database!`);
    console.log(`\n🔗 Test endpoints:`);
    console.log(`   - GET ${API_BASE_URL}`);
    console.log(`   - GET ${API_BASE_URL}/coming-soon`);
    console.log(`   - GET ${API_BASE_URL}/now-showing`);
    
  } catch (error) {
    console.error('\n❌ Error uploading movies:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    console.error('Full error:', error);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      console.error('\n💡 Make sure:');
      console.error('   1. Backend is running on http://localhost:8080');
      console.error('   2. Check backend logs for errors');
      console.error('   3. Try accessing: http://localhost:8080/api/movies in browser');
      console.error('   4. Database is connected');
      console.error('   5. CORS is enabled in backend');
    }
    
    process.exit(1);
  }
}

uploadMoviesToDB();
