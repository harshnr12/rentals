package com.rentals.app.ui.screens.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.rentals.app.data.repository.ConfigRepository
import com.rentals.app.ui.components.PropertyList
import com.rentals.app.ui.navigation.Routes


// Just like Home.jsx: checks configState.loading and configState.error
// first, renders the welcome banner + city picker dropdown inside
// the PropertyList header slot, and navigates to
// Routes.search(cityId = city.id.toString()) when a city is selected.

@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = viewModel()
) {
    val configState by ConfigRepository.state.collectAsStateWithLifecycle()
    val homeState by viewModel.state.collectAsStateWithLifecycle()

    if (configState.loading) {
        Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Text("Loading...")
        }
        return
    }

    if (configState.error != null) {
        Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Text(
                text = "Unable to load search options.",
                color = MaterialTheme.colorScheme.error
            )
        }
        return
    }

    val cities = configState.config?.options?.cities.orEmpty()
    var dropdownExpanded by remember { mutableStateOf(false) }

    PropertyList(
        properties = homeState.properties,
        loading = homeState.loading,
        error = homeState.error,
        navController = navController,
        onFavoriteClick = viewModel::toggleFavorite,
        emptyMessage = "No properties found.",
        title = "All Properties",
        header = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = "Welcome to Rentals!",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Find a place that fits your needs.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                // City Picker (<select id="city"> without experimental APIs)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Choose a city",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Box {
                        OutlinedCard(
                            onClick = { dropdownExpanded = true },
                            modifier = Modifier.fillMaxWidth(),
                            shape = MaterialTheme.shapes.small,
                            colors = CardDefaults.outlinedCardColors(
                                containerColor = MaterialTheme.colorScheme.surface
                            ),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 14.dp, vertical = 12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "All Cities",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                                Icon(
                                    imageVector = Icons.Filled.ArrowDropDown,
                                    contentDescription = "Choose a city"
                                )
                            }
                        }

                        DropdownMenu(
                            expanded = dropdownExpanded,
                            onDismissRequest = { dropdownExpanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("All Cities") },
                                onClick = { dropdownExpanded = false }
                            )
                            cities.forEach { city ->
                                DropdownMenuItem(
                                    text = { Text(city.name) },
                                    onClick = {
                                        dropdownExpanded = false
                                        navController.navigate(Routes.search(cityId = city.id.toString()))
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    )
}
