import * as t from '@babel/types';
import * as nodePath from 'path';
import { generateTestId, getTextFromChildren } from './idGenerator.js';
import { isEligibleForTestId, isInteractiveElement } from './astUtils.js';
import {
  createTemplateLiteralFromParts,
  createMemberExpressionFromString,
  generateElementKey,
  getJSXTagName
} from './utils.js';

export const traverseJSXInFunction = (
  functionPath,
  config,
  filePath,
  root,
  testIdMap,
  newMap,
  addedTestIds,
  totalElementsRef
) => {
  functionPath.traverse({
    JSXElement: (path) => {
      traverseAndAddTestIds(
        path,
        config,
        filePath,
        root,
        testIdMap,
        newMap,
        addedTestIds,
        totalElementsRef
      )
    },
  })
}

export const traverseAndAddTestIds = (
  path,
  config,
  filePath,
  root,
  testIdMap,
  newMap,
  addedTestIds,
  totalElementsRef
) => {
  const { node } = path
  const openingElement = node.openingElement
  const tagName = getJSXTagName(openingElement.name)

  if (!tagName) return
  if (!isEligibleForTestId(openingElement, config)) return
  if (!isInteractiveElement(openingElement, tagName, config)) return

  if (
    openingElement.attributes.some(
      (attr) => t.isJSXAttribute(attr) && attr.name?.name === 'data-testid'
    )
  )
    return

  const text = getTextFromChildren(node) || ''
  const elementKey = generateElementKey(
    filePath,
    tagName,
    text,
    openingElement,
    root
  )

  let testId
  let isTemplate = false

  if (config.preserveIds && testIdMap[elementKey]) {
    testId = testIdMap[elementKey]
    isTemplate = /\$\{.+?}/.test(testId)
  } else {
    testId = generateTestId(tagName, openingElement, filePath, config)
    isTemplate = /\$\{.+?}/.test(testId)
    if (config.preserveIds) newMap[elementKey] = testId
  }

  const testIdAttr = isTemplate
    ? t.jsxAttribute(
      t.jsxIdentifier('data-testid'),
      t.jsxExpressionContainer(
        t.templateLiteral(
          [
            t.templateElement({
              raw: testId.split('-${')[0] + '-',
              cooked: testId.split('-${')[0] + '-',
            }),
            t.templateElement({ raw: '', cooked: '' }),
          ],
          [
            createMemberExpressionFromString(
              /\$\{(.+?)}/.exec(testId)?.[1]?.trim() ?? 'unknown'
            ),
          ]
        )
      )
    )
    : t.jsxAttribute(t.jsxIdentifier('data-testid'), t.stringLiteral(testId))

  openingElement.attributes.push(testIdAttr)

  addedTestIds.push({
    testId,
    file: nodePath.relative(process.cwd(), filePath),
    element: tagName,
    text: text.trim().substring(0, 50),
    key: elementKey,
  })

  totalElementsRef.current += 1

  const hasDynamicKey = openingElement.attributes.some(
    (attr) =>
      t.isJSXAttribute(attr) &&
      attr.name?.name === 'key' &&
      t.isJSXExpressionContainer(attr.value)
  )

  if (!hasDynamicKey) return

  const tagCounters = {}

  path.traverse({
    JSXElement: (childPath) => {
      const childOpeningElement = childPath.node.openingElement
      const childTagName = getJSXTagName(childOpeningElement.name)

      if (!childTagName) return
      if (!isEligibleForTestId(childOpeningElement, config)) return
      if (!isInteractiveElement(childOpeningElement, childTagName, config))
        return

      if (
        childOpeningElement.attributes.some(
          (attr) => t.isJSXAttribute(attr) && attr.name?.name === 'data-testid'
        )
      )
        return

      const childText = getTextFromChildren(childPath.node) || ''
      const childElementKey = generateElementKey(
        filePath,
        childTagName,
        childText,
        childOpeningElement,
        root
      )

      let childBaseId = childTagName.toLowerCase()
      tagCounters[childTagName] = (tagCounters[childTagName] || 0) + 1
      if (tagCounters[childTagName] > 1)
        childBaseId += `-${tagCounters[childTagName]}`

      const exprStr = isTemplate
        ? /\$\{(.+?)}/.exec(testId)?.[1]?.trim() ?? 'unknown'
        : 'unknown'

      const templateLiteral = createTemplateLiteralFromParts([
        'item-',
        createMemberExpressionFromString(exprStr),
        `-${childBaseId}`,
      ])

      childOpeningElement.attributes.push(
        t.jsxAttribute(
          t.jsxIdentifier('data-testid'),
          t.jsxExpressionContainer(templateLiteral)
        )
      )

      addedTestIds.push({
        testId: `item-${exprStr}-${childBaseId}`,
        file: nodePath.relative(process.cwd(), filePath),
        element: childTagName,
        text: childText.trim().substring(0, 50),
        key: childElementKey,
      })

      totalElementsRef.current += 1
    },
  })
}
export const removeTestIdsFromJSXElement = (path) => {
  const { node } = path;

  if (!node.openingElement || !node.openingElement.attributes) return 0;

  let removedCount = 0;

  node.openingElement.attributes = node.openingElement.attributes.filter(attr => {
    if (
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name) &&
      /^data-?test-?id$/i.test(attr.name.name)
    ) {
      removedCount++;
      return false;
    }
    return true;
  });

  return removedCount;
};
