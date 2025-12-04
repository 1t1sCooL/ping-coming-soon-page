import fs from 'fs'
import path from 'path'

const DEFAULT_CONFIG = {
  srcPath: 'src',
  includeExtensions: ['.jsx', '.tsx', '.js', '.ts'],
  ignorePaths: ['node_modules', '.git'],
  ignoredComponents: [],
  dryRun: false,
  verbose: true,
  logToFile: false,
  preserveIds: true,
  prefix: '',
  maxPathParts: 2,
  ignored: ['React.Fragment', 'Fragment', 'R.F'],
}

export async function loadConfig() {
  const configPath = 'testid.config.js'
  let userConfig = {}

  if (fs.existsSync(configPath)) {
    try {
      userConfig = (await import(path.resolve(configPath))).default || {}
    } catch (e) {
      console.warn('⚠️ Ошибка загрузки конфига:', e.message)
    }
  }

  const config = { ...DEFAULT_CONFIG, ...userConfig }

  if (typeof config.srcPath !== 'string' || config.srcPath.trim() === '') {
    console.error(
      '❌ Ошибка конфигурации: `srcPath` должен быть непустой строкой.'
    )
    process.exit(1)
  }

  if (
    !Array.isArray(config.includeExtensions) ||
    !config.includeExtensions.every((ext) => typeof ext === 'string')
  ) {
    console.error(
      '❌ Ошибка конфигурации: `includeExtensions` должен быть массивом строк.'
    )
    process.exit(1)
  }

  if (
    !Array.isArray(config.ignorePaths) ||
    !config.ignorePaths.every((p) => typeof p === 'string')
  ) {
    console.error(
      '❌ Ошибка конфигурации: `ignorePaths` должен быть массивом строк.'
    )
    process.exit(1)
  }

  if (
    !Array.isArray(config.ignoredComponents) ||
    !config.ignoredComponents.every((c) => typeof c === 'string')
  ) {
    console.error(
      '❌ Ошибка конфигурации: `ignoredComponents` должен быть массивом строк.'
    )
    process.exit(1)
  }

  if (typeof config.dryRun !== 'boolean') {
    console.error(
      '❌ Ошибка конфигурации: `dryRun` должен быть булевым значением.'
    )
    process.exit(1)
  }

  if (typeof config.verbose !== 'boolean') {
    console.error(
      '❌ Ошибка конфигурации: `verbose` должен быть булевым значением.'
    )
    process.exit(1)
  }

  if (typeof config.logToFile !== 'boolean') {
    console.error(
      '❌ Ошибка конфигурации: `logToFile` должен быть булевым значением.'
    )
    process.exit(1)
  }

  if (typeof config.preserveIds !== 'boolean') {
    console.error(
      '❌ Ошибка конфигурации: `preserveIds` должен быть булевым значением.'
    )
    process.exit(1)
  }

  if (typeof config.prefix !== 'string') {
    console.error('❌ Ошибка конфигурации: `prefix` должен быть строкой.')
    process.exit(1)
  }

  if (
    typeof config.maxPathParts !== 'number' ||
    !Number.isInteger(config.maxPathParts) ||
    config.maxPathParts < 1
  ) {
    console.error(
      '❌ Ошибка конфигурации: `maxPathParts` должен быть целым числом >= 1.'
    )
    process.exit(1)
  }

  return config
}
