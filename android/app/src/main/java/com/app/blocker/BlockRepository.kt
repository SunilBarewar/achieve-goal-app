package com.app.blocker

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

data class BlockSession(
  val id: String,
  val packageName: String,
  val appLabel: String,
  val startedAt: Long,
  val endsAt: Long,
  val status: String,
) {
  fun isActive(now: Long = System.currentTimeMillis()): Boolean {
    return status == STATUS_ACTIVE && endsAt > now
  }

  fun toWritableMap(): com.facebook.react.bridge.WritableNativeMap {
    return com.facebook.react.bridge.WritableNativeMap().apply {
      putString("id", id)
      putString("packageName", packageName)
      putString("appLabel", appLabel)
      putDouble("startedAt", startedAt.toDouble())
      putDouble("endsAt", endsAt.toDouble())
      putString("status", status)
    }
  }

  companion object {
    const val STATUS_ACTIVE = "active"
    const val STATUS_EXPIRED = "expired"

    fun fromJson(obj: JSONObject): BlockSession {
      return BlockSession(
        id = obj.getString("id"),
        packageName = obj.getString("packageName"),
        appLabel = obj.getString("appLabel"),
        startedAt = obj.getLong("startedAt"),
        endsAt = obj.getLong("endsAt"),
        status = obj.getString("status"),
      )
    }
  }
}

class BlockRepository(context: Context) {
  private val prefs =
    context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  fun getAllBlocks(): List<BlockSession> {
    val raw = prefs.getString(KEY_BLOCKS, null) ?: return emptyList()
    return try {
      val array = JSONArray(raw)
      buildList {
        for (i in 0 until array.length()) {
          add(BlockSession.fromJson(array.getJSONObject(i)))
        }
      }
    } catch (_: Exception) {
      emptyList()
    }
  }

  fun getActiveBlocks(now: Long = System.currentTimeMillis()): List<BlockSession> {
    expireStaleBlocks(now)
    return getAllBlocks().filter { it.isActive(now) }
  }

  fun hasActiveBlock(packageName: String, now: Long = System.currentTimeMillis()): Boolean {
    return getActiveBlocks(now).any { it.packageName == packageName }
  }

  fun getActiveBlockForPackage(
    packageName: String,
    now: Long = System.currentTimeMillis(),
  ): BlockSession? {
    return getActiveBlocks(now).find { it.packageName == packageName }
  }

  fun addBlock(
    packageName: String,
    appLabel: String,
    endsAt: Long,
    now: Long = System.currentTimeMillis(),
  ): BlockSession {
    val session =
      BlockSession(
        id = UUID.randomUUID().toString(),
        packageName = packageName,
        appLabel = appLabel,
        startedAt = now,
        endsAt = endsAt,
        status = BlockSession.STATUS_ACTIVE,
      )
    val blocks = getAllBlocks().toMutableList()
    blocks.add(session)
    saveBlocks(blocks)
    return session
  }

  fun expireStaleBlocks(now: Long = System.currentTimeMillis()) {
    val blocks = getAllBlocks()
    var changed = false
    val updated =
      blocks.map { block ->
        if (block.status == BlockSession.STATUS_ACTIVE && block.endsAt <= now) {
          changed = true
          block.copy(status = BlockSession.STATUS_EXPIRED)
        } else {
          block
        }
      }
    if (changed) {
      saveBlocks(updated)
    }
  }

  private fun saveBlocks(blocks: List<BlockSession>) {
    val array = JSONArray()
    blocks.forEach { block ->
      array.put(
        JSONObject().apply {
          put("id", block.id)
          put("packageName", block.packageName)
          put("appLabel", block.appLabel)
          put("startedAt", block.startedAt)
          put("endsAt", block.endsAt)
          put("status", block.status)
        },
      )
    }
    prefs.edit().putString(KEY_BLOCKS, array.toString()).apply()
  }

  companion object {
    private const val PREFS_NAME = "achieve_goal_blocks"
    private const val KEY_BLOCKS = "blocks"

    const val MIN_LEAD_TIME_MS = 60_000L
    const val MAX_HORIZON_MS = 7L * 24 * 60 * 60 * 1000

    @Volatile
    private var instance: BlockRepository? = null

    fun getInstance(context: Context): BlockRepository {
      return instance
        ?: synchronized(this) {
          instance ?: BlockRepository(context.applicationContext).also { instance = it }
        }
    }
  }
}
