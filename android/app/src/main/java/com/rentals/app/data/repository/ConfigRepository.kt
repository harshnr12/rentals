package com.rentals.app.data.repository

import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.api.apiCall
import com.rentals.app.data.api.toApiError
import com.rentals.app.data.models.ConfigData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ConfigState(
    val config: ConfigData? = null,
    val loading: Boolean = false,
    val error: String? = null
)

// Replaces ConfigProvider. Config lives in RAM only.
object ConfigRepository {

    private val _state = MutableStateFlow(ConfigState())
    val state: StateFlow<ConfigState> = _state.asStateFlow()

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    // Called at app start and by Retry buttons. Does nothing when already loaded or running.
    fun load() {
        if (_state.value.config != null || _state.value.loading) return
        _state.update { it.copy(loading = true, error = null) }

        scope.launch {
            apiCall { ApiClient.service.getConfig() }
                .onSuccess { data -> _state.value = ConfigState(config = data) }
                .onFailure { e -> _state.value = ConfigState(error = e.toApiError().message) }
        }
    }
}