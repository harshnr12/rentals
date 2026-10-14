package com.rentals.app.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.models.AuthResponse
import com.rentals.app.data.models.LoginRequest
import com.rentals.app.data.models.SignupRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow


// Manages JWT persistence via sandboxed SharedPreferences
// and provides reactive authentication state:
object AuthRepository {
    private const val PREFS_NAME = "rentals_session"
    private const val KEY_TOKEN = "jwt_token"

    private lateinit var prefs: SharedPreferences

    private val _token = MutableStateFlow<String?>(null)
    val token: StateFlow<String?> = _token.asStateFlow()

    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        _token.value = prefs.getString(KEY_TOKEN, null)
    }

    fun getToken(): String? = _token.value

    suspend fun login(request: LoginRequest): AuthResponse {
        val response = ApiClient.service.login(request)
        persistToken(response.token)
        return response
    }

    suspend fun signup(request: SignupRequest): AuthResponse {
        val response = ApiClient.service.signup(request)
        persistToken(response.token)
        return response
    }

    fun logout() {
        prefs.edit().remove(KEY_TOKEN).apply()
        _token.value = null
    }

    private fun persistToken(newToken: String) {
        prefs.edit().putString(KEY_TOKEN, newToken).apply()
        _token.value = newToken
    }
}