package fr.chatalk.ui.login

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import fr.chatalk.databinding.FragmentLoginBinding
import fr.chatalk.utils.InjectorUtils

class LoginFragment : Fragment() {
    private val viewModel: LoginViewModel by viewModels {
        InjectorUtils.provideLoginViewModelFactory(requireContext())
    }
    private lateinit var binding: FragmentLoginBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentLoginBinding.inflate(inflater, container, false)

        binding.loginRegister.setOnClickListener {
            val direction = LoginFragmentDirections.actionLoginFragmentToRegisterFragment()
            findNavController().navigate(direction)
        }

        binding.loginButton.setOnClickListener {
            val username: String = binding.loginUsername.text.toString()
            val password: String = binding.loginPassword.text.toString()
            viewModel.login(username, password)
        }

        return binding.root
    }
}
