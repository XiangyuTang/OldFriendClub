// components/public_notice/public_notice.js
import {getNewestPublicNotice} from "../../api/apis"

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	/**
	 * 组件的初始数据
	 */
	data: {
    showNotice: false,
    noticeText:'',
    noticeMode:'closeable',
    noticeJumpUrl : '',
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
    showNotice(){
      var data = {}
      getNewestPublicNotice(data).then(res=>{
        console.log(res);
        if (res.err_no == 0) {
          if (res.data.notice_id != '' && res.data.notice_id != '0') {
            var notice_mode = 'closeable';
            if (res.data.notice_jump_url !='') {
              notice_mode = 'link';
            }
            this.setData({
              showNotice:true,
              noticeText:res.data.notice_text,
              noticeMode: notice_mode,
              noticeJumpUrl: res.data.notice_jump_url,
            })
          }
        } else {
          console.log("获取公告失败"+res.err_no+" "+ res.err_msg);
        }
      }).catch(err=>{
        console.log(err);
      })
    },

    onClickNotice(){
      console.log("点击链接");
      console.log(this.data);
    },

    onCloseNotice(){
      this.setData({
        showNotice:false,
        noticeText:'',
        noticeMode: 'closeable',
        noticeJumpUrl: '',
      })
    },
	}
})
