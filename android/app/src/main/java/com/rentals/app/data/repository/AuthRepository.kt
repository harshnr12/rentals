package com.rentals.app.data.repository

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.rentals.app.RentalsApp
import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.models.LoginRequest
import com.rentals.app.data.models.SignupRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// Replaces AuthProvider. One instance for the whole app (Kotlin object).
object AuthRepository {

    private const val PREFS_NAME = "auth_prefs"
    private const val KEY_TOKEN = "token"

    private val prefs: SharedPreferences = createPrefs()

    // Token is kept in RAM for fast reads. Encrypted disk storage is touched only on login and logout.
    private val _token = MutableStateFlow<String?>(prefs.getString(KEY_TOKEN, null))
    val token: StateFlow<String?> = _token.asStateFlow()

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    // Failures are thrown. The ViewModel wraps the call in apiCall { }, same rule as every other repository.
    suspend fun login(email: String, password: String) {
        val response = ApiClient.service.login(LoginRequest(email, password))
        saveToken(response.token)
    }

    suspend fun signup(name: String, email: String, password: String, phone: String) {
        val response = ApiClient.service.signup(SignupRequest(name, email, password, phone))
        saveToken(response.token)
    }
    
    // Safe to call many times: parallel 401 responses all end up here
    fun logout() {
        if (_token.value == null) return
        prefs.edit().remove(KEY_TOKEN).apply()
        _token.value = null
        // Cached /me responses belong to the old user. Disk work runs off the main thread.
        scope.launch { ApiClient.clearCache() }
    }

    private fun saveToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
        _token.value = token
    }

    private fun createPrefs(): SharedPreferences {
        val context = RentalsApp.instance
        try {
            return openEncryptedPrefs(context)
        } catch (e: Exception) {
            // Keystore data can become unreadable (for example after a device restore).
            // Start clean, the only effect is a new login.
            context.deleteSharedPreferences(PREFS_NAME)
            return openEncryptedPrefs(context)
        }
    }

    private fun openEncryptedPrefs(context: Context): SharedPreferences {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        return EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }
}