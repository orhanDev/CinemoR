import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaClock, FaStar } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./slider.css";

import { getInTheatersMovies } from "../../../services/movie-service";
import { getMoviePosterUrl, getMovieSliderUrl } from "../../../helpers/local-image-utils";

export const Slider = () => {
	const [movies, setMovies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchMovieData();
	}, []);

	const fetchMovieData = async () => {
		try {
			setLoading(true);
			const list = await getInTheatersMovies();
			setMovies(Array.isArray(list) ? list : []);
		} catch (err) {
			setError(err?.message ?? "Fehler beim Laden");
			setMovies([]);
		} finally {
			setLoading(false);
		}
	};

	const demoMovies = [
		{
			id: 1,
			title: "Avatar: The Way of Water",
			summary: "Jake Sully und seine Familie müssen ihr Zuhause verlassen und die verschiedenen Regionen von Pandora erkunden.",
			posterUrl: "/images/slider/image1.jpg",
			duration: 192,
			imdbRating: 8.1,
			genres: ["Sci-Fi", "Abenteuer"]
		},
		{
			id: 2,
			title: "Dune: Teil Zwei",
			summary: "Paul Atreides schließt sich den Fremen an und beginnt eine spirituelle und kriegerische Reise.",
			posterUrl: "/images/slider/image2.jpg",
			duration: 166,
			imdbRating: 8.8,
			genres: ["Sci-Fi", "Drama"]
		},
		{
			id: 3,
			title: "Gladiator II",
			summary: "Die epische Fortsetzung des legendären Gladiator-Films.",
			posterUrl: "/images/slider/image3.jpg",
			duration: 148,
			imdbRating: 7.9,
			genres: ["Action", "Drama"]
		}
	];

	const displayMovies = movies.length > 0 ? movies : demoMovies;

	return (
		<div className="slider-wrapper">
			<Swiper
				modules={[Navigation, Pagination, Autoplay]}
				spaceBetween={0}
				slidesPerView={1}
				loop={true}
				autoplay={{ delay: 4000, disableOnInteraction: false }}
				navigation={{
					prevEl: '.slider-nav-prev',
					nextEl: '.slider-nav-next',
				}}
				pagination={{
					el: ".swiper-pagination",
					clickable: true,
				}}
				className="swiper-container"
			>
				{displayMovies.map((movie) => {
					const movieForImage = movie ? { title: movie.title, isComingSoon: movie.isComingSoon ?? false } : null;
					const imageUrl = movieForImage 
						? (getMovieSliderUrl(movieForImage) || getMoviePosterUrl(movieForImage) || '/images/movies/placeholder.png')
						: '/images/movies/placeholder.png';

					return (
						<SwiperSlide key={movie.id}>
							<div className="slide-content">
								<div
									className="hero-image"
									style={{ backgroundImage: `url(${imageUrl})` }}
								/>

								<div className="slide-inner">
									<h3>{movie.title || "Untitled Movie"}</h3>
									<p className="description">
										{movie.summary || "No description available"}
									</p>

									<div className="movie-meta">
										{movie.imdbRating && (
											<span className="rating">
												<FaStar /> {movie.imdbRating} IMDB
											</span>
										)}
										{movie.duration && (
											<span className="duration">
												<FaClock /> {movie.duration}min
											</span>
										)}
										{movie.genres && (
											<span className="genres">
												{movie.genres.join(", ")}
											</span>
										)}
									</div>

									<div className="buttons">
										<Link
											to={`/movies/ticket/${movie.id}`}
											className="btn btn-detail"
											state={{ movie }}
										>
											▶ Details ansehen
										</Link>
									</div>
								</div>
							</div>
						</SwiperSlide>
					);
				})}
				
				{}
				<button className="slider-nav slider-nav-prev">‹</button>
				<button className="slider-nav slider-nav-next">›</button>
				
				<div className="swiper-pagination"></div>
			</Swiper>
		</div>
	);
};

export default Slider;
