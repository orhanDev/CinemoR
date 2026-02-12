import { appConfig } from "./config";
import { logError } from "./logger";

const defaultMenuItems = [
	{ 
		id: "extra-grosses-menu",
		name: "Extra Großes Menu", 
		image: "/images/menu/extra_großes_menu.png",
		price: 18.50,
		description: "Extra großes Menü mit Getränk"
	},
	{ 
		id: "extra-menu",
		name: "Extra Menu", 
		image: "/images/menu/extra_menu.png",
		price: 15.90,
		description: "Extra Menü mit Getränk"
	},
	{ 
		id: "grosses-menu",
		name: "Großes Menu", 
		image: "/images/menu/goßes_menu.png",
		price: 14.50,
		description: "Großes Menü mit Getränk"
	},
	{ 
		id: "kinder-menu",
		name: "Kinder Menu", 
		image: "/images/menu/kinder_menu.png",
		price: 9.90,
		description: "Kinderfreundliches Menü"
	},
	{ 
		id: "rio-santo-menu",
		name: "Rio Santo Menu", 
		image: "/images/menu/rio_santo_menu.png",
		price: 16.90,
		description: "Rio Santo Spezial Menü"
	}
];

export const fetchMenuItems = async () => {
	try {
		const response = await fetch(`${appConfig.apiURLWithoutApi}/api/menu/items`);
		if (response.ok) {
			const items = await response.json();
			return items.length > 0 ? items : defaultMenuItems;
		}
		if (response.status === 404) {
			return defaultMenuItems;
		}
	} catch (err) {
		logError("menu-items", err);
	}
	return defaultMenuItems;
};

export const menuItems = defaultMenuItems;
