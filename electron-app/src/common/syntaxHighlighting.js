/*
  ==============================================================================
  File        : syntaxHighlighting.js
  Version     : 1.0
  Description : JavaScript file to highlight syntax to the editor in A++ IDE
  Author      : Arthur
  Created     : 2025-07-27
  Last Update : 2025-09-20
  ==============================================================================
*/
function syntax_highlighting(user_settings = {}) {
    var_const_list = [];
    const PREVIEW = document.getElementById('code-editor');
    let CODES_LINES = Array.from(PREVIEW.querySelectorAll('.code-line'));
    if (!CODES_LINES.length) {
        CODES_LINES = [PREVIEW];
    }
    let inMultiLineComment = false;

    if (user_settings?.preferences && user_settings.preferences.syntaxHighlighting === false) {
        for (const CODE_LINE of CODES_LINES) {
            CODE_LINE.innerText = CODE_LINE.textContent;
        }
        return;
    }

    for (const CODE_LINE of CODES_LINES) {
        let code = CODE_LINE.innerText;

        if (CODE_LINE.isContentEditable) {
            let selection = window.getSelection();
            let range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            let cursorOffset = null;
            if (range) {
                let preRange = range.cloneRange();
                preRange.selectNodeContents(CODE_LINE);
                preRange.setEnd(range.endContainer, range.endOffset);
                cursorOffset = preRange.toString().length;
            }

            let colorized = code;
            const PLACEHOLDERS = [];
            const protect = (_className) => {
                return (_match) => {
                    const TOKEN = `__${_className.toUpperCase()}_${PLACEHOLDERS.length}__`;
                    PLACEHOLDERS.push({
                        token: TOKEN,
                        html: `<span class='${_className}'>${_match}</span>`
                    });
                    return TOKEN;
                };
            };
            colorized = colorized
                .replace(/\/\/.*$/g, protect('hl-comment'))
                .replace(/([''])(?:(?!\1)[^\\]|\\.)*\1/g, protect('hl-string'));
            const PATTERNS = [
                { 
                    regex: /\b(let|const)\s+(int|float|bool|str|None)\s+([a-zA-Z_$][\w$]*)/g,
                    replaceFn: (_match, _decl, _type, _name) => {
                        const DECL_SPAN = `<span class='hl-keyword'>${_decl}</span>`;
                        const TYPE_SPAN = `<span class='hl-native-type'>${_type}</span>`;
                        const NAME_CLASS = _decl === 'const' ? 'hl-constant' : 'hl-variable';
                        const NAME_SPAN = `<span class='${NAME_CLASS}'>${_name}</span>`;
                        var_const_list.push([_name, NAME_CLASS]);
                        return `${DECL_SPAN} ${TYPE_SPAN} ${NAME_SPAN}`;
                    }
                },
                { regex: /\b[a-zA-Z_$][\w$]*\s*\([^)]*\)\s*{/g, className: 'hl-function-method' },
                { regex: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, className: 'hl-function-call' },
                { regex: /\bimport\s+(?:[\w*{}\s,]+\s+from\s+)?[''][^'']+['']/g, className: 'hl-import' },
                { regex: /\btrue|false|null|\d+(\.\d+)?\b/g, className: 'hl-literal' },
                { regex: /\b(const|let|if|else\s+if|else|for|while|return|switch|case|break|default|try|catch|finally|fn|as|from|import)\b/g, className: 'hl-keyword' },
                { regex: /\b(int|float|bool|str|None)\b/g, className: 'hl-native-type' },
                { regex: /\b(if|else if|else|for|while|do|switch|case|default|break|continue|return|try|catch|finally)\b/g, className: 'hl-control-structure' }
            ];
            for (const PATTERN of PATTERNS) {
                if (PATTERN.replaceFn) {
                    colorized = colorized.replace(PATTERN.regex, PATTERN.replaceFn);
                } else {
                    colorized = colorized.replace(PATTERN.regex, (match) => `<span class='${PATTERN.className}'>${match}</span>`);
                }
            }
            for (const { token, html } of PLACEHOLDERS) {
                colorized = colorized.replace(token, html);
            }
            for (const VAR_NAME of var_const_list) {
                const REGEX = new RegExp(`\\b${VAR_NAME[0]}\\b`, 'g');
                colorized = colorized.replace(REGEX, `<span class='${VAR_NAME[1]}'>${VAR_NAME[0]}</span>`);
            }
            CODE_LINE.innerHTML = colorized;

            if (cursorOffset !== null) {
                let node = CODE_LINE;
                let offset = cursorOffset;
                let found = false;
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let currentNode = walker.nextNode();
                while (currentNode) {
                    if (offset <= currentNode.length) {
                        let sel = window.getSelection();
                        let range = document.createRange();
                        range.setStart(currentNode, offset);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        found = true;
                        break;
                    } else {
                        offset -= currentNode.length;
                    }
                    currentNode = walker.nextNode();
                }
                if (!found) {
                    let sel = window.getSelection();
                    let range = document.createRange();
                    range.selectNodeContents(node);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
            continue;
        }

        if (inMultiLineComment) {
            const END_INDEX = code.indexOf('*/');
            if (END_INDEX !== -1) {
                const BEFORE = code.slice(0, END_INDEX + 2);
                const AFTER = code.slice(END_INDEX + 2);
                CODE_LINE.innerHTML = `<span class='hl-comment'>${BEFORE}</span>${AFTER}`;
                inMultiLineComment = false;
            } else {
                CODE_LINE.innerHTML = `<span class='hl-comment'>${code}</span>`;
            }
            continue;
        } else {
            const START_INDEX = code.indexOf('/*');
            if (START_INDEX !== -1) {
                const END_INDEX = code.indexOf('*/', START_INDEX + 2);
                if (END_INDEX !== -1) {
                    const BEFORE = code.slice(0, START_INDEX);
                    const COMMENT = code.slice(START_INDEX, END_INDEX + 2);
                    const AFTER = code.slice(END_INDEX + 2);

                    code = BEFORE
                        + `<span class='hl-comment'>${COMMENT}</span>`
                        + AFTER;
                } else {
                    const BEFORE = code.slice(0, START_INDEX);
                    const COMMENT = code.slice(START_INDEX);

                    CODE_LINE.innerHTML = BEFORE
                        + `<span class='hl-comment'>${COMMENT}</span>`;
                    inMultiLineComment = true;
                    continue;
                }
            } else {
                const PLACEHOLDERS = [];
                const protect = (_className) => {
                    return (_match) => {
                        const TOKEN = `__${_className.toUpperCase()}_${PLACEHOLDERS.length}__`;
                        PLACEHOLDERS.push({
                            token: TOKEN,
                            html: `<span class='${_className}'>${_match}</span>`
                        });
                        return TOKEN;
                    };
                };

                code = code
                    .replace(/\/\/.*$/g, protect('hl-comment'))
                    .replace(/([''])(?:(?!\1)[^\\]|\\.)*\1/g, protect('hl-string'));

                const PATTERNS = [
                    { 
                        regex: /\b(let|const)\s+(int|float|bool|str|None)\s+([a-zA-Z_$][\w$]*)/g,
                        replaceFn: (_match, _decl, _type, _name) => {
                            const DECL_SPAN = `<span class='hl-keyword'>${_decl}</span>`;
                            const TYPE_SPAN = `<span class='hl-native-type'>${_type}</span>`;
                            const NAME_CLASS = _decl === 'const' ? 'hl-constant' : 'hl-variable';
                            const NAME_SPAN = `<span class='${NAME_CLASS}'>${_name}</span>`;
                            var_const_list.push([_name, NAME_CLASS]);
                            return `${DECL_SPAN} ${TYPE_SPAN} ${NAME_SPAN}`;
                        }
                    },
                    { regex: /\b[a-zA-Z_$][\w$]*\s*\([^)]*\)\s*{/g, className: 'hl-function-method' },
                    { regex: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, className: 'hl-function-call' },
                    { regex: /\bimport\s+(?:[\w*{}\s,]+\s+from\s+)?[''][^'']+['']/g, className: 'hl-import' },
                    { regex: /\btrue|false|null|\d+(\.\d+)?\b/g, className: 'hl-literal' },
                    { regex: /\b(const|let|if|else\s+if|else|for|while|return|switch|case|break|default|try|catch|finally|fn|as|from|import)\b/g, className: 'hl-keyword' },
                    { regex: /\b(int|float|bool|str|None)\b/g, className: 'hl-native-type' },
                    { regex: /\b(if|else if|else|for|while|do|switch|case|default|break|continue|return|try|catch|finally)\b/g, className: 'hl-control-structure' }
                ];
                for (const PATTERN of PATTERNS) {
                    if (PATTERN.replaceFn) {
                        code = code.replace(PATTERN.regex, PATTERN.replaceFn);
                    } else {
                        code = code.replace(PATTERN.regex, (match) => `<span class='${PATTERN.className}'>${match}</span>`);
                    }
                }
                for (const { token, html } of PLACEHOLDERS) {
                    code = code.replace(token, html);
                }
                for (const VAR_NAME of var_const_list) {
                    const REGEX = new RegExp(`\\b${VAR_NAME[0]}\\b`, 'g');
                    code = code.replace(REGEX, `<span class='${VAR_NAME[1]}'>${VAR_NAME[0]}</span>`);
                }
                CODE_LINE.innerHTML = code;
            }
        }
    }
}

module.exports = { syntax_highlighting };