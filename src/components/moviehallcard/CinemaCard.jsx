"use client";
import { Card } from "react-bootstrap";
import styles from "./MovieHallCard.module.scss";
import React from "react";
import { AiOutlineHeart } from "react-icons/ai";
import { CiLocationArrow1 } from "react-icons/ci";

const CinemaCard = ({ name, address, specialFeatures }) => {
	return (
		<div className={styles.cardWrapper}>
			<Card className={styles.card}>
				<Card.Body>
					<Card.Title className={styles.cardTitle}>{name}</Card.Title>
					<Card.Text className={styles.cardText}>{address}</Card.Text>

					{specialFeatures && (
						<Card.Text className={styles.cardText}>
							<strong></strong>
							{specialFeatures.join(", ")}
						</Card.Text>
					)}
					<div className={styles.icons}>
						<AiOutlineHeart
							className={styles.heart}
							style={{ fontSize: "1.8rem" }}
						/>
						<CiLocationArrow1
							className={styles.arrow}
							style={{ fontSize: "1.8rem" }}
						/>
					</div>
				</Card.Body>
			</Card>
		</div>
	);
};

export default CinemaCard;
