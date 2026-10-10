package com.rentals.app.data.models

data class LoginRequest(
    val email: String,
    val password: String
)

data class SignupRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String
)

// Only the token is needed. User details are loaded separately from /me.
data class AuthResponse(
    val token: String
)