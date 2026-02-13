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

	const candidates = [
		`/images/movies/nowshowing/${baseName}.${ext}`,
		`/images/movies/nowshowing/${baseName}.jpg`,
		`/images/movies/comingsoon/${baseName}.${ext}`,
		`/images/movies/comingsoon/${baseName}.jpg`,
		`/images/movies/${baseName}.${ext}`,
		`/images/movies/${baseName}.jpg`,
	];

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
		if (frontendPath) {
			return frontendPath;
		}
	}

	const base = appConfig.apiURLWithoutApi || "";
	if (isApiPath) {
		if (posterPath.startsWith("/")) {
			return base ? `${base}${posterPath}` : posterPath;
		}
		return base ? `${base}/${posterPath}` : `/${posterPath}`;
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

export const getApiFallbackUrl = (posterPath) => {
	if (!posterPath) return null;
	const path = typeof posterPath === "string" ? posterPath.trim() : "";
	if (!path) return null;

	const base = appConfig.apiURLWithoutApi || "";
	if (
		path.startsWith("/uploads/") ||
		path.startsWith("/upload/") ||
		path.startsWith("/tickets/") ||
		path.startsWith("/files/")
	) {
		return base ? `${base}${path}` : path;
	}
	if (
		path.startsWith("uploads/") ||
		path.startsWith("upload/") ||
		path.startsWith("tickets/") ||
		path.startsWith("files/")
	) {
		return base ? `${base}/${path}` : `/${path}`;
	}
	return null;
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
