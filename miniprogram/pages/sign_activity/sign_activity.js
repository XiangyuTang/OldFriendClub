// pages/sign_activity/sign_activity.js
import {getEnrollData, signActivity, cancelSignActivity} from "../../api/apis"
import { verifyPhoneNum }from  "../../utils/util"
const LoginBiz = require('../../common_biz/login.js')
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
    activity_id: "",
    enroll_data: {},
    accompany_list: [],

    showGenderPicker: false,
    genderColumns:[
      '男',
      '女',
    ],

    enroll_name: "",
    enroll_gender: "男",
    enroll_phone:'',
    enroll_age: '',
  },
  
  getUserEnrollData(enrollId) {
    wx.showLoading({
      title: '读取报名信息中',
    })
    this.setData({
      enroll_data:{},
      accompany_list: [],
    })

    var that = this;

    let data = {
      token: LoginBiz.getToken(),
      enroll_id: enrollId,
    }
    getEnrollData(data).then(res => {
      console.log(res);
      if (res.err_no == 0) {
        var resultData = res.data.enroll_data;
        if (resultData.enroll_id != '0') {
          that.setData({
            enroll_data: res.data.enroll_data,
            accompany_list: res.data.accompany_list,
            enroll_age: res.data.enroll_data.applicant_age,
            enroll_gender: res.data.enroll_data.applicant_gender ==1?'男':'女',
            enroll_name: res.data.enroll_data.applicant_name,
            enroll_phone: res.data.enroll_data.applicant_phone,
          })

          console.log(that.data);
        }
        wx.hideLoading();
      }else {
        console.log(res.err_no+' '+res.err_msg)
        wx.hideLoading();
        wx.showToast({
          title: '获取报名信息失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    }).catch(err => {
      console.log(err)
      wx.hideLoading();
      wx.showToast({
        title: '获取报名信息失败，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    })
  },

  showGenderPicker() {
    this.setData({
      showGenderPicker: true,
    })
  },

  onConfirmGender(e) {
    const { picker, value, index } = e.detail;
    console.log(value);
    console.log(index);
    this.setData({
      enroll_gender: value,
      showGenderPicker: false,
    })
  },

  onCancelGender() {
    this.setData({
      showGenderPicker: false,
    })
  },

  addMale() {
    console.log('add male');
    let accompany_list = this.data.accompany_list;
    accompany_list.push({
      applicant_name: '',
      applicant_gender: 1,
    })
    this.setData({
      accompany_list: accompany_list,
    })
  },

  addFemale() {
    console.log('add female');
    let accompany_list = this.data.accompany_list;
    accompany_list.push({
      applicant_name: '',
      applicant_gender: 2,
    })
    this.setData({
      accompany_list: accompany_list,
    })
  },

  delAccompany(e) {
    console.log(e);
    let accompany_list = this.data.accompany_list;
    accompany_list.splice(Number(e.currentTarget.id),1)
    this.setData({
      accompany_list: accompany_list,
    })
  },

  changeAccompanyName(e) {
    console.log(e);
    let accompanyList = this.data.accompany_list;
    accompanyList[e.currentTarget.id].applicant_name = e.detail;
    this.setData({
      accompany_list: accompanyList,
    })
  },

  submitSign() {
    console.log(this.data);

    if (!verifyPhoneNum(this.data.enroll_phone)){
      wx.showToast({
        title: '手机号格式错误',
        icon: 'error',
      })
      return
    }

    let gender = 0;
    if (this.data.enroll_gender == '男') {
      gender = 1;
    } else if (this.data.enroll_gender == '女') {
      gender = 2;
    }
   
    let data= {
      token:LoginBiz.getToken(),
      enroll_id: '',
      biz_type:1,
      activity_id:this.data.activity_id,
      user_name: this.data.enroll_name,
      phone: this.data.enroll_phone,
      gender: Number(gender),
      age: Number(this.data.enroll_age),
      new_accompany_list: this.data.accompany_list,
    }
    
    signActivity(data).then(res=>{
      console.log("报名活动返回结果");
      console.log(res);
      if(res.err_no!=0){
        wx.showToast({
          title: '报名失败！',
          icon:"error"
        });
        console.log(res.err_msg)
      }else if(res.err_no===0){
        WxNotificationCenter.postNotificationName('refreshActivityDetail',this.data.activity_id);
        wx.showToast({
          title: '报名成功！',
          icon:"success",
          duration: 2000,
          mask: true,
          complete: function () {
            setTimeout(() => {
              wx.navigateBack({
                delta : 1
              });
          }, 2000)
        }
        });
      }
    }).catch((err) => {
      // on cancel
      wx.showToast({
        title: '报名失败！',
        icon:'error'
      })
      console.log(err);
    })
  },

  // 取消报名
  cancelSign(e) {
    console.log(e);
    let cancelEnrollId = e.currentTarget.id;

    let data= {
      token:LoginBiz.getToken(),
      enroll_id: cancelEnrollId,
      biz_type:1,
      activity_id:this.data.activity_id,
    }
    
    cancelSignActivity(data).then(res=>{
      console.log("取消报名返回结果");
      console.log(res);
      if(res.err_no!=0){
        wx.showToast({
          title: '报名失败！',
          icon:"error"
        });
        console.log(res.err_msg)
      }else if(res.err_no===0){
        WxNotificationCenter.postNotificationName('refreshActivityDetail',this.data.activity_id);
        wx.showToast({
          title: '取消报名成功',
          icon:"success",
          duration: 2000,
          mask: true,
          complete: function () {
            setTimeout(() => {
              wx.navigateBack({
                delta : 1
              });
          }, 2000)
        }
        });
      }
    }).catch((err) => {
      // on cancel
      wx.showToast({
        title: '报名失败！',
        icon:'error'
      })
      console.log(err);
    })
  },

  onChangeEnrollName() {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
    console.log(options);

    if (options.enroll_id !== '0' && options.enroll_id !== '') {
      this.getUserEnrollData(options.enroll_id);
    }

    this.setData({
      activity_id: options.activity_id,
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