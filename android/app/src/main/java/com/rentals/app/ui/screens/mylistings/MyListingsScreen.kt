package com.rentals.app.ui.screens.mylistings

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.rentals.app.data.repository.AuthRepository
import com.rentals.app.ui.components.CollectionHeader
import com.rentals.app.ui.components.GuestPromptCard
import com.rentals.app.ui.components.PropertyList
import com.rentals.app.ui.navigation.Routes

@Composable
fun MyListingsScreen(
    navController: NavController,
    viewModel: MyListingsViewModel = viewModel()
) {
    val token by AuthRepository.token.collectAsStateWithLifecycle()

    if (token.isNullOrBlank()) {
        GuestPromptCard(
            icon = Icons.Filled.Home,
            title = "My Listings",
            subtitle = "Log in or create an account to post and manage your rental properties.",
            navController = navController
        )
        return
    }

    val state by viewModel.state.collectAsStateWithLifecycle()
    val count = state.properties.size
    val badgeText = if (!state.loading && state.error == null) {
        "$count ${if (count == 1) "listing" else "listings"}"
    } else null

    PropertyList(
        properties = state.properties,
        loading = state.loading,
        error = state.error,
        navController = navController,
        onFavoriteClick = viewModel::toggleFavorite,
        emptyMessage = "No listings posted yet. Use the button above to publish a rental listing.",
        header = {
            CollectionHeader(
                title = "My Listings",
                badgeText = badgeText,
                actionText = "+ Post Property",
                onActionClick = { navController.navigate(Routes.ADD_PROPERTY) }
            )
        }
    )
}
