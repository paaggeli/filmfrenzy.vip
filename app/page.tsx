"use client"
import { useState } from "react";

interface Movie {
  id: number;
  title: string;
  media_type: "movie",
  overview?: string;
  release_date?: string;
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
  const [textInput, setTextInput] = useState<string>('');
  const [results, setResults] = useState<ApiResponse | null>(null);
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
    const text = textInput.trim();
    if (text.length > 0) {
      const searchUrl = `https://api.themoviedb.org/3/search/multi?query=${text}&include_adult=false&language=en-US&page=1&api_key=${process.env.TMDB_KEY}`;
      fetchResults(searchUrl).then(data => {
        if (data) {
          if (data.total_results === 0) {
            setNoResultsMessage("Sorry, we couldn't find anything relevant to your search. 😞 \nWe hope you find the following suggestion interesting.");
    
            const trendingUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_KEY}`;
            
            fetchResults(trendingUrl).then(trendingData => {
              if (trendingData) {
                setResults(trendingData);
              }
            });
          } else {
            setResults(data);
          }
        }
      });
    }
  };
  // Get random a movie
  const suggestedMovie = (results: ApiResponse) => {
    const items = results.results;
    const numberOfItems = items.length;
    const randomItem = Math.floor(Math.random()*numberOfItems);
    const item = items[randomItem];
    if ( item.media_type == 'movie' ) return item;

    const actorMovies = item.known_for;
    if (actorMovies) {
      const actorNumberOfMovies = actorMovies.length;
      const randomActorMovie = Math.floor(Math.random() * actorNumberOfMovies);
      return actorMovies[randomActorMovie];
    }
    return null;
  }

  const movie = results && suggestedMovie(results);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-7xl">FilmFrenzy.vip</h1>
      <form onSubmit={handleSubmit} className="flex">
        <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="What do you want to watch?" className="input input-bordered w-full max-w-xs mr-4" />
        <button type="submit" className="btn">Lets find a movie</button>
      </form>
      <div>
        {movie ? (
          <div>
            <h2 className="text-3xl">{movie.title}</h2>
            <p>{movie.overview}</p>
            <p className="font-bold">Release Date: {movie.release_date}</p>
          </div>
        ): (<div>{noResultsMessage}</div>)}
      </div>
    </main>
  );
}