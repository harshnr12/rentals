package com.rentals.app.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.rentals.app.data.models.Property
import com.rentals.app.data.repository.ConfigRepository

@Composable
fun PropertyList(
    properties: List<Property>,
    loading: Boolean,
    error: String?,
    navController: NavController,
    onFavoriteClick: (String) -> Unit,
    modifier: Modifier = Modifier,
    emptyMessage: String = "No properties found.",
    title: String? = null,
    header: (@Composable () -> Unit)? = null
) {
    val configState by ConfigRepository.state.collectAsStateWithLifecycle()
    val cities = configState.config?.options?.cities.orEmpty()

    // Resolves cityName from ConfigRepository.state just like PropertyList.jsx
    fun getCityName(cityId: Int): String {
        return cities.find { it.id == cityId }?.name.orEmpty()
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {

        // Optional custom composable header (used by Home and Search)
        if (header != null) {
            item { header() }
        }
        // Optional simple text heading (used by Favorites, Contacted, or below Home's header)
        if (title != null) {
            item {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Loading / Error / Empty / Card Items
        when {
            loading -> {
                item {
                    Text(
                        text = "Loading properties...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            }
            error != null -> {
                item {
                    Text(
                        text = "Error loading properties.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            }
            properties.isEmpty() -> {
                item {
                    Text(
                        text = emptyMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            }
            else -> {
                items(properties, key = { it.id }) { property ->
                    PropertyCard(
                        property = property,
                        cityName = getCityName(property.cityId),
                        navController = navController,
                        onFavoriteClick = onFavoriteClick
                    )
                }
            }
        }
    }
}
