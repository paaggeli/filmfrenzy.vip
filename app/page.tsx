"use client"
import { useRef, useState } from "react";

interface Movie {
  id: number;
  title?: string;
  name?: string;
  media_type: "movie" | "tv",
  overview?: string;
  poster_path?: string;
  video?: string | boolean;
  release_date?: string;
  first_air_date?: string;
}

interface Person {
  id: number;
  name: string;
  media_type: "person",
  known_for?: Movie[];
}

type ApiResult = Movie | Person;

interface ApiResponse {
  page: number;
  results: ApiResult[];
  total_pages: number;
  total_results: number;
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [noResultsMessage, setNoResultsMessage] = useState<string>('');


  const fetchResults = (url: string) => {
    return fetch(url)
    .then(response => response.json())
    .catch(error => {
      console.error(error);
      return null;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = inputRef.current?.value.trim();
    if (text && text.length > 0) {
      const searchUrl = `https://api.themoviedb.org/3/search/multi?query=${text}&include_adult=false&language=en-US&api_key=${process.env.TMDB_KEY}`;
      fetchResults(searchUrl).then(data => {
        if (data) {
          if (data.total_results === 0) {
            setNoResultsMessage("Sorry, we couldn't find anything relevant to your search. 😞 \nWe hope you find the following suggestion interesting.");
            const trendingUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_KEY}`;
            fetchResults(trendingUrl).then(trendingData => {
              if (trendingData) {
                suggestedMovie(trendingData);
              }
            });
          } else {
            suggestedMovie(data);
          }
        }
      });
    }
  };

  const isPerson = (item: ApiResult): item is Person => {
    return item.media_type === 'person';
  }

  // Get random a movie
  const suggestedMovie = (results: ApiResponse) => {
    const items = results.results;
    const numberOfItems = items.length;
    const randomItem = Math.floor(Math.random()*numberOfItems);
    const item = items[randomItem];
    let movieId;
    let mediaType;
    let movieItem;
    
    if (isPerson(item)) {
      const actorMovies = item.known_for;
      if (actorMovies && actorMovies.length > 0) {
        const actorNumberOfMovies = actorMovies.length;
        const randomActorMovie = Math.floor(Math.random() * actorNumberOfMovies);
        movieId = actorMovies[randomActorMovie].id;
        mediaType = actorMovies[randomActorMovie].media_type;
        movieItem = actorMovies[randomActorMovie]
      } else {
        setNoResultsMessage("Sorry, we couldn't find a suitable movie. Please try again.");
        return;
      }
    } else {
      movieItem = item;
      movieId = item.id;
      mediaType = item.media_type;
    }

    if (!movieItem) {
      setNoResultsMessage("Sorry, we couldn't find a suitable movie. Please try again.");
      return;
    }

    if ( (!movieItem.title && !movieItem.name) || !movieItem.overview || !movieItem.poster_path) {
      const movieDetailsUrl =  `https://api.themoviedb.org/3/${mediaType}/${movieId}?api_key=${process.env.TMDB_KEY}`;
      fetchResults(movieDetailsUrl).then(movieDetails => {
        if (movieDetails) {
          setMovie(movieDetails);
        }
      });
    } else {
      setMovie(movieItem);
    }

    if (movieItem.hasOwnProperty('video')) {
      const movieTrailersUrl =  `https://api.themoviedb.org/3/${mediaType}/${movieId}/videos?api_key=${process.env.TMDB_KEY}`;
      fetchResults(movieTrailersUrl).then(movieTrailers => {
        if (movieTrailers.results.length === 0) {
          setTrailer(null);
        } else {
          const trailerObj = movieTrailers.results[0];
          if (trailerObj.site == "YouTube") {
            setTrailer("https://www.youtube.com/embed/"+trailerObj.key);
          } else {
            setTrailer("https://player.vimeo.com/video/"+trailerObj.key);
          }
        }
      });
    } else {
      setTrailer(null);
    }
  }

  const closeModal = () => {
    (document.getElementById('show_trailer') as HTMLDialogElement)?.close();
    const iframe = document.querySelector('#show_trailer iframe') as HTMLIFrameElement;
    if (iframe) {
      const iframeSrc = iframe.src;
      iframe.src = iframeSrc;
    }
  }

  return (
    <main className="flex flex-col items-center justify-between p-24 min-h-screen bg-gradient-to-br from-slate-900 to-transparent">
      <h1 className="text-7xl text-center font-serif">🎞️ FilmFrenzy.vip 🎞️</h1>
      <p className="text-center text-xl max-w-2xl mt-4">
        Write a movie title, actor’s name, genre, or anything you want, <br />
        and I will suggest a movie or series for you to watch.
      </p>
      <form onSubmit={handleSubmit} className="flex mt-6">
        <input
          type="text"
          ref={inputRef}
          placeholder="What do you want to watch?"
          className="input input-bordered w-full max-w-xs mr-4"
        />
        <button type="submit" className="btn">Let's find a movie</button>
      </form>
      <div className="mt-10 w-full max-w-4xl">
        {movie ? (
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : "https://via.placeholder.com/200x300"}
                alt={movie.title || movie.name || 'Movie Poster'}
                className="max-w-52 h-auto object-cover rounded"
              />
              {trailer && (
                <>
                <button className="btn w-52 mt-4" onClick={()=>(document.getElementById('show_trailer') as HTMLDialogElement)?.showModal()}>Watch Trailer</button>
                <dialog id="show_trailer" className="modal">
                  <div className="modal-box w-11/12 max-w-5xl">
                    <form method="dialog">
                      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>✕</button>
                    </form>
                    <h3 className="font-bold text-lg">{movie.title || movie.name || 'Trailer'}</h3>
                    <div>
                      <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                        <iframe 
                          src={trailer}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                          allow="autoplay; fullscreen; picture-in-picture" 
                          allowFullScreen>
                        </iframe>
                      </div>
                    </div>
                  </div>
                </dialog>
                </>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl">{movie.title || movie.name}</h2>
              <p className="mt-4">{movie.overview}</p>
              { movie.release_date && (<p className="font-bold mt-2">Release Date: {movie.release_date}</p>) }
            </div>
          </div>
        ) : (
          <div className="text-center mt-10 whitespace-pre-line">{noResultsMessage}</div>
        )}
      </div>
    </main>
  );
}