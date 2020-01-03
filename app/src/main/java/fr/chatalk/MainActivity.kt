package fr.chatalk

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import com.tinder.scarlet.Scarlet
import com.tinder.scarlet.messageadapter.moshi.MoshiMessageAdapter
import com.tinder.scarlet.streamadapter.rxjava2.RxJava2StreamAdapterFactory
import com.tinder.scarlet.websocket.okhttp.newWebSocketFactory
import com.tinder.scarlet.ws.Receive
import com.tinder.scarlet.ws.Send
import io.reactivex.Flowable
import okhttp3.OkHttpClient
import io.reactivex.disposables.CompositeDisposable
import java.util.*

data class EmptyWSMessage(val action: String, val payload: Map<String, Int> = emptyMap())

interface EchoService {
    @Receive
    fun observeText(): Flowable<String>

    @Send
    fun sendText(message: EmptyWSMessage): Boolean
}


class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val client = OkHttpClient()
        val scarletInstance = Scarlet.Builder()
            .webSocketFactory(client.newWebSocketFactory("wss://ws.chatalk.fr"))
            .addMessageAdapterFactory(MoshiMessageAdapter.Factory())
            .addStreamAdapterFactory(RxJava2StreamAdapterFactory())
            .build()

        val compositeDisposable = CompositeDisposable()
        val newsService = scarletInstance.create<EchoService>()
        val disposable = newsService.observeText().subscribe{ msg ->
            Log.d("WS", msg)
        }
        compositeDisposable.add(disposable)

        val pingMessage = EmptyWSMessage("ping")
        Timer().scheduleAtFixedRate(object : TimerTask() {
            override fun run() {
                newsService.sendText(pingMessage)
            }
        }, 0, 1_000)
    }
}
