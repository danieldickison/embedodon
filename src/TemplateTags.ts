export function css(strings: TemplateStringsArray, ...values: any[]) {
  const style = new CSSStyleSheet()
  const css = String.raw({ raw: strings }, ...values)
  if (style.replaceSync) {
    style.replaceSync(css)
  } else {
    // crude lexical splitting of rules; will break with nested at-rules or random "}" that doesn't end a rule
    const parts = css.split(/(\})\s*([^\s}])/)
    for (let i = -1; i < parts.length; i += 3) {
      const rule = `${parts[i] || ''}${parts[i + 1]}${parts[i + 2] || ''}`
      // console.log(`insertRule ${rule}`)
      style.insertRule(rule)
    }
  }
  return style
}

export function html(strings: TemplateStringsArray, ...values: any[]) {
  return String.raw({ raw: strings }, ...values.map(escapeHtml))
}

export function rawHtml(s: string) {
  return new RawHtml(s)
}

class RawHtml extends String { }

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
}
const HTML_ENTITIES_REGEX = /[&<>"']/g

export function escapeHtml(s: string | RawHtml) {
  if (!s) return ''
  else if (s instanceof RawHtml) return s
  else return s.replaceAll(HTML_ENTITIES_REGEX, c => HTML_ENTITIES[c])
}
