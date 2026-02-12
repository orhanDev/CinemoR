"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./Cinemas.module.scss";
import { Container, Row, Col, Form, Spinner, Alert } from "react-bootstrap";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";

import { getCinemasByFilters } from "../../services/cinema-service";
import CinemaCard from "./CinemaCard";

const CinemaList = () => {
	const [cinemas, setCinemas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [serverFilters, setServerFilters] = useState({
		cityId: null,
		specialHall: "",
	});

	const [searchTerm, setSearchTerm] = useState("");
	const [page, setPage] = useState(0);
	const [size] = useState(20);

	const fetchCinemas = async () => {
		try {
			setLoading(true);
			setError(null);

			const params = {
				page,
				size,
				sort: "name",
				type: "asc",
				...(serverFilters.cityId && { cityId: serverFilters.cityId }),
				...(serverFilters.specialHall && {
					specialHall: serverFilters.specialHall,
				}),
			};

			const response = await getCinemasByFilters(params);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.object && Array.isArray(data.object.content)) {
				setCinemas(data.object.content);
			} else if (data.httpStatus === "NO_CONTENT") {
				setCinemas([]);
				setError(false);
			} else {
				setError(true);
				throw new Error(
					"Invalid response format: expected paginated cinema data"
				);
			}
		} catch (err) {
			setError(err?.message || "Kinos konnten nicht geladen werden");
			setCinemas([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCinemas();
	}, []);

	useEffect(() => {
		fetchCinemas();
	}, [serverFilters.cityId, serverFilters.specialHall, page]);

	const filteredCinemas = useMemo(() => {
		if (!Array.isArray(cinemas)) {
			return [];
		}

		if (!searchTerm) return cinemas;

		return cinemas.filter(
			(cinema) =>
				cinema.name &&
				cinema.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [cinemas, searchTerm]);

	const handleServerFilterChange = (filterType, value) => {
		setServerFilters((prev) => ({
			...prev,
			[filterType]: value,
		}));
		setPage(0);
	};

	const handleSearchChange = (value) => {
		setSearchTerm(value);
	};

	const uniqueCities = useMemo(() => {
		if (!Array.isArray(cinemas)) return [];
		const cities = cinemas.map((cinema) => cinema.city);
		return [...new Set(cities)];
	}, [cinemas]);

	const specialHallTypes = [
		"IMAX",
		"GOLD CLASS",
		"4DX",
		"SCREENX",
		"STARIUM",
		"TEMPUR CINEMA",
		"D-BOX",
		"SKYBOX",
	];

	if (loading && cinemas.length === 0) {
		return (
			<Container
				className="d-flex justify-content-center align-items-center"
				style={{ minHeight: "50vh" }}
			>
				<Spinner animation="border" role="status">
					<span className="visually-hidden">Laden...</span>
				</Spinner>
			</Container>
		);
	}

	return (
		<>
			<div className={styles.imageContainer}>
				<Image
					src="/images/cinemas/sinemalar_hero_banner.jpg"
					alt="Kino-Hintergrund"
					width={1700}
					height={440}
					layout="responsive"
					priority
				/>
				<h1 className={styles.title}>Kinos</h1>
			</div>

			<Container className="mt-5" fluid>
				{error && (
					<Alert variant="danger" className="mb-4">
						{error}
					</Alert>
				)}

				<Form className={styles.filters}>
					<Row className={styles.filtersRow}>
						<Col md={4}>
							<Form.Group controlId="citySelect">
								<Form.Select
									className={styles.customInput}
									value={serverFilters.cityId || ""}
									onChange={(e) =>
										handleServerFilterChange("cityId", e.target.value || null)
									}
									disabled={loading}
								>
									<option value="">Alle Städte</option>
									{uniqueCities.map((city) => (
										<option key={city} value={city}>
											{city}
										</option>
									))}
								</Form.Select>
							</Form.Group>
						</Col>

						<Col md={4}>
							<Form.Group controlId="hallSelect">
								<Form.Select
									className={styles.customInput}
									value={serverFilters.specialHall}
									onChange={(e) =>
										handleServerFilterChange("specialHall", e.target.value)
									}
									disabled={loading}
								>
									<option value="">Alle Saaltypen</option>
									{specialHallTypes.map((hallType) => (
										<option key={hallType} value={hallType}>
											{hallType}
										</option>
									))}
								</Form.Select>
							</Form.Group>
						</Col>

						<Col md={4}>
							<Form.Group controlId="search" className={styles.searchGroup}>
								<div className={styles.inputWrapper}>
									<Form.Control
										type="text"
										placeholder="Kino suchen"
										className={styles.customInput}
										value={searchTerm}
										onChange={(e) => handleSearchChange(e.target.value)}
										disabled={loading}
									/>
								</div>
								<FaSearch
									style={{ color: "whitesmoke" }}
									className={styles.search}
								/>
							</Form.Group>
						</Col>
					</Row>
				</Form>

				{loading && cinemas.length > 0 && (
					<div className="d-flex justify-content-center my-3">
						<Spinner animation="border" size="sm" />
					</div>
				)}

				<Row xs={1} md={2} xl={4} className={styles.rowHalls}>
					{filteredCinemas.map((cinema) => (
						<Col key={cinema.id}>
							<CinemaCard {...cinema} />
						</Col>
					))}
				</Row>

				{filteredCinemas.length === 0 && !loading && (
					<div className="text-center py-5">
						<p className="text-muted">
							Keine Kinos gefunden, die Ihren Kriterien entsprechen.
						</p>
					</div>
				)}
			</Container>
		</>
	);
};

export default CinemaList;
