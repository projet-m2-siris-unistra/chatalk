package fr.chatalk

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import fr.chatalk.api.WebSocketProvider
import fr.chatalk.databinding.ActivityMainBinding
import fr.chatalk.utils.InjectorUtils


class MainActivity : AppCompatActivity() {
    private lateinit var wsp: WebSocketProvider
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = DataBindingUtil.setContentView(this, R.layout.activity_main)
        wsp = InjectorUtils.provideWebSocketProvider(applicationContext)
    }
}
