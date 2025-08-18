/*
    FIle        : verify_password.rs
    Version     : 1.0
    Description : Function to verify a password with a stored hash using the Argon2id algorithm
    Author      : Arthur
    Created     : 2025-08-18
    Last Update : 2025-08-18
*/
use wasm_bindgen::prelude::*;

use argon2::{Argon2, PasswordVerifier, password_hash::PasswordHash};
use argon2::{Algorithm, Params, Version};

#[wasm_bindgen]
pub fn verify_password(_stored_hash: &str, _password: &str) -> bool {
    let parsed_hash =  PasswordHash::new(_stored_hash).expect("Failed to parse password hash");
    let params = Params::new(262144, 6, 2, Some(64)).expect("Invalid Argon2 parameters");
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    match argon2.verify_password(_password.as_bytes(), &parsed_hash) {
        Ok(_) => true,
        Err(_) => false,
    }
}