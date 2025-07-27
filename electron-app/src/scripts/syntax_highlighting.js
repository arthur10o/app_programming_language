function syntax_highlighting() {
    const preview = document.getElementById("preview-text");
    const codeLines = Array.from(preview.querySelectorAll('.code-line'));
    for (const codeLine of codeLines) {
        let code = codeLine.textContent;
        const patterns = [
            { regex: /\/\/.*|\/\*[\s\S]*?\*\//g, className: "hl-comment" },
            { regex: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, className: "hl-string" },
            { regex: /\b\d+(\.\d+)?\b/g, className: "hl-number" },
            { regex: /\b(fn)\s+(\w+)\b/g, className: "hl-keyword hl-function", groups: [1, 2] },
            { regex: /\b(const|let|if|else|else if|for|while|return|switch|case|break|default|try|catch|finally)\b/g, className: "hl-keyword" }
        ];
        for (const { regex, className, groups } of patterns) {
            code = code.replace(regex, (...args) => {
                if (groups) {
                    return groups.map(g => `<span class="${className}">${args[g]}</span>`).join(' ');
                }
                return `<span class="${className}">${args[0]}</span>`;
            });
        }
        codeLine.innerHTML = code;
    }
}

module.exports = { syntax_highlighting };