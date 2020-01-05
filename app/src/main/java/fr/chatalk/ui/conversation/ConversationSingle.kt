package fr.chatalk.ui.conversation

import androidx.lifecycle.ViewModelProviders
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.viewModels
import androidx.lifecycle.observe
import androidx.navigation.NavArgs
import androidx.navigation.fragment.findNavController
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

        (activity as AppCompatActivity).apply {
            setSupportActionBar(binding.conversationToolbar)
            supportActionBar?.title = "Conversation"
            binding.conversationToolbar.setNavigationIcon(R.drawable.ic_keyboard_arrow_left_black_24dp)
            binding.conversationToolbar.setNavigationOnClickListener {
                findNavController().popBackStack()
            }
        }
        setHasOptionsMenu(true)

        viewModel.conversation.observe(viewLifecycleOwner) { conversation ->
            binding.conversation = conversation
            (activity as AppCompatActivity).apply {
                supportActionBar?.title = conversation.name
            }
        }

        return binding.root
    }
}
