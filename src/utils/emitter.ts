import mitt from 'mitt';

type MessageEvent = {
  msg: string;
  type: 'success' | 'error';
}

type Events = {
  message: MessageEvent;
}

const emitter = mitt<Events>();

export default emitter;