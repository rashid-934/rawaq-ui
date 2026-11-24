# Rawaq UI design theme: "Rail and Bento"

This is the master copy of the design. Every component of Rawaq UI follows it, and every app
that uses Rawaq UI gets it through the package. A change to the look is made here and in the
package first, and reaches the apps with a new version.

Platform: web applications for desktop and laptop browsers.

## 1. The idea in one paragraph

A dark, floating **icon rail** on a soft **haze** background, with the app inside one large
rounded **frame**. Two kinds of pages:

- **Overview pages** (a dashboard): a visual **bento grid** of cards, a dark hero banner and big
  numbers.
- **Work pages** (everything else: lists, forms, reports, settings): **dense and calm**. Full
  width, compact rows, sticky table headers, no banners, no decoration. More data on one screen.

Same colours, same rail, same frame on both, so an app feels like one product.

## 2. Colours

### Seven presets

A curated list, no free colour picker. Keys are stable: an app may store them.

| Key | Name | Background | Card | Border | Sidebar (rail) | Accent | Highlight | Haze from | Haze to | Glow |
|---|---|---|---|---|---|---|---|---|---|---|
| `sand-forest` | Sand and Forest **(default)** | #F6F3EC | #FFFDF8 | #E5DDCB | #173B30 | #1F6B4F | #C49A45 | #E4EFE8 | #F5E7DA | #CDEBDC |
| `stone-navy` | Stone and Navy | #F3F4F6 | #FFFFFF | #E2E5EA | #1B2B44 | #2B5A9E | #C9A24A | #E3E9F2 | #F3EADB | #D3E0F4 |
| `pearl-teal` | Pearl and Teal | #F2F6F5 | #FFFFFF | #DCE6E3 | #0F3D3E | #11766F | #D9A441 | #DFEEEC | #F4E9D8 | #CBEBE6 |
| `linen-burgundy` | Linen and Burgundy | #F7F2EF | #FFFCFA | #EADDD6 | #4A1F2A | #8C2F45 | #C99A5B | #F1E3E5 | #F4E8DA | #F0D3DA |
| `graphite-amber` | Graphite and Amber | #F4F3F1 | #FFFFFF | #E4E1DC | #26272B | #9A5B0B | #E0A84A | #ECEAE6 | #F4E6D3 | #F3DDB8 |
| `slate-gray` | Slate Gray | #F1F2F4 | #FFFFFF | #DFE2E6 | #3B4048 | #4B5563 | #C9A24A | #E6E8EC | #EFEFEF | #DADDE3 |
| `onyx-black` | Onyx Black | #F2F2F1 | #FFFFFF | #E2E2E0 | #121315 | #1E1F23 | #D4A548 | #E7E7E6 | #F1EEE8 | #E6E6E6 |

What each colour is for:

- **Background**: behind the frame, under the haze.
- **Card**: cards, inputs, tables, the frame's inner surface.
- **Border**: card and divider hairlines.
- **Sidebar (rail)**: the rail fill and the hero banner fill.
- **Accent**: primary buttons, links, active tabs.
- **Highlight**: the focus ring, the hero banner's pill button and emphasised phrase, one
  highlighted rail entry.
- **Haze from / Haze to**: the soft background gradient, from the top start corner to the bottom
  end corner. Overview pages show it fully. Work pages show it only as a thin edge around the
  frame.
- **Glow**: the filled circle behind the active rail icon, and soft selections (selected row,
  count badges).

Text, shared by every preset: main #1F2A24, secondary #5A6158, on dark #FFFFFF, error #A61B1B.

### Contrast (WCAG 2.2 AA)

Every preset passes every pair below. `src/tokens/contrast.test.ts` checks each pair for each
preset, so a new preset cannot break them.

- White text on Sidebar and on Accent: at least 4.5:1.
- Main, secondary, link (Accent) and error text on Background, Card and the raised surface (Card
  mixed with Border): at least 4.5:1.
- Main and secondary text on Haze from, Haze to and Glow: at least 4.5:1.
- Main text on the Highlight pill button: at least 4.5:1.
- Text of filled buttons on the Accent, at rest and hovered: at least 4.5:1.
- Text of "light" buttons and badges on their faint Accent tint: at least 4.5:1.
- Control borders (inputs, checkboxes) on Background, Card and the raised surface: at least 3:1.
- The focus ring: the Highlight against its dark inner ring: at least 3:1.
- The Highlight on the Sidebar (the emphasised phrase of the banner is large text): at least 3:1.
- The Glow circle against the rail: at least 3:1. Rail-coloured text on the Glow: at least 4.5:1.
- Rail icons and labels (white at 75 percent) and muted text on the rail, at rest and on a
  hovered item: at least 4.5:1.

