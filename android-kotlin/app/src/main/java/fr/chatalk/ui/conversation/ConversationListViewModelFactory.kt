package fr.chatalk.ui.conversation

import android.content.SharedPreferences
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import fr.chatalk.api.ChatalkService
import fr.chatalk.data.AppDatabase

class ConversationListViewModelFactory(
    private val db: AppDatabase,
    private val service: ChatalkService,
    private val prefs: SharedPreferences
) : ViewModelProvider.NewInstanceFactory() {
    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return ConversationListViewModel(db, service, prefs) as T
    }
}