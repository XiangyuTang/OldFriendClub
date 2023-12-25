// custome-tab-bar/index.js
Component({
  options: {
    styleIsolation: 'shared',
  },

	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	/**
	 * 组件的初始数据
	 */
	data: {
    active: 0,
    "list": [
			{
				"pagePath": "/pages/home/home",
				"text": "活动广场",
				"iconPath": "/static/images/icons/park.png",
				"selectedIconPath": "/static/images/icons/park_fill.png"
			},
			{
				"pagePath": "/pages/club/club",
				"text": "活力社团",
				"iconPath": "/static/images/icons/club.png",
				"selectedIconPath": "/static/images/icons/club_fill.png"
      },
			{
				"pagePath": "/pages/earns/earns",
				"text": "周边优惠",
				"iconPath": "/static/images/icons/money.png",
				"selectedIconPath": "/static/images/icons/money_fill.png"
			},
			{
				"pagePath": "/pages/mine/mine",
				"text": "个人中心",
				"iconPath": "/static/images/icons/user.png",
				"selectedIconPath": "/static/images/icons/user_fill.png"
			}
		]
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
    onChange(event) {
      this.setData({ active: event.detail });
      wx.switchTab({
        url: this.data.list[event.detail].pagePath,
      })
    }

	}
})