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
import defaultAvatar from '@/assets/zxd.png'
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
    clearInterval(userStore.alertInterval)
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
  const res = await updateProfile(userStore.user.id?.value || userStore.user.id || '', profile)
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
    <ion-content ref="content" class="bg-neutral-50">
      <div class="pb-20">
        <!-- 顶部背景渐变 -->
        <div class="h-48 bg-gradient-to-b from-primary-600 to-primary-800 relative overflow-hidden">
          <div class="absolute top-10 right-10 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div class="absolute top-20 left-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        </div>

        <!-- 用户信息卡片 -->
        <div class="px-5 -mt-20">
          <div class="app-card bg-white p-5 mb-6 relative">
            <!-- 头像和名称 -->
            <div class="flex items-center mb-6">
              <div class="relative cursor-pointer" @click="takePicture">
                <div class="w-20 h-20 rounded-full bg-primary-50 border-4 border-white shadow-md overflow-hidden">
                  <img :src="userStore.user.avatar || defaultAvatar" alt="用户头像" class="w-full h-full object-cover">
                </div>
                <div class="absolute bottom-0 right-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5">
                <h1 class="text-xl font-bold text-neutral-800">{{ userStore.user.nickname }}</h1>
                <p class="text-neutral-500">{{ userStore.user.username }}</p>
              </div>
            </div>

            <!-- 数据统计 -->
            <div class="flex justify-between text-center py-4 border-t border-b border-neutral-100 mb-4">
              <div class="flex-1">
                <p class="text-neutral-500 text-sm mb-1">本月收入</p>
                <p class="text-lg font-bold text-accent-600">¥1,520</p>
              </div>
              <div class="flex-1">
                <p class="text-neutral-500 text-sm mb-1">本月支出</p>
                <p class="text-lg font-bold text-rose-600">¥680</p>
              </div>
              <div class="flex-1">
                <p class="text-neutral-500 text-sm mb-1">预算使用</p>
                <p class="text-lg font-bold text-primary-600">35%</p>
              </div>
            </div>

            <!-- 快捷操作按钮 -->
            <div class="flex justify-between">
              <button class="flex flex-col items-center justify-center w-16" @click="openBudgetModal">
                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-1">
                  <svg-icon icon="solar:cup-star-bold" color="#0ea5e9" />
                </div>
                <span class="text-xs text-neutral-600">预算</span>
              </button>
              <button class="flex flex-col items-center justify-center w-16" @click="exportData">
                <div class="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mb-1">
                  <svg-icon icon="material-symbols:download" color="#d946ef" />
                </div>
                <span class="text-xs text-neutral-600">导出</span>
              </button>
              <button class="flex flex-col items-center justify-center w-16" @click="openCategoryModal">
                <div class="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center mb-1">
                  <svg-icon icon="material-symbols:category" color="#14b8a6" />
                </div>
                <span class="text-xs text-neutral-600">分类</span>
              </button>
            </div>
          </div>

          <!-- 设置列表 -->
          <div class="app-card bg-white mb-6">
            <div class="bg-primary-50 rounded-lg px-4 py-3 mb-4">
              <h2 class="text-base font-medium text-primary-800">账户设置</h2>
            </div>
            
            <div class="divide-y divide-neutral-100">
              <!-- 用户信息 -->
              <button class="py-3 px-4 w-full flex items-center justify-between" 
                @click="openModal({
                  title: '修改昵称',
                  form: [{
                    type: 'text',
                    placeholder: '请输入昵称',
                    value: userStore.user.nickname || '',
                    key: 'nickname'
                  }]
                })">
                <div class="flex items-center">
                  <svg-icon icon="material-symbols:person" color="#64748b" size="20" class="mr-3" />
                  <span class="text-neutral-800">修改昵称</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <!-- 修改密码 -->
              <button class="py-3 px-4 w-full flex items-center justify-between" 
                @click="openModal({
                  title: '修改密码',
                  form: [{
                    type: 'password',
                    placeholder: '请输入旧密码',
                    value: '',
                    key: 'oldPassword'
                  }, {
                    type: 'password',
                    placeholder: '请输入新密码',
                    value: '',
                    key: 'newPassword'
                  }]
                })">
                <div class="flex items-center">
                  <svg-icon icon="material-symbols:lock" color="#64748b" size="20" class="mr-3" />
                  <span class="text-neutral-800">修改密码</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <!-- 默认账户 -->
              <button class="py-3 px-4 w-full flex items-center justify-between" 
                @click="openModal({
                  title: '默认账户',
                  form: [{
                    type: 'select',
                    placeholder: '请选择默认账户',
                    key: 'defaultAccount',
                    value: '',
                  }]
                })">
                <div class="flex items-center">
                  <svg-icon icon="material-symbols:account-balance-wallet" color="#64748b" size="20" class="mr-3" />
                  <span class="text-neutral-800">默认账户</span>
                </div>
                <div class="flex items-center">
                  <span class="text-neutral-500 mr-2">{{ defaultAccount }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
          
          <!-- 关于和版本 -->
          <div class="app-card bg-white mb-6">
            <div class="bg-primary-50 rounded-lg px-4 py-3 mb-4">
              <h2 class="text-base font-medium text-primary-800">关于应用</h2>
            </div>
            
            <div class="divide-y divide-neutral-100">
              <!-- 版本信息 -->
              <div class="py-3 px-4 flex items-center justify-between">
                <div class="flex items-center">
                  <svg-icon icon="material-symbols:info" color="#64748b" size="20" class="mr-3" />
                  <span class="text-neutral-800">版本信息</span>
                </div>
                <span class="text-neutral-500">{{ version || '0.0.1' }}</span>
              </div>
              
              <!-- 关于我们 -->
              <button class="py-3 px-4 w-full flex items-center justify-between">
                <div class="flex items-center">
                  <svg-icon icon="material-symbols:help" color="#64748b" size="20" class="mr-3" />
                  <span class="text-neutral-800">关于我们</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 退出登录按钮 -->
          <div class="px-5 mb-10">
            <button class="app-button w-full py-3 bg-rose-100 rounded-xl text-rose-600 font-medium transition-all hover:bg-rose-200" @click="logout" :disabled="isLoading">
              <div class="flex items-center justify-center">
                <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isLoading ? '退出中...' : '退出登录' }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 弹窗 -->
      <ion-modal ref="modal">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-neutral-800">{{ modalData.title }}</h2>
            <button @click="dismissModal" class="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div v-for="(item, index) in modalData.form" :key="index" class="form-group">
              <template v-if="item.type === 'select'">
                <Select v-model:value="defaultAccount" style="width: 100%" placeholder="请选择默认账户" @change="selectDefaultAccount">
                  <Select.Option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</Select.Option>
                </Select>
              </template>
              <template v-else>
                <input 
                  :type="item.type" 
                  :placeholder="item.placeholder" 
                  v-model="item.value" 
                  class="app-input w-full"
                />
              </template>
            </div>
          </div>
          
          <div class="mt-6">
            <button 
              class="app-button app-button-primary w-full" 
              @click="handleSubmit"
            >
              确认
            </button>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<style scoped>
/* 额外样式 */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>