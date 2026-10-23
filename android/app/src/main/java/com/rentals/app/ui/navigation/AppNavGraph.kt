package com.rentals.app.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.rentals.app.data.repository.AuthRepository
import com.rentals.app.data.repository.ConfigRepository
import com.rentals.app.data.repository.UserDataRepository
import com.rentals.app.ui.screens.home.HomeScreen
import com.rentals.app.ui.screens.auth.LoginScreen
import com.rentals.app.ui.screens.auth.SignupScreen
import com.rentals.app.ui.screens.search.SearchScreen
import com.rentals.app.ui.screens.profile.ProfileScreen

@Composable
fun AppNavGraph() {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val showBottomBar = isTabRoute(backStackEntry?.destination?.route)

    val token by AuthRepository.token.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        ConfigRepository.load()
    }

    LaunchedEffect(token) {
        if (token != null) {
            try {
                UserDataRepository.load()
            } catch (_: Exception) {
                // Screen-level state handles display
            }
        } else {
            UserDataRepository.clear()
        }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = { if (showBottomBar) BottomBar(navController) }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Routes.HOME,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Routes.HOME) { HomeScreen(navController) }
            composable(
                route = Routes.SEARCH,
                arguments = listOf(
                    navArgument("cityId") {
                        type = NavType.StringType
                        nullable = true
                        defaultValue = null
                    }
                )
            ) { SearchScreen(navController) }
            composable(Routes.LOGIN) { LoginScreen(navController) }
            composable(Routes.SIGNUP) { SignupScreen(navController) }

            composable(Routes.PROFILE) { ProfileScreen(navController) }

            composable(Routes.FAVORITES) { Placeholder("Favorites") }
            composable(Routes.CONTACTED) { Placeholder("Contacted") }
            composable(Routes.MY_LISTINGS) { Placeholder("My Listings") }

            composable(Routes.ADD_PROPERTY) { Placeholder("Add Property") }
            composable(Routes.EDIT_PROPERTY) { Placeholder("Edit Property") }

            composable(Routes.DETAILS) { Placeholder("Details") }
        }
    }
}

@Composable
private fun Placeholder(name: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text = name, style = MaterialTheme.typography.titleLarge)
    }
}
