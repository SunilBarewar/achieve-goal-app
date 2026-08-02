package com.app.blocker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != Intent.ACTION_BOOT_COMPLETED) {
      return
    }

    val repository = BlockRepository.getInstance(context)
    if (repository.getActiveBlocks().isNotEmpty()) {
      BlockMonitorService.startOrUpdate(context)
    }
  }
}
