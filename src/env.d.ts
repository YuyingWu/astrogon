/// <reference path="../.astro/types.d.ts" />

declare module 'photoswipe-dynamic-caption-plugin';

interface ImportMetaEnv {
  readonly GITHUB_CLIENT_ID?: string;
  readonly GITHUB_CLIENT_SECRET?: string;
  readonly DECAP_OAUTH_SECRET?: string;
  readonly ADMIN_UPLOAD_TOKEN?: string;
  readonly ALIYUN_ACCESS_KEY_ID?: string;
  readonly ALIYUN_ACCESS_KEY_SECRET?: string;
  readonly ALIYUN_STS_ROLE_ARN?: string;
  readonly ALIYUN_STS_DURATION_SECONDS?: string;
  readonly ALIYUN_OSS_BUCKET?: string;
  readonly ALIYUN_OSS_ENDPOINT?: string;
  readonly ALIYUN_OSS_PUBLIC_BASE_URL?: string;
  readonly ALIYUN_OSS_PREFIX?: string;
  readonly ALIYUN_OSS_MAX_FILE_SIZE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
