package fr.chatalk

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import fr.chatalk.api.*
import fr.chatalk.utils.InjectorUtils
import io.reactivex.disposables.CompositeDisposable
import java.util.*


class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val compositeDisposable = CompositeDisposable()
        val chatalkService = InjectorUtils.provideChatalkService()
        val disposable = chatalkService.observePing()
            .filter { it.action == ActionType.ping }
            .subscribe { msg ->
                Log.d("WS2", msg.toString())
            }
        val disposable2 = chatalkService.observeLogin()
            .filter { it.action == ActionType.login }
            .subscribe { msg ->
                Log.d("WS2", msg.toString())
            }
        compositeDisposable.add(disposable)
        compositeDisposable.add(disposable2)

        val pingMessage = PingRequest()
        Timer().scheduleAtFixedRate(object : TimerTask() {
            override fun run() {
                chatalkService.sendPing(pingMessage)
            }
        }, 0, 1_000)
    }
}
