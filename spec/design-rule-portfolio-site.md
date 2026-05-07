# Design Rules - tikomo software Portfolio Site

This rule extends ./design-rule-common.md.
If there is a conflict, follow this portfolio site rule only when the reason is explicit.

## Source

Based on the existing portfolio site:

- URL: https://tikomosoftware.github.io/index.html
- Local code: `C:\Projects\Site\tikomosoftware-site`
- Primary reference files: `style.css`, `index.html`, `web.html`, `windows.html`, `android.html`, `tools.html`

The current visual direction is a dark navy portfolio with bright cyan-blue accents, rounded pill navigation, large product sections, and restrained card shadows.

---

## Theme

The portfolio should feel like a clean software showcase rather than a dense admin tool.

- Dark navy background as the main visual identity
- Cyan-blue accent for active categories, primary actions, section dividers, and links
- Large, readable Japanese text with enough line height for story-like descriptions
- Pill-shaped navigation and action buttons
- Product screenshots are important and should be visually prominent
- Shadows are present but restrained; borders carry most of the structure
- Avoid pure black except for image modal overlays or screenshots

---

## Core Palette - Dark Navy Portfolio

Use this palette when matching the current screenshot and dark theme.

```css
:root,
[data-theme="dark"] {
  --bg-body: #1a2742;
  --bg-light: #213352;
  --bg-white: #253d5e;
  --primary-color: #38bdf8;
  --primary-dark: #0ea5e9;
  --secondary-color: #a8b8cc;
  --text-main: #f1f5f9;
  --text-body: #d1dae6;
  --border-subtle: #2e4a6e;
  --hero-bg: #142236;
  --category-bg: #1e3450;
  --surface-shadow: 0 16px 40px rgba(10, 20, 40, 0.35);
}
```

### Screenshot-Matched Color Roles

- Page background: `#1a2742`
- Top hero/header background: `#142236`
- Sticky category bar: `#1a2742` with translucent blur
- Product/card surface: `#253d5e`
- Secondary surface: `#213352`
- Primary accent: `#38bdf8`
- Primary hover/deeper accent: `#0ea5e9`
- Text main: `#f1f5f9`
- Text body: `#d1dae6`
- Muted text: `#a8b8cc`
- Borders: `#2e4a6e`

---

## Light Companion Palette

The site has a light mode, but the dark navy mode is the stronger brand expression.

```css
:root {
  --bg-body: #f8fafc;
  --bg-light: #ffffff;
  --bg-white: #ffffff;
  --primary-color: #2563eb;
  --primary-dark: #1d4ed8;
  --secondary-color: #64748b;
  --text-main: #0f172a;
  --text-body: #475569;
  --border-subtle: #e2e8f0;
  --hero-bg: #0f1729;
  --category-bg: #1e293b;
  --surface-shadow: 0 16px 40px rgba(15, 23, 41, 0.08);
}
```

Use light mode when:

- Content needs to feel more document-like
- Screenshots are already dark and need a lighter surrounding frame
- A more conventional portfolio presentation is desired

---

## Accent Gradient

Use a subtle blue-to-cyan gradient only as a structural accent.

```css
background: linear-gradient(90deg, var(--primary-color), #38bdf8);
```

Use it for:

- Hero bottom rule
- Section title underline
- Small active separators

Avoid using this gradient as a large decorative background. The portfolio should read as navy and clean, not as a gradient-heavy landing page.

---

## Typography

Current site font:

```css
font-family: "Noto Sans JP", sans-serif;
```

Rules:

- Keep Japanese text spacious with `line-height: 1.75` for body copy
- Use bold headings for project names
- Keep section labels uppercase with small letter spacing
- Do not use negative letter spacing
- Avoid tiny text for long Japanese descriptions

Suggested scale:

```css
body {
  line-height: 1.75;
}

.section-label {
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3.2rem);
}

.page-hero h1 {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
}
```

---

## Layout

Container:

```css
--container-width: 1180px;

.container {
  width: min(100%, var(--container-width));
  margin: 0 auto;
  padding: 0 2rem;
}
```

Section spacing:

