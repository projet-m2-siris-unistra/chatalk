package fr.chatalk.utils

import android.content.Context
import com.squareup.moshi.Moshi
import com.squareup.moshi.adapters.PolymorphicJsonAdapterFactory
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import fr.chatalk.api.*
import fr.chatalk.data.AppDatabase
import fr.chatalk.ui.login.LoginViewModelFactory
import fr.chatalk.ui.register.RegisterViewModelFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor

object InjectorUtils {
    private fun provideMoshi() =
        Moshi.Builder()
            .add(
                PolymorphicJsonAdapterFactory.of(Response::class.java, "action")
                    .withSubtype(PingResponse::class.java, ActionType.ping.name)
                    .withSubtype(LoginResponse::class.java, ActionType.login.name)
            )
            .add(
                PolymorphicJsonAdapterFactory.of(Request::class.java, "action")
                    .withSubtype(PingRequest::class.java, ActionType.ping.name)
                    .withSubtype(LoginRequest::class.java, ActionType.login.name)
            )
            .add(KotlinJsonAdapterFactory())
            .build()

    private fun provideHttpClient(): OkHttpClient {
        val logger = HttpLoggingInterceptor()
        logger.setLevel(HttpLoggingInterceptor.Level.BASIC)
        return OkHttpClient.Builder()
            .addInterceptor(logger)
            .build()
    }

    fun provideChatalkService() = ChatalkService(provideMoshi(), provideHttpClient())
    fun provideWebSocketProvider(context: Context) =
        WebSocketProvider.getInstance(provideChatalkService(), provideDatabase(context))

    private fun provideDatabase(context: Context) = AppDatabase(context)

    fun provideLoginViewModelFactory(context: Context) = LoginViewModelFactory(provideDatabase(context), provideChatalkService())
    fun provideRegisterViewModelFactory(context: Context) = RegisterViewModelFactory(provideDatabase(context), provideChatalkService())
}