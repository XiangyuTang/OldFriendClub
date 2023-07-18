// components/myfooter/myfooter.js
import {formatTime} from "../../utils/common.js"
let choose_date_idx = ""
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		minDate:{
			type:Number,
			value:{}
		},
		maxDate:{
			type:Number,
			value:{}
		},
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		year:new Date().getFullYear(),
		showPublishActivatyWindow:false,
		registrationTime: "",
		unregistrationTime: "",
		beginTime:"",
		endTime:"",
		showPicker: false,
		minDate: "",
		maxDate: "",
		choose_date_idx : ""
	},
	
	/**
	 * 组件的方法列表
	 */
	methods: {
		
		onClickIcon(){
			wx.showToast({
				title: '标题尽量控制在25字内！',
				icon: 'none',
			})
		},
		onclickPublish(){
			this.setData({
				showPublishActivatyWindow:true
			})
		},
		getUserInfo(event) {
			console.log(event.detail);
		},
		onClose() {
			this.setData({ close: false });
		},
		onConfirm(event) {
			console.log("onConfirm");
			console.log(event);
			this.setData({
				showPicker:false,
			})
			var date = event.detail;
			console.log(date);
			let choosedate = formatTime(date,1)
			//把格式化后的日期赋值给registrationTime，就会显示到页面
			if (choose_date_idx==0) {
				console.log("进入0");
				this.setData({ registrationTime:choosedate})
			}else if(choose_date_idx==1){
				console.log("进入1");
				this.setData({ unregistrationTime:choosedate})
			}else if(choose_date_idx==2){
				console.log("进入2");
				this.setData({ beginTime:choosedate})
			}else{
				console.log("进入3");
				this.setData({ endTime:choosedate})
			}
			this.setData({ choose_date_idx:""})
    },
    onCancel() {
			console.log("onCancel");
			this.setData({
				showPicker:false,
				currentDate:new Date(),
				choose_date_idx:""
			})
    },
    choseTime(event) {
			console.log("choseTime");
			console.log(event);
			console.log(event.currentTarget.dataset.idx);
			choose_date_idx = event.currentTarget.dataset.idx
			this.setData({
				minDate:new Date(),
				maxDate:new Date(2033, 12, 31),
				showPicker:true
			})
			console.log(this.data.minDate+"||"+this.data.maxDate);
			console.log("choose_date_idx:",choose_date_idx);
    }
		
	
	}
})
