This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Coolify (Nixpacks)

This repo includes a `nixpacks.toml` file so Coolify can build and run the app consistently.

Build and run behavior:

- Install: `npm ci`
- Build: `npm run build`
- Start: `npm run start -- -H 0.0.0.0 -p ${PORT:-3000}`

In Coolify:

1. Create a new application from this repository.
2. Select **Nixpacks** as the build pack.
3. Keep the default `PORT` environment variable (or set one explicitly, e.g. `3000`).
4. Deploy.

## Deploy on Coolify (Dockerfile)

If Nixpacks fails on your server, deploy this repo with the included `Dockerfile`.

In Coolify:

1. Create or open your application.
2. Select **Dockerfile** as the build pack (instead of Nixpacks).
3. Keep `PORT=3000` (or set your preferred port).
4. Deploy.

This Docker build uses a multi-stage setup and runs Next.js in standalone mode.

## Local Infra (Postgres + Redis Only)

This repo includes `docker-compose.infra.yml` to run only Postgres and Redis locally.

From the repository root:

```bash
npm run infra:up
npm run infra:logs
npm run infra:down
```

Reset local database/cache volumes when needed:

```bash
npm run infra:reset
```

Default local API env values:

- `DATABASE_URL=postgresql://smatway:smatway@localhost:5432/smatway?schema=public`
- `REDIS_URL=redis://localhost:6379`

## Coolify Deployment Layout

To keep deployment flexible, host each service as an independent Coolify resource:

1. `web` app
2. `admin` app
3. `api` app
4. `postgres` service
5. `redis` service

Wire connections through Coolify environment variables per app (do not use `localhost` in production).
