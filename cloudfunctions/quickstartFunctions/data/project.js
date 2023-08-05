module.exports = {
  initinfo: {
		style: { // 页面主题
			signButtonColor:'#ed7a1b',
      backgroudColor: '#ed7a1b', // 标题栏背景颜色，按钮背景颜色
      frontColor: '#ed7a1b' // 标题栏文字颜色，按钮文字颜色
    },
    // 报名页头图链接
    topimg: 'https://ts1.cn.mm.bing.net/th/id/R-C.889e0c629c5bf87201711cb55b2a4079?rik=VTHn8wOE8%2bqKQg&riu=http%3a%2f%2fimg1.gtimg.com%2fhealth%2fpics%2fhv1%2f242%2f27%2f2244%2f145923227.jpg&ehk=ivAnIdpdXEIts9pl0bOHW6EcAULElWZNvhvqtz5IQJk%3d&risl=&pid=ImgRaw&r=0',
    // 活动标题
    title: '老年体验局｜户外趣味广场舞运动',
    // 活动文字简单描述
    des: '本活动为新手入门级别，主要是适应广场舞运动。报名之后需要审核，审核通过后会电话联系你加群，如果人满了则会显示拒绝，感谢理解～',
    // 活动位置，可通过 https://lbs.qq.com/getPoint/ 换取
    position: {
      latitude: 23.100116, // 地图定位标准纬度
      longitude: 113.324592, // 地图定位标准经度
      address: '广东省广州市海珠区TiT创意园' // 地图展示的地理名字
    },
    // 活动开始时间-结束时间
    activity_due: ['2023年7月2日 9:00', '2023年7月10日 11:00'],
    // 报名开始时间-结束时间
    signup_due: ['2023年7月2日 00:00', '2023年7月10日 23:59'],
    // 报名限制人数
    people_number: 100,
    // 活动详细图文信息，共支持两种形式，text(文字)、image(图片)
    content: [{
      type: 'image',
      value: 'https://qcloudimg.tencent-cloud.cn/raw/6efe22e7a7c38d2e961b2451e2491687.jpeg'
    }, {
      type: 'text',
      value: '极限广场舞是一项紧张激烈的运动，是三种运动的结合，它有唱、跳、Rap、篮球的得分，具有很强的娱乐感和趣味性，结合唱、跳、Rap、篮球等技巧，可以两人练习，也可以团队竞技，玩起来非常能燃烧你的卡路里。是一项融聚了许多运动特点的户外运动。'
    }, {
      type: 'text',
      value: '约小伙伴们户外一波走起！\n\n在草地上奔跑、跳跃，与队友一起唱、跳、Rap、篮球……\n\n来一个周末社区广场舞活动大招募吧'
    }, {
      type: 'image',
      value: 'https://qcloudimg.tencent-cloud.cn/raw/cb10d8258ca9cfe56e715621c21220a0.jpeg'
    }, {
      type: 'image',
      value: 'https://qcloudimg.tencent-cloud.cn/raw/3c6586904b7342ff44f0d0e8e4870ebe.jpeg'
    }, {
      type: 'text',
      value: '活动要求：新手初级进阶，趣味运动，热爱运动，乐观开放包容（禁止强烈对抗）'
    }, {
      type: 'text',
      value: '让队友对生活多几份热度是我们理念，追求新事物，让彼此生活更出彩。'
    }, {
      type: 'image',
      value: 'https://qcloudimg.tencent-cloud.cn/raw/88a94a4da8351d9372ecdefd18ad7a91.jpeg'
    }],
    // 活动报名表单，类型支持 text（文字）、select（选择）、number（数字）、phone（真实手机号）
    form: [{
      id: 'avatar',
      prop: '头像',
      des: '用于报名页展示',
      type: 'avatar'
    }, {
      id: 'nickname',
      prop: '昵称',
      des: '用于报名页展示',
      type: 'nickname'
    }, {
      id: 'name',
      prop: '姓名',
      des: '必须是真实姓名',
      type: 'text'
    }, {
      id: 'gender',
      prop: '性别',
      type: 'select',
      selects: ['男', '女']
    }, {
      id: 'age',
      prop: '年龄',
      type: 'number',
      unit: '岁'
    }, {
      id: 'tel',
      prop: '手机号',
      type: 'number' // type: 'phone' 但是个体户没有权限
    }, {
      id: 'email',
      prop: '邮箱',
      type: 'text'
    }],
    // 报名列表页展示的信息
    signlist: {
      img: 'avatar', // 图片展示内容，同form
      text: 'nickname' // 文字展示内容，同form
    }
  }
}
