// pages/sign_activity/sign_activity.js
import {getEnrollData} from "../../api/apis"

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
    activity_id: "",
    enroll_data: {},
    accompany_list: [
      {enroll_name:''},
      {enroll_name:''},
    ],

    showGenderPicker: false,
    genderColumns:[
      '男',
      '女',
    ],

    enroll_name: "",
    enroll_gender: "男",
  },
  
  getEnrollData(enrollId) {
    wx.showLoading({
      title: '读取报名信息中',
    })
    this.setData({
      enroll_data:{},
      accompany_list: [],
    })

    var that = this;

    let data = {
      enrollId: enrollId,
    }
    getEnrollData(data).then(res => {
  
      console.log(res);
      if (res.err_no == 0) {
        var resultData = res.data.enroll_data;
        if (resultData.enroll_id != '0') {
          that.setData({
            enroll_data: res.data.enroll_data,
            accompany_list: accompany_list,
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
  },

  addFemale() {
    console.log('add female');
  },

  delAccompany(e) {
    console.log(e);
  },

  changeAccompanyName(e) {
    console.log(e);
    let accompanyList = this.data.accompany_list;
    accompanyList[e.currentTarget.id].enroll_name = e.detail;
    this.setData({
      accompany_list: accompanyList,
    })
  },

  submitSign() {
    console.log(this.data);
  },

  onChangeEnrollName() {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
    console.log(options);

    if (options.enroll_id !== '0' && options.enroll_id !== '') {
      getEnrollData(options.enroll_id);
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