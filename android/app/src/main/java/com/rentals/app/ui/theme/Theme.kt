package com.rentals.app.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = OnPrimary,
    secondary = Secondary,
    onSecondary = OnSecondary,
    tertiary = Accent,
    onTertiary = OnTertiary,
    background = Bg,
    onBackground = TextDark,
    surface = SurfaceColor,
    onSurface = TextDark,
    surfaceVariant = SurfaceColor,
    onSurfaceVariant = TextMuted,
    outline = BorderColor,
    outlineVariant = OutlineVariantColor,
    error = Danger,
    onError = OnError,

    // used for app palette else Material3 defaults these to lavender tones
    surfaceContainerLowest = SurfaceColor,
    surfaceContainerLow = SurfaceColor,
    surfaceContainer = SurfaceColor,
    surfaceContainerHigh = SurfaceColor,
    surfaceContainerHighest = SurfaceColor,
    surfaceTint = SurfaceColor
)

private val RentalsShapes = Shapes(
    extraSmall = RoundedCornerShape(Dimens.RadiusSmall),
    small = RoundedCornerShape(Dimens.Radius),
    medium = RoundedCornerShape(Dimens.Radius),
    large = RoundedCornerShape(Dimens.RadiusLarge),
    extraLarge = RoundedCornerShape(Dimens.RadiusLarge)
)

@Composable
fun RentalsTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        shapes = RentalsShapes,
        content = content
    )
}