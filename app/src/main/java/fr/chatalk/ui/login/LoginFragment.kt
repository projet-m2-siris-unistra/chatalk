package fr.chatalk.ui.login

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.viewModels
import fr.chatalk.MainActivity
import fr.chatalk.R
import fr.chatalk.data.AppDatabase
import fr.chatalk.ui.register.RegisterFragment

class LoginFragment : Fragment() {

    companion object {
        fun newInstance() = LoginFragment()
    }

    private val viewModel: LoginViewModel by viewModels {
        LoginViewModelFactory(AppDatabase(requireContext().applicationContext))
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
            activity?.let { ctx ->
                startActivity(Intent(ctx, MainActivity::class.java))
            }
        }

        val btnRegister: TextView = view.findViewById(R.id.login_register)
        btnRegister.setOnClickListener {
            fragmentManager
                ?.beginTransaction()
                ?.replace(R.id.auth_container, RegisterFragment.newInstance())
                ?.commit()
        }
    }
}
