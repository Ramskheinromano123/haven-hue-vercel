# Haven & Hue

A static storefront deployed on Vercel. No build step or framework is required.

## Files

- `index.html` — homepage markup and entry point.
- `styles.css` — page styles linked from the HTML.
- `script.js` — cart, checkout, demo login, inventory, product, and interaction behavior.
- `Haven & Hue.html` — standalone copy of the homepage with the same asset links.

## Deployment

The GitHub repository is connected to Vercel. Commits pushed to `main` trigger a new deployment automatically.

To deploy manually with the Vercel CLI:

```powershell
vercel --prod
```

## Demo inventory administration

Log in with `admin@havenhue.com` / `admin1234` to open the inventory panel. It supports stock adjustments, low-stock thresholds, and adding, editing, or deleting products. Orders placed in this browser reduce the stored stock.

This static demo saves inventory and demo accounts in the current browser's local storage. Changes do not sync across visitors or devices, and the admin login is not secure; use a backend with server-side authentication before relying on inventory for a live store.
