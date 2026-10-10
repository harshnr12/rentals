package com.rentals.app.data.api

import com.google.gson.Gson
import retrofit2.HttpException
import java.io.IOException
import kotlinx.coroutines.CancellationException

// Readable error for the UI. resetAt is set only by the contact limit (HTTP 429).
data class ApiError(
    val message: String,
    val resetAt: String? = null
)

// Backend failure JSON. The global rate limiter sends "error", every other failure sends "message".
private class ErrorBody(
    val message: String?,
    val error: String?,
    val resetAt: String?
)

private val gson = Gson()

// The error body can be read only once, so call this once per exception
fun Throwable.toApiError(): ApiError = when (this) {
    is HttpException -> {
        val body = try {
            gson.fromJson(response()?.errorBody()?.string(), ErrorBody::class.java)
        } catch (e: Exception) {
            null
        }
        ApiError(
            message = body?.message ?: body?.error ?: "Request failed (${code()})",
            resetAt = body?.resetAt
        )
    }
    is IOException -> ApiError("Cannot reach the server. Check the connection and try again.")
    else -> ApiError("Something went wrong. Please try again.")
}

// Runs a network call and returns Result. Cancellation is rethrown on purpose:
// swallowing it would break LaunchedEffect restarts and ViewModel scope cleanup.
suspend fun <T> apiCall(block: suspend () -> T): Result<T> =
    try {
        Result.success(block())
    } catch (e: CancellationException) {
        throw e // Let Compose and ViewModel manage lifecycle cancellation
    } catch (e: Throwable) {
        Result.failure(e) // Safely catch EVERYTHING else, including fatal network errors
    }