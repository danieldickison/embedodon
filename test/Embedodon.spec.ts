import { describe, expect, test } from '@jest/globals'
import { Embedodon } from '../dist/Embedodon.js'

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
})
