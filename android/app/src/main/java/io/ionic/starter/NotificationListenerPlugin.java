package io.ionic.starter;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.service.notification.StatusBarNotification;

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