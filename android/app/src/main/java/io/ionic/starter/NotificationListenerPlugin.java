package io.ionic.starter;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.app.Notification;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.service.notification.StatusBarNotification;
import android.text.TextUtils;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "NotificationListener")
public class NotificationListenerPlugin extends Plugin {
    private static final String TAG = "NotificationListenerPlugin";
    private static NotificationListenerPlugin instance;

    @Override
    public void load() {
        instance = this;
        Log.d(TAG, "NotificationListenerPlugin loaded");
    }

    @PluginMethod
    public void setAuthInfo(PluginCall call) {
        try {
            String userId = call.getString("userId");
            String token = call.getString("token");
            
            Log.d(TAG, "Plugin setAuthInfo called with userId: " + userId + ", token: " + (token != null ? "***" : "null"));
            
            if (userId == null || token == null) {
                Log.e(TAG, "userId or token is null - userId: " + userId + ", token: " + token);
                call.reject("userId和token不能为空");
                return;
            }
            
            // 将认证信息传递给服务
            NotificationListenerService.setAuthInfo(getContext(), userId, token);
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "认证信息已设置");
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error setting auth info", e);
            call.reject("设置认证信息失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void start(PluginCall call) {
        try {
            // 检查权限
            if (!isNotificationServiceEnabled()) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("message", "需要授予通知访问权限");
                ret.put("needPermission", true);
                call.resolve(ret);
                return;
            }

            // 启动服务
            Intent serviceIntent = new Intent(getContext(), NotificationListenerService.class);
            getContext().startForegroundService(serviceIntent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "通知监听服务已启动");
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error starting notification listener", e);
            call.reject("启动失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            Intent serviceIntent = new Intent(getContext(), NotificationListenerService.class);
            getContext().stopService(serviceIntent);
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "通知监听服务已停止");
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error stopping notification listener", e);
            call.reject("停止失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("hasPermission", isNotificationServiceEnabled());
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "已打开权限设置页面");
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error opening permission settings", e);
            call.reject("打开权限设置失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getStoredNotifications(PluginCall call) {
        try {
            JSONArray notifications = NotificationListenerService.getStoredNotifications(getContext());
            JSArray jsArray = JSArray.from(notifications);
            
            JSObject ret = new JSObject();
            ret.put("notifications", jsArray);
            ret.put("count", notifications.length());
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error getting stored notifications", e);
            call.reject("获取存储的通知失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void clearStoredNotifications(PluginCall call) {
        try {
            NotificationListenerService.clearStoredNotifications(getContext());
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "已清除存储的通知");
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error clearing stored notifications", e);
            call.reject("清除存储的通知失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getServiceStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("isEnabled", isNotificationServiceEnabled());
        ret.put("hasPermission", isNotificationServiceEnabled());
        call.resolve(ret);
    }

    @PluginMethod
    public void testConnection(PluginCall call) {
        // 在后台线程测试连接
        new Thread(() -> {
            try {
                boolean isConnected = NotificationListenerService.testConnection();
                
                JSObject ret = new JSObject();
                ret.put("success", isConnected);
                ret.put("message", isConnected ? "服务器连接正常" : "服务器连接失败");
                call.resolve(ret);
                
            } catch (Exception e) {
                Log.e(TAG, "Error testing connection", e);
                call.reject("测试连接失败: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void getFailedRequests(PluginCall call) {
        try {
            JSONArray failedRequests = NotificationListenerService.getFailedRequests(getContext());
            JSArray jsArray = JSArray.from(failedRequests);
            
            JSObject ret = new JSObject();
            ret.put("failedRequests", jsArray);
            ret.put("count", failedRequests.length());
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error getting failed requests", e);
            call.reject("获取失败请求失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void clearFailedRequests(PluginCall call) {
        try {
            NotificationListenerService.clearFailedRequests(getContext());
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "已清除失败的请求");
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error clearing failed requests", e);
            call.reject("清除失败请求失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void retryFailedRequests(PluginCall call) {
        try {
            // 检查是否有认证信息
            if (!NotificationListenerService.hasAuthInfo(getContext())) {
                call.reject("没有认证信息，请先登录");
                return;
            }

            NotificationListenerService.retryFailedRequests(getContext());
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "开始重试失败的请求");
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error retrying failed requests", e);
            call.reject("重试失败请求失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void debugAuthInfo(PluginCall call) {
        try {
            android.content.SharedPreferences authPrefs = getContext().getSharedPreferences("auth_data", Context.MODE_PRIVATE);
            String token = authPrefs.getString("token", "");
            String userId = authPrefs.getString("userId", "");
            
            JSObject ret = new JSObject();
            ret.put("hasAuthInfo", NotificationListenerService.hasAuthInfo(getContext()));
            ret.put("userId", userId);
            ret.put("tokenExists", !token.isEmpty());
            ret.put("tokenLength", token.length());
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error debugging auth info", e);
            call.reject("调试认证信息失败: " + e.getMessage());
        }
    }

    public static void sendNotificationToFrontend(StatusBarNotification sbn) {
        if (instance != null) {
            try {
                JSObject ret = new JSObject();
                ret.put("packageName", sbn.getPackageName());
                ret.put("postTime", sbn.getPostTime());
                
                // 提取通知内容
                Notification notification = sbn.getNotification();
                if (notification.extras != null) {
                    ret.put("title", notification.extras.getString(Notification.EXTRA_TITLE, ""));
                    ret.put("text", notification.extras.getString(Notification.EXTRA_TEXT, ""));
                    ret.put("subText", notification.extras.getString(Notification.EXTRA_SUB_TEXT, ""));
                    ret.put("bigText", notification.extras.getString(Notification.EXTRA_BIG_TEXT, ""));
                }
                
                // 获取应用名称
                try {
                    String appName = instance.getContext().getPackageManager().getApplicationLabel(
                        instance.getContext().getPackageManager().getApplicationInfo(sbn.getPackageName(), 0)
                    ).toString();
                    ret.put("appName", appName);
                } catch (Exception e) {
                    ret.put("appName", sbn.getPackageName());
                }
                
                instance.notifyListeners("onNotificationPosted", ret);
                Log.d(TAG, "Notification sent to frontend: " + ret.toString());
                
            } catch (Exception e) {
                Log.e(TAG, "Error sending notification to frontend", e);
            }
        }
    }

    private boolean isNotificationServiceEnabled() {
        ComponentName cn = new ComponentName(getContext(), NotificationListenerService.class);
        String flat = Settings.Secure.getString(getContext().getContentResolver(), "enabled_notification_listeners");
        return flat != null && flat.contains(cn.flattenToString());
    }
}