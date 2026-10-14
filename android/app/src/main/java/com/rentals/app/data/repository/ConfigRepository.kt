package com.rentals.app.data.repository

import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.api.errorMessage
import com.rentals.app.data.models.ConfigData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class ConfigState(
    val config: ConfigData? = null,
    val loading: Boolean = false,
    val error: String? = null
)


// Caches platform configuration strictly in RAM. Uses pure suspend
// execution with an in-memory guard to prevent duplicate network calls:
object ConfigRepository {
    private val _state = MutableStateFlow(ConfigState())
    val state: StateFlow<ConfigState> = _state.asStateFlow()

    suspend fun load() {
        // Prevents redundant network traffic if configuration is already cached or in-flight
        if (_state.value.config != null || _state.value.loading) return

        _state.update { it.copy(loading = true, error = null) }

        try {
            val response = ApiClient.service.getConfig()
            _state.value = ConfigState(config = response, loading = false)
        } catch (e: Exception) {
            _state.value = ConfigState(error = errorMessage(e), loading = false)
        }
    }
}