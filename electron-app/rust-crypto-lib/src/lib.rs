/*
    ============================================================================
    File        : lib.rs
    Version     : 1.0
    Description : Library of hash and password verification functions
                  using Argon2 for the A++ IDE project. Designed
                  for use with WebAssembly (wasm-bindgen).
    Author      : Arthur
    Created     : 2025-08-19
    Last Update : 2025-08-19
    ============================================================================
*/
use wasm_bindgen::prelude::*;

use argon2::{Argon2, PasswordHasher, password_hash::SaltString, PasswordVerifier, password_hash::PasswordHash, Params, Algorithm, Version};
use aes_gcm::{Aes256Gcm, aead::{Aead, KeyInit, generic_array::GenericArray}};
use aes_gcm::aead::consts::U12;
use aes_gcm::Nonce;
use rand::RngCore;
use rand::rngs::OsRng;
use base64::{engine::general_purpose, Engine as _};

#[wasm_bindgen]
pub fn hash_password(_password: &str) -> String {
    /*
     Hash a password using Argon2id with secure parameters.
     @param `_password` - Plaintext password to be hashed.
     @return `String` - Encoded representation of the Argon2id hash (including salt and parameters).
     @panic If hashing fails or parameters are invalid.
     */
    let salt = SaltString::generate(&mut OsRng);
    let params = Params::new(262144, 6, 2, Some(64)).expect("Invalid Argon2 parameters");
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let password_hash = argon2.hash_password(_password.as_bytes(), &salt)
            .expect("Failed to hash password");
    password_hash.to_string()
}

#[wasm_bindgen]
pub fn verify_password(_stored_hash: &str, _password: &str) -> bool {
    /*
     Verify a password against a given Argon2id hash.
     @param `_stored_hash` - The Argon2id hash to verify against.
     @param `_password` - The plaintext password to verify.
     @return `bool` - `true` if the password matches the hash, `false` otherwise.
     @panic If the stored hash is invalid or parsing fails.
     */
    let parsed_hash =  PasswordHash::new(_stored_hash).expect("Failed to parse password hash");
    let params = Params::new(262144, 6, 2, Some(64)).expect("Invalid Argon2 parameters");
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    match argon2.verify_password(_password.as_bytes(), &parsed_hash) {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[wasm_bindgen] 
pub fn generate_aes_256_gcm_key() -> Vec<u8> {
    /*
     Generates a random (secure) AES-256 key and returns it as a base64 string.
     @return Base64-encoded key, ready to be transmitted or stored.
     */
    let mut key_bytes = [0u8; 32];
    OsRng.fill_bytes(&mut key_bytes);
    key_bytes.to_vec()
}

#[wasm_bindgen]
pub fn encrypt_aes_256_gcm(_text: &str, _key_bytes: Vec<u8>) -> Result<JsValue, JsValue> {
    /*
     Encrypt a string with AES-256-GCM algorithm.
     @param `_text` Plaintext to encrypt.
     @param `_key_bytes` 32-byte (256-bit) encryption key.
     @return `cipher` The encrypted text encoded in base64.
     @return `nonce` The nonce used to encoded in base64.
     @panic The key is not 32-bytes long.
     @panic Parsing fails
     @panic Problem when creating the JavaScript object
     */
    if _key_bytes.len() != 32 {
        return Err(JsValue::from_str("Key must be 32 bytes"));
    }

    let key = GenericArray::from_slice(&_key_bytes);
    let cipher = Aes256Gcm::new(key);

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::<U12>::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, _text.as_bytes())
        .map_err(|e| JsValue::from_str(&format!("Encryption error: {:?}", e)))?;

    let nonce_b64 = general_purpose::STANDARD.encode(&nonce_bytes);
    let cipher_b64 = general_purpose::STANDARD.encode(&ciphertext);

    let result = js_sys::Object::new();
    js_sys::Reflect::set(&result, &"nonce".into(), &nonce_b64.into())?;
    js_sys::Reflect::set(&result, &"cipher".into(), &cipher_b64.into())?;
    Ok(result.into())
}

#[wasm_bindgen]
pub fn decrypt_aes_256_gcm(_nonce_b64: &str, _cipher_text_b64: &str, _key_bytes: Vec<u8>) -> Result<String, JsValue> {
    /*
     Decrypt a text encrypted with AES-256-GCM, using the cipher and nonce encoded in base64.
     @param `_nonce_b64` Base64-encoded nonce used for decryption.
     @param `_cipher_text_b64` Base64-encoded ciphertext to decrypt.
     @param `_key_bytes` 32-byte (256-bit) decryption key.
     @return `String` The decrypted plaintext. (Successful)
     @return `JSValue` An error message. (Failure)
     @panic The key is not 32-bytes long.
     @panic Invalid Base64 for the nonce or ciphertext.
     @panic The nonce is not 12-bytes long.
     @panic Decryption failure.
     Data decrypted is not valid in UTF-8.
     */
    if _key_bytes.len() != 32 {
        return Err(JsValue::from_str("Key must be 32 bytes"));
    }
    
    let key = GenericArray::from_slice(&_key_bytes);
    let cipher = Aes256Gcm::new(key);

    let nonce_bytes = general_purpose::STANDARD
        .decode(_nonce_b64)
        .map_err(|e| JsValue::from_str(&format!("Invalid nonce base64: {:?}", e)))?;

    if nonce_bytes.len() != 12 {
        return Err(JsValue::from_str("Nonce must be 12 bytes"));
    }

    let cipher_bytes = general_purpose::STANDARD
        .decode(_cipher_text_b64)
        .map_err(|e| JsValue::from_str(&format!("Invalid cipher base64: {:?}", e)))?;

    let nonce = Nonce::<U12>::from_slice(&nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, cipher_bytes.as_ref())
        .map_err(|e| JsValue::from_str(&format!("Decryption error: {:?}", e)))?;

    let result = String::from_utf8(plaintext)
        .map_err(|e| JsValue::from_str(&format!("UTF-8 decode error: {:?}", e)))?;

    Ok(result)
}

#[wasm_bindgen]
pub fn derive_key_from_password(_password: &str, _salt_b64: Option<String>) -> Result<js_sys::Object, JsValue> {
     /*
     Derives a 256-bit (32 bytes) AES key from a password using Argon2id.
     @param `_password` - The password to derive the key from.
     @param `_salt_b64` - Optional base64 salt (for reuse during login).
     @return JS object with `key` and `salt` (both base64).
    */
    let salt = match _salt_b64 {
        Some(ref salt_str) => {
            base64::engine::general_purpose::STANDARD
                .decode(salt_str)
                .map_err(|e| JsValue::from_str(&format!("Invalid salt base64: {:?}", e)))?
        },
        None => {
            let mut salt = [0u8; 16];
            OsRng.fill_bytes(&mut salt);
            salt.to_vec()
        }
    };
    let params = Params::new(262144, 6, 2, Some(32)).expect("Invalid Argon2 parameters");
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut key = [0u8; 32];

    argon2.hash_password_into(_password.as_bytes(), &salt, &mut key)
        .map_err(|e| JsValue::from_str(&format!("Key derivation error: {:?}", e)))?;

    let key_b64 = general_purpose::STANDARD.encode(&key);
    let salt_b64 = general_purpose::STANDARD.encode(&salt);

    let result = js_sys::Object::new();
    js_sys::Reflect::set(&result, &"key".into(), &key_b64.into())?;
    js_sys::Reflect::set(&result, &"salt".into(), &salt_b64.into())?;

    Ok(result)
}