package io.ionic.starter;

import android.service.notification.StatusBarNotification;

public class NotificationListenerService extends android.service.notification.NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        super.onNotificationPosted(sbn);
        NotificationListenerPlugin.sendNotificationToFrontend(sbn);
    }
}