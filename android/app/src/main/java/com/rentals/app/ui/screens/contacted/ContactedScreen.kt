package com.rentals.app.ui.screens.contacted

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Phone
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
fun ContactedScreen(
    navController: NavController,
    viewModel: ContactedViewModel = viewModel()
) {
    val token by AuthRepository.token.collectAsStateWithLifecycle()

    if (token.isNullOrBlank()) {
        GuestPromptCard(
            icon = Icons.Filled.Phone,
            title = "Contacted Properties",
            subtitle = "Log in or create an account to view properties whose owners you have contacted.",
            navController = navController
        )
        return
    }

    val state by viewModel.state.collectAsStateWithLifecycle()
    val badgeText = if (!state.loading && state.error == null) {
        "${state.properties.size} active • ${state.lifetimeCount} lifetime inquiries"
    } else null

    PropertyList(
        properties = state.properties,
        loading = state.loading,
        error = state.error,
        navController = navController,
        onFavoriteClick = viewModel::toggleFavorite,
        emptyMessage = "No contacted properties found. Inquiries sent to property owners will appear here.",
        header = {
            CollectionHeader(
                title = "Contacted Properties",
                badgeText = badgeText
            )
        }
    )
}
