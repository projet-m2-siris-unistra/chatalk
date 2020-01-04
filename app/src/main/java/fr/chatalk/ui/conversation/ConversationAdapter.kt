package fr.chatalk.ui.conversation

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.navigation.findNavController
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import fr.chatalk.R
import fr.chatalk.data.ConversationEntity
import fr.chatalk.databinding.FragmentConversationItemBinding

class ConversationAdapter :
    ListAdapter<ConversationEntity, ConversationAdapter.ViewHolder>(ConversationDiffCallback()) {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        return ViewHolder(
            DataBindingUtil.inflate(
                LayoutInflater.from(parent.context),
                R.layout.fragment_conversation_item,
                parent,
                false
            )
        )
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        with(holder) {
            bind(getItem(position))
        }
    }

    class ViewHolder(
        private val binding: FragmentConversationItemBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: ConversationEntity) {
            binding.apply {
                conversation = item
                setClickListener {
                    val direction = ConversationListFragmentDirections
                        .actionConversationListFragmentToConversationSingle(item.conversationId)
                    it.findNavController().navigate(direction)
                }
                executePendingBindings()
            }
        }
    }
}

private class ConversationDiffCallback : DiffUtil.ItemCallback<ConversationEntity>() {
    override fun areContentsTheSame(oldItem: ConversationEntity, newItem: ConversationEntity) =
        oldItem == newItem

    override fun areItemsTheSame(oldItem: ConversationEntity, newItem: ConversationEntity) =
        oldItem.conversationId == newItem.conversationId
}