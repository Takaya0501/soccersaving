import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // サーバーサイドでのみsqlite3を外部モジュールとして扱う
    if (isServer) {
      config.externals = {
        ...config.externals,
        'sqlite3': 'commonjs sqlite3',
      };
    }
    return config;
  },
};

export default nextConfig;