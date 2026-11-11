# Vercel Deployment

1. Import this project into Vercel and add an Upstash Redis database through the Vercel Marketplace.
2. Connect the database to the Vercel project. The project needs the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables in each deployment environment.
3. Deploy the project. Vercel serves `Site.html` at `/` and deploys `api/support.js` as `/api/support`.

The support count is initialized to 1 in Redis and persists across deployments. `GET /api/support` returns the shared count; `POST /api/support` adds support. The page remembers a successful support in the visitor's browser so the button is not available again there. This is a lightweight public counter, not a verified or abuse-proof voting system.