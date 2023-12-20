const LoginBiz = require('../../common_biz/login.js')
import {formatTime} from "../../utils/common.js"
import {getActivityDetail,signActivity,cancelSignActivity,deleteActivity, generateScheme} from "../../api/apis"
import { getActivityResult } from "../../utils/server/activity"
import {hideButton} from "../../components/publish-activity/publish-activity"
import Dialog from '@vant/weapp/dialog/dialog';
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')
import {verifyPhoneNum} from "../../utils/util"
let that = null
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
    activity_id: '',
    activity: {},
    enroll_data: {},
    activity_result_id: '',
		like_num:0,
		signed_num:0,
    // form: {
    //   show: false
	// 	},
	// 	sign_form:[
	// 		// {
	// 		// 	des:"用于报名页展示",
	// 		// 	id: "avatar",
	// 		// 	prop:"头像",
	// 		// 	type:"avatar"
    //   // },
    //   {
	// 			des:"输入真实姓名",
	// 			id: "name",
	// 			prop:"姓名",
    //     type:"text"
	// 		},{
	// 			id:"gender",
	// 			prop:"性别",
	// 			selects:["男","女"],
	// 			type:"select"
	// 		},{
	// 			id:"age",
	// 			prop:"年龄",
	// 			type:"number",
	// 			unit:"岁"
	// 		},{
	// 			id:"tel",
	// 			prop:"手机号",
	// 			type:"number" //type=phone时面向非个体开发者，且调用收费
	// 		}
    // ],
    // input: {
    //   name:"",
    //   gender: "",
    //   age:"",
    //   tel:"",
    // },
		sign_due:[],
    sign_status:"",
    activity_club:{},
    creator_phone:'',
    showSharePop: false,
		// user: {
		// 	open: 0
    // }
	},
	openLocation (e) {
    const {
			info,
			addr
		} = e.currentTarget.dataset
    wx.openLocation({
			latitude:parseFloat(info.lat),
			longitude:parseFloat(info.lng),
			address:addr,
      scale: 15
    })
  },
	tosignlist () {
    wx.navigateTo({
      url: `../sign_list/sign_list?activity_id=${this.data.activity_id}&sign_status=${this.data.activity.sign_status}`,
    })
  },

  toActivityResult(){
    console.log(this.data);
    if (this.data.sign_status == 4 && (this.data.activity_result_id == '' || this.data.activity_result_id == '0')) {
      // 活动创建者，且当前没有创建过活动成果
      wx.navigateTo({
        url: `../edit_activity_result/edit_activity_result?activity_id=${this.data.activity_id}&sign_status=${this.data.sign_status}`,
      })
    } else {
      wx.navigateTo({
        url: `../activity_result/activity_result?activity_id=${this.data.activity_id}&sign_status=${this.data.activity.sign_status}&title=${this.data.activity.title}`
      })
    }
  },

  getActivityResultData(activityID) {
    var that = this;

    let data = {
      activityId: activityID,
    }

    getActivityResult(data).then(res => {
      console.log(res);
      if (res.err_no == 0) {
        var resultData = res.data.activity_result;
        if (resultData.result_id != '0') {
          that.setData({
            activity_result_id: resultData.result_id,
          })

          console.log(that.data);
        }
      }else {
        console.log(res.err_no+' '+res.err_msg)
      }
    }).catch(err => {
      console.log(err)
    })
  },

	ininput (e) {
		const { info } = e.currentTarget.dataset
		console.log(info);
    const key = `input.${info.id}`
    let value = null
    if (e.type === 'chooseavatar') {
			wx.showLoading({ title: '加载中' })
			//todo:上传头像
			console.log("待添加上传头像至服务器");
			wx.hideLoading()
      // app.cloud().then(cloud=>{
			// 	cloud.uploadFile({
			// 		cloudPath: `./avatar/${that.data.project._id}/${that.userid}.jpg`,
			// 		filePath: e.detail.avatarUrl
			// 	}).then(res => {
			// 		wx.hideLoading()
			// 		that.setData({
			// 			[key]: res.fileID
			// 		})
			// 	})
			// })
    } else if (e.type === 'getphonenumber') {
      console.log("手机号：",e)
      if (e.detail.errMsg.indexOf('deny') !== -1) {
        console.log('用户拒绝')
      } else if (e.detail.errMsg === 'getPhoneNumber:ok') {
        wx.showLoading({ title: '校验中' })
        app.call({ name: 'get_info', data: wx.cloud.CloudID(e.detail.cloudID) }).then(result => {
          wx.hideLoading()
          that.setData({
            [key]: result.purePhoneNumber
          })
        })
      } else {
        showModal('当前小程序没有权限获取用户手机号', '提示', {
          showCancel: false
        })
      }
    } else if (e.type === 'change') {
      value = info.selects[e.detail.value]
    } else if (e.type === 'cancel') {
      value = ''
    } else if (e.type === 'input') {
      value = e.detail.value
    }
    if (value != null) {
      that.setData({
        [key]: value
      })
    }
  },

  modifySignUp() {
    wx.navigateTo({
      url: `/pages/sign_activity/sign_activity?activity_id=${this.data.activity_id}&enroll_id=${this.data.enroll_data.enroll_id}&sign_status=${this.data.sign_status}`,
    })
    // this.setData({
    //   form:{
    //     show: true
    //   }
    // })
  },

  // checkModbile(mobile) {
	// 	var re = /^1[3,4,5,6,7,8,9][0-9]{9}$/;
	// 	var result = re.test(mobile); 
	// 	if(!result) {
	// 		// alert("手机号码格式不正确！");
	// 		return false;//若手机号码格式不正确则返回false
	// 		}
	// 	return true;
	// },

