<script setup lang="ts">
import { IonPage, IonContent, IonModal, onIonViewDidEnter } from '@ionic/vue';
import { ref } from 'vue';
import { Form, FormItem, Select, Input, InputNumber, Button, Popconfirm } from 'ant-design-vue';
import { createAccount, delAccount, getAccount, updateAccount } from '@/api/account';
import { format } from 'timeago.js';

const accounts = ref<any[]>([]);

const getAccounts = async () => {
  try {
    const res = await getAccount();
    accounts.value = res.data;
  } catch (error) {
    console.log(error);
  }
}

const modal = ref();
const form = ref({
  cardNumber: '',
  name: '',
  balance: 0,
});
const dismiss = () => {
  modal.value?.$el.dismiss()
};

const accounts_select = ref([
  {
    label: '现金',
    value: '现金',
    icon: 'mingcute:cash-fill',
    color: '#10b981',
  },
  {
    label: '支付宝',
    value: '支付宝',
    icon: 'tdesign:logo-alipay',
    color: '#3b82f6',
  },
  {
    label: '微信',
    value: '微信',
    icon: 'ic:twotone-wechat',
    color: '#22c55e',
  },
  // {
  //   label: '储蓄卡',
  //   value: '储蓄卡',
  //   icon: 'streamline:credit-card-1-solid',
  //   color: '#f59e0b',
  // },
  // {
  //   label: '信用卡',
  //   value: '信用卡',
  //   icon: 'streamline:credit-card-1-solid',
  //   color: '#f59e0b',
  // },
]);

const rules = ref({
  cardNumber: [{ required: true, message: '请输入卡号' }],
  name: [{ required: true, message: '请选择账户类型' }],
  balance: [{ required: true, message: '请输入账户金额' }],
});

const formRef = ref();

const handleSubmit = () => {
  formRef.value.validate().then(async () => {
    const res = await createAccount({
      name: form.value.name,
      type: form.value.name,
      initialBalance: form.value.balance,
    });
    console.log(res);
    dismiss();
    getAccounts();
  }).catch(() => {
    console.log('error');
  });
};

const content = ref();

onIonViewDidEnter(() => {
  content.value?.$el.scrollToTop(0);
  getAccounts();
});

const editModal = ref();
const editForm = ref({
  cardNumber: '',
  name: '',
  balance: 0,
});
const editingAccount = ref<any>(null);

const openEditModal = (account: any) => {
  console.log(account);
  editingAccount.value = account;
  editForm.value = account
  editModal.value?.$el.present();
};

const dismissEditModal = () => {
  editModal.value?.$el.dismiss();
};

const editFormRef = ref();

const handleEdit = () => {
  editFormRef.value.validate().then(async () => {
    // TODO: Implement edit logic
    console.log('Edit form submitted', editForm.value);
    const res = await updateAccount(editForm.value)
    if (res.code === '0000') {
      await getAccounts()
      dismissEditModal();
    }
  }).catch(() => {
    console.log('error');
  });
};

const deleteModal = ref();
const deletingAccount = ref<any>(null);

const openDeleteModal = (account: any) => {
  deletingAccount.value = account;
  deleteModal.value?.$el.present();
};

const dismissDeleteModal = () => {
  deleteModal.value?.$el.dismiss();
};

