import { defineComponent, ref, onMounted, nextTick } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput, IonIcon } from '@ionic/vue';
import { closeOutline, sendOutline } from 'ionicons/icons';
import { Bubble, BubbleList, BubbleProps, Prompts, Sender } from 'ant-design-x-vue';
import { CoffeeOutlined, FireOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons-vue';
import BeHeader from './common/be-header.vue';
import { Typography } from 'ant-design-vue';
import './a.css';
import markdownit from 'markdown-it';
import useUserStore from '@/store/user';

const userStore = useUserStore();
interface Message {
  type: 'user' | 'ai';
  content: string;
}

export default defineComponent({
  name: 'AIAssistantDialog',
  components: {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    IonIcon,
    Bubble
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:isOpen'],
  setup(props, { emit }) {
    const messages = ref<BubbleProps[]>([
      {
        role: 'ai',
        content: '你好！我是您的记账助手小蛋，有什么我可以帮你的吗？'
      },
      {
        role: 'suggestion',
        content: [
          {
            key: '6',
            icon: <CoffeeOutlined style={{ color: '#964B00' }} />,
            description: '这个月我花了多少钱？',
          },
          {
            key: '7',
            icon: <SmileOutlined style={{ color: '#FAAD14' }} />,
            description: '我这个月收入多少？',
          },
          {
            key: '8',
            icon: <FireOutlined style={{ color: '#FF4D4F' }} />,
            description: '我这个月花了多少钱？',
          },
        ],
      }
    ]);
    const md = markdownit({ html: true, breaks: true });

    const userInput = ref('');
    const messageList = ref<HTMLElement | null>(null);
    const senderRef = ref<InstanceType<typeof Sender> | null>(null);

    const aaa = ref('')

    const isDone = ref(true);
    async function chat(message?: string) {
      isDone.value = false;
      const response = await fetch('http://117.72.49.27:11434/api/ai/chat-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message || userInput.value,
          userId: userStore.user?.id || '',
          time: new Date().toISOString(),
        }),
      });
      if (!response.body) {
        throw new Error('No response body');
      }
    
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
    
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          isDone.value = true;
          break;
        }
    
        const chunk = decoder.decode(value, { stream: true });
        console.log(chunk);
        
        // 处理可能包含多行数据的chunk
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const jsonText = line.substring(line.indexOf('{'));
              const data = JSON.parse(jsonText);
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                messages.value[messages.value.length - 1].content += data.choices[0].delta.content;
              }
            } catch (e) {
              console.error('解析响应数据失败:', line, e);
            }
          }
        }
      }
    }

    const closeDialog = () => {
      emit('update:isOpen', false);
    };

    const sendMessage = async (message?: string) => {
      console.log(messages.value[messages.value.length - 1].content === '');
      
      if (!message && !userInput.value.trim()) return;
      // 添加用户消息
      messages.value.push({
        role: 'user',
        content: message || userInput.value
      });

      // 模拟AI响应
      messages.value.push({
        role: 'ai',
        content: ''
      });
      senderRef.value?.blur();
      chat(message);
      userInput.value = '';
    };

    const rolesAsFunction = (bubbleData: BubbleProps, index: number) => {
      const RenderIndex: BubbleProps['messageRender'] = (content: string) => (
        <Typography>
          <div v-html={md.render(content)} />
        </Typography>
      );

      switch (bubbleData.role) {
        case 'ai':
          return {
            placement: 'start' as const,
            avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
            typing: { step: 5, interval: 20 },
            style: {
              maxWidth: 600,
            },
            loading: bubbleData.content === '',
            shape: 'corner',
            messageRender: RenderIndex,
          };
        case 'suggestion':
          return {
            placement: 'start',
            avatar: { icon: <UserOutlined />, style: { visibility: 'hidden' } },
            variant: 'borderless',
            messageRender: (items: any) => <Prompts vertical items={items as any} onItemClick={(i: any) => sendMessage(i.data.description)} />,
          };
        case 'user':
          return {
            placement: 'end' as const,
            avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
            messageRender: RenderIndex,
            shape: 'corner',
          };
        default:
          return { messageRender: RenderIndex };
      }
    };

    // const listRef = useTemplateRef<InstanceType<typeof BubbleList>>(null);
    const listRef = ref<InstanceType<typeof BubbleList>>();

    return () => (
      <IonModal isOpen={props.isOpen} onDidDismiss={closeDialog}>
        <BeHeader title="AI 助手" close={closeDialog} />
        <IonContent class="ion-padding relative">
          <div class="chat-container relative max-h-[calc(100vh-9rem)] overflow-y-auto" style={{
            'scrollbar-width': 'none',
            '-ms-overflow-style': 'none',
          }}>
            <div class="message-list" ref={messageList} style={{
              'scrollbar-width': 'none',
              '-ms-overflow-style': 'none',
            }}>
              <BubbleList
                ref={listRef}
                style={{ maxHeight: '85vh' }}
                roles={rolesAsFunction}
                items={messages.value}
              />
            </div>
          </div>

          <div class="input-container fixed bottom-0 left-0 w-full p-2">
            <Sender
              ref={senderRef}
              loading={!isDone.value}
              readOnly={!isDone.value}
              allowSpeech
              value={userInput.value}
              onUpdate:value={(val: string) => userInput.value = val}
              onSubmit={() => {
                sendMessage();
              }}
            />
          </div>
        </IonContent>
      </IonModal>
    );
  }
}); 