import { Embedodon } from "./Embedodon.js"

export class EmbedodonElement extends HTMLElement {
  readonly embedodon: Embedodon
  private root: ShadowRoot
  private progress: HTMLProgressElement

  constructor() {
    super()
    const username = this.getAttribute('username')
    if (!username) throw new Error("username attribute must be specified on <Embedodon>")

    this.embedodon = new Embedodon(username)
    this.root = this.attachShadow({ mode: 'open' })
    this.root.adoptedStyleSheets = [Embedodon.baseStyleSheet]
    this.progress = document.createElement('progress')
    this.root.append(this.progress)
    this.refresh()
  }

  async refresh() {
    this.progress.style.display = 'block'
    try {
      await this.embedodon.refresh()
      this.root.append(...this.embedodon.render())

    } catch (e: any) {
      alert(e.toString())

    } finally {
      this.progress.style.display = 'none'
    }
  }
}
