package io.ionic.starter;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Capacitor 插件
@CapacitorPlugin(name = "NotificationListener")
public class NotificationListenerPlugin extends Plugin {
    private static NotificationListenerPlugin instance;

    @Override
    public void load() {
        instance = this;
    }

    @PluginMethod
    public void start(PluginCall call) {
        call.resolve();
    }

    // 静态方法供系统服务调用
    public static void sendNotificationToFrontend(StatusBarNotification sbn) {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("packageName", sbn.getPackageName());
            ret.put("title", sbn.getNotification().extras.getString("android.title"));
            ret.put("text", sbn.getNotification().extras.getString("android.text"));
            instance.notifyListeners("onNotificationPosted", ret);
        }
    }
}

// 系统服务
public class NotificationListenerService extends android.service.notification.NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        super.onNotificationPosted(sbn);
        NotificationListenerPlugin.sendNotificationToFrontend(sbn);
    }
}