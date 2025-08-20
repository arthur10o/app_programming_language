/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const hash_password: (a: number, b: number) => [number, number];
export const verify_password: (a: number, b: number, c: number, d: number) => number;
export const generate_aes_256_gcm_key: () => [number, number];
export const encrypt_aes_256_gcm: (a: number, b: number, c: number, d: number) => [number, number, number];
export const decrypt_aes_256_gcm: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
export const derive_key_from_password: (a: number, b: number, c: number, d: number) => [number, number, number];
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_export_2: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_start: () => void;
