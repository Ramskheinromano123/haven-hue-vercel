# Haven & Hue

A static storefront deployed on Vercel. No build step or framework is required.

## Files

- `index.html` — homepage markup and entry point.
- `styles.css` — page styles linked from the HTML.
- `script.js` — cart, checkout, login, product, and interaction behavior.
- `Haven & Hue.html` — standalone copy of the homepage with the same asset links.

## Deployment

The GitHub repository is connected to Vercel. Commits pushed to `main` trigger a new deployment automatically.

To deploy manually with the Vercel CLI:

```powershell
vercel --prod
```
