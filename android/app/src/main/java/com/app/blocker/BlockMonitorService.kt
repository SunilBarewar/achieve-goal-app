package com.app.blocker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat

class BlockMonitorService : Service() {
  private val handler = Handler(Looper.getMainLooper())
  private var polling = false

  private val pollRunnable =
    object : Runnable {
      override fun run() {
        tick()
        handler.postDelayed(this, POLL_INTERVAL_MS)
      }
    }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val repository = BlockRepository.getInstance(this)
    val activeBlocks = repository.getActiveBlocks()

    if (activeBlocks.isEmpty()) {
      stopPolling()
      stopSelf()
      return START_NOT_STICKY
    }

    ensureNotificationChannel()
    startForegroundWithNotification(activeBlocks.size)
    startPolling()

    return START_STICKY
  }

  override fun onDestroy() {
    stopPolling()
    super.onDestroy()
  }

  private fun tick() {
    val repository = BlockRepository.getInstance(this)
    val activeBlocks = repository.getActiveBlocks()

    if (activeBlocks.isEmpty()) {
      stopPolling()
      stopSelf()
      return
    }

    updateNotification(activeBlocks.size)

    val foregroundPackage = ForegroundAppDetector.getForegroundPackage(this)
    BlockEnforcer.handleForegroundApp(this, foregroundPackage)
  }

  private fun startPolling() {
    if (polling) {
      return
    }
    polling = true
    handler.post(pollRunnable)
  }

  private fun stopPolling() {
    polling = false
    handler.removeCallbacks(pollRunnable)
  }

  private fun startForegroundWithNotification(blockCount: Int) {
    val notification = buildNotification(blockCount)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(
        NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
      )
    } else {
      @Suppress("DEPRECATION")
      startForeground(NOTIFICATION_ID, notification)
    }
  }

  private fun updateNotification(blockCount: Int) {
    val manager = getSystemService(NotificationManager::class.java)
    manager.notify(NOTIFICATION_ID, buildNotification(blockCount))
  }

  private fun ensureNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = getSystemService(NotificationManager::class.java)
    val channel =
      NotificationChannel(
        CHANNEL_ID,
        "App blocking",
        NotificationManager.IMPORTANCE_LOW,
      ).apply {
        description = "Shows while apps are blocked"
        setShowBadge(false)
      }
    manager.createNotificationChannel(channel)
  }

  private fun buildNotification(blockCount: Int): Notification {
    val label =
      if (blockCount == 1) {
        "1 app blocked"
      } else {
        "$blockCount apps blocked"
      }

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Achieve Goal")
      .setContentText(label)
      .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
      .setOngoing(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()
  }

  companion object {
    private const val CHANNEL_ID = "block_monitor"
    private const val NOTIFICATION_ID = 1001
    private const val POLL_INTERVAL_MS = 400L

    fun startOrUpdate(context: Context) {
      val intent = Intent(context, BlockMonitorService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stopIfIdle(context: Context) {
      val repository = BlockRepository.getInstance(context)
      if (repository.getActiveBlocks().isEmpty()) {
        context.stopService(Intent(context, BlockMonitorService::class.java))
      }
    }
  }
}
