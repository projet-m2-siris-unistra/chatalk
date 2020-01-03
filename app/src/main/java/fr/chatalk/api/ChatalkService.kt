package fr.chatalk.api

import com.squareup.moshi.Moshi
import com.tinder.scarlet.Scarlet
import com.tinder.scarlet.messageadapter.moshi.MoshiMessageAdapter
import com.tinder.scarlet.streamadapter.rxjava2.RxJava2StreamAdapterFactory
import com.tinder.scarlet.websocket.okhttp.newWebSocketFactory
import com.tinder.scarlet.ws.Receive
import com.tinder.scarlet.ws.Send
import io.reactivex.Flowable
import okhttp3.OkHttpClient

interface ChatalkService {
    @Receive
    fun observePing(): Flowable<PingResponse>

    @Send
    fun sendPing(message: PingRequest): Boolean

    @Receive
    fun observeLogin(): Flowable<LoginResponse>

    @Send
    fun sendLogin(message: LoginRequest): Boolean

    companion object {
        @Volatile
        private var instance: ChatalkService? = null

        operator fun invoke(moshi: Moshi, client: OkHttpClient) =
            instance ?: synchronized(this) {
                instance ?: buildService(moshi, client).also { instance = it }
            }

        private fun buildService(moshi: Moshi, client: OkHttpClient): ChatalkService =
            Scarlet.Builder()
                .webSocketFactory(client.newWebSocketFactory("wss://ws.chatalk.fr"))
                .addMessageAdapterFactory(MoshiMessageAdapter.Factory(moshi))
                .addStreamAdapterFactory(RxJava2StreamAdapterFactory())
                .build()
                .create()
    }
}
