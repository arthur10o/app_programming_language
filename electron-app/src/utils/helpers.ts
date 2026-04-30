export function base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

export async function displayLoader() {
    const loader = document.getElementById('loader');
    if (!loader) throw new Error('Loader element not found in the DOM');
    requestAnimationFrame(() => {
        loader.style.display = 'flex';
    });
}

export async function hideLoader(delay: number = 600) {
    const loader = document.getElementById('loader');
    if (!loader) throw new Error('Loader element not found in the DOM');
    setTimeout(() => {
        if (loader) loader.style.display = 'none';
    }, delay);
}