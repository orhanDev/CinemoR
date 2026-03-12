
const fs = require('fs');
const path = require('path');

const FILM_FOLDER = 'C:\\Users\\ooorh\\OneDrive\\Desktop\\FILM';
const MOVIES_IMAGES_PATH = path.join(process.cwd(), 'public', 'images', 'movies');
const TICKETS_IMAGES_PATH = path.join(process.cwd(), 'public', 'images', 'tickets');
const API_BASE_URL = 'http://localhost:8080/api/movies';

function parseDate(dateStr) {
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    let year = parseInt(parts[2]);
    
    if (year < 100) {
      year += 2000;
    }
    
    return new Date(year, month, day);
  }
  return null;
}

function isComingSoon(kinostart) {
  if (!kinostart) return true;
  
  const releaseDate = parseDate(kinostart);
  if (!releaseDate) return true;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return releaseDate > today;
}

function parseTextFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);

    const movie = {
      title: '',
      originalTitle: '',
      genre: '',
      duration: '',
      director: '',
      cast: '',
      description: '',
      year: '',
      country: '',
      releaseDate: '',
      fsk: '',
      isComingSoon: true
    };

    const findSection = (label, endLabels = []) => {
      const endPattern = endLabels.length ? endLabels.join('|') : '$';
      const re = new RegExp(`${label}\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:${endPattern})\\b|$)`, 'i');
      const match = content.match(re);
      return match ? match[1].trim() : '';
    };

    if (lines.length > 0) {
      movie.title = lines[0].trim();
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('Filmtitel')) {
        const titleMatch = line.match(/Filmtitel\s+(.+)/i);
        if (titleMatch) movie.title = titleMatch[1].trim();
      }

      if (line.includes('Originaltitel') || line.includes('Original Titel')) {
        const match = line.match(/Originaltitel:\s*(.+)/i) || line.match(/Original Titel\s+(.+)/i);
        if (match) movie.originalTitle = match[1].trim();
      }

      if (line.startsWith('Genre')) {
        const match = line.match(/Genre:\s*(.+)/i) || line.match(/Genre\s+(.+)/i);
        if (match) movie.genre = match[1].trim();
      }

      if (line.includes('Laufzeit') || line.includes('Filmlänge') || line.includes('Länge')) {
        const match = line.match(/Laufzeit:\s*(.+)/i) || line.match(/Filmlänge\s+(.+)/i) || line.match(/Länge\s+(.+)/i);
        if (match) movie.duration = match[1].trim();
      }

      if (line.startsWith('Regie')) {
        const match = line.match(/Regie:\s*(.+)/i) || line.match(/Regie\s+(.+)/i);
        if (match) movie.director = match[1].trim();
      }

      if (line.includes('Erscheinungsjahr') || line.includes('Produktionjahr')) {
        const match = line.match(/Erscheinungsjahr:\s*(.+)/i) || line.match(/Produktionjahr\s+(.+)/i);
        if (match) movie.year = match[1].trim();
      }

      if (line.includes('Produktionsland')) {
        const match = line.match(/Produktionsland:\s*(.+)/i) || line.match(/Produktionsland\s+(.+)/i);
        if (match) movie.country = match[1].trim();
      }

      if (line.includes('Kinostart') || line.includes('Starttermin')) {
        const match = line.match(/Kinostart\s+(.+)/i) || line.match(/Starttermin:\s*(.+)/i);
        if (match) {
          movie.releaseDate = match[1].trim();
          movie.isComingSoon = isComingSoon(movie.releaseDate);
        }
      }

      if (line.includes('FSK')) {
        const match = line.match(/FSK:\s*(.+)/i) || line.match(/FSK\s+(.+)/i);
        if (match) movie.fsk = match[1].trim();
      }
    }

    const shortDesc = findSection('Kurzbeschreibung', ['Inhaltsangabe', 'Besetzung', 'Regie', 'Technische Details', 'Hinweise']);
    const longDesc = findSection('Inhaltsangabe', ['Besetzung', 'Regie', 'Technische Details', 'Hinweise']);
    const combined = [shortDesc, longDesc].filter(Boolean).join('\n\n').trim();
    if (combined) movie.description = combined;

    const castSection = findSection('Besetzung', ['Regie', 'Technische Details', 'Hinweise']);
    if (castSection) {
      const castLines = castSection.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const castNames = castLines.map(line => line.split(/\s[–-]\s/)[0].trim()).filter(Boolean);
      if (castNames.length > 0) movie.cast = castNames.join(', ');
    } else {
      const castLine = lines.find(l => l.toLowerCase().startsWith('cast'));
      if (castLine) {
        const match = castLine.match(/Cast\s+(.+)/i);
        if (match) movie.cast = match[1].trim();
      }
    }

    if (!movie.releaseDate && movie.year) {
      movie.releaseDate = `01.01.${movie.year}`;
      movie.isComingSoon = isComingSoon(movie.releaseDate);
    }

    return movie;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

