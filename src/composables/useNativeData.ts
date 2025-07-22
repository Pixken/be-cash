import { ref, onMounted, onBeforeUnmount } from 'vue';
import { registerPlugin } from '@capacitor/core';

const NativeDataSender = registerPlugin<any>('NotificationListener');

export function useNativeData() {
    const nativeData = ref<string | null>(null);
    let listener: any = null;

    const startListening = async () => {
        // 添加事件监听
        listener = await NativeDataSender.addListener(
            'onNotificationPosted', 
            (data: { packageName: string, title: string, text: string }) => {
                console.log('Received from native:');
                nativeData.value = JSON.stringify(data);
                console.log('Received from native:', data);
            }
        );
        
        // 也可以主动请求数据
        // await NativeDataSender.requestDataFromNative();
    };

    const stopListening = () => {
        listener?.remove();
    };

    onMounted(startListening);
    onBeforeUnmount(stopListening);

    return { nativeData };
}