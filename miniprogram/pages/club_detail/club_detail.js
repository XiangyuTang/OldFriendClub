// pages/club_detail.js

const { getClubDetail } = require("../../utils/server/club");
const { noBg } = require("../../utils/styleCount");
import { listActivities2 } from '../../api/apis';
import { globalCache } from '../../utils/util';
import { disbandClub, leaveClub } from '../../utils/server/club'

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
    abilityType: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		console.log('==>>options', options.id)
		// 1712146870865760256'
		const a = 1712146870865760256;
		console.log('==>a', a);
		getClubDetail({ clubId: options.id }).then((res) => {
			console.log('==>>res`12', res)
			this.setData({
				clubData: res.data.club_data,
				memberList: res.data.member_list,
				// clubList: mockData
			});
		})

		let data = {
			biz_type: 1,
			// location: this.data.location,
			page_no: 0,
			scene: 0,// 0:默认推荐页  1:往期活动页
			sort_type: 0 // 排序类型，0:按照时间排序，1：按照点赞数排序
		};//传参
		console.log("获取活动列表：");
		console.log(data);
		listActivities2(data).then(res => {
			console.log("正确信息：");
			console.log('==res.data.activity_datas',res.data.activity_datas);
			this.setData({
				clubList: res.data.activity_datas
			}, () => {
				console.log('==>>club', this.clubData)
			});
			// if (res.data.activity_datas == null) {
			// 	this.setData({
			// 		isLoading: false,
			// 		finishLoading: true
			// 	})
			// 	return;
			// }
			// res.data.activity_datas.forEach(item => {
			// 	item.max_sign_num = formatNum(item.max_sign_num)
			// 	item.sign_start_time = formatTime(item.sign_start_time * 1000, 5)
			// })
			// let old_list = this.data.activatiesArr;
			// let new_list = old_list.concat(res.data.activity_datas);
			// console.log("new_list:", new_list);
			// wx.stopPullDownRefresh();
			// this.setData({
			// 	activatiesArr: new_list,
			// 	isLoading: false,
			// })
			// if (res.data.activity_datas.length < 10) {
			// 	console.log("没有更多了");
			// 	this.setData({
			// 		finishLoading: true
			// 	})
			// }
		}).catch(err => {
			console.log("错误信息：");
			console.log(err);
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
    console.log('==>>this', this)
    if (this.data.abilityType === 1) {
      disbandClub(this.data.clubData.club_id).then((res) => {
        if (res.err_no === 0) {
          wx.showToast({
            title: '解散成功',
            icon: 'none',
          })
          wx.navigateTo({
            url: '/pages/club/club',
          })
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
          wx.navigateTo({
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
  onClose() {
  },
  onJumpAct(e) {
    console.log(e.currentTarget.dataset.acid)
    wx.navigateTo({
      url: `/pages/activity_detail/activity_detail?acid=${e.currentTarget.dataset.acid}`,
    })
  }
})
