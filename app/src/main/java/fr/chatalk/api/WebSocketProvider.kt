package fr.chatalk.api

import android.content.SharedPreferences
import android.database.sqlite.SQLiteConstraintException
import android.util.Log
import fr.chatalk.data.AppDatabase
import fr.chatalk.data.MessageEntity
import fr.chatalk.data.UserEntity
import io.reactivex.Observable
import io.reactivex.disposables.CompositeDisposable
import io.reactivex.rxkotlin.addTo
import java.util.concurrent.TimeUnit

class WebSocketProvider(val service: ChatalkService, val database: AppDatabase, val pref: SharedPreferences) {
    val disposable = CompositeDisposable()
    init {
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
            }

        Observable.interval(0, 15, TimeUnit.SECONDS)
            .subscribe { service.sendRequest(PingRequest()) }
            .addTo(disposable)
    }

    companion object {
        @Volatile
        private var instance: WebSocketProvider? = null

        fun getInstance(service: ChatalkService, database: AppDatabase, pref: SharedPreferences) =
            instance ?: synchronized(this) {
                instance ?: WebSocketProvider(service, database, pref).also { instance = it }
            }
    }
}