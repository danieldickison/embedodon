# embedodon
Simple js to render a Mastodon user’s public toots.

Live example here: https://danieldickison.github.io/embedodon/

## simple example ##

```html
<script type="module">
  import { EmbedodonElement } from 'https://cdn.jsdelivr.net/npm/embedodon@1/dist/index.js'
  customElements.define('embed-odon', EmbedodonElement)
</script>
<embed-odon username="@dand@mastodonmusic.social" class="standard"></embed-odon>
```

Note that custom element names must contain a hyphen. The "standard" class enables a default color scheme.

## customize styles ##

Styles can be customized in several ways. Ordered from simplest to most complex but flexible, you can:
1. Specify a set of [custom CSS properties](#custom-css-properties)
2. Apply styles using [`::part` selectors](#part-selectors)
3. [Override `adoptedStyleSheets`](#override-adoptedstylesheets) to style arbitrary shadowRoot elements
4. [Call `Embedodon#render` directly](#call-embedodonrender-directly) without using the `EmbedodonElement` web component

### custom CSS properties ###

[Custom CSS properties](http://developer.mozilla.org/en-US/docs/Web/CSS/--*) can be used to specify some basic colors. Make sure `class="standard"` is _not_ included on the root element or else the standard colors will take precedence. You should specify _all_ of these properties if you are not using `class="standard"`:

| property | standard    | definition                |
|----------|-------------|---------------------------|
| --fg     | black/white | foreground color for text |
| --bg     | white/black | background color for toot |
| --link   | blue        | link text color           |
| --border | 1px gray    | border for toot           |

Example:
```css
embed-odon {
  --fg: #603;
  --bg: #eee;
  --link: #b0b;
  --border: 2px dashed var(--fg);
}
@media (prefers-color-scheme: dark) {
  embed-odon {
    --fg: #d9b;
    --bg: #222;
    --link: #b6e;
  }
}
```

### `::part` selectors ###

CSS [`::part` selectors](http://developer.mozilla.org/en-US/docs/Web/CSS/::part) can be used to target specific elements within the Embededon-rendered component from your page CSS. Exposed parts are:

| part      | element     | definition                                |
|-----------|-------------|-------------------------------------------|
| toot      | `<article>` | container for each toot                   |
| timestamp | `<time>`    | timestamp link of toot                    |
| content   | `<div>`     | text contents, containing `<p>`, etc      |
| media     | `<div>`     | media attachments, containing images, etc |
| image     | `<img>`     | thumbnail image for media attachment      |

Example:
```css
embed-odon::part(timestamp) {
  font-style: italic;
  text-align: right;
}
```

### override `adoptedStyleSheets` ###

Because the [shadow root](http://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot) of `EmbedodonElement` is created with `mode: 'open'`, its [adoptedStyleSheets](http://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets) property can be overridden. You can choose to include or omit the base stylesheet, which is exposed as `Embedodon.baseStyleSheet`:

```js
import { Embedodon, EmbedodonElement } from 'https://cdn.jsdelivr.net/npm/embedodon@1/dist/index.js'
customElements.define('embed-odon', EmbedodonElement)
const styleSheet = new CSSStyleSheet()
styleSheet.replaceSync(`
  a {
    text-decoration-style: wavy;
  }
`)
for (const el of document.querySelectorAll('embed-odon')) {
  el.shadowRoot.adoptedStyleSheets = [Embedodon.baseStyleSheet, styleSheet]
}
```

### call `Embedodon#render` directly ###

If you would like full control of styling the DOM elements rendered by `Embedodon`, you can forego `EmbedodonElement` and inject the results of calling the `render` method directly into your DOM:

```js
const container = document.getElementById('embedodon-container')
const embedodon = new Embedodon(username)
await embedodon.refresh()
container.append(...embedodon.render())
```
