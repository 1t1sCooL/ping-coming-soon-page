import parser from '@babel/parser'

const INTERACTIVE_TAGS = new Set([
  'button',
  'a',
  'input',
  'textarea',
  'select',
  'option',
  'label',
  'summary',
  'details',
  'form',
  'dialog',
  'nav',
  'fieldset',
  'legend',
  'menu',
  'menuitem',
  'div',
])

const SEMANTIC_TAGS = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'header',
  'footer',
  'main',
  'section',
  'article',
  'aside',
  'img',
  'code',
  'pre',
  'blockquote',
])

const ALL_TAGS = new Set([...INTERACTIVE_TAGS, ...SEMANTIC_TAGS])

const TAG_CATEGORIES = {
  INTERACTIVE: INTERACTIVE_TAGS,
  SEMANTIC: SEMANTIC_TAGS,
  ALL: ALL_TAGS, // Теперь это точно Set, а не undefined
}

const EVENT_HANDLERS = new Set([
  'onClick',
  'onPress',
  'onTouchStart',
  'onDoubleClick',
  'onChange',
  'onSubmit',
  'onFocus',
  'onBlur',
  'onKeyDown',
  'onKeyUp',
  'onKeyPress',
])

export function parseFile(code) {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
  })
}

export function isInteractiveElement(openingElement, tagName, config) {
  const fullName = getTagName(openingElement)

  if (!TAG_CATEGORIES.ALL) {
    console.warn('⚠️ TAG_CATEGORIES.ALL не инициализирован!')
    return false
  }

  if (TAG_CATEGORIES.ALL.has(tagName)) {
    return true
  }

  if (!config.ignoredComponents.includes(fullName)) {
    return true
  }

  if (hasEventHandlers(openingElement)) {
    return true
  }

  return false
}

function hasEventHandlers(openingElement) {
  return openingElement.attributes.some(
    (attr) =>
      attr.type === 'JSXAttribute' &&
      attr.name?.type === 'JSXIdentifier' &&
      EVENT_HANDLERS.has(attr.name.name)
  )
}

function hasStaticTestId(openingElement) {
  return openingElement.attributes.some(
    (attr) => attr.type === 'JSXAttribute' && attr.name?.name === 'data-testid'
  )
}

function hasSpreadAttributes(openingElement) {
  return openingElement.attributes.some(
    (attr) => attr.type === 'JSXSpreadAttribute'
  )
}

export function isEligibleForTestId(openingElement, config) {
  const tagName = getTagName(openingElement)
  for (let ignore of config.ignored) {
    if (tagName === ignore || tagName?.endsWith?.(ignore)) {
      console.warn(`⚠️ Пропускаю добавление testId для фрагмента: ${tagName}`)
      return false
    }
  }

  return (
    !hasStaticTestId(openingElement) && !hasSpreadAttributes(openingElement)
  )
}

function getTagName(openingElement) {
  const nameNode = openingElement.name
  if (!nameNode) return null
  if (nameNode.type === 'JSXIdentifier') {
    return nameNode.name
  }
  if (nameNode.type === 'JSXMemberExpression') {
    let object = nameNode.object
    let property = nameNode.property
    const parts = [property.name]
    while (object.type === 'JSXMemberExpression') {
      parts.unshift(object.property.name)
      object = object.object
    }
    parts.unshift(object.name)
    return parts.join('.')
  }
  return null
}
