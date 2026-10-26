package com.rentals.app.data.repository

import android.net.Uri
import com.rentals.app.RentalsApp
import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.models.ContactedResponse
import com.rentals.app.data.models.Owner
import com.rentals.app.data.models.Property
import com.rentals.app.data.models.PropertyFormData
import com.rentals.app.data.models.SearchFilters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

// Stateless repository for property API calls.
// Broadcasts mutations via propertyUpdates so active ViewModels can refresh.
object PropertyRepository {

    // Broadcasts an event whenever property data is mutated
    private val _propertyUpdates = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val propertyUpdates = _propertyUpdates.asSharedFlow()

    // Retrofit skips null values, so empty text and false are turned into null here
    suspend fun getProperties(filters: SearchFilters = SearchFilters()): List<Property> =
        ApiClient.service.getProperties(
            cityId = filters.cityId,
            locality = filters.locality.trim().takeIf { it.isNotEmpty() },
            minRent = filters.minRent.toIntOrNull(),
            maxRent = filters.maxRent.toIntOrNull(),
            minBedrooms = filters.minBedrooms.toIntOrNull(),
            minBathrooms = filters.minBathrooms.toIntOrNull(),
            propertyType = filters.propertyType.takeIf { it.isNotEmpty() },
            furnishing = filters.furnishing,
            hasParking = filters.hasParking.takeIf { it },
            hasLift = filters.hasLift.takeIf { it },
            allowSingleMale = filters.allowSingleMale.takeIf { it },
            allowSingleFemale = filters.allowSingleFemale.takeIf { it },
            allowFamily = filters.allowFamily.takeIf { it },
            sort = filters.sort.takeIf { it.isNotEmpty() }
        ).properties

    suspend fun getProperty(id: String): Property =
        ApiClient.service.getProperty(id).property

    suspend fun getMyProperties(): List<Property> =
        ApiClient.service.getMyProperties().properties

    suspend fun getFavorites(): List<Property> =
        ApiClient.service.getMyFavorites().properties

    suspend fun getContacted(): ContactedResponse =
        ApiClient.service.getMyContacted()

    suspend fun getOwnerContact(id: String): Owner =
        ApiClient.service.getOwnerContact(id).owner

    suspend fun deleteProperty(id: String) {
        ApiClient.service.deleteProperty(id)
        _propertyUpdates.tryEmit(Unit)
    }

    suspend fun createProperty(
        form: PropertyFormData,
        existingPhotos: List<String>,
        newPhotos: List<Uri>
    ) {
        ApiClient.service.createProperty(buildRequest(form, existingPhotos, newPhotos))
        _propertyUpdates.tryEmit(Unit)
    }

    suspend fun updateProperty(
        id: String,
        form: PropertyFormData,
        existingPhotos: List<String>,
        newPhotos: List<Uri>
    ) {
        ApiClient.service.updateProperty(id, buildRequest(form, existingPhotos, newPhotos))
        _propertyUpdates.tryEmit(Unit)
    }

    // Two steps like the web app: upload new photos first, then send the JSON
    // with the old photo urls plus the new ones
    private suspend fun buildRequest(
        form: PropertyFormData,
        existingPhotos: List<String>,
        newPhotos: List<Uri>
    ) = form.toRequest(existingPhotos + uploadPhotos(newPhotos))
        ?: error("Form is incomplete")

    private suspend fun uploadPhotos(uris: List<Uri>): List<String> {
        if (uris.isEmpty()) return emptyList()

        val resolver = RentalsApp.instance.contentResolver

        // Reading image files is disk work, so it runs on the IO dispatcher
        val parts = withContext(Dispatchers.IO) {
            uris.mapIndexed { index, uri ->
                val mimeType = resolver.getType(uri) ?: "image/jpeg"
                val bytes = resolver.openInputStream(uri)?.use { it.readBytes() }
                    ?: error("Cannot read the selected image")
                // The backend builds the saved file name from the extension of this name
                val extension = mimeType.substringAfter('/')
                MultipartBody.Part.createFormData(
                    "photos",
                    "photo_$index.$extension",
                    bytes.toRequestBody(mimeType.toMediaType())
                )
            }
        }
        return ApiClient.service.uploadPhotos(parts).photoUrls
    }
}
