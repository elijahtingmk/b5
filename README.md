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
- `type_results`: one row per completed 16-type test from types.drelijah.org.
  A 24-character result number, the four-letter type, and an optional short
  note. No name or contact details.
- `leads`: people who chose to leave their details on the results page. Each
  row stores the exact consent wording they agreed to and the notice version.
  `result_id` is only filled in when they also agreed to let you view their
  result.
- `feedback`: the form on the About page.
- `views`: article view counts.

### Scoping-call forms

The contact pages on drelijah.org and types.drelijah.org post to
`https://big5.drelijah.org/api/enquiry`. The endpoint only accepts posts from
`https://drelijah.org` (and `www.`) and `https://types.drelijah.org`. It saves
them in the `enquiries` table, sends the same Telegram alert and email as
before, and redirects back. drelijah.org returns to `/contact?sent=1#book`
(or `?error=…`). types.drelijah.org returns to `/contact.html?sent=1#book`,
which is that site's contact page.

Bot traps: a hidden field and a minimum fill time of three seconds. To add
Cloudflare Turnstile, create a widget for the site, set its secret as the
Worker secret `TURNSTILE_SECRET`, and put its site key in the form's
`data-turnstile-sitekey`. Requests appear on the admin page and via
`pnpm run export:enquiries`.

The types contact form may also send `share_type`, `type_code`,
`type_detail`, and `type_result_id`. Those are stored only when the post
comes from types.drelijah.org and `share_type` is `1` (the person opted in).
`type_code` must be a four-letter 16-type code such as ENTJ. `type_detail`
is optional text, kept to 500 characters. `type_result_id` is the result
number from a completed test (24 hex characters). If `share_type` is not
`1`, all of those fields are ignored, including on a drelijah.org post.
When a type or result number was stored, it is added to the existing
Telegram and email alerts. Where those alerts go is unchanged. Saving a
completed test does not send an alert.

Types leads are listed on the admin page. `source_page` for that site looks
like `types.drelijah.org/contact.html`.

### Anonymous 16-type results

When someone finishes a test on types.drelijah.org, that site posts JSON to
`https://big5.drelijah.org/api/types-result`. The endpoint accepts the post
only from `https://types.drelijah.org`.

```json
{ "type_code": "ENTJ", "type_detail": "Te clearly over Ti" }
```

`type_code` is required. `type_detail` is optional. Name, email, and any
other fields are ignored. A successful response is JSON:

```json
{ "id": "0123456789abcdef01234567" }
```

The `id` is the result number (24 lowercase hex characters). The row is
stored in `type_results`. No Telegram message and no email is sent.

The admin page lists those rows (Malaysia time, result number, type, and
detail when present) and shows how many saved tests there are of each
four-letter type. Search matches a result number or a type. Download them
from the page, or with `pnpm run export:type-results`.

### Career interest checklist (RIASEC)

`/riasec` is a 60-activity Holland Code checklist: the O*NET® Interest Profiler
Short Form, reproduced word for word from the paper version published by the
National Center for O*NET Development. Results are kept in the
`riasec_results` table and appear on the download page.