const handleDelete = async () => {
  // TODO: Implement delete logic
  console.log('Delete account', deletingAccount.value);
  const res = await delAccount(deletingAccount.value.id)
  if (res.code === '0000') {
    await getAccounts()
    dismissDeleteModal();
  }
};
</script>
<template>
  <ion-page>
    <be-header title="账户" />
    <ion-content ref="content">
      <div class="p-4">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);"
          class="w-full h-32 rounded-2xl text-white p-4 flex flex-col">
          <h2 class="text-lg mb-1">总资产</h2>
          <p class="text-4xl font-bold mt-3">¥ {{ accounts.reduce((acc, item) => acc + item.balance, 0) }}</p>
        </div>
        <div class="w-full mt-4">
          <div class="flex items-center justify-between">
            <p class="text-lg font-bold">我的账户</p>
            <span class="text-sm text-[#4f46e5]" id="open-modal">添加账户</span>
            <ion-modal ref="modal" trigger="open-modal">
              <ion-content>
                <div class="p-4">
                  <div class="flex items-center justify-between">
                    <p class="text-lg font-bold">添加账户</p>
                    <span class="text-sm text-[#4f46e5]" @click="dismiss">取消</span>
                  </div>
                  <div class="flex items-center justify-between mt-4">
                    <Form ref="formRef" :model="form" :rules="rules" class="w-full" layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                      <FormItem label="账户类型" name="name">
                        <Select v-model:value="form.name" :options="accounts_select"></Select>
                      </FormItem>
                      <FormItem label="卡号" name="cardNumber" v-if="form.name === '储蓄卡' || form.name === '信用卡'">
                        <Input v-model:value="form.cardNumber" />
                      </FormItem>
                      <FormItem label="账户金额" name="balance">
                        <InputNumber v-model:value="form.balance" class="w-full" />
                      </FormItem>
                      <FormItem>
                        <Button type="primary" @click="handleSubmit" class="w-full">添加</Button>
                      </FormItem>
                    </Form>
                  </div>
                </div>
              </ion-content>
            </ion-modal>
          </div>
          <ul class="mt-2">
            <li class="flex items-center justify-between py-6 not-last-border-b" v-for="item in accounts"
              :key="item.id">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-12 h-12 rounded-full" :style="{ backgroundColor: accounts_select.find(i => i.value === item.name)?.color }">
                  <svg-icon :icon="accounts_select.find(i => i.value === item.name)?.icon || ''" color="#ffffff"></svg-icon>
                </div>
                <div class="h-12 flex flex-col justify-between">
                  <p class="text-base font-bold">{{ accounts_select.find(i => i.value === item.name)?.label || '' }}</p>
                  <p class="text-sm text-[#7a818a]" v-if="item.type !== 'card'">上次更新：{{ format(item.updatedAt, 'zh_CN') }}</p>
                  <!-- <p class="text-sm text-[#7a818a]" v-else>储蓄卡 (****{{ item.cardNumber?.slice(8, 12) }})</p> -->
                </div>
              </div>
              <div class="flex items-center gap-4">
                <p class="text-lg font-bold">¥{{ item.balance }}</p>
                <div class="flex gap-2">
                  <Button type="text" size="small" @click="openEditModal(item)">
                    <svg-icon icon="mdi:pencil" class="text-gray-500"></svg-icon>
                  </Button>
                  <Button type="text" size="small" @click="openDeleteModal(item)">
                    <svg-icon icon="mdi:delete" class="text-red-500"></svg-icon>
                  </Button>
                </div>
              </div>
            </li>
          </ul>
          <div v-if="accounts.length === 0" class="flex flex-col items-center justify-center py-10">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p class="text-gray-500 mb-2">暂无账户</p>
            <p class="text-sm text-gray-400">点击右上角添加按钮添加新账户</p>
          </div>
        </div>
        <!-- <div class="w-full mt-4">
          <div class="flex items-center justify-between">
            <p class="text-lg font-bold">信用卡</p>
            <span class="text-sm text-[#4f46e5]">添加信用卡</span>
          </div>
          <ul class="mt-2">
            <li class="flex items-center justify-between py-6 not-last-border-b" v-for="item in creditCards"
              :key="item.id">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-12 h-12 rounded-full" :style="{ backgroundColor: item.color }">
                  <svg-icon :icon="item.icon" color="#ffffff"></svg-icon>
                </div>
                <div class="h-12 flex flex-col justify-between">
                  <p class="text-base font-bold">{{ item.name }}</p>
                  <p class="text-sm text-[#7a818a]" v-if="item.type !== 'card'">上次更新：{{ format(item.updateTime, 'zh_CN') }}</p>
                  <p class="text-sm text-[#7a818a]" v-else>信用卡 (****{{ item.cardNumber?.slice(8, 12) }})</p>
                </div>
              </div>
              <p class="text-lg font-bold">¥{{ item.balance }} </p>
            </li>
          </ul>
        </div> -->

        <!-- Edit Modal -->
        <ion-modal ref="editModal">
          <div class="p-4 wrapper">
            <div class="flex items-center justify-between">
              <p class="text-lg font-bold">编辑账户</p>
              <span class="text-sm text-[#4f46e5]" @click="dismissEditModal">取消</span>
            </div>
            <div class="flex items-center justify-between mt-4">
              <Form ref="editFormRef" :model="editForm" :rules="rules" class="w-full" layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <FormItem label="账户类型" name="name">
                  <Select v-model:value="editForm.name" :options="accounts_select" class="h-14"></Select>
                </FormItem>
                <!-- <FormItem label="卡号" name="cardNumber" v-if="editForm.name === '储蓄卡' || editForm.name === '信用卡'">
                  <Input v-model:value="editForm.cardNumber" class="h-14" />
                </FormItem> -->
                <FormItem label="账户金额" name="balance">
                  <InputNumber v-model:value="editForm.balance" class="w-full h-14 leading-[3.5rem]" />
                </FormItem>
                <FormItem>
                  <Button type="primary" @click="handleEdit" class="w-full h-14">保存</Button>
                </FormItem>
              </Form>
            </div>
          </div>
        </ion-modal>

        <!-- Delete Modal -->
        <ion-modal id="example-modal" class="delete" ref="deleteModal">
          <div class="flex flex-col items-center justify-center gap-5 h-full wrapper">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg-icon icon="mdi:delete" class="text-red-500 text-3xl"></svg-icon>
            </div>
            <p class="text-lg font-bold mb-2">确定要删除这个账户吗？</p>
            <p class="text-gray-500 mb-8">删除后将无法恢复</p>
            <div class="flex gap-4">
              <Button class="flex-1" @click="dismissDeleteModal">取消</Button>
              <Button type="primary" danger class="flex-1" @click="handleDelete">删除</Button>
            </div>
          </div>
        </ion-modal>
      </div>

    </ion-content>
  </ion-page>
</template>

<style scoped>
.not-last-border-b:not(:last-child) {
  border-bottom: 1px solid #E5E7EB;
}

ion-modal {
  --width: fit-content;
  --min-width: 250px;
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

ion-modal ion-toolbar {
  --background: rgb(14 116 144);
  --color: white;
}
</style>
