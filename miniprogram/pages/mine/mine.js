// pages/mine/mine.js
import {
  listActivities2
} from "../../api/apis";
import {
  getClubList,
  getUser,
  editUser
} from "../../utils/server/club";
import LoginBiz from "../../common_biz/login"
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tabsArr: ['我的社团', '我的活动'],
    // gender: '未知',
    clubList: {
      type: Object,
      value: []
    },
    activeTab: 0,
    userData: {},
    showEditUser: false,
    curGender: 0,
    userName: '',
    userNickname: '',
    userPhone: '',
    userAvatar: ''
  },

  selectGender(e) {
    console.log('==>>', e.currentTarget.dataset.gender)
    this.setData({
      curGender: e.currentTarget.dataset.gender
    });
  },
  verifyNum() {
    if (!(/^1[3,4,5,6,7,8,9][0-9]{9}$/.test(this.data.userPhone))) {
      this.setData({
        illegal_message: "请输入正确的手机号！"
      })
    } else {
      this.setData({
        illegal_message: ""
      })
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    getUser().then(res => {
      this.setData({
        userData: res.data,
        userName: res.data.name,
        userNickname: res.data.nick_name,
        curGender: res.data.gender,
        userPhone: res.data.phone,
        userAvatar: res.data.avatar_url
      })
    })
    // wx.getSetting({
    //   success(res) {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //       wx.getUserInfo({
    //         success: function (res) {
    //           console.log('==>>userInfo',res.userInfo)
    //           if (res.userInfo.gender == 0) {
    //             tempGender = '未知';
    //             console.log('未知')
    //           } else if (res.userInfo.gender == 1) {
    //             tempGender = '男';
    //             console.log('男')
    //           } else {
    //             tempGender = '女';
    //             console.log('女')
    //           }
    //           that.setData({
    //             gender: tempGender
    //           })
    //         }
    //       })
    //     }
    //   }
    // })
    wx.showLoading({
      title: '获取中...'
    })
    this.getData();
    // this.setData({
    //   clubList: mockData
    // })
    console.log(this.data.clubList)
  },

  onChange(e) {
    const key = e.detail.index;
    this.setData({
      activeTab: key,
      isLoading: true
    })
    if (key === 1) {
      this.getActivity();
    } else if (key === 0) {
      this.getData();
    }
  },
  async getActivity() {
    let data = {
      biz_type: 1,
      page_no: 0,
      scene: 0, // 0:默认推荐页  1:往期活动页
      sort_type: 0 // 排序类型，0:按照时间排序，1：按照点赞数排序
    }; //传参
    listActivities2(data).then((res) => {
      this.setData({
        clubList: res.data.activity_datas,
        isLoading: false
      })
    })
  },
  async getData() {
    getClubList().then(async (res) => {
      console.log(res.data)
      this.setData({
        clubList: res.data.club_list,
        isLoading: false
      })
      wx.hideLoading()
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

  },
  onJumpAct(e) {
    console.log(e.currentTarget.dataset.acid)
    wx.navigateTo({
      url: `/pages/activity_detail/activity_detail?acid=${e.currentTarget.dataset.acid}`,
    })
  },
  onJumpClub(e) {
    console.log(e.currentTarget.dataset.acid)
    wx.navigateTo({
      url: `/pages/club_detail/club_detail?id=${e.currentTarget.dataset.clubid}`,
    })
  },
  modifyUser() {
    this.setData({
      showEditUser: true
    })
  },
  confirmEdit(event) {
    console.log("confirmPublish方法");
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
    if (this.data.userName == "" ||
      this.data.userNickname == "" ||
      this.data.userPhone == "" ||
      this.data.userAvatar == ""
    ) {
      wx.showToast({
        title: '请检查必填项',
        icon: 'error',
        duration: 2000
      })
      this.setData({
        showEditUser: true
      })
      return;
    }
    //上传图片至服务器，获得图片加密链接后再上传活动表单
    var that = this
    var imgUrl = '';
    var tempFilePaths = that.data.userAvatar;
    try {
      wx.uploadFile({
        url: 'http://124.220.84.200:5455/api/uploadStream',
        filePath: tempFilePaths,
        name: "file",
        header: {
          "content-type": "multipart/form-data"
        },
        formData: {
          token: LoginBiz.getToken(), // 用户token
          biz_type: 1, // 业务线  1：普通活动，必要
        },
        success: function (res) {
          var jsonObj = JSON.parse(res.data);
          if (res.statusCode == 200) {
          imgUrl = jsonObj.data.file_download_http;
          var data = {
            name: that.data.userName,
            nick_name: that.data.userNickname,
            gender: Number(that.data.curGender),
            Phone: that.data.userPhone,
            avatar_url: imgUrl
          }; //传参
          console.log(data);
          wx.showLoading({
            title: '修改中...'
          })
          editUser(data).then(res => {
            console.log({
              this: this,
              that
            }, res);

          }).catch(err => {
            console.log(err);
          })
            wx.hideLoading()
            wx.showToast({
              title: '信息修改成功！',
              icon: 'success',
            })
            that.setData({
              isLoading: true
            }, () => {
              console.log('==>>社团创建成功,重新进入页面请求getData')
              that.getData(0, 0);
            })
            // 
            //向主页发布通知重新刷新
            WxNotificationCenter.postNotificationName('refresh')
          }
        },
        fail: function (err) {
          console.log('11', err)
          wx.showToast({
            title: "图片上传失败",
            icon: "none",
            duration: 2000
          })
          this.setData({
            userName: this.data.userData.name,
            userNickname: this.data.userData.nick_name,
            curGender: this.data.userData.gender,
            userPhone: this.data.userData.phone,
            userAvatar: this.data.userData.avatar_url
          })
        },
        complete: function (result) {
          console.log(result.errMsg)
        }
      })
    } catch (err) {
      console.log('121', err)
      wx.showToast({
        title: "图片上传失败",
        icon: "none",
        duration: 2000
      })
      this.setData({
        userName: this.data.userData.name,
        userNickname: this.data.userData.nick_name,
        curGender: this.data.userData.gender,
        userPhone: this.data.userData.phone,
        userAvatar: this.data.userData.avatar_url
      })
    }

  },
  bindUpload(e) {
    console.log(e)
    var that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        console.log(res);
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFiles;
        that.data.userAvatar = tempFilePaths[0].tempFilePath;
        that.setData({
          userAvatar: that.data.userAvatar
        })
      }
    })
  },
  onClose() {
    setTimeout(() => {
      this.setData({
        userName: this.data.userData.name,
        userNickname: this.data.userData.nick_name,
        curGender: this.data.userData.gender,
        userPhone: this.data.userData.phone,
        userAvatar: this.data.userData.avatar_url
      })
    },300)
  },
  // 删除图片
  deleteImg: function (e) {
    console.log(e)
    var that = this
    wx.showModal({
      title: "提示",
      content: "是否删除",
      success: function (res) {
        if (res.confirm) {
          that.setData({
            userAvatar: ''
          })

        } else if (res.cancel) {
          console.log("用户点击取消")
        }
      }
    })
  },

})
