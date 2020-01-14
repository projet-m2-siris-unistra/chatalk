package fr.chatalk.api

import android.content.SharedPreferences
import android.database.sqlite.SQLiteConstraintException
import android.util.Log
import com.tinder.scarlet.WebSocket
import fr.chatalk.data.AppDatabase
import fr.chatalk.data.ConversationEntity
import fr.chatalk.data.MessageEntity
import fr.chatalk.data.UserEntity
import io.karn.notify.NotifyCreator
import io.reactivex.Observable
import io.reactivex.disposables.CompositeDisposable
import io.reactivex.rxkotlin.addTo
import java.util.concurrent.TimeUnit

class WebSocketProvider(
    val service: ChatalkService,
    val database: AppDatabase,
    val pref: SharedPreferences,
    val notifyCreator: NotifyCreator
) {
    val disposable = CompositeDisposable()

    init {
        service.observeWebSocketEvent()
            .filter { it is WebSocket.Event.OnConnectionOpened<*> }
            .subscribe {
                val token = pref.getString("token", "")
                if (!token.isNullOrBlank()) {
                    service.sendRequest(
                        LoginRequest(
                            LoginPayload(
                                token = token,
                                method = "jwt",
                                action = "login"
                            )
                        )
                    )
                }
            }
            .addTo(disposable)

        service.observeResponse()
            .subscribe { Log.d("WS/all", it.toString()) }
            .addTo(disposable)

        service.observePing()
            .subscribe { Log.d("WS/ping", it.toString()) }
            .addTo(disposable)

        service.observeLogin()
            .filter { it.success && !it.token.isNullOrBlank() }
            .subscribe {
                pref.edit()
                    .apply {
                        putString("token", it.token)
                        apply()
                    }
                Log.d("WS/login", it.toString())
                val token = it.token
                if (token.isNullOrBlank()) {
                    return@subscribe
                }
                Log.d("token", token)
            }
            .addTo(disposable)

        service.observeLogin()
            .filter { it.success && !it.type.isNullOrBlank() && it.type == "logout" }
            .subscribe {
                pref.edit().apply {
                    remove("token")
                    apply()
                }
                database.clearAllTables()
                Log.d("logout", "got logout response from server")
                notifyCreator.content {
                    title = "Logged out"
                    text = "You were successfully logged out from ChaTalK"
                }.show()
            }
            .addTo(disposable)

        service.observeLogin()
            .filter { !it.success }
            .subscribe {
                pref.edit().apply {
                    remove("token")
                    apply()
                }
                Log.d("WS/login/failure", "logged out because of login error")
            }
            .addTo(disposable)

        service.observeRegister()
            .subscribe {
                Log.d("WS/register", it.toString())
            }
            .addTo(disposable)

        service.observeMsgSender()
            .filter { it.type == "text" }
            .map { MessageEntity(it.msgid!!, it.source!!, it.destination!!, it.payload) }
            .flatMapSingle { message ->
                database.messageDao().insert(message)
                    .onErrorResumeNext {
                        if (it !is SQLiteConstraintException) throw it
                        Log.d("WS/msgSender", "conflict on message $message, updating")
                        database.messageDao().update(message)
                            .toSingle { message.messageId.toLong() }
                    }
            }
            .subscribe {
                Log.d("WS/msgSender", "inserted message $it")
            }
            .addTo(disposable)

        service.observeSendInfos()
            .filter { it.success }
            .apply {
                this
                    .flatMapIterable { it.users }
                    .map { UserEntity(it.userid!!, it.username!!, it.displayname) }
                    .flatMapSingle { user ->
                        database.userDao().insert(user)
                            .onErrorResumeNext {
                                if (it !is SQLiteConstraintException) throw it
                                Log.d("WS/sendInfos/users", "conflict on user $user, updating")
                                database.userDao().update(user).toSingle { user.userId.toLong() }
                            }
                    }
                    .subscribe {
                        Log.d("WS/sendInfos/users", "inserted user $it")
                    }
                    .addTo(disposable)

                this
                    .flatMapIterable { it.messages }
                    .map { MessageEntity(it.msgid!!, it.senderid!!, it.convid!!, it.content!!) }
                    .flatMapSingle { message ->
                        database.messageDao().insert(message)
                            .onErrorResumeNext {
                                if (it !is SQLiteConstraintException) throw it
                                Log.d(
                                    "WS/sendInfos/messages",
                                    "conflict on message $message, updating"
                                )
                                database.messageDao().update(message)
                                    .toSingle { message.messageId.toLong() }
                            }
                    }
                    .subscribe {
                        Log.d("WS/sendInfos/messages", "inserted message $it")
                    }
                    .addTo(disposable)


                this
                    .flatMapIterable { it.convs }
                    .map {
                        ConversationEntity(
                            it.convid!!,
                            it.convname!!,
                            it.sharedKey!!,
                            it.members!!
                        )
                    }
                    .flatMapSingle { conversation ->
                        database.conversationDao().insert(conversation)
                            .onErrorResumeNext {
                                if (it !is SQLiteConstraintException) throw it
                                Log.d(
                                    "WS/sendInfos/convs",
                                    "conflict on conversation $conversation, updating"
                                )
                                database.conversationDao().update(conversation)
                                    .toSingle { conversation.conversationId.toLong() }
                            }
                    }
                    .subscribe {
                        Log.d("WS/sendInfos/convs", "inserted conversation $it")
                    }
                    .addTo(disposable)
            }

        Observable.interval(0, 15, TimeUnit.SECONDS)
            .subscribe { service.sendRequest(PingRequest()) }
            .addTo(disposable)

        Observable.interval(0, 2, TimeUnit.MINUTES)
            .subscribe {
                val token = pref.getString("token", "")
                if (!token.isNullOrBlank()) {
                    service.sendRequest(
                        LoginRequest(
                            LoginPayload(
                                token = token,
                                method = "jwt",
                                action = "refresh"
                            )
                        )
                    )
                }
            }
            .addTo(disposable)
    }

    companion object {
        @Volatile
        private var instance: WebSocketProvider? = null

        fun getInstance(
            service: ChatalkService,
            database: AppDatabase,
            pref: SharedPreferences,
            notifyCreator: NotifyCreator
        ) = instance ?: synchronized(this) {
            instance ?: WebSocketProvider(service, database, pref, notifyCreator).also {
                instance = it
            }
        }
    }
}
