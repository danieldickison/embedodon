import { taggedCss as css } from "./TaggedCss.js"

const USER_REGEX = /^@?([^\s@]+)@(\S+\.\S+)$/

export class Embedodon {
  static standardStyle = css`
    * {
      box-sizing: border-box;
    }
    
    article {
      border: solid 1px rgba(0, 0, 0, 0.25);
      padding: 1rem;
      margin: 1rem;
      font-family: sans-serif;
      color: #333;
      background: #fff;
      overflow: hidden;
    }
    a {
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    
    .media img {
      max-width: 100%;
    }
    .media a {
      display: inline-block;
    }
    .media a:hover {
      outline: solid 2px rgba(0, 128, 255, 0.25);
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
    readonly options: Options = {
      statusesPerPage: 10
    }
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
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/activity+json'
      },
      mode: 'cors',
      credentials: 'omit'
    })
    return await res.json()
  }

  async refresh() {
    const userData = await this.#fetchPublicEndpoint(this.#serverUrl(`/api/v1/accounts/lookup?acct=${this.user}`))
    console.log(userData)

    const userId = encodeURIComponent(userData.id)
    this.statuses.splice(0, this.statuses.length,
      ...await this.#fetchPublicEndpoint(
        this.#serverUrl(`/api/v1/accounts/${userId}/statuses?exclude_replies=true&exclude_reblogs=true&limit=${this.options.statusesPerPage}`)
      )
    )
    console.log(this.statuses)
  }

  /** returns an array of <article> element with the toots */
  render() {
    return this.statuses.map(status => {
      const article = document.createElement('article')

      const ts = document.createElement('time')
      ts.dateTime = status.created_at
      const tsA = document.createElement('a')
      tsA.href = status.url
      tsA.innerText = this.dateTimeFormat.format(new Date(status.created_at))
      ts.append(tsA)

      const content = document.createElement('div')
      content.classList.add('content')
      content.innerHTML = status.content || '(no content)'

      const media = document.createElement('div')
      media.classList.add('media')
      for (const attachment of status.media_attachments) {
        if (attachment.type !== 'image' || !attachment.preview_url) {
          continue
        }

        const img = new Image()
        img.src = attachment.preview_url as string
        img.alt = attachment.description || ''

        const a = document.createElement('a')
        a.href = attachment.url || '#'
        a.append(img)

        media.append(a)
      }
      article.append(ts, content, media)

      return article
    })
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
  type: 'image' // | 'video' | ...
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
  statusesPerPage: number
}
