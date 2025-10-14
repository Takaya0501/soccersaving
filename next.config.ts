import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // `sqlite3`のようなネイティブモジュールがビルド時に正しく扱われるようにする設定
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'sqlite3': 'commonjs sqlite3',
      });
    }
    return config;
  },
};

export default nextConfig;