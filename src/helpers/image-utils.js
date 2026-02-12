import { appConfig } from "./config";


export const getPosterUrl = (posterPath) => {
	if (!posterPath) return null;

	if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
		return posterPath;
	}

	if (posterPath.startsWith("/images/")) return posterPath;

	const base = appConfig.apiURLWithoutApi || "";
	if (
		posterPath.startsWith("/uploads/") ||
		posterPath.startsWith("/upload/") ||
		posterPath.startsWith("/tickets/") ||
		posterPath.startsWith("/files/")
	) {
		return base ? `${base}${posterPath}` : posterPath;
	}
	if (
		posterPath.startsWith("uploads/") ||
		posterPath.startsWith("upload/") ||
		posterPath.startsWith("tickets/") ||
		posterPath.startsWith("files/")
	) {
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
