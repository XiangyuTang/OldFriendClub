const LoginBiz = require('../../common_biz/login.js')
import {formatTime} from "../../utils/common.js"
import {getActivatyDetail} from "../../api/apis"
let that = null
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		activity: {},
		like_num:0,
		signed_num:0,
    form: {
      show: false
		},
		sign_form:[
			{
				des:"用于报名页展示",
				id: "avatar",
				prop:"头像",
				type:"avatar"
			},{
				des:"输入真实姓名",
				id: "name",
				prop:"姓名",
				type:"text"
			},{
				id:"gender",
				prop:"性别",
				selects:["男","女"],
				type:"select"
			},{
				id:"age",
				prop:"年龄",
				type:"number",
				unit:"岁"
			},{
				id:"tel",
				prop:"手机号",
				type:"number" //type=phone时面向非个体开发者，且调用收费
			}
		],
		sign_due:[],
		user: {
			open: 0
		}
	},
	openLocation (e) {
    const {
			info,
			addr
		} = e.currentTarget.dataset
		console.log(e);
		//测试
		info.lat = "29.369709999999998"
		info.lng = "105.59088"
    wx.openLocation({
			latitude:parseFloat(info.lat),
			longitude:parseFloat(info.lng),
			address:addr,
      scale: 15
    })
  },
	tosignlist () {
    // wx.navigateTo({
    //   url: '../list/list'//报名列表页
    // })
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
	startsign () {
    that.setData({
      'form.show': true
    })
	},
	async submitsign (e) {
    const { input, project } = that.data
    if (e.detail?.item?.value === 1) {
      for (const item of project.form) {
        if (item.option !== true && (input[item.id] == null || input[item.id] == '')) {
          showModal(`【${item.prop}】要求必须填写，请补充后重新提交`, '提示')
          return false
        }
      }
      wx.showLoading({ title: '提交中' })
			const submitres = await app.call({ name: 'add_sign', data: { id: project._id, input } })
			wx.hideLoading()
			if(submitres.code === 0){
				await that.init()
			} else {
				showModal(submitres.msg||'系统出现问题，请稍后再试','安全提示',{
					showCancel: true,
					confirmText: '重新编辑'
				}).then(flag=>{
					if (flag) {
						that.setData({
							'form.show': true
						})
					}
				})
			}
    } else if (e.detail?.item?.value === 2) {
      const flag = await showModal('是否取消报名，取消后需要重新填写审核', '确认操作', {
        showCancel: true
      })
      if (flag) {
        wx.showLoading({ title: '取消中' })
        await app.call({ name: 'del_sign', data: { id: project._id } })
        await that.init()
        wx.hideLoading()
      } else {
        return
      }
    }
    that.setData({
      'form.show': false
    })
  },
  closesign () {
    that.setData({
      'form.show': false
    })
  },
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		that = this // 页面this指向指针变量
		const acid= options.acid;
		console.log(acid);
		let data = {
			token:LoginBiz.getToken(),
			activity_id:acid,
			biz_type: 1
		}
		wx.showLoading({
			title: '加载中',
		})
		getActivatyDetail(data).then(res=>{
			wx.hideLoading()
			console.log(res);
			// res.data.activity_data.forEach(item=>{
			// 	item.activity_start_time = formatTime(item.activity_start_time,2)
			// 	item.activity_end_time = formatTime(item.activity_end_time,2)
			// 	item.sign_start_time = formatTime(item.sign_start_time,2)
			// 	item.sigh_end_time = formatTime(item.sigh_end_time,2)
			// })
			var item = res.data.activity_data
			res.data.activity_data.activity_start_time = formatTime(item.activity_start_time,2)
			res.data.activity_data.activity_end_time = formatTime(item.activity_end_time,2)
			res.data.activity_data.sign_start_time = formatTime(item.sign_start_time,3)
			res.data.activity_data.sigh_end_time = formatTime(item.sigh_end_time,3)
			that.setData({
				activity:res.data.activity_data,
				like_num:res.data.like_num,
				signed_num:res.data.signed_num,
				sign_due:[res.data.activity_data.sign_start_time,res.data.activity_data.sigh_end_time]
			})
		}).catch(err=>{
			console.log("出错了");
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