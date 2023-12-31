const testURL = 'https://tea.qingnian8.com'; //公共请求API

// export const serverURL = 'http://124.220.84.200:5455' //聚荟后端API
// export const serverURL = 'https://miniprogram.mirthdata.com' //聚荟后端API

var app = getApp()

export function request(params) {

  let dataObj = params.data || {};
  let headerObj = {
    'content-type': 'application/json'
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: testURL + params.url,
      method: params.method || "GET",
      data: dataObj,
      header: headerObj,
      success: res => {

        if (res.data.errCode != 0) {
          reject(res.data);
          wx.showToast({
            title: res.data.errMsg,
            mask: true,
            icon: "error"
          })
          return;
        }
        resolve(res.data)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}

export function send_request(params) {
  let dataObj = params.data || {};
  let headerObj = {
    'content-type': 'application/json'
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.serverURL + params.url,
      method: params.method || "GET",
      data: dataObj,
      header: headerObj,
      success: res => {
        console.log("后端请求响应成功");
        resolve(res.data)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}
