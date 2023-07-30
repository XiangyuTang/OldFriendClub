// components/myfooter/myfooter.js
import {formatTime} from "../../utils/common.js"
import {publishActivaty} from "../../api/apis"
const LoginBiz = require('../../common_biz/login.js')

let choose_date_idx = ""
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		minDate:{
			type:Number,
			value:{}
		},
		maxDate:{
			type:Number,
			value:{}
		},
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		year:new Date().getFullYear(),
		showPublishActivatyWindow:false,
		registrationTime: "",
		unregistrationTime: "",
		beginTime:"",
		endTime:"",
		registrationTimestamp: "",
		unregistrationTimestamp: "",
		beginTimestamp:"",
		endTimestamp:"",
		showPicker: false,
		minDate: "",
		maxDate: "",
		choose_date_idx : "",
		imgs: [],
		count: 3, //上传照片最大数量
		activity_title: "",
		max_people_num: "",
		activity_content: "",
	},
	
	/**
	 * 组件的方法列表
	 */
	methods: {
		
		onClickIcon(){
			wx.showToast({
				title: '标题尽量控制在25字内！',
				icon: 'none',
			})
			wx.authorize({
				scope: 'scope.userFuzzyLocation',
				success(res) {
						console.log(res)
						if(res.errMsg == 'authorize:ok'){
								wx.getFuzzyLocation({
										type: 'wgs84',
										success(res) {
												console.log(res)  //此时里面有经纬度
										}
								})
						}
				},
				fail(err) {
						console.log(err)   
				}                    
			})
		},
		onClickAddr(){
			console.log("进入获取地址");
		},
		onclickPublish(){
			this.setData({
				showPublishActivatyWindow:true
			})
			
		},
		getUserInfo(event) {
			console.log("getUserInfo方法");
			console.log(event.detail);
		},
		confirmPublish(event){
			console.log("confirmPublish方法");
			console.log(event);
			//将数据提交至后台数据库
			/**
			 * {
					token string // 用户token，必要
					activity_id string // 活动唯一id，非必要，传0表示创建新活动，非0表示更新活动
					location Location // 用户的地点信息
					title string // 活动标题，必要
					cover_image_url string // 活动封面图，非必要，此处为加密后的链接字符串
					content string // 活动文本内容，必要
					image_url []string // 活动内图片，非必要，此处为加密后的链接字符串
					activity_location string // 活动地点，必要
					activity_start_time int64 // 活动开始时间，必要
					activity_end_time int64 // 活动截止时间
					sign_start_time int64 // 报名开始时间
					sign_end_time int64 // 报名截止时间
				}
				Location
				{
						city_id int // 城市id
						lng string // 经度
						lat string // 纬度
				}
			 */
			//todo：待添加文本输入是否为空的判断逻辑

			var location = {
				city_id: 0,
				lng:"123.11",
				lat:"123.22"
			}
			var data = {
				token:LoginBiz.getToken(),
				activity_id: "0",
				location:location,
				title:this.data.activity_title,
				max_people_num:max_people_num, //接口待添加
				cover_image_url:"",
				content:this.data.activity_content,
				image_url: [],
				activity_location:"北京市-测试区",
				sign_start_time:registrationTimestamp,
				sign_end_time:unregistrationTimestamp,
				activity_start_time:beginTimestamp,
				activity_end_time:endTimestamp
			};//传参
			publishActivaty(data).then(res=>{
				console.log(res);
			})
		},
		onClose() {
			this.setData({ close: false });
		},
		//每一次选择日期后判断的方法
		onConfirm(event) {
			console.log("onConfirm");
			console.log(event);
			
			this.setData({
				showPicker:false,
			})
			var date = event.detail;
			console.log(date);
			let choosedate = formatTime(date,1)
			//把格式化后的日期赋值给registrationTime，就会显示到页面
			if (choose_date_idx==0) {
				this.setData({ 
					registrationTime:choosedate,
					registrationTimestamp:date
				})
			}else if(choose_date_idx==1){
				if(this.data.registrationTimestamp!="" && date > this.data.registrationTimestamp){
					console.log("报名时间段合法");
					this.setData({ 
						unregistrationTime:choosedate,
						unregistrationTimestamp:date
					})
				}else{
					console.log("报名时间段非法");
					wx.showToast({
						title: '报名时间段非法',
						icon: 'error',
					})
					return
				}
			}else if(choose_date_idx==2){
				this.setData({ 
					beginTime:choosedate,
					beginTimestamp:date
				})
			}else{
				console.log(this.data.beginTimestamp);
				console.log(date);
				if(this.data.biginTimestamp!="" && date > this.data.beginTimestamp){
					console.log("活动时间段合法");
					this.setData({ 
						endTime:choosedate,
						endTimestamp:date
					})
				}else{
					console.log("活动时间段非法");
					wx.showToast({
						title: '活动时间段非法',
						icon: 'error',
					})
					return
				}
			}
			this.setData({ choose_date_idx:""})
			
    },
    onCancel() {
			// console.log("onCancel");
			this.setData({
				showPicker:false,
				currentDate:new Date(),
				choose_date_idx:""
			})
    },
    choseTime(event) {
			choose_date_idx = event.currentTarget.dataset.idx
			this.setData({
				minDate:new Date(),
				maxDate:new Date(2033, 12, 31),
				showPicker:true
			})
			console.log("choose_date_idx:",choose_date_idx);
		},
		bindUpload(e){
			switch (this.data.imgs.length) {
				case 0:
					this.data.count = 3
					break
				case 1:
					this.data.count = 2
					break
				case 2:
					this.data.count = 1
					break
			}
			var that = this
			wx.chooseMedia({
				count: that.data.count, // 默认3
				mediaType: ['image'],
				sourceType: ['album', 'camera'],
				maxDuration: 30,
				camera: 'back',
				success(res) {
					console.log(res);
					// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
					var tempFilePaths = res.tempFiles
					for (var i = 0; i < tempFilePaths.length; i++) {
						//调试用
						that.data.imgs.push(tempFilePaths[i].tempFilePath)
						that.setData({
							imgs: that.data.imgs
						})
						//调试用⬆️
						wx.uploadFile({
							url: 'https://graph.baidu.com/upload',
							filePath: tempFilePaths[i].tempFilePath,
							name: "file",
							header: {
								"content-type": "multipart/form-data"
							},
							success: function (res) {
								if (res.statusCode == 200) {
									wx.showToast({
										title: "上传成功",
										icon: "none",
										duration: 1500
									})
									console.log(res);
									// that.data.imgs.push(JSON.parse(res.data).data)
									// console.log(that.data.imgs);
									// that.setData({
									// 	imgs: that.data.imgs
									// })
								}
							},
							fail: function (err) {
								wx.showToast({
									title: "上传失败",
									icon: "none",
									duration: 2000
								})
							},
							complete: function (result) {
								console.log(result.errMsg)
							}
						})
					}
				}
			})
			// wx.chooseImage({
			// 	count: that.data.count, // 默认3
			// 	sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
			// 	sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
			// 	success: function (res) {
					
			// 	}
			// })
		},
		// 删除图片
		deleteImg: function (e) {
			var that = this
			wx.showModal({
				title: "提示",
				content: "是否删除",
				success: function (res) {
					if (res.confirm) {
						for (var i = 0; i < that.data.imgs.length; i++) {
							if (i == e.currentTarget.dataset.index) that.data.imgs.splice(i, 1)
						}
						that.setData({
							imgs: that.data.imgs
						})
					} else if (res.cancel) {
						console.log("用户点击取消")
					}
				}
			})
		}


	}
})
