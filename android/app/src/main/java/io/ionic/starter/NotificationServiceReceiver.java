package io.ionic.starter;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Log;

public class NotificationServiceReceiver extends BroadcastReceiver {
    private static final String TAG = "NotificationServiceReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "Received broadcast: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action) || 
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(action) ||
            Intent.ACTION_PACKAGE_REPLACED.equals(action)) {
            
            // 系统启动或应用更新后，重新启用通知监听服务
            restartNotificationListenerService(context);
        }
    }

    private void restartNotificationListenerService(Context context) {
        try {
            // 检查是否有通知访问权限
            if (!isNotificationServiceEnabled(context)) {
                Log.w(TAG, "Notification access permission not granted");
                return;
            }

            // 重新启用服务
            ComponentName componentName = new ComponentName(context, NotificationListenerService.class);
            PackageManager packageManager = context.getPackageManager();

            // 先禁用再启用，强制重启服务
            packageManager.setComponentEnabledSetting(
                componentName,
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            );

            packageManager.setComponentEnabledSetting(
                componentName,
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            );

            Log.d(TAG, "NotificationListenerService restarted");

        } catch (Exception e) {
            Log.e(TAG, "Error restarting NotificationListenerService", e);
        }
    }

    private boolean isNotificationServiceEnabled(Context context) {
        ComponentName cn = new ComponentName(context, NotificationListenerService.class);
        String flat = Settings.Secure.getString(context.getContentResolver(), "enabled_notification_listeners");
        return flat != null && flat.contains(cn.flattenToString());
    }
}