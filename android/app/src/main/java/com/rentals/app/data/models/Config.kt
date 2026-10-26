package com.rentals.app.data.models

// Only the parts of /config that the app uses. Other keys are ignored.
data class ConfigData(
    val options: ConfigOptions,
    val fieldValidation: FieldValidation
)

data class ConfigOptions(
    val cities: List<City>,
    val propertyTypes: List<String>,
    val furnishingTypes: List<String>,
    val sorts: List<String>
)

data class City(
    val id: Int,
    val name: String
)

data class FieldRule(
    val type: String? = null,
    val required: Boolean = false,
    val min: Int? = null,
    val default: Boolean? = null
)

// Server-Driven UI (SDUI) contract: maps dynamic validation rules, min bounds,
// and required asterisks from /api/v1/config to keep business constraints
// synchronized across Android and Web without hardcoding them in the client.
data class FieldValidation(
    val cityId: FieldRule? = null,
    val locality: FieldRule? = null,
    val rent: FieldRule? = null,
    val deposit: FieldRule? = null,
    val carpetAreaSqft: FieldRule? = null,
    val bedrooms: FieldRule? = null,
    val bathrooms: FieldRule? = null,
    val totalFloors: FieldRule? = null,
    val floorNo: FieldRule? = null,
    val furnishing: FieldRule? = null,
    val propertyType: FieldRule? = null,
    val hasParking: FieldRule? = null,
    val hasLift: FieldRule? = null,
    val allowSingleMale: FieldRule? = null,
    val allowSingleFemale: FieldRule? = null,
    val allowFamily: FieldRule? = null,
    val photos: PhotoRules
)

data class PhotoRules(
    val maxCount: Int,
    val maxSizeMb: Int,
    val allowedTypes: List<String>
)
