package com.app.blocker

import android.app.AppOpsManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.app.usage.UsageStatsManager
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import java.io.ByteArrayOutputStream

class AppBlockerModule(reactContext: ReactApplicationContext) :
  NativeAppBlockerSpec(reactContext) {

  override fun getInstalledApps(promise: Promise) {
    try {
      val pm = reactApplicationContext.packageManager
      val launcherIntent =
        Intent(Intent.ACTION_MAIN).apply { addCategory(Intent.CATEGORY_LAUNCHER) }

      @Suppress("DEPRECATION")
      val activities =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          pm.queryIntentActivities(
            launcherIntent,
            PackageManager.ResolveInfoFlags.of(PackageManager.MATCH_ALL.toLong()),
          )
        } else {
          pm.queryIntentActivities(launcherIntent, PackageManager.MATCH_ALL)
        }

      val seen = mutableSetOf<String>()
      val apps =
        activities
          .mapNotNull { resolveInfo ->
            val packageName = resolveInfo.activityInfo.packageName
            if (packageName == reactApplicationContext.packageName) {
              return@mapNotNull null
            }
            if (!seen.add(packageName)) {
              return@mapNotNull null
            }

            val label = resolveInfo.loadLabel(pm).toString()
            val icon = encodeDrawableToBase64(resolveInfo.loadIcon(pm))

            WritableNativeMap().apply {
              putString("packageName", packageName)
              putString("label", label)
              putString("icon", icon)
            }
          }
          .sortedBy { it.getString("label")?.lowercase() }

      val result = WritableNativeArray()
      apps.forEach { result.pushMap(it) }
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("GET_APPS_ERROR", e.message, e)
    }
  }

  override fun checkPermissions(promise: Promise) {
    try {
      val ctx = reactApplicationContext
      val result =
        WritableNativeMap().apply {
          putBoolean("usage_access", hasUsageAccess(ctx))
          putBoolean("accessibility", hasAccessibilityEnabled(ctx))
          putBoolean("overlay", Settings.canDrawOverlays(ctx))
          putBoolean("notifications", hasNotificationPermission(ctx))
          putBoolean("battery_optimization", isBatteryOptimizationIgnored(ctx))
        }
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("CHECK_PERMISSIONS_ERROR", e.message, e)
    }
  }

  override fun openPermissionSettings(permission: String, promise: Promise) {
    try {
      val ctx = reactApplicationContext
      val intent =
        when (permission) {
          "usage_access" -> Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
          "accessibility" -> Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
          "overlay" ->
            Intent(
              Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
              Uri.parse("package:${ctx.packageName}"),
            )
          "notifications" ->
            Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
              putExtra(Settings.EXTRA_APP_PACKAGE, ctx.packageName)
            }
          "battery_optimization" ->
            Intent(
              Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
              Uri.parse("package:${ctx.packageName}"),
            )
          else -> throw IllegalArgumentException("Unknown permission: $permission")
        }

      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(intent)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("OPEN_SETTINGS_ERROR", e.message, e)
    }
  }

  private fun hasUsageAccess(context: Context): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        appOps.unsafeCheckOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          context.packageName,
        )
      } else {
        @Suppress("DEPRECATION")
        appOps.checkOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          context.packageName,
        )
      }
    if (mode == AppOpsManager.MODE_ALLOWED) {
      return true
    }

    // Some OEM builds report MODE_DEFAULT even after grant; verify we can query stats.
    val usageStatsManager =
      context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val end = System.currentTimeMillis()
    val stats =
      usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, end - 60_000, end)
    return !stats.isNullOrEmpty()
  }

  private fun hasAccessibilityEnabled(context: Context): Boolean {
    val enabled =
      Settings.Secure.getInt(
        context.contentResolver,
        Settings.Secure.ACCESSIBILITY_ENABLED,
        0,
      ) == 1
    if (!enabled) {
      return false
    }

    val services =
      Settings.Secure.getString(
        context.contentResolver,
        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
      ) ?: return false

    val expected = ComponentName(context, AppLaunchAccessibilityService::class.java)
    return services.split(':').any { service ->
      ComponentName.unflattenFromString(service) == expected
    }
  }

  private fun hasNotificationPermission(context: Context): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) ==
        PackageManager.PERMISSION_GRANTED
    } else {
      true
    }
  }

  private fun isBatteryOptimizationIgnored(context: Context): Boolean {
    val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    return powerManager.isIgnoringBatteryOptimizations(context.packageName)
  }

  private fun encodeDrawableToBase64(drawable: Drawable): String {
    val bitmap =
      (drawable as? BitmapDrawable)?.bitmap ?: run {
        val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 96
        val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 96
        Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888).also { bmp ->
          val canvas = Canvas(bmp)
          drawable.setBounds(0, 0, canvas.width, canvas.height)
          drawable.draw(canvas)
        }
      }

    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
    val base64 = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
    return "data:image/png;base64,$base64"
  }

  companion object {
    const val NAME = "AppBlocker"
  }
}
