package com.rentals.app.ui.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraph.Companion.findStartDestination

// Screen routes. Backend REST paths are separate (in ApiService).
object Routes {
    const val HOME = "home"
    const val FAVORITES = "favorites"
    const val PROFILE = "profile"

    // Search has an optional cityId, set when a city is picked on Home.
    // SEARCH is the pattern used by the NavHost, SEARCH_BASE is what tabs navigate to.
    const val SEARCH_BASE = "search"
    const val SEARCH = "search?cityId={cityId}"
    fun search(cityId: Int): String = "search?cityId=$cityId"

    const val LOGIN = "login"
    const val SIGNUP = "signup"
    const val CONTACTED = "contacted"
    const val MY_LISTINGS = "my_listings"
    const val ADD_PROPERTY = "add_property"

    const val DETAILS = "details/{id}"
    fun details(id: String): String = "details/$id"

    const val EDIT_PROPERTY = "edit_property/{id}"
    fun editProperty(id: String): String = "edit_property/$id"
}

// Used after login, signup and logout: drop every screen and show one fresh Home.
// Back from Home then exits the app, and no old screen with stale data stays behind.
fun NavController.navigateHomeAndClearStack() {
    navigate(Routes.HOME) {
        popUpTo(graph.findStartDestination().id) { inclusive = true }
        launchSingleTop = true
    }
}