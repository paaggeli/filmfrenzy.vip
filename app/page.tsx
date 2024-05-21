export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-7xl">FilmFrenzy.vip</h1>
      <div className="flex">
        <input type="text" placeholder="What you want to watch?" className="input input-bordered w-full max-w-xs" />
        <button className="btn">Lets find a movie</button>
      </div>
      <div></div>
    </main>
  );
}
