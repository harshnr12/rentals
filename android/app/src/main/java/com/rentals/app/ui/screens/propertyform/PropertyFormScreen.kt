package com.rentals.app.ui.screens.propertyform

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.rentals.app.data.api.ApiClient
import com.rentals.app.data.repository.AuthRepository
import com.rentals.app.data.repository.ConfigRepository
import com.rentals.app.ui.components.GuestPromptCard
import com.rentals.app.ui.navigation.Routes


private fun formatOptionLabel(str: String): String {
    if (str.isBlank()) return ""
    return str.split("_").joinToString(" ") { word ->
        word.replaceFirstChar { it.uppercase() }
    }
}

@Composable
private fun FormLabel(text: String, isRequired: Boolean) {
    Text(
        buildAnnotatedString {
            append(text)
            if (isRequired) {
                withStyle(SpanStyle(color = MaterialTheme.colorScheme.error)) {
                    append(" *")
                }
            }
        }
    )
}

/**
 * Unified Property Form (Add / Edit Listing)
 *
 * Rationale for Single ViewModel & Screen:
 * 1. UI Parity: Both Add and Edit operations render the exact same 15 property inputs
 *    (location, dimensions, amenities, tenant rules) and multi-part photo management workflow.
 * 2. Automatic Mode Detection: PropertyFormViewModel extracts optional property 'id' from
 *    SavedStateHandle. If 'id == null', it operates in Add Mode with server-driven min defaults;
 *    if 'id != null', it automatically executes Edit Mode by pre-fetching the listing and photos.
 * 3. Shared Submit Pipeline: Both flows leverage PropertyRepository's unified 2-phase pipeline:
 *    first uploading any newly selected gallery photos to /media/upload, then merging their URLs
 *    with retained existingPhotos to send a POST (create) or PATCH (update) payload.
 * 4. DRY Maintenance: Eliminates duplicating ~450 lines of identical Compose form layout,
 *    field-state bindings, and dropdown logic across separate files.
 */
