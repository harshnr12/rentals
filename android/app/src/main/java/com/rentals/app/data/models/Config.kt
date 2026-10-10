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

data class FieldValidation(
    val photos: PhotoRules
)

data class PhotoRules(
    val maxCount: Int,
    val maxSizeMb: Int,
    val allowedTypes: List<String>
)