# Sitemap and search setup

Production: https://www.thakardhruv.me/ (the domain documented in README.md).
The previous dhruvthakar.dev social and structured-data URLs were corrected.

## Routes and files

This is a React 19 / Vite 7 single-page application using React Router browser history.
The sitemap includes /, /about, /projects, /skills, /experience, and /contact.
Education, certifications, and beyond redirect to About sections; /home redirects to /.
There is no public Blog or Resume route. Resumes are PDF downloads, deliberately
excluded from this page sitemap rather than choosing an arbitrary resume variant.
Admin, development, error, and redirect URLs are excluded.

public/sitemap.xml and public/robots.txt are copied unchanged into dist/ by Vite.
Expected production endpoints:

- https://www.thakardhruv.me/sitemap.xml
- https://www.thakardhruv.me/robots.txt

No reliable page modification dates are available (content can change in Supabase),
so lastmod is omitted. There are no dependencies or invented pages.
When adding public routes, update the sitemap and src/constants/seo.js together.
The RouteSeo tests check that sitemap entries and metadata routes agree.

## SEO audit and remaining checks

- Each public route has its own title, description, and absolute canonical URL.
  Query strings and hashes are excluded from canonicals. Social URLs and Person
  structured data now use production URLs, including absolute image URLs.
- Public pages allow indexing. Admin and unknown pages get client-side noindex;
  Vercel also sends X-Robots-Tag on /admin routes and /404. No existing robots
  restrictions were present. Crawling remains allowed so bots can read noindex.
  Authentication still protects admin content; robots.txt is not access control.
- Canonical tags are inserted by JavaScript, rather than assigning the Home
  canonical to every route in the shared HTML. Consider prerendering or SSR for
  route-specific initial HTML and faster crawler access in future work.
- The Vercel SPA fallback still returns HTML for unknown paths. Client noindex
  helps, but true HTTP 404 responses would improve handling of missing pages.
- Public navigation routes and legacy redirect destinations correspond to existing
  routes; education/certification/beyond targets exist in About. All three linked
  resume PDFs and the social image were verified in dist/. Supabase-managed links and
  external project demos require a live crawl; static analysis cannot verify them.
- Live fetching was unavailable during implementation. After deploying, verify the
  canonical host, HTTPS redirects, 200 responses, XML/text content types, absence of
  unexpected X-Robots-Tag headers on public pages, and Google-rendered page content.
  Also check that unknown URLs do not appear as indexable soft 404s.

## Hosting

The existing target is Vercel at the domain root; no repository subpath applies.
Deploy dist/ using the current vercel.json. Static files should be served before
the SPA fallback; verify the sitemap returns XML rather than index.html.
Netlify or another static host must serve dist/ and configure a history fallback
after real files. No hosting migration is required for this change.

Do not upload the current app unchanged to a GitHub Pages repository subpath:
it uses root-relative assets and BrowserRouter without a basename. Such a migration
requires Vite base, router basename, asset URLs, and a deep-link strategy to be
updated together. Sitemap/canonical URLs must then use the actual canonical host
and subpath. robots.txt must be served at the hostname root; a repository-level
/My_Portfolio/robots.txt does not control crawling for that hostname.

## Google Search Console

1. Deploy these changes and open both endpoints above to confirm their contents.
2. Open https://search.google.com/search-console/ and select the property for this
   domain. If needed, add a Domain property for thakardhruv.me and verify its DNS TXT
   record, or add the URL-prefix property https://www.thakardhruv.me/ and verify it.
   The existing HTML verification token was preserved; confirm it belongs to your
   account/property.
3. In Sitemaps, submit https://www.thakardhruv.me/sitemap.xml (or sitemap.xml when
   the property prefix is already shown). Confirm the status becomes Success.
4. Inspect each full public URL with URL Inspection. Use Test Live URL, review
   rendered HTML, indexing eligibility, and the declared/Google-selected canonical.
   Choose Request Indexing for important new or updated pages when available.
5. Monitor Sitemaps for fetch/parse errors and Page indexing for excluded pages,
   duplicates, crawl failures, and soft 404s. Fix the cause, redeploy, and validate
   the fix. Monitor Performance for searches for your name and project terms.

Submission and indexing requests do not guarantee indexing or ranking.

## Local validation

- npm run lint:ci: passed (30 existing warnings, no errors).
- npm run test:run: passed (10 files, 85 tests, including sitemap/metadata checks).
- npm run build: passed.
- npm run size: passed (all 17 budget entries within tolerance; secret scan passed).
- Source and built sitemap parsed successfully as XML. Both SEO files in dist/
  match public/ byte for byte. git diff --check passed.

References:
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
