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
        val userDao: UserDao = db.userDao()

        viewModelScope.launch {
            try {
                val userId: Int = userDao.insert(user).toInt()
                Log.d("Register", userId.toString())
            } catch (e: SQLiteConstraintException) {
                println("registration failed: username/email already used or missing field")
            }
        }
    }
}