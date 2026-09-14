// pages/analysis/analysis.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chartData_tem: {},
    chartData_hum:{},
    chartData_gas:{},
    //可以通过修改 config-ucharts.js 文件中下标为 ['line'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。

    // color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
    gener: {
        padding: [15,10,0,15],
        enableScroll: true,
        legend: {},
        xAxis: {
          disableGrid: true,
          scrollShow: true,
          itemCount: 2
        },
        yAxis: {
          gridType: "dash",
          dashLength: 4
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
            activeType: "hollow"
          }
        }
      },
      opts1:{},
      opts2: {},
      opts3:{} 
  },

  getServerData() {
    wx.request({
      url: 'http://127.0.0.1:3777/api/getdata/init',
      method:'POST',
      success:(result)=>{
        let {data:res}=result
        res=res.data;
        //console.log(res)
        let ct=res.chartData_tem;
        let ch=res.chartData_hum;
        let cg=res.chartData_gas;
        this.setData({ chartData_tem: JSON.parse(JSON.stringify(ct)) });
        this.setData({ chartData_hum: JSON.parse(JSON.stringify(ch)) });
        this.setData({ chartData_gas: JSON.parse(JSON.stringify(cg)) });
      },
      fail:(err)=>{
        console.log(err)
      }
    })
    //模拟从服务器获取数据时的延时
    // setTimeout(() => {
      //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
      // let res = {
      //     categories: ["2018","2019","2020","2021","2022","2023"],
      //     series: [
      //       {
      //         name: "温度",
      //         data: [35,8,25,37,4,20]
      //       }
      //     ]
      //   };
      
    //   this.setData({ chartData: JSON.parse(JSON.stringify(res)) });
    // }, 500);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.setData({
      opts1:Object.assign({},{color:["#91CB74"]},this.data.gener),
      opts2: Object.assign({},{color:["#FAC858"]},this.data.gener),
      opts3: Object.assign({},{color:["#ea7ccc"]},this.data.gener)
    })
    this.getServerData();
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
    this.getServerData()
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