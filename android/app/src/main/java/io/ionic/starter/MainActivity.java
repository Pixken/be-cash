package io.ionic.starter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 注册自定义插件
        registerPlugin(AppUpdaterPlugin.class);
        registerPlugin(NotificationListener.class);
    }
}
