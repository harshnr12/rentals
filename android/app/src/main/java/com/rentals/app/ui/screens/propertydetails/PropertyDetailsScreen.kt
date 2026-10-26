package com.rentals.app.ui.screens.propertydetails

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.models.Property
import com.rentals.app.data.repository.AuthRepository
import com.rentals.app.data.repository.ConfigRepository
import com.rentals.app.data.repository.UserDataRepository
import com.rentals.app.ui.navigation.Routes
import java.text.NumberFormat
import java.util.Locale

// Formats snake_case enums from backend (e.g., "semi_furnished" -> "Semi Furnished")
private fun formatOptionLabel(str: String): String {
    if (str.isBlank()) return ""
    return str.split("_").joinToString(" ") { word ->
        word.replaceFirstChar { it.uppercase() }
    }
}

// Formats daily rate-limit countdown seconds
private fun formatRemainingTime(seconds: Int): String {
    val hours = seconds / 3600
    val minutes = (seconds % 3600) / 60
    return if (hours > 0) "${hours}h ${minutes}m" else "${minutes}m"
}

@Composable
fun PropertyDetailsScreen(
    navController: NavController,
    viewModel: PropertyDetailsViewModel = viewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val token by AuthRepository.token.collectAsStateWithLifecycle()
    val userData by UserDataRepository.state.collectAsStateWithLifecycle()
    val configState by ConfigRepository.state.collectAsStateWithLifecycle()

    val isLoggedIn = !token.isNullOrBlank()
    val property = state.property

    val isOwner = property != null && userData.currentUser != null && userData.currentUser?.id == property.ownerId
    val isFavorite = property != null && userData.favoriteIds.contains(property.id)
    val isContacted = property != null && userData.contactedIds.contains(property.id)

    // Lookup city name dynamically using ConfigRepository SDUI options
    val cities = configState.config?.options?.cities.orEmpty()
    val cityName = remember(cities, property?.cityId) {
        cities.find { it.id == property?.cityId }?.name.orEmpty()
    }

    if (state.showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.setDeleteDialogVisible(false) },
            title = {
                Text(
                    text = "Delete Property",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Text(
                    text = "Are you sure you want to delete this property? This action cannot be undone.",
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteProperty {
                            navController.popBackStack()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error,
                        contentColor = MaterialTheme.colorScheme.onError
                    )
                ) {
                    Text(if (state.deleting) "Deleting..." else "Delete Property")
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setDeleteDialogVisible(false) }) {
                    Text("Cancel")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.background)
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Contacted Badge (tertiary accent color)
                    if (isLoggedIn && isContacted) {
                        Surface(
                            shape = MaterialTheme.shapes.small,
                            color = MaterialTheme.colorScheme.tertiary,
                            modifier = Modifier.padding(end = 8.dp)
                        ) {
                            Text(
                                text = "✓ Contacted",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onTertiary,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    // Favorite Button: Only visible to authenticated non-owners
                    if (isLoggedIn && !isOwner && property != null) {
                        IconButton(onClick = { viewModel.toggleFavorite() }) {
                            Icon(
                                imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                contentDescription = if (isFavorite) "Remove from favorites" else "Add to favorites",
                                tint = if (isFavorite) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                }
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        when {
            state.pageLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        Text(
                            text = "Loading property...",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            state.pageError != null || property == null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = state.pageError ?: "Property not found.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Center
                    )
                }
            }

            else -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // 1. Title and Location
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = property.title,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (cityName.isNotBlank()) "${property.locality}, $cityName" else property.locality,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // 2. Gallery (Taller 4:3 main image + horizontal thumbnail strip)
                    GallerySection(
                        photos = property.photos,
                        activeIndex = state.activePhotoIndex,
                        onSelectPhoto = { viewModel.setActivePhotoIndex(it) }
                    )

                    // 3. Pricing & Actions Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = MaterialTheme.shapes.medium,
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            // Rent & Deposit
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Row(verticalAlignment = Alignment.Bottom) {
                                    Text(
                                        text = "₹${NumberFormat.getNumberInstance(Locale("en", "IN")).format(property.rent)}",
                                        style = MaterialTheme.typography.headlineSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                    Text(
                                        text = " / month",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.padding(bottom = 2.dp)
                                    )
                                }
                                Text(
                                    text = "Security Deposit: ₹${NumberFormat.getNumberInstance(Locale("en", "IN")).format(property.deposit)}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            HorizontalDivider(color = MaterialTheme.colorScheme.outline)

                            // Action States
                            when {
                                isOwner -> {
                                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        OutlinedButton(
                                            onClick = { navController.navigate(Routes.editProperty(property.id)) },
                                            modifier = Modifier.fillMaxWidth(),
                                            border = BorderStroke(1.5.dp, MaterialTheme.colorScheme.primary)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Filled.Edit,
                                                contentDescription = null,
                                                modifier = Modifier.size(16.dp),
                                                tint = MaterialTheme.colorScheme.primary
                                            )
                                            Spacer(modifier = Modifier.size(8.dp))
                                            Text("Edit Property", color = MaterialTheme.colorScheme.primary)
                                        }

                                        Button(
                                            onClick = { viewModel.setDeleteDialogVisible(true) },
                                            enabled = !state.deleting,
                                            modifier = Modifier.fillMaxWidth(),
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = MaterialTheme.colorScheme.error,
                                                contentColor = MaterialTheme.colorScheme.onError
                                            )
                                        ) {
                                            Text(if (state.deleting) "Deleting..." else "Delete Property")
                                        }
                                    }
                                }

                                state.contactDetails != null -> {
                                    // Contact revealed state
                                    Surface(
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = MaterialTheme.shapes.small,
                                        color = MaterialTheme.colorScheme.outlineVariant,
                                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(14.dp),
                                            verticalArrangement = Arrangement.spacedBy(4.dp)
                                        ) {
                                            Text(
                                                text = "OWNER DETAILS",
                                                style = MaterialTheme.typography.labelSmall,
                                                fontWeight = FontWeight.Bold,
                                                color = MaterialTheme.colorScheme.primary
                                            )
                                            Text(
                                                text = state.contactDetails?.name.orEmpty(),
                                                style = MaterialTheme.typography.titleMedium,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                            Text(
                                                text = state.contactDetails?.phone.orEmpty(),
                                                style = MaterialTheme.typography.bodyMedium,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                }

                                !isLoggedIn -> {
                                    Button(
                                        onClick = { navController.navigate(Routes.LOGIN) },
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text("Login to view contact")
                                    }
                                }

                                else -> {
                                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        if (state.contactLimitSeconds > 0) {
                                            Text(
                                                text = "${state.contactLimitMessage.orEmpty()}\nTry again in ${formatRemainingTime(state.contactLimitSeconds)}.",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.error,
                                                textAlign = TextAlign.Center,
                                                modifier = Modifier.fillMaxWidth()
                                            )
                                        }

                                        Button(
                                            onClick = { viewModel.fetchOwnerContact() },
                                            enabled = !state.contactLoading && state.contactLimitSeconds == 0,
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Text(if (state.contactLoading) "Loading..." else "View Contact")
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // 4. Overview Card (Clean 2-column x 3-row layout)
                    OverviewSection(property = property)

                    // 5. Tenant Preferences Card (Vertical list layout prevents text clipping)
                    TenantPreferencesSection(property = property)

                    // 6. Amenities Card
                    AmenitiesSection(property = property)
                }
            }
        }
    }
}

@Composable
private fun GallerySection(
    photos: List<String>,
    activeIndex: Int,
    onSelectPhoto: (Int) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(4f / 3f)
                .clip(MaterialTheme.shapes.large)
                .background(MaterialTheme.colorScheme.outlineVariant)
                .border(BorderStroke(1.dp, MaterialTheme.colorScheme.outline), MaterialTheme.shapes.large)
        ) {
            if (photos.isNotEmpty() && activeIndex in photos.indices) {
                AsyncImage(
                    model = ApiClient.imageUrl(photos[activeIndex]),
                    contentDescription = "Property preview",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            } else {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        text = "No photos available",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        if (photos.size > 1) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                photos.forEachIndexed { index, photoUrl ->
                    val isSelected = index == activeIndex
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(MaterialTheme.shapes.small)
                            .border(
                                border = if (isSelected) {
                                    BorderStroke(2.dp, MaterialTheme.colorScheme.primary)
                                } else {
                                    BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                                },
                                shape = MaterialTheme.shapes.small
                            )
                            .clickable { onSelectPhoto(index) }
                    ) {
                        AsyncImage(
                            model = ApiClient.imageUrl(photoUrl),
                            contentDescription = "Thumbnail ${index + 1}",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun OverviewSection(property: Property) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Text(
                text = "Overview",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.primary
            )

            // Row 1: Type & Bedrooms
            Row(modifier = Modifier.fillMaxWidth()) {
                OverviewGridItem(
                    label = "TYPE",
                    value = formatOptionLabel(property.propertyType),
                    modifier = Modifier.weight(1f)
                )
                OverviewGridItem(
                    label = "BEDROOMS",
                    value = "${property.bedrooms} BHK",
                    modifier = Modifier.weight(1f)
                )
            }

            // Row 2: Bathrooms & Carpet Area
            Row(modifier = Modifier.fillMaxWidth()) {
                OverviewGridItem(
                    label = "BATHROOMS",
                    value = property.bathrooms.toString(),
                    modifier = Modifier.weight(1f)
                )
                OverviewGridItem(
                    label = "CARPET AREA",
                    value = "${property.carpetAreaSqft} sqft",
                    modifier = Modifier.weight(1f)
                )
            }

            // Row 3: Furnishing & Floor
            Row(modifier = Modifier.fillMaxWidth()) {
                OverviewGridItem(
                    label = "FURNISHING",
                    value = formatOptionLabel(property.furnishing),
                    modifier = Modifier.weight(1f)
                )
                OverviewGridItem(
                    label = "FLOOR",
                    value = "${property.floorNo} of ${property.totalFloors}",
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun OverviewGridItem(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.padding(vertical = 4.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
private fun TenantPreferencesSection(property: Property) {
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
            Text(
                text = "Tenant Preferences",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.primary
            )

            // Vertical list: Gives full width so text and status are never clipped
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                TenantPreferenceRow(
                    label = "👨‍👩‍👧 Family",
                    isAllowed = property.allowFamily
                )
                TenantPreferenceRow(
                    label = "👨 Single Male",
                    isAllowed = property.allowSingleMale
                )
                TenantPreferenceRow(
                    label = "👩 Single Female",
                    isAllowed = property.allowSingleFemale
                )
            }
        }
    }
}

@Composable
private fun TenantPreferenceRow(
    label: String,
    isAllowed: Boolean
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = CircleShape,
        color = MaterialTheme.colorScheme.outlineVariant,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.Medium
            )

            Text(
                text = if (isAllowed) "✅ Allowed" else "❌ Not allowed",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
private fun AmenitiesSection(property: Property) {
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
            Text(
                text = "Amenities",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.primary
            )

            if (!property.hasParking && !property.hasLift) {
                Text(
                    text = "No amenities listed for this property.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (property.hasParking) {
                        DetailPill(text = "🚗 Parking Available")
                    }
                    if (property.hasLift) {
                        DetailPill(text = "🛗 Lift Available")
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailPill(text: String) {
    Surface(
        shape = CircleShape,
        color = MaterialTheme.colorScheme.outlineVariant,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}
