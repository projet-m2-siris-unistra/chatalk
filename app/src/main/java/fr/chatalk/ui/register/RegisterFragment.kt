package fr.chatalk.ui.register

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import fr.chatalk.MainActivity
import fr.chatalk.R
import fr.chatalk.ui.login.LoginFragment

class RegisterFragment : Fragment() {
    companion object {
        fun newInstance() = RegisterFragment()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_register, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val btn: Button = view.findViewById(R.id.register_button)
        btn.setOnClickListener {
            activity?.let { ctx ->
                startActivity(Intent(ctx, MainActivity::class.java))
            }
        }

        val btnLogin: TextView = view.findViewById(R.id.register_login)
        btnLogin.setOnClickListener {
            fragmentManager
                ?.beginTransaction()
                ?.replace(R.id.auth_container, LoginFragment.newInstance())
                ?.commit()
        }
    }
}
