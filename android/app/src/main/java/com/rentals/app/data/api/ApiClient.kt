package com.rentals.app.data.api

import com.rentals.app.BuildConfig
import com.rentals.app.RentalsApp
import com.rentals.app.data.repository.AuthRepository
import okhttp3.Cache
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File

// One Retrofit instance for the whole app, like the axios instance in api.js
object ApiClient {

    // Server address without trailing slash. Images use it directly, the API adds /api/v1/
    private val host = BuildConfig.API_BASE_URL.trimEnd('/')

    // Disk cache behaves like the browser cache: ETag revalidation, /config reused for 24 hours
    private val cache = Cache(File(RentalsApp.instance.cacheDir, "http_cache"), 10L * 1024 * 1024)

    // Same job as the axios request interceptor: attach the Bearer token
    private val authInterceptor = Interceptor { chain ->
        val token = AuthRepository.token.value
        val request = if (token == null) {
            chain.request()
        } else {
            chain.request().newBuilder().header("Authorization", "Bearer $token").build()
        }
        val response = chain.proceed(request)

        // Expired or invalid token: log out so the UI returns to the logged-out state.
        // The token comparison ignores a late 401 that belongs to an older session.
        if (response.code == 401 && token != null && token == AuthRepository.token.value) {
            AuthRepository.logout()
        }
        response
    }

    private val okHttpClient = OkHttpClient.Builder()
        .cache(cache)
        .addInterceptor(authInterceptor)
        .apply {
            if (BuildConfig.DEBUG) {
                // BASIC logs only method, url and status. Bodies (passwords, tokens) stay out of logcat
                addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC })
            }
        }
        .build()

    val service: ApiService = Retrofit.Builder()
        .baseUrl("$host/api/v1/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)

    // Photo paths from the backend look like /images/abc.jpg
    fun imageUrl(path: String): String = host + path

    fun clearCache() {
        cache.evictAll()
    }
}