<script setup lang="ts">
import { IonPage, IonContent, IonToggle, onIonViewDidEnter, IonModal, toastController } from '@ionic/vue';
import { useRouter } from 'vue-router';
import emitter from '@/utils/emitter';
import useUserStore from '@/store/user';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Dialog } from '@capacitor/dialog';
import dayjs from 'dayjs';
import { Button, Select } from 'ant-design-vue'
import { getAccount } from '@/api/account';
import { storage } from '@/utils/storage';
import { updatePassword, updateProfile } from '@/api/user';
import { getVersion } from '@/utils/common';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const userStore = useUserStore();
const router = useRouter();
const isLoading = ref(false);
const isExporting = ref(false);

const version = ref('')

const logout = () => {
  isLoading.value = true;
  setTimeout(() => {
    emitter.emit('message', { msg: '退出成功', type: 'success' });
    router.push('/login');
    isLoading.value = false;
    userStore.logout();
  }, 1000);
};

// 导出数据为Excel文件
const exportData = async () => {
  try {
    isExporting.value = true;
    
    // 获取日期范围
    const startDate = dayjs().subtract(3, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const endDate = dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss');
    
    // 调用后端API直接获取Excel文件
    const response = await fetch(`http://116.198.241.147:8091/api/finance/transactions/export/excel?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'X-User-ID': userStore.user.id?.value || '',
      },
    })

    const blob = await response.blob();

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = async () => {
      const base64Data = reader.result?.toString().split(',')[1];
      // 生成文件名
      const fileName = `鸟蛋记账导出_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
      console.log(base64Data)
      // 将Base64数据写入文件系统
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data as string,
        directory: Directory.Documents
      });
      // 显示成功消息，包含文件路径
      await Dialog.alert({
        title: '导出成功',
        message: `文件已保存到: ${result.uri}`,
        buttonTitle: '确定'
      });
      
      emitter.emit('message', { msg: '数据导出成功', type: 'success' });
    }
  } catch (error) {
    console.error('导出失败:', error);
    emitter.emit('message', { msg: '导出失败' + error, type: 'error' });
  } finally {
    isExporting.value = false;
  }
};

const content = ref();

const options = ref([

])

const getAccounts = async () => {
  const res = await getAccount();
  options.value = res.data.map((item: any) => ({
    label: item.name,
    value: item.name,
  }));
};

const selectDefaultAccount = (value: string) => {
  storage.setItem('defaultAccount', value)
}

onIonViewDidEnter(async () => {
  version.value = await getVersion()
  getAccounts()
  content.value?.$el.scrollToTop(0);
});

console.log(userStore.user)

interface ModalData {
  title: string
  submitFun?: Function
  form: {
    type: string
    placeholder: string
    value?: string
    key: string
  }[]
}

const modalData = ref<ModalData>({
  title: '',
  form: [{
    type: '',
    placeholder: '',
    value: '',
    key: ''
  }]
})

const defaultAccount = ref(JSON.stringify(storage.getItem('defaultAccount')) === '{}' ? null : storage.getItem('defaultAccount'))

const modal = ref()

const openModal = (data: ModalData) => {
  modalData.value = data
  modal.value?.$el.present()
}

const editProfile = async (key: 'nickname' | 'avatar' | 'phoneNumber', value: any) => {
  const profile = {
    nickname: userStore.user.nickname || '',
    avatar: userStore.user.avatar || '',
    phoneNumber: userStore.user.phoneNumber || ''
  }
  profile[key] = value
  const res = await updateProfile(userStore.user.id?.value, profile)
  console.log(res);
}

const dismissModal = () => {
  modal.value?.$el.dismiss()
}

const handleSubmit = async () => {
  if (modalData.value.form.some(item => item.value === '')) {
    emitter.emit("message", { msg: '请填写完整', type: "error" });
    return
  }
  
  try {
    if (modalData.value.title === '修改密码') {
      const res = await updatePassword({
        oldPassword: modalData.value.form.find(item => item.key === 'oldPassword')?.value as string,
        newPassword: modalData.value.form.find(item => item.key === 'newPassword')?.value as string,
        username: userStore.user.username
      })
      if (res.code === '0000') {
        emitter.emit("message", { msg: res.info, type: "success" });
      } else {
        emitter.emit("message", { msg: res.info, type: "error" });
      }
      return
    }
    if (modalData.value.title === '默认账户') {
      selectDefaultAccount(defaultAccount.value)
      return
    }
    const { key, value } = modalData.value.form[0]
    await editProfile(key as 'nickname' | 'avatar' | 'phoneNumber', value)
  } catch(err) {

  } finally {
    dismissModal()
  }
}

const imageData = ref()
const selectedFile = ref()

const handleSelectAvatar = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });

    console.log('获取到的图片信息:', image);
    
    imageData.value = image.dataUrl;
    
    selectedFile.value = {
      data: image.dataUrl,
      format: image.format
    };
    
    emitter.emit("message", { msg: '选择图片成功', type: 'success' })
  } catch (error) {
    console.error('选择图片出错:', error);
    emitter.emit("message", { msg: '选择图片出错:' + error, type: 'error' })
  }
}

// 如需要从文件系统读取文件
const readFileFromFilesystem = async (path: string) => {
  try {
    return await Filesystem.readFile({
      path: path,
      directory: Directory.Data
    });
  } catch (error) {
    console.error('读取文件系统出错:', error);
    throw error;
  }
};

