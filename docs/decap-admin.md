# Decap Admin + OSS(STS) Setup

This project now supports a web admin page at `/admin/` for creating and editing markdown content.

## 1) Update Decap config

Edit `public/admin/config.yml`:

- `backend.repo`: set to your GitHub repository (`owner/repo`)
- `backend.branch`: set the branch used by your Cloudflare deployment
- `backend.base_url`: set to your site origin
- `site_url` and `display_url`: set to your site origin
- `media_library.config.upload_token`: optional. If you set `ADMIN_UPLOAD_TOKEN`, put the same token here.

## 2) Create GitHub OAuth App

In GitHub Developer Settings, create an OAuth App:

- Homepage URL: `https://your-site-domain`
- Authorization callback URL: `https://your-site-domain/api/decap/callback`

Then set these secrets in Cloudflare:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `DECAP_OAUTH_SECRET` (random long string used to sign state)

## 3) Configure Alibaba Cloud STS + OSS

Set these secrets in Cloudflare:

- `ALIYUN_ACCESS_KEY_ID`
- `ALIYUN_ACCESS_KEY_SECRET`
- `ALIYUN_STS_ROLE_ARN`
- `ALIYUN_OSS_BUCKET` (example: `wyy-static`)
- `ALIYUN_OSS_ENDPOINT` (example: `oss-cn-guangzhou.aliyuncs.com`)

Optional:

- `ALIYUN_OSS_PUBLIC_BASE_URL` (defaults to `https://<bucket>.<endpoint>`)
- `ALIYUN_OSS_PREFIX` (defaults to `xx`)
- `ALIYUN_OSS_MAX_FILE_SIZE` (defaults to `10485760`, i.e. 10MB)
- `ALIYUN_STS_DURATION_SECONDS` (900-3600, defaults to 1800)
- `ADMIN_UPLOAD_TOKEN` (extra upload API protection)

## 4) RAM least privilege recommendations

Use a dedicated RAM Role for upload and restrict it to prefix-only writes:

- Action: `oss:PutObject`
- Resource: `acs:oss:*:*:<bucket>/<prefix>/*`

The API endpoint already requests temporary credentials and only signs image uploads.

## 5) Usage flow

1. Open `https://your-site-domain/admin/`
2. Login with GitHub
3. Create/edit content in `blog`, `docs`, `gallery`, `recipes`
4. Upload image from editor (auto uploads to OSS and inserts URL)
5. Save/Publish (commits to GitHub branch)
6. Cloudflare deploys automatically