@Composable
fun PropertyFormScreen(navController: NavController) {
    val token by AuthRepository.token.collectAsStateWithLifecycle()

    if (token.isNullOrBlank()) {
        GuestPromptCard(
            icon = Icons.Filled.Home,
            title = "Post a Property",
            subtitle = "Log in or create an account to list and manage your rental properties.",
            navController = navController
        )
        return
    }

    val configState by ConfigRepository.state.collectAsStateWithLifecycle()
    val viewModel: PropertyFormViewModel = viewModel()
    val state by viewModel.state.collectAsStateWithLifecycle()

    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        viewModel.addNewPhotos(uris)
    }

    if (configState.loading || state.propertyLoading) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (state.isEditMode) "Loading property details..." else "Loading form...",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        return
    }

    if (configState.error != null || state.propertyError != null) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (configState.error != null) {
                    "Failed to load form configuration."
                } else {
                    state.propertyError.orEmpty()
                },
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.error,
                textAlign = TextAlign.Center
            )
        }
        return
    }

    val options = configState.config?.options
    val validation = configState.config?.fieldValidation

    val cities = options?.cities.orEmpty()
    val propertyTypes = options?.propertyTypes.orEmpty()
    val furnishingTypes = options?.furnishingTypes.orEmpty()
    val maxPhotos = validation?.photos?.maxCount ?: 10
    val maxSizeMb = validation?.photos?.maxSizeMb ?: 5

    // Server-driven required indicators
    val isCityRequired = validation?.cityId?.required ?: true
    val isLocalityRequired = validation?.locality?.required ?: true
    val isPropertyTypeRequired = validation?.propertyType?.required ?: true
    val isFurnishingRequired = validation?.furnishing?.required ?: true
    val isRentRequired = validation?.rent?.required ?: true
    val isDepositRequired = validation?.deposit?.required ?: true
    val isCarpetAreaRequired = validation?.carpetAreaSqft?.required ?: true
    val isBedroomsRequired = validation?.bedrooms?.required ?: true
    val isBathroomsRequired = validation?.bathrooms?.required ?: true
    val isFloorNoRequired = validation?.floorNo?.required ?: true
    val isTotalFloorsRequired = validation?.totalFloors?.required ?: true

    val form = state.form
    val totalPhotoCount = state.existingPhotos.size + state.newPhotos.size

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.medium,
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = if (state.isEditMode) "Edit Property" else "Post a New Property",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = if (state.isEditMode) {
                            "Update the details of your listing."
                        } else {
                            "Fill out the details below to list your property."
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                if (!state.submitError.isNullOrBlank()) {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = MaterialTheme.shapes.small,
                        color = MaterialTheme.colorScheme.error.copy(alpha = 0.08f),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.error)
                    ) {
                        Text(
                            text = state.submitError!!,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outline)

                // Section 1: Location & Property Type
                Text(
                    text = "Location & Type",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )

                FormDropdownField(
                    label = "City",
                    selectedLabel = cities.find { it.id == form.cityId }?.name ?: "",
                    placeholder = "Select a city",
                    isRequired = isCityRequired,
                    options = cities.map { it.id.toString() to it.name },
                    onSelect = { idStr ->
                        viewModel.updateForm { it.copy(cityId = idStr.toIntOrNull()) }
                    }
                )

                OutlinedTextField(
                    value = form.locality,
                    onValueChange = { v -> viewModel.updateForm { it.copy(locality = v) } },
                    label = { FormLabel("Locality", isLocalityRequired) },
                    placeholder = { Text("e.g. Rohini, Bandra, Whitefield") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(modifier = Modifier.weight(1f)) {
                        FormDropdownField(
                            label = "Property Type",
                            selectedLabel = if (form.propertyType.isBlank()) "" else formatOptionLabel(form.propertyType),
                            placeholder = "Select type",
                            isRequired = isPropertyTypeRequired,
                            options = propertyTypes.map { it to formatOptionLabel(it) },
                            onSelect = { v -> viewModel.updateForm { it.copy(propertyType = v) } }
                        )
                    }
                    Box(modifier = Modifier.weight(1f)) {
                        FormDropdownField(
                            label = "Furnishing",
                            selectedLabel = if (form.furnishing.isBlank()) "" else formatOptionLabel(form.furnishing),
                            placeholder = "Select furnishing",
                            isRequired = isFurnishingRequired,
                            options = furnishingTypes.map { it to formatOptionLabel(it) },
                            onSelect = { v -> viewModel.updateForm { it.copy(furnishing = v) } }
                        )
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outline)

                // Section 2: Pricing & Specs
                Text(
                    text = "Pricing & Specs",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = form.rent,
                        onValueChange = { v -> viewModel.updateForm { it.copy(rent = v) } },
                        label = { FormLabel("Monthly Rent (₹)", isRentRequired) },
                        placeholder = { Text("15000") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = form.deposit,
                        onValueChange = { v -> viewModel.updateForm { it.copy(deposit = v) } },
                        label = { FormLabel("Security Deposit (₹)", isDepositRequired) },
                        placeholder = { Text("30000") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                }

                OutlinedTextField(
                    value = form.carpetAreaSqft,
                    onValueChange = { v -> viewModel.updateForm { it.copy(carpetAreaSqft = v) } },
                    label = { FormLabel("Carpet Area (sqft)", isCarpetAreaRequired) },
                    placeholder = { Text("850") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = form.bedrooms,
                        onValueChange = { v -> viewModel.updateForm { it.copy(bedrooms = v) } },
                        label = { FormLabel("Bedrooms (BHK)", isBedroomsRequired) },
                        placeholder = { Text("2") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = form.bathrooms,
                        onValueChange = { v -> viewModel.updateForm { it.copy(bathrooms = v) } },
                        label = { FormLabel("Bathrooms", isBathroomsRequired) },
                        placeholder = { Text("2") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = form.floorNo,
                        onValueChange = { v -> viewModel.updateForm { it.copy(floorNo = v) } },
                        label = { FormLabel("Floor No.", isFloorNoRequired) },
                        placeholder = { Text("2") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = form.totalFloors,
                        onValueChange = { v -> viewModel.updateForm { it.copy(totalFloors = v) } },
                        label = { FormLabel("Total Floors", isTotalFloorsRequired) },
                        placeholder = { Text("5") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outline)

                // Section 3: Amenities
                Text(
                    text = "Amenities",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )

                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    FormCheckboxItem(
                        label = "Parking Available",
                        checked = form.hasParking,
                        onCheckedChange = { c -> viewModel.updateForm { it.copy(hasParking = c) } }
                    )
                    FormCheckboxItem(
                        label = "Lift Available",
                        checked = form.hasLift,
                        onCheckedChange = { c -> viewModel.updateForm { it.copy(hasLift = c) } }
                    )
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outline)

                // Section 4: Tenant Preferences
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Tenant Preferences",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = " *",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                    Text(
                        text = "Select at least one allowed tenant group.",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    FormCheckboxItem(
                        label = "Family",
                        checked = form.allowFamily,
                        onCheckedChange = { c -> viewModel.updateForm { it.copy(allowFamily = c) } }
                    )
                    FormCheckboxItem(
                        label = "Single Male",
                        checked = form.allowSingleMale,
                        onCheckedChange = { c -> viewModel.updateForm { it.copy(allowSingleMale = c) } }
                    )
                    FormCheckboxItem(
                        label = "Single Female",
                        checked = form.allowSingleFemale,
                        onCheckedChange = { c -> viewModel.updateForm { it.copy(allowSingleFemale = c) } }
                    )
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outline)

                // Section 5: Property Photos
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .padding(end = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        Text(
                            text = "Property Photos ($totalPhotoCount/$maxPhotos)",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "JPEG, PNG, or WebP • Max ${maxSizeMb}MB each",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    if (totalPhotoCount < maxPhotos) {
                        OutlinedButton(
                            onClick = { photoPickerLauncher.launch("image/*") }
                        ) {
                            Text("+ Add Photos", maxLines = 1)
                        }
                    }
                }

                if (state.existingPhotos.isNotEmpty() || state.newPhotos.isNotEmpty()) {
                    val allPhotos: List<Pair<Any, () -> Unit>> =
                        state.existingPhotos.map { url -> ApiClient.imageUrl(url) to { viewModel.removeExistingPhoto(url) } } +
                        state.newPhotos.map { uri -> uri to { viewModel.removeNewPhoto(uri) } }

                    Column(
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        allPhotos.chunked(3).forEach { rowItems ->
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                rowItems.forEach { (model, onRemove) ->
                                    PhotoThumbnail(
                                        model = model,
                                        onRemove = onRemove
                                    )
                                }
                            }
                        }
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outline)

                // Submit & Cancel Actions
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedButton(
                        onClick = { navController.popBackStack() },
                        enabled = !state.submitLoading,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel")
                    }

                    val buttonText = when {
                        state.submitLoading && state.isEditMode -> "Saving..."
                        state.submitLoading -> "Posting..."
                        state.isEditMode -> "Save Changes"
                        else -> "Post Property"
                    }

                    Button(
                        onClick = {
                            viewModel.submit {
                                // 1. Always dismiss the form screen
                                navController.popBackStack()

                                // 2. If creating a new listing from Profile, navigate to My Listings
                                if (!state.isEditMode && navController.currentBackStackEntry?.destination?.route != Routes.MY_LISTINGS) {
                                    navController.navigate(Routes.MY_LISTINGS)
                                }
                            }
                        },
                        enabled = !state.submitLoading,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(buttonText)
                    }
                }
            }
        }
    }
}

@Composable
private fun FormDropdownField(
    label: String,
    selectedLabel: String,
    placeholder: String,
    isRequired: Boolean,
    options: List<Pair<String, String>>,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }

    Box(modifier = modifier) {
        OutlinedTextField(
            value = selectedLabel,
            onValueChange = {},
            readOnly = true,
            label = { FormLabel(label, isRequired) },
            placeholder = { Text(placeholder) },
            trailingIcon = { Icon(Icons.Filled.ArrowDropDown, contentDescription = null) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Box(
            modifier = Modifier
                .matchParentSize()
                .clickable { expanded = true }
        )

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

@Composable
private fun FormCheckboxItem(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(checked = checked, onCheckedChange = onCheckedChange)
        Text(text = label, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun PhotoThumbnail(
    model: Any?,
    onRemove: () -> Unit
) {
    Box(
        modifier = Modifier
            .size(92.dp)
            .clip(MaterialTheme.shapes.small)
    ) {
        AsyncImage(
            model = model,
            contentDescription = "Property photo",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(4.dp)
                .size(24.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.9f))
                .clickable(onClick = onRemove),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Filled.Close,
                contentDescription = "Remove photo",
                tint = MaterialTheme.colorScheme.error,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}
