package com.app.blocker

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class AppLaunchAccessibilityService : AccessibilityService() {
  override fun onServiceConnected() {
    super.onServiceConnected()
    instance = this
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event == null) {
      return
    }
    if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      return
    }

    val packageName = event.packageName?.toString()
    BlockEnforcer.handleForegroundApp(this, packageName)
  }

  override fun onInterrupt() {}

  override fun onDestroy() {
    if (instance === this) {
      instance = null
    }
    super.onDestroy()
  }

  companion object {
    @Volatile
    private var instance: AppLaunchAccessibilityService? = null

    fun performHomeAction(): Boolean {
      val service = instance ?: return false
      return service.performGlobalAction(GLOBAL_ACTION_HOME)
    }
  }
}
