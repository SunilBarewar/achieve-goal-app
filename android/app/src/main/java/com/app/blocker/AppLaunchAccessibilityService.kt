package com.app.blocker

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

/**
 * Stub accessibility service for Phase 1 permission setup.
 * Full launch interception is implemented in Phase 3.
 */
class AppLaunchAccessibilityService : AccessibilityService() {
  override fun onAccessibilityEvent(event: AccessibilityEvent?) {}

  override fun onInterrupt() {}
}
