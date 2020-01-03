package fr.chatalk.ui.register

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import fr.chatalk.MainActivity
import fr.chatalk.databinding.FragmentRegisterBinding
import fr.chatalk.utils.InjectorUtils

class RegisterFragment : Fragment() {
    private val viewModel: RegisterViewModel by viewModels {
        InjectorUtils.provideRegisterViewModelFactory(requireContext())
    }
    private lateinit var binding: FragmentRegisterBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentRegisterBinding.inflate(inflater, container, false)

        binding.registerButton.setOnClickListener {
            activity?.let { ctx ->
                startActivity(Intent(ctx, MainActivity::class.java))
            }
        }

        binding.registerLogin.setOnClickListener {
            val direction = RegisterFragmentDirections.actionRegisterFragmentToLoginFragment()
            findNavController().navigate(direction)
        }
        return binding.root
    }
}
