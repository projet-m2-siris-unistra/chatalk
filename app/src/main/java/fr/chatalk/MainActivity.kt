package fr.chatalk

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import fr.chatalk.api.*
import fr.chatalk.utils.InjectorUtils


class MainActivity : AppCompatActivity() {
    private lateinit var wsp: WebSocketProvider

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        wsp = InjectorUtils.provideWebSocketProvider(applicationContext)
    }
}
