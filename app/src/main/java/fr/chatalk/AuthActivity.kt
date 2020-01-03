package fr.chatalk

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.Window
import android.view.WindowManager
import androidx.core.content.ContextCompat
import fr.chatalk.api.WebSocketProvider
import fr.chatalk.ui.login.LoginFragment
import fr.chatalk.utils.InjectorUtils

class AuthActivity : AppCompatActivity() {
    private lateinit var wsp: WebSocketProvider

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_auth)
        wsp = InjectorUtils.provideWebSocketProvider(applicationContext)

        val w: Window = window
        w.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
        w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
        w.statusBarColor = ContextCompat.getColor(this, R.color.colorPrimaryDark)
    }
}
