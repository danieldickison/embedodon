# embedodon
Simple js to render a Mastodon user’s public toots.

Live example here: https://danieldickison.github.io/embedodon/

## simple example ##

```html
<script type="module">
  import { EmbedodonElement } from 'https://unpkg.com/embedodon@1.0.0-beta.0/dist/index.js'
  customElements.define('embed-odon', EmbedodonElement)
</script>
<embed-odon username="@dand@mastodonmusic.social"></embed-odon>
```

Note that custom element names must contain a hyphen.

## customize styles ##

Styles can be customized by setting the [adoptedStyleSheets](http://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets) property of the `EmbedodonElement#shadowRoot`. The standard stylesheet can optionally be accessed with `Embedodon.standardStyle` to include in the `adoptedStyleSheets`:

```js
import { Embedodon, EmbedodonElement } from 'https://unpkg.com/embedodon@1.0.0-beta.0/dist/index.js'
customElements.define('embedodon-example', EmbedodonElement)
const styleSheet = new CSSStyleSheet()
styleSheet.replaceSync(`
  article {
    font-family: Source Code Variable, ui-monospace, monospace;
  }
`)
for (const el of document.querySelectorAll('embed-odon')) {
  el.shadowRoot.adoptedStyleSheets = [Embedodon.standardStyle, styleSheet]
}
```
