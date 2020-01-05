package fr.chatalk.ui.register

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import fr.chatalk.R
import fr.chatalk.api.ChatalkService
import fr.chatalk.databinding.FragmentRegisterBinding
import fr.chatalk.utils.InjectorUtils
import io.reactivex.disposables.CompositeDisposable
import io.reactivex.rxkotlin.addTo

class RegisterFragment : Fragment() {
    private val viewModel: RegisterViewModel by viewModels {
        InjectorUtils.provideRegisterViewModelFactory(requireContext())
    }
    private lateinit var binding: FragmentRegisterBinding
    private lateinit var disposable: CompositeDisposable
    private lateinit var service: ChatalkService

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentRegisterBinding.inflate(inflater, container, false)
        disposable = CompositeDisposable()
        service = InjectorUtils.provideChatalkService()

        binding.registerButton.setOnClickListener {
            val username: String = binding.registerUsername.text.toString()
            val email: String = binding.registerEmail.text.toString()
            val password: String = binding.registerPassword.text.toString()
            val passwordConfirmation: String = binding.registerPasswordConfirmation.text.toString()
            viewModel.register(username, email, password, passwordConfirmation)
        }

        binding.registerLogin.setOnClickListener {
            val direction = RegisterFragmentDirections.actionRegisterFragmentToLoginFragment()
            findNavController().navigate(direction)
        }

        service.observeRegister()
            .filter { it.success }
            .subscribe {
                Log.d("RegisterFragment/register/success", it.toString())
                findNavController().navigate(R.id.loginFragment)
            }
            .addTo(disposable)

        return binding.root
    }

    override fun onDestroy() {
        disposable.dispose()
        super.onDestroy()
    }
}