```css
--section-spacing: 4rem;
```

Rules:

- Use generous vertical spacing for project storytelling
- Use two-column product sections on desktop
- Collapse to one column on mobile
- Product visuals may appear on the right for detail pages
- Keep category navigation horizontally scrollable on small screens

---

## Navigation

Navigation uses rounded pill buttons with a quiet border.

```css
.category-btn,
.overview-tab,
.btn {
  min-height: 44px;
  border-radius: 999px;
}
```

Rules:

- Active category uses cyan accent border and text
- Buttons should not rely on heavy shadow
- Use icons in category buttons when they help scanning
- Keep horizontal navigation scrollable instead of wrapping into cramped rows

---

## Surfaces

Main surfaces:

```css
--bg-body: #1a2742;
--bg-light: #213352;
--bg-white: #253d5e;
--border-subtle: #2e4a6e;
```

Rules:

- Use borders for structure
- Use shadows only on product cards, screenshots, and profile panels
- Keep surface contrast subtle but clear enough for nested sections
- Do not use pure black surfaces except for image modal overlays

---

## Radius

The current portfolio uses a mix of medium radius and pills.

Current patterns:

- Product visuals: `8px`
- Developer profile: `8px`
- Modal image: `8px`
- Note cards: `12px`
- Hero logo: `12px`
- Developer profile in older section: `16px`
- Navigation and primary buttons: `999px`

Rules:

- Use `8px` for framed images and product surfaces
- Use `12px` for cards that need a friendlier feel
- Use `999px` only for navigation tabs, chips, and action buttons
- Avoid mixing too many radius values in one component group

---

## Shadow

Current shadow tokens:

```css
--surface-shadow: 0 16px 40px rgba(10, 20, 40, 0.35);
```

Additional current patterns:

```css
.project-card {
  box-shadow: 0 14px 35px rgba(18, 24, 32, 0.06);
}

.project-card:hover {
  box-shadow: var(--surface-shadow);
}
```

Rules:

- Use weak default shadows
- Use stronger shadow only on hover or prominent screenshots
- Pair shadows with borders
- Avoid multiple layered shadows except for modal image presentation

---

## Product Visuals

Screenshots are part of the portfolio identity and should not be treated as small thumbnails.

Rules:

- Use large 16:9 or 16:10 frames where possible
- Frame screenshots with subtle border and radius
- Use `object-fit: cover` for card thumbnails
- Use `object-fit: contain` where inspection matters
- Keep image backgrounds dark or navy-compatible

---

## Buttons

Primary buttons:

```css
.btn {
  border-radius: 999px;
  padding: 0.7rem 1rem;
  font-weight: 600;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}
```

Rules:

- Primary actions use cyan-blue
- GitHub actions can use dark neutral
- Store/download buttons may use platform colors, but keep them muted enough to fit the palette
- Buttons should have at least `44px` height for touch comfort

---

## Notices

The portfolio uses notices for suspended or proof-of-concept projects.

```css
.notice {
  padding: 1rem 1.25rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.notice--suspended {
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
}

.notice--poc {
  background: rgba(234, 179, 8, 0.1);
  border-left: 4px solid #eab308;
}
```

Rules:

- Notices should be visible but not dominate project descriptions
- Use left border to communicate status quickly
- Avoid fluorescent warning colors

---

## Copy Tone

The site should feel personal and technically credible.

- Product titles should be clear and direct
- Descriptions may include the motivation and development story
- Keep section labels short and scannable
- Technical stack badges should support credibility, not overwhelm the page

---

## How To Request This Theme

```text
spec/design-rule-common.md を共通ルールとして読んだうえで、
spec/design-rule-portfolio-site.md の Dark Navy Portfolio を適用してください。
色味は tikomo software のポートフォリオサイトに合わせて、濃紺背景とシアンブルーアクセントを基準にしてください。
レイアウトや文言は必要がない限り変更しないでください。
```

If only extracting colors:

```text
C:\Projects\Site\tikomosoftware-site の style.css を参照し、
tikomo software ポートフォリオの色味を design-rule-portfolio-site.md のトークンとして整理してください。
```
