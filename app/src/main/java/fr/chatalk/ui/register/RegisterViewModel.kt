package fr.chatalk.ui.register

import android.database.sqlite.SQLiteConstraintException
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import fr.chatalk.api.ChatalkService
import fr.chatalk.data.AppDatabase
import fr.chatalk.data.UserDao
import fr.chatalk.data.UserEntity
import kotlinx.coroutines.launch

class RegisterViewModel(private val db: AppDatabase, private val service: ChatalkService) : ViewModel() {
    fun register(user: UserEntity) {
    }
}