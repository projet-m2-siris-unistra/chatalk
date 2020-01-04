package fr.chatalk.ui.login

import androidx.lifecycle.ViewModel
import fr.chatalk.api.ChatalkService
import fr.chatalk.api.LoginPayload
import fr.chatalk.api.LoginRequest
import fr.chatalk.data.AppDatabase

class LoginViewModel(private val db: AppDatabase, private val service: ChatalkService) :
    ViewModel() {
    fun login(username: String, password: String) {
        service.sendRequest(LoginRequest(LoginPayload(username, password)))
    }
}
