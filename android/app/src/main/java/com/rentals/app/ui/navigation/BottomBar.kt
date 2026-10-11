package com.rentals.app.ui.navigation

import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.currentBackStackEntryAsState

// route is the NavHost pattern (used to detect the selected tab),
// target is the real destination to navigate to
private data class BottomTab(
    val label: String,
    val icon: ImageVector,
    val route: String,
    val target: String
)

private val tabs = listOf(
    BottomTab("Home", Icons.Filled.Home, Routes.HOME, Routes.HOME),
    BottomTab("Search", Icons.Filled.Search, Routes.SEARCH, Routes.SEARCH_BASE),
    BottomTab("Favorites", Icons.Filled.Favorite, Routes.FAVORITES, Routes.FAVORITES),
    BottomTab("Profile", Icons.Filled.Person, Routes.PROFILE, Routes.PROFILE)
)

// The bar is shown only on the 4 tab screens
fun isTabRoute(route: String?): Boolean = tabs.any { it.route == route }

@Composable
fun BottomBar(navController: NavController) {
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = backStackEntry?.destination

    Column {
        HorizontalDivider(color = MaterialTheme.colorScheme.outline)
        NavigationBar {
            tabs.forEach { tab ->
                NavigationBarItem(
                    selected = currentDestination?.hierarchy?.any { it.route == tab.route } == true,
                    onClick = { navController.navigateToTab(tab.target) },
                    icon = { Icon(tab.icon, contentDescription = tab.label) },
                    label = { Text(tab.label) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        selectedTextColor = MaterialTheme.colorScheme.primary,
                        // Same color as the bar, so only the icon and label show the selection
                        indicatorColor = MaterialTheme.colorScheme.surface
                    )
                )
            }
        }
    }
}

// Tabs do not pile up: switching pops back to Home, and each tab keeps its own state
private fun NavController.navigateToTab(route: String) {
    navigate(route) {
        popUpTo(graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}