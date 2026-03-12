"use client";

import Link from "next/link";
import React from "react";
import styles from "./MovieCard.module.scss";
import Image from "next/image";
import { Button } from "react-bootstrap";
import { useState } from "react";

const MovieCard = (props) => {
	const { title, image, id, status } = props;
	const [imgError, setImgError] = useState(false);

	const isComingSoon = status === "COMING_SOON";

	let imageUrl = imgError
		? "/placeholder-movie.jpg"
		: typeof image === "string" && image.trim() !== ""
		? image
		: "/placeholder-movie.jpg";

	if (imageUrl.startsWith("/uploads/")) {
		imageUrl = `${process.env.NEXT_PUBLIC_API_URL_WITHOUT_API}${imageUrl}`;
	}

	return (
		<div className={styles.card}>
			<div className={styles.cardContainer}>
				<div style={{ position: "relative", width: "100%", height: "100%" }}>
					<Image
						src={imageUrl}
						alt={title || "Filmplakat"}
						className={styles.cardImage}
						style={{ objectFit: "cover" }}
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
						fill
						onError={() => setImgError(true)}
						unoptimized={imageUrl.startsWith("http")}
					/>
				</div>
				<div className={styles.cardButtons}>
					{isComingSoon ? (
						<Link
							href={`/step-session?mode=reservation&movieId=${id}`}
							passHref
						>
							<Button
								size="md"
								className={`${styles.button} ${styles.reservationButton}`}
							>
								Reservierung
							</Button>
						</Link>
					) : (
						<Link href={`/step-session?mode=buy&movieId=${id}`} passHref>
							<Button size="md" className={`${styles.button} ${styles.ticketButton}`}>
								Jetzt Ticket kaufen
							</Button>
						</Link>
					)}

					<Link href={`/movies/ticket/${id}`} passHref>
						<Button size="md" className={styles.button}>
							Details
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default MovieCard;
