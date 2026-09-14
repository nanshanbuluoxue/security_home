import {observable,action} from'mobx-miniprogram'
export const store=observable({
  //数据字段
  client: null,   //客户端
  connectflag:false, //连接状态
  pubTopic:"subtopic",//发布的主题
  temperature:0.0,   //温度
  humidity:0.0,    //湿度
  gas:0,      //气体浓度
  photo:0,   //光照强度
  stat_person:0,  //是否有人
  light:0,   //灯的使能
  beeper:1,  //蜂鸣器的使能
  temperature_nor_low_num:15, //温低
  temperature_nor_high_num:35,  //温高
  humidity_nor_low_num:30,  //湿底
  humidity_nor_high_num:60, //湿高
  gas_warn:0,//气体浓度警报
  //计算属性
  //actions方法，用于修改store中的数据
  updateClient: action(function(val){
    this.client=val;
  }),
  updateConnectflag: action(function(val){
    this.connectflag=val;
  }),
  updateTemperature: action(function(val){
    this.temperature=val;
  }),
  updateHumidity: action(function(val){
    this.humidity=val;
  }),
  updateGas: action(function(val){
    this.gas=val;
  }),
  updatePhoto: action(function(val){
    this.photo=val;
  }),
  updateStat_person: action(function(val){
    this.stat_person=val;
  }),
  updateLight: action(function(val){
    this.light=val;
  }),
  updateBeeper: action(function(val){
    this.beeper=val;
  }),
  updateTl: action(function(val){
    this.temperature_nor_low_num=val;
  }),
  updateTh: action(function(val){
    this.temperature_nor_high_num=val;
  }),
  updateHl: action(function(val){
    this.humidity_nor_low_num=val;
  }),
  updateHh: action(function(val){
    this.humidity_nor_high_num=val;
  }),
  updateGas_warn:action(function(val){this.gas_warn=val;})
})