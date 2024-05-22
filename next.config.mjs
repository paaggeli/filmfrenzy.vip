/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        TMDB_KEY: process.env.TMDB_KEY,
    },
};

export default nextConfig;
