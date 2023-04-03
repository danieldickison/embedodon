export function taggedCss(strings: TemplateStringsArray, ...values: any[]) {
  const style = new CSSStyleSheet()
  style.replaceSync(String.raw({ raw: strings }, ...values))
  return style
}
