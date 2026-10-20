package com.rentals.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.models.Property
import com.rentals.app.data.repository.AuthRepository
import com.rentals.app.data.repository.UserDataRepository
import com.rentals.app.ui.navigation.Routes
import kotlinx.coroutines.launch

@Composable
fun PropertyCard(
    property: Property,
    cityName: String,
    navController: NavController,
    modifier: Modifier = Modifier,
) {
    val token by AuthRepository.token.collectAsStateWithLifecycle()
    val userData by UserDataRepository.state.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()

    val isLoggedIn = !token.isNullOrBlank()
    val isOwner = userData.currentUser != null && userData.currentUser?.id == property.ownerId
    val isFavorite = userData.favoriteIds.contains(property.id)
    val isContacted = userData.contactedIds.contains(property.id)

    val photoUrl = property.photos.firstOrNull()?.let { ApiClient.imageUrl(it) }

    Card(
        onClick = { navController.navigate(Routes.details(property.id)) },
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
    ) {
        // 1. Image Box with Overlays (.img-box)
        Box(
            modifier =
                Modifier.fillMaxWidth()
                    .height(190.dp)
                    .background(MaterialTheme.colorScheme.outlineVariant)
        ) {
            if (photoUrl != null) {
                AsyncImage(
                    model = photoUrl,
                    contentDescription = property.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                )
            } else {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        text = "No Image",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            // Contacted Badge (.contacted-badge)
            if (isLoggedIn && isContacted) {
                Surface(
                    modifier = Modifier.align(Alignment.TopStart).padding(10.dp),
                    shape = MaterialTheme.shapes.small,
                    color = MaterialTheme.colorScheme.primary,
                ) {
                    Text(
                        text = "✓ Contacted",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                }
            }

            // Owner Edit or Visitor Favorite Button (.fav-btn)
            if (isLoggedIn) {
                Surface(
                    modifier = Modifier.align(Alignment.TopEnd).padding(10.dp).size(36.dp),
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                ) {
                    if (isOwner) {
                        IconButton(
                            onClick = { navController.navigate(Routes.editProperty(property.id)) }
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Edit,
                                contentDescription = "Edit Listing",
                                tint = MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.size(18.dp),
                            )
                        }
                    } else {
                        IconButton(
                            onClick = {
                                scope.launch {
                                    try {
                                        UserDataRepository.toggleFavorite(property.id)
                                    } catch (_: Exception) {
                                        // Silent failure; icon stays in server-truth state
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector =
                                    if (isFavorite) Icons.Filled.Favorite
                                    else Icons.Outlined.FavoriteBorder,
                                contentDescription = "Toggle Favorite",
                                tint =
                                    if (isFavorite) MaterialTheme.colorScheme.error
                                    else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.size(20.dp),
                            )
                        }
                    }
                }
            }
        }

        // 2. Property Info Section (.info)
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(
                text = property.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )

            Text(
                text = "$cityName • ${property.locality}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )

            // Tags (.tags)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                TagChip(property.furnishing.replace('_', ' '))
                TagChip(property.propertyType.replace('_', ' '))
            }

            // Price (.price)
            Row(verticalAlignment = Alignment.Bottom, modifier = Modifier.padding(top = 2.dp)) {
                Text(
                    text = "₹${property.rent}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                )
                Text(
                    text = " / mo",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun TagChip(label: String) {
    if (label.isBlank()) return
    Surface(
        shape = MaterialTheme.shapes.extraSmall,
        color = MaterialTheme.colorScheme.outlineVariant,
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurface,
        )
    }
}
