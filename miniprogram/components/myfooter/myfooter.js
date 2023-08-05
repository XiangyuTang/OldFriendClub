// components/myfooter/myfooter.js
import {formatTime} from "../../utils/common.js"
import {publishActivaty,wxGetAddress} from "../../api/apis"
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
		unregistrationTimestamp: 0,
		beginTimestamp:"",
		endTimestamp:0,
		showPicker: false,
		minDate: "",
		maxDate: "",
		choose_date_idx : "",
		imgs: [],
		count: 3, //上传照片最大数量
		activity_title: "",
		max_people_num: "",
		activity_content: "",
		activity_address:"",
		location:{},
		illegal_message:""
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
		},
		
		onClickAddr(){
			console.log("进入获取地址");
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
			//todo：待添加文本输入是否为空的判断逻辑
			if(this.data.activity_title == ""||
			this.data.activity_content == "" ||
			this.data.max_people_num == "" ||
			this.data.registrationTimestamp == ""||
			this.data.beginTimestamp == ""||
			this.data.activity_address == ""
			){
				wx.showToast({
					title: '请检查必填项',
					icon: 'error',
					duration: 2000
				})
				return;
			}
			if(this.data.max_people_num <= 0){
				wx.showToast({
					title: '参与人数非法',
					icon: 'error',
					duration: 2000
				})
				return;
			} 
			//上传图片至服务器，获得图片加密链接后再上传活动表单
			var that = this
			var imgUrl = []
			var cover_imgUrl = ""
			if (that.data.imgs.length > 0) {
				var tempFilePaths = that.data.imgs
				var times = 0
				for (var i = 0; i < tempFilePaths.length; i++) {
					wx.uploadFile({
						url: 'http://124.220.84.200:5455/api/uploadStream',
						filePath: tempFilePaths[i],
						name: "file",
						header: {
							"content-type": "multipart/form-data"
						},
						formData:{
							token: LoginBiz.getToken(),// 用户token
							biz_type:1,// 业务线  1：普通活动，必要
						},
						success: function (res) {
							times += 1
							var jsonObj = JSON.parse(res.data);
							if (res.statusCode == 200) {
								imgUrl.push(jsonObj.data.file_download_http)
								if(times === tempFilePaths.length){//图片传完了
									console.log("图片上传完毕");
									//图片上传完毕，得到imgUrl
									cover_imgUrl = imgUrl[0]
									//同步
									var data = {
										token:LoginBiz.getToken(),
										activity_id: "0",
										biz_type:1,
										location:that.data.location,
										title:that.data.activity_title,
										max_sign_num:Number(that.data.max_people_num),
										cover_image_url:cover_imgUrl,
										content:that.data.activity_content,
										image_url: imgUrl,
										activity_location:that.data.activity_address,
										sign_start_time:that.data.registrationTimestamp,
										sign_end_time:that.data.unregistrationTimestamp,
										activity_start_time:that.data.beginTimestamp,
										activity_end_time:that.data.endTimestamp
									};//传参
									console.log(data);
									wx.showLoading({ title: '发布中...' })
									publishActivaty(data).then(res=>{
										console.log(res);
									}).catch(err=>{
										console.log(err);
									})
									wx.hideLoading()
									wx.showToast({
										title: '活动发布成功！',
										icon: 'success',
									})
								}
							}
						},
						fail: function (err) {
							wx.showToast({
								title: "图片上传失败",
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
			else{
				var data = {
					token:LoginBiz.getToken(),
					activity_id: "0",
					biz_type:1,
					location:this.data.location,
					title:this.data.activity_title,
					max_sign_num:Number(this.data.max_people_num),
					cover_image_url:"",
					content:this.data.activity_content,
					image_url: [],
					activity_location:this.data.activity_address,
					sign_start_time:this.data.registrationTimestamp,
					sign_end_time:this.data.unregistrationTimestamp,
					activity_start_time:this.data.beginTimestamp,
					activity_end_time:this.data.endTimestamp
				};//传参
				console.log(data);
				wx.showLoading({ title: "发布中..." })
				publishActivaty(data).then(res=>{
					console.log(res);
				}).catch(err=>{
					console.log(err);
				})
				wx.hideLoading()
				wx.showToast({
					title: "活动发布成功！",
					icon: "success",
				})
			}
			
		},
		onClose() {
			this.setData({ close: false });
		},
		verifyNum(){
			if(!(/(^[0-9]*$)/.test(this.data.max_people_num))){
				this.setData({illegal_message:"请输入数字！"})
			}
			else if(this.data.max_people_num == ""){
				this.setData({illegal_message:""})
			}
			else{
				this.setData({illegal_message:""})
			}
			
		},
		//每一次选择日期后判断的方法
		onConfirm(event) {
			console.log("onConfirm");
			console.log(event);
			
			this.setData({
				showPicker:false,
			})
			var date = event.detail//13位时间戳转10位
			console.log(date);
			let choosedate = formatTime(date,1)//参数2：选择“格式1”进行format
			//把格式化后的日期赋值给registrationTime，就会显示到页面
			if (choose_date_idx==0) {
				this.setData({ 
					registrationTime:choosedate,
					registrationTimestamp:Number(date.toString().substr(0,10))
				})
			}else if(choose_date_idx==1){
				if(this.data.registrationTimestamp!="" && date > this.data.registrationTimestamp){
					console.log("报名时间段合法");
					this.setData({ 
						unregistrationTime:choosedate,
						unregistrationTimestamp:Number(date.toString().substr(0,10))
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
					beginTimestamp:Number(date.toString().substr(0,10))
				})
			}else{
				console.log(this.data.beginTimestamp);
				console.log(date);
				if(this.data.biginTimestamp!="" && date > this.data.beginTimestamp){
					console.log("活动时间段合法");
					this.setData({ 
						endTime:choosedate,
						endTimestamp:Number(date.toString().substr(0,10))
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
						that.data.imgs.push(tempFilePaths[i].tempFilePath)
						that.setData({
							imgs: that.data.imgs
						})
					}
				}
			})
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
