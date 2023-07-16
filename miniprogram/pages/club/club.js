// pages/club/club.js
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		selected: 0,
		tabsArr:['我加入的','我创建的','其他社团'],
		isLoading:false,
		finishLoading:false,
		clubList:[]
	},
	
	
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.getData()
	},

	getData(){
		db.collection("community").get().then(res=>{
			console.log(res);
				this.setData({
					clubList:res.data
				})
				console.log("clubList:",clubList);
		}).catch(err=>{
			
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




// //tab框切换 方法二
  // selected: function (e) {
  //   console.log(e)
  //   let that = this
  //   let index = e.currentTarget.dataset.index
  //   console.log(index)
  //   if (index == 0) {
  //     that.setData({
  //       selected: 0
  //     })
  //   } else {
  //     that.setData({
  //       selected: 1
  //     })
  //   }
	// },
	

	// var that = this;
    // /** 
    //  * 获取系统信息,系统宽高
    //  */
    // wx.getSystemInfo({
    //   success: function (res) {
    //     that.setData({
    //       winWidth: res.windowWidth,
    //       winHeight: res.windowHeight
    //     });
    //   }
		// });