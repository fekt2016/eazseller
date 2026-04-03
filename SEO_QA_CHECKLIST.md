# Eazseller SEO QA Checklist

Use this checklist to verify seller SEO behavior after changes.

## Goal

- Public pages should have meaningful metadata.
- Seller dashboard/private pages should remain `noindex,nofollow`.

## Quick DevTools Check

Run on any page in browser console:

```js
(() => {
  const get = (sel, attr = 'content') =>
    document.querySelector(sel)?.getAttribute(attr) || null;
  return {
    title: document.title,
    canonical: get('link[rel="canonical"]', 'href'),
    description: get('meta[name="description"]'),
    robots: get('meta[name="robots"]'),
    ogTitle: get('meta[property="og:title"]'),
    ogUrl: get('meta[property="og:url"]'),
    twitterTitle: get('meta[name="twitter:title"]'),
  };
})();
```

## Public Routes (indexing allowed only where intended)

- `/` (seller landing)
- `/education`
- `/help`
- `/privacy`
- `/terms`

Expected:
- `title` and `description` are present
- canonical points to current route

## Private/Dashboard Routes (must be noindex)

- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/orders`
- `/dashboard/products`
- `/dashboard/finance`
- `/dashboard/settings`

Expected:
- robots contains `noindex` and `nofollow`
- title updates per page

## Regression Signals

- Title does not change between route transitions
- Canonical is missing or stale
- Dashboard pages missing `noindex`
- Branding mismatch appears (`Saysay` vs `Saiisai`)
