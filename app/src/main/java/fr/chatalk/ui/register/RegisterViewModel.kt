package fr.chatalk.ui.register

import androidx.lifecycle.ViewModel
import fr.chatalk.api.ChatalkService
import fr.chatalk.data.AppDatabase
import fr.chatalk.data.UserEntity

class RegisterViewModel(private val db: AppDatabase, private val service: ChatalkService) :
    ViewModel() {
    fun register(user: UserEntity) {
    }
}