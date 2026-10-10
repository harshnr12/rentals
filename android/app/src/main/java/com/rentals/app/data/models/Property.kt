package com.rentals.app.data.models

import com.google.gson.annotations.SerializedName

// Response class: backend JSON uses snake_case, @SerializedName maps it to camelCase
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