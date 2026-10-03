import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// The site has no ISR, so prerendered pages can be served straight from the
// static assets; no R2 bucket is needed.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true
});
