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