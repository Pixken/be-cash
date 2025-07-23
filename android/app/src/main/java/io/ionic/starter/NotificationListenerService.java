package io.ionic.starter;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class NotificationListenerService extends android.service.notification.NotificationListenerService {
    private static final String TAG = "NotificationListener";
    private static final String CHANNEL_ID = "notification_listener_channel";
    private static final int FOREGROUND_ID = 1001;
    private SharedPreferences sharedPreferences;

    @Override
    public void onCreate() {
        super.onCreate();
        sharedPreferences = getSharedPreferences("notification_data", Context.MODE_PRIVATE);
        createNotificationChannel();
        startForegroundService();
        Log.d(TAG, "NotificationListenerService created");
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        super.onNotificationPosted(sbn);
        
        try {
            // 过滤掉系统通知和自己的通知
            String packageName = sbn.getPackageName();
            if (packageName.equals(getPackageName()) || 
                packageName.equals("android") || 
                packageName.equals("com.android.systemui")) {
                return;
            }

            // 提取通知信息
            JSONObject notificationData = extractNotificationData(sbn);
            
            // 保存到本地存储
            saveNotificationToLocal(notificationData);
            
            // 发送到前端（如果应用在运行）
            NotificationListenerPlugin.sendNotificationToFrontend(sbn);
            
            Log.d(TAG, "Notification processed: " + notificationData.toString());
            
        } catch (Exception e) {
            Log.e(TAG, "Error processing notification", e);
        }
    }

    @Override
    public void onListenerConnected() {
        Log.d(TAG, "Notification Listener Service connected!");
        super.onListenerConnected();
    }

    @Override
    public void onListenerDisconnected() {
        Log.d(TAG, "Notification Listener Service disconnected!");
        super.onListenerDisconnected();
        
        // 尝试重新连接
        requestRebind(new ComponentName(this, NotificationListenerService.class));
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "NotificationListenerService destroyed");
        super.onDestroy();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "NotificationListenerService onStartCommand");
        
        // 确保前台服务正在运行
        if (!isForegroundServiceRunning()) {
            startForegroundService();
        }
        
        // 返回 START_STICKY 让系统在服务被杀死后自动重启
        return START_STICKY;
    }

    private boolean isForegroundServiceRunning() {
        try {
            // 简单检查：如果能获取到通知管理器，说明服务还在运行
            NotificationManager manager = getSystemService(NotificationManager.class);
            return manager != null;
        } catch (Exception e) {
            return false;
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "通知监听服务",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("保持通知监听服务在后台运行");
            channel.setShowBadge(false);
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private void startForegroundService() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("通知监听服务")
            .setContentText("正在后台监听通知")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();

        startForeground(FOREGROUND_ID, notification);
    }

    private JSONObject extractNotificationData(StatusBarNotification sbn) throws JSONException {
        JSONObject data = new JSONObject();
        
        // 基本信息
        data.put("packageName", sbn.getPackageName());
        data.put("postTime", sbn.getPostTime());
        data.put("timestamp", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(new Date()));
        
        // 通知内容
        Notification notification = sbn.getNotification();
        if (notification.extras != null) {
            data.put("title", notification.extras.getString(Notification.EXTRA_TITLE, ""));
            data.put("text", notification.extras.getString(Notification.EXTRA_TEXT, ""));
            data.put("subText", notification.extras.getString(Notification.EXTRA_SUB_TEXT, ""));
            data.put("bigText", notification.extras.getString(Notification.EXTRA_BIG_TEXT, ""));
        }
        
        // 应用信息
        try {
            String appName = getPackageManager().getApplicationLabel(
                getPackageManager().getApplicationInfo(sbn.getPackageName(), 0)
            ).toString();
            data.put("appName", appName);
        } catch (Exception e) {
            data.put("appName", sbn.getPackageName());
        }
        
        return data;
    }

    private void saveNotificationToLocal(JSONObject notificationData) {
        try {
            // 获取现有的通知列表
            String existingData = sharedPreferences.getString("notifications", "[]");
            JSONArray notifications = new JSONArray(existingData);
            
            // 添加新通知
            notifications.put(notificationData);
            
            // 限制存储数量（保留最新的1000条）
            if (notifications.length() > 1000) {
                JSONArray trimmed = new JSONArray();
                for (int i = notifications.length() - 1000; i < notifications.length(); i++) {
                    trimmed.put(notifications.get(i));
                }
                notifications = trimmed;
            }
            
            // 保存到SharedPreferences
            sharedPreferences.edit()
                .putString("notifications", notifications.toString())
                .apply();
                
        } catch (JSONException e) {
            Log.e(TAG, "Error saving notification to local storage", e);
        }
    }

    public static JSONArray getStoredNotifications(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences("notification_data", Context.MODE_PRIVATE);
            String data = prefs.getString("notifications", "[]");
            return new JSONArray(data);
        } catch (JSONException e) {
            Log.e(TAG, "Error reading stored notifications", e);
            return new JSONArray();
        }
    }

    public static void clearStoredNotifications(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("notification_data", Context.MODE_PRIVATE);
        prefs.edit().remove("notifications").apply();
    }
}