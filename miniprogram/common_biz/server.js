// const host = 'http://124.220.84.200'
const host = 'http://124.220.84.200:5455';
// const host = "http://www.mirthdata.com"
const port = '5455'
const serverLoginInterface = '/wxApi/miniProgram/login'

function getFuzzyLocation() {
    wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success () {
                wx.getFuzzyLocation({
                    type: 'wgs84',
                    success (res) {
                        return res.latitude, res.longitude
                    }
                })
              }
            })
          }
        }
    })
}

async function serverLogin() {
    return new Promise(function(resolve, reject) {
        wx.login({
            success: res => {
                // 获取到用户的 code 之后：res.code
                console.log("用户的code:" + res.code);
                wx.request({
                    url: host + ':'+ port + serverLoginInterface,
                    data: {
                        code: res.code
                    },
                    method: 'POST',
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    success: res => {
                        if (res.data.err_no == 0) {
                            resolve(res.data)
                            return;
                        } else {
                            reject(res.data)
                            return;
                        }
                    },
                    fail: error => {
                        reject(error)
                        return;
                    }
                })
            },
            fail: error => {
                reject(error)
                return;
            }
        });
    })
}

module.exports = {
    getFuzzyLocation,
    serverLogin
}