function findImages(folderPath) {
  const files = fs.readdirSync(folderPath);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
  
  let posterImage = null;
  let sliderImage = null;
  let ticketImage = null;
  let extraImage = null;
  
  for (const file of files) {
    const ext = path.extname(file);
    if (imageExtensions.includes(ext) && !file.toLowerCase().includes('text')) {
      const filePath = path.join(folderPath, file);
      const upper = file.toUpperCase();
      
      if (
        upper.includes('TICKET') ||
        upper.includes('KINOTICKET') ||
        upper.includes('KINOKARTE') ||
        upper.includes('KINO-KARTE') ||
        upper.includes('KINO_KARTE')
      ) {
        ticketImage = filePath;
        continue;
      }

      if (upper.includes('-GROS') || upper.includes('GROS')) {
        sliderImage = filePath;
      } else {
        if (!posterImage) {
          posterImage = filePath;
        } else if (!extraImage) {
          extraImage = filePath;
        }
      }
    }
  }

  if (!ticketImage && extraImage) {
    ticketImage = extraImage;
  }
  
  return { posterImage, sliderImage, ticketImage };
}

function copyImage(sourcePath, destFolder, fileName, { overwrite = false } = {}) {
  try {
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    let finalName = fileName;
    let destPath = path.join(destFolder, finalName);

    if (!overwrite && fs.existsSync(destPath)) {
      return finalName;
    }

    try {
      fs.copyFileSync(sourcePath, destPath);
      return finalName;
    } catch (error) {
      const stamp = Date.now();
      finalName = `${base}-v${stamp}${ext}`;
      destPath = path.join(destFolder, finalName);
      fs.copyFileSync(sourcePath, destPath);
      return finalName;
    }
  } catch (error) {
    console.error(`Error copying image ${sourcePath}:`, error.message);
    return null;
  }
}

function sanitizeFileName(name) {
  return name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
    .substring(0, 50);
}

function cleanOldImages(movieTitle, isComingSoon) {
  const sanitizedTitle = sanitizeFileName(movieTitle);
  const destFolder = isComingSoon 
    ? path.join(MOVIES_IMAGES_PATH, 'comingsoon')
    : path.join(MOVIES_IMAGES_PATH, 'nowshowing');
  
  if (!fs.existsSync(destFolder)) return;
  
  const files = fs.readdirSync(destFolder);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
  
  for (const file of files) {
    if (file.startsWith(sanitizedTitle) && imageExtensions.some(ext => file.endsWith(ext))) {
      const filePath = path.join(destFolder, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`   🗑️  Deleted old image: ${file}`);
      } catch (error) {
        console.error(`   ⚠️  Could not delete ${file}:`, error.message);
      }
    }
  }
}

function cleanOldTicketImages(movieTitle, isComingSoon) {
  const sanitizedTitle = sanitizeFileName(movieTitle);
  const ticketFolder = isComingSoon
    ? path.join(TICKETS_IMAGES_PATH, 'comingsoon')
    : path.join(TICKETS_IMAGES_PATH, 'nowshowing');

  if (!fs.existsSync(ticketFolder)) return;

  const files = fs.readdirSync(ticketFolder);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

  for (const file of files) {
    if (file.startsWith(`${sanitizedTitle}-ticket`) && imageExtensions.some(ext => file.endsWith(ext))) {
      const filePath = path.join(ticketFolder, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`   🗑️  Deleted old ticket: ${file}`);
      } catch (error) {
        console.error(`   ⚠️  Could not delete ticket ${file}:`, error.message);
      }
    }
  }
}

