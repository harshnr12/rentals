package com.rentals.app.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.api.errorMessage
import com.rentals.app.data.models.Property
import com.rentals.app.data.repository.UserDataRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class HomeUiState(
    val properties: List<Property> = emptyList(),
    val loading: Boolean = true,
    val error: String? = null
)


// Owns viewModelScope for both initial property loading
// (init { loadProperties() }) and favorite toggling (toggleFavorite).
class HomeViewModel : ViewModel() {
    private val _state = MutableStateFlow(HomeUiState())
    val state: StateFlow<HomeUiState> = _state.asStateFlow()

    init {
        loadProperties()
    }

    fun loadProperties() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            try {
                val response = ApiClient.service.getProperties()
                _state.update {
                    it.copy(properties = response.properties, loading = false)
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(loading = false, error = errorMessage(e))
                }
            }
        }
    }

    fun toggleFavorite(propertyId: String) {
        viewModelScope.launch {
            try {
                UserDataRepository.toggleFavorite(propertyId)
            } catch (_: Exception) {
                // Silent failure; icon stays in server-truth state
            }
        }
    }
}
