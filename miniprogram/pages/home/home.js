// pages/home/home.js
import {formatNum,formatTime} from "../../utils/common.js"
import {listActivities,listActivities2} from "../../api/apis"
const db = wx.cloud.database()
const LoginBiz = require('../../common_biz/login.js')

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		activeTab: 0,
		navArr:[],
		tabsArr:['即将开始','往期精彩'],
		activatiesArr:[],
		isLoading:false,
		finishLoading:false,
		isLogin: false
	},
	
	

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function(option) {
		if (!await LoginBiz.loginSilence(this)) {
				console.log("fail to login")
				return;
		}
		this.getNavData();
		this.getActivatiesList();
	},
	//获取导航数据
	getNavData(){
		// listNav().then(res=>{
		// 	console.log(res);
		// 	this.setData({navArr: res.data});
		// })
		db.collection("navi_item").get().then(res=>{
			console.log(res);
			this.setData({
				navArr: res.data
			})
			console.log("navArr:",this.data.navArr);
		}).catch(err=>{
			console.log(err);
		})
		
	},
	//点击导航栏
	onClickNavi(){
		wx.showToast({
			title: '敬请期待!',
			icon: 'success',
  		duration: 800
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
	getMyAddr(){
		var that = this
		wx.authorize({
			scope: 'scope.userFuzzyLocation',
			success(res) {
					console.log(res)
					if(res.errMsg == 'authorize:ok'){
							wx.getFuzzyLocation({
									type: 'wgs84',
									async success(res) {
										console.log(res)  //此时里面有经纬度
										let result = await wxGetAddress(res.longitude, res.latitude);
										console.log(result);
										var loc = {
											city_id:Number(result.regeocodeData.addressComponent.adcode),
											lng:String(res.longitude),
											lat:String(res.latitude)
										}
										that.setData({
											activity_address : result.regeocodeData.addressComponent.province+"-"+result.regeocodeData.addressComponent.district,
											location : loc
										})
									}
							});
					}
			},
			fail(err) {
					console.log(err)   
			}                    
		})
	},
	//获取活动列表2
	getActivatiesList2(size=0){
		this.setData({
			isLoading:true
		})
		let data = {
			token:LoginBiz.getToken(),
			location: Location,
			page_no: size
			// hot:true
		};//传参
		listActivities2(data).then(res=>{
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