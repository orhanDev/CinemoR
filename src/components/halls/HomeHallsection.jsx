import React from "react";
import { Link } from "react-router-dom";
import styles from "./HomeHallSection.module.scss";

export const HomeHallSection = () => {
	const specialHalls = [
		{
			id: 1,
			name: "IMAX",
			imageUrl: "/images/halls/imax.jpg",
			slug: "imax",
		},
		{
			id: 2,
			name: "GOLD CLASS",
			imageUrl: "/images/halls/gold-class.jpg",
			slug: "gold-class",
		},
		{
			id: 3,
			name: "4DX",
			imageUrl: "/images/halls/4dx.jpg",
			slug: "4dx",
		},
		{
			id: 4,
			name: "SCREENX",
			imageUrl: "/images/halls/screenx.jpg",
			slug: "screenx",
		},
		{
			id: 5,
			name: "STARIUM",
			imageUrl: "/images/halls/starium.jpg",
			slug: "starium",
		},
		{
			id: 6,
			name: "TEMPUR CINEMA",
			imageUrl: "/images/halls/tempur.jpg",
			slug: "tempur-cinema",
		},
		{
			id: 7,
			name: "D-BOX",
			imageUrl: "/images/halls/dbox.jpg",
			slug: "d-box",
		},
		{
			id: 8,
			name: "SKYBOX",
			imageUrl: "/images/halls/skybox.jpg",
			slug: "skybox",
		},
		{
			id: 9,
			name: "SKY AUDITORIUM",
			imageUrl: "/images/halls/sky-auditorium.jpg",
			slug: "sky-auditorium",
		},
		{
			id: 10,
			name: "PREMIUM CINEMA",
			imageUrl: "/images/halls/premium.jpg",
			slug: "premium-cinema",
		},
		{
			id: 11,
			name: "MPX",
			imageUrl: "/images/halls/mpx.jpg",
			slug: "mpx",
		},
	];

	const displayedHalls = specialHalls.slice(0, 11);

	return (
		<section className={styles.homeHallSection}>
			<div className={styles.container}>
				<div className={styles.sectionHeader}>
					<h2 className={styles.sectionTitle}>Premium Säle</h2>
					<Link to="/halls" className={styles.viewAllLink}>
						Alle anzeigen
					</Link>
				</div>

				<div className={styles.hallsGrid}>
					{displayedHalls.map((hall) => (
						<Link
							to={`/halls/${hall.slug}`}
							key={hall.id}
							className={styles.hallItem}
						>
							<div className={styles.hallLogoWrapper}>
								<div className={styles.hallLogo}>
									<span>{hall.name}</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
};

export default HomeHallSection;
