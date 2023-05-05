import { css, html, rawHtml } from "./TemplateTags.js"

const USER_REGEX = /^@?([^\s@]+)@(\S+\.\S+)$/
const DEFAULT_TOOTS_PER_PAGE = 10

export class Embedodon {
  static baseStyleSheet = css`
    :host(.standard) {
      --fg: #333;
      --bg: #fff;
      --link: #13b;
      --border: solid 1px rgba(0,0,0,0.25);
    }
    @media (prefers-color-scheme: dark) {
      :host(.standard) {
        --fg: #ccc;
        --bg: #222;
        --link: #6ae;
        --border: solid 1px rgba(255,255,255,0.25);
      }
    }
    * {
      box-sizing: border-box;
    }
    
    article {
      padding: 1rem;
      margin: 1rem 0;
      overflow: hidden;
      color: var(--fg);
      background: var(--bg);
      border: var(--border);
    }
    
    a {
      color: var(--link);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    
    time {
      display: block;
    }
    
    .media {
      display: flex;
      flex-flow: row nowrap;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }
    .media > a {
      flex: 1 1;
      min-width: 0;
      display: block;
      position: relative;
    }
    .media > a:hover {
      outline: solid 2px var(--link);
    }
    .media > a > * {
      width: 100%;
    }
    
    footer {
      text-align: end;
      font-size: smaller;
    }
    
    progress {
      display: block;
      margin: 1rem auto;
    }
  `

  readonly server: string
  readonly user: string
  readonly statuses: Status[] = []
  dateTimeFormat = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  constructor(
    username: string,
    readonly options: Options = {}
  ) {
    const [_, name, server] = USER_REGEX.exec(username) || []
    if (!name || !server) {
      throw new Error('`username` must be specified as “@name@server”')
    }
    this.server = server
    this.user = name
  }

  get username() {
    return `@${this.user}@${this.server}`
  }

  #serverUrl(path: string) {
    return new URL(path, new URL(`https://${this.server}`))
  }

  async #fetchPublicEndpoint(url: URL) {
    if (this.options.debugPause) {
      await pause(this.options.debugPause)
    }
    const req = new Request(url, {
      headers: {
        'Accept': 'application/activity+json'
      },
      mode: 'cors',
      credentials: 'omit'
    })
    const res = await fetch(req)
    return await res.json()
  }

  async refresh() {
    const userData = await this.#fetchPublicEndpoint(this.#serverUrl(`/api/v1/accounts/lookup?acct=${this.user}`))
    if (this.options.debugLogging) {
      console.debug(userData)
    }

    const userId = encodeURIComponent(userData.id)
    this.statuses.splice(0, this.statuses.length,
      ...await this.#fetchPublicEndpoint(
        this.#serverUrl(`/api/v1/accounts/${userId}/statuses?exclude_replies=true&exclude_reblogs=true&limit=${this.options.tootsPerPage || DEFAULT_TOOTS_PER_PAGE}`)
      )
    )
    if (this.options.debugLogging) {
      console.debug(this.statuses)
    }
  }

  /** returns an array of <article> elements with the toots followed by a <footer> element */
  render() {
    const footer = document.createElement('footer')
    footer.innerHTML = html`
      rendered with <a href="https://github.com/danieldickison/embedodon" target="_blank">embedodon</a>
    `

    return this.statuses.map(status => {
      const article = document.createElement('article')
      article.setAttribute('part', 'toot')
      article.innerHTML = html`
        <time part="timestamp">
          <a href="${status.url}">${this.dateTimeFormat.format(new Date(status.created_at))}</a>
        </time>
        <div part="content" class="content">
          ${rawHtml(status.content || '(no content)')}
        </div>
        <div part="media" class="media">
          ${rawHtml(status.media_attachments.map(m => this.#renderMediaHtml(m)).join(''))}
        </div>
      `
      return article
    }).concat([footer])
  }

  #renderMediaHtml(attachment: MediaAttachment) {
    if (attachment.type === 'image' && attachment.preview_url) {
      return html`
        <a href="${attachment.url}">
          <img part="image" src="${attachment.preview_url}" alt="${attachment.description}">
        </a>
      `
    } else if (attachment.type === 'gifv' && attachment.preview_url && attachment.url) {
      return html`
        <a href="${attachment.url}">
          <video autoplay loop playsinline
            part="video"
            poster="${attachment.preview_url}"
            src="${attachment.url}"
          ></video>
        </a>
      `
    } else {
      return ''
    }
  }
}

export interface Status {
  id: string
  created_at: string
  url: string
  card?: Card
  content?: string
  media_attachments: MediaAttachment[]
}

export interface Card {
  url: string
  title: string
  description: String
}

export interface MediaAttachment {
  type: 'image' | 'gifv' // | 'video' | ...
  id: string
  description?: string
  url?: string
  preview_url?: string
  meta?: {
    original?: MetaMediaSize
    small?: MetaMediaSize
  }
}

export interface MetaMediaSize {
  width: number
  height: number
  size: string
  aspect: number
}

export interface Options {
  tootsPerPage?: number,
  debugPause?: number,
  debugLogging?: boolean
}

function pause(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