//   submitsign(e) {
//     console.log("submit");
//     console.log(e.detail);

//     if (e.detail.item.value == 0){
//       // 取消
//       this.setData({
//         form:{
//           show: false
//         }
//       })
//     } else if (e.detail.item.value == 1) {
//       // 报名
//       if (this.data.input.name == ''){
//         wx.showToast({
//           title: '请填写姓名！',
//           icon:'none',
//         })
//         return
//       }

//       if (this.data.input.gender == '') {
//         wx.showToast({
//           title: '请选择性别！',
//           icon:'none',
//         })
//         return
//       }

//       if (this.data.input.age == '') {
//         wx.showToast({
//           title: '请填写年龄！',
//           icon:'none',
//         })
//         return
//       }

//       if (this.data.input.tel == '') {
//         wx.showToast({
//           title: '请填写手机号！',
//           icon:'none',
//         })
//         return
//       }

//       if (Number(this.data.input.age) < 10 || Number(this.data.input.age) > 150) {
//         wx.showToast({
//           title: '请填写正确的年龄！',
//           icon:'none',
//         })
//         return
//       }

//       if (!verifyPhoneNum(this.data.input.tel)){
//         wx.showToast({
//           title: '请填写正确的手机号！',
//           icon:'none',
//         })
//         return
//       }
      
//       let gender = 1;
//       if (this.data.input.gender == '男') {
//         gender = 1;
//       } else if (this.data.input.gender == '女') {
//         gender = 2;
//       }

//       let data= {
//         token:LoginBiz.getToken(),
//         biz_type:1,
//         activity_id:that.data.activity.activity_id,
//         user_name: this.data.input.name,
//         phone: this.data.input.tel,
//         gender: gender,
//         age: Number(this.data.input.age),
//       }
      
//       signActivity(data).then(res=>{
//         console.log("报名活动返回结果");
//         console.log(res);
//         if(res.err_no!=0){
//           wx.showToast({
//             title: res.err_msg,
//             mask:true,
//             icon:"error"
//           });
//         }else if(res.err_no===0){
//           wx.showToast({
//             title: '报名成功！',
//             icon:'success'
//           })
//           var options = {"acid":that.data.activity_id}
//           that.onLoad(options);
//           that.setData({
//             sign_status: 1,
//             signed_num:res.data.signed_num
//           })
          
//         }
//       }).catch((err) => {
//         // on cancel
//         wx.showToast({
//           title: '报名失败！',
//           icon:'error'
//         })
//       })

//       // 提交报名
//       this.setData({
//         form:{
//           show: false
//         }
//       })
//     } else if (e.detail.item.value == 2){
//       // 取消报名
//       let data= {
//         token:LoginBiz.getToken(),
//         biz_type:1,
//         activity_id:that.data.activity.activity_id
//       }
//       cancelSignActivity(data).then(res=>{
//         console.log("取消活动报名结果");
//         console.log(res);
//         if(res.err_no === 0){
//           var options = {"acid":that.data.activity_id}
//           // that.onLoad(options);
//           that.setData({
//             sign_status: 0,
//             signed_num:res.data.signed_num
//           })
//         }else{
//           wx.showToast({
//             title: '取消报名失败！',
//             icon:"error"
//           });
//         }
//       })
//     } else {
//       console.log("添加更多的value支持")
//     }
//   },

