package fr.chatalk.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import fr.chatalk.api.ChatalkService
import fr.chatalk.data.AppDatabase

class LoginViewModelFactory(
    private val db: AppDatabase,
    private val service: ChatalkService
): ViewModelProvider.NewInstanceFactory() {
    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return LoginViewModel(db, service) as T
    }
}