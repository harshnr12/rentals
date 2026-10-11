package com.rentals.app.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument

// All screens live here, like the routes in App.jsx
@Composable
fun AppNavGraph() {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val showBottomBar = isTabRoute(backStackEntry?.destination?.route)

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = { if (showBottomBar) BottomBar(navController) }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Routes.HOME,
            // Scaffold already adds the status and navigation bar space. Consuming it here lets
            // imePadding() inside screens add only the keyboard height.
            modifier = Modifier.padding(innerPadding).consumeWindowInsets(innerPadding)
        ) {
            composable(Routes.HOME) { Placeholder("Home") }
            composable(
                route = Routes.SEARCH,
                arguments = listOf(
                    navArgument("cityId") {
                        type = NavType.StringType
                        nullable = true
                        defaultValue = null
                    }
                )
            ) { Placeholder("Search") }
            composable(Routes.FAVORITES) { Placeholder("Favorites") }
            composable(Routes.PROFILE) { Placeholder("Profile") }

            composable(Routes.LOGIN) { Placeholder("Login") }
            composable(Routes.SIGNUP) { Placeholder("Signup") }
            composable(Routes.CONTACTED) { Placeholder("Contacted") }
            composable(Routes.MY_LISTINGS) { Placeholder("My Listings") }
            composable(Routes.ADD_PROPERTY) { Placeholder("Add Property") }
            composable(
                route = Routes.DETAILS,
                arguments = listOf(navArgument("id") { type = NavType.StringType })
            ) { Placeholder("Details") }
            composable(
                route = Routes.EDIT_PROPERTY,
                arguments = listOf(navArgument("id") { type = NavType.StringType })
            ) { Placeholder("Edit Property") }
        }
    }
}

// Temporary: replaced by the real screen later
@Composable
private fun Placeholder(name: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text = name, style = MaterialTheme.typography.titleLarge)
    }
}