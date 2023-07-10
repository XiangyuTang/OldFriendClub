import {request} from '../utils/request'
//获取首页导航栏
export function listNav(){
	return request({
		url:"/nav/get",
		method:"POST"
	})
}

//获取活动列表
export function listActivities(data){
	return request({
		url:"/news/get",
		method:"POST",
		data
	})
}