import LoginBiz from '../common_biz/login'

import {wxGetAddress} from '../api/apis'

const serverLoginInterface = '/wxApi/miniProgram/login'
const refreshTokenInterface = '/login/refreshToken'

var app = getApp();

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

async function getAddr() {
  return new Promise(function(resolve, reject) {
    wx.authorize({
      scope: 'scope.userFuzzyLocation',
      success(res) {
          console.log(res)
          if(res.errMsg == 'authorize:ok'){
              wx.getFuzzyLocation({
                  type: 'wgs84',
                  async success(res) {
                    console.log(res)  //此时里面有经纬度
                    let result = await wxGetAddress(res.longitude, res.latitude);
                    console.log(result);
                    resolve(result.regeocodeData)
                    return;
                  }
              });
          }
      },
      fail(err) {
          console.log(err)   
          reject(error)
          return;
      }                    
    })
  })
}

async function serverLogin(address,city_id) {
    return new Promise(function(resolve, reject) {
      console.log(address);
        wx.login({
            success: res => {
                // 获取到用户的 code 之后：res.code
                console.log("用户的code:" + res.code);

                wx.request({
                    url: app.globalData.serverURL + serverLoginInterface,
                    data: {
                        code: res.code,
                        login_address: address,
                        login_city_id: Number(city_id),
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

async function refreshToken(oldToken) {
  return new Promise(function(resolve, reject) {
          
        wx.request({
            url: app.globalData.serverURL + refreshTokenInterface,
            data: {
              token: oldToken,
            },
            method: 'GET',
  
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
      });
}

module.exports = {
    getFuzzyLocation,
    serverLogin,
    refreshToken,
    getAddr
}
