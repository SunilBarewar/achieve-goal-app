package com.app.blocker

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context

object ForegroundAppDetector {
  private const val LOOKBACK_MS = 10_000L

  fun getForegroundPackage(context: Context): String? {
    val usageStatsManager =
      context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
        ?: return null

    val end = System.currentTimeMillis()
    val stats =
      usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        end - LOOKBACK_MS,
        end,
      )

    if (stats.isNullOrEmpty()) {
      return null
    }

    return stats.maxByOrNull(UsageStats::getLastTimeUsed)?.packageName
  }
}
