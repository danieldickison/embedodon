import { Embedodon, Options } from "./Embedodon.js"
import { html } from "./TemplateTags.js"

export class EmbedodonElement extends HTMLElement {
  readonly embedodon: Embedodon
  private root: ShadowRoot

  constructor() {
    super()
    const username = this.getAttribute('username')
    if (!username) throw new Error("username attribute must be specified on <Embedodon>")

    const options: Options = {}
    if (this.hasAttribute('toots-per-page')) {
      options.tootsPerPage = parseInt(this.getAttribute('toots-per-page') as string)
    }
    options.debugLogging = this.hasAttribute('debug-logging')
    if (this.hasAttribute('debug-pause')) {
      options.debugPause = parseInt(this.getAttribute('debug-pause') as string)
    }

    this.embedodon = new Embedodon(username, options)
    this.root = this.attachShadow({ mode: 'open' })
    this.root.adoptedStyleSheets = [Embedodon.baseStyleSheet]
    this.refresh()
  }

  async refresh() {
    this.root.innerHTML = html`
      <progress part="progress">loading toots…</progress>
    `
    try {
      await this.embedodon.refresh()
      this.root.replaceChildren(...this.embedodon.render())
    } catch (e: any) {
      this.root.innerHTML = html`
        <p class="error">Failed to load toots (${e})</p>
      `
    }
  }
}
