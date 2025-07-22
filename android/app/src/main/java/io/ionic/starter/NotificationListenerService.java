package io.ionic.starter;

import android.service.notification.StatusBarNotification;
import android.util.Log;

public class NotificationListenerService extends android.service.notification.NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        super.onNotificationPosted(sbn);
        NotificationListenerPlugin.sendNotificationToFrontend(sbn);
    }
    @Override
    public void onListenerConnected() {
        Log.d("NotificationListener", "Service connected!");
        super.onListenerConnected();
    }
}