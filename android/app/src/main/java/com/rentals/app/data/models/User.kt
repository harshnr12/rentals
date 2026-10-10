package com.rentals.app.data.models

import com.google.gson.annotations.SerializedName

data class MeResponse(
    val user: User
)

// Property ids are BIGINT in PostgreSQL, so the backend sends them as strings
data class User(
    val id: String,
    val name: String,
    val email: String,
    val phone: String,
    @SerializedName("created_at") val createdAt: String,
    // SQL COUNT arrives as a string like "3"; Gson converts it to Int
    @SerializedName("lifetime_contacted_property_count") val lifetimeContactedPropertyCount: Int,
    @SerializedName("contacted_property_ids") val contactedPropertyIds: List<String>,
    @SerializedName("favorited_property_ids") val favoritedPropertyIds: List<String>
)


// Add/Edit form values as typed on screen. Numbers stay text until the request is built.
data class PropertyFormData(
    val cityId: Int? = null,
    val locality: String = "",
    val propertyType: String = "",
    val furnishing: String = "",
    val rent: String = "",
    val deposit: String = "",
    val carpetAreaSqft: String = "",
    val bedrooms: String = "",
    val bathrooms: String = "",
    val floorNo: String = "",
    val totalFloors: String = "",
    val hasParking: Boolean = false,
    val hasLift: Boolean = false,
    val allowSingleMale: Boolean = false,
    val allowSingleFemale: Boolean = false,
    val allowFamily: Boolean = false
) {
    // True when every required field is filled. Other rules are checked by the backend.
    val isComplete: Boolean
        get() = toRequest(emptyList()) != null

    // Returns null when a required field is empty or not a number
    fun toRequest(photos: List<String>): PropertyRequest? {
        val city = cityId ?: return null
        if (locality.isBlank() || propertyType.isEmpty() || furnishing.isEmpty()) return null
        return PropertyRequest(
            cityId = city,
            locality = locality.trim(),
            rent = rent.toIntOrNull() ?: return null,
            deposit = deposit.toIntOrNull() ?: return null,
            carpetAreaSqft = carpetAreaSqft.toIntOrNull() ?: return null,
            bedrooms = bedrooms.toIntOrNull() ?: return null,
            bathrooms = bathrooms.toIntOrNull() ?: return null,
            floorNo = floorNo.toIntOrNull() ?: return null,
            totalFloors = totalFloors.toIntOrNull() ?: return null,
            furnishing = furnishing,
            propertyType = propertyType,
            hasParking = hasParking,
            hasLift = hasLift,
            allowSingleMale = allowSingleMale,
            allowSingleFemale = allowSingleFemale,
            allowFamily = allowFamily,
            photos = photos
        )
    }
}

// Search filters as typed on screen. Empty text or false means "not set".
data class SearchFilters(
    val cityId: Int? = null,
    val locality: String = "",
    val propertyType: String = "",
    val minBedrooms: String = "",
    val minBathrooms: String = "",
    val furnishing: List<String> = emptyList(),
    val minRent: String = "",
    val maxRent: String = "",
    val hasParking: Boolean = false,
    val hasLift: Boolean = false,
    val allowSingleMale: Boolean = false,
    val allowSingleFemale: Boolean = false,
    val allowFamily: Boolean = false,
    val sort: String = "newest"
)