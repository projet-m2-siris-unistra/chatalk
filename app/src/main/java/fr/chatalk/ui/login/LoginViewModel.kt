package fr.chatalk.ui.login

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import fr.chatalk.api.ChatalkService
import fr.chatalk.api.LoginPayload
import fr.chatalk.api.LoginRequest
import fr.chatalk.data.AppDatabase
import fr.chatalk.data.UserDao
import kotlinx.coroutines.launch

class LoginViewModel(private val db: AppDatabase, private val service: ChatalkService) : ViewModel() {
    fun login(username: String, password: String) {
        service.sendRequest(LoginRequest(LoginPayload(username, password)))
    }
}
