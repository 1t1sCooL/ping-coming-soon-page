import generate from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import fs from 'fs';
import * as nodePath from 'path';
import { parseFile } from './astUtils.js';
import { loadConfig } from './config.js';
import { getAllFiles } from './fileScan.js';
import { log, success, warn } from './logger.js';
import { loadTestIdMap, saveTestIdMap } from './utils.js';
import { traverseJSXInFunction, traverseAndAddTestIds, removeTestIdsFromJSXElement } from './traverse.js';

//
// ──────────────────────────────── ЗАПУСК ──────────────────────────────
//

const run = async () => {
  const args = process.argv.slice(2)
  const isRemoveMode = args.includes('--remove')
  const isHelp = args.includes('--help') || args.includes('-h')

  if (isHelp) {
    console.warn(`
      🧪 Auto TestID Manager

      Использование:
        node script.js                 → Добавляет data-testid (по умолчанию)
        node script.js --remove        → Удаляет data-testid
        node script.js --help          → Эта справка

      Опции:
        --remove     Удаляет все data-testid из подходящих элементов
        --help, -h   Показать эту справку
    `)

    process.exit(0)
  }

  const config = await loadConfig()
  const root = config.srcPath

  if (!fs.existsSync(root)) {
    warn(`Папка srcPath не найдена: ${root}`)
    process.exit(1)
  }

  log('Запуск сканирования...')

  const files = getAllFiles(root, config.includeExtensions, config.ignorePaths)

  let modifiedFiles = 0
  const totalElementsRef = { current: 0 }
  const addedTestIds = []
  const testIdMap = config.preserveIds ? loadTestIdMap() : {}
  const newMap = { ...testIdMap }

  for (const filePath of files) {
    const relativePath = nodePath.relative(process.cwd(), filePath)

    try {
      const code = fs.readFileSync(filePath, 'utf8')
      const ast = parseFile(code)
      let fileModified = false
      let removedCountInFile = 0;

      if (isRemoveMode) {
        traverse.default(ast, {
          JSXElement: (path) => {
            const removed = removeTestIdsFromJSXElement(path);
            if (removed > 0) {
              fileModified = true;
              removedCountInFile += removed;
              totalElementsRef.current += removed;
            }
          },
        });
      } else {
        traverse.default(ast, {
          JSXElement: (path) => {
            const before = totalElementsRef.current
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
            if (totalElementsRef.current > before) fileModified = true
          },
          CallExpression: (path) => {
            const { node } = path
            if (
              t.isMemberExpression(node.callee) &&
              t.isIdentifier(node.callee.property) &&
              ['map', 'filter', 'forEach'].includes(node.callee.property.name) &&
              node.arguments.length > 0
            ) {
              const fn = node.arguments[0]
              if (t.isArrowFunctionExpression(fn) || t.isFunctionExpression(fn)) {
                traverseJSXInFunction(
                  path.get('arguments.0'),
                  config,
                  filePath,
                  root,
                  testIdMap,
                  newMap,
                  addedTestIds,
                  totalElementsRef
                )
              }
            }
          },
          ArrowFunctionExpression: (path) => {
            if (
              t.isJSXElement(path.node.body) ||
              t.isJSXFragment(path.node.body)
            ) {
              traverseJSXInFunction(
                path,
                config,
                filePath,
                root,
                testIdMap,
                newMap,
                addedTestIds,
                totalElementsRef
              )
            }
          },
        })
      }

      if (fileModified) {
        const output = generate.default(ast, {
          jsescOption: { minimal: true },
        }).code;
        if (!config.dryRun) fs.writeFileSync(filePath, output, 'utf8');
        modifiedFiles++;
        if (config.verbose) log(`📝 Обновлён: ${relativePath}`);

        if (isRemoveMode && config.verbose) {
          log(`🗑️ Удалено data-testid: ${removedCountInFile} в ${relativePath}`);
        }
      }

    } catch (err) {
      warn(`Ошибка при обработке ${relativePath}:`, err.message)
    }

  }

  const totalElements = totalElementsRef.current
  if (config.preserveIds) saveTestIdMap(newMap)

  success(`\n✨ Готово!`)
  if (isRemoveMode) {
    success(`Удалено атрибутов data-testid: ${totalElements}`)
  } else {
    success(`Добавлено элементов: ${totalElements}`)
  }
  success(`Изменено файлов: ${modifiedFiles}`)

  if (config.dryRun) log(`⚠️ Режим: dryRun — изменения не применены.`)

  if (config.logToFile) {
    if (totalElements > 0 && config.verbose) {
      console.warn('📋 Добавленные data-testid:')
      console.warn(
        addedTestIds
          .map(
            ({ testId, file, element, text }) =>
              `  ${testId} → ${file} <${element}>${text ? ` ("${text}")` : ''}`
          )
          .join('\n')
      )
    }

    const logContent = [
      `# Список добавленных data-testid`,
      `Время: ${new Date().toISOString()}`,
      `Всего: ${totalElements}`,
      ``,
      addedTestIds
        .map((i) => `- \`${i.testId}\` → ${i.file} <${i.element}>`)
        .join('\n'),
    ].join('\n')

    fs.writeFileSync('testids-generated.log', logContent, 'utf8')
    log(`📄 Лог сохранён в testids-generated.log`)
  }
}

run().catch((err) => {
  console.error('❌ Ошибка выполнения скрипта:', err)
  process.exit(1)
})
