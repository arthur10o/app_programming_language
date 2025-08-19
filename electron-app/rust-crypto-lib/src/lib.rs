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
use rand::rngs::OsRng;

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