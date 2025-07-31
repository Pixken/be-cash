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
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
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
    private static final String AUTH_PREFS = "auth_data";
    private static final String KEY_USER_ID = "userId";
    private static final String KEY_TOKEN = "token";
    private SharedPreferences sharedPreferences;
    private ExecutorService networkExecutor;

    @Override
    public void onCreate() {
        super.onCreate();
        sharedPreferences = getSharedPreferences("notification_data", Context.MODE_PRIVATE);
        networkExecutor = Executors.newFixedThreadPool(3); // 用于网络请求的线程池
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
            
            // 发送网络请求（后台也能执行）
            sendNotificationToServer(notificationData);
            
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
        if (networkExecutor != null && !networkExecutor.isShutdown()) {
            networkExecutor.shutdown();
        }
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

    private void sendNotificationToServer(JSONObject notificationData) {
        // 使用固定的服务器地址
        String serverUrl = "http://117.72.49.27:3000/notification";
        
        // 在后台线程执行网络请求
        networkExecutor.execute(() -> {
            try {
                sendHttpRequest(serverUrl, notificationData);
            } catch (Exception e) {
                Log.e(TAG, "Failed to send notification to server", e);
                // 可以选择重试或保存到失败队列
                saveFailedRequest(notificationData);
            }
        });
    }

    private void sendHttpRequest(String serverUrl, JSONObject originalData) throws IOException {
        // 从SharedPreferences获取认证信息
        SharedPreferences authPrefs = getSharedPreferences(AUTH_PREFS, Context.MODE_PRIVATE);
        String token = authPrefs.getString(KEY_TOKEN, "");
        String userId = authPrefs.getString(KEY_USER_ID, "");
        
        // 检查是否有认证信息
        if (token.isEmpty() || userId.isEmpty()) {
            Log.w(TAG, "No auth info available, skipping notification send. Token: '" + token + "', UserId: '" + userId + "'");
            Log.w(TAG, "SharedPreferences file: " + AUTH_PREFS);
            // 保存到失败队列，等待用户登录后重试
            saveFailedRequest(originalData);
            return;
        }
        
        URL url = new URL(serverUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        try {
            // 设置请求方法和头部
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("User-Agent", "NotificationListener/1.0");
            connection.setRequestProperty("Authorization", "Bearer " + token);
            connection.setRequestProperty("X-User-Id", userId);
            
            connection.setDoOutput(true);
            connection.setConnectTimeout(10000); // 10秒连接超时
            connection.setReadTimeout(15000);    // 15秒读取超时

            // 按照你的格式构造数据
            JSONObject requestData = new JSONObject();
            try {
                requestData.put("title", originalData.optString("title", ""));
                requestData.put("content", originalData.optString("text", ""));
                requestData.put("appName", originalData.optString("appName", ""));
                requestData.put("time", originalData.optString("postTime", ""));
                requestData.put("userId", Integer.parseInt(userId));
            } catch (JSONException e) {
                Log.e(TAG, "Error constructing request data", e);
                return;
            }

            // 发送数据
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = requestData.toString().getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // 检查响应
            int responseCode = connection.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                Log.d(TAG, "Successfully sent notification to server: " + responseCode);
                Log.d(TAG, "Sent data: " + requestData.toString());
            } else if (responseCode == 401) {
                Log.w(TAG, "Authentication failed (401), clearing auth info and saving to failed queue");
                // 清除无效的认证信息
                clearAuthInfo();
                // 保存到失败队列，等待重新登录
                saveFailedRequest(originalData);
            } else {
                Log.w(TAG, "Server responded with error code: " + responseCode);
                // 其他错误也保存到失败队列
                saveFailedRequest(originalData);
            }

        } finally {
            connection.disconnect();
        }
    }

    private void saveFailedRequest(JSONObject notificationData) {
        try {
            // 保存失败的请求，稍后重试
            String failedRequests = sharedPreferences.getString("failed_requests", "[]");
            JSONArray failed = new JSONArray(failedRequests);
            
            JSONObject failedItem = new JSONObject();
            failedItem.put("data", notificationData);
            failedItem.put("timestamp", System.currentTimeMillis());
            failedItem.put("retryCount", 0);
            
            failed.put(failedItem);
            
            // 限制失败队列大小
            if (failed.length() > 100) {
                JSONArray trimmed = new JSONArray();
                for (int i = failed.length() - 100; i < failed.length(); i++) {
                    trimmed.put(failed.get(i));
                }
                failed = trimmed;
            }
            
            sharedPreferences.edit()
                .putString("failed_requests", failed.toString())
                .apply();
                
        } catch (JSONException e) {
            Log.e(TAG, "Error saving failed request", e);
        }
    }

    // 测试网络连接的方法
    public static boolean testConnection() {
        try {
            URL url = new URL("http://117.72.49.27:3000/notification");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            int responseCode = connection.getResponseCode();
            connection.disconnect();
            
            return responseCode >= 200 && responseCode < 400;
        } catch (Exception e) {
            return false;
        }
    }

    // 获取失败的请求，用于重试
    public static JSONArray getFailedRequests(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences("notification_data", Context.MODE_PRIVATE);
            String data = prefs.getString("failed_requests", "[]");
            return new JSONArray(data);
        } catch (JSONException e) {
            Log.e(TAG, "Error reading failed requests", e);
            return new JSONArray();
        }
    }

    // 清除失败的请求
    public static void clearFailedRequests(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("notification_data", Context.MODE_PRIVATE);
        prefs.edit().remove("failed_requests").apply();
    }

    // 设置认证信息
    public static void setAuthInfo(Context context, String userId, String token) {
        Log.d(TAG, "Setting auth info - userId: " + userId + ", token: " + (token != null ? "***" : "null"));
        SharedPreferences authPrefs = context.getSharedPreferences(AUTH_PREFS, Context.MODE_PRIVATE);
        
        // 保存前先检查当前值
        String currentUserId = authPrefs.getString(KEY_USER_ID, "");
        String currentToken = authPrefs.getString(KEY_TOKEN, "");
        Log.d(TAG, "Current values before save - userId: '" + currentUserId + "', token: '" + currentToken + "'");
        
        authPrefs.edit()
            .putString(KEY_USER_ID, userId)
            .putString(KEY_TOKEN, token)
            .apply();
            
        // 保存后再次检查
        String savedUserId = authPrefs.getString(KEY_USER_ID, "");
        String savedToken = authPrefs.getString(KEY_TOKEN, "");
        Log.d(TAG, "Auth info saved successfully - userId: '" + savedUserId + "', token: '" + (savedToken.isEmpty() ? "EMPTY" : "***") + "'");
        Log.d(TAG, "SharedPreferences file: " + AUTH_PREFS);
    }

    // 清除认证信息
    private void clearAuthInfo() {
        SharedPreferences authPrefs = getSharedPreferences(AUTH_PREFS, Context.MODE_PRIVATE);
        authPrefs.edit()
            .remove(KEY_USER_ID)
            .remove(KEY_TOKEN)
            .apply();
        Log.d(TAG, "Auth info cleared due to authentication failure");
    }

    // 获取认证状态
    public static boolean hasAuthInfo(Context context) {
        SharedPreferences authPrefs = context.getSharedPreferences(AUTH_PREFS, Context.MODE_PRIVATE);
        String token = authPrefs.getString(KEY_TOKEN, "");
        String userId = authPrefs.getString(KEY_USER_ID, "");
        return !token.isEmpty() && !userId.isEmpty();
    }

    // 静态版本的 sendHttpRequest 方法，用于重试
    private static void sendHttpRequestStatic(Context context, String serverUrl, JSONObject originalData) throws IOException {
        // 从SharedPreferences获取认证信息
        SharedPreferences authPrefs = context.getSharedPreferences(AUTH_PREFS, Context.MODE_PRIVATE);
        String token = authPrefs.getString(KEY_TOKEN, "");
        String userId = authPrefs.getString(KEY_USER_ID, "");
        
        // 检查是否有认证信息
        if (token.isEmpty() || userId.isEmpty()) {
            Log.w(TAG, "No auth info available for retry, skipping. Token: '" + token + "', UserId: '" + userId + "'");
            return;
        }
        
        URL url = new URL(serverUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        try {
            // 设置请求方法和头部
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("User-Agent", "NotificationListener/1.0");
            connection.setRequestProperty("Authorization", "Bearer " + token);
            
            connection.setDoOutput(true);
            connection.setConnectTimeout(10000); // 10秒连接超时
            connection.setReadTimeout(15000);    // 15秒读取超时

            // 按照你的格式构造数据
            JSONObject requestData = new JSONObject();
            try {
                requestData.put("title", originalData.optString("title", ""));
                requestData.put("content", originalData.optString("text", ""));
                requestData.put("appName", originalData.optString("appName", ""));
                requestData.put("userId", userId);
            } catch (JSONException e) {
                Log.e(TAG, "Error constructing retry request data", e);
                return;
            }

            // 发送数据
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = requestData.toString().getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // 检查响应
            int responseCode = connection.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                Log.d(TAG, "Successfully retried notification to server: " + responseCode);
                Log.d(TAG, "Retried data: " + requestData.toString());
            } else {
                Log.w(TAG, "Retry failed with response code: " + responseCode);
            }

        } finally {
            connection.disconnect();
        }
    }

    // 重试失败的请求
    public static void retryFailedRequests(Context context) {
        try {
            JSONArray failedRequests = getFailedRequests(context);
            if (failedRequests.length() == 0) {
                Log.d(TAG, "No failed requests to retry");
                return;
            }

            Log.d(TAG, "Retrying " + failedRequests.length() + " failed requests");
            
            // 创建一个临时的服务实例来处理重试
            ExecutorService retryExecutor = Executors.newFixedThreadPool(2);
            
            for (int i = 0; i < failedRequests.length(); i++) {
                JSONObject failedItem = failedRequests.getJSONObject(i);
                JSONObject notificationData = failedItem.getJSONObject("data");
                
                retryExecutor.execute(() -> {
                    try {
                        // 直接调用静态方法来发送请求
                        sendHttpRequestStatic(context, "http://117.72.49.27:3000/notification", notificationData);
                    } catch (Exception e) {
                        Log.e(TAG, "Failed to retry request", e);
                    }
                });
            }
            
            // 清除失败队列（因为我们已经重试了）
            clearFailedRequests(context);
            
        } catch (Exception e) {
            Log.e(TAG, "Error retrying failed requests", e);
        }
    }
}