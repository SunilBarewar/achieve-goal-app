package com.app.blocker

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.app.R
import java.text.DateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

class BlockOverlayActivity : AppCompatActivity() {
  private val handler = Handler(Looper.getMainLooper())
  private var endsAt: Long = 0L

  private val tickRunnable =
    object : Runnable {
      override fun run() {
        updateRemainingTime()
        handler.postDelayed(this, 60_000L)
      }
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_block_overlay)

    val appLabel = intent.getStringExtra(EXTRA_APP_LABEL).orEmpty()
    endsAt = intent.getLongExtra(EXTRA_ENDS_AT, 0L)

    findViewById<TextView>(R.id.block_app_label).text = appLabel
    findViewById<TextView>(R.id.block_until_time).text =
      getString(R.string.block_until, formatEndTime(endsAt))
    updateRemainingTime()
  }

  override fun onStart() {
    super.onStart()
    handler.postDelayed(tickRunnable, 60_000L)
  }

  override fun onStop() {
    handler.removeCallbacks(tickRunnable)
    super.onStop()
  }

  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    goHome()
  }

  private fun updateRemainingTime() {
    val remainingView = findViewById<TextView>(R.id.block_remaining)
    val remainingMs = endsAt - System.currentTimeMillis()
    remainingView.text =
      if (remainingMs <= 0) {
        getString(R.string.block_expiring_soon)
      } else {
        formatRemaining(remainingMs)
      }
  }

  private fun goHome() {
    val home =
      Intent(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_HOME)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
    startActivity(home)
    finish()
  }

  private fun formatEndTime(endsAtMs: Long): String {
    val formatter = DateFormat.getTimeInstance(DateFormat.SHORT, Locale.getDefault())
    return formatter.format(Date(endsAtMs))
  }

  private fun formatRemaining(remainingMs: Long): String {
    val totalMinutes = TimeUnit.MILLISECONDS.toMinutes(remainingMs)
    val hours = totalMinutes / 60
    val minutes = totalMinutes % 60
    val duration =
      when {
        hours > 0 -> getString(R.string.block_remaining_hours, hours.toInt(), minutes.toInt())
        minutes > 0 -> getString(R.string.block_remaining_minutes, minutes.toInt())
        else -> getString(R.string.block_expiring_soon)
      }
    return getString(R.string.block_remaining, duration)
  }

  companion object {
    const val EXTRA_APP_LABEL = "appLabel"
    const val EXTRA_ENDS_AT = "endsAt"
    const val EXTRA_PACKAGE_NAME = "packageName"
  }
}