//   closesign() {
//     this.setData({
//       form:{
//         show: false
//       }
//     })
//   },

	// startsign () {
	// 	//不用填写表单，后台自动校验
    // // that.setData({
    // //   'form.show': true
    // // })
    // if(this.data.sign_status === 1){//已报名，审核中
    //   Dialog.confirm({
    //     title: '取消报名',
    //     message: '您确认【取消】报名本活动吗？'
    //   }).then(() => {
    //     let data= {
    //       token:LoginBiz.getToken(),
    //       biz_type:1,
    //       activity_id:that.data.activity.activity_id
    //     }
    //     cancelSignActivity(data).then(res=>{
    //       console.log("取消活动报名结果");
    //       console.log(res);
    //       if(res.err_no === 0){
    //         var options = {"acid":that.data.activity_id}
    //         // that.onLoad(options);
    //         that.setData({
    //           sign_status: 0,
    //           signed_num:res.data.signed_num
    //         })
    //       }else{
    //         wx.showToast({
    //           title: '取消报名失败！',
    //           icon:"error"
    //         });
    //       }
    //     })
    //   }).catch((err) => {
    //     // on cancel
    //     console.log(err);
    //   });
    // }
    // else if(this.data.sign_status === 0 || this.data.sign_status === 5){//没有报名或取消报名
    //   console.log(this.data.sign_status);
    //   Dialog.confirm({
    //     title: '报名确认',
    //     message: '确认报名本活动吗？'
    //   }).then(() => {
    //     // on confirm
    //     let data= {
    //       token:LoginBiz.getToken(),
    //       biz_type:1,
    //       activity_id:that.data.activity.activity_id
    //     }
        
    //     signActivity(data).then(res=>{
    //       console.log("报名活动返回结果");
    //       console.log(res);
    //       if(res.err_no!=0){
    //         wx.showToast({
    //           title: res.err_msg,
    //           mask:true,
    //           icon:"error"
    //         });
    //       }else if(res.err_no===0){
    //         wx.showToast({
    //           title: '报名成功！',
    //           icon:'success'
    //         })
    //         var options = {"acid":that.data.activity_id}
    //         that.onLoad(options);
    //         that.setData({
    //           sign_status: 1,
    //           signed_num:res.data.signed_num
    //         })
            
    //       }
    //     }).catch((err) => {
    //       // on cancel
    //       wx.showToast({
    //         title: '报名失败！',
    //         icon:'error'
    //       })
    //     })
        
    //   }).catch((err) => {
    //     // on cancel
    //     console.log(err);
    //   });
    // }
		
	// },
	// async submitsign (e) {
  //   const { input, project } = that.data
  //   if (e.detail?.item?.value === 1) {
  //     for (const item of project.form) {
  //       if (item.option !== true && (input[item.id] == null || input[item.id] == '')) {
  //         showModal(`【${item.prop}】要求必须填写，请补充后重新提交`, '提示')
  //         return false
  //       }
  //     }
  //     wx.showLoading({ title: '提交中' })
	// 		const submitres = await app.call({ name: 'add_sign', data: { id: project._id, input } })
	// 		wx.hideLoading()
	// 		if(submitres.code === 0){
	// 			await that.init()
	// 		} else {
	// 			showModal(submitres.msg||'系统出现问题，请稍后再试','安全提示',{
	// 				showCancel: true,
	// 				confirmText: '重新编辑'
	// 			}).then(flag=>{
	// 				if (flag) {
	// 					that.setData({
	// 						'form.show': true
	// 					})
	// 				}
	// 			})
	// 		}
  //   } else if (e.detail?.item?.value === 2) {
  //     const flag = await showModal('是否取消报名，取消后需要重新填写审核', '确认操作', {
  //       showCancel: true
  //     })
  //     if (flag) {
  //       wx.showLoading({ title: '取消中' })
  //       await app.call({ name: 'del_sign', data: { id: project._id } })
  //       await that.init()
  //       wx.hideLoading()
  //     } else {
  //       return
  //     }
  //   }
  //   that.setData({
  //     'form.show': false
  //   })
  // },
