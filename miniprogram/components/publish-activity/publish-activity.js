// components/publish-activity/publish-activity.js
import {formatTime} from "../../utils/common.js"
import {publishActivity,wxGetAddress} from "../../api/apis"
const LoginBiz = require('../../common_biz/login.js')
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')

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
    
    activity_club_id : "",
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		year:new Date().getFullYear(),
    showPublishActivityWindow:false,
		registrationTime: "",
		unregistrationTime: "",
		beginTime:"",
    endTime:"",
    publishTitle: "发布活动",
    confirmButtonText: "确认发布",
		registrationTimestamp: "",
		unregistrationTimestamp: 0,
		beginTimestamp:"",
		endTimestamp:0,
		showPicker: false,
		minDate: "",
		maxDate: "",
		choose_date_idx : "",
    imgs: [],
    decode_imgs: [],
		count: 9, //上传照片最大数量
		activity_title: "",
		max_people_num: "",
		activity_content: "",
		activity_address:"",
		location:{},
    illegal_message:"",
    hide_btn: false,
    before_images : [],
    editActivityID: "",
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
        showPublishActivityWindow:true,
        imgs : [],
        editActivityID: "",
			})
    },
    
		onClickEdit(e){
			this.setData({
				showPublishActivityWindow:true
      });
      console.log("收到活动数据")
      console.log(e);

      let activityImages = []
      let decodeImages = []
 
      if (e.activity.cover_image_url != '') {
        activityImages.push({
          url:e.activity.cover_image_url,
          name:"",
          isImage:true,
        });
        decodeImages.push(e.activity.cover_image_url);
      }

      if (e.activity.image_urls.length > 0) {
        for (var i = 0; i < e.activity.image_urls.length; i++) {
          if (e.activity.image_urls[i] != '') {
            activityImages.push({
              url:e.activity.image_urls[i],
              name:"",
              isImage:true,
            });
            decodeImages.push(e.activity.image_urls[i]);
          }
        }
      }

      if (e.activity.sign_end_time != 0) {
        this.setData({
          unregistrationTimestamp: e.activity.sign_end_time_stamp,
        })
      } else {
        this.setData({
          unregistrationTimestamp: 0,
        })
      }

      if (e.activity.activity_end_time != 0) {
        this.setData({
          endTimestamp:  e.activity.activity_end_time_stamp,
        })
      } else {
        this.setData({
          endTimestamp: 0,
        })
      }

      this.setData({
        publishTitle: "编辑活动",
        editActivityID: e.activity.activity_id,
        activity_title: e.activity.title,
        activity_content: e.activity.content,
        max_people_num: e.activity.max_sign_num,
        registrationTime: e.activity.sign_start_time,
        registrationTimestamp:e.activity.sign_start_time_stamp,
        unregistrationTime: e.activity.sign_end_time,
        beginTime: e.activity.activity_start_time,
        beginTimestamp:e.activity.activity_start_time_stamp,
        endTime: e.activity.activity_end_time,
        activity_address: e.activity.activity_location,
        imgs: activityImages,
        decode_imgs: decodeImages,
        location: {
            city_id:Number(e.activity.location.city_id),
            lng:String(e.activity.location.lat),
            lat:String(e.activity.location.lng),
        },
      })

      this.properties.activity_club_id = e.activity.club_id;

      console.log(this.data);
		},

		getUserInfo(event) {
			console.log("getUserInfo方法");
			console.log(event.detail);
		},
		beforeClose (action, done) {
			console.log("onBeforeClose方法");
			if (action === "confirm") {
				return done(false);
			} else {
				return done();
			}
		},
		confirmPublish(event){
      console.log("confirmPublish方法");
      console.log(event);
			this.beforeClose = (action) => new Promise((resolve) => {
				setTimeout(() => {
					if (action === 'confirm') {
						// 拦截确认操作
						resolve(false);
					} else {
						resolve(true);
					}
				}, 0);
			});
	
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
				this.setData({
					showPublishActivityWindow:true
				})
				return;
			}
			if(this.data.max_people_num <= 0 || this.data.max_people_num>999){
				wx.showToast({
					title: '参与人数非法',
					icon: 'error',
					duration: 2000
				})
				return;
			} 
			//上传图片至服务器，获得图片加密链接后再上传活动表单
			// var that = this
			var imgUrl = []
      var cover_imgUrl = ""
      var activityID = "";
      // var needUploadImgs = [];

      if (this.data.editActivityID != "") {
        activityID = this.data.editActivityID;
      }

      if (this.data.decode_imgs.length > 0) {
        cover_imgUrl = this.data.decode_imgs[0]
        if (this.data.decode_imgs.length > 1) {
          imgUrl = this.data.decode_imgs.slice(1);
        }
      }

      var data = {
        token:LoginBiz.getToken(),
        activity_id: activityID,
        biz_type:1,
        location:this.data.location,
        title:this.data.activity_title,
        max_sign_num:Number(this.data.max_people_num),
        cover_image_url:cover_imgUrl,
        content:this.data.activity_content,
        image_url: imgUrl,
        activity_location:this.data.activity_address,
        sign_start_time:this.data.registrationTimestamp,
        sign_end_time:this.data.unregistrationTimestamp,
        activity_start_time:this.data.beginTimestamp,
        activity_end_time:this.data.endTimestamp,
        club_id : this.properties.activity_club_id,
      };//传参
      console.log("发布");
      console.log(data);
      wx.showLoading({ title: "发布中..." })
      publishActivity(data).then(res=>{
        console.log(res);
        if (res.err_no == 0) {
          wx.hideLoading()
          wx.showToast({
            title: "活动发布成功！",
            icon: "success",
          });
          
          if (activityID != '' && activityID != '0') {
            // 向详情页发布通知重新刷新
            WxNotificationCenter.postNotificationName('refreshActivityDetail',activityID);
          } else {
            // 活动详情页不需要刷新社团详情页
            if (this.properties.activity_club_id != '' && this.properties.activity_club_id != '0') {
              // 向社团详情页发布通知重新刷新
              WxNotificationCenter.postNotificationName('refreshClubActivity',this.properties.activity_club_id);
            }
          }

        } else {
          console.log(res.err_no+" "+ res.err_msg);
          wx.hideLoading();
          wx.showToast({
            title: "活动发布失败，请稍后重试",
            icon: "none",
          });
        }
      }).catch(err=>{
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          title: "活动发布失败，请稍后重试",
          icon: "none",
        });
      })

      // for (var i = 0; i < that.data.imgs.length;i++) {
      //   if (this.data.before_images.includes(that.data.imgs[i])) {
      //     imgUrl.push(that.data.imgs[i]);
      //   } else {
      //     needUploadImgs.push(that.data.imgs[i]);
      //   }
      // }

			// if (needUploadImgs.length > 0) {
			// 	// var tempFilePaths = that.data.imgs
      //   var times = 0
        
      //   for (var i = 0; i < needUploadImgs.length; i++) {
      //     wx.uploadFile({
      //       url: 'http://124.220.84.200:5455/api/uploadStream',
      //       filePath: needUploadImgs[i],
      //       name: "file",
      //       header: {
      //         "content-type": "multipart/form-data"
      //       },
      //       formData:{
      //         token: LoginBiz.getToken(),// 用户token
      //         biz_type:1,// 业务线  1：普通活动，必要
      //       },
      //       success: function (res) {
      //         times += 1
      //         var jsonObj = JSON.parse(res.data);
      //         if (res.statusCode == 200) {
      //           imgUrl.push(jsonObj.data.file_download_http)
      //         }
              
      //         if(times === needUploadImgs.length){//图片传完了
      //           console.log("图片上传完毕");
      //           //图片上传完毕，得到imgUrl
      //           cover_imgUrl = imgUrl[0]

      //           if (imgUrl.length > 1) {
      //             imgUrl = imgUrl.slice(1)
      //           } else {
      //             imgUrl = [];
      //           }
      //           //同步
      
      //           var data = {
      //             token:LoginBiz.getToken(),
      //             activity_id: activityID,
      //             biz_type:1,
      //             location:that.data.location,
      //             title:that.data.activity_title,
      //             max_sign_num:Number(that.data.max_people_num),
      //             cover_image_url:cover_imgUrl,
      //             content:that.data.activity_content,
      //             image_url: imgUrl,
      //             activity_location:that.data.activity_address,
      //             sign_start_time:that.data.registrationTimestamp,
      //             sign_end_time:that.data.unregistrationTimestamp,
      //             activity_start_time:that.data.beginTimestamp,
      //             activity_end_time:that.data.endTimestamp,
      //             club_id: that.properties.activity_club_id,
      //           };//传参
      //           console.log("发布")
      //           console.log(data);
      //           wx.showLoading({ title: '发布中...' })
      //           publishActivity(data).then(res=>{
      //             console.log(res);
      //             if (res.err_no == 0) {
      //               wx.hideLoading()
      //               wx.showToast({
      //                 title: "活动发布成功！",
      //                 icon: "success",
      //               });
                    
      //               if (activityID != '' && activityID != '0') {
      //                 // 向详情页发布通知重新刷新
      //                 WxNotificationCenter.postNotificationName('refreshActivityDetail',activityID);
      //               } else {
      //                 // 活动详情页不需要刷新社团详情页
      //                 if (that.properties.activity_club_id != '' && that.properties.activity_club_id != '0') {
      //                   // 向社团详情页发布通知重新刷新
      //                   WxNotificationCenter.postNotificationName('refreshClubActivity',that.properties.activity_club_id);
      //                 }
      //               }
                    
      //             } else {
      //               console.log(res.err_no+" "+ res.err_msg);
      //               wx.hideLoading();
      //               wx.showToast({
      //                 title: "活动发布失败，请稍后重试",
      //                 icon: "fail",
      //               });
      //             }
      //           }).catch(err=>{
      //             console.log(err);
                  
      //             wx.hideLoading();
      //             wx.showToast({
      //               title: "活动发布失败，请稍后重试",
      //               icon: "fail",
      //             });
      //           })
               
      //           //向主页发布通知重新刷新
      //           WxNotificationCenter.postNotificationName('refresh')
      //         }
      //       },
      //       fail: function (err) {
      //         console.log(err);
      //         wx.showToast({
      //           title: "图片上传失败",
      //           icon: "none",
      //           duration: 2000
      //         })
      //       },
      //       complete: function (result) {
      //         console.log(result.errMsg)
      //       }
      //     })
      //   }
        
			// }
			// else{
      //   if (imgUrl.length > 0 ){
      //     cover_imgUrl = imgUrl[0]

      //     if (imgUrl.length > 1) {
      //       imgUrl = imgUrl.slice(1)
      //     } else {
      //       imgUrl = [];
      //     }
      //   }
			// 	var data = {
			// 		token:LoginBiz.getToken(),
			// 		activity_id: activityID,
			// 		biz_type:1,
			// 		location:this.data.location,
			// 		title:this.data.activity_title,
			// 		max_sign_num:Number(this.data.max_people_num),
			// 		cover_image_url:cover_imgUrl,
			// 		content:this.data.activity_content,
			// 		image_url: imgUrl,
			// 		activity_location:this.data.activity_address,
			// 		sign_start_time:this.data.registrationTimestamp,
			// 		sign_end_time:this.data.unregistrationTimestamp,
			// 		activity_start_time:this.data.beginTimestamp,
      //     activity_end_time:this.data.endTimestamp,
      //     club_id : this.properties.activity_club_id,
      //   };//传参
      //   console.log("发布");
			// 	console.log(data);
			// 	wx.showLoading({ title: "发布中..." })
			// 	publishActivity(data).then(res=>{
      //     console.log(res);
      //     if (res.err_no == 0) {
      //       wx.hideLoading()
      //       wx.showToast({
      //         title: "活动发布成功！",
      //         icon: "success",
      //       });
            
      //       if (activityID != '' && activityID != '0') {
      //         // 向详情页发布通知重新刷新
      //         WxNotificationCenter.postNotificationName('refreshActivityDetail',activityID);
      //       } else {
      //         // 活动详情页不需要刷新社团详情页
      //         if (this.properties.activity_club_id != '' && this.properties.activity_club_id != '0') {
      //           // 向社团详情页发布通知重新刷新
      //           WxNotificationCenter.postNotificationName('refreshClubActivity',this.properties.activity_club_id);
      //         }
      //       }

      //     } else {
      //       console.log(res.err_no+" "+ res.err_msg);
      //       wx.hideLoading();
      //       wx.showToast({
      //         title: "活动发布失败，请稍后重试",
      //         icon: "fail",
      //       });
      //     }
			// 	}).catch(err=>{
      //     console.log(err);
      //     wx.hideLoading();
      //     wx.showToast({
      //       title: "活动发布失败，请稍后重试",
      //       icon: "fail",
      //     });
			// 	})
				
			// }
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
			else if(this.data.max_people_num >999){
				this.setData({illegal_message:"最多允许999人参与！"})
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
		// bindUpload(e){
		// 	switch (this.data.imgs.length) {
		// 		case 0:
		// 			this.data.count = 3
		// 			break
		// 		case 1:
		// 			this.data.count = 2
		// 			break
		// 		case 2:
		// 			this.data.count = 1
		// 			break
		// 	}
		// 	var that = this
		// 	wx.chooseMedia({
		// 		count: that.data.count, // 默认3
		// 		mediaType: ['image'],
		// 		sourceType: ['album', 'camera'],
		// 		maxDuration: 30,
		// 		camera: 'back',
		// 		success(res) {
		// 			console.log(res);
		// 			// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
		// 			var tempFilePaths = res.tempFiles
		// 			for (var i = 0; i < tempFilePaths.length; i++) {
		// 				that.data.imgs.push(tempFilePaths[i].tempFilePath)
		// 				that.setData({
		// 					imgs: that.data.imgs
		// 				})
		// 			}
		// 		}
		// 	})
		// },
		// // 删除图片
		// deleteImg: function (e) {
		// 	var that = this
		// 	wx.showModal({
		// 		title: "提示",
		// 		content: "是否删除",
		// 		success: function (res) {
		// 			if (res.confirm) {
		// 				for (var i = 0; i < that.data.imgs.length; i++) {
		// 					if (i == e.currentTarget.dataset.index) that.data.imgs.splice(i, 1)
		// 				}
		// 				that.setData({
		// 					imgs: that.data.imgs
		// 				})
		// 			} else if (res.cancel) {
		// 				console.log("用户点击取消")
		// 			}
		// 		}
		// 	})
    // },
    
    // 是否隐藏发布按钮
    hideButton(e) {
      console.log(e);
      this.setData({
        hideBtn: e,
      })
    },

    afterImgsRead(e){
      console.log("上传活动图");
      console.log(e);
  
      const file = e.detail;
      var that = this;
  
      if (file.file.size > 2000000) {
        wx.showToast({
          title: '图片太大！',
          icon: "error",
          duration: 2000
        })
        return
      }

      var oldImgs = that.data.imgs;
      oldImgs.push({
        url: file.file.url,
        name:"",
        isImage: true,
        status: 'uploading',
        message: '上传中',
      });
      that.setData({
        imgs: oldImgs,
      })
  
      wx.uploadFile({
        url: 'http://124.220.84.200:5455/api/uploadStream',
        filePath: file.file.url,
        name: "file",
        header: {
          "content-type": "multipart/form-data"
        },
        formData: {
          token: LoginBiz.getToken(), // 用户token
          biz_type: 1, // 业务线  1：普通活动，必要
        },
    
        success(res) {
          that.data.imgs.pop();
          
          if (res.statusCode == 200) {
            var jsonObj = JSON.parse(res.data);
            console.log(res);
            if (jsonObj.err_no == 0) {
              // 上传完成需要更新 fileList
              var oldImgs = that.data.imgs;
              var oldDecodeImgs = that.data.decode_imgs;
              oldImgs.push({
                url: file.file.url,
                  name:"",
                  isImage: true,
                  status: 'done',
                  message: '上传成功',
              });
              oldDecodeImgs.push(jsonObj.data.file_download_http);

              that.setData({ 
                imgs: oldImgs,
                decode_imgs: oldDecodeImgs,
              });
    
              console.log(that.data);
            } else{
              wx.showToast({
                title: '图片上传失败！',
                icon: 'error',
                duration: 2000
              })
  
              var oldImgs = that.data.imgs;
  
              that.setData({ 
                imgs: oldImgs,
              });
            }
          } else {
            wx.showToast({
              title: '图片上传失败！',
              icon: 'error',
              duration: 2000
            })

            var oldImgs = that.data.imgs;
        
            oldImgs.push({
              url: file.file.url,
                name:"",
                isImage: true,
                status: 'failed',
                message: '上传失败',
            });

            that.setData({ 
              imgs: oldImgs,
            });
  
            console.log(res);
          }
        },
  
        fail: function (err) {
          wx.showToast({
            title: "图片上传失败",
            icon: "none",
            duration: 2000
          })
          var oldImgs = that.data.imgs;
        
          oldImgs.push({
            url: file.file.url,
              name:"",
              isImage: true,
              status: 'failed',
              message: '上传失败',
          });

          that.setData({ 
            imgs: oldImgs,
          });

          console.log(err);
        },
      });
    },
  
    deleteImgs(event) {
      console.log(event);
      let list = this.data.imgs;
      let decodeList = this.data.decode_imgs;
      list.splice(event.detail.index, 1);
      decodeList.splice(event.detail.index,1);
      this.setData({
        imgs: list,
        decode_imgs: decodeList,
      })
      console.log(this.data);
    },

	}
})
