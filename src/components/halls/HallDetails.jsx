"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getHallById } from "@/services/halls-service";
import { getHallImage } from "@/helpers/utils/hall-image-mapper";
import styles from "./HallDetails.module.scss";
import { hallDescriptions } from "@/helpers/utils/hall-descriptions";

const HallDetails = ({ hallId }) => {
	const [hall, setHall] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [imageError, setImageError] = useState(false);
	const hallInfoData = hallDescriptions[hall?.name] || {
		description: "Information not available",
		summary: "No summary available",
	};

	useEffect(() => {
		const fetchHall = async () => {
			try {
				setLoading(true);
				const response = await getHallById(hallId);
				if (!response.ok) {
					throw new Error("Saal-Daten konnten nicht geladen werden");
				}
				const data = await response.json();
				if (data?.object) {
					setHall(data.object);
				} else {
					throw new Error("Unexpected API response format for Hall");
				}
			} catch (error) {
				setError(error?.message ?? "Fehler beim Laden");
			} finally {
				setLoading(false);
			}
		};

		if (hallId) {
			fetchHall();
		}
	}, [hallId]);

	if (loading) {
		return <div className={styles.loading}>Wird geladen...</div>;
	}

	if (error || !hall) {
		return (
			<div className={styles.error}>Error: {error || "Hall not found"}</div>
		);
	}

	const imageSrc = !imageError
		? getHallImage(hall.name)
		: "/images/halls/default-hall.jpg";

	return (
		<div className={styles.hallDetail}>
			<div className={styles.hallHero}>
				<div className={styles.container}>
					<h1 className={styles.heroTitle}>{hall.name}</h1>
					<p className={styles.heroSubtitle}>{hallInfoData.summary}</p>
				</div>
			</div>

			<div className={styles.hallInfo}>
				<div className={styles.container}>
					<div className={styles.hallImage}>
						<Image
							src={imageSrc}
							alt={hall.name}
							width={800}
							height={600}
							onError={() => setImageError(true)}
						/>
					</div>
					<div className={styles.hallDetails}>
						<p>{hallInfoData.description}</p>
						{hall.description && <p>{hall.description}</p>}
						{hall.isSpecial && (
							<div className={styles.specialBadge}>Spezialsaal</div>
						)}
						{hall.seatCapacity && (
							<p className={styles.capacity}>
								<strong>Sitzplatzkapazität:</strong> {hall.seatCapacity}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default HallDetails;
