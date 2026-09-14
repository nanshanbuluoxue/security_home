// components/weather/weather.js

const app = getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');//引入SDK文件
var qqmapsdk;
Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    update:'2024-3-21 00:00 ',
    province: '江苏省',
    parent_city:'扬州市',
    latitude:'',
    longitude:'',
   today:{
     tempMax:'',
     tempMin:'',
     textDay:'',
     humidity:''
   },
   todyIcon:'../../static/imags/icons/100.svg',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserLocation: function () {
      let vm = this;
      wx.getSetting({
        success: (res) => {
          //console.log(JSON.stringify(res))
          if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) 
          {//如果没有授权就提示需要授权
            wx.showModal({
              title: '请求授权当前位置',
              content: '需要获取您的地理位置，请确认授权',
              success: function (res) {
                if (res.cancel) {
                  wx.showToast({
                    title: '拒绝授权',
                    icon: 'none',
                    duration: 1000
                  })
                } else if (res.confirm) {
                  wx.openSetting({
                    success: function (dataAu) {
                      if (dataAu.authSetting["scope.userLocation"] == true) {
                        wx.showToast({
                          title: '授权成功',
                          icon: 'success',
                          duration: 1000
                        })
                        //再次授权，调用wx.getLocation的API
                        vm.getLocation();
                      } else {
                        wx.showToast({
                          title: '授权失败',
                          icon: 'none',
                          duration: 1000
                        })
                      }
                    }
                  })
                }
              }
            })
          } else if (res.authSetting['scope.userLocation'] == undefined) {
            //调用wx.getLocation的API
            vm.getLocation();
          }
          else {
            //调用wx.getLocation的API
            vm.getLocation();
          }
        }
      })
    },
    // 获取当前地理位置
    getLocal: function (latitude, longitude) {
      let vm = this;
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: latitude,
          longitude: longitude
        },
        success: function (res) {
          // console.log(JSON.stringify(res));
          let province = res.result.ad_info.province
          console.log(province)
          let city = res.result.ad_info.city
          vm.setData({
            province: province,
            parent_city: city,
            latitude: latitude,
            longitude: longitude
          })
   
        },
        fail: function (res) {
          console.log(res);
        },
        complete: function (res) {
          // console.log(res);
        }
      });
    },
    getLocation:function(){
  var that = this;
  this.data.latitude = 32.33934;
  this.data.longitude = 119.392852;
  wx.getFuzzyLocation({
    type: 'wgs84',
    success (res) {
      this.data.latitude = res.latitude
      this.data.longitude = res.longitude
       console.log(this.data.latitude,this.data.longitude)
    }
   })
   that.getLocal(this.data.latitude,this.data.longitude);
  that.getWeatherInfo(this.data.latitude, this.data.longitude);
  },


   getWeatherInfo: function (latitude, longitude){
  var _this = this;
  var key = '8a534b9c6a8a4d7c957db915004d6c98';//你自己的key
  var url = 'https://devapi.qweather.com/v7/weather/3d?location=101190601&key='+key;
  console.log(url)
  //var url = 'https://free-api.heweather.com/s6/weather?key='+key+'&location=' + longitude + ',' + latitude;
     wx.request({
       url: url, 
       data: {},
       method: 'GET',
       success: function (res) {
         //console.log(res)
  var daily_forecast_today = res.data.daily[0];//今天预报
  var update=_this.mydate(res.data.updateTime);
  // console.log(update);
         _this.setData({
           update:update,
           today: daily_forecast_today,
           todyIcon: '../../static/imags/icons/' + res.data.daily[0].iconDay+'.svg', 

          });
  }
  });
  },
  mydate :function(val) {

// 解析时间字符串为 Date 对象
var date = new Date(val);
console.log(date);
// 获取年、月、日、小时和分钟
var year = date.getFullYear();
var month = (date.getMonth() + 1).toString().padStart(2, '0');
var day = date.getDate().toString().padStart(2, '0');
var hour = date.getHours().toString().padStart(2, '0');
var minute = date.getMinutes().toString().padStart(2, '0');

// 格式化为指定格式的字符串
var formattedDate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;

//console.log(formattedDate); // 输出格式化后的时间字符串

    return formattedDate;
  }
},
  lifetimes:{
    attached(){
      qqmapsdk = new QQMapWX({
        key: 'V5YBZ-7OA3J-6LWFV-DIPES-CVIIS-7YFUQ' //自己申请的key秘钥
      });
      let vm = this;
      vm.getUserLocation();
    }
  },
  pageLifetimes:{
    onShow() {
    }
  }
})