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
import androidx.core.app.ComponentActivity.ExtraData
import androidx.core.content.ContextCompat.getSystemService
import android.icu.lang.UCharacter.GraphemeClusterBreak.T
import java.util.*


interface EchoService {
    @Receive
    fun observeText(): Flowable<String>

    @Send
    fun sendText(message: String): Boolean
}

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val client = OkHttpClient()
        val scarletInstance = Scarlet.Builder()
            .webSocketFactory(client.newWebSocketFactory("wss://echo.websocket.org"))
            .addMessageAdapterFactory(MoshiMessageAdapter.Factory())
            .addStreamAdapterFactory(RxJava2StreamAdapterFactory())
            .build()

        val compositeDisposable = CompositeDisposable()
        val newsService = scarletInstance.create<EchoService>()
        val disposable = newsService.observeText().subscribe{ msg ->
            Log.d("WS", msg)
        }
        compositeDisposable.add(disposable)

        Timer().scheduleAtFixedRate(object : TimerTask() {
            override fun run() {
                newsService.sendText("hello world")
            }
        }, 0, 1_000)
    }
}
