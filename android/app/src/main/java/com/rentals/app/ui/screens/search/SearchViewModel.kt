package com.rentals.app.ui.screens.search

import androidx.lifecycle.SavedStateHandle
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

data class SearchFilters(
    val cityId: String = "",
    val locality: String = "",
    val propertyType: String = "",
    val minBedrooms: String = "",
    val minBathrooms: String = "",
    val furnishing: Set<String> = emptySet(),
    val minRent: String = "",
    val maxRent: String = "",
    val hasParking: Boolean = false,
    val hasLift: Boolean = false,
    val allowSingleMale: Boolean = false,
    val allowSingleFemale: Boolean = false,
    val allowFamily: Boolean = false,
    val sort: String = "newest"
)

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
    private val initialCityId = savedStateHandle.get<String>("cityId").orEmpty()

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
            val currentSet = current.filters.furnishing
            val updatedSet = if (currentSet.contains(type)) currentSet - type else currentSet + type
            current.copy(filters = current.filters.copy(furnishing = updatedSet))
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
                val f = _state.value.filters
                val response = ApiClient.service.getProperties(
                    cityId = f.cityId.toIntOrNull(),
                    locality = f.locality.trim().ifBlank { null },
                    minRent = f.minRent.toIntOrNull(),
                    maxRent = f.maxRent.toIntOrNull(),
                    minBedrooms = f.minBedrooms.toIntOrNull(),
                    minBathrooms = f.minBathrooms.toIntOrNull(),
                    propertyType = f.propertyType.ifBlank { null },
                    furnishing = f.furnishing.toList().ifEmpty { null },
                    hasParking = if (f.hasParking) true else null,
                    hasLift = if (f.hasLift) true else null,
                    allowSingleMale = if (f.allowSingleMale) true else null,
                    allowSingleFemale = if (f.allowSingleFemale) true else null,
                    allowFamily = if (f.allowFamily) true else null,
                    sort = f.sort.ifBlank { null }
                )
                _state.update { it.copy(properties = response.properties, loading = false) }
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