### Sidebar colour

A choice of its own: "Match theme" or one of ten swatches: Forest #173B30, Navy #1B2B44,
Deep teal #0F3D3E, Burgundy #4A1F2A, Graphite #26272B, Olive #33402A, Plum #3B2A45,
Espresso #3A2A20, Slate #3B4048, Onyx #121315. With a swatch, the Glow stays the preset's Glow;
the contrast test checks every preset against every swatch.

### A brand palette

An app may bring its own nine colours instead of a preset. The palette must pass the same pairs.
`createRawaqTheme` refuses a palette that fails and names each failing pair, with the ratio it
has and the ratio it needs. Text colours are not part of a palette.

### Number card tints

Four soft tints for the icon tile of a number card, a background and a text colour each: green
#E3EFE7 / #1F5A42, amber #F6E9CC / #7A5212, slate #E2E8EC / #2F4858, clay #F3DDD3 / #8A3A22.
The tint is decoration only: every card says what it counts in words.

## 3. Density

- Two choices: **Compact** (the default) and Comfortable.
- Compact: spacing 6, 8, 12, 16, 24 px; buttons and inputs 36 px high; frame margin and bento
  gap 12 px.
- Comfortable: spacing 10, 12, 16, 24, 32 px; buttons and inputs 40 px high; frame margin and
  bento gap 16 px.
- Work page tables are always at least as tight as Compact (rows about 36 px, cell padding 8 px),
  whatever the density.

## 4. Layout

### 4.1 Frame and haze

- Page background: the Background colour with a soft linear gradient from Haze from to Haze to.
- The app sits in one **frame**: Card surface, radius 24 px, 1 px Border, soft shadow, outer
  margin 12 px (Compact) or 16 px (Comfortable).
- A sticky header, 56 px high, at the top of the frame: search, menus, the person.
- Work pages: frame inner padding 12 px, content full width. Overview pages: inner padding 16 px,
  and the haze shows through (the cards carry the Card surface themselves).
- The window scrolls the page. The frame's rounded edge is drawn over whatever scrolls past it,
  so sticky bars and menus keep working.

### 4.2 Rail

- Floating, fully rounded (radius 999 px), width 64 px, 12 px from the window edge, as tall as
  the frame. Fill: the Sidebar colour.
- Icons only, 20 px, white at 75 percent opacity; full white on hover.
- **Active entry**: a 40 px circle in the Glow colour, the icon in the Sidebar colour, a soft
  glow shadow, a small notch toward the content. The circle slides from the old entry to the new
  one.
- **Tooltip** with the page name on hover and on keyboard focus, always.
- **"Show labels" toggle** at the bottom of the rail: opens a 220 px labelled panel that pushes
  the content (no overlay). Default closed. An app may remember the choice for the person.
- Parts, from the top: the logo tile, the main entries in the order of the app's own flow,
  optional labelled groups, a divider, bottom entries (one of them may be highlighted), the
  person.
- Right-to-left: the rail is on the **right**; the notch and the tooltips mirror.

### 4.3 Overview pages

- **Bento grid**: 12 columns, gap 12 px (Compact) or 16 px (Comfortable). Cards span 3, 4, 6, 8
  or 12 columns. An optional side column of 320 px on the end side.
- **Hero banner** (top, full width of the main column): Sidebar fill, white text, one phrase of
  the headline in the Highlight colour (italic in left-to-right scripts; heavier and not italic
  in right-to-left scripts), one pill button in the Highlight colour with main-colour text.
- **Number cards**: label, a big tabular number (28 to 32 px), a small hint. Colour never carries
  meaning alone.
- Card padding 12 px (Compact) or 16 px (Comfortable); no card taller than its content needs.

### 4.4 Work pages

- One-line page header: title, count, the primary action on the end side. No banner, no hero, no
  decorative cards.
- A filters bar under the header: search, two to four quick filters, the rest behind "Advanced".
- Tables: full width, sticky header row, compact rows, tabular numbers aligned to the end side,
  row hover tint, selected row in the Glow tint. In a narrow window a table scrolls sideways on
  its own, and there its header row does not stick: it stays above its rows.
