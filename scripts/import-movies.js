const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FILM_DIR = 'C:\\Users\\ooorh\\OneDrive\\Desktop\\FILM';
const OUTPUT_DIR = path.join(__dirname, 'cinemor-react', 'public', 'images', 'movies');
const JSON_OUTPUT = path.join(__dirname, 'cinemor-react', 'src', 'data', 'movies-import.json');

function parseDate(dateStr) {
	if (!dateStr) return null;
	const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{2})/);
	if (!match) return null;
	
	const [, day, month, year] = match;
	const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
	return `${fullYear}-${month}-${day}`;
}

function parseDuration(durationStr) {
	if (!durationStr) return 120;
	const match = durationStr.match(/(\d+)/);
	return match ? parseInt(match[1]) : 120;
}

function parseFSK(fskStr) {
	if (!fskStr) return null;
	
	const match = fskStr.match(/(\d+)/);
	return match ? parseInt(match[1]) : null;
}

function parseMovieFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n').map(line => line.trim()).filter(line => line);
	
	const movie = {
		title: '',
		originalTitle: '',
		genre: '',
		duration: 120,
		director: '',
		cast: '',
		productionYear: null,
		productionCountry: '',
		distributor: '',
		releaseDate: null,
		fsk: null,
		isComingSoon: false
	};
	
	let currentKey = '';
	
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (i === 0 && !line.includes(':')) {
			movie.title = line;
			continue;
		}
		if (line.includes('Starttermin:') || line.includes('Kinostart:')) {
			const dateMatch = line.match(/(\d{2})\.(\d{2})\.(\d{2})/);
			if (dateMatch) {
				movie.releaseDate = parseDate(line);
				const releaseDate = new Date(movie.releaseDate);
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				movie.isComingSoon = releaseDate > today;
			}
			continue;
		}
		if (line.includes('\t')) {
			const [key, value] = line.split('\t').map(s => s.trim());
			
			switch (key) {
				case 'Filmtitel':
					movie.title = value;
					break;
				case 'Original Titel':
					movie.originalTitle = value;
					break;
				case 'Genre':
					movie.genre = value;
					break;
				case 'Filmlänge':
					movie.duration = parseDuration(value);
					break;
				case 'Regie':
					movie.director = value;
					break;
				case 'Cast':
					movie.cast = value;
					break;
				case 'Produktionjahr':
					movie.productionYear = parseInt(value) || null;
					break;
				case 'Produktionsland':
					movie.productionCountry = value;
					break;
				case 'Verleih':
					movie.distributor = value;
					break;
				case 'FSK':
					movie.fsk = parseFSK(value);
					break;
			}
		}
	}
	
	return movie;
}

function importMovies() {
	console.log('🎬 Film-Import wird gestartet...\n');
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}
	
	const dataDir = path.join(__dirname, 'cinemor-react', 'src', 'data');
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
	
	const movies = [];
	const folders = fs.readdirSync(FILM_DIR);
	
	for (const folder of folders) {
		const folderPath = path.join(FILM_DIR, folder);
		const stat = fs.statSync(folderPath);
		
		if (!stat.isDirectory()) continue;
		
		console.log(`📁 Wird verarbeitet: ${folder}`);
		const textFile = path.join(folderPath, 'Yeni Textdokument.txt');
		if (!fs.existsSync(textFile)) {
			console.log(`   ⚠️  Textdatei nicht gefunden, wird übersprungen...\n`);
			continue;
		}
		const movieData = parseMovieFile(textFile);
		const posterFiles = fs.readdirSync(folderPath).filter(file => 
			file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
		);
		
		if (posterFiles.length === 0) {
			console.log(`   ⚠️  Poster nicht gefunden, wird übersprungen...\n`);
			continue;
		}
		
		const posterFile = posterFiles[0];
		const posterPath = path.join(folderPath, posterFile);
		const posterExt = path.extname(posterFile);
		const posterSlug = folder.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
		const posterFileName = `${posterSlug}${posterExt}`;
		const posterDest = path.join(OUTPUT_DIR, posterFileName);
		try {
			fs.copyFileSync(posterPath, posterDest);
			movieData.posterUrl = `/images/movies/${posterFileName}`;
			console.log(`   ✅ Poster kopiert: ${posterFileName}`);
		} catch (error) {
			console.log(`   ❌ Poster konnte nicht kopiert werden: ${error.message}`);
			continue;
		}
		movieData.slug = folder.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
		movieData.rating = 8.0;
		
		movies.push(movieData);
		console.log(`   ✅ Film hinzugefügt: ${movieData.title}\n`);
	}
	fs.writeFileSync(JSON_OUTPUT, JSON.stringify(movies, null, 2), 'utf-8');
	console.log(`\n✅ Insgesamt ${movies.length} Filme importiert!`);
	console.log(`📄 JSON-Datei: ${JSON_OUTPUT}`);
	console.log(`🖼️  Poster: ${OUTPUT_DIR}\n`);
	const comingSoon = movies.filter(m => m.isComingSoon).length;
	const inTheaters = movies.length - comingSoon;
	
	console.log(`📊 Zusammenfassung:`);
	console.log(`   🎬 Im Kino: ${inTheaters}`);
	console.log(`   📅 Demnächst: ${comingSoon}\n`);
	
	return movies;
}

if (require.main === module) {
	try {
		importMovies();
	} catch (error) {
		console.error('❌ Fehler:', error);
		process.exit(1);
	}
}

module.exports = { importMovies };
