package com.rentals.app.data.repository

import android.util.Log
import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.api.apiCall
import com.rentals.app.data.api.toApiError
import com.rentals.app.data.models.User
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class UserDataState(
    val currentUser: User? = null,
    val favoriteIds: Set<String> = emptySet(),
    val contactedIds: Set<String> = emptySet(),
    val loading: Boolean = false,
    val error: String? = null
)

// Replaces UserDataProvider. The backend database stays the source of truth;
// this is an in-memory copy for the UI (hearts, contacted badges, profile).
object UserDataRepository {

    private const val TAG = "UserDataRepository"

    private val _state = MutableStateFlow(UserDataState())
    val state: StateFlow<UserDataState> = _state.asStateFlow()

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    // Same idea as useEffect(..., [isLoggedIn]): runs on every token change.
    // collectLatest cancels an unfinished load when the token changes again.
    fun start() {
        scope.launch {
            AuthRepository.token.collectLatest { token ->
                if (token == null) {
                    _state.value = UserDataState()
                } else {
                    load()
                }
            }
        }
    }

    suspend fun load() {
        _state.update { it.copy(loading = true, error = null) }

        apiCall { ApiClient.service.getMe() }
            .onSuccess { response ->
                val user = response.user
                _state.value = UserDataState(
                    currentUser = user,
                    favoriteIds = user.favoritedPropertyIds.toSet(),
                    contactedIds = user.contactedPropertyIds.toSet()
                )
            }
            .onFailure { e ->
                _state.update { it.copy(loading = false, error = e.toApiError().message) }
            }
    }

    // Pessimistic update: the set changes only after the server confirms.
    // The server answer says whether the property is now a favorite,
    // so two quick taps can never leave the app and the server out of sync.
    // Runs in the app scope, so it finishes even if the screen is closed.
    fun toggleFavorite(propertyId: String) {
        scope.launch {
            apiCall { ApiClient.service.toggleFavorite(propertyId) }
                .onSuccess { response ->
                    _state.update { current ->
                        val updated = if (response.favorited) {
                            current.favoriteIds + propertyId
                        } else {
                            current.favoriteIds - propertyId
                        }
                        current.copy(favoriteIds = updated)
                    }
                }
                .onFailure { e -> Log.e(TAG, "Failed to toggle favorite", e) }
        }
    }

    fun addContacted(propertyId: String) {
        _state.update { it.copy(contactedIds = it.contactedIds + propertyId) }
    }
}