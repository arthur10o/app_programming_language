/*
    FIle        : hash_password.rs
    Version     : 1.0
    Description : Securely hashes a password using Argon2id
    Author      : Arthur
    Created     : 2025-08-18
    Last Update : 2025-08-18
*/
use argon2::{Argon2, PasswordHasher, password_hash::SaltString, Params, Algorithm, Version};
use rand::rngs::OsRng;

fn hash_password(_password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let params = Params::new(262144, 6, 2, Some(64)).expect("Invalid Argon2 parameters");
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let password_hash = argon2.hash_password(_password.as_bytes(), &salt)
            .expect("Failed to hash password");
    password_hash.to_string()
}