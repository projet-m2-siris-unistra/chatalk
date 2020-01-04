package fr.chatalk.ui.conversation

import androidx.lifecycle.ViewModelProviders
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import androidx.lifecycle.observe
import androidx.navigation.NavArgs
import androidx.navigation.fragment.navArgs

import fr.chatalk.R
import fr.chatalk.databinding.FragmentConversationSingleBinding
import fr.chatalk.utils.InjectorUtils
import kotlinx.android.synthetic.main.fragment_conversation_list.*

class ConversationSingle : Fragment() {
    private val args: ConversationSingleArgs by navArgs()
    private val viewModel: ConversationSingleViewModel by viewModels {
        InjectorUtils.provideConversationSingleViewModelFactory(requireContext(), args.conversationId)
    }

    private lateinit var binding: FragmentConversationSingleBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentConversationSingleBinding.inflate(inflater, container, false)
        viewModel.conversation.observe(viewLifecycleOwner) { conversation ->
            binding.conversation = conversation
        }
        return binding.root
    }
}
