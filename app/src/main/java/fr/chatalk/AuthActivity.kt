package fr.chatalk

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import android.view.Window
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.databinding.DataBindingUtil
import fr.chatalk.api.WebSocketProvider
import fr.chatalk.databinding.ActivityAuthBinding
import fr.chatalk.utils.InjectorUtils

class AuthActivity : AppCompatActivity(), SharedPreferences.OnSharedPreferenceChangeListener {
    private lateinit var wsp: WebSocketProvider
    private lateinit var binding: ActivityAuthBinding
    private lateinit var prefs: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = DataBindingUtil.setContentView(this, R.layout.activity_auth)
        wsp = InjectorUtils.provideWebSocketProvider(applicationContext)
        prefs = InjectorUtils.provideSharedPreferences(applicationContext)

        val w: Window = window
        w.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
        w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
        w.statusBarColor = ContextCompat.getColor(this, R.color.colorPrimaryDark)

        prefs.registerOnSharedPreferenceChangeListener(this)
    }

    override fun onDestroy() {
        super.onDestroy()
        prefs.unregisterOnSharedPreferenceChangeListener(this)
    }

    override fun onSharedPreferenceChanged(sharedPreferences: SharedPreferences?, key: String?) {
        if (!key.isNullOrBlank() && key == "token") {
            val token = sharedPreferences?.getString(key, "")
            Log.d("prefs/token", "token changed $token")
            if (!token.isNullOrBlank()) {
                startActivity(Intent(this, MainActivity::class.java))
            }
        }
    }
}
