package fr.chatalk.ui.conversation

import androidx.lifecycle.ViewModel
import fr.chatalk.data.AppDatabase

class ConversationSingleViewModel internal constructor(
    db: AppDatabase,
    conversationId: Int
) : ViewModel() {
    val conversation = db.conversationDao().findById(conversationId)
    val messages = db.messageDao().findByConversation(conversationId)
}
