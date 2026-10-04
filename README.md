# bigfive-web

Website for five factor model of personality based on work from [IPIP-NEO-PI](https://github.com/kholia/IPIP-NEO-PI).

Tests and evaluation is gathered from [ipip.ori.org](http://ipip.ori.org).

This copy is run by [Elijah Ting, ED – L&D](https://drelijah.org). It runs on
**Cloudflare Workers**, with every submitted test result stored in a
**Cloudflare D1** database so results can be opened again later by their ID.
Visitors can optionally leave their details on the results page to hear about
coaching. The original project runs at [bigfive-test.com](https://bigfive-test.com).

## Hosting on Cloudflare

The app lives in [`web/`](web). It is a Next.js app built for Workers with
[OpenNext](https://opennext.js.org/cloudflare).

### Option A: deploy from GitHub (Workers Builds)

In the Cloudflare dashboard, open **Workers & Pages → b5 → Settings → Build**
(or create a Worker by importing this repository) and set:

| Setting        | Value              |
| -------------- | ------------------ |
| Root directory | `web`              |
| Build command  | _(leave empty)_    |
| Deploy command | `pnpm run deploy`  |

Every push to the production branch then builds the site, deploys it and
applies any new database migrations. The Worker name must stay `b5` to match
[`web/wrangler.jsonc`](web/wrangler.jsonc).

### Option B: deploy from your computer

```
cd web
pnpm install
npx wrangler login
pnpm run deploy
```

### The database

You do not need to create the database by hand. On the first deploy, wrangler
creates a D1 database named `b5-results` and binds it to the Worker; later
deploys find it by name. `pnpm run deploy` then applies the SQL files in
[`web/migrations`](web/migrations) to create the tables.

If the migration step fails with a permissions error (the token Workers Builds
uses may not be allowed to edit D1), run it once from your computer:

```
cd web
npx wrangler login
pnpm run db:migrate:remote
```

Results are kept until you delete them. To look at them, use the D1 console
in the dashboard (**Storage & Databases → D1 → b5-results**).

Tables:

- `results`: one row per completed test, answers stored as JSON. No name or
  contact details.
- `leads`: people who chose to leave their details on the results page. Each
  row stores the exact consent wording they agreed to and the notice version.
  `result_id` is only filled in when they also agreed to let you view their
  result.
- `feedback`: the form on the About page.
- `views`: article view counts.

### Exporting to Excel

From the `web` folder, after `npx wrangler login`:

```
pnpm run export:results   # results.csv: one row per test with the five trait scores (24-120)
pnpm run export:leads     # leads.csv: name, email, role, consent wording, linked result
```

The CSV files contain personal data. They are git-ignored; keep them off shared
drives and delete them when you are done.

### Handling privacy requests

The privacy notice (`/privacy`) promises that people can ask for their details
to be deleted by emailing elijah@drelijah.org. To do that, run in the D1
console:

```sql
DELETE FROM leads WHERE email = 'person@example.com';
DELETE FROM results WHERE id = '<their result id>';
```

The notice also says contact details are kept for up to two years after the
last contact. If you change the wording on the results page or the privacy
page, update `NOTICE_VERSION` in `web/src/config/consent.ts`.

### Optional settings

- `NEXT_PUBLIC_SITE_URL`: your site's public URL (for example
  `https://b5.example.workers.dev`), used in page metadata and the sitemap. Set
  it as a **build** variable. Share and copy-link buttons always use the
  address the visitor is on, so they work without it.
- `NEXT_PUBLIC_ANALYTICS_ID`: a Google Analytics ID, if you want one. The
  privacy notice currently says the site uses no analytics cookies, so update
  it before turning this on.

## Help wanted

If you want to help by translating the items to other languages look [here](https://b5.translations.alheimsins.net/).

## License

[MIT](LICENSE)
