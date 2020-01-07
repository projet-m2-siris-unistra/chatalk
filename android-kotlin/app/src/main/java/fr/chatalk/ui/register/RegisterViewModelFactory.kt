package fr.chatalk.ui.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import fr.chatalk.api.ChatalkService
import fr.chatalk.data.AppDatabase

class RegisterViewModelFactory(
    private val db: AppDatabase,
    private val service: ChatalkService
) : ViewModelProvider.NewInstanceFactory() {
    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return RegisterViewModel(db, service) as T
    }
}