- Detail views open in a side drawer (about 480 px) or their own page, never a pop-up for long
  forms.
- Forms: two columns where it fits, labels above inputs.

## 5. Components

- **Buttons**: primary = Accent fill with white text, radius 10 px, height 36 px (Compact) or
  40 px (Comfortable). Secondary = Card fill with Border. The pill variant (radius 999 px) only
  on Overview pages.
- **Cards**: Card fill, 1 px Border, radius 16 px on Overview pages and 12 px on Work pages, a
  soft shadow on Overview pages only.
- **Inputs**: radius 10 px, 1 px border that reaches 3:1, focus ring 3 px in the Highlight colour
  with a dark inner ring. A password field shows the same ring, on its box.
- **Tabs**: underline tabs on Work pages; pill tabs on Overview pages.
- **Badges and counts**: the Glow tint with Sidebar-colour text for counts; the error colour for
  alerts.
- **Empty states**: an icon tile, a one-line title, one line of help, one button.

## 6. Typography

- Plus Jakarta Sans for Latin text and IBM Plex Sans Arabic for Arabic are built in. Fonts are a
  token per language: an app adds a face for another language (and a line height when the script
  needs taller lines) without changing the package. The app loads the font files.
- Tabular numbers for all money, quantities and counts.
- Sizes: page title 20 px, card title 14 px semibold, body 14 px, table and small text 13 px,
  big numbers 28 to 32 px.
- Letter spacing is never applied to right-to-left text: it breaks the joins between letters.

## 7. Motion

Overview pages:

- Entrance: cards fade and rise 8 px in 0.35 s, 40 ms apart, at most 8 steps.
- Big numbers: the digits **roll into place once**, 0.8 s. Not again on a tab switch or a data
  refresh.
- Card hover: lift 2 px with a soft shadow, 0.15 s.
- Bars: horizontal bars grow once from the start side (from the right in right-to-left pages),
  vertical bars grow once from the bottom, 0.6 s.

Everywhere:

- The rail's Glow circle slides to the new entry in 0.2 s. A tooltip fades in 0.12 s.
- **Page fade**: a new page fades in, 0.2 s. Overview pages add a light blur. It plays on a page
  change only, never for something that appears inside a page.
- **Loading skeleton**: soft placeholder shapes in the theme's colours while a page loads, shown
  only after 0.15 s; then the real content fades in.
- **Opening**: once per sign-in, under one second. A screen in the Sidebar colour with the logo
  tile and the app name, then a curved sweep toward the bottom end corner that reveals the app
  (mirrored in right-to-left pages). It never takes a click or a key, and it ends by CSS alone.
- Work pages: only hover, focus, row highlight and drawers. **No rolling numbers, no entrance,
  no moving rows.** Nothing may delay reading data.

Always: when the device asks for reduced motion (`prefers-reduced-motion: reduce`) there is no
animation at all, and numbers show their final value at once.

Motion changes `transform` and `opacity` only, so nothing on the page is laid out again while it
plays. One exception, kept by the owner on 12 Nov 2026: "Show labels" slides the rail open and
pushes the page over (it changes widths for 0.2 s), because a push cannot be drawn any other way.

Built with CSS only. No animation library. The timings are tokens (`src/tokens/motion.ts`).

## 8. Screen sizes

- **Desktop, 1280 px and wider**: the design of sections 1 to 7, checked at 1280 x 720 and
  1920 x 1080. Nothing of the phone layout changes it: CI compares every story, pixel by pixel.
- **Tablet, 768 to 1279 px**: the rail stays; the frame margin is 8 px; Overview cards in two
  columns, number cards two per row, the side column under the main one; a table scrolls sideways
  on its own only while it is wider than the frame. Never a sideways page scroll.
- **Phone, below 768 px**: the phone layout below, checked at 360 x 800, 390 x 844 and 430 x 932.
  An app that does not give the frame a bottom bar keeps the 1.1 narrow layout (the rail as a
  drawer).

### 8.1 Phone layout (approved by owner, 24 Nov 2026)

From the owner's mockups (direction, not pixels). The real tokens are used.

