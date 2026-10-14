package com.rentals.app.data.api

import com.rentals.app.BuildConfig
import com.rentals.app.data.repository.AuthRepository
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// Configures Retrofit and OkHttp. Injects authentication headers and retains
// standard Logcat output without disk cache overhead.
object ApiClient {

    // Normalizes the host URL and appends the Express router prefix with a trailing slash
    private val BASE_URL = "${BuildConfig.API_BASE_URL.trimEnd('/')}/api/v1/"

    // Injects the current JWT bearer token into outgoing requests
    private val authInterceptor = Interceptor { chain ->
        val originalRequest = chain.request()
        val token = AuthRepository.getToken()

        val request = if (!token.isNullOrBlank()) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }

        chain.proceed(request)
    }

    // Default tag for filtering in terminal via `adb logcat -s OkHttp`
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val service: ApiService = retrofit.create(ApiService::class.java)
}