package com.rentals.app.data.api

import com.rentals.app.data.models.AuthResponse
import com.rentals.app.data.models.ConfigData
import com.rentals.app.data.models.ContactResponse
import com.rentals.app.data.models.ContactedResponse
import com.rentals.app.data.models.FavoriteToggleResponse
import com.rentals.app.data.models.LoginRequest
import com.rentals.app.data.models.MeResponse
import com.rentals.app.data.models.PropertyListResponse
import com.rentals.app.data.models.PropertyRequest
import com.rentals.app.data.models.PropertyResponse
import com.rentals.app.data.models.SignupRequest
import com.rentals.app.data.models.UploadResponse
import okhttp3.MultipartBody
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query

// One function per backend endpoint, like the exported functions in services/api.js.
// Paths have no leading slash so Retrofit appends them to the .../api/v1/ base URL.
interface ApiService {

    @GET("config")
    suspend fun getConfig(): ConfigData

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @POST("auth/signup")
    suspend fun signup(@Body body: SignupRequest): AuthResponse

    @GET("me")
    suspend fun getMe(): MeResponse

    @GET("me/properties")
    suspend fun getMyProperties(): PropertyListResponse

    @GET("me/favorites")
    suspend fun getMyFavorites(): PropertyListResponse

    @GET("me/contacted")
    suspend fun getMyContacted(): ContactedResponse

    @POST("me/favorites/{propertyId}")
    suspend fun toggleFavorite(@Path("propertyId") propertyId: String): FavoriteToggleResponse

    // Retrofit skips null query values, so unset filters never reach the URL.
    // Booleans must be true or null: false would match only properties WITHOUT the amenity.
    // furnishing is a list: Retrofit repeats the key (furnishing=a&furnishing=b).
    @GET("properties")
    suspend fun getProperties(
        @Query("cityId") cityId: Int? = null,
        @Query("locality") locality: String? = null,
        @Query("minRent") minRent: Int? = null,
        @Query("maxRent") maxRent: Int? = null,
        @Query("minBedrooms") minBedrooms: Int? = null,
        @Query("minBathrooms") minBathrooms: Int? = null,
        @Query("propertyType") propertyType: String? = null,
        @Query("furnishing") furnishing: List<String>? = null,
        @Query("hasParking") hasParking: Boolean? = null,
        @Query("hasLift") hasLift: Boolean? = null,
        @Query("allowSingleMale") allowSingleMale: Boolean? = null,
        @Query("allowSingleFemale") allowSingleFemale: Boolean? = null,
        @Query("allowFamily") allowFamily: Boolean? = null,
        @Query("sort") sort: String? = null
    ): PropertyListResponse

    @GET("properties/{id}")
    suspend fun getProperty(@Path("id") id: String): PropertyResponse

    @POST("properties")
    suspend fun createProperty(@Body body: PropertyRequest): PropertyResponse

    @PATCH("properties/{id}")
    suspend fun updateProperty(
        @Path("id") id: String,
        @Body body: PropertyRequest
    ): PropertyResponse

    // Retrofit still throws HttpException on a failure, so no response class is needed.
    @DELETE("properties/{id}")
    suspend fun deleteProperty(@Path("id") id: String)

    @GET("properties/{id}/contact")
    suspend fun getOwnerContact(@Path("id") id: String): ContactResponse

    // Each part is built with the form field name "photos", as the backend expects
    @Multipart
    @POST("upload")
    suspend fun uploadPhotos(@Part photos: List<MultipartBody.Part>): UploadResponse
}