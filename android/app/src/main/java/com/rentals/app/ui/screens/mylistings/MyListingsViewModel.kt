package com.rentals.app.ui.screens.mylistings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rentals.app.data.api.errorMessage
import com.rentals.app.data.models.Property
import com.rentals.app.data.repository.AuthRepository
import com.rentals.app.data.repository.PropertyRepository
import com.rentals.app.data.repository.UserDataRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class MyListingsUiState(
    val properties: List<Property> = emptyList(),
    val loading: Boolean = true,
    val error: String? = null
)

class MyListingsViewModel : ViewModel() {
    private val _state = MutableStateFlow(MyListingsUiState())
    val state: StateFlow<MyListingsUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            AuthRepository.token.collect { token ->
                if (!token.isNullOrBlank()) {
                    loadMyListings()
                } else {
                    _state.value = MyListingsUiState(loading = false)
                }
            }
        }
    }

    fun loadMyListings() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            try {
                val properties = PropertyRepository.getMyProperties()
                _state.update { it.copy(properties = properties, loading = false) }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        loading = false,
                        error = errorMessage(e).ifBlank { "Failed to load listings. Please try again." }
                    )
                }
            }
        }
    }

    fun toggleFavorite(propertyId: String) {
        viewModelScope.launch {
            try {
                UserDataRepository.toggleFavorite(propertyId)
            } catch (_: Exception) {
            }
        }
    }
}
