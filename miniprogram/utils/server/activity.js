import {
  wxGetAddress
} from "../../api/apis";
import LoginBiz from "../../common_biz/login"
import {
  send_request
} from "../request"
import {
  globalCache
} from '../util';


export const createActivityResult = (data) => {
  let params = {
    token: LoginBiz.getToken(),
    result_id: data.result_id,
    activity_id: data.activity_id,
    context: data.context,
    img_urls: data.img_urls,
  }
  return send_request({
    url: "/activity/createActivityResult",
    method: "post",
    data: params
  })
};


export const getActivityResult = (data) => {
  let params = {
    token: LoginBiz.getToken(),
    activity_id: data.activityId,
  }
  return send_request({
    url: "/activity/getActivityResult",
    method: "get",
    data: params
  })
};



export const deleteActivityResult = (data) => {
  let params = {
    token: LoginBiz.getToken(),
    result_id: data.result_id,
  }

  return send_request({
    url: "/activity/deleteActivityResult",
    method: "delete",
    data: params
  })
};
