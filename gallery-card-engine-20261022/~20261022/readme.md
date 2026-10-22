# notion-gallery-engine

A config-driven gallery card renderer for Notion/Oopy that rebuilds gallery cards with per-page rules.

## Overview

`notion-gallery-engine` is a browser-side script that reads Notion/Oopy gallery cards, hides the original card layout, and renders a custom card shell on top of the existing DOM.[cite:45][cite:94]

The project is designed around a simple split: the reusable engine lives in GitHub, while gallery-specific rules such as tab names, selectors, and tag behavior are injected through a configuration object on each page.[cite:103][cite:104][cite:106]

This makes it possible to reuse the same core script across multiple gallery views without hardcoding one specific collection structure into the engine itself.[cite:103][cite:122]

## Why this exists

Default Notion/Oopy gallery cards are useful, but they do not provide much control over visual hierarchy, tag visibility, or per-tab presentation rules.[cite:124]

This engine solves that by rebuilding the visible card structure after the page renders, while still using the original Notion/Oopy content as the source of truth.[cite:45][cite:94]

The practical goal is not to replace Notion, but to provide a thin configurable rendering layer that can be tuned per page without rewriting the engine every time a gallery changes.[cite:103][cite:104]

## Core ideas

The project follows a **configuration-first** structure. The engine handles DOM traversal, card parsing, re-rendering, and re-application after dynamic updates, while page-specific behavior is controlled through `window.GA_CONFIG`.[cite:101][cite:103][cite:104]

This design is especially useful in Notion/Oopy environments because the DOM is dynamic, cards may re-render after tab changes or lazy loading, and a static one-time script is often not enough.[cite:45][cite:111]

At a high level, the engine does four things:

- Finds the gallery cards and their internal content blocks.[cite:94][cite:97]
- Extracts image, title, and visible value-like properties from each card.[cite:94]
- Rebuilds the card into a custom shell with controlled layout and tag behavior.[cite:45]
- Watches DOM mutations and reapplies the transformation when needed.[cite:45][cite:92]

## How it works

### 1. Card discovery

The engine starts from a gallery card selector such as `.notion-collection-item`, then locates the internal clickable card root that Notion/Oopy uses to render each tile.[cite:94][cite:97]

Because DOM structures can vary between pages and themes, selectors are treated as configuration rather than assumptions baked into the engine.[cite:103][cite:104]

### 2. Content extraction

The engine reads the visible title, scans for images, and looks for the block that behaves like a property area by excluding the title block and empty containers.[cite:94]

In some Notion/Oopy gallery layouts, property labels are not rendered on the card, and only the values appear. In those cases, the engine cannot infer semantic property names from the card DOM alone.[cite:94]

That limitation is the reason `tagMode: 'index'` exists: it allows a page to specify which visible property value should be used as the tag when no reliable name-to-value mapping is available in the rendered card structure.[cite:84][cite:99]

### 3. Rule matching

Each card is evaluated against a rule set in `window.GA_CONFIG.rules`. Rules can match the current gallery title with `title:` or the active tab with `tab:`.[cite:103][cite:104]

When multiple rules exist, the engine uses the first specific match and falls back to the `all` rule when no tab- or title-specific rule applies.[cite:104]

### 4. Re-rendering

After classification, the engine hides the original visible children of the card root and appends a new `.ga-card-shell` structure containing the thumbnail, title, description, meta area, and extra values.[cite:45]

This keeps the original source DOM in place while presenting a custom card layout to the user.[cite:45][cite:94]

### 5. Mutation handling

Oopy and Notion often re-render parts of the page after tab changes, route changes, or lazy-loaded content updates. A one-time DOM rewrite would therefore be unreliable.[cite:45][cite:111]

To address that, the engine uses `MutationObserver.observe()` to watch the page and rerun the build step when new gallery cards appear.[cite:45][cite:92]

## Configuration model

The project is intentionally built around a configuration object.

A minimal example looks like this:

```js
window.GA_CONFIG = {
  tab: {
    selectors: ['span.css-ymcnjv', '.css-1jvn19f', '.css-14pj9fz'],
    keywords: ['전체보기', '디자인', '기장', '넥라인']
  },
  gallery: {
    cardSelector: '.notion-collection-item',
    galleryRootSelectors: ['.notion-collection_view-block', '.notion-gallery-view'],
    titleSelectors: ['.notion-collection-view-title', 'h1', 'h2', 'h3', '[data-content-editable-leaf="true"]']
  },
  rules: [
    { match: 'all', tagMode: 'auto' },
    { match: 'tab:전체보기', tagMode: 'none' },
    { match: 'tab:디자인', tagMode: 'index', tagIndex: 0 },
    { match: 'tab:기장', tagMode: 'none' },
    { match: 'tab:넥라인', tagMode: 'index', tagIndex: 0 }
  ]
};
```

