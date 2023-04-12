export function css(strings: TemplateStringsArray, ...values: any[]) {
  const style = new CSSStyleSheet()
  style.replaceSync(String.raw({ raw: strings }, ...values))
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
