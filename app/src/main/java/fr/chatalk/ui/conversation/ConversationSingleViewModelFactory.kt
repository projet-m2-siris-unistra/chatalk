package fr.chatalk.ui.conversation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import fr.chatalk.data.AppDatabase

class ConversationSingleViewModelFactory(
    private val db: AppDatabase,
    private val conversationId: Int
) : ViewModelProvider.NewInstanceFactory() {
    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return ConversationSingleViewModel(db, conversationId) as T
    }
}
