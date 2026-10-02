# labdhishahp.github.io/PORTFOLIO

My personal site. Static, built with [Astro](https://astro.build), no client-side JavaScript.

## Editing

| What | Where |
| --- | --- |
| Name, email, links, nav | `src/site.ts` |
| Work stories | `src/content/work/*.md` — frontmatter holds the scan zone (TL;DR, metrics, pipeline, decisions); the body is the full story |
| Writing | `src/content/writing/*.md` (`title`, `summary`, `date`, `kind`) — the page shows an honest empty state until one exists |
| Journey, principles, outside engineering | `src/pages/journey.astro` |
| Home | `src/pages/index.astro` |
| Design tokens (colour, type) | top of `src/styles/global.css` |

Pipeline steps take `kind: model | check | step`; checks are drawn in the accent colour.

The résumé is `public/resume.pdf` — replace that file to update it.

## Running

```sh
npm install
npm run dev      # http://localhost:4321/PORTFOLIO/
npm run build    # static output in dist/
```

Pushing to `main` deploys via `.github/workflows/deploy.yml`
(Settings → Pages → Source must be set to **GitHub Actions**).
