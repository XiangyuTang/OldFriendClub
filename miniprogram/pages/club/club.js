import {
  getClubList,
  createClub
} from "../../utils/server/club";
import {
  addHeightArray,
  clearHeight
} from "../../utils/styleCount";
import LoginBiz from "../../common_biz/login"
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')

// pages/club/club.js
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: 0,
    tabsArr: ['我加入的', '我创建的', '其他社团'],
    tabKey: 0,
    isLoading: false,
    finishLoading: false,
    clubList: [],
    showPublishClub: false,
    club_name: '',
    club_content: '',
    club_icon: '',
    club_back_img: '',
    loadingFlag: false,
    scrollviewHeight: 0,
    currentPageNo: 1,
    isNoMore: false
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var _this = this;
    const {
      currentPageNo
    } = this.data;
    console.log('==>>on Load 请求getData');
    this.getData(0, currentPageNo);
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          scrollviewHeight: res.windowHeight - 102 - 30
        })
      }
    })
  },

  // typeKey: tab索引
  // pageNo: 页码
  async getData(typeKey, pageNo) {
    const idMap = {
      0: 1,
      1: 2,
      2: 0
    };
    getClubList({
      scene: idMap[typeKey],
      page_no: pageNo
    }).then(async (res) => {
      const clubList = res.data.club_list.filter((item) => {
        return item.club_back_img_width
      })
      const list = await addHeightArray(clubList, 'club_back_img');
      console.log('==>>list', list)

      if (list.length < 10) {
        // 没有更多了
        this.setData({
          isNoMore: true
        })
      }
      this.setData({
        clubList: list,
        isLoading: false,
        loadingFlag: false,
        currentPageNo: pageNo + 1
      })
    })
  },
  onScrollRefresh: function () {
    if (this.data.isNoMore) {
      // 没有更多了
      return;
    }
    if (this.data.loadingFlag) {
      return;
    }
    this.getData(this.data.tabKey, this.data.currentPageNo)
  },

  jumpDetail() {
    console.log('==>>jump d')
  },
  joinClub() {
    console.log('==>>jump joinClub')
  },
  onclickPublishClub() {
    this.setData({
      showPublishClub: true
    })
  },

  onBeforeClose(action, done) {
    console.log("onBeforeClose方法");
    if (action === "confirm") {
      return done(false);
    } else {
      return done();
    }
  },
  onChange(e) {
    clearHeight();
    this.setData({
      currentPageNo: 1,
      isLoading: true,
      tabKey: e.detail.index,
      isNoMore: false
    }, () => {
      console.log('==>>onChange发送getData请求=2')
      this.getData(e.detail.index, 1);
    })
  },
  confirmPublish(event) {
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
    if (this.data.club_name == "" ||
      this.data.club_content == "" ||
      this.data.club_icon == "" ||
      this.data.club_back_img == ""
    ) {
      wx.showToast({
        title: '请检查必填项',
        icon: 'error',
        duration: 2000
      })
      this.setData({
        showPublishClub: true
      })
      return;
    }
    //上传图片至服务器，获得图片加密链接后再上传活动表单
    var that = this
    var imgUrl = [];
    var tempFilePaths = [that.data.club_icon, that.data.club_back_img];
    var times = 0;
    try {
      for (var i = 0; i < tempFilePaths.length; i++) {
        wx.uploadFile({
          url: 'http://124.220.84.200:5455/api/uploadStream',
          filePath: tempFilePaths[i],
          name: "file",
          header: {
            "content-type": "multipart/form-data"
          },
          formData: {
            token: LoginBiz.getToken(), // 用户token
            biz_type: 1, // 业务线  1：普通活动，必要
          },
          success: function (res) {
            times += 1
            var jsonObj = JSON.parse(res.data);
            if (res.statusCode == 200) {
              imgUrl.push(jsonObj.data.file_download_http)
              if (times === tempFilePaths.length) { //图片传完了
                var data = {
                  club_name: that.data.club_name,
                  club_summary: that.data.club_content,
                  club_icon: imgUrl[0],
                  club_back_img: imgUrl[1]
                }; //传参
                console.log(data);
                wx.showLoading({
                  title: '发布中...'
                })
                createClub(data).then(res => {
                  console.log({
                    this: this,
                    that
                  }, res);

                }).catch(err => {
                  console.log(err);
                })
                wx.hideLoading()
                wx.showToast({
                  title: '社团创建成功！',
                  icon: 'success',
                })
                that.setData({
                  isLoading: true
                }, () => {
                  console.log('==>>社团创建成功,重新进入页面请求getData')
                  that.getData(0, 1);
                })
                // 
                //向主页发布通知重新刷新
                WxNotificationCenter.postNotificationName('refresh')
              }
            }
          },
          fail: function (err) {
            wx.showToast({
              title: "图片上传失败",
              icon: "none",
              duration: 2000
            })
            this.setData({
              club_name: '',
              club_content: '',
              club_icon: '',
            })
          },
          complete: function (result) {
            console.log(result.errMsg)
          }
        })
      }
    } catch (err) {
      wx.showToast({
        title: "图片上传失败",
        icon: "none",
        duration: 2000
      })
      this.setData({
        club_name: '',
        club_content: '',
        club_icon: '',
      })
    }

  },
  onClose() {
    this.setData({
      close: false
    });
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
        if (e.currentTarget.dataset.imgType === 'logo') {
          that.data.club_icon = tempFilePaths[0].tempFilePath;
          that.setData({
            club_icon: that.data.club_icon
          })
        } else {
          that.data.club_back_img = tempFilePaths[0].tempFilePath;
          that.setData({
            club_back_img: that.data.club_back_img
          })
        }

      }
    })
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
          if (e.currentTarget.dataset.imgType === 'logo') {
            that.setData({
              club_icon: ''
            })
          } else {
            that.setData({
              club_back_img: ''
            })
          }

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




// //tab框切换 方法二
// selected: function (e) {
//   console.log(e)
//   let that = this
//   let index = e.currentTarget.dataset.index
//   console.log(index)
//   if (index == 0) {
//     that.setData({
//       selected: 0
//     })
//   } else {
//     that.setData({
//       selected: 1
//     })
//   }
// },


// var that = this;
// /** 
//  * 获取系统信息,系统宽高
//  */
// wx.getSystemInfo({
//   success: function (res) {
//     that.setData({
//       winWidth: res.windowWidth,
//       winHeight: res.windowHeight
//     });
//   }
// });
