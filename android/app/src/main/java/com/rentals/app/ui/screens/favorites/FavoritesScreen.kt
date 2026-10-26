package com.rentals.app.ui.screens.favorites

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.rentals.app.data.repository.AuthRepository
import com.rentals.app.ui.components.CollectionHeader
import com.rentals.app.ui.components.GuestPromptCard
import com.rentals.app.ui.components.PropertyList

@Composable
fun FavoritesScreen(navController: NavController) {
    val token by AuthRepository.token.collectAsStateWithLifecycle()

    if (token.isNullOrBlank()) {
        GuestPromptCard(
            icon = Icons.Filled.Favorite,
            title = "Favorite Properties",
            subtitle = "Log in or create an account to save your favorite properties and access them anytime.",
            navController = navController
        )
        return
    }

    val viewModel: FavoritesViewModel = viewModel()
    val state by viewModel.state.collectAsStateWithLifecycle()
    val count = state.properties.size
    val badgeText = if (!state.loading && state.error == null) {
        "$count ${if (count == 1) "favorite" else "favorites"}"
    } else null

    PropertyList(
        properties = state.properties,
        loading = state.loading,
        error = state.error,
        navController = navController,
        onFavoriteClick = viewModel::toggleFavorite,
        emptyMessage = "No favorite properties yet. Click the heart icon on any listing to save it here.",
        header = {
            CollectionHeader(
                title = "Favorite Properties",
                badgeText = badgeText
            )
        }
    )
}
