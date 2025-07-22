package io.ionic.starter;

import android.content.ComponentName;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import io.ionic.starter.NotificationListenerPlugin;

public class MainActivity extends BridgeActivity {
  @Override
    public void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      toggleNotificationListenerService(this);
      // 注册自定义插件
      registerPlugin(AppUpdaterPlugin.class);
      registerPlugin(NotificationListenerPlugin.class);

    }
  
    public static void toggleNotificationListenerService(Context context) {
      ComponentName componentName = new ComponentName(context, NotificationListenerService.class);
      PackageManager packageManager = context.getPackageManager();
  
      // 先禁用服务
      packageManager.setComponentEnabledSetting(
          componentName,
          PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
          PackageManager.DONT_KILL_APP
      );
  
      // 再启用服务
      packageManager.setComponentEnabledSetting(
          componentName,
          PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
          PackageManager.DONT_KILL_APP
      );
  }
}