- **Bottom bar** (`BottomBar`): a floating pill in the rail colour, 12 px from the window edges and
  above the gesture bar, 64 px high, `--app-shadow-lg`. Four pages at most, plus More. Each entry
  is the whole slot (never under 48 x 48 px): a 24 px icon over a 12 px label on one line. The
  entries keep 12 px clear of the bar's rounded ends. When one label does not fit its slot with
  4 px to spare on each side (a long name, another language, a narrow phone), the whole bar shows
  its icons only, all entries alike; the names stay for screen readers (owner, 24 Nov 2026). The Glow pill (56 x
  32 px) sits behind the active icon and slides between entries; mirrored in RTL. Every entry has
  its own icon (`bottomBarProblems` checks). The page keeps `--app-bottom-space` free at its end.
  A page is marked current (`aria-current`); More is a button, so while one of the sheet's pages is
  open it only has the Glow. Before the script has measured the Glow, the active icon has the Glow
  colour itself, so the first paint already shows where the person is.
- **More sheet** (`MoreSheet` on `BottomSheet`): the person (initials, name, role), the company
  row on the selection tint, the other pages as tiles four per row (72 px; the highlight entry in
  the highlight colour; the current page's tile has an accent ring too), the theme switch, the
  language choice (buttons, each name in its own language; the chosen one filled and with a
  check mark, and an arrow key only moves the focus), Sign out in the error colour. A 48 px grab handle, the dimmed page, and it closes on a swipe down
  (96 px, or a flick of 24 px or more), a tap outside, Esc and Back. Opening adds a history step,
  so Back closes the sheet before it leaves the page; a link inside closes the sheet first. The
  sheet takes its step out only while that step is still the current one (an address the app moved
  to stays), one step per opening in React's strict mode too.
- **Header** (`PhoneBar`): one line, 56 px: the logo tile (32 px, highlight), the page title (the
  page's `h1`; the `PageHeader` title, count and actions step aside), one action of 48 px. A strip
  in the rail colour fills the safe area above it. A page keeps one `h1`: on the Overview the hero
  stays the heading, so the bar's title is plain text there (`titleOrder="none"`).
- **Frame and haze**: no frame margin and no frame edge on phones; the plain background.
- **Overview**: one column. The hero banner holds the greeting and `NeedsYouList` (three rows at
  most, 48 px each, the first marked "Do next"; a screen reader hears "Do next" first and a pause
  between the parts). Number cards two per row, the number from 22 to
  30 px with the screen. Money shows its currency in the page's language (`StatCard currency`).
  `ActivityList`: the name, the reference under it, the status at the end (56 px rows).
- **Work pages**: cards by default (`CardList` in `WorkList`): reference and status on top, the
  name in bold, the facts and the quantity in words, a chevron mirrored in RTL. A table that must
  stay a table (`WorkList phoneView="table"`, `TableWrap stickyFirstColumn`) keeps its first column
  in place while it scrolls sideways, and a hint under it says so (only while the table is wider
  than the phone). A box that scrolls takes the keyboard focus as a named region, and a focused
  control stops beside the fixed column, not under it.
- **Search and filters**: the search field is 48 px high with a search icon; filter chips 40 px high
  with a 48 x 48 px touch area, in one row that scrolls. The chosen chip is filled and has a check
  mark: colour is never the only sign of a choice (in forced colours an outline keeps it).
- **Forms**: one column, full-width inputs (48 px). The save bar (`StickyActions`) sits above the
  bottom bar, and right above the keyboard while a text field has the focus (the bar steps aside).
  A focused field stops above the save bar.
- **Dialogs and drawers**: full-screen bottom sheets.
- **Touch**: every tap target at least 48 x 48 px, at least 8 px apart.
- **Safe areas**: `rawaqViewport()` gives `viewport-fit=cover` and the rail colour as
  `theme-color` (no `interactive-widget`: Safari reports it as an error); the keyboard is followed
  with `--app-keyboard-inset`; `--app-safe-*` take the larger of `env(safe-area-inset-*)`
  and Capacitor's `--safe-area-inset-*`.
- **Motion**: the same tokens. The opening plays on phones too; its edge sweeps into the middle of
  the bottom edge. The bar's Glow slides; page fade, skeletons and rolling numbers as on desktop;
  all off with reduced motion.

## 9. Rules

- Tokens only: never a hardcoded colour or size in a component.
- Any language: direction from the page, fonts from the font token, words from props. No code
  and no CSS tests for one language.
- Full right-to-left support: the rail on the right, mirrored icons where direction matters,
  logical CSS properties.
- WCAG 2.2 AA: the contrast pairs of section 2, a visible focus ring, keyboard access for the
  rail, tabs and tables, labels tied to inputs.
- Server-rendered components use flat Mantine parts (`TableThead`, `TableTr`), never
  `Table.Thead`.
