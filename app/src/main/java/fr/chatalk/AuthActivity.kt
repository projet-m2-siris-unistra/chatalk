package fr.chatalk

import android.os.Bundle
import android.view.Window
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.databinding.DataBindingUtil
import fr.chatalk.api.WebSocketProvider
import fr.chatalk.databinding.ActivityAuthBinding
import fr.chatalk.utils.InjectorUtils

class AuthActivity : AppCompatActivity() {
    private lateinit var wsp: WebSocketProvider
    private lateinit var binding: ActivityAuthBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = DataBindingUtil.setContentView(this, R.layout.activity_auth)
        wsp = InjectorUtils.provideWebSocketProvider(applicationContext)

        val w: Window = window
        w.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
        w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
        w.statusBarColor = ContextCompat.getColor(this, R.color.colorPrimaryDark)
    }
}
