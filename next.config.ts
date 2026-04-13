import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (webpackConfig) => {
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '@payload-config': path.resolve(process.cwd(), 'payload.config.ts'),
    };
    return webpackConfig;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
