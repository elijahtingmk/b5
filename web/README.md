# bigfive-web

https://bigfive-test.com

Website for five factor model of personality based on work from [IPIP-NEO-PI](https://github.com/kholia/IPIP-NEO-PI).

Tests and evaluation is gathered from [ipip.ori.org](http://ipip.ori.org).

See it live @ [bigfive-test.com](https://bigfive-test.com)

The frontend is written in [nodejs](https://nodejs.org) using the
[Next.js](https://nextjs.org/) framework.

## Installation

Install [nodejs](https://nodejs.org) (20 or newer) and [pnpm](https://pnpm.io).

```
pnpm install
```

Test results are stored in [Cloudflare D1](https://developers.cloudflare.com/d1/).
Locally, wrangler keeps a SQLite copy of the database in `.wrangler/`, so no
account or database server is needed for development.

## Development

Create the local database tables (once, and again after adding a migration):

```
pnpm run db:migrate:local
```

Run the development server:

```
pnpm dev
```

To show a "Skip to end" button on the test page, put
`NEXT_PUBLIC_ENV=development` in `.env.local`.

To try the production build in the real Workers runtime:

```
pnpm run preview
```

## Deployment

See the [main README](../README.md#hosting-on-cloudflare).

## Linting

Run the linter

```
pnpm lint && pnpm format:fix
```

## License

Licensed under the [MIT license](../LICENSE).