It is used under [CC BY-ND 4.0](https://www.onetcenter.org/license_tools.html),
which allows commercial use but **no modified versions**. Keep the activities,
instructions and descriptions in [`web/src/config/riasec.ts`](web/src/config/riasec.ts)
exactly as published, and keep the credit at the bottom of the checklist and
results pages. A translation (for example into Bahasa Malaysia) or any reworded
version would need the O*NET Tools Developer License instead, which requires
the modified tool to be validated and a statement that USDOL/ETA has not
approved it.

### Private download page

`https://big5.drelijah.org/admin` shows how many results, enquiries and
feedback messages there are, with a **Download CSV** button for each. The
same page lists types.drelijah.org contact leads (name, email, organisation,
topic, message, date, and the 16-type result when the person opted in) and
the anonymous result numbers from completed tests, with a count for each
type. Each list has its own CSV. Files open in Excel.

It is switched off until you set a password:

1. Choose a long password, at least 16 characters. A short phrase of four or
   five random words works well. Store it in your password manager.
2. In Cloudflare, open **Workers & Pages → b5 → Settings → Variables and
   Secrets → Add variable**, choose type **Secret**, name it
   `ADMIN_PASSWORD`, paste the password and click **Deploy**.
3. Open `/admin`. Your browser asks for a username and password: type anything
   as the username and your password as the password.

To sign out, close the browser window. To lock the page again, delete the
`ADMIN_PASSWORD` secret. Downloads contain personal data; delete them when you
are done. Text that visitors typed is neutralised so Excel cannot run it as a
formula.

### Exporting from the command line

From the `web` folder, after `npx wrangler login`:

```
pnpm run export:results   # results.csv: one row per test with the five trait scores (24-120)
pnpm run export:riasec    # riasec.csv: one row per career interest checklist, six scores (0-10)
pnpm run export:leads     # leads.csv: name, email, role, consent wording, linked result
pnpm run export:feedback  # feedback.csv
pnpm run export:enquiries # enquiries.csv: every contact form, including types
pnpm run export:types     # types.csv: types.drelijah.org leads only
pnpm run export:type-results # type_results.csv: anonymous result numbers, no name or email
```

The contact-form CSV files contain personal data. They are git-ignored; keep
them off shared drives and delete them when you are done. `type_results.csv`
has no name or email.

### Telegram alerts for new enquiries

When someone leaves their details on the results page or sends feedback, the
site can message you on Telegram. The enquiry is always saved first, so a
failed alert never loses it.

1. In Telegram, open **@BotFather**, send `/newbot`, and follow the prompts.
   It replies with a **token** like `123456789:AA...`. Treat it like a
   password.
2. Open a chat with your new bot and send it any message (bots can only message
   people who have messaged them first).
3. In a browser, open
   `https://api.telegram.org/bot<your token>/getUpdates` and find
   `"chat":{"id":123456789` in the reply. That number is your **chat ID**.
4. In the Cloudflare dashboard, open **Workers & Pages → b5 → Settings →
   Variables and Secrets**, click **Add**, choose type **Secret**, and add:
   - `TELEGRAM_BOT_TOKEN` = the token from step 1
   - `TELEGRAM_CHAT_ID` = the number from step 3
5. Leave a test enquiry on the live site. The alert should arrive within a few
   seconds. Delete the test row afterwards.

Secrets survive future deploys. Without them the site works as before and
simply sends no alerts. To test locally, put the same two lines in
`web/.dev.vars` (git-ignored).

### Handling privacy requests

The privacy notice (`/privacy`) promises that people can ask for their details
to be deleted by emailing elijah@drelijah.org. To do that, run in the D1
console:

```sql
DELETE FROM leads WHERE email = 'person@example.com';
DELETE FROM results WHERE id = '<their result id>';
DELETE FROM enquiries WHERE email = 'person@example.com';
DELETE FROM type_results WHERE id = '<their result number>';
```

A 16-type result number has no email on it. Delete that row by the id the
person was given, or by the `type_result_id` stored on their enquiry if they
opted in to share it.

The notice also says contact details are kept for up to two years after the
last contact. If you change the wording on the results page or the privacy
page, update `NOTICE_VERSION` in `web/src/config/consent.ts`.

### Branding

Colours and fonts follow drelijah.org (navy `#0c1424`, gold `#c4964a`,
Newsreader and Source Sans 3). They are set in `web/tailwind.config.js` and
`web/src/config/fonts.ts`; chart colours are in `web/src/config/chart-colors.ts`.
The articles under `web/posts` were written by Jonas Enge for the original
project and keep his byline.

### Optional settings

- **Custom domain.** The site expects to live at `https://big5.drelijah.org`
  (used in page metadata, the sitemap and link previews). Point it there with
  **Workers & Pages → b5 → Settings → Domains & Routes → Add → Custom domain**.
  To use a different address, set `NEXT_PUBLIC_SITE_URL` as a **build**
  variable. Share and copy-link buttons always use the address the visitor is
  on.
- `NEXT_PUBLIC_ANALYTICS_ID`: a Google Analytics ID, if you want one. The
  privacy notice currently says the site uses no analytics cookies, so update
  it before turning this on.

## Help wanted

If you want to help by translating the items to other languages look [here](https://b5.translations.alheimsins.net/).

## License

[MIT](LICENSE)
