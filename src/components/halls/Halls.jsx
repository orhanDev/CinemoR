import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllSpecialHalls } from "@/services/halls-service";
import HallCard from "./HallCard";
import styles from "./HallCard.module.scss";

const Halls = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [specialHalls, setSpecialHalls] = useState([]);

	useEffect(() => {
		const fetchSpecialHalls = async () => {
			try {
				setLoading(true);
				const response = await getAllSpecialHalls();

				if (!response.ok) {
					throw new Error("Spezialsäle konnten nicht geladen werden");
				}
				const data = await response.json();
				if (data?.object) {
					setSpecialHalls(data.object);
				} else {
					throw new Error("Unerwartetes API-Antwortformat für Spezialsäle");
				}
			} catch (error) {
				setError(error?.message ?? "Fehler beim Laden");
			} finally {
				setLoading(false);
			}
		};
		fetchSpecialHalls();
	}, []);

	return (
		<section className={styles.specialHalls}>
			<div className={styles.container}>
				<h2 className={styles.sectionTitle}>Exklusive Säle</h2>

				<div className={styles.hallGrid}>
					{specialHalls.map((hall) => (
						<HallCard key={hall.id} hall={hall} />
					))}
				</div>
			</div>
		</section>
	);
};

export default Halls;
