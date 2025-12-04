import fs from 'fs';
import path from 'path';

export function getAllFiles(root, extensions, ignorePaths) {
    const files = [];

    function scan(dir) {
        for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, item.name);
            const relativePath = path.relative(process.cwd(), fullPath);

            if (ignorePaths.some(ignored => relativePath.includes(ignored))) continue;

            if (item.isDirectory()) {
                scan(fullPath);
            } else if (extensions.includes(path.extname(item.name))) {
                files.push(fullPath);
            }
        }
    }

    scan(root);
    return files;
}