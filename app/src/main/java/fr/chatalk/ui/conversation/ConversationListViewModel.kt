package fr.chatalk.ui.conversation

import androidx.lifecycle.ViewModel
import fr.chatalk.data.AppDatabase

class ConversationListViewModel internal constructor(db: AppDatabase) : ViewModel() {
    val conversations = db.conversationDao().getAll()
}
