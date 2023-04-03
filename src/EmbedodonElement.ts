import { Embedodon } from "./Embedodon"

export class EmbedodonElement extends HTMLElement {
  readonly embedodon: Embedodon
  private root: ShadowRoot

  constructor() {
    super()
    const username = this.getAttribute('username')
    if (!username) throw new Error("username attribute must be specified on <Embedodon>")

    this.embedodon = new Embedodon(username)
    this.root = this.attachShadow({ mode: 'open' })
    this.refresh()
  }

  async refresh() {
    this.root.innerHTML = 'loading…'
    await this.embedodon.refresh()
    this.root.append(...this.embedodon.render())
  }
}
