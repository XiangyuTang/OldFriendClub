// pages/activity_result/activity_result.js
import LoginBiz from "../../common_biz/login"

import { getActivityResult, deleteActivityResult } from "../../utils/server/activity"

const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
    title:'',
    activityId: '',
    signStatus:'',
    resultId:'',
    resultText:'',
    imgsUrls : [],
    auditStatus : 0,
    editBtnShow: false,
    placeHolderText:'活动结束后，活动组织者可以在此发布活动成果和现场照片',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
    console.log(options);

    this.getActivityResultData(options.activity_id);

    this.setData({
      activityId: options.activity_id,
      signStatus: options.sign_status,
      title: options.title,
    });

    if (this.data.signStatus == 4) {
      this.setData({
        placeHolderText:'活动结束后，可以在此发布活动成果和现场照片',
      })
    }

    // 注册通知
    WxNotificationCenter.addNotification('refreshActivityResult', this.didRefreshNotification, this)
  },

  getActivityResultData(activityId) {
    wx.showLoading({
      title: '读取成果中',
    })

    this.setData({
      resultId:'',
      resultText:'',
      imgsUrls : [],
      auditStatus : 0,
      editBtnShow: false,
    })

    var that = this;

    let data = {
      activityId: activityId,
    }
    getActivityResult(data).then(res => {
      wx.hideLoading();
      console.log(res);
      if (res.err_no == 0) {
        var resultData = res.data.activity_result;
        if (resultData.result_id != '0') {
          that.setData({
            resultId: resultData.result_id,
            resultText:  resultData.context,
            imgsUrls: resultData.img_urls,
            auditStatus: resultData.audit_status,
            editBtnShow: true,
          })

          console.log(that.data);
        }
      }else {
        console.log(res.err_no+' '+res.err_msg)
        wx.hideLoading();
        wx.showToast({
          title: '获取成果失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    }).catch(err => {
      console.log(err)
      wx.hideLoading();
      wx.showToast({
        title: '获取成果失败，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    })
  },
  
  onClickPublish() {
    console.log("发布成果"+this.data);
    if (this.data.signStatus != 4) {
      wx.showToast({
        title: '没有权限发布成果',
        icon:"none",
        duration:2000
      })

      return
    }

    wx.navigateTo({
      url: `../edit_activity_result/edit_activity_result?activity_id=${this.data.activityId}&sign_status=${this.data.signStatus}`,
    })
  },

  onClickEdit() {
    console.log("编辑成果");
    console.log(this.data);

    if (this.data.auditStatus == 0 || this.data.auditStatus == 1) {
      wx.showToast({
        title: '审核中的成果不能编辑',
        icon:'none',
        duration: 2000
      })

      return
    }

    if (this.data.signStatus != 4) {
      wx.showToast({
        title: '没有权限编辑成果',
        icon:"none",
        duration:2000
      })

      return
    }

    wx.navigateTo({
      url: `../edit_activity_result/edit_activity_result?activity_id=${this.data.activityId}&sign_status=${this.data.signStatus}&edit_result_id=${this.data.resultId}`,
    })
  },

  onClickDelete() {
    console.log("删除成果"+this.data);
    if (this.data.signStatus != 4) {
      wx.showToast({
        title: '没有权限删除成果',
        icon:"none",
        duration:2000
      })

      return
    }

    var that = this;

    let data = {
      result_id: that.data.resultId,
    }
    console.log(data);
    wx.showLoading({
      title: '删除中',
    })

    deleteActivityResult(data).then(res => {
      wx.hideLoading()
      if (res.err_no == 0) {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 2000
        })

        that.setData({
          resultId:'',
          resultText:'',
          imgsUrls : [],
          auditStatus : 0,
          editBtnShow: false,
        })
      } else {
        console.log(res.err_no + ' '+ res.err_msg);

        wx.showToast({
          title: '删除失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    }).catch(err => {
      console.log(err);
      wx.hideLoading()

      wx.showToast({
        title: '删除失败，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    })
  },

  didRefreshNotification: function (activityID) {
		console.log("收到刷新通知"+activityID);
    this.getActivityResultData(activityID);
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
		WxNotificationCenter.removeNotification('refreshActivityResult', this)
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