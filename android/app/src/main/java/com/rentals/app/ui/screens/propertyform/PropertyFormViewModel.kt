package com.rentals.app.ui.screens.propertyform

import android.net.Uri
import android.provider.OpenableColumns
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rentals.app.RentalsApp
import com.rentals.app.data.api.errorMessage
import com.rentals.app.data.models.PropertyFormData
import com.rentals.app.data.repository.ConfigRepository
import com.rentals.app.data.repository.PropertyRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * Unified Property Form (Add / Edit Listing)
 *
 * Rationale for Single ViewModel & Screen:
 * 1. UI Parity: Both Add and Edit operations render the exact same 15 property inputs
 *    (location, dimensions, amenities, tenant rules) and multi-part photo management workflow.
 * 2. Automatic Mode Detection: PropertyFormViewModel extracts optional property 'id' from
 *    SavedStateHandle. If 'id == null', it operates in Add Mode with server-driven min defaults;
 *    if 'id != null', it automatically executes Edit Mode by pre-fetching the listing and photos.
 * 3. Shared Submit Pipeline: Both flows leverage PropertyRepository's unified 2-phase pipeline:
 *    first uploading any newly selected gallery photos to /media/upload, then merging their URLs
 *    with retained existingPhotos to send a POST (create) or PATCH (update) payload.
 * 4. DRY Maintenance: Eliminates duplicating ~450 lines of identical Compose form layout,
 *    field-state bindings, and dropdown logic across separate files.
 */
data class PropertyFormUiState(
    val isEditMode: Boolean = false,
    val propertyId: String? = null,
    val form: PropertyFormData = PropertyFormData(),
    val existingPhotos: List<String> = emptyList(),
    val newPhotos: List<Uri> = emptyList(),
    val propertyLoading: Boolean = false,
    val propertyError: String? = null,
    val submitLoading: Boolean = false,
    val submitError: String? = null
)

class PropertyFormViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
    private val editId: String? = savedStateHandle.get<String>("id")

    private val _state = MutableStateFlow(
        PropertyFormUiState(
            isEditMode = editId != null,
            propertyId = editId,
            propertyLoading = editId != null,
            form = if (editId == null) createDefaultAddForm() else PropertyFormData()
        )
    )
    val state: StateFlow<PropertyFormUiState> = _state.asStateFlow()

    init {
        if (editId != null) {
            loadPropertyToEdit(editId)
        }
    }

    private fun createDefaultAddForm(): PropertyFormData {
        val v = ConfigRepository.state.value.config?.fieldValidation
        return PropertyFormData(
            propertyType = "apartment",
            furnishing = "unfurnished",
            deposit = (v?.deposit?.min ?: 0).toString(),
            bedrooms = (v?.bedrooms?.min ?: 1).toString(),
            bathrooms = (v?.bathrooms?.min ?: 1).toString(),
            floorNo = (v?.floorNo?.min ?: 0).toString(),
            totalFloors = (v?.totalFloors?.min ?: 0).toString()
        )
    }

    private fun loadPropertyToEdit(id: String) {
        viewModelScope.launch {
            _state.update { it.copy(propertyLoading = true, propertyError = null) }
            try {
                val p = PropertyRepository.getProperty(id)
                _state.update {
                    it.copy(
                        propertyLoading = false,
                        form = PropertyFormData(
                            cityId = p.cityId,
                            locality = p.locality,
                            propertyType = p.propertyType,
                            furnishing = p.furnishing,
                            rent = p.rent.toString(),
                            deposit = p.deposit.toString(),
                            carpetAreaSqft = p.carpetAreaSqft.toString(),
                            bedrooms = p.bedrooms.toString(),
                            bathrooms = p.bathrooms.toString(),
                            floorNo = p.floorNo.toString(),
                            totalFloors = p.totalFloors.toString(),
                            hasParking = p.hasParking,
                            hasLift = p.hasLift,
                            allowSingleMale = p.allowSingleMale,
                            allowSingleFemale = p.allowSingleFemale,
                            allowFamily = p.allowFamily
                        ),
                        existingPhotos = p.photos
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        propertyLoading = false,
                        propertyError = errorMessage(e).ifBlank {
                            "Failed to load property data. It may have been deleted or you do not have permission."
                        }
                    )
                }
            }
        }
    }

    fun updateForm(transform: (PropertyFormData) -> PropertyFormData) {
        _state.update { it.copy(form = transform(it.form), submitError = null) }
    }

    fun removeExistingPhoto(photoUrl: String) {
        _state.update { it.copy(existingPhotos = it.existingPhotos - photoUrl) }
    }

    fun removeNewPhoto(uri: Uri) {
        _state.update { it.copy(newPhotos = it.newPhotos - uri) }
    }

    fun addNewPhotos(selectedUris: List<Uri>) {
        if (selectedUris.isEmpty()) return

        val photoRules = ConfigRepository.state.value.config?.fieldValidation?.photos
        val maxCount = photoRules?.maxCount ?: 10
        val maxSizeMb = photoRules?.maxSizeMb ?: 5
        val allowedTypes = photoRules?.allowedTypes ?: listOf("image/jpeg", "image/png", "image/webp")

        val currentTotal = _state.value.existingPhotos.size + _state.value.newPhotos.size
        if (currentTotal + selectedUris.size > maxCount) {
            _state.update { it.copy(submitError = "You can upload a maximum of $maxCount photos.") }
            return
        }

        val resolver = RentalsApp.instance.contentResolver
        val maxBytes = maxSizeMb * 1024L * 1024L

        for (uri in selectedUris) {
            val mimeType = resolver.getType(uri)
            if (mimeType == null || !allowedTypes.contains(mimeType)) {
                _state.update {
                    it.copy(submitError = "Only JPEG, PNG, and WebP images are allowed.")
                }
                return
            }

            val fileSize = resolver.query(uri, arrayOf(OpenableColumns.SIZE), null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) cursor.getLong(0) else 0L
            } ?: 0L

            if (fileSize > maxBytes) {
                _state.update {
                    it.copy(submitError = "Each photo must be smaller than ${maxSizeMb}MB.")
                }
                return
            }
        }

        _state.update { current ->
            val combined = (current.newPhotos + selectedUris).distinct()
            current.copy(newPhotos = combined, submitError = null)
        }
    }

    fun submit(onSuccess: () -> Unit) {
        val s = _state.value
        val f = s.form

        // Input Validation
        if (!f.isComplete) {
            _state.update { it.copy(submitError = "Please fill out all required fields with valid numbers.") }
            return
        }

        val floor = f.floorNo.toIntOrNull() ?: 0
        val totalFloors = f.totalFloors.toIntOrNull() ?: 0
        if (floor > totalFloors) {
            _state.update { it.copy(submitError = "Floor number cannot be greater than total floors") }
            return
        }

        if (!f.allowFamily && !f.allowSingleMale && !f.allowSingleFemale) {
            _state.update { it.copy(submitError = "At least one tenant preference must be selected") }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(submitLoading = true, submitError = null) }
            try {
                if (s.isEditMode && s.propertyId != null) {
                    PropertyRepository.updateProperty(
                        id = s.propertyId,
                        form = s.form,
                        existingPhotos = s.existingPhotos,
                        newPhotos = s.newPhotos
                    )
                    _state.update { it.copy(submitLoading = false) }
                    onSuccess()   // When 100% finished, invokes callback
                } else {
                    PropertyRepository.createProperty(
                        form = s.form,
                        existingPhotos = s.existingPhotos,
                        newPhotos = s.newPhotos
                    )
                    _state.update { it.copy(submitLoading = false) }
                    onSuccess()
                }
            } catch (e: Exception) {
                val fallback = if (s.isEditMode) {
                    "Failed to update property. Please try again."
                } else {
                    "Failed to create property. Please try again."
                }
                _state.update {
                    it.copy(
                        submitLoading = false,
                        submitError = errorMessage(e).ifBlank { fallback }
                    )
                }
            }
        }
    }
}
