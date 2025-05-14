<script setup lang="ts">
import { IonPage, IonContent, onIonViewDidEnter, IonModal } from '@ionic/vue';
import { useRouter } from 'vue-router';
import emitter from '@/utils/emitter';
import useUserStore from '@/store/user';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Dialog } from '@capacitor/dialog';
import dayjs from 'dayjs';
import { Button, Select } from 'ant-design-vue'
import { getAccount } from '@/api/account';
import { storage } from '@/utils/storage';
import { updatePassword, updateProfile, uploadFile } from '@/api/user';
import { getVersion } from '@/utils/common';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getCashCategory, addCashCategory, updateCashCategory, deleteCashCategory } from '@/api/cashCategory';
import { userInfo } from '@/api/user';

// 定义分类类型
interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

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
const budgetModal = ref()
const categoryModal = ref()

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
  if (res.code === '0000') {
    emitter.emit("message", { msg: res.info, type: 'success' })
    const userInfoRes = await userInfo()
    if (userInfoRes.code === '0000') {
      userStore.setUser(userInfoRes.data)
    }
  } else {
    emitter.emit("message", { msg: res.info, type: 'error' })
  }
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

    // 新增：将DataURL转换为Blob
    const blob = dataURLtoBlob(image.dataUrl as string);
    const file = new File([blob], `avatar.${image.format}`, {
      type: `image/${image.format}`
    });

    imageData.value = image.dataUrl;
    
    selectedFile.value = {
      data: file,  // 改为存储File对象
      format: image.format
    };
    

    await uploadAvatar()
    
    emitter.emit("message", { msg: '选择图片成功', type: 'success' })
  } catch (error) {
    console.error('选择图片出错:', error);
    emitter.emit("message", { msg: '选择图片出错:' + error, type: 'error' })
  }
}

// 新增DataURL转Blob函数
const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// 上传图片
const uploadAvatar = async () => {
  const formData = new FormData();
  formData.append('file', selectedFile.value.data);
  
  // 使用特殊的请求配置
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  
  const res = await uploadFile(formData, config);
  if (res.code === '0000') {
    const avatar = res.data
    await editProfile('avatar', avatar)
  } else {
    throw new Error(res.info)
  }
}

const showHelpCenter = async () => {
  await Dialog.alert({
    title: '帮助中心',
    message: '如果您在使用过程中遇到任何问题，请联系我们的客服团队：\n\n电子邮件：support@birdeggnote.com\n电话：400-123-4567\n\n我们的工作时间是周一至周五 9:00-18:00。',
    buttonTitle: '我知道了'
  });
};

const showPrivacyPolicy = async () => {
  await Dialog.alert({
    title: '隐私政策',
    message: '鸟蛋记账非常重视您的隐私保护。我们承诺：\n\n1. 不会收集与应用功能无关的个人信息\n2. 不会在未经您同意的情况下分享您的数据\n3. 采用加密技术保护您的账户信息\n4. 您可以随时删除您的账户及相关数据\n\n详细隐私政策请访问我们的官方网站。',
    buttonTitle: '我知道了'
  });
};

const showAboutUs = async () => {
  await Dialog.alert({
    title: '关于鸟蛋记账',
    message: `鸟蛋记账是一款简单易用的个人财务管理工具，帮助您轻松记录日常收支，分析消费习惯，实现财务目标。\n\n当前版本：v${version.value}\n\n© ${new Date().getFullYear()} 鸟蛋科技 保留所有权利`,
    buttonTitle: '我知道了'
  });
};

// 分类管理相关
const categoryType = ref('EXPENSE') // 默认显示支出分类
const categories = ref<Category[]>([])
const showCategoryForm = ref(false)
const isEditingCategory = ref(false)
const isSaving = ref(false) // 添加保存状态标记

// 分类表单
const categoryForm = ref<{
  id?: string;
  name: string;
  type: string;
  icon: string;
  color: string;
}>({
  name: '',
  type: 'EXPENSE',
  icon: 'tabler:category',
  color: '#4f46e5'
})

// 图标选项
const iconOptions = ref([
  'tabler:category',
  'tabler:home',
  'tabler:shopping-cart',
  'tabler:car',
  'tabler:device-mobile',
  'tabler:book',
  'tabler:plane',
  'tabler:beer',
  'tabler:briefcase',
  'tabler:device-tv',
  'tabler:heart',
  'tabler:medical-cross',
  'tabler:baby-carriage',
  'tabler:report-money',
  'tabler:coin'
])

