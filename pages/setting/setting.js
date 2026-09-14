// subpkg/pages/setting/setting.js

import {
  createStoreBindings
} from 'mobx-miniprogram-bindings'
import {
  store
} from '../../store/store'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    slt:-40,   //写死固定的
    sht:80,
    slh:0,
    shh:80,
    mlt:0,  //温度阈值
    mht:0,
    mlh:0,  //湿度阈值
    mhh:0,
    mlight:false,
    mbeeper:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ['client', 'connectflag', 'light', 'beeper','temperature_nor_low_num', 'temperature_nor_high_num',
        'humidity_nor_low_num',
        'humidity_nor_high_num',
        'pubTopic'
      ],
      actions: ['updateClient', 'updateConnectflag',  'updateLight', 'updateTl', 'updateTh', 'updateHl', 'updateHh','updateBeeper'],
    });
    
  },

  dataRefresh(){   //更新
    this.setData({
      mlt:this.data.temperature_nor_low_num,
      mht:this.data.temperature_nor_high_num,
      mlh:this.data.humidity_nor_low_num,
      mhh:this.data.humidity_nor_high_num,
      mlight:(this.data.light==1),   //转换为逻辑值
      mbeeper:(this.data.beeper==1)
    })
    //console.log(this.data.mlight)
    //console.log(this.data.pubTopic)
  },

  //修改阈值
  change(e){
    //console.log(e.target.dataset.class)
     var detail=e.detail
    if(e.target.dataset.class=="lt"){
      this.setData({mlt:detail});
    }else if(e.target.dataset.class=="ht"){
      this.setData({mht:detail});
    }
    else if(e.target.dataset.class=="lh"){
      this.setData({mlh:detail});
    }
    else if(e.target.dataset.class=="hh"){
      this.setData({mhh:detail});
    }
    //console.log(e.detail)
  },

  switchChange(e){
    if(e.target.dataset.class=="light"){
      this.setData({
        mlight:e.detail
      })
      //console.log(+this.data.mlight)
    }else if(e.target.dataset.class=="beeper"){
      this.setData({
        mbeeper:e.detail
      })
    }
  },

  //保存并上传数据
  storeData(){
    if(this.data.connectflag){
      wx.showLoading({
        title: '上传中...',
      });
      this.data.client.publish(this.data.pubTopic,`{"light":${+this.data.mlight},"beeper":${+this.data.mbeeper},"lt":${this.data.mlt},"ht":${this.data.mht},"lh":${this.data.mlh},"hh":${this.data.mhh}}`,(err)=>{
        //console.log(err)
        if(!err){
        wx.hideLoading();
        wx.showToast({
          title: '上传成功',
        })
        this.updateLight(this.data.mlight);
        this.updateBeeper(this.data.mbeeper);
      }else{
        wx.hideLoading();
        wx.showToast({
          title: '上传失败',
        })
      }
      });
    }else{
      wx.showToast({
        title: '还未连接！！！',
        icon:'error'
      })
      setTimeout(()=>{
        wx.switchTab({      //跳转到连接页面
          url: '/pages/home/home',
        })
      },1500)
     
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    //console.log('ok')
    this.dataRefresh()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  },

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