package com.app.blocker

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class AppBlockerPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    if (name == AppBlockerModule.NAME) {
      return AppBlockerModule(reactContext)
    }
    return null
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      mapOf(
        AppBlockerModule.NAME to
          ReactModuleInfo(
            AppBlockerModule.NAME,
            AppBlockerModule.NAME,
            false,
            false,
            false,
            true,
          )
      )
    }
  }
}
