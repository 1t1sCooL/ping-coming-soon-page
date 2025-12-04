// scripts/logger.js

export function log(...args) {
    console.warn('[TestID]', ...args);
}

export function warn(...args) {
    console.error('[TestID ⚠️]', ...args);
}

export function success(...args) {
    console.warn('\x1b[32m[TestID ✅]\x1b[0m', ...args);
}