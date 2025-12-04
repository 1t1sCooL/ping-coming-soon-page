import generate from '@babel/generator';

export const filePathToContext = (filePath, fromDir, maxPathParts = 0) => {
    const relativePath = filePath
        .replace(new RegExp(`^.+/${fromDir}/`), '')
        .replace(/^[^/\\]+[/\\]/, '')
        .replace(/\.(jsx?|tsx?)$/, '');

    const parts = relativePath.split(/[/\\]+/);
    const selectedParts = parts.slice(-(Number(maxPathParts)));

    return selectedParts
        .join('-')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()
        .replace(/^-+|-+$/g, '');
};

export const getTextFromChildren = (parent) => {
    if (!parent?.children) return null;
    for (const child of parent.children) {
        if (child.type === 'JSXText') {
            const text = child.value.trim();
            if (text) return text;
        }
    }
    return null;
};

const normalizeTag = (tagName) => {
    const map = {
        button: 'btn',
        a: 'link',
        input: null,
        textarea: 'textarea',
        div: 'element',
        span: 'element',
        li: 'item',
        tr: 'row',
        th: 'header',
    };
    return map[tagName.toLowerCase()] || null;
};

const globalContextCounter = new Map();

const ensureUnique = (baseId, context, config, contextCounter = globalContextCounter) => {
    if (!contextCounter.has(context)) {
        contextCounter.set(context, new Map());
    }
    const counterMap = contextCounter.get(context);
    const currentCount = counterMap.get(baseId) || 0;
    const uniqueId = currentCount === 0 ? baseId : `${baseId}-${currentCount + 1}`;
    counterMap.set(baseId, currentCount + 1);
    return config.prefix ? `${config.prefix}-${uniqueId}` : uniqueId;
};

const extractDynamicKey = (openingElement) => {
    const keyAttr = openingElement.attributes?.find(
        (attr) => attr?.name?.name === 'key'
    );
    if (!keyAttr || !keyAttr.value) return null;

    if (keyAttr.value.type === 'JSXExpressionContainer') {
        const expr = keyAttr.value.expression;
        if (!expr) return null;
        const {code} = generate.default(expr, {compact: true});
        return code.replace(/\s+/g, '');
    }
    return null;
};

export const generateTestId = (tagName, openingElement, filePath, config) => {
    const context = filePathToContext(filePath, config.srcPath, config.maxPathParts);
    const tagPart = normalizeTag(tagName);

    const fallbackTag = tagPart || tagName.toLowerCase();
    const baseId = `${context}-${fallbackTag}`;


    const dynamicKey = extractDynamicKey(openingElement);
    if (dynamicKey) {
        const finalId = `${baseId}-\${${dynamicKey}}`;
        return ensureUnique(finalId, context, config, globalContextCounter);
    }

    return ensureUnique(baseId, context, config, globalContextCounter);
};
