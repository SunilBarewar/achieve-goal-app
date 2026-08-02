package com.app.blocker

import android.content.Context
import android.content.Intent

object BlockEnforcer {
  private const val DEBOUNCE_MS = 800L

  @Volatile
  private var lastEnforcedPackage: String? = null

  @Volatile
  private var lastEnforcedAt: Long = 0L

  fun handleForegroundApp(context: Context, packageName: String?) {
    if (packageName.isNullOrBlank()) {
      return
    }

    val appContext = context.applicationContext
    if (packageName == appContext.packageName) {
      return
    }

    val repository = BlockRepository.getInstance(appContext)
    val block = repository.getActiveBlockForPackage(packageName) ?: return

    val now = System.currentTimeMillis()
    if (packageName == lastEnforcedPackage && now - lastEnforcedAt < DEBOUNCE_MS) {
      return
    }

    lastEnforcedPackage = packageName
    lastEnforcedAt = now

    showOverlay(appContext, block)
    goHome(appContext)
  }

  private fun showOverlay(context: Context, block: BlockSession) {
    val intent =
      Intent(context, BlockOverlayActivity::class.java).apply {
        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_SINGLE_TOP,
        )
        putExtra(BlockOverlayActivity.EXTRA_APP_LABEL, block.appLabel)
        putExtra(BlockOverlayActivity.EXTRA_ENDS_AT, block.endsAt)
        putExtra(BlockOverlayActivity.EXTRA_PACKAGE_NAME, block.packageName)
      }
    context.startActivity(intent)
  }

  private fun goHome(context: Context) {
    if (AppLaunchAccessibilityService.performHomeAction()) {
      return
    }

    val home =
      Intent(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_HOME)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
    context.startActivity(home)
  }
}