async function updateMovies() {
  console.log('🎬 Starting movie update from FILM folder...\n');
  
  if (!fs.existsSync(FILM_FOLDER)) {
    console.error(`❌ FILM folder not found: ${FILM_FOLDER}`);
    process.exit(1);
  }
  
  const movies = [];
  const folders = fs.readdirSync(FILM_FOLDER);
  
  for (const folder of folders) {
    const folderPath = path.join(FILM_FOLDER, folder);
    
    if (!fs.statSync(folderPath).isDirectory()) continue;
    
    console.log(`📁 Processing: ${folder}`);
    
    const textFiles = fs.readdirSync(folderPath).filter(file => 
      file.toLowerCase().includes('text') || 
      file.toLowerCase().endsWith('.txt')
    );
    
    if (textFiles.length === 0) {
      console.log(`   ⚠️  Text file not found, skipping...\n`);
      continue;
    }
    
    const textFile = path.join(folderPath, textFiles[0]);
    
    const movie = parseTextFile(textFile);
    if (!movie || !movie.title) {
      console.log(`   ⚠️  Could not parse movie data, skipping...\n`);
      continue;
    }
    
    cleanOldImages(movie.title, movie.isComingSoon);
    cleanOldTicketImages(movie.title, movie.isComingSoon);
    
    const { posterImage, sliderImage, ticketImage } = findImages(folderPath);
    
    const sanitizedTitle = sanitizeFileName(movie.title);
    const destFolder = movie.isComingSoon 
      ? path.join(MOVIES_IMAGES_PATH, 'comingsoon')
      : path.join(MOVIES_IMAGES_PATH, 'nowshowing');
    
    if (posterImage) {
      const ext = path.extname(posterImage);
      const fileName = `${sanitizedTitle}${ext}`;
      const copied = copyImage(posterImage, destFolder, fileName, { overwrite: true });
      if (copied) {
        movie.posterPath = `/images/movies/${movie.isComingSoon ? 'comingsoon' : 'nowshowing'}/${copied}`;
        console.log(`   ✅ Poster: ${copied}`);
      }
    } else {
      console.log(`   ⚠️  Poster image not found`);
    }
    
    if (sliderImage) {
      const ext = path.extname(sliderImage);
      const fileName = `${sanitizedTitle}-slider${ext}`;
      const copied = copyImage(sliderImage, destFolder, fileName, { overwrite: true });
      if (copied) {
        movie.sliderPath = `/images/movies/${movie.isComingSoon ? 'comingsoon' : 'nowshowing'}/${copied}`;
        console.log(`   ✅ Slider: ${copied}`);
      }
    }

    if (ticketImage) {
      const ext = path.extname(ticketImage);
      const ticketFolder = movie.isComingSoon
        ? path.join(TICKETS_IMAGES_PATH, 'comingsoon')
        : path.join(TICKETS_IMAGES_PATH, 'nowshowing');
      const fileName = `${sanitizedTitle}-ticket${ext}`;
      const copied = copyImage(ticketImage, ticketFolder, fileName, { overwrite: true });
      if (copied) {
        movie.ticketPath = `/images/tickets/${movie.isComingSoon ? 'comingsoon' : 'nowshowing'}/${copied}`;
        console.log(`   ✅ Ticket: ${copied}`);
      }
    } else {
      console.log(`   ⚠️  Ticket image not found`);
    }
    
    movies.push(movie);
    console.log(`   ✅ Imported: ${movie.title} (${movie.isComingSoon ? 'Coming Soon' : 'Now Showing'})\n`);
  }
  
  console.log(`\n📊 Total movies: ${movies.length}`);
  console.log(`   - Coming Soon: ${movies.filter(m => m.isComingSoon).length}`);
  console.log(`   - Now Showing: ${movies.filter(m => !m.isComingSoon).length}`);
  
  console.log(`\n📤 Uploading to database...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movies)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log('✨ Upload successful!');
    console.log(`📊 Uploaded ${result.count} movies`);
    console.log(`\n✅ Database updated successfully!`);
    
  } catch (error) {
    console.error('\n❌ Error uploading to database:');
    console.error('Error message:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
      console.error('\n💡 Make sure:');
      console.error('   1. Backend is running on http://localhost:8080');
      console.error('   2. Check backend logs for errors');
    }
    
    const OUTPUT_JSON = path.join(process.cwd(), 'movies-data.json');
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(movies, null, 2), 'utf-8');
    console.log(`\n💾 Data saved to: ${OUTPUT_JSON}`);
    console.log(`💡 You can upload manually later with: node scripts/uploadMoviesToDB.cjs`);
  }
}

updateMovies().catch(console.error);
