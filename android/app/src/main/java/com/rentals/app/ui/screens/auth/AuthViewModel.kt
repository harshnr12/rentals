package com.rentals.app.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rentals.app.data.api.errorMessage
import com.rentals.app.data.models.LoginRequest
import com.rentals.app.data.models.SignupRequest
import com.rentals.app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AuthUiState(
    val loading: Boolean = false,
    val error: String? = null
)

// Handles both login and signup inside viewModelScope
// using AuthRepository.login() and AuthRepository.signup()

class AuthViewModel : ViewModel() {
    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    fun login(email: String, password: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            try {
                AuthRepository.login(
                    LoginRequest(
                        email = email.trim(),
                        password = password
                    )
                )
                _state.update { it.copy(loading = false) }
                onSuccess()
            } catch (e: Exception) {
                _state.update { it.copy(loading = false, error = errorMessage(e)) }
            }
        }
    }

    fun signup(name: String, email: String, password: String, phone: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            try {
                AuthRepository.signup(
                    SignupRequest(
                        name = name.trim(),
                        email = email.trim(),
                        password = password,
                        phone = phone.trim()
                    )
                )
                _state.update { it.copy(loading = false) }
                onSuccess()
            } catch (e: Exception) {
                _state.update { it.copy(loading = false, error = errorMessage(e)) }
            }
        }
    }
}