This pattern keeps the engine generic and moves page-specific assumptions into a small editable object, which is easier to maintain and safer to tweak on Oopy/Notion pages.[cite:101][cite:103][cite:104]

### Configuration fields

| Field | Purpose | Notes |
|------|---------|-------|
| `tab.selectors` | CSS selectors used to locate possible tab elements | Should be customized per page when tab DOM differs.[cite:94] |
| `tab.keywords` | Optional whitelist of valid tab labels | Leave empty for broad matching, or fill it to improve precision.[cite:103] |
| `gallery.cardSelector` | Selector used to find gallery cards | Defaults should be overridden if the card root changes.[cite:94] |
| `gallery.galleryRootSelectors` | Selectors used to locate the gallery container | Used for title-based rule matching.[cite:94] |
| `gallery.titleSelectors` | Selectors used to find the gallery title | Also used in title rule matching.[cite:94] |
| `rules` | Per-page behavior rules | Supports `all`, `title:...`, and `tab:...` matching.[cite:104] |

## Tag modes

The engine currently supports three tag modes.

| Tag mode | Meaning | Best use case |
|---------|---------|---------------|
| `none` | Do not render a tag | Tabs where tags should be hidden entirely.[cite:84] |
| `auto` | Use the first button-like property, or fall back to the first visible property | Good when the page has a stable “first useful value” pattern.[cite:84] |
| `index` | Use the property at `tagIndex` | Best when property labels are unavailable and value order is stable.[cite:99] |

`auto` is convenient, but it is still a fallback strategy. Because `Array.prototype.find()` returns the first matching item, it naturally favors the earliest visible candidate in DOM order.[cite:84]

When a page needs stronger control, `index` mode is more predictable because it does not depend on inferring semantics that are missing from the rendered card DOM.[cite:99][cite:94]

## Repository structure

A practical repository layout could look like this:

```text
notion-gallery-engine/
├─ src/
│  └─ gallery-engine.js
├─ examples/
│  ├─ gallery-config.example.js
│  └─ oopy-snippet.example.html
├─ README.md
└─ LICENSE
```

This structure keeps the engine source separate from page-level usage examples and makes it easier to publish improvements without mixing production logic and one-off page settings.[cite:122][cite:127]

## Recommended usage

### GitHub

Store the generic engine in the repository and keep it free of page-specific keywords, hardcoded tabs, or one-off view assumptions.[cite:122][cite:103]

### Oopy or Notion

Inject a page-specific `window.GA_CONFIG` object before the engine runs. That lets each page control selectors, rules, and tag behavior without requiring a fork of the engine.[cite:104][cite:106]

### Team workflow

A practical workflow is:

1. Update selectors or engine logic in GitHub only when the rendering mechanism changes.[cite:122]
2. Update `window.GA_CONFIG` on a page when only tab names, rule order, or tag indices change.[cite:103][cite:104]
3. Keep page-specific experiments out of the engine whenever possible.[cite:122]

## Known limitations

This engine works within the limits of the rendered Notion/Oopy DOM, not the raw database schema.[cite:94]

If a gallery card shows only values and does not render property names, the engine cannot automatically map a visible value back to a semantic property label such as “넥라인” or “기장.”[cite:94]

In that scenario, `tagMode: 'index'` is the most reliable approach because it assumes stable value order rather than unavailable property names.[cite:99]

The engine also depends on CSS selectors that may change if Oopy or Notion updates its front-end markup. When that happens, the correct fix is usually to update the page configuration first and only update engine code if the overall extraction strategy has changed.[cite:94][cite:122]

## Design principles

The project is based on a few simple principles:

- Keep the engine generic.[cite:103]
- Push page-specific assumptions into configuration.[cite:104]
- Prefer deterministic rules over fragile heuristics when semantic DOM data is missing.[cite:99]
- Rebuild safely when the page mutates instead of assuming a fixed DOM lifecycle.[cite:45][cite:92]
- Favor maintainability over clever one-off shortcuts.[cite:122][cite:127]

## Example integration flow

A common integration flow is:

1. Define `window.GA_CONFIG` in the page or Oopy custom code area.[cite:106]
2. Load or paste the generic engine script after the config object.[cite:104]
3. Inspect the card DOM and adjust selectors or `tagIndex` values if the visible card structure differs.[cite:94]
4. Test tab switching, lazy loading, and page transitions to confirm the mutation observer reapplies correctly.[cite:45][cite:92]

## Future improvements

Possible next improvements include:

- Better tab detection hooks for pages with more explicit active-state markup.[cite:94]
- Optional debug mode that logs card parsing and rule selection to the console.[cite:103]
- Style presets for multiple card layouts using the same extraction engine.[cite:104]
- Cleaner plugin-style hooks for per-page classifiers without changing core code.[cite:101][cite:103]

## License

Choose a license that fits the intended usage. MIT is a practical default if the goal is broad reuse with minimal friction.[cite:122]
