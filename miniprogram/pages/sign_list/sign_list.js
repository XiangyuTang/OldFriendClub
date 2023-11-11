import {getApplicantList, auditApplicant} from "../../api/apis"


const app = getApp() // 全局APP
const LoginBiz = require('../../common_biz/login.js')

let that = null // 页面this指针
Page({
  data: {
    info: {
      show: false
    },
    applicantList: [],
    activityId: "",
    currentPage: 1,
    noMoreData: false,
    isLoading: false,
    loadingFlag: false,
    signStatus: "0",
  },
  onChange(event) {
    this.setData({
      result: event.detail
    });
  },

  toggle(event) {
    const { index } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkboxes-${index}`);
    checkbox.toggle();
  },
  noop() {

  },
  onLoad (option) {
    console.log("获得报名者列表");
    console.log(option);
    that = this
    this.setData({
      list: [],
      activityId: option.activity_id,
      currentPage: 1,
      noMoreData: false,
      signStatus: option.sign_status,
    })
    // that.project = app.project
    // const stylecss = app.pagestyleinit(that.project)
    // that.setData({
    //   project: that.project,
    //   stylecss
    // })
    // wx.startPullDownRefresh()
    this.init(1);
  },

  onScrollRefresh: function () {
    if (this.data.noMoreData) {
      // 没有更多了
      return;
    }
    if (this.data.loadingFlag) {
      return;
    }
    this.init(this.data.currentPage)
  },
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
  onPullDownRefresh () {
    this.setData({
      applicantList: [],
      currentPage: 1,
      noMoreData: false,
      isLoading: false,
      loadingFlag: false,
    })
    this.init(this.data.currentPage);
  },

  	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {
    this.onScrollRefresh()
	},

  async init (pageNo) {
    wx.showLoading();
    // const { list, admin } = await app.call({ name: 'get_signlist', data: { id: that.project._id } })
    let oldApplicantList = this.data.applicantList;

    let data = {
			token:LoginBiz.getToken(),
      activity_id:this.data.activityId,
      page_no: pageNo,
		}

    getApplicantList(data).then(res=>{

      console.log("报名者列表详情")
      console.log(res);
      var list = res.data.applicant_list

      if (list.length < 10) {
        // 没有更多了
        this.setData({
          isNoMore: true
        })
      }

      // let tempList = [];
      // for (var i = 0; i< list.length; i++) {
      //   if (list[i].applicant_status != 4) {
      //     // 不是创建者
      //     tempList.push(list[i]);
      //   }
      // }

      for (var i in list) {
        if (list[i].applicant_status == 4) {
          list[i].display_name = "活动创建者";
        } else {
          list[i].display_name = "报名用户："+list[i].applicant_sign_name;
        }
      }

      const completeList = (pageNo === 1 ? [] : oldApplicantList).concat(list);
      this.setData({
        applicantList: completeList,
        isLoading: false,
        loadingFlag: false,
        currentPage: pageNo + 1
      })

      console.log("报名者");
      console.log(this.data.applicantList);

		}).catch(err=>{
			console.log("出错了");
      console.log(err);
      wx.showToast({
        title: '获取报名者列表失败，请稍后重试',
        icon: 'none',
      })
    })

    wx.hideLoading()
  },

  auditApplicant(uid,index,audit_status) {
    let data = {
      token:LoginBiz.getToken(),
      biz_type: 1,
      activity_id:this.data.activityId,
      applicant_uid: uid,
      audit_status: audit_status,
    }
    
    auditApplicant(data).then(res=>{
      console.log("审核报名详情")
      console.log(res);

      var applicantData = this.data.applicantList
      for (let i in applicantData) {
        if (i == index) {
          applicantData[i].applicant_status = audit_status;
        }
      }

      this.setData({
        applicantList: applicantData,
      })

		}).catch(err=>{
			console.log("出错了");
			console.log(err);
    })
  },

  refuseSign(e){
    console.log("拒绝申请");
    console.log(e);
    console.log(e.currentTarget.dataset.uid);
    this.auditApplicant(e.currentTarget.dataset.uid, e.currentTarget.dataset.index, 3) // 3为拒绝报名
  },

  agreeSign(e){
    console.log("同意申请");
    console.log(e.currentTarget.dataset.uid);
    this.auditApplicant(e.currentTarget.dataset.uid, e.currentTarget.dataset.index,2) // 2为通过报名
  },

  toDetail (e) {
    const list = ['查看信息', '设为审核中', '通过报名', '拒绝报名']
    const { info, openid } = e.currentTarget.dataset
    list.splice(info.open, 1)
    console.log(list)
    wx.showActionSheet({
      itemList: list,
      async success (res) {
        if (list[res.tapIndex] === '查看信息') {
          that.setData({
            info: {
              show: true,
              data: info.info
            }
          })
        } else {
          wx.showLoading({ title: '处理中' })
          await app.call({
            name: 'set_signstatus',
            data: {
              id: that.project._id,
              openid: openid,
              status: ['-', '设为审核中', '通过报名', '拒绝报名'].indexOf(list[res.tapIndex])
            }
          })
          that.init()
        }
      }
    })
  }
})
