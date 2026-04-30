import * as fs from 'fs';

export function readJSON<T>(filePath: string): T {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
}

export function readText(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
}

export function writeJSON(filePath: string, data: any, indent: number = 2): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, indent));
}

export function writeText(filePath: string, data: string): void {
    fs.writeFileSync(filePath, data);
}