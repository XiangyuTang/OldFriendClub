// pages/home/home.js
import {formatNum,formatTime} from "../../utils/common.js"
import {listNav,listActivities} from "../../api/apis"
Page({
	onShareAppMessage() {
    return {
      title: 'tabs',
      path: 'page/weui/example/tabs/tabs'
    }
  },
	/**
	 * 页面的初始数据
	 */
	data: {
		showPublishActivatyWindow:false,
		activeTab: 0,
		navArr:[],
		tabsArr:['即将开始','往期精彩'],
		activatiesArr:[],
		isLoading:false,
		finishLoading:false,
	},
	
	getUserInfo(event) {
    console.log(event.detail);
  },

  onClose() {
    this.setData({ close: false });
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.getNavData();
		this.getActivatiesList();
	},
	//获取导航数据
	getNavData(){
		listNav().then(res=>{
			console.log(res);
			this.setData({navArr: res.data});
		})

		
	},
	//获取活动列表
	getActivatiesList(size=0){
		this.setData({
			isLoading:true
		})
		let data = {
			limit:3,
			size,//当前已加载的数量
			// hot:true
		};//传参
		listActivities(data).then(res=>{
			console.log(res);
			res.data.forEach(item=>{
				item.view_count = formatNum(item.view_count)
				item.publish_date = formatTime(item.publish_date,5)
			}) 
			let old_list = this.data.activatiesArr;
			let new_list = old_list.concat(res.data);
			console.log("new_list:",new_list);
			wx.stopPullDownRefresh();
			this.setData({
				activatiesArr:new_list,
				isLoading:false,
			})
			if(this.data.activatiesArr.length==res.total){
				console.log("没有更多了");
				this.setData({
					finishLoading:true
				})
			}
		})
	},
	onTabClick(e) {
    const index = e.detail.index
    this.setData({ 
      activeTab: index 
    })
	},
	
  onChange(e) {
		const index = e.detail.index
    this.setData({ 
			activeTab: Number(index), 
			activatiesArr:[],
			isLoading:false,
			finishLoading:false,
		})
		wx.showToast({
      title: `切换到标签 ${index + 1}`,
      icon: 'none'
		})
		this.getActivatiesList();
  },
  handleClick(e) {
    wx.navigateTo({
      url: './webview',
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
		this.setData({
			activatiesArr:[],
			isLoading:false,
			finishLoading:false
		})
		this.getActivatiesList();
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {
		if(this.data.finishLoading) return;
		this.getActivatiesList(this.data.activatiesArr.length);
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	}
})