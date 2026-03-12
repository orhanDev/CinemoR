"use client";
import React from "react";
import MovieCard from "./MovieCard";
import { Col, Container, Row } from "react-bootstrap";
import movies from "@/helpers/data/movies.json";

const MovieList = ({ title, movies }) => {
	return (
		<Container>
			<h2 className="text-center mt-5 mb-5 fs-1">{title}</h2>
			<Row xs={1} md={2} lg={3} xl={4} className="g-4">
				{movies.map((item) => (
					<Col key={item.id}>
						<MovieCard
							id={item.id}
							title={item.title}
							image={item.posterUrl || item.image}
							status={item.status}
						/>
					</Col>
				))}
			</Row>
		</Container>
	);
};

export default MovieList;
