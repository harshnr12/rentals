package com.rentals.app.data.repository

import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.api.errorMessage
import com.rentals.app.data.models.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class UserDataState(
    val currentUser: User? = null,
    val favoriteIds: Set<String> = emptySet(),
    val contactedIds: Set<String> = emptySet(),
    val loading: Boolean = false,
    val error: String? = null,
)

// Shared state for the authenticated user, just like web UserDataProvider.jsx
object UserDataRepository {
    private val _state = MutableStateFlow(UserDataState())
    val state: StateFlow<UserDataState> = _state.asStateFlow()

    suspend fun load() {
        if (_state.value.loading) return
        _state.update { it.copy(loading = true, error = null) }

        try {
            val user = ApiClient.service.getMe().user
            _state.value =
                UserDataState(
                    currentUser = user,
                    favoriteIds = user.favoritedPropertyIds.toSet(),
                    contactedIds = user.contactedPropertyIds.toSet(),
                    loading = false,
                )
        } catch (e: Exception) {
            _state.update { it.copy(loading = false, error = errorMessage(e)) }
        }
    }

    fun clear() {
        _state.value = UserDataState()
    }

    // Server reply is the source of truth; avoids race conditions on rapid taps
    suspend fun toggleFavorite(propertyId: String) {
        val response = ApiClient.service.toggleFavorite(propertyId)
        _state.update { current ->
            val updated =
                if (response.favorited) {
                    current.favoriteIds + propertyId
                } else {
                    current.favoriteIds - propertyId
                }
            current.copy(favoriteIds = updated)
        }
    }

    fun addContacted(propertyId: String) {
        _state.update { it.copy(contactedIds = it.contactedIds + propertyId) }
    }
}
