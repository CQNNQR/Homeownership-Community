function sanitizeHtml(input: string): string {
  if (!input) return ''

  const allowedTags = new Set(['span', 'b', 'strong', 'i', 'em', 'br'])
  const allowedClassPattern = /^[a-zA-Z0-9_\-\s]*$/

  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g

  return input.replace(tagPattern, (match, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase()

    if (!allowedTags.has(tag)) {
      return ''
    }

    const isClosing = match.startsWith('</')
    if (isClosing) {
      return `</${tag}>`
    }

    const classMatch = attrs.match(/class\s*=\s*"([^"]*)"/i)
    if (classMatch && !allowedClassPattern.test(classMatch[1])) {
      return ''
    }

    if (/[^a-zA-Z0-9\s\-_="]/.test(attrs.replace(/class\s*=\s*"[^"]*"/i, ''))) {
      return ''
    }

    const classAttr = classMatch ? ` class="${classMatch[1]}"` : ''
    return `<${tag}${classAttr}>`
  })
}

export { sanitizeHtml }
