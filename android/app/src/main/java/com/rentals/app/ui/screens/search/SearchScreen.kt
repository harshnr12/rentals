package com.rentals.app.ui.screens.search

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.rentals.app.data.repository.ConfigRepository
import com.rentals.app.ui.components.PropertyList

private fun formatString(str: String): String {
    if (str.isBlank()) return ""
    return str.split("_").joinToString(" ") { word ->
        word.replaceFirstChar { it.uppercase() }
    }
}

private val sortLabels = mapOf(
    "newest" to "Newest First",
    "rent_asc" to "Rent (Low to High)",
    "rent_desc" to "Rent (High to Low)"
)

// Uses PropertyList with the header slot so the entire filter
// form scrolls smoothly off-screen while browsing search results.
// Includes a collapsible "Filters" card toggle so mobile users
// can also collapse/expand the filter form with one tap
// if they want to jump straight to results.
@Composable
fun SearchScreen(
    navController: NavController,
    viewModel: SearchViewModel = viewModel()
) {
    val configState by ConfigRepository.state.collectAsStateWithLifecycle()
    val searchState by viewModel.state.collectAsStateWithLifecycle()

    if (configState.loading) {
        Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Text("Loading Search...")
        }
        return
    }

    val options = configState.config?.options
    val cities = options?.cities.orEmpty()
    val propertyTypes = options?.propertyTypes.orEmpty()
    val furnishingTypes = options?.furnishingTypes.orEmpty()
    val sorts = options?.sorts.orEmpty()

    val filters = searchState.filters
    var filtersExpanded by remember { mutableStateOf(false) }

    PropertyList(
        properties = searchState.properties,
        loading = searchState.loading,
        error = searchState.error,
        navController = navController,
        onFavoriteClick = viewModel::toggleFavorite,
        emptyMessage = "No properties match the search filters.",
        title = "${searchState.properties.size} Properties Found",
        header = {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.medium,
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { filtersExpanded = !filtersExpanded },
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (filtersExpanded) "Hide Filters ▲" else "Show Filters ▼",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    if (filtersExpanded) {
                        // City
                        SelectField(
                            label = "City",
                            selectedLabel = cities.find { it.id == filters.cityId }?.name ?: "All Cities",
                            options = listOf("" to "All Cities") + cities.map { it.id.toString() to it.name },
                            onSelect = { id -> viewModel.updateFilters { it.copy(cityId = id.toIntOrNull()) } }
                        )

                        // Locality
                        OutlinedTextField(
                            value = filters.locality,
                            onValueChange = { v -> viewModel.updateFilters { it.copy(locality = v) } },
                            label = { Text("Locality") },
                            placeholder = { Text("e.g. Bandra") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        // Property Type
                        SelectField(
                            label = "Property Type",
                            selectedLabel = if (filters.propertyType.isBlank()) "Any" else formatString(filters.propertyType),
                            options = listOf("" to "Any") + propertyTypes.map { it to formatString(it) },
                            onSelect = { type -> viewModel.updateFilters { it.copy(propertyType = type) } }
                        )

                        // Min Bedrooms & Min Bathrooms side-by-side
                        val countOptions = listOf("" to "Any") + (1..5).map { "$it" to "$it" }
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Box(modifier = Modifier.weight(1f)) {
                                SelectField(
                                    label = "Min Bedrooms",
                                    selectedLabel = filters.minBedrooms.ifBlank { "Any" },
                                    options = countOptions,
                                    onSelect = { v -> viewModel.updateFilters { it.copy(minBedrooms = v) } }
                                )
                            }
                            Box(modifier = Modifier.weight(1f)) {
                                SelectField(
                                    label = "Min Bathrooms",
                                    selectedLabel = filters.minBathrooms.ifBlank { "Any" },
                                    options = countOptions,
                                    onSelect = { v -> viewModel.updateFilters { it.copy(minBathrooms = v) } }
                                )
                            }
                        }

                        // Furnishing Multi-Select Checkboxes
                        Text(
                            text = "Furnishing",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        furnishingTypes.forEach { type ->
                            CheckboxRow(
                                label = formatString(type),
                                checked = filters.furnishing.contains(type),
                                onCheckedChange = { viewModel.toggleFurnishing(type) }
                            )
                        }

                        // Min & Max Rent
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            OutlinedTextField(
                                value = filters.minRent,
                                onValueChange = { v -> viewModel.updateFilters { it.copy(minRent = v) } },
                                label = { Text("Min Rent (₹)") },
                                placeholder = { Text("0") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = filters.maxRent,
                                onValueChange = { v -> viewModel.updateFilters { it.copy(maxRent = v) } },
                                label = { Text("Max Rent (₹)") },
                                placeholder = { Text("No limit") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f)
                            )
                        }

                        // Amenities
                        Text(
                            text = "Amenities",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        CheckboxRow(
                            label = "Parking",
                            checked = filters.hasParking,
                            onCheckedChange = { c -> viewModel.updateFilters { it.copy(hasParking = c) } }
                        )
                        CheckboxRow(
                            label = "Lift",
                            checked = filters.hasLift,
                            onCheckedChange = { c -> viewModel.updateFilters { it.copy(hasLift = c) } }
                        )

                        // Tenants Allowed
                        Text(
                            text = "Tenants Allowed",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        CheckboxRow(
                            label = "Family",
                            checked = filters.allowFamily,
                            onCheckedChange = { c -> viewModel.updateFilters { it.copy(allowFamily = c) } }
                        )
                        CheckboxRow(
                            label = "Single Male",
                            checked = filters.allowSingleMale,
                            onCheckedChange = { c -> viewModel.updateFilters { it.copy(allowSingleMale = c) } }
                        )
                        CheckboxRow(
                            label = "Single Female",
                            checked = filters.allowSingleFemale,
                            onCheckedChange = { c -> viewModel.updateFilters { it.copy(allowSingleFemale = c) } }
                        )

                        // Sort By
                        SelectField(
                            label = "Sort By",
                            selectedLabel = sortLabels[filters.sort] ?: formatString(filters.sort),
                            options = sorts.map { it to (sortLabels[it] ?: formatString(it)) },
                            onSelect = { s -> viewModel.updateFilters { it.copy(sort = s) } }
                        )

                        // Actions (Apply Filters / Clear)
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Button(
                                onClick = {
                                    filtersExpanded = false
                                    viewModel.applyFilters()
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Apply Filters")
                            }
                            OutlinedButton(
                                onClick = {
                                    filtersExpanded = false
                                    viewModel.clearFilters()
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Clear")
                            }
                        }
                    }
                }
            }
        }
    )
}

@Composable
private fun SelectField(
    label: String,
    selectedLabel: String,
    options: List<Pair<String, String>>,
    onSelect: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Box {
            OutlinedCard(
                onClick = { expanded = true },
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.small,
                colors = CardDefaults.outlinedCardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = selectedLabel, style = MaterialTheme.typography.bodyMedium)
                    Icon(imageVector = Icons.Filled.ArrowDropDown, contentDescription = label)
                }
            }

            DropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                options.forEach { (value, display) ->
                    DropdownMenuItem(
                        text = { Text(display) },
                        onClick = {
                            expanded = false
                            onSelect(value)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun CheckboxRow(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) },
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(checked = checked, onCheckedChange = onCheckedChange)
        Text(text = label, style = MaterialTheme.typography.bodyMedium)
    }
}
