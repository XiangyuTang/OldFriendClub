// pages/club_detail.js

const {
  getClubDetail
} = require("../../utils/server/club");
const {
  noBg
} = require("../../utils/styleCount");
import {
  listActivities2
} from '../../api/apis';
import {
  globalCache
} from '../../utils/util';
import {
  disbandClub,
  getClubActivityFeed,
  leaveClub
} from '../../utils/server/club'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    clubData: null,
    memberList: [],
    clubList: [],
    noBg: noBg,
    showDialog: false,
    dialogTitle: '退出社团',
    buttonText: '退出',
    dialogContent: '是否退出社团?',
    // 0 退出 1 解散
    abilityType: 0,
    scrollviewHeight: 300,
    noMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          scrollviewHeight: res.windowHeight - 310
        })
      }
    });
    this.club_id = options.id;
    getClubDetail({
      clubId: options.id
    }).then((res) => {
      if (!res.data.club_data || res.data.club_data.club_id == '') {
        wx.showToast({
          title: '社团不存在！',
          icon: 'none',
          duration: 800
        })
        return
      }

      this.setData({
        clubData: res.data.club_data,
        memberList: res.data.member_list,
        // clubList: mockData
      });

      if (res.data.club_data && res.data.club_data.club_id != '') {
        this.getActivityList(1);
      }
    })

  },

  getActivityList(pageNo) {
    const {
      clubList,
      noMore
    } = this.data;

    console.log('==>>');
    if (noMore) {
      return;
    }
    getClubActivityFeed({
      clubId: this.club_id,
      pageNo,
    }).then(res => {
      const list = res.data.activity_datas
      this.setData({
        // clubList: [].concat(clubList, res.data.activity_datas),
        clubList: [].concat(clubList, list),
        noMore: list.length < 10 ? true : false,
        isLoading: false,
        pageNo: pageNo
      })
    }).catch(err => {
      console.log("错误信息：", err);
      console.log(err);
    })
  },
  onScrollRefresh() {
    const {
      isLoading,
      pageNo
    } = this.data;
    this.setData({
      isLoading: true
    });
    if (isLoading) {
      return;
    }
    this.getActivityList(pageNo + 1)
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
  onClubMemberClick() {
    console.log('==jump');
    console.log(this.memberList)
    const memberListId = globalCache.add(this.data.memberList);
    wx.navigateTo({
      url: `/pages/member_list/member_list?memberListId=${memberListId}`,
    })
  },
  onClubAbility(e) {
    if (e.currentTarget.dataset.type === 4) {
      this.setData({
        showDialog: true,
        dialogTitle: '解散社团',
        buttonText: '解散',
        dialogContent: '是否确定要解散社团?该操作不可取消',
        abilityType: 1
      })
    } else {
      this.setData({
        showDialog: true,
        dialogTitle: '退出社团',
        buttonText: '退出',
        dialogContent: '是否确定要退出社团?',
        abilityType: 0
      })
    }
  },
  onConfirm() {
    if (this.data.abilityType === 1) {

      disbandClub(this.data.clubData.club_id).then((res) => {
        if (res.err_no === 0) {
          wx.showToast({
            title: '解散成功',
            icon: 'none',
          })
          wx.switchTab({
            url: '../club/club',
          });
        } else {
          wx.showToast({
            title: '解散社团失败',
            icon: 'none',
          })
        }
      })
    } else {
      leaveClub(this.data.clubData.club_id).then((res) => {
        if (res.err_no === 0) {
          wx.showToast({
            title: '退出成功',
            icon: 'none',
          })
          wx.switchTab({
            url: '/pages/club/club',
          })
        } else {
          wx.showToast({
            title: '退出社团失败',
            icon: 'none',
          })
        }
      })
    }
  },
  onClose() {},
  onJumpAct(e) {
    console.log(e.currentTarget.dataset.acid)
    wx.navigateTo({
      url: `/pages/activity_detail/activity_detail?acid=${e.currentTarget.dataset.acid}`,
    })
  }
})
