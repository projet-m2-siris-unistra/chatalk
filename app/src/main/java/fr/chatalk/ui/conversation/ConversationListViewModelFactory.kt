package fr.chatalk.ui.conversation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import fr.chatalk.data.AppDatabase

class ConversationListViewModelFactory(
    private val db: AppDatabase
) : ViewModelProvider.NewInstanceFactory() {
    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return ConversationListViewModel(db) as T
    }
}