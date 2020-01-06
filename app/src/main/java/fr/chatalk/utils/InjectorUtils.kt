package fr.chatalk.utils

import android.content.Context
import androidx.preference.PreferenceManager
import com.squareup.moshi.Moshi
import com.squareup.moshi.adapters.PolymorphicJsonAdapterFactory
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import fr.chatalk.api.*
import fr.chatalk.data.AppDatabase
import fr.chatalk.ui.conversation.ConversationListViewModelFactory
import fr.chatalk.ui.conversation.ConversationSingleViewModelFactory
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
                    .withSubtype(RegisterResponse::class.java, ActionType.register.name)
                    .withSubtype(SendInfosResponse::class.java, "send-info")
                    .withSubtype(MsgSenderResponse::class.java, "msg_sender")
            )
            .add(
                PolymorphicJsonAdapterFactory.of(Request::class.java, "action")
                    .withSubtype(PingRequest::class.java, ActionType.ping.name)
                    .withSubtype(LoginRequest::class.java, ActionType.login.name)
                    .withSubtype(RegisterRequest::class.java, ActionType.register.name)
                    .withSubtype(MsgSenderRequest::class.java, "msg_sender")
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

    fun provideSharedPreferences(context: Context) =
        PreferenceManager.getDefaultSharedPreferences(context)

    fun provideChatalkService() = ChatalkService(provideMoshi(), provideHttpClient())
    fun provideWebSocketProvider(context: Context) =
        WebSocketProvider.getInstance(
            provideChatalkService(),
            provideDatabase(context),
            provideSharedPreferences(context)
        )

    private fun provideDatabase(context: Context) = AppDatabase(context)

    fun provideLoginViewModelFactory(context: Context) =
        LoginViewModelFactory(provideDatabase(context), provideChatalkService())

    fun provideRegisterViewModelFactory(context: Context) =
        RegisterViewModelFactory(provideDatabase(context), provideChatalkService())

    fun provideConversationListViewModelFactory(context: Context) =
        ConversationListViewModelFactory(
            provideDatabase((context)),
            provideChatalkService(),
            provideSharedPreferences(context)
        )

    fun provideConversationSingleViewModelFactory(context: Context, conversationId: Int) =
        ConversationSingleViewModelFactory(
            provideDatabase(context),
            conversationId,
            provideChatalkService(),
            provideSharedPreferences(context)
        )
}