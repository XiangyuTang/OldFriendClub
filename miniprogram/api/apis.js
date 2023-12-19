import LoginBiz from '../common_biz/login'
import { request, send_request } from '../utils/request'
import { getUserLocation } from '../utils/server/club'
//发布活动
/**
 * @param{
 * 	{
				token string // 用户token，必要
				activity_id string // 活动唯一id，非必要，传0表示创建新活动，非0表示更新活动
				location Location // 用户的地点信息
				title string // 活动标题，必要
				cover_image_url string // 活动封面图，非必要，此处为加密后的链接字符串
				content string // 活动文本内容，必要
				image_url []string // 活动内图片，非必要，此处为加密后的链接字符串
				activity_location string // 活动地点，必要
				activity_start_time int64 // 活动开始时间，必要
				activity_end_time int64 // 活动截止时间
				sign_start_time int64 // 报名开始时间
				sign_end_time int64 // 报名截止时间
				sign_max_num int64 // 最大报名人数
		}

		Location
		{
				city_id int // 城市id
				lng string // 经度
				lat string // 纬度
		}
 * } data
*/
export function publishActivity(data) {
	return send_request({
		url: "/activity/createActivity",
		method: "POST",
		data
	})
}

//获取活动详情
/**
 * 
 * @param {{
		token string // 用户token，必要
		activity_id string// 活动id，必要
		}} data 
 */
export function getActivityDetail(data) {
	return send_request({
		url: "/activity/getActivityDetail",
		method: "GET",
		data
	})
}

export function deleteActivity(data) {
  return send_request({
    url: "/activity/userDeleteActivity",
    method: "DELETE",
    data
  })
}

// 报名活动
export function signActivity(data) {
	return send_request({
		url: "/activity/signActivity",
		method: "POST",
		data
	})
}

// 获取报名数据
export function getEnrollData(data) {
	return send_request({
		url: "/activity/getEnrollData",
		method: "GET",
		data
	})
}
//取消报名活动
export function cancelSignActivity(data) {
	return send_request({
		url: "/activity/cancelSignActivity",
		method: "POST",
		data
	})
}

export function getApplicantList(data) {
  return send_request({
    url: "/activity/getApplicantList",
    method: "GET",
    data
  })
}

export function auditApplicant(data) {
  return send_request({
    url: "/activity/auditApplicant",
    method: "POST",
    data
  })
}

//拉取活动数据接口
/**
 * {
				token string // 用户token，必要
				location Location // 用户地点信息
				page_no int // 页码，方便用户翻页，从1开始，非必要
				scene int // 活动类型 0：默认推荐页  1：往期活动页，非必要
				sort_type int// 排序类型，0:按照时间排序，1：按照点赞数排序，非必要
		}
*/
export const listActivities2 = async (data) => {
	return send_request({
		url: "/activity/getActivityFeed",
		method: "GET",
		data: {
      location: await getUserLocation(),
      token: LoginBiz.getToken(),
			...data, 
		}
	})
}

//上传资源接口
/**
 * {
			file string // 文件编码
		}**/
export function uploadMedia(data) {
	return send_request({
		url: "/api/uploadStream",
		method: "POST",
		data
	})
}

const amapFile = require('../utils/amap-wx.130.js') //引入高德地图 ，根据自己放置的文件路径来决定

const AMAPKEY = require('../envList.js').envList[0].AMAPKEY //申请的高德地图API key值

const myAmapFun = new amapFile.AMapWX({
	key: AMAPKEY
}); //创建一个实例化对象
export function wxGetAddress(longitude, latitude) {
	//根据传递进来经纬度进行反解析，调用的是高德给的方法
	return new Promise((resolve, reject) => {
		myAmapFun.getRegeo({
			location: String(longitude + ',' + latitude),//location的格式为'经度,纬度'
			// location: "105.59888,29.38970999",
			success: (res) => {
				resolve(res[0])
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

//获取首页导航栏
export function listNav() {
	return request({
		url: "/nav/get",
		method: "POST"
	})
}

//获取活动列表
export function listActivities(data) {
	return request({
		url: "/news/get",
		method: "POST",
		data
	})
}

// 获取最新的公告
export function getNewestPublicNotice(data) {
	return send_request({
		url: "/public_notice/getNewestPublicNotice",
		method: "GET",
		data
	})
}

// 获取生效的banner
export function getValidBanner(data) {
	return send_request({
		url: "/banner/getValidBanner",
		method: "GET",
		data
	})
}