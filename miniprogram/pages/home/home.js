// pages/home/home.js
import { formatNum, formatTime } from "../../utils/common.js"
import { listActivities, listActivities2, wxGetAddress } from "../../api/apis";
import { globalCache } from '../../utils/util';
const db = wx.cloud.database()
const LoginBiz = require('../../common_biz/login.js')
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		activeTab: 0,
		page_no: 1,
		navArr: [
			{
				name: "菜市优惠",
				pic_icon: "/static/images/navicons/shopping.png"
			},
			{
				name: "晨操跟练",
				pic_icon: "/static/images/navicons/exercise.png"
			},
			{
				name: "时光相册",
				pic_icon: "/static/images/navicons/photos.png"
			},
			{
				name: "温馨陪伴",
				pic_icon: "/static/images/navicons/concern.png"
			},
			{
				name: "在线游戏",
				pic_icon: "/static/images/navicons/game.png"
			},
		],
		tabsArr: ['即将开始', '往期精彩'],
		activatiesArr: [],
		isLoading: false,
		finishLoading: false,
		isLogin: false,
		location: {}
	},



	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (option) {
		if (!await LoginBiz.loginSilence(this)) {
			console.log("fail to login")
			return;
		}
		await this.getMyAddr();
		// while(this.data.location == {});
		await this.getActivatiesList2();
		//注册通知
		WxNotificationCenter.addNotification('refresh', this.didNotification, this)
	},
	//获取导航数据
	getNavData() {
		db.collection("navi_item").get().then(res => {
			console.log(res);
			this.setData({
				navArr: res.data
			})
			console.log("navArr:", this.data.navArr);
		}).catch(err => {
			console.log(err);
		})
	},
	//点击导航栏
	onClickNavi(e) {
		let choose_idx = e.currentTarget.dataset.idx;
		if (choose_idx === 0) {
			wx.redirectTo({
				url: '/pages/navi_pages/shopping_market/shopping_market',
			})
		}
		else {
			wx.showToast({
				title: '即将上线!',
				icon: 'success',
				duration: 800
			})
			return
		}

	},
	//获取活动列表
	getActivatiesList2(page_no = 1, scene = 0) {
		this.setData({
			isLoading: true
		})
		let data = {
			token: LoginBiz.getToken(),
			biz_type: 1,
			location: this.data.location,
			page_no: page_no,
			scene: scene,// 0:默认推荐页  1:往期活动页
			sort_type: 0 // 排序类型，0:按照时间排序，1：按照点赞数排序
		};//传参
		console.log("获取活动列表：");
		console.log(data);
		listActivities2(data).then(res => {
			console.log("正确信息：");
			console.log(res);
			if (res.data.activity_datas == null) {
				this.setData({
					isLoading: false,
					finishLoading: true
				})
				return;
			}
			res.data.activity_datas.forEach(item => {
				item.max_sign_num = formatNum(item.max_sign_num)
				item.sign_start_time = formatTime(item.sign_start_time * 1000, 5)
			})
			let old_list = this.data.activatiesArr;
			let new_list = old_list.concat(res.data.activity_datas);
			console.log("new_list:", new_list);
			wx.stopPullDownRefresh();
			this.setData({
				activatiesArr: new_list,
				isLoading: false,
			})
			if (res.data.activity_datas.length < 10) {
				console.log("没有更多了");
				this.setData({
					finishLoading: true
				})
			}
		}).catch(err => {
			console.log("错误信息：");
			console.log(err);
		})
	},
	getActivatiesList(size = 0) {
		this.setData({
			isLoading: true
		})
		let data = {
			limit: 3,
			size,//当前已加载的数量
			// hot:true
		};//传参
		listActivities(data).then(res => {
			console.log(res);
			res.data.forEach(item => {
				item.view_count = formatNum(item.view_count)
				item.publish_date = formatTime(item.publish_date, 5)
			})
			let old_list = this.data.activatiesArr;
			let new_list = old_list.concat(res.data);
			console.log("new_list:", new_list);
			wx.stopPullDownRefresh();
			this.setData({
				activatiesArr: new_list,
				isLoading: false,
			})
			if (this.data.activatiesArr.length == res.total) {
				console.log("没有更多了");
				this.setData({
					finishLoading: true
				})
			}
		})
	},
	getMyAddr() {
		var that = this
		wx.authorize({
			scope: 'scope.userFuzzyLocation',
			success(res) {
				console.log(res)
				if (res.errMsg == 'authorize:ok') {
					wx.getFuzzyLocation({
						type: 'wgs84',
						async success(res) {
							console.log(res)  //此时里面有经纬度
							let result = await wxGetAddress(res.longitude, res.latitude);
							console.log(result);
							var loc = {
								city_id: Number(result.regeocodeData.addressComponent.adcode),
								lng: String(res.longitude),
								lat: String(res.latitude)
							}
							console.log(loc)
							globalCache.set('user-location', loc);
							that.setData({
								location: loc
							})
						},
						async fail(err) {
							console.log(err)
						}
					});
				}
			},
			fail(err) {
				console.log("用户拒绝位置授权");
				console.log(err)
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
			activatiesArr: [],
			isLoading: false,
			finishLoading: false,
		})
		// wx.showToast({
		//   title: `切换到标签 ${index + 1}`,
		//   icon: 'none'
		// })
		this.getActivatiesList2(1, index);
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
		//移除通知
		WxNotificationCenter.removeNotification('refresh', this)
	},
	//通知处理
	didNotification: function () {
		console.log("主页收到其他页面的通知");
		// this.onLoad();
	},
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {
		this.setData({
			activatiesArr: [],
			isLoading: false,
			finishLoading: false
		})
		this.getActivatiesList2(1, this.data.activeTab);
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {
		if (this.data.finishLoading) return;
		this.setData({
			page_no: this.data.page_no + 1
		})
		this.getActivatiesList2(this.data.page_no, this.data.activeTab);
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	}
})