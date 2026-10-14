package com.rentals.app

import android.app.Application
import com.rentals.app.data.repository.AuthRepository

class RentalsApp : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initializes sandboxed SharedPreferences once for the entire application session
        AuthRepository.init(this)
    }
    companion object {
        lateinit var instance: RentalsApp
            private set
    }
}