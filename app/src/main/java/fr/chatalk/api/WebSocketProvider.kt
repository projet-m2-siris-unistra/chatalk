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
        service.observeResponse()
            .subscribe { Log.d("WSA", it.toString()) }
            .addTo(disposable)

        service.observePing()
            .subscribe { Log.d("WSP", it.toString()) }
            .addTo(disposable)

        service.observeLogin()
            .subscribe { Log.d("WSL", it.toString()) }
            .addTo(disposable)

        Observable.interval(0, 15, TimeUnit.SECONDS)
            .subscribe { service.sendRequest(PingRequest()) }
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