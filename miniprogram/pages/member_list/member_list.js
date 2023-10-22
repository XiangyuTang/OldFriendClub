// pages/member_list.js
import { globalCache } from '../../utils/util';
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
    memberList: {
      type: Object,
      value: []
    }
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		const member_list = globalCache.get(options.memberListId);
    this.setData({
      memberList: member_list,
    }, () => {
      console.log('==>>club', this.data.memberList)
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