import fs from 'fs';

export function readJSON<T>(filePath: string): T {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as T;
}

export function writeJson(filePath: string, data: any): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}