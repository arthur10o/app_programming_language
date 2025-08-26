/* tslint:disable */
/* eslint-disable */
export function hash_password(_password: string): string;
export function verify_password(_stored_hash: string, _password: string): boolean;
export function generate_aes_256_gcm_key(): Uint8Array;
export function encrypt_aes_256_gcm(_text: string, _key_bytes: Uint8Array): any;
export function decrypt_aes_256_gcm(_nonce_b64: string, _cipher_text_b64: string, _key_bytes: Uint8Array): string;
export function derive_key_from_password(_password: string, _salt_b64?: string | null): object;
export function generate_recovery_key(blocks: number, block_size: number): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly hash_password: (a: number, b: number) => [number, number];
  readonly verify_password: (a: number, b: number, c: number, d: number) => number;
  readonly generate_aes_256_gcm_key: () => [number, number];
  readonly encrypt_aes_256_gcm: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly decrypt_aes_256_gcm: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
  readonly derive_key_from_password: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly generate_recovery_key: (a: number, b: number) => [number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
