package io.ionic.starter;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.service.notification.StatusBarNotification;

@CapacitorPlugin(name = "NotificationListener")
public class NotificationListenerPlugin extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        call.resolve();
    }

    public static void sendNotificationToFrontend(StatusBarNotification sbn) {
      JSObject ret = new JSObject();
      ret.put("packageName", sbn.getPackageName());
      ret.put("title", sbn.getNotification().extras.getString("android.title"));
      ret.put("text", sbn.getNotification().extras.getString("android.text"));
      notifyListeners("onNotificationPosted", ret);
    }
}