package fr.chatalk.ui.login

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import fr.chatalk.MainActivity
import fr.chatalk.R
import fr.chatalk.utils.InjectorUtils

class LoginFragment : Fragment() {
    private val viewModel: LoginViewModel by viewModels {
        InjectorUtils.provideLoginViewModelFactory(requireContext())
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_login, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val btn: Button = view.findViewById(R.id.login_button)
        btn.setOnClickListener {
            val direction = LoginFragmentDirections.actionLoginFragmentToMainActivity()
            findNavController().navigate(direction)
        }

        val btnRegister: TextView = view.findViewById(R.id.login_register)
        btnRegister.setOnClickListener {
            val direction = LoginFragmentDirections.actionLoginFragmentToRegisterFragment()
            findNavController().navigate(direction)
        }
    }
}
