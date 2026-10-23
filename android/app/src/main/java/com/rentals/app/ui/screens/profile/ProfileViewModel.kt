package com.rentals.app.ui.screens.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rentals.app.data.repository.AuthRepository
import kotlinx.coroutines.launch

// Owns viewModelScope so ProfileScreen doesn't need
// rememberCoroutineScope when calling AuthRepository.logout().
class ProfileViewModel : ViewModel() {

    fun logout() {
        viewModelScope.launch {
            AuthRepository.logout()
        }
    }
}
