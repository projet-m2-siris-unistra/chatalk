package fr.chatalk.ui.conversation

import android.content.SharedPreferences
import androidx.lifecycle.ViewModel
import fr.chatalk.api.ChatalkService
import fr.chatalk.api.LoginPayload
import fr.chatalk.api.LoginRequest
import fr.chatalk.data.AppDatabase

class ConversationListViewModel internal constructor(
    db: AppDatabase,
    private val service: ChatalkService,
    private val prefs: SharedPreferences
) : ViewModel() {
    val conversations = db.conversationDao().getAll()
    fun logout() {
        val token = prefs.getString("token", "")
        if (!token.isNullOrBlank()) {
            service.sendRequest(
                LoginRequest(
                    LoginPayload(
                        method = "jwt",
                        token = token,
                        action = "logout"
                    )
                )
            )
        }
    }
}
