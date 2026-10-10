package com.rentals.app

import android.app.Application
import com.rentals.app.data.repository.ConfigRepository
import com.rentals.app.data.repository.UserDataRepository

class RentalsApp : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Like the providers in main.jsx: they start once and live as long as the app process
        ConfigRepository.load()
        UserDataRepository.start()
    }

    companion object {
        lateinit var instance: RentalsApp
            private set
    }
}