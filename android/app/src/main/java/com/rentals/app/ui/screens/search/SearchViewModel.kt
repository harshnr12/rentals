package com.rentals.app.ui.screens.search

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rentals.app.data.api.errorMessage
import com.rentals.app.data.models.Property
import com.rentals.app.data.models.SearchFilters
import com.rentals.app.data.repository.PropertyRepository
import com.rentals.app.data.repository.UserDataRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SearchUiState(
    val filters: SearchFilters = SearchFilters(),
    val properties: List<Property> = emptyList(),
    val loading: Boolean = true,
    val error: String? = null
)

// Reads the optional cityId navigation argument automatically
// from SavedStateHandle (the Android equivalent of React Router's useSearchParams)
// and fetches matching properties on initialization.
class SearchViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
    private val initialCityId = savedStateHandle.get<String>("cityId")?.toIntOrNull()

    private val _state = MutableStateFlow(
        SearchUiState(filters = SearchFilters(cityId = initialCityId))
    )
    val state: StateFlow<SearchUiState> = _state.asStateFlow()

    init {
        fetchFilteredProperties()
    }

    fun updateFilters(transform: (SearchFilters) -> SearchFilters) {
        _state.update { it.copy(filters = transform(it.filters)) }
    }

    fun toggleFurnishing(type: String) {
        _state.update { current ->
            val currentList = current.filters.furnishing
            val updatedList = if (currentList.contains(type)) {
                currentList - type
            } else {
                currentList + type
            }
            current.copy(filters = current.filters.copy(furnishing = updatedList))
        }
    }

    fun applyFilters() {
        fetchFilteredProperties()
    }

    fun clearFilters() {
        _state.update { it.copy(filters = SearchFilters()) }
        fetchFilteredProperties()
    }

    private fun fetchFilteredProperties() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            try {
                val properties = PropertyRepository.getProperties(_state.value.filters)
                _state.update { it.copy(properties = properties, loading = false) }
            } catch (e: Exception) {
                _state.update { it.copy(loading = false, error = errorMessage(e)) }
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
