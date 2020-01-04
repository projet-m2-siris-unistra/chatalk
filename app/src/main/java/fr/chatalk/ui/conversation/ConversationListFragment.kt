package fr.chatalk.ui.conversation

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.observe
import fr.chatalk.databinding.FragmentConversationListBinding
import fr.chatalk.utils.InjectorUtils

class ConversationListFragment : Fragment() {
    private val viewModel: ConversationListViewModel by viewModels {
        InjectorUtils.provideConversationListViewModelFactory(requireContext())
    }
    private lateinit var binding: FragmentConversationListBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentConversationListBinding.inflate(inflater, container, false)

        val adapter = ConversationAdapter()
        binding.conversationList.adapter = adapter
        viewModel.conversations.observe(viewLifecycleOwner) { conversations ->
            Log.d("conv", conversations.toString())
            adapter.submitList(conversations)
        }
        return binding.root
    }
}
