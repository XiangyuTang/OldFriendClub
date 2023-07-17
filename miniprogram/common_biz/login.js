/**
 * Notes: 注册登录模块业务逻辑
 */

const utilsCache = require('../utils/cache')
const utilsCommon = require('../utils/common')
const serverBiz = require('./server')
const constants = require('./constants')

class LoginBiz {
    // 静默登录(有登录状态则不登录)  
    static async loginSilence(that) {
        return await LoginBiz.loginCheck(that);
    }

    // 获取token
    static getToken() {
        let token = utilsCache.get(constants.CACHE_TOKEN);
        return token || null;
    }

    // 设置token
    static setToken(token) {
        if (!token) return;
        utilsCache.set(constants.CACHE_TOKEN, token, constants.CACHE_TOKEN_EXPIRE);
    }

    // 是否登录 
    static isLogin() {
        let token = LoginBiz.getToken();
        return (token.length > 0) ? true : false;
    }

    // 登录判断及处理
    static async loginCheck(that = null) {
        let token = utilsCache.get(constants.CACHE_TOKEN)
        if (token) {
            if (that)
                that.setData({
                    isLogin: true
                });
            return true;
        } else {
            if (that) that.setData({
                isLogin: false
            });
        }

        let res = await serverBiz.serverLogin().then(result => {
            LoginBiz.clearToken();
            if (result && utilsCommon.isDefined(result.data) && result.data &&
                utilsCommon.isDefined(result.data.token) && result.data.token) {
                LoginBiz.setToken(result.data.token);
                if (that) that.setData({
                    isLogin: true
                });
                return true;
            }
        }).catch(err => {
            console.log(err);
            LoginBiz.clearToken();
            return false;
        });
        return res;
    }

    // 清除登录缓存
    static clearToken() {
        utilsCache.remove(constants.CACHE_TOKEN)
    }
}

module.exports = LoginBiz;