import type { NextConfig } from 'next';

// Set GITHUB_PAGES=true for project repositories (username.github.io/repo/).
// Leave it unset for local development and deployments at the domain root.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
const isProjectPages = process.env.GITHUB_PAGES === 'true' && repo !== '' && !repo.endsWith('.github.io');
const basePath = isProjectPages ? `/${repo}` : '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};
export default nextConfig;
