const {
  joinClub
} = require("../../utils/server/club");

// components/double-club-item.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    club: {
      type: Object,
      value: {}
    },
    jumpDetail: {
      type: Function
    },
    itemStyle: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    defaultClubIcon:'/static/images/icons/club.png',
    defaultClubBackImg:'/static/images/navicons/photos.png',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClubItemClick() {
      wx.navigateTo({
        url: '/pages/club_detail/club_detail?id=' + this.data.club.club_id,
      })
    },
    onClubJoin() {
      // const {
      //   refreshList
      // } = this.props;
      console.log(this.properties.club);
      joinClub(this.data.club.club_id).then((res) => {
        if (res.err_no === 0) {
          wx.showToast({
            title: '申请成功',
            icon: 'none',
          });
          this.properties.club.join_status = 1;
          // refreshList()
        } else {
          wx.showToast({
            title: '加入社团失败',
            icon: 'none',
          })
        }
      })
    }
  }
})
