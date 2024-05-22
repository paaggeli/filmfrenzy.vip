"use client"
import { useState } from "react";

interface MovieResult {
  title?: string;
  overview?: string;
  release_date?: string;
}

export default function Home() {
  const [textInput, setTextInput] = useState<string>('');
  const [results, setResults] = useState<MovieResult[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = textInput.trim();
    if (text.length > 0) {
      fetch("https://api.themoviedb.org/3/search/multi?query="+text+"&include_adult=false&language=en-US&page=1&api_key="+process.env.TMDB_KEY)
      .then(response => response.json())
      .then(data => setResults(data.results))
      .catch(error => console.error(error));
    }
  };

  const firstResultWithTitle = results.find(result => result.title);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-7xl">FilmFrenzy.vip</h1>
      <form onSubmit={handleSubmit} className="flex">
        <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="What you want to watch?" className="input input-bordered w-full max-w-xs" />
        <button type="submit" className="btn">Lets find a movie</button>
      </form>
      <div>
        {firstResultWithTitle ? (
          <div>
            <h2 className="text-3xl">{firstResultWithTitle.title}</h2>
            <p>{firstResultWithTitle.overview}</p>
            <p className="font-bold">Release Date: {firstResultWithTitle.release_date}</p>
          </div>
        ) : (
          <div>No results with a title found.</div>
        )}
      </div>
    </main>
  );
}