// 如需要从Blob URL读取内容并转换为Base64
const convertBlobToBase64 = (blobUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(blobUrl)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.addEventListener('load', function(this: FileReader, _event) {
          // 使用this关键字访问FileReader的result属性
          if (typeof this.result === 'string') {
            resolve(this.result);
          } else {
            reject(new Error('Result is not a string'));
          }
        });
        reader.addEventListener('error', () => {
          reject(new Error('Failed to convert blob to base64'));
        });
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        reject(error);
      });
  });
};

</script>
<template>
  <ion-page>
    <ion-content ref="content" class="ion-padding">
      <div class="content-wapper">
      <!-- 背景渐变和装饰元素 -->
      <div class="absolute top-0 left-0 w-full h-80 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-b-[40px] z-0"></div>
      <div class="absolute top-10 right-10 w-24 h-24 bg-white opacity-10 rounded-full"></div>
      <div class="absolute top-40 left-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>
      
      <!-- 用户信息区域 -->
      <div class="relative z-10 h-full flex flex-col items-center pt-[var(--ion-safe-area-top,20px)] pb-4">
        <!-- 返回按钮 -->
        <div class="self-start">
          <div @click="router.push('/')" class="flex items-center text-white cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回</span>
          </div>
        </div>
        
        <!-- 用户头像和名称 -->
        <div class="flex flex-col items-center mt-6 mb-8">
          <div class="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 overflow-hidden" @click="handleSelectAvatar">
            <img src="@/assets/zxd.png" alt="" class="w-full h-full object-cover">
          </div>
          <h1 class="text-2xl font-bold text-white">{{ userStore.user.profile.nickname }}</h1>
          <p class="text-gray-100 mt-1">{{ userStore.user.phoneNumber || userStore.user.email.value }}</p>
        </div>
        
        <!-- 用户信息卡片 -->
        <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-4 animate-slide-up">

          <ion-modal ref="modal">
            <div class="flex flex-col items-center justify-center gap-5 h-full wrapper px-4">
              <div class="w-full text-left text-xl font-bold">{{modalData.title}}</div>
              <template  v-for="form in modalData.form">
                <Select v-if="form.type === 'select'" placeholder="请选择默认账户" v-model:value="defaultAccount" :options="options" class="h-12 w-full"></Select>
                <input
                  v-else
                  :type="form.type"
                  :placeholder="form.placeholder"
                  v-model="form.value"
                  class="w-full h-12 pl-4 pr-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all outline-none"
                >
              </template>
              <div class="flex justify-between w-full">
                <Button @click="dismissModal">取消</Button>
                <Button type="primary" @click="handleSubmit">确定</Button>
              </div>
            </div>
          </ion-modal>

          <!-- 账号设置 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">账号设置</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" @click="openModal({
                title: '修改用户名',
                form: [{
                  type: 'text',
                placeholder: '请输入用户名',
                key: 'nickname',
                value: userStore.user.nickname
                }]
              })">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">修改用户名</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" @click="openModal({
                title: '修改邮箱',
                form: [{
                  type: 'text',
                placeholder: '请输入邮箱',
                key: 'email',
                value: userStore.user.email.value
                }]
              })">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">修改邮箱</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div> -->

              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" @click="openModal({
                title: '绑定手机',
                form: [{
                  type: 'text',
                placeholder: '请输入手机号',
                key: 'phoneNumber',
                value: userStore.user.phoneNumber
                }]
              })">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">绑定手机</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" @click="openModal({
                title: '修改密码',
                form: [{
                  type: 'password',
                placeholder: '请输入原密码',
                key: 'oldPassword',
                value: ''
                },{
                  type: 'password',
                placeholder: '请输入新密码',
                key: 'newPassword',
                value: ''
                },{
                  type: 'password',
                placeholder: '请确认新密码',
                key: 'confirmPassword',
                value: ''
                }]
              })">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">修改密码</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- 记账设置 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">记账设置</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" @click="openModal({
                title: '默认账户',
                form: [{
                  type: 'select',
                placeholder: '默认账户',
                key: 'phoneNumber',
                value: userStore.user.phoneNumber
                }]
              })">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">默认账户</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">{{defaultAccount}}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">分类管理</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">预算提醒</span>
                </div>
                <ion-toggle :checked="true"></ion-toggle>
              </div>
            </div>
          </div>
          
          <!-- 数据管理 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">数据管理</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">数据备份</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">上次备份：今天</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">数据恢复</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <div @click="exportData" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">数据导出</span>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="isExporting" class="text-gray-500">导出中...</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 关于与帮助 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">关于与帮助</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">帮助中心</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">隐私政策</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">关于我们</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">v{{version}}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 退出登录按钮 -->
          <button 
            @click="logout" 
            class="w-full h-12 bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            :disabled="isLoading"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? '退出中...' : '退出登录' }}</span>
          </button>
        </div>
      </div>
    </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
/* 自定义动画 */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
}
</style>

<style>
/* 适配沉浸式状态栏 */
ion-content::part(scroll) {
  padding-top: var(--ion-safe-area-top, 0);
}

ion-modal {
  --width: fit-content;
  --min-width: 88%;
  --height: fit-content;
  --border-radius: 16px;
}

ion-modal .wrapper {
  margin: 20px 10px;
}

ion-modal::part(backdrop) {
  background: rgba(209, 213, 219);
  opacity: 1;
}

/* 按钮发光效果 */
button:not(:disabled):hover {
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}
</style>