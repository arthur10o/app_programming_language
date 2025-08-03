/*
    FIle        : syntax_highlighting.js
    Version     : 1.0
    Description : Syntax highlighting script for A++ IDE
    Author      : Arthur
    Created     : 2025-07-27
    Last Update : 2025-07-27
*/
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
                    { regex: /\bimport\s+(?:[\w*\s{},]*\s+from\s+)?["'][^"']+["']/g, className: "hl-import" },
                    { regex: /\btrue|false|null|\d+(\.\d+)?\b/g, className: "hl-literal" },
                    { regex: /\b[a-zA-Z_$][\w$]*\s*\([^)]*\)\s*{/g, className: "hl-function-methode" },
                    { regex: /\b(const|let|if|else\s+if|else|for|while|return|switch|case|break|default|try|catch|finally|fn)\b/g, className: "hl-keyword" },
                    { regex: /\b(int|float|bool|str|None)\b/g, className: "hl-native-type" },
                    { regex: /\b(?:var)\s+[a-z_$][\w$]*/g, className: "hl-variable" },
                    { regex: /\b(?:const)\s+[A-Z_$][\w$]*/g, className: "hl-constant" },
                    { regex: /\b(if|else if|else|for|while|do|switch|case|default|break|continue|return|try|catch|finally)\b/g, className: "hl-control-structure" }
                ];

                for (const { regex, className, groups } of PATTERNS) {
                    code = code.replace(regex, (...args) => {
                        if (groups) {
                            return groups
                                .map((g) => `<span class="${className}">${args[g]}</span>`)
                                .join(' ');
                        }
                        return `<span class="${className}">${args[0]}</span>`;
                    });
                }

                for (const { token, html } of PLACEHOLDERS) {
                    code = code.replace(token, html);
                }

                CODE_LINE.innerHTML = code;
            }
        }
    }
}

module.exports = { syntax_highlighting };