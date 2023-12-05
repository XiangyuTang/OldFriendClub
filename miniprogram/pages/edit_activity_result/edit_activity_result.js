// pages/edit_activity_result/edit_activity_result.js
import LoginBiz from "../../common_biz/login"

import {createActivityResult, getActivityResult} from "../../utils/server/activity"

const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
    maxWord: 300, // 字数限制
    currentWord: 0,
    resultText:'',
    activityId: '',
    editResultId:'',
    signStatus:'',
    imgList:[],
    decodeImgList: [],
    showActionSheet: false,
    actions:[
      {
        name:'确认发布'
      }
    ],
	},

  onSelectActionSheet(event){
    console.log(event.detail);
    if (this.data.resultText.length > this.data.maxWord) {
      wx.showLoading({
        title: '字数太多！',
        icon: 'none',
        duration:2000
      })

      return 
    }

    if (this.data.imgList.length > 20) {
      wx.showLoading({
        title: '图片数量太多！',
        icon: 'none',
        duration:2000
      })

      return
    }

    if (event.detail.name == '确认发布') {
      wx.showLoading({
        title: '发布中',
      });

      let data = {
        result_id:   this.data.editResultId,
        activity_id: this.data.activityId,
        context : this.data.resultText,
        img_urls: this.data.decodeImgList,
      }

      console.log(data);

      createActivityResult(data).then(res=>{
        console.log(res);
        if (res.err_no == 0) {
          wx.hideLoading()
          wx.showToast({
            title: "成果发布成功！",
            icon: "success",
            duration:2000,
          });
          
          if (this.data.activityId != '' && this.data.activityId != '0') {
            // 向成果详情页发布通知重新刷新
            WxNotificationCenter.postNotificationName('refreshActivityResult',this.data.activityId);
          } 

          wx.navigateBack();

        } else {
          console.log(res.err_no+" "+ res.err_msg);
          wx.hideLoading();
          wx.showToast({
            title: "成果发布失败，请稍后重试",
            icon: "none",
            duration:2000,
          });
        }
      }).catch(err=>{
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          title: "成果发布失败，请稍后重试",
          icon: "none",
        });
      })
    }
  },

  onCloseActionSheet(){
    this.setData({
      showActionSheet: false,
    })
  },

  uploadImg(fileUrl) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: 'https://www.mirthdata.com/api/uploadStream',
        // url: 'http://124.220.84.200:5455/api/uploadStream',
        filePath: fileUrl,
        name: "file",
        header: {
          "content-type": "multipart/form-data"
        },
        formData: {
          token: LoginBiz.getToken(), // 用户token
          biz_type: 1, // 业务线  1：普通活动，必要
        },
    
        success(res) {
          if (res.statusCode == 200) {
            var jsonObj = JSON.parse(res.data);
            console.log(res);
            if (jsonObj.err_no == 0) {
              // 上传完成需要更新 fileList
              console.log("上传成功")

              resolve({
                data: jsonObj.data.file_download_http,
              })
             
            } else{
              wx.showToast({
                title: '图片上传失败！',
                icon: 'error',
                duration: 2000
              })

              reject(jsonObj.err_msg);
            }
          } else {
            wx.showToast({
              title: '图片上传失败！',
              icon: 'error',
              duration: 2000
            })

            reject(res.statusCode);
          }
        },
  
        fail: function (err) {
          wx.showToast({
            title: '图片上传失败！',
            icon: 'error',
            duration: 2000
          })
    
          reject(err);
          console.log(err);
        },
      });
    })
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
    console.log(options);

    var edit_result_id ='';
    if (options.edit_result_id && options.edit_result_id !='' &&options.edit_result_id !='0'){
      edit_result_id = options.edit_result_id
    }

    this.setData({
      resultText:'',
      activityId: options.activity_id,
      signStatus: options.sign_status,
      imgList:[],
      decodeImgList: [],
      showActionSheet: false,
      editResultId:edit_result_id,
    });

    if (options.edit_result_id && options.edit_result_id !='' &&options.edit_result_id !='0'){
      let data = {
        activityId: options.activity_id,
      }

      wx.showLoading({
        title: '读取成果内容中',
      })

      getActivityResult(data).then(res => {
        wx.hideLoading();
        if (res.err_no == 0) {
          var resultData = res.data.activity_result;
          if (resultData.result_id != '' && resultData.result_id != '0') {
            var resultImgList = [];
            var decodeImgList = [];
            for (var i in resultData.img_urls) {
              resultImgList.push({
                url:  resultData.img_urls[i],
                name:'',
                isImage: true,
              })
              decodeImgList.push(resultData.img_urls[i]);
            }
            this.setData({
              resultText:resultData.context,
              imgList:resultImgList,
              decodeImgList: decodeImgList,
            })
          }
        } else {
          wx.showToast({
            title: '读取成果内容失败，请稍后重试',
            icon: '',
            duration: 2000
          });
  
          console.log(err);
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '读取成果内容失败，请稍后重试',
          icon: '',
          duration: 2000
        });

        console.log(err);
      })
    }

    console.log(this.data);
	},

  imgOverSize(e) {
    wx.showToast({
      title: '图片太大！',
      icon: "error",
      duration: 2000
    })
    return
  },

  async afterReadImg(e){
    console.log("上传图片");
    console.log(e);

    const file = e.detail.file;
    var that = this;

    var oldImgs = that.data.imgList;
    var oldDecodeImgs = that.data.decodeImgList

    for (var i =0 ; i < file.length; i++) {
      oldImgs.push({
        url: file[i].url,
        name:"",
        isImage: true,
        status: 'uploading',
        message: '上传中',
      });
      oldDecodeImgs.push('');

      that.setData({
        imgList: oldImgs,
        decodeImgList: oldDecodeImgs,
      })
  
      console.log(that.data);

      var decodeUrl = await this.uploadImg(file[i].url).catch(error => {
        console.log(error)

        oldImgs.pop();
        oldDecodeImgs.pop();

        oldImgs.push({
          url: file[i].url,
          name:"",
          isImage: true,
          status: 'failed',
          message: '上传失败',
        });
        oldDecodeImgs.push('');

        that.setData({
          imgList: oldImgs,
          decodeImgList: oldDecodeImgs,
        })

        console.log(that.data);
      });
      if (decodeUrl == '') {
        oldImgs.pop();
        oldDecodeImgs.pop();

        oldImgs.push({
          url: file[i].url,
          name:"",
          isImage: true,
          status: 'failed',
          message: '上传失败',
        });
        oldDecodeImgs.push('');

        that.setData({
          imgList: oldImgs,
          decodeImgList: oldDecodeImgs,
        })

        console.log(that.data);
      } else {
        oldImgs.pop();
        oldDecodeImgs.pop();

        oldImgs.push({
          url: file[i].url,
          name:"",
          isImage: true,
          status: 'done',
          message: '上传成功',
        });
        oldDecodeImgs.push(decodeUrl.data);

        that.setData({
          imgList: oldImgs,
          decodeImgList: oldDecodeImgs,
        })

        console.log(that.data);
      }
    }
  },

  deleteImg(event) {
    console.log(event);
    let list = this.data.imgList;
    let decodeList = this.data.decodeImgList;

    list.splice(event.detail.index, 1);
    decodeList.splice(event.detail.index, 1);

    this.setData({
      imgList: list,
      decodeImgList:decodeList,
    })
    console.log(this.data);
  },

  onClickPublic(){
    this.setData({
      showActionSheet: true,
    })
  },

  limitContextWord(e){
    var that = this;
    var value = e.detail.value;

    var wordLength = parseInt(value.length);
    if (that.data.maxWord < wordLength){
      return;
    }

    that.setData({
      resultText: value,
      currentWord: wordLength,
    })
  },


	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	}
})