const host = 'http://124.220.84.200'
const port = '5455'
const code2SessionInterface = '/wxApi/code2Session'

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

async function code2Session() {
    return new Promise(function(resolve, reject) {
        wx.login({
            success: res => {
                // 获取到用户的 code 之后：res.code
                console.log("用户的code:" + res.code);
                wx.request({
                    url: host + ':'+ port + code2SessionInterface,
                    data: {
                        code: res.code
                    },
                    method: 'POST',
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    success: res => {
                        console.log(res.data)
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
    code2Session
}