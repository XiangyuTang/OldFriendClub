// pages/club_detail.js

const {
  getClubDetail,
  joinClub
} = require("../../utils/server/club");
const {
  noBg
} = require("../../utils/styleCount");
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js');
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
    noMore: false,
    isCreator: false,

    showActionSheet: false,
    actionsConfig:[
      {
        name:'编辑社团',
        color:'#000000',
      },
      {
        name:'解散社团',
        color:'#ee0a24',
      },
      {
        name:'退出社团',
        color:'#ee0a24',
      },
    ],
    showAction: [],

    defaultClubIcon:'../../static/images/icons/club.png',
    defaultClubBackImg:'../../static/images/navicons/photos.png',
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
    this.getClubDetailData(options.id);

    this.publish_club = this.selectComponent('#publish-club');
    console.log(this.publish_club.data);
    this.publish_club.hideButton(true);

    // 注册通知
    WxNotificationCenter.addNotification('refreshClubDetail', this.didRefreshNotification, this);
    // 注册通知
    WxNotificationCenter.addNotification('refreshClubActivity', this.didRefreshActivityNotification, this);
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
    //移除通知
    WxNotificationCenter.removeNotification('refreshClubActivity', this)
    //移除通知
		WxNotificationCenter.removeNotification('refreshClubDetail', this)
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
    console.log(this.data.memberList)
    const memberListId = globalCache.add(this.data.memberList);
    var isCreator = this.data.isCreator;
    var clubId = this.data.clubData.club_id;
    wx.navigateTo({
      url: `/pages/member_list/member_list?memberListId=${memberListId}&isCreator=${isCreator}&clubId=${clubId}`,
    })
  },
  onClubAbility(action) {
    if (action === 1) {
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

  onShowActionSheet(){
    console.log("show action sheet");
    this.setData({
      showActionSheet: true,
    })

    var actionList = [];
    if (this.data.clubData.join_status == 4) {
      actionList.push(this.data.actionsConfig[0]);
      actionList.push(this.data.actionsConfig[1]);
    } else {
      actionList.push(this.data.actionsConfig[2]);
    }

    console.log(actionList);

    this.setData({
      showAction: actionList,
    })

    console.log(this.data);
  },

  onCloseActionSheet(e){
    console.log("close sheet");
    console.log(e);

    this.setData({
      showActionSheet: false,
    })
  },

  onSelectActionSheet(e){
    console.log("select sheet");
    console.log(e);

    if (e.detail.name == '编辑社团') {
      this.onEditClub();
    } else if (e.detail.name == '解散社团') {
      this.onClubAbility(1);
    } else if (e.detail.name == '退出社团') {
      this.onClubAbility(2);
    }
  },


  onClubJoin(e) {
    // const {
    //   refreshList
    // } = this.props;
    console.log(e);
    joinClub(this.data.clubData.club_id).then((res) => {
      if (res.err_no === 0) {
        wx.showToast({
          title: '申请成功',
          icon: 'none',
        });
        var newClubData = this.data.clubData;
        newClubData.join_status = 1;
        this.setData({
          clubData : newClubData,
        });
        // refreshList()
      } else {
        wx.showToast({
          title: '加入社团失败',
          icon: 'none',
        })
      }
    })
  },

  getClubDetailData(clubId) {
    getClubDetail({
      clubId: clubId
    }).then((res) => {
      if (!res.data.club_data || res.data.club_data.club_id == '') {
        wx.showToast({
          title: '社团不存在！',
          icon: 'none',
          duration: 800
        })
        return
      }

      console.log(res);
      this.setData({
        clubData: res.data.club_data,
        memberList: res.data.member_list,
        // clubList: mockData
      });

      if (res.data.club_data.join_status == 4){
        this.setData({
          isCreator: true,
        })
      }

      if (res.data.club_data && res.data.club_data.club_id != '') {
        this.getActivityList(1);
      };
    })
  },

  onConfirm() {
    if (this.data.abilityType === 1) {

      disbandClub(this.data.clubData.club_id).then((res) => {
        if (res.err_no === 0) {
          wx.showToast({
            title: '解散成功',
            icon: 'none',
          });

          wx.switchTab({
            url: '../club/club',
          });
           // 向社团详情页发布通知重新刷新
           WxNotificationCenter.postNotificationName('refreshClubList');
        } else {
          wx.showToast({
            title: '解散社团失败',
            icon: 'none',
          });

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

           // 向社团详情页发布通知重新刷新
           WxNotificationCenter.postNotificationName('refreshClubList');
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
  },

  onEditClub(){
    console.log("编辑社团");
    if (this.data.clubData.audit_status===0 || this.data.clubData.audit_status===1) {
      wx.showToast({
        title: '社团审核中，无法编辑',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.publish_club.onClickEdit(this.data.clubData);
  },

  didRefreshActivityNotification: function (clubID) {
    console.log("收到刷新通知"+clubID);
    this.setData({
      clubList: [],
      noMore: false,
    })
    this.getActivityList(1);
  },
  
  didRefreshNotification: function (clubID) {
    console.log("收到刷新通知"+clubID);
    this.setData({
      showActionSheet: false,
    })
    this.getClubDetailData(clubID);
	},
})
