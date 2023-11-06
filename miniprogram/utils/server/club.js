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

// 获取location
const getFuzzy = () => new Promise((resolve, reject) => {
  wx.getFuzzyLocation({
    type: 'wgs84',
    async success(res) {
      let result = await wxGetAddress(res.longitude, res.latitude);
      const loc = {
        city_id: Number(result.regeocodeData.addressComponent.adcode),
        lng: String(res.longitude),
        lat: String(res.latitude)
      }
      globalCache.set('user-location', loc);
      resolve(loc)
    },
    async fail(err) {
      reject(err)
    }
  });
});

export const getUserLocation = async () => {
  const loc = globalCache.get('user-location')
  if (loc) {
    return loc;
  } else {
    return getFuzzy()
  }
};

export const joinClub = (clubId) => {
  let params = {
    token: LoginBiz.getToken(),
    club_id: clubId
  }
  return send_request({
    url: "/club/joinClub",
    method: "post",
    data: params
  })
}
export const disbandClub = (clubId) => {
  let params = {
    token: LoginBiz.getToken(),
    club_id: clubId
  }
  return send_request({
    url: "/club/disbandClub",
    method: "post",
    data: params
  })
}

export const leaveClub = (clubId) => {
  let params = {
    token: LoginBiz.getToken(),
    club_id: clubId
  }
  return send_request({
    url: "/club/leaveClub",
    method: "post",
    data: params
  })
}

export const getClubActivityFeed = ({
  clubId,
  pageNo
}) => {
  let params = {
    token: LoginBiz.getToken(),
    club_id: clubId,
    page_size: 10,
    page_no: pageNo,
  }
  return send_request({
    url: "/club/getClubActivityFeed",
    method: "get",
    data: params
  })
}


export const getUser = () => {
  let params = {
    token: LoginBiz.getToken()
  }
  return send_request({
    url: "/user/getUserData",
    method: "post",
    data: params
  })
}

export const editUser = (data) => {
  let params = {
    token: LoginBiz.getToken(),
    ...data
  }
  return send_request({
    url: "/user/setUserData",
    method: "post",
    data: params
  })
}

export const getClubList = async (data) => {
  let params = {
    token: LoginBiz.getToken(),
    page_size: 10,
    sort_type: 0,
    location: await getUserLocation(),
    ...data
  }
  return send_request({
    url: "/club/getClubList",
    method: "get",
    data: params
  })
}

export const createClub = async (data) => {
  let params = {
    token: LoginBiz.getToken(),
    club_id: '0',
    location: await getUserLocation(),
    ...data
  }
  return send_request({
    url: "/club/createClub",
    method: "POST",
    data: params
  })
}

export const getClubDetail = ({
  clubId
}) => {
  let params = {
    token: LoginBiz.getToken(),
    club_id: clubId,
  }
  return send_request({
    url: "/club/getClubDetail",
    method: "get",
    data: params
  })
}
