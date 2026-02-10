/** @type {import('next').NextConfig} */
const nextConfig = {
  // NEXT_PUBLIC_API_URL should be set as environment variable
  // Defaults for local development: http://localhost:8000 (FastAPI backend)
  // For Railway: Use the backend service URL (set in Railway environment)
  reactStrictMode: true,
  swcMinify: true,
  // Allow Railway to set PORT env var
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
