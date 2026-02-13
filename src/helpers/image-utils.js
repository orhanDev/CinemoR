import { appConfig } from "./config";

const titleToFileName = (title) => {
	if (!title || typeof title !== "string") return null;
	return title
		.trim()
		.toLowerCase()
		.replace(/[äöü]/g, (m) => ({ ä: "ae", ö: "oe", ü: "ue" }[m] || m))
		.replace(/[^a-z0-9]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");
};

const mapApiPathToFrontend = (apiPath, movieTitle = null) => {
	if (!apiPath || typeof apiPath !== "string") return null;

	const path = apiPath.trim();
	if (!path) return null;

	const lastSlash = path.lastIndexOf("/");
	const fileName = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
	if (!fileName) return null;

	const extMatch = fileName.match(/\.(jpg|jpeg|png|webp)$/i);
	const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
	let baseName = fileName.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9_]/g, "_");

	if (movieTitle && (!baseName || baseName.length < 3)) {
		const titleBased = titleToFileName(movieTitle);
		if (titleBased) baseName = titleBased;
	}

	const pathLower = path.toLowerCase();
	let folderType = "movies";
	let subFolder = "";

	if (pathLower.includes("/tickets/") || pathLower.includes("tickets/")) {
		folderType = "tickets";
		if (pathLower.includes("nowshowing") || pathLower.includes("now_showing")) {
			subFolder = "nowshowing/";
		} else if (pathLower.includes("comingsoon") || pathLower.includes("coming_soon")) {
			subFolder = "comingsoon/";
		}
	} else if (pathLower.includes("/menu/") || pathLower.includes("menu/")) {
		folderType = "menu";
	} else if (pathLower.includes("/movies/") || pathLower.includes("movies/")) {
		folderType = "movies";
		if (pathLower.includes("nowshowing") || pathLower.includes("now_showing")) {
			subFolder = "nowshowing/";
		} else if (pathLower.includes("comingsoon") || pathLower.includes("coming_soon")) {
			subFolder = "comingsoon/";
		}
	}

	const candidates = [
		`/images/${folderType}/${subFolder}${baseName}.${ext}`,
		`/images/${folderType}/${subFolder}${baseName}.jpg`,
		`/images/${folderType}/${baseName}.${ext}`,
		`/images/${folderType}/${baseName}.jpg`,
	];

	if (folderType === "movies") {
		candidates.push(
			`/images/movies/nowshowing/${baseName}.${ext}`,
			`/images/movies/nowshowing/${baseName}.jpg`,
			`/images/movies/comingsoon/${baseName}.${ext}`,
			`/images/movies/comingsoon/${baseName}.jpg`
		);
	}

	return candidates[0];
};

export const getPosterUrl = (posterPath, movieTitle = null) => {
	if (!posterPath) return "/images/movies/placeholder.png";

	if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
		return posterPath;
	}

	if (posterPath.startsWith("/images/")) return posterPath;

	const isApiPath =
		posterPath.startsWith("/uploads/") ||
		posterPath.startsWith("/upload/") ||
		posterPath.startsWith("/tickets/") ||
		posterPath.startsWith("/files/") ||
		posterPath.startsWith("uploads/") ||
		posterPath.startsWith("upload/") ||
		posterPath.startsWith("tickets/") ||
		posterPath.startsWith("files/");

	if (isApiPath) {
		const frontendPath = mapApiPathToFrontend(posterPath, movieTitle);
		return frontendPath || "/images/movies/placeholder.png";
	}

	if (posterPath.startsWith("/")) return posterPath;
	return `/${posterPath}`;
};


export const getSliderImageUrl = (posterPath) => {
	if (!posterPath) return null;
	const path = typeof posterPath === "string" ? posterPath.trim() : "";
	if (!path) return null;
	if (/-slider\.(png|jpg|jpeg|webp)$/i.test(path)) {
		return getPosterUrl(path);
	}
	const lastSlash = path.lastIndexOf("/");
	const dir = lastSlash >= 0 ? path.slice(0, lastSlash + 1) : "";
	const file = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
	const baseName = file.replace(/\.[^.]+$/, "");
	const sliderPath = `${dir}${baseName}-slider.png`;
	return getPosterUrl(sliderPath);
};



const ACTORS_BASE = "/images/actors";


export const getActorSlug = (actorName) => {
	if (!actorName || typeof actorName !== "string") return "";
	return actorName
		.trim()
		.replace(/\s+/g, "_")
		.replace(/[<>:"/\\|?*]/g, "");
};


export const getActorImageUrl = (actorName, extension = "jpg") => {
	const slug = getActorSlug(actorName);
	if (!slug) return "";
	return `${ACTORS_BASE}/${slug}.${extension}`;
};
