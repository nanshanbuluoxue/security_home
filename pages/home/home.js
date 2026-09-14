// pages/home/home.js

//将store绑定到当前页面
import {
  createStoreBindings
} from 'mobx-miniprogram-bindings'
import {
  store
} from '../../store/store'
import mqtt from "../../utils/mqtt.min.js";

import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    warnMessage:'',
    warnnum:0,
    conenctBtnText: '连接',
    //host: "localhost:8084",
    //host:"w3cc3f50.ala.cn-hangzhou.emqxsl.cn:8084",
    host:"s59f1af5.ala.dedicated.aliyun.emqxcloud.cn:8084",
    subTopic: "publish",
    // pubTopic: "subtopic",
    pubMsg: "Hello! I am from WeChat miniprogram",
    receivedMsg: {},
    inform1: "未与设备进行连接！！！",
    mqttOptions: {
      clientId: 'miniprogram',
      username: "miniprogram",
      password: "123456",
      reconnectPeriod: 1000, // 1000毫秒，设置为 0 禁用自动重连，两次重新连接之间的间隔时间
      connectTimeout: 30 * 1000, // 30秒，连接超时时间
      // 更多参数请参阅 MQTT.js 官网文档：https://github.com/mqttjs/MQTT.js#mqttclientstreambuilder-options
      // 更多 EMQ 相关 MQTT 使用教程可在 EMQ 官方博客中进行搜索：https://www.emqx.com/zh/blog
    },
  },
  alert(wmess){  //警告通知信息的发送
    wx.request({
      url:"https://fwalert.com/6f363771-716d-4a4b-aeec-97d3fa94d85c",
      data:{
        message:wmess
      },
      method:"GET"
    })
  },

  //警告消息详情弹出框
  warntap(){
    Dialog.alert({
      title: '当前警告内容',
      message: this.data.warnMessage,
    }).then(() => {
      // on close
    });
  },
  //警告消息生成
  getWarnMessage(rec){
    let wmess='';
    if(rec.tem<rec.l_tem){
      wmess+='室内温度过低\n';
    }
    if(rec.tem>rec.h_tem){
      wmess+="室内温度过高\n";
    }
    if(rec.hum<rec.l_hum){
      wmess+="室内湿度过低\n";
    }
    if(rec.hum>rec.h_hum){
      wmess+="室内湿度过高\n";
    }
    if(rec.gas_warn==1){
      wmess+="室内气体浓度过高\n";
    }
    if(wmess !=this.data.warnMessage && this.data.warnnum!=0){  //报警信息去重
      this.alert(wmess);
    }
    this.setData({warnMessage:wmess});
  },
  connect() {
    // MQTT-WebSocket 统一使用 /path 作为连接路径，连接时需指明，但在 EMQX Cloud 部署上使用的路径为 /mqtt
    // 因此不要忘了带上这个 /mqtt !!!
    // 微信小程序中需要将 wss 协议写为 wxs，且由于微信小程序出于安全限制，不支持 ws 协议
    try {
      this.setData({
        conenctBtnText: "连接中..."
      });

      const clientId = new Date().getTime(); //防止ClienId冲突
      //wxs
      this.data.client = mqtt.connect('wxs://' + `${this.data.host}` + '/mqtt', {
        ...this.data.mqttOptions,
        clientId,
      });
      var myclient=this.data.client;
      this.updateClient(myclient);
      //...扩展运算符
      this.data.client.on("connect", () => {
        wx.showToast({
          title: "连接成功",
        });
        this.setData({
          conenctBtnText: "已连接"
        });
        this.updateConnectflag(true);
        //绑定转发函数，将数据转发到后端
        //5秒转发一次
        setInterval(()=>{this.datagather()},5000);
        this._subscribe();
        this.data.client.on("message", (topic, payload) => {
          // wx.showModal({
          //   content: `收到消息 - Topic: ${topic}，Payload: ${payload}`,
          //   showCancel: false,
          // });
          //const currMsg = this.data.receivedMsg ? `<br/>${payload}` : payload;
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(payload);
          const rec = JSON.parse(text);
          //console.log(rec);
          //console.log(rec.person)
          this.updateTemperature(rec.tem); //更新数据
          this.updateHumidity(rec.hum);
          this.updateGas(rec.gas);
      
          this.updatePhoto(rec.photo);
          this.updateStat_person(rec.person);
          this.updateLight(rec.light_per);
          this.updateTl(rec.l_tem);
          this.updateTh(rec.h_tem);
          this.updateHl(rec.l_hum);
          this.updateHh(rec.h_hum);
          this.updateGas_warn(rec.gas_warn)
          let warnn=0;
          if(rec.tem<rec.l_tem||rec.tem>rec.h_tem){
            warnn++;
          }
          if(rec.hum<rec.l_hum||rec.hum>rec.h_hum){
            warnn++;
          }
          this.setData({warnnum:warnn+this.data.gas_warn});
          this.getWarnMessage(rec);
        });
        
        this.data.client.on("error", (error) => {
          this.setData({
            conenctBtnText: "连接"
          });
          this.updateConnectflag(false);
          console.log("onError", error);
        });

        this.data.client.on("reconnect", () => {
          this.setData({
            conenctBtnText: "连接"
          });
          this.updateConnectflag(false);
          console.log("reconnecting...");
        });

        this.data.client.on("offline", () => {
          this.setData({
            conenctBtnText: "连接"
          });
          this.updateConnectflag(false);
          console.log("onOffline");
        });
        // 更多 MQTT.js 相关 API 请参阅 https://github.com/mqttjs/MQTT.js#api
      });
    } catch (error) {
      this.setData({
        conenctBtnText: "连接"
      });
      this.updateConnectflag(false);
      console.log("mqtt.connect error", error);
    }
  },
  _subscribe: function () {
    this.data.client.subscribe(this.data.subTopic);
    wx.showModal({
      content: `成功订阅主题：${this.data.subTopic}`,
      showCancel: false,
    });
    return;
  },
  disconnect() {
    this.data.client.end();
    //this.data.client = null;
    this.updateConnectflag(false);
    this.updateClient(null);
    this.setData({
      conenctBtnText: "连接"
    });
    wx.showToast({
      title: "成功断开连接",
    });
  },

    
  // 灯的切换
  changeLight(e) {
    if(this.data.connectflag){
    this.data.client.publish(this.data.pubTopic,`{"light":${+e.detail.value},"beeper":${+this.data.beeper},"lt":${this.data.temperature_nor_low_num},"ht":${this.data.temperature_nor_high_num},"lh":${this.data.humidity_nor_low_num},"hh":${this.data.humidity_nor_high_num}}`,()=>{
      this.updateLight(+e.detail.value);
    });
  }else{
    wx.showToast({
      title: '还未连接',
      icon:'error'
    })
  }
    //console.log(+e.detail.value)
  },
  //蜂鸣器的切换
  changeBeeper(e){
    if(this.data.connectflag){
          this.data.client.publish(this.data.pubTopic,`{"light":${this.data.light},"beeper":${+e.detail.value},"lt":${this.data.temperature_nor_low_num},"ht":${this.data.temperature_nor_high_num},"lh":${this.data.humidity_nor_low_num},"hh":${this.data.humidity_nor_high_num}}`,()=>{
      this.updateBeeper(+e.detail.value);
    });
  }else{
    wx.showToast({
      title: '还未连接',
      icon:'error'
    })
  }
    console.log(+e.detail.value)
  },

  //转发数据到后台
  datagather(){
    if(this.data.connectflag){
      wx.request({
        url: 'http://127.0.0.1:3777/api/gather',
        method:'POST',
        data:{
          tem:this.data.temperature,
          hum:this.data.humidity,
          gas:this.data.gas,
          photo:this.data.photo,
          person:this.data.stat_person,
        },
        success:(res)=>{//console.log(res)
        },
        fail:(err)=>{console.log(err)}
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ['client', 'connectflag', 'temperature', 'humidity', 'gas', 'photo', 'stat_person', 'light', 'beeper','temperature_nor_low_num', 'temperature_nor_high_num',
        'humidity_nor_low_num',
        'humidity_nor_high_num',"pubTopic","gas_warn"
      ],
      actions: ['updateClient', 'updateConnectflag', 'updateTemperature', 'updateHumidity', 'updateGas', 'updatePhoto', 'updateStat_person', 'updateLight', 'updateTl', 'updateTh', 'updateHl', 'updateHh','updateBeeper','updateGas_warn'],
    })

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})