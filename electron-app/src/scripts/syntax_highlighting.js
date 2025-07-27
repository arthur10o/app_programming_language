function syntax_highlighting() {
    const PREVIEW = document.getElementById("preview-text");
    const CODES_LINES = Array.from(PREVIEW.querySelectorAll('.code-line'));
    let inMultiLineComment = false;

    for (const CODE_LINE of CODES_LINES) {
        let code = CODE_LINE.textContent;

        if(inMultiLineComment) {
            const END_INDEX = code.indexOf('*/');
            if(END_INDEX !== -1) {
                const BEFORE = code.slice(0, END_INDEX +2);
                const AFTER = code.slice(END_INDEX +2);
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
                        regex: /\b\d+(\.\d+)?\b/g,
                        className: "hl-number"
                    },
                    {
                        regex: /\b(fn)\s+(\w+)\b/g,
                        className: "hl-keyword hl-function",
                        groups: [1, 2]
                    },
                    {
                        regex: /\b(const|let|if|else\s+if|else|for|while|return|switch|case|break|default|try|catch|finally)\b/g,
                        className: "hl-keyword"
                    }
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