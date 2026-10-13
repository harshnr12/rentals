package com.rentals.app.ui.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraph.Companion.findStartDestination

object Routes {
    const val HOME = "home"
    const val SEARCH = "search?cityId={cityId}"
    const val FAVORITES = "favorites"
    const val PROFILE = "profile"

    const val LOGIN = "login"
    const val SIGNUP = "signup"
    const val CONTACTED = "contacted"
    const val MY_LISTINGS = "my_listings"
    const val ADD_PROPERTY = "add_property"

    const val DETAILS = "details/{id}"
    const val EDIT_PROPERTY = "edit_property/{id}"

    // Route navigation helpers
    fun search(cityId: String? = null): String =
        if (cityId != null) "search?cityId=$cityId" else "search"

    fun details(id: String): String = "details/$id"
    fun editProperty(id: String): String = "edit_property/$id"
}

// Clears entire backstack back to Home (used on Login, Signup, Logout)
fun NavController.navigateHomeAndClearStack() {
    navigate(Routes.HOME) {
        popUpTo(graph.findStartDestination().id) { inclusive = true }
        launchSingleTop = true
    }
}