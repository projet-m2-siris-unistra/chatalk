package fr.chatalk.ui.login

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import fr.chatalk.data.AppDatabase
import fr.chatalk.data.UserDao
import kotlinx.coroutines.launch

class LoginViewModel(private val db: AppDatabase) : ViewModel() {
    fun login(username: String) {
        val userDao: UserDao = db.userDao()

        viewModelScope.launch {
            val userId: Int? = userDao.getUserIdFromUsername(username)
            userId?.let {
                Log.d("Login", userId.toString())
            }
        }
    }
}
