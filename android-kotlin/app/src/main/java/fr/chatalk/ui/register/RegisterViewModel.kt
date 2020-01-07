package fr.chatalk.ui.register

import androidx.lifecycle.ViewModel
import fr.chatalk.api.ChatalkService
import fr.chatalk.api.RegisterPayload
import fr.chatalk.api.RegisterRequest
import fr.chatalk.data.AppDatabase

class RegisterViewModel(private val db: AppDatabase, private val service: ChatalkService) :
    ViewModel() {
    fun register(username: String, email: String, password: String, passwordConfirmation: String) {
        service.sendRequest(
            RegisterRequest(
                RegisterPayload(
                    username, email, password, passwordConfirmation
                )
            )
        )
    }
}