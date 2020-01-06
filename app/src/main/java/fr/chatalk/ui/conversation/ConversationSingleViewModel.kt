package fr.chatalk.ui.conversation

import android.content.SharedPreferences
import androidx.lifecycle.ViewModel
import com.auth0.android.jwt.JWT
import fr.chatalk.api.ChatalkService
import fr.chatalk.api.MsgSenderRequest
import fr.chatalk.data.AppDatabase

class ConversationSingleViewModel internal constructor(
    db: AppDatabase,
    private val conversationId: Int,
    private val service: ChatalkService,
    private val prefs: SharedPreferences
) : ViewModel() {
    val conversation = db.conversationDao().findById(conversationId)
    val messages = db.messageDao().findByConversation(conversationId)
    fun sendMessage(content: String) {
        val token = prefs.getString("token", "")
        if (!token.isNullOrBlank()) {
            val jwt = JWT(token)
            val userId = jwt.getClaim("user-id").asString()
            if (!userId.isNullOrBlank()) {
                service.sendRequest(
                    MsgSenderRequest(
                        source = userId,
                        destination = conversationId.toString(),
                        device = "1",
                        payload = content
                    )
                )
            }
        }
    }
}
