package com.rentals.app.data.api

import org.json.JSONObject
import retrofit2.HttpException
import java.io.IOException

/**
 * Extracts human-readable error messages from network exceptions.
 * Parses standard JSON error responses returned by the Express backend.
 */
fun errorMessage(e: Exception): String {
    if (e is HttpException) {
        val rawBody = e.response()?.errorBody()?.string()
        val json = try {
            JSONObject(rawBody ?: "")
        } catch (_: Exception) {
            JSONObject()
        }

        // Extracts standard {"message": ...} or rate-limiter {"error": ...} payloads
        val message = json.optString("message").ifEmpty { json.optString("error") }
        return message.ifEmpty { "Request failed (${e.code()})" }
    }

    if (e is IOException) {
        return "Cannot reach the server. Please check device network connectivity."
    }

    return "An unexpected error occurred."
}