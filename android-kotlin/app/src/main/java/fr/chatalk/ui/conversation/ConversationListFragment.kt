package fr.chatalk.ui.conversation

import android.os.Bundle
import android.util.Log
import android.view.*
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.observe
import fr.chatalk.R
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

        (activity as AppCompatActivity).apply {
            setSupportActionBar(binding.conversationsToolbar)
            supportActionBar?.title = "Conversations"
        }
        setHasOptionsMenu(true)

        return binding.root
    }

    override fun onCreateOptionsMenu(menu: Menu, inflater: MenuInflater) {
        activity?.menuInflater?.inflate(R.menu.conversations_menu, menu)
        super.onCreateOptionsMenu(menu, inflater)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.logout_btn ->
                viewModel.logout()
        }
        return super.onOptionsItemSelected(item)
    }
}
