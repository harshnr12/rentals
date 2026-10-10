package com.rentals.app

import android.app.Application

class RentalsApp : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    companion object {
        lateinit var instance: RentalsApp
            private set
    }
}