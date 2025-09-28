/*
  ==============================================================================
  File        : syntaxHighlighting.js
  Version     : 1.0
  Description : JavaScript file to highlight syntax to the editor in A++ IDE
  Author      : Arthur
  Created     : 2025-07-27
  Last Update : 2025-09-28
  ==============================================================================
*/
function syntax_highlighting(user_settings = {}) {
    var_const_list = [];
    const PREVIEW = document.getElementById('code-editor');
    let CODES_LINES = Array.from(PREVIEW.querySelectorAll('.code-line'));
    if (!CODES_LINES.length) {
        CODES_LINES = [PREVIEW];
    }

    if (user_settings?.preferences && user_settings.preferences.syntaxHighlighting === false) {
        for (const CODE_LINE of CODES_LINES) {
            CODE_LINE.innerText = CODE_LINE.textContent;
        }
        return;
    }

    let inMultiLineComment = false;

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
        { regex: /\bimport\s+(?:[\w*{}\s,]+\s+from\s+)?['"][^'"]+['"]/g, className: 'hl-import' },
        { regex: /\btrue|false|null|\d+(\.\d+)?\b/g, className: 'hl-literal' },
        { regex: /\b(const|let|if|else\s+if|else|for|while|return|switch|case|break|default|try|catch|finally|fn|as|from|import)\b/g, className: 'hl-keyword' },
        { regex: /\b(int|float|bool|str|None)\b/g, className: 'hl-native-type' },
        { regex: /\b(if|else if|else|for|while|do|switch|case|default|break|continue|return|try|catch|finally)\b/g, className: 'hl-control-structure' }
    ];

    function highlightNonComment(text) {
        let result = text;
        for (const PATTERN of PATTERNS) {
            if (PATTERN.replaceFn) {
                result = result.replace(PATTERN.regex, PATTERN.replaceFn);
            } else {
                result = result.replace(PATTERN.regex, (match) => `<span class='${PATTERN.className}'>${match}</span>`);
            }
        }
        for (const VAR_NAME of var_const_list) {
            const REGEX = new RegExp(`\\b${VAR_NAME[0]}\\b`, 'g');
            result = result.replace(REGEX, `<span class='${VAR_NAME[1]}'>${VAR_NAME[0]}</span>`);
        }
        return result;
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

            let lines = code.split('\n');
            let newLines = [];
            let multiLine = inMultiLineComment;
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let html = '';
                let idx = 0;
                while (idx < line.length) {
                    if (multiLine) {
                        let endIdx = line.indexOf('*/', idx);
                        if (endIdx === -1) {
                            html += `<span class='hl-comment'>${line.slice(idx)}</span>`;
                            idx = line.length;
                        } else {
                            html += `<span class='hl-comment'>${line.slice(idx, endIdx + 2)}</span>`;
                            idx = endIdx + 2;
                            multiLine = false;
                        }
                    } else {
                        let singleIdx = line.indexOf('//', idx);
                        let multiIdx = line.indexOf('/*', idx);
                        if (singleIdx !== -1 && (multiIdx === -1 || singleIdx < multiIdx)) {
                            html += highlightNonComment(line.slice(idx, singleIdx));
                            html += `<span class='hl-comment'>${line.slice(singleIdx)}</span>`;
                            break;
                        } else if (multiIdx !== -1) {
                            html += highlightNonComment(line.slice(idx, multiIdx));
                            idx = multiIdx;
                            multiLine = true;
                        } else {
                            html += highlightNonComment(line.slice(idx));
                            break;
                        }
                    }
                }
                newLines.push(html);
            }
            CODE_LINE.innerHTML = newLines.join('<br>');
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

        let lines = code.split('\n');
        let newLines = [];
        let multiLine = inMultiLineComment;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let html = '';
            let idx = 0;
            while (idx < line.length) {
                if (multiLine) {
                    let endIdx = line.indexOf('*/', idx);
                    if (endIdx === -1) {
                        html += `<span class='hl-comment'>${line.slice(idx)}</span>`;
                        idx = line.length;
                    } else {
                        html += `<span class='hl-comment'>${line.slice(idx, endIdx + 2)}</span>`;
                        idx = endIdx + 2;
                        multiLine = false;
                    }
                } else {
                    let singleIdx = line.indexOf('//', idx);
                    let multiIdx = line.indexOf('/*', idx);
                    if (singleIdx !== -1 && (multiIdx === -1 || singleIdx < multiIdx)) {
                        html += highlightNonComment(line.slice(idx, singleIdx));
                        html += `<span class='hl-comment'>${line.slice(singleIdx)}</span>`;
                        break;
                    } else if (multiIdx !== -1) {
                        html += highlightNonComment(line.slice(idx, multiIdx));
                        idx = multiIdx;
                        multiLine = true;
                    } else {
                        html += highlightNonComment(line.slice(idx));
                        break;
                    }
                }
            }
            newLines.push(html);
        }
        CODE_LINE.innerHTML = newLines.join('<br>');
    }
}

module.exports = { syntax_highlighting };