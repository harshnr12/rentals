package com.rentals.app.ui.screens.propertydetails

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rentals.app.data.api.errorMessage
import com.rentals.app.data.models.Owner
import com.rentals.app.data.models.Property
import com.rentals.app.data.repository.PropertyRepository
import com.rentals.app.data.repository.UserDataRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.json.JSONObject
import retrofit2.HttpException
import java.time.Instant

/**
 * UI State for the Property Details screen.
 * Encapsulates listing data, photo gallery selection, owner contact info,
 * deletion workflow, and daily inquiry rate-limit countdown.
 */
data class PropertyDetailsUiState(
    val property: Property? = null,
    val pageLoading: Boolean = true,
    val pageError: String? = null,
    val activePhotoIndex: Int = 0,
    val contactDetails: Owner? = null,
    val contactLoading: Boolean = false,
    val contactLimitMessage: String? = null,
    val contactLimitSeconds: Int = 0,
    val deleting: Boolean = false,
    val showDeleteDialog: Boolean = false
)

class PropertyDetailsViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {

    private val propertyId: String = checkNotNull(savedStateHandle.get<String>("id")) {
        "Property ID must be passed as a navigation argument"
    }

    private val _state = MutableStateFlow(PropertyDetailsUiState())
    val state: StateFlow<PropertyDetailsUiState> = _state.asStateFlow()

    private var countdownJob: Job? = null

    init {
        loadProperty()

        // Reactive Synchronization: Listen to PropertyRepository's SharedFlow mutation stream.
        // If the user edits this property from PropertyFormScreen and pops back,
        // this collector automatically pulls fresh data from the server in the background.
        viewModelScope.launch {
            PropertyRepository.propertyUpdates.collect {
                loadProperty(isBackgroundSync = true)
            }
        }
    }

    /**
     * Loads public property details. Keeps existing data on screen during background sync
     * to prevent UI flickering.
     */
    fun loadProperty(isBackgroundSync: Boolean = false) {
        viewModelScope.launch {
            if (!isBackgroundSync) {
                _state.update { it.copy(pageLoading = true, pageError = null) }
            }
            try {
                val property = PropertyRepository.getProperty(propertyId)
                _state.update {
                    it.copy(
                        property = property,
                        pageLoading = false,
                        pageError = null
                    )
                }
            } catch (e: Exception) {
                if (!isBackgroundSync) {
                    _state.update {
                        it.copy(
                            pageLoading = false,
                            pageError = errorMessage(e).ifBlank { "Failed to load property details." }
                        )
                    }
                }
            }
        }
    }

    fun setActivePhotoIndex(index: Int) {
        _state.update { it.copy(activePhotoIndex = index) }
    }

    fun setDeleteDialogVisible(visible: Boolean) {
        _state.update { it.copy(showDeleteDialog = visible) }
    }

    /**
     * Toggles favorite status in UserDataRepository's central StateFlow.
     */
    fun toggleFavorite() {
        val prop = _state.value.property ?: return
        viewModelScope.launch {
            try {
                UserDataRepository.toggleFavorite(prop.id)
            } catch (e: Exception) {
                // Network error handled in repository/logs
            }
        }
    }

    /**
     * Requests protected owner contact details.
     * Handles HTTP 429 rate limit responses by starting a countdown timer.
     */
    fun fetchOwnerContact() {
        if (_state.value.contactLoading || _state.value.contactLimitSeconds > 0) return

        viewModelScope.launch {
            _state.update { it.copy(contactLoading = true) }
            try {
                val owner = PropertyRepository.getOwnerContact(propertyId)
                _state.update {
                    it.copy(
                        contactDetails = owner,
                        contactLoading = false,
                        contactLimitMessage = null,
                        contactLimitSeconds = 0
                    )
                }
                // Synchronize global contacted state reactively
                UserDataRepository.addContacted(propertyId)
            } catch (e: HttpException) {
                if (e.code() == 429) {
                    parseRateLimitError(e)
                } else {
                    _state.update { it.copy(contactLoading = false) }
                }
            } catch (e: Exception) {
                _state.update { it.copy(contactLoading = false) }
            }
        }
    }

    private fun parseRateLimitError(e: HttpException) {
        val errorBody = e.response()?.errorBody()?.string().orEmpty()
        var message = "You have reached your daily contact inquiry limit."
        var remainingSeconds = 3600 // 1 hour default fallback

        try {
            val json = JSONObject(errorBody)
            if (json.has("message")) message = json.getString("message")
            if (json.has("resetAt")) {
                val resetInstant = Instant.parse(json.getString("resetAt"))
                val diffSeconds = resetInstant.epochSecond - Instant.now().epochSecond
                remainingSeconds = diffSeconds.coerceAtLeast(0).toInt()
            }
        } catch (_: Exception) { }

        startCooldownTimer(remainingSeconds, message)
    }

    private fun startCooldownTimer(initialSeconds: Int, message: String) {
        countdownJob?.cancel()
        _state.update {
            it.copy(
                contactLoading = false,
                contactLimitMessage = message,
                contactLimitSeconds = initialSeconds
            )
        }

        countdownJob = viewModelScope.launch {
            var seconds = initialSeconds
            while (seconds > 0) {
                delay(1000L)
                seconds--
                _state.update { it.copy(contactLimitSeconds = seconds) }
            }
            _state.update { it.copy(contactLimitSeconds = 0, contactLimitMessage = null) }
        }
    }

    /**
     * Deletes the listing, emits the mutation signal via PropertyRepository.propertyUpdates,
     * and calls onSuccess to pop the screen.
     */
    fun deleteProperty(onSuccess: () -> Unit) {
        viewModelScope.launch {
            _state.update { it.copy(deleting = true, showDeleteDialog = false) }
            try {
                PropertyRepository.deleteProperty(propertyId)
                _state.update { it.copy(deleting = false) }
                onSuccess()
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        deleting = false,
                        pageError = errorMessage(e).ifBlank { "Failed to delete property." }
                    )
                }
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        countdownJob?.cancel()
    }
}
