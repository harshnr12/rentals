package com.rentals.app.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme =
    lightColorScheme(
        primary = Primary,
        onPrimary = OnPrimary,
        secondary = Secondary,
        onSecondary = OnSecondary,
        tertiary = Accent,
        onTertiary = OnTertiary,
        background = Bg,
        onBackground = TextDark,
        surface = SurfaceWhite,
        onSurface = TextDark,
        surfaceVariant = SurfaceWhite,
        onSurfaceVariant = TextMuted,
        outline = Border,
        outlineVariant = OutlineVariant,
        error = Danger,
        onError = OnError,

        // Overrides default Material 3 lavender tonal tints with pure surface color
        surfaceContainerLowest = SurfaceWhite,
        surfaceContainerLow = SurfaceWhite,
        surfaceContainer = SurfaceWhite,
        surfaceContainerHigh = SurfaceWhite,
        surfaceContainerHighest = SurfaceWhite,
        surfaceTint = SurfaceWhite,
    )

private val RentalsShapes =
    Shapes(
        extraSmall = RoundedCornerShape(Dimens.RadiusSmall),
        small = RoundedCornerShape(Dimens.Radius),
        medium = RoundedCornerShape(Dimens.Radius),
        large = RoundedCornerShape(Dimens.RadiusLarge),
        extraLarge = RoundedCornerShape(Dimens.RadiusLarge),
    )

@Composable
fun RentalsTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        shapes = RentalsShapes,
        content = content,
    )
}
