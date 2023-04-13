import { describe, expect, test } from '@jest/globals'
import { enableFetchMocks } from 'jest-fetch-mock'
import { Embedodon, Status } from '../src/Embedodon.js'

describe('Embedodon', () => {
  test('constructor parses usernames correctly', () => {
    let e = new Embedodon('@me@server.social')
    expect(e.username).toBe('@me@server.social')

    e = new Embedodon('me@server.social')
    expect(e.username).toBe('@me@server.social')

    expect(() => new Embedodon('me@server')).toThrow()
    expect(() => new Embedodon('@me')).toThrow()
    expect(() => new Embedodon('server.social')).toThrow()
  })

  test('empty render', () => {
    const e = new Embedodon('@me@server.social')
    const elems = e.render()
    expect(elems).toHaveLength(1)
    expect(elems[0].tagName).toBe('FOOTER')
  })

  test('full render', async () => {
    enableFetchMocks()
    fetchMock.mockResponse(async req => {
      if (req.url.includes('/lookup?')) {
        return '{"id":42}'
      } else if (req.url.includes('/statuses?')) {
        const mockStatuses: Status[] = [
          {
            id: '1',
            created_at: '2023-01-01T12:05:10Z',
            url: 'http://example.com/123',
            content: '<p>hello <i>world</i></p>',
            media_attachments: []
          },
          {
            id: '2',
            created_at: '2023-03-02T23:12:55Z',
            url: 'http://example.com/456',
            media_attachments: [{
              id: '3',
              type: 'image',
              preview_url: 'http://example.com/3.jpg',
              url: 'http://example.com/3.png'
            }]
          },
        ]
        return JSON.stringify(mockStatuses)
      }
      throw new Error(`unexpected request ${req}`)
    })
    const e = new Embedodon('@me@server.social')
    await e.refresh()
    const elems = e.render()
    expect(elems).toHaveLength(3)
    expect(elems[0].tagName).toBe('ARTICLE')
    expect(elems[0].textContent).toContain('hello world')
    expect(elems[1].tagName).toBe('ARTICLE')
    expect(elems[2].tagName).toBe('FOOTER')
  })
})