//   closesign () {
//     that.setData({
//       'form.show': false
//     })
//   },
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function(options) {
    console.log(options);
    const acid= options.acid;

    if (!await LoginBiz.loginSilence(this)) {
			console.log("fail to login")
			return;
    }
		
    this.getActivityDetailData(acid);

    this.publish_activity = this.selectComponent('#publish-activity');
    console.log(this.publish_activity.data);
    this.publish_activity.hideButton(true);

    this.getActivityResultData(acid);

    console.log(this.data);

    // 注册通知
    WxNotificationCenter.addNotification('refreshActivityDetail', this.didRefreshNotification, this)
  },

  getActivityDetailData(acid){
    that = this;
    let data = {
			token:LoginBiz.getToken(),
			activity_id:acid,
			biz_type: 1
		}
		wx.showLoading({
			title: '加载中',
		})

    getActivityDetail(data).then(res=>{
      wx.hideLoading()
      console.log("活动详情")
      console.log(res);
      var item = res.data.activity_data

      res.data.activity_data.activity_start_time_stamp = item.activity_start_time
      res.data.activity_data.activity_start_time = formatTime(item.activity_start_time*1000,3)
      
      res.data.activity_data.activity_end_time_stamp = item.activity_end_time
      if (res.data.activity_data.activity_end_time != 0){
        res.data.activity_data.activity_end_time = formatTime(item.activity_end_time*1000,3);
      }
     
      res.data.activity_data.sign_start_time_stamp = item.sign_start_time
      res.data.activity_data.sign_start_time = formatTime(item.sign_start_time*1000,3)

      res.data.activity_data.sign_end_time_stamp = item.sign_end_time
      if (res.data.activity_data.sign_end_time != 0){
        res.data.activity_data.sign_end_time = formatTime(item.sign_end_time*1000,3);
      }

			that.setData({
        activity_id:acid,
        activity:res.data.activity_data,
        enroll_data: res.data.enroll_data,
				like_num:res.data.like_num,
				signed_num:res.data.activity_data.signed_num,
				sign_due:[res.data.activity_data.sign_start_time,res.data.activity_data.sign_end_time],
        sign_status:res.data.activity_data.sign_status,
        creator_phone: res.data.enroll_data.enroll_phone,
      })

      if (res.data.activity_data.audit_status == -128 || res.data.activity_data.audit_status == -127) {
        wx.showToast({
          title: '该活动已被删除',
          icon: 'error',
          duration: 2000
        });

        var pages = getCurrentPages();
        if (pages.length > 1) {
          var beforePage = pages[pages.length-2];
          beforePage.returnPage();
        }
        wx.navigateBack({
          delta : 1
        });
        return
      }

      if (res.data.club_data) {
        that.setData({
          activity_club: res.data.club_data
        })
      }else {
        that.setData({
          activity_club: {
            club_id:0
          }
        })
      }

      if (res.data.enroll_data.enroll_status == 1 || res.data.enroll_data.enroll_status == 2 || res.data.enroll_data.enroll_status == 5) {
        that.setData({
          input: {
            name: res.data.enroll_data.enroll_name,
            gender: res.data.enroll_data.enroll_gender,
            age: res.data.enroll_data.enroll_age,
            tel: res.data.enroll_data.enroll_phone,
          }
        })

        console.log(this.data.input);
      }
		}).catch(err=>{
			console.log("出错了");
			console.log(err);
    })
  },
  
  openClubDetail (e) {
    console.log(e)
    const {
			info
    } = e.currentTarget.dataset
    console.log(info)
    wx.navigateTo({
      url: "../club_detail/club_detail?id="+info,
    })
  },

  editActivity(e) {
    console.log("编辑活动");
    if (this.data.activity.audit_status == 0 || this.data.activity.audit_status == 1) {
      wx.showToast({
        title: '活动审核中，无法编辑',
        icon:"none",
        duration: 2000
      })

      return
    }
    this.publish_activity.onClickEdit(this.data);
  },

  deleteActivity(e) {
    console.log("删除活动");
    console.log(e.detail);
  
    console.log(e)
    var that = this
    wx.showModal({
      title: "提示",
      content: "确定要删除该活动吗？",
      success: function (res) {
        if (res.confirm) {
          let data = {
            token:LoginBiz.getToken(),
            biz_type:1,
            activity_id:that.data.activity.activity_id,
          }

          deleteActivity(data).then(res=>{
            console.log("删除活动返回结果");
            console.log(res);
            if(res.err_no!=0){
              wx.showToast({
                title: res.err_msg,
                mask:true,
                icon:"error"
              });
            }else if(res.err_no===0){
              wx.showToast({
                title: '删除活动成功！',
                icon:'success'
              })

              var pages = getCurrentPages();
              if (pages.length > 1) {
                var beforePage = pages[pages.length-2];
                beforePage.returnPage();
              }
              wx.navigateBack({
                delta : 1
              }); 
            }
          }).catch((err) => {
            // on cancel
            console.log(err)
            wx.showToast({
              title: '删除活动失败！',
              icon:'error'
            })
          })

        } else if (res.cancel) {
          console.log("用户点击取消")
        }
      }
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
		WxNotificationCenter.removeNotification('refreshActivityDetail', this)
	},

  didRefreshNotification: function (activity_id) {
		console.log("收到刷新通知"+activity_id);
    this.getActivityDetailData(activity_id);
  },
  
  onClickShare(e) {
    console.log(e);
    var pages = getCurrentPages();
    console.log(pages[pages.length-1]);
    console.log(this.data.activity_id);

    this.onShowSharePop();
  },

  onShowSharePop() {
      this.setData({
        showSharePop: true,
      })
  },

  onCloseSharePop() {
    this.setData({
      showSharePop: false,
    })
  },

  onClickSharePage() {
      console.log('sharePage')
      this.onCloseSharePop();
  },

  assembleShareInfo(scheme) {
      var shareInfo = this.data.activity.title+'\n'+'时间：'+this.data.activity.activity_start_time+'-'+this.data.activity.activity_end_time+'\n'+'地点：'+this.data.activity.activity_location+'\n'+'组织者：'+this.data.activity.author.nick_name+'\n'+'报名链接：'+scheme;
      return shareInfo;
  },

  onCopyInfo() {
      console.log('copyInfo');

      that = this;

      var pages = getCurrentPages();
      console.log(pages[pages.length-1]);
      let pagePath = '/' + pages[pages.length-1].route
      
    let data = {
			token:LoginBiz.getToken(),
			query:'acid='+this.data.activity_id,
			path: pagePath
		}
		wx.showLoading({
			title: '加载中',
		})

    generateScheme(data).then(res=>{
      wx.hideLoading()

      console.log(res);

      if (res.err_no ===0) {
          var openLink = res.data
          wx.setClipboardData({
            data: this.assembleShareInfo(openLink),
          })
      }else {
        console.log("出错了");
        console.log(res.err_msg);
        wx.showToast({
          title: '获取分享信息失败',
          duration: 2000,
          icon: 'none'
        })
      }
      
		}).catch(err=>{
			console.log("出错了");
            console.log(err);
            wx.showToast({
                title: '获取分享信息失败',
                duration: 2000,
                icon: 'none'
            })
    })

      this.onCloseSharePop();
  },
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {
    var options = {"acid":this.data.activity_id};
    this.getActivityDetailData(this.data.activity_id)
	},

    // 用户分享
    onShareAppMessage: function () {
        console.log('share');
        var pages = getCurrentPages();
        let pagePath = pages[pages.length-1].route;

        return {
         title: this.data.activity.title===''?'我加入新活动啦！':this.data.activity.title,
         desc: this.data.activity.content === ''?'这个活动真的很棒！':this.data.activity.content,
         path: '/'+pagePath+'?acid='+ this.data.activity_id, // 路径，传递参数到指定页面。
         imageUrl: this.data.activity.cover_image_url,
        }
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


function showModal (content, title = '', obj = {}) {
  return new Promise((resolve) => {
    wx.showModal({
      cancelText: obj.cancelText || '取消',
      confirmColor: that.data.project?.style?.backgroudColor || '#07c041',
      confirmText: obj.confirmText || '确定',
      title: title,
      content: content,
      editable: obj.editable || false,
      placeholderText: obj.placeholderText || '',
      showCancel: obj.showCancel,
      success (res) {
        if (res.confirm) {
          resolve(res.content || true)
        } else {
          resolve(false)
        }
      },
      fail (e) {
        console.log(e)
        resolve(false)
      }
    })
  })
}