import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NotificationListener")
public class NotificationListener extends NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        super.onNotificationPosted(sbn);
        JSObject ret = new JSObject();
        ret.put("packageName", sbn.getPackageName());
        ret.put("title", sbn.getNotification().extras.getString("android.title"));
        ret.put("text", sbn.getNotification().extras.getString("android.text"));
        
        // 主动推送事件到前端
        notifyListeners("onNotificationPosted", ret);
    }

    @PluginMethod
    public void start(PluginCall call) {
        call.resolve(); // 仅表示启动成功
    }
}