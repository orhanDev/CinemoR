import React, { useState } from "react";
import Link from "next/link";
import styles from "./HallCard.module.scss";
import { getHallImage } from "@/helpers/utils/hall-image-mapper";
import Image from "next/image";

const HallCard = ({ hall }) => {
	const [imageError, setImageError] = useState(false);
	const imageSrc = !imageError
		? getHallImage(hall.name)
		: "/images/halls/default-hall.jpg";

	return (
		<div className={styles.hallCard}>
			<div className={styles.imageContainer}>
				<Image
					src={imageSrc}
					alt={hall.name}
					fill
					className={styles.hallImage}
					onError={() => setImageError(true)}
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
				<div className={styles.hallLogo}>
					<h3>{hall.name}</h3>
				</div>
			</div>
			<div className={styles.hallContent}>
				<p className={styles.hallDescription}>{hall.description}</p>
				<div className={styles.buttonContainer}>
					<Link href={`/halls/${hall.id}`} className={styles.primaryButton}>
						Details
					</Link>
				</div>
				<div className={styles.infoButtonsRow}>
					<div className={styles.infoLinksContainer}>
						<Link
							href={`/halls/${hall.id}/cinemas?name=${encodeURIComponent(
								hall.name
							)}&isSpecial=${hall.isSpecial}`}
							className={styles.infoButton}
						>
							<span className={styles.icon}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
									<circle cx="12" cy="10" r="3"></circle>
								</svg>
							</span>
							<span className={styles.buttonText}>
								In welchen Kinos gibt es diesen Saal?
							</span>
						</Link>
						<Link
							href={`/halls/${hall.id}/movies?name=${encodeURIComponent(
								hall.name
							)}&isSpecial=${hall.isSpecial}`}
							className={styles.infoButton}
						>
							<span className={styles.icon}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="12" cy="12" r="10"></circle>
									<polygon points="10 8 16 12 10 16 10 8"></polygon>
								</svg>
							</span>
							<span className={styles.buttonText}>
								Welche Filme laufen in diesem Saal?
							</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HallCard;
