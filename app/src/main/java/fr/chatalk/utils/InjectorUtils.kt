package fr.chatalk.utils

import android.content.Context
import com.squareup.moshi.Moshi
import com.squareup.moshi.adapters.PolymorphicJsonAdapterFactory
import fr.chatalk.api.*
import fr.chatalk.data.AppDatabase
import fr.chatalk.ui.login.LoginViewModelFactory
import fr.chatalk.ui.register.RegisterViewModelFactory
import okhttp3.OkHttpClient

object InjectorUtils {
    private fun provideMoshi() =
        Moshi.Builder()
            .add(
                PolymorphicJsonAdapterFactory.of(Action::class.java, "action")
                    .withSubtype(PingResponse::class.java, ActionType.ping.name)
                    .withSubtype(LoginResponse::class.java, ActionType.login.name)
            )
            .build()

    private fun provideHttpClient() = OkHttpClient.Builder()
        .build()

    fun provideChatalkService() = ChatalkService(provideMoshi(), provideHttpClient())
    fun provideWebSocketProvider(context: Context) =
        WebSocketProvider.getInstance(provideChatalkService(), provideDatabase(context))

    private fun provideDatabase(context: Context) = AppDatabase(context)

    fun provideLoginViewModelFactory(context: Context) = LoginViewModelFactory(provideDatabase(context))
    fun provideRegisterViewModelFactory(context: Context) = RegisterViewModelFactory(provideDatabase(context))
}