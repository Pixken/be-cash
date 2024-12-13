<script setup lang='ts'>
import { IonPage, IonContent, IonCard, IonHeader, IonToolbar, IonTitle } from '@ionic/vue'
</script>

<template>
  <ion-page style="background-color: #f7f7f7;">
    <be-header>钱包</be-header>
    <ion-content>
      <div class="wallet-container">
        <ion-card class="total">
          <div class="total-money">
              <span>总资产</span>
              <span class="money">￥{{ 892347509.01 }}</span>
          </div>
          <div class="bottom">
            <div class="has-money">
              <span>净资产</span>
              <span class="money">￥{{ 892347509.01 }}</span>
            </div>
            <div class="nohas-money">
              <span>负债</span>
              <span class="money">￥{{ 0 }}</span>
            </div>
          </div>
        </ion-card>
        <ion-card class="wechat">
          <svg-icon icon="ri:wechat-pay-fill" size="5em" color="#fffd" />
          <span class="money">￥{{ 378945.01 }}</span>
        </ion-card>
        <ion-card class="zfb">
          <svg-icon icon="ant-design:alipay-outlined" size="5em" color="#fffd" />
          <span class="money">￥{{ 209384.99 }}</span>
        </ion-card>
        <ion-card class="order">
          <div class="icon">
            <svg-icon icon="bi:credit-card-fill" size="2em" color="#fff" />
          </div>
          <div class="value">
            <span>储蓄卡</span>
            <span class="money">￥{{ 612537612 }}</span>
          </div>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped lang="scss">
.wallet-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1em;
  padding: 0.5em;

  ion-card {
    border-radius: 10px !important;
  }


  .wechat,
  .zfb {
    height: 10em;
    color: #fff;
    box-shadow: none;
    border: none;



    .money {
      position: absolute;
      bottom: 0.4em;
      right: 0.5em;
      font-size: 1.5em;
      font-weight: bold;
      color: #fff;
      max-width: 80%;
      text-wrap: wrap;
    }

    i {
      position: absolute;
      top: 0.4em;
      left: 0.5em;
      color: #fff;
    }
  }

  .total {
    grid-column: 1 / 3;
    box-shadow: none;
    border: 1px solid #ddd;
    height: 12em;
    display: flex;
    flex-direction: column;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 150%;
      //线性渐变
      background: linear-gradient(to right, #ffffff, #e2e2e2);
      transform: rotate(-45deg) translate(20%, 50%);
      z-index: -1;
      border-radius: 10px;
    }

    .total-money, .has-money,.nohas-money {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 1em;
    }

    .total-money {
      width: 100%;
      height: 60%;
      border-bottom: 1px solid #ddd;

.money {
  font-size: 2em;
}
    }

    .bottom {
      flex: 1;
      display: flex;

      .has-money,.nohas-money {
      .money {
        font-size: 0.9em;
      }
      }

      .has-money {
        width: 50%;
        height: 100%;
        border-right: 1px solid #ddd;
      }

      .nohas-money {
        width: 50%;
        height: 100%;
      }

    }
  }

  .wechat {
    background-color: #00d86b;
  }

  .zfb {
    background-color: #007aff;
  }

  .order {
    background-color: #fff;
    grid-column: 1 / 3;
    height: 5em;
    box-shadow: none;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    height: fit-content;
    padding: 1em;

    .icon {
      width: 3em;
      height: 3em;
      background-color: #44cef6;
      border-radius: 9999px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 2px;
    }

    .value {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 5px;
      margin-left: 1em;
      height: 100%;

      .money {
        color: #999;
        font-size: 0.9em;
      }
    }
  }
}
</style>