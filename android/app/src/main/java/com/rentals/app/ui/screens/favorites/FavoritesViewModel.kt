package com.rentals.app.ui.screens.favorites

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rentals.app.data.api.errorMessage
import com.rentals.app.data.models.Property
import com.rentals.app.data.repository.PropertyRepository
import com.rentals.app.data.repository.UserDataRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class FavoritesUiState(
    val properties: List<Property> = emptyList(),
    val loading: Boolean = true,
    val error: String? = null
)

class FavoritesViewModel : ViewModel() {
    private val _state = MutableStateFlow(FavoritesUiState())
    val state: StateFlow<FavoritesUiState> = _state.asStateFlow()

    init {
        loadFavorites()
    }

    fun loadFavorites() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            try {
                val properties = PropertyRepository.getFavorites()
                _state.update { it.copy(properties = properties, loading = false) }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        loading = false,
                        error = errorMessage(e).ifBlank { "Failed to load favorite properties. Please try again." }
                    )
                }
            }
        }
    }

    fun toggleFavorite(propertyId: String) {
        viewModelScope.launch {
            try {
                UserDataRepository.toggleFavorite(propertyId)
                val stillFavorited = UserDataRepository.state.value.favoriteIds.contains(propertyId)
                if (!stillFavorited) {
                    _state.update { current ->
                        current.copy(properties = current.properties.filter { it.id != propertyId })
                    }
                }
            } catch (_: Exception) {
            }
        }
    }
}
