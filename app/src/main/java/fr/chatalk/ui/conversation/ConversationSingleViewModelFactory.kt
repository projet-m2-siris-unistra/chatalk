package fr.chatalk.ui.conversation

import android.content.SharedPreferences
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import fr.chatalk.api.ChatalkService
import fr.chatalk.data.AppDatabase

class ConversationSingleViewModelFactory(
    private val db: AppDatabase,
    private val conversationId: Int,
    private val service: ChatalkService,
    private val prefs: SharedPreferences
) : ViewModelProvider.NewInstanceFactory() {
    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return ConversationSingleViewModel(db, conversationId, service, prefs) as T
    }
}
