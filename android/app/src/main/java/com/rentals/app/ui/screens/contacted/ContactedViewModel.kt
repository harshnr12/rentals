package com.rentals.app.ui.screens.contacted

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

data class ContactedUiState(
    val properties: List<Property> = emptyList(),
    val lifetimeCount: Int = 0,
    val loading: Boolean = true,
    val error: String? = null
)

class ContactedViewModel : ViewModel() {
    private val _state = MutableStateFlow(ContactedUiState())
    val state: StateFlow<ContactedUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            AuthRepository.token.collect { token ->
                if (!token.isNullOrBlank()) {
                    loadContacted()
                } else {
                    _state.value = ContactedUiState(loading = false)
                }
            }
        }
    }

    fun loadContacted() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            try {
                val data = PropertyRepository.getContacted()
                _state.update {
                    it.copy(
                        properties = data.properties,
                        lifetimeCount = data.lifetimeContactedPropertyCount,
                        loading = false
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        loading = false,
                        error = errorMessage(e).ifBlank { "Failed to load contacted properties. Please try again." }
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
