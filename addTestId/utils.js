import * as t from '@babel/types';
import fs from 'fs';
import * as nodePath from 'path';
import { createHash } from 'crypto';
import { log, warn } from './logger.js';

export const createTemplateLiteralFromParts = (parts) => {
  if (parts.length === 0) return t.stringLiteral('')

  const quasis = []
  const expressions = []

  parts.forEach((part, i) => {
    if (typeof part === 'string') {
      quasis.push(
        t.templateElement({ raw: part, cooked: part }, i === parts.length - 1)
      )
    } else {
      expressions.push(part)
    }
  })

  return t.templateLiteral(quasis, expressions)
}

export const getJSXTagName = (node) => {
  if (t.isJSXIdentifier(node)) return node.name
  if (t.isJSXMemberExpression(node))
    return `${getJSXTagName(node.object)}.${getJSXTagName(node.property)}`
  return null
}

export const createMemberExpressionFromString = (str) =>
  str
    .split('.')
    .reduce(
      (expr, part, i) =>
        i === 0
          ? t.identifier(part)
          : t.memberExpression(expr, t.identifier(part)),
      null
    )

export const loadTestIdMap = () => {
  try {
    if (fs.existsSync('testids-map.json')) {
      return JSON.parse(fs.readFileSync('testids-map.json', 'utf8'))
    }
  } catch (e) {
    warn('Не удалось загрузить testids-map.json:', e.message)
  }
  return {}
}

export const saveTestIdMap = (map) => {
  try {
    fs.writeFileSync('testids-map.json', JSON.stringify(map, null, 2), 'utf8')
    log('💾 Маппинг testId сохранён в testids-map.json')
  } catch (e) {
    warn('Не удалось сохранить testids-map.json:', e.message)
  }
}

export const generateElementKey = (
  filePath,
  tagName,
  text,
  openingElement,
  srcPath
) => {
  const propsSignature = openingElement.attributes
    .filter((attr) => t.isJSXAttribute(attr))
    .map((attr) => {
      const name = attr.name?.name
      if (
        ![
          'onClick',
          'href',
          'role',
          'type',
          'aria-label',
          'className',
        ].includes(name)
      )
        return null

      const value = attr.value
      if (t.isStringLiteral(value)) return `${name}="${value.value}"`
      if (t.isJSXExpressionContainer(value)) return `${name}={...}`
      return `${name}=true`
    })
    .filter(Boolean)

  const relativeToSrc = nodePath.relative(srcPath, filePath).replace(/\\/g, '/')

  if (relativeToSrc.startsWith('..') || nodePath.isAbsolute(relativeToSrc)) {
    return createHash('sha256')
      .update(
        `external|${filePath}|${tagName}|${text}|${propsSignature
          .sort()
          .join('|')}`
      )
      .digest('hex')
      .substring(0, 16)
  }

  return createHash('sha256')
    .update(
      [
        relativeToSrc,
        tagName,
        text.trim().substring(0, 100),
        ...propsSignature.sort(),
      ].join('|')
    )
    .digest('hex')
    .substring(0, 16)
}