// 颜色选项
const colorOptions = ref([
  '#4f46e5', // 蓝色
  '#10b981', // 绿色
  '#f59e0b', // 黄色
  '#ef4444', // 红色
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#0ea5e9', // 天蓝色
  '#f97316', // 橙色
  '#6366f1', // 靛蓝色
  '#14b8a6'  // 青色
])

// 获取分类数据
const getCashCategories = async () => {
  try {
    const res = await getCashCategory();
    if (res.code === '0000') {
      categories.value = res.data.map((item: any) => ({
        id: item.id?.value || item.id,
        name: item.name,
        type: item.type,
        icon: item.icon || 'tabler:category',
        color: item.color || '#4f46e5',
        isDefault: item.userId === null,
      }));
    } else {
      emitter.emit("message", { msg: res.info || '获取分类失败', type: 'error' });
    }
  } catch (error) {
    console.error('获取分类失败:', error);
    emitter.emit("message", { msg: '获取分类失败', type: 'error' });
  }
};

// 根据选择的类型过滤分类
const filteredCategories = computed(() => {
  return categories.value.filter(item => item.type === categoryType.value);
});

// 编辑分类
const editCategory = (category: Category) => {
  if (category.isDefault) {
    emitter.emit("message", { msg: '默认分类不能编辑', type: 'warning' as 'success' });
    return;
  }
  
  categoryForm.value = { ...category };
  isEditingCategory.value = true;
  showCategoryForm.value = true;
};

// 删除分类
const deleteCategory = async (categoryId: string, isDefault: boolean) => {
  if (isDefault) {
    emitter.emit("message", { msg: '默认分类不能删除', type: 'warning' as 'success' });
    return;
  }
  
  try {
    const { value } = await Dialog.confirm({
      title: '确认删除',
      message: '确定要删除这个分类吗？删除后无法恢复。',
      okButtonTitle: '删除',
      cancelButtonTitle: '取消'
    });
    
    if (!value) return;
    
    const res = await deleteCashCategory({ categoryId });
    if (res.code === '0000') {
      categories.value = categories.value.filter(cat => cat.id !== categoryId);
      emitter.emit("message", { msg: '删除成功', type: 'success' });
    } else {
      emitter.emit("message", { msg: res.info || '删除失败', type: 'error' });
    }
  } catch (error) {
    console.error('删除分类失败:', error);
    emitter.emit("message", { msg: '删除分类失败', type: 'error' });
  }
};

// 显示添加分类表单
const showAddCategoryForm = () => {
  categoryForm.value = {
    name: '',
    type: categoryType.value,
    icon: 'tabler:category',
    color: '#4f46e5'
  };
  isEditingCategory.value = false;
  showCategoryForm.value = true;
};

// 取消分类表单
const cancelCategoryForm = () => {
  showCategoryForm.value = false;
};

// 提交分类表单
const submitCategoryForm = async () => {
  if (!categoryForm.value.name) {
    emitter.emit("message", { msg: '请输入分类名称', type: 'error' });
    return;
  }
  
  try {
    isSaving.value = true;
    const formData = {
      name: categoryForm.value.name,
      type: categoryForm.value.type,
      icon: categoryForm.value.icon,
      color: categoryForm.value.color
    };
    
    let res;
    if (isEditingCategory.value && categoryForm.value.id) {
      res = await updateCashCategory({
        ...formData,
        categoryId: categoryForm.value.id
      });
    } else {
      res = await addCashCategory(formData);
    }
    
    if (res.code === '0000') {
      await getCashCategories();
      
      showCategoryForm.value = false;
      emitter.emit("message", { 
        msg: isEditingCategory.value ? '编辑成功' : '添加成功', 
        type: 'success' 
      });
    } else {
      emitter.emit("message", { 
        msg: res.info || (isEditingCategory.value ? '编辑失败' : '添加失败'), 
        type: 'error' 
      });
    }
  } catch (error) {
    console.error('保存分类失败:', error);
    emitter.emit("message", { msg: '保存分类失败', type: 'error' });
  } finally {
    isSaving.value = false;
  }
};

// 保存分类变更
const saveCategoryChanges = () => {
  categoryModal.value?.$el.dismiss();
};

