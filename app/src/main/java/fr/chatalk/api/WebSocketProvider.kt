package fr.chatalk.api

import android.util.Log
import fr.chatalk.data.AppDatabase
import io.reactivex.Observable
import io.reactivex.disposables.CompositeDisposable
import io.reactivex.rxkotlin.addTo
import java.util.concurrent.TimeUnit

class WebSocketProvider(val service: ChatalkService, val database: AppDatabase) {
    val disposable = CompositeDisposable()
    init {
        service.observePing()
            .filter { it.action == ActionType.ping }
            .subscribe { Log.d("WS", it.toString()) }
            .addTo(disposable)

        service.observeLogin()
            .filter { it.action == ActionType.login }
            .subscribe { Log.d("WS", it.toString()) }
            .addTo(disposable)

        Observable.interval(0, 15, TimeUnit.SECONDS)
            .subscribe { service.sendPing(PingRequest()) }
            .addTo(disposable)
    }

    companion object {
        @Volatile
        private var instance: WebSocketProvider? = null

        fun getInstance(service: ChatalkService, database: AppDatabase) =
            instance ?: synchronized(this) {
                instance ?: WebSocketProvider(service, database).also { instance = it }
            }
    }
}