const fs = require('fs');
const path = require('path');

const FILM_FOLDER = 'C:\\Users\\ooorh\\OneDrive\\Desktop\\FILM';
const MOVIES_IMAGES_PATH = path.join(process.cwd(), 'public', 'images', 'movies');
const TICKETS_IMAGES_PATH = path.join(process.cwd(), 'public', 'images', 'tickets');
const OUTPUT_JSON = path.join(process.cwd(), 'movies-data.json');

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
      year: '',
      country: '',
      releaseDate: '',
      fsk: '',
      isComingSoon: true
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('Filmtitel') || (i === 0 && !line.includes('Kurzdaten'))) {
        const titleMatch = line.match(/Filmtitel\s+(.+)/i) || (i === 0 ? [null, line] : null);
        if (titleMatch) {
          movie.title = titleMatch[1].trim();
        }
      }
      
      if (line.includes('Original Titel')) {
        const match = line.match(/Original Titel\s+(.+)/i);
        if (match) movie.originalTitle = match[1].trim();
      }
      
      if (line.includes('Genre')) {
        const match = line.match(/Genre\s+(.+)/i);
        if (match) movie.genre = match[1].trim();
      }
      
      if (line.includes('Filmlänge') || line.includes('Länge')) {
        const match = line.match(/Filmlänge\s+(.+)/i) || line.match(/Länge\s+(.+)/i);
        if (match) movie.duration = match[1].trim();
      }
      
      if (line.includes('Regie')) {
        const match = line.match(/Regie\s+(.+)/i);
        if (match) movie.director = match[1].trim();
      }
      
      if (line.includes('Cast')) {
        const match = line.match(/Cast\s+(.+)/i);
        if (match) movie.cast = match[1].trim();
      }
      
      if (line.includes('Produktionjahr')) {
        const match = line.match(/Produktionjahr\s+(.+)/i);
        if (match) movie.year = match[1].trim();
      }
      
      if (line.includes('Produktionsland')) {
        const match = line.match(/Produktionsland\s+(.+)/i);
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
        const match = line.match(/FSK\s+(.+)/i);
        if (match) movie.fsk = match[1].trim();
      }
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

  for (const file of files) {
    const ext = path.extname(file);
    if (!imageExtensions.includes(ext)) continue;
    if (file.toLowerCase().includes('text')) continue;

    const filePath = path.join(folderPath, file);

    if (file.toUpperCase().includes('TICKET')) {
      ticketImage = filePath;
      continue;
    }

    if (file.toUpperCase().includes('-GROS') || file.toUpperCase().includes('GROS')) {
      sliderImage = filePath;
      continue;
    }

    if (!posterImage) posterImage = filePath;
  }

  return { posterImage, sliderImage, ticketImage };
}

function copyImage(sourcePath, destFolder, fileName) {
  try {
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    
    const destPath = path.join(destFolder, fileName);
    if (fs.existsSync(destPath)) {
      return fileName;
    }
    fs.copyFileSync(sourcePath, destPath);
    return fileName;
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

async function importMovies() {
  console.log('🎬 Starting movie import...\n');
  
  const movies = [];
  const folders = fs.readdirSync(FILM_FOLDER);
  
  for (const folder of folders) {
    const folderPath = path.join(FILM_FOLDER, folder);
    
    if (!fs.statSync(folderPath).isDirectory()) continue;
    
    console.log(`📁 Processing: ${folder}`);
    
    const textFile = path.join(folderPath, 'Yeni Textdokument.txt');
    if (!fs.existsSync(textFile)) {
      console.log(`   ⚠️  Text file not found, skipping...\n`);
      continue;
    }
    
    const movie = parseTextFile(textFile);
    if (!movie || !movie.title) {
      console.log(`   ⚠️  Could not parse movie data, skipping...\n`);
      continue;
    }
    
    const { posterImage, sliderImage, ticketImage } = findImages(folderPath);

    if (posterImage) {
      const ext = path.extname(posterImage);
      const sanitizedTitle = sanitizeFileName(movie.title);
      const fileName = `${sanitizedTitle}${ext}`;
      
      const destFolder = movie.isComingSoon 
        ? path.join(MOVIES_IMAGES_PATH, 'comingsoon')
        : path.join(MOVIES_IMAGES_PATH, 'nowshowing');
      
      copyImage(posterImage, destFolder, fileName);
      movie.posterPath = `/images/movies/${movie.isComingSoon ? 'comingsoon' : 'nowshowing'}/${fileName}`;
      console.log(`   ✅ Imported: ${movie.title} (${movie.isComingSoon ? 'Coming Soon' : 'Now Showing'})`);
    } else {
      console.log(`   ⚠️  Poster image not found`);
    }

    if (sliderImage) {
      const ext = path.extname(sliderImage);
      const sanitizedTitle = sanitizeFileName(movie.title);
      const fileName = `${sanitizedTitle}-slider${ext}`;

      const destFolder = movie.isComingSoon 
        ? path.join(MOVIES_IMAGES_PATH, 'comingsoon')
        : path.join(MOVIES_IMAGES_PATH, 'nowshowing');

      copyImage(sliderImage, destFolder, fileName);
      movie.sliderPath = `/images/movies/${movie.isComingSoon ? 'comingsoon' : 'nowshowing'}/${fileName}`;
    }

    if (ticketImage) {
      const ext = path.extname(ticketImage);
      const sanitizedTitle = sanitizeFileName(movie.title);
      const ticketFolder = movie.isComingSoon
        ? path.join(TICKETS_IMAGES_PATH, 'comingsoon')
        : path.join(TICKETS_IMAGES_PATH, 'nowshowing');
      const fileName = `${sanitizedTitle}-ticket${ext}`;

      copyImage(ticketImage, ticketFolder, fileName);
      movie.ticketPath = `/images/tickets/${movie.isComingSoon ? 'comingsoon' : 'nowshowing'}/${fileName}`;
    }
    
    movies.push(movie);
    console.log('');
  }
  
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(movies, null, 2), 'utf-8');
  
  console.log(`\n✨ Import complete!`);
  console.log(`📊 Total movies: ${movies.length}`);
  console.log(`   - Coming Soon: ${movies.filter(m => m.isComingSoon).length}`);
  console.log(`   - Now Showing: ${movies.filter(m => !m.isComingSoon).length}`);
  console.log(`\n📄 Data saved to: ${OUTPUT_JSON}`);
  console.log(`\n💡 Next step: Import this JSON to your database!`);
}

importMovies().catch(console.error);