// 在页面加载时获取分类数据
onMounted(() => {
  getVersion().then(v => {
    version.value = v;
  });
  getCashCategories();
});
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
                  @blur="form.value = $event.target?.value"
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
              
              <div id="open-categoryModal" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
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
              <ion-modal ref="categoryModal" id="categoryModal" trigger="open-categoryModal">
                <div class="flex flex-col h-full wrapper px-4 py-6">
                  <div class="w-full flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold">分类管理</h2>
                    <button @click="() => categoryModal.$el.dismiss()" class="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <!-- 分类表单 -->
                  <div v-if="showCategoryForm" class="absolute inset-0 bg-white z-20 px-4 py-6 flex flex-col">
                    <div class="w-full flex justify-between items-center mb-6">
                      <h2 class="text-xl font-bold">{{ isEditingCategory ? '编辑分类' : '添加分类' }}</h2>
                      <button @click="cancelCategoryForm" class="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto pr-1">
                      <form class="space-y-4">
                        <!-- 类型选择 -->
                        <div class="form-group">
                          <label class="block text-sm font-medium text-gray-700 mb-1">分类类型</label>
                          <div class="flex gap-4">
                            <div 
                              class="flex-1 p-3 border rounded-lg flex items-center justify-center cursor-pointer"
                              :class="{'bg-blue-50 border-blue-500': categoryForm.type === 'INCOME', 'border-gray-300': categoryForm.type !== 'INCOME'}"
                              @click="categoryForm.type = 'INCOME'"
                            >
                              收入
                            </div>
                            <div 
                              class="flex-1 p-3 border rounded-lg flex items-center justify-center cursor-pointer"
                              :class="{'bg-blue-50 border-blue-500': categoryForm.type === 'EXPENSE', 'border-gray-300': categoryForm.type !== 'EXPENSE'}"
                              @click="categoryForm.type = 'EXPENSE'"
                            >
                              支出
                            </div>
                          </div>
                        </div>
                        
                        <!-- 分类名称 -->
                        <div class="form-group">
                          <label class="block text-sm font-medium text-gray-700 mb-1">分类名称</label>
                          <input 
                            type="text" 
                            v-model="categoryForm.name"
                            @blur="categoryForm.name = $event.target?.value"
                            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入分类名称"
                          />
                        </div>
                        
                        <!-- 分类图标 -->
                        <div class="form-group">
                          <label class="block text-sm font-medium text-gray-700 mb-1">分类图标</label>
                          <div class="grid grid-cols-5 gap-2">
                            <div 
                              v-for="icon in iconOptions" 
                              :key="icon"
                              class="p-3 flex items-center justify-center border rounded-lg cursor-pointer"
                              :class="{'bg-blue-50 border-blue-500': categoryForm.icon === icon, 'border-gray-300': categoryForm.icon !== icon}"
                              @click="categoryForm.icon = icon"
                            >
                              <svg-icon :icon="icon" size="24"></svg-icon>
                            </div>
                          </div>
                        </div>
                        
                        <!-- 分类颜色 -->
                        <div class="form-group">
                          <label class="block text-sm font-medium text-gray-700 mb-1">分类颜色</label>
                          <div class="grid grid-cols-5 gap-2">
                            <div 
                              v-for="color in colorOptions" 
                              :key="color"
                              class="h-10 rounded-lg cursor-pointer border-2"
                              :style="{ backgroundColor: color }"
                              :class="{'border-gray-800': categoryForm.color === color, 'border-transparent': categoryForm.color !== color}"
                              @click="categoryForm.color = color"
                            ></div>
                          </div>
                        </div>
                      </form>
                    </div>
                    
                    <!-- 表单按钮 -->
                    <div class="mt-4">
                      <button 
                        @click="submitCategoryForm" 
                        class="w-full p-3 bg-blue-500 text-white rounded-lg font-medium disabled:bg-blue-300"
                        :disabled="isSaving"
                      >
                        <span v-if="isSaving" class="flex items-center justify-center">
                          <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          保存中...
                        </span>
                        <span v-else>保存</span>
                      </button>
                    </div>
                  </div>
                  
                  <!-- 分类类型切换 -->
                  <div v-if="!showCategoryForm" class="flex items-center justify-between bg-gray-100 rounded-md h-12 mb-6 relative">
                    <p class="text-center w-1/2 z-10 transition-all duration-300 cursor-pointer"
                      :class="{ 'text-white': categoryType === 'INCOME' }"
                      @click="categoryType = 'INCOME'">
                      收入
                    </p>
                    <p class="text-center w-1/2 z-10 transition-all duration-300 cursor-pointer"
                      :class="{ 'text-white': categoryType === 'EXPENSE' }"
                      @click="categoryType = 'EXPENSE'">
                      支出
                    </p>
                    <div class="absolute left-1 w-[calc(50%-0.5rem)] h-10 bg-[#4f46e5] rounded-md transition-all duration-300"
                      :class="{
                        'translate-x-0': categoryType === 'INCOME',
                        'translate-x-[calc(100%+0.5rem)]': categoryType === 'EXPENSE',
                      }">
                    </div>
                  </div>
                  
                  <!-- 分类列表区域 -->
                  <div v-if="!showCategoryForm" class="flex-1 overflow-y-auto mb-4 pr-1 custom-scrollbar">
                    <!-- 空状态显示 -->
                    <div v-if="filteredCategories.length === 0" class="flex flex-col items-center justify-center h-60 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mb-4 text-gray-300">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
                      </svg>
                      <p class="text-lg">还没有{{ categoryType === 'INCOME' ? '收入' : '支出' }}分类</p>
                      <p class="text-sm mt-2">点击下方"添加新分类"按钮创建</p>
                    </div>
                    
                    <!-- 分类列表 -->
                    <ul v-else class="w-full flex flex-col gap-3">
                      <li v-for="(category, index) in filteredCategories" :key="index" 
                          class="flex items-center justify-between p-3 border rounded-lg shadow-sm hover:bg-gray-50"
                          :class="{'bg-gray-50': category.isDefault}">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full flex items-center justify-center"
                            :style="{ backgroundColor: category.color }">
                            <svg-icon :icon="category.icon" color="#ffffff"></svg-icon>
                          </div>
                          <div class="flex flex-col">
                            <span class="font-medium">{{ category.name }}</span>
                            <span v-if="category.isDefault" class="text-xs text-gray-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                              系统默认
                            </span>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <button 
                            class="p-2 text-blue-500 hover:bg-blue-50 rounded-full" 
                            @click="editCategory(category)"
                            :class="{'opacity-50 cursor-not-allowed': category.isDefault}"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button 
                            class="p-2 text-red-500 hover:bg-red-50 rounded-full" 
                            @click="deleteCategory(category.id, category.isDefault)"
                            :class="{'opacity-50 cursor-not-allowed': category.isDefault}"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <!-- 添加分类按钮 -->
                  <button v-if="!showCategoryForm" @click="showAddCategoryForm" class="w-full flex items-center justify-center gap-2 p-3 mb-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    添加新分类
                  </button>
                  
                  <!-- 底部按钮区域 -->
                  <div v-if="!showCategoryForm" class="flex justify-between w-full">
                    <Button @click="() => categoryModal.$el.dismiss()" class="h-10">取消</Button>
                    <Button type="primary" @click="saveCategoryChanges" class="h-10">保存</Button>
                  </div>
                </div>
              </ion-modal>

              <!-- <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"  id="open-categoryModal">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <span class="text-gray-800 font-medium">预算设置</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div> -->
              <!-- <ion-modal ref="budgetModal" trigger="open-categoryModal">
                <div class="flex flex-col items-center justify-center gap-5 h-full wrapper px-4">
                  <div class="w-full text-left text-xl font-bold">预算设置</div>
                    <ul class="w-full flex flex-col gap-2">
                      <li class="w-full border rounded-md flex flex-col justify-center gap-2 items-start p-2 relative">
                        <div>
                          <label for="" class="text-gray-600 text-sm mr-3 w-14 inline-block text-right">预算周期</label>
                          <input type="text" class="outline-none border rounded-md px-2 py-1" placeholder="例如：3000">
                        </div>
                        <div>
                          
                        <label for="" class="text-gray-600 text-sm mr-3 w-14 inline-block text-right">预算值</label>
                        <input type="text" class="outline-none border rounded-md px-2 py-1" placeholder="例如：3000">
                        </div>
                        <div>
                          
                          <label for="" class="text-gray-600 text-sm mr-3 w-14 inline-block text-right">预警值</label>
                          <input type="text" class="outline-none border rounded-md px-2 py-1" placeholder="例如：80%">
                          </div>
                        <SvgIcon icon="material-symbols:add" class="absolute right-2"></SvgIcon>
                      </li>
                    </ul>
                  <div class="flex justify-between w-full">
                    <Button @click="() => budgetModal.$el.dismiss()">取消</Button>
                    <Button type="primary" @click="handleSubmit">确定</Button>
                  </div>
                </div>
              </ion-modal> -->
              
              <h2 class="text-xl font-semibold text-gray-800 mb-4 pt-4">数据管理</h2>
              <!-- <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
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
              </div> -->
              
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
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" @click="showHelpCenter">
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
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" @click="showPrivacyPolicy">
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
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" @click="showAboutUs">
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

/* 分类管理模态框的样式 */
ion-modal#categoryModal {
  --height: 80%;
  --max-height: 600px;
}

ion-modal#categoryModal .wrapper {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a3a3a3;
}

/* 应用到所有具有overflow-y-auto的元素 */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f1f1f1;
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