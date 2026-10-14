package com.rentals.app.data.repository

import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.models.MeResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class UserDataState(
    val me: MeResponse? = null,
    val favoriteIds: Set<String> = emptySet(),
    val contactedIds: Set<String> = emptySet(),
    val loading: Boolean = false,
    val error: String? = null
)

// Maintains in-memory collections of favorite and contacted property IDs.
// Pure suspend methods bubble exceptions up to calling ViewModels:
object UserDataRepository {
    private val _state = MutableStateFlow(UserDataState())
    val state: StateFlow<UserDataState> = _state.asStateFlow()

    suspend fun load() {
        if (_state.value.loading) return
        _state.update { it.copy(loading = true, error = null) }

        try {
            val meData = ApiClient.service.getMe()
            val favoritesData = ApiClient.service.getMyFavorites()
            val contactedData = ApiClient.service.getMyContacted()

            // Extracts ID strings from response models to populate fast in-memory lookup sets
            val favSet = favoritesData.properties.map { it.id.toString() }.toSet()
            val contactedSet = contactedData.properties.map { it.id.toString() }.toSet()

            _state.value = UserDataState(
                me = meData,
                favoriteIds = favSet,
                contactedIds = contactedSet,
                loading = false
            )
        } catch (e: Exception) {
            _state.update { it.copy(loading = false, error = e.message) }
            throw e
        }
    }

    fun clear() {
        _state.value = UserDataState()
    }

    suspend fun toggleFavorite(propertyId: String) {
        val currentlyFavorited = _state.value.favoriteIds.contains(propertyId)

        // Optimistically update the UI set to prevent toggle lag
        _state.update { current ->
            val updated = if (currentlyFavorited) {
                current.favoriteIds - propertyId
            } else {
                current.favoriteIds + propertyId
            }
            current.copy(favoriteIds = updated)
        }

        try {
            ApiClient.service.toggleFavorite(propertyId)
        } catch (e: Exception) {
            // Revert back on network failure
            _state.update { current ->
                val reverted = if (currentlyFavorited) {
                    current.favoriteIds + propertyId
                } else {
                    current.favoriteIds - propertyId
                }
                current.copy(favoriteIds = reverted)
            }
            throw e
        }
    }

    fun recordContacted(propertyId: String) {
        _state.update { it.copy(contactedIds = it.contactedIds + propertyId) }
    }
}