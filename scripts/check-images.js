/**
 * Film görsellerini kontrol eden script
 * Kullanım: node scripts/check-images.js
 * 
 * API'den film listesini alır ve görsellerin mevcut olup olmadığını kontrol eder
 * Gerçek dosya adlarını okuyup film başlıklarıyla eşleştirir
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Film başlığından dosya adına dönüşüm fonksiyonu (local-image-utils.js'dekiyle aynı)
function titleToFilename(title) {
	if (!title || typeof title !== 'string') return '';
	
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
		.replace(/\s+/g, '_') // Replace spaces with underscores
		.replace(/-+/g, '-') // Replace multiple hyphens with single
		.replace(/^[-_]+|[-_]+$/g, ''); // Remove leading/trailing hyphens/underscores
}

// Dosya adından film başlığına yaklaşık eşleştirme (fuzzy match)
function filenameMatchesTitle(filename, title) {
	const expected = titleToFilename(title);
	const normalized = filename.toLowerCase().replace(/\.(jpg|png)$/, '').replace(/-slider$/, '');
	return normalized === expected || normalized.includes(expected) || expected.includes(normalized);
}

// API'den film listesini al (veya fallback kullan)
async function fetchMovies() {
	const API_URL = process.env.VITE_API_URL_WITHOUT_API || 'http://localhost:8081';
	
	try {
		const response = await fetch(`${API_URL}/api/movies`);
		if (!response.ok) throw new Error(`API error: ${response.status}`);
		
		const data = await response.json();
		const movies = Array.isArray(data?.object?.content) 
			? data.object.content 
			: Array.isArray(data?.object) 
				? data.object 
				: Array.isArray(data) 
					? data 
					: [];
		
		return movies.map(m => ({
			title: m.title,
			isComingSoon: m.isComingSoon ?? false
		}));
	} catch (error) {
		console.log(`⚠️  API'den film listesi alınamadı (${error.message}). Fallback listesi kullanılıyor...\n`);
		
		// Fallback: Örnek film listesi
		return [
			{ title: "AB DURCH DIE MITTE", isComingSoon: true },
			{ title: "BON VOYAGE – BIS HIERHER UND NOCH WEITER", isComingSoon: false },
			{ title: "CHARLIE DER SUPERHUND", isComingSoon: true },
			{ title: "DAS SYSTEM MILCH", isComingSoon: false },
			{ title: "LES MISÉRABLES – DIE GESCHICHTE VON JEAN VALJEAN", isComingSoon: false },
			{ title: "HOME ENTERTAINMENT", isComingSoon: true },
			{ title: "KEIN WEG ZURUCK", isComingSoon: false },
			{ title: "MONSIEUR ROBERT KENNT KEIN PARDON", isComingSoon: true },
			{ title: "NACHBEBEN", isComingSoon: true },
		];
	}
}

// Gerçek dosya adlarını klasörden oku
function getActualFiles(dir) {
	if (!fs.existsSync(dir)) return { posters: [], sliders: [] };
	
	const files = fs.readdirSync(dir);
	return {
		posters: files.filter(f => f.endsWith('.jpg')).map(f => f.replace(/\.jpg$/, '')),
		sliders: files.filter(f => f.endsWith('-slider.png')).map(f => f.replace(/-slider\.png$/, ''))
	};
}

const publicDir = path.join(__dirname, '..', 'public');
const nowShowingDir = path.join(publicDir, 'images', 'movies', 'nowshowing');
const comingSoonDir = path.join(publicDir, 'images', 'movies', 'comingsoon');

console.log('🎬 Film Görselleri Kontrolü\n');
console.log('='.repeat(60));

const movies = await fetchMovies();
console.log(`📋 ${movies.length} film kontrol ediliyor...\n`);

let missingPosters = [];
let missingSliders = [];
let foundPosters = [];
let foundSliders = [];
let wrongFolder = [];
let foundInOtherFolder = [];

// Gerçek dosya adlarını al
const actualNowShowing = getActualFiles(nowShowingDir);
const actualComingSoon = getActualFiles(comingSoonDir);

movies.forEach(movie => {
	const expectedFilename = titleToFilename(movie.title);
	const expectedFolder = movie.isComingSoon ? 'comingsoon' : 'nowshowing';
	const expectedDir = movie.isComingSoon ? comingSoonDir : nowShowingDir;
	const otherDir = movie.isComingSoon ? nowShowingDir : comingSoonDir;
	const otherFiles = movie.isComingSoon ? actualNowShowing : actualComingSoon;
	
	const posterPath = path.join(expectedDir, `${expectedFilename}.jpg`);
	const sliderPath = path.join(expectedDir, `${expectedFilename}-slider.png`);
	
	const hasPoster = fs.existsSync(posterPath);
	const hasSlider = fs.existsSync(sliderPath);
	
	// Yanlış klasörde var mı kontrol et (fuzzy match)
	const posterInOtherFolder = otherFiles.posters.some(f => filenameMatchesTitle(f, movie.title));
	const sliderInOtherFolder = otherFiles.sliders.some(f => filenameMatchesTitle(f, movie.title));
	
	if (posterInOtherFolder || sliderInOtherFolder) {
		wrongFolder.push({
			movie: movie.title,
			expected: expectedFolder,
			actual: movie.isComingSoon ? 'nowshowing' : 'comingsoon',
			poster: posterInOtherFolder,
			slider: sliderInOtherFolder
		});
	}
	
	// Diğer klasörde bulunduysa, oradan al
	if (posterInOtherFolder) {
		const foundFilename = otherFiles.posters.find(f => filenameMatchesTitle(f, movie.title));
		foundInOtherFolder.push({
			movie: movie.title,
			type: 'poster',
			foundIn: movie.isComingSoon ? 'nowshowing' : 'comingsoon',
			filename: foundFilename
		});
	}
	if (sliderInOtherFolder) {
		const foundFilename = otherFiles.sliders.find(f => filenameMatchesTitle(f, movie.title));
		foundInOtherFolder.push({
			movie: movie.title,
			type: 'slider',
			foundIn: movie.isComingSoon ? 'nowshowing' : 'comingsoon',
			filename: foundFilename
		});
	}
	
	if (!hasPoster && !posterInOtherFolder) {
		missingPosters.push({ 
			movie: movie.title, 
			path: `/images/movies/${expectedFolder}/${expectedFilename}.jpg`,
			filename: expectedFilename
		});
	} else if (hasPoster) {
		foundPosters.push({ movie: movie.title, path: `/images/movies/${expectedFolder}/${expectedFilename}.jpg` });
	}
	
	if (!hasSlider && !sliderInOtherFolder) {
		missingSliders.push({ 
			movie: movie.title, 
			path: `/images/movies/${expectedFolder}/${expectedFilename}-slider.png`,
			filename: expectedFilename
		});
	} else if (hasSlider) {
		foundSliders.push({ movie: movie.title, path: `/images/movies/${expectedFolder}/${expectedFilename}-slider.png` });
	}
});

console.log('\n✅ Bulunan Posterler:');
if (foundPosters.length === 0) {
	console.log('   Hiç poster bulunamadı.');
} else {
	foundPosters.forEach(item => {
		console.log(`   ✓ ${item.movie}`);
		console.log(`     ${item.path}`);
	});
}

if (foundInOtherFolder.filter(f => f.type === 'poster').length > 0) {
	console.log('\n📁 Diğer Klasörde Bulunan Posterler:');
	foundInOtherFolder.filter(f => f.type === 'poster').forEach(item => {
		console.log(`   ⚠ ${item.movie}`);
		console.log(`     Bulunduğu: ${item.foundIn}/${item.filename}.jpg`);
		console.log(`     Taşınmalı: ${item.foundIn === 'nowshowing' ? 'comingsoon' : 'nowshowing'}/`);
	});
}

console.log('\n❌ Eksik Posterler:');
if (missingPosters.length === 0) {
	console.log('   Tüm posterler mevcut! 🎉');
} else {
	missingPosters.forEach(item => {
		console.log(`   ✗ ${item.movie}`);
		console.log(`     Beklenen: ${item.path}`);
		console.log(`     Dosya adı: ${item.filename}.jpg`);
	});
}

console.log('\n✅ Bulunan Slider Görselleri:');
if (foundSliders.length === 0) {
	console.log('   Hiç slider bulunamadı.');
} else {
	foundSliders.forEach(item => {
		console.log(`   ✓ ${item.movie}`);
		console.log(`     ${item.path}`);
	});
}

if (foundInOtherFolder.filter(f => f.type === 'slider').length > 0) {
	console.log('\n📁 Diğer Klasörde Bulunan Slider Görselleri:');
	foundInOtherFolder.filter(f => f.type === 'slider').forEach(item => {
		console.log(`   ⚠ ${item.movie}`);
		console.log(`     Bulunduğu: ${item.foundIn}/${item.filename}-slider.png`);
		console.log(`     Taşınmalı: ${item.foundIn === 'nowshowing' ? 'comingsoon' : 'nowshowing'}/`);
	});
}

console.log('\n❌ Eksik Slider Görselleri:');
if (missingSliders.length === 0) {
	console.log('   Tüm slider görselleri mevcut! 🎉');
} else {
	missingSliders.forEach(item => {
		console.log(`   ✗ ${item.movie}`);
		console.log(`     Beklenen: ${item.path}`);
		console.log(`     Dosya adı: ${item.filename}-slider.png`);
	});
}

console.log('\n' + '='.repeat(60));
console.log(`\nÖzet:`);
console.log(`   Posterler: ${foundPosters.length + foundInOtherFolder.filter(f => f.type === 'poster').length}/${movies.length} bulundu`);
console.log(`   Sliderlar: ${foundSliders.length + foundInOtherFolder.filter(f => f.type === 'slider').length}/${movies.length} bulundu`);
if (wrongFolder.length > 0) {
	console.log(`   Yanlış klasör: ${wrongFolder.length} film`);
}

const totalFound = foundPosters.length + foundSliders.length + foundInOtherFolder.length;
const totalExpected = movies.length * 2; // poster + slider

if (missingPosters.length === 0 && missingSliders.length === 0) {
	console.log('\n🎉 Tüm görseller mevcut!');
	if (foundInOtherFolder.length > 0) {
		console.log('   ⚠️  Ancak bazı görseller yanlış klasörde. Lütfen taşıyın.');
	} else {
		console.log('   ✅ Tüm görseller doğru klasörlerde!');
	}
	process.exit(foundInOtherFolder.length > 0 ? 1 : 0);
} else {
	console.log('\n⚠️  Bazı görseller eksik veya yanlış klasörde. Lütfen kontrol edin.');
	process.exit(1);
}
