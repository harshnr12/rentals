package com.rentals.app.data.models

import com.google.gson.annotations.SerializedName

// Response class: backend JSON uses snake_case, @SerializedName maps it to camelCase
data class PropertyResponse(
    val property: Property
)

data class PropertyListResponse(
    val properties: List<Property>
)

data class ContactedResponse(
    @SerializedName("lifetime_contacted_property_count") val lifetimeContactedPropertyCount: Int,
    val properties: List<Property>
)

data class ContactResponse(
    val owner: Owner
)

data class Owner(
    @SerializedName("owner_name") val name: String,
    @SerializedName("owner_phone") val phone: String
)

data class FavoriteToggleResponse(
    val favorited: Boolean
)

data class UploadResponse(
    val photoUrls: List<String>
)

data class Property(
    val id: String,
    // Missing in favorites and contacted lists, the backend hides it there
    @SerializedName("owner_id") val ownerId: String? = null,
    @SerializedName("city_id") val cityId: Int,
    val title: String,
    val locality: String,
    val rent: Int,
    val deposit: Int,
    @SerializedName("carpet_area_sqft") val carpetAreaSqft: Int,
    val bedrooms: Int,
    val bathrooms: Int,
    @SerializedName("floor_no") val floorNo: Int,
    @SerializedName("total_floors") val totalFloors: Int,
    val furnishing: String,
    @SerializedName("property_type") val propertyType: String,
    @SerializedName("has_parking") val hasParking: Boolean,
    @SerializedName("has_lift") val hasLift: Boolean,
    @SerializedName("allow_single_male") val allowSingleMale: Boolean,
    @SerializedName("allow_single_female") val allowSingleFemale: Boolean,
    @SerializedName("allow_family") val allowFamily: Boolean,
    val photos: List<String>
)

// Create and update body. Keys must match the backend validator exactly:
// camelCase and any extra key is rejected.
data class PropertyRequest(
    val cityId: Int,
    val locality: String,
    val rent: Int,
    val deposit: Int,
    val carpetAreaSqft: Int,
    val bedrooms: Int,
    val bathrooms: Int,
    val floorNo: Int,
    val totalFloors: Int,
    val furnishing: String,
    val propertyType: String,
    val hasParking: Boolean,
    val hasLift: Boolean,
    val allowSingleMale: Boolean,
    val allowSingleFemale: Boolean,
    val allowFamily: Boolean,
    // Existing photo urls plus the newly uploaded ones
    val photos: List<String>
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
