/*
    FIle        : syntax_highlighting.js
    Version     : 1.0
    Description : Syntax highlighting script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-27
    Last Update : 2025-07-27
*/

let var_const_list = [];

function syntax_highlighting() {
    const PREVIEW = document.getElementById("code-editor");
    const CODES_LINES = Array.from(PREVIEW.querySelectorAll('.code-line'));
    let inMultiLineComment = false;

    for (const CODE_LINE of CODES_LINES) {
        let code = CODE_LINE.textContent;

        if (inMultiLineComment) {
            const END_INDEX = code.indexOf('*/');
            if (END_INDEX !== -1) {
                const BEFORE = code.slice(0, END_INDEX + 2);
                const AFTER = code.slice(END_INDEX + 2);
                CODE_LINE.innerHTML = `<span class="hl-comment">${BEFORE}</span>${AFTER}`;
                inMultiLineComment = false;
            } else {
                CODE_LINE.innerHTML = `<span class="hl-comment">${code}</span>`;
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
                        + `<span class="hl-comment">${COMMENT}</span>`
                        + AFTER;
                } else {
                    const BEFORE = code.slice(0, START_INDEX);
                    const COMMENT = code.slice(START_INDEX);

                    CODE_LINE.innerHTML = BEFORE
                        + `<span class="hl-comment">${COMMENT}</span>`;
                    inMultiLineComment = true;
                    continue;
                }
            } else {
                const PLACEHOLDERS = [];
                const protect = (className) => {
                    return (match) => {
                        const TOKEN = `__${className.toUpperCase()}_${PLACEHOLDERS.length}__`;
                        PLACEHOLDERS.push({
                            token: TOKEN,
                            html: `<span class="${className}">${match}</span>`
                        });
                        return TOKEN;
                    };
                };

                code = code
                    .replace(/\/\/.*/g, protect("hl-comment"))
                    .replace(/(["'])(?:(?!\1)[^\\]|\\.)*\1/g, protect("hl-string"));

                const PATTERNS = [
                    { 
                        regex: /\b(let|const)\s+(int|float|bool|str|None)\s+([a-zA-Z_$][\w$]*)/g,
                        replaceFn: (match, decl, type, name) => {
                            const declSpan = `<span class="hl-keyword">${decl}</span>`;
                            const typeSpan = `<span class="hl-native-type">${type}</span>`;
                            const nameClass = decl === "const" ? "hl-constant" : "hl-variable";
                            const nameSpan = `<span class="${nameClass}">${name}</span>`;
                            var_const_list.push(name);
                            return `${declSpan} ${typeSpan} ${nameSpan}`;
                        }
                    },
                    { regex: /\b[a-zA-Z_$][\w$]*\s*\([^)]*\)\s*{/g, className: "hl-function-method" },
                    { regex: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, className: "hl-function-call" },
                    { regex: /\bimport\s+(?:[\w*\s{},]*\s+from\s+)?["'][^"']+["']/g, className: "hl-import" },
                    { regex: /\btrue|false|null|\d+(\.\d+)?\b/g, className: "hl-literal" },
                    { regex: /\b(const|let|if|else\s+if|else|for|while|return|switch|case|break|default|try|catch|finally|fn)\b/g, className: "hl-keyword" },
                    { regex: /\b(int|float|bool|str|None)\b/g, className: "hl-native-type" },
                    { regex: /\b(if|else if|else|for|while|do|switch|case|default|break|continue|return|try|catch|finally)\b/g, className: "hl-control-structure" }
                ];


                
                for (const pattern of PATTERNS) {
                    if (pattern.replaceFn) {
                        code = code.replace(pattern.regex, pattern.replaceFn);
                    } else {
                        code = code.replace(pattern.regex, (match) => `<span class="${pattern.className}">${match}</span>`);
                    }
                }

                for (const { token, html } of PLACEHOLDERS) {
                    code = code.replace(token, html);
                }
                
                for (const varName of var_const_list) {
                    const regex = new RegExp(`\\b${varName}\\b`, 'g');
                    code = code.replace(regex, `<span class="hl-variable">${varName}</span>`);
                }

                CODE_LINE.innerHTML = code;
            }
        }
    }
}

module.exports = { syntax_highlighting };