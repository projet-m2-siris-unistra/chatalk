package fr.chatalk.ui.conversation

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import fr.chatalk.R
import fr.chatalk.data.MessageEntity
import fr.chatalk.databinding.FragmentMessageBinding

class MessageAdapter :
    ListAdapter<MessageEntity, MessageAdapter.ViewHolder>(MessageDiffCallback()) {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        return ViewHolder(
            DataBindingUtil.inflate(
                LayoutInflater.from(parent.context),
                R.layout.fragment_message,
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
        private val binding: FragmentMessageBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: MessageEntity) {
            binding.apply {
                message = item
                executePendingBindings()
            }
        }
    }
}

private class MessageDiffCallback : DiffUtil.ItemCallback<MessageEntity>() {
    override fun areContentsTheSame(oldItem: MessageEntity, newItem: MessageEntity) =
        oldItem == newItem

    override fun areItemsTheSame(oldItem: MessageEntity, newItem: MessageEntity) =
        oldItem.messageId == newItem.messageId
}