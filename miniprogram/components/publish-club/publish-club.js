// components/publish-club/publish-club.js
import {formatTime} from "../../utils/common.js"
import {publishActivity,wxGetAddress} from "../../api/apis"
const LoginBiz = require('../../common_biz/login.js')
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')
import {
  addHeightArray,
  clearHeight
} from "../../utils/styleCount";

import {
  getClubList,
  createClub
} from "../../utils/server/club";

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	/**
	 * 组件的初始数据
	 */
	data: {
    showPublishClub: false,
    edit_club_id: '',
    club_name: '',
    club_content: '',
    club_icon: [],
    decode_club_icon:'',
    club_back_img: [],
    decode_club_back_img:'',
    before_img: [],
    hideBtn: false,
	},

	/**
	 * 组件的方法列表
	 */
	methods: {

    onclickPublishClub() {
      this.setData({
        showPublishClub: true,
        club_name: '',
        club_content: '',
        club_icon: [],
        decode_club_icon:'',
        club_back_img: '',
        decode_club_back_img:'',
        before_img: [],
      })
    },

    confirmPublish(event) {
      console.log("confirmPublish方法");
      this.beforeClose = (action) => new Promise((resolve) => {
        setTimeout(() => {
          if (action === 'confirm') {
            // 拦截确认操作
            resolve(false);
          } else {
            resolve(true);
          }
        }, 0);
      });
      //todo：待添加文本输入是否为空的判断逻辑
      console.log(this.data.club_name, this.data.club_content)
      if (this.data.club_name == "" ||
        this.data.club_content == ""
      ) {
        wx.showToast({
          title: '请检查必填项',
          icon: 'error',
          duration: 2000
        })
        this.setData({
          showPublishClub: true
        })
        return;
      }
      //上传图片至服务器，获得图片加密链接后再上传活动表单
      var that = this

      var data = {};       

      data = {
        club_id: that.data.edit_club_id,
        club_name: that.data.club_name,
        club_summary: that.data.club_content,
        // club_icon: that.data.decode_club_icon === '' ? 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/e21405990022308da593789d244e3a30.png' : that.data.decode_club_icon,
        // club_back_img: that.data.decode_club_back_img === '' ? 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/dc27bcb8ed6da24c452ef24a7495df06.jpg' : that.data.decode_club_back_img,
        club_icon: that.data.decode_club_icon,
        club_back_img: that.data.decode_club_back_img,
        club_back_img_width: that.data.club_back_img === '' ? 717 : that.data.club_back_img_width,
        club_back_img_height: that.data.club_back_img === '' ? 603 : that.data.club_back_img_height
      };
      
      console.log(data);
      wx.showLoading({
        title: '发布中...'
      })
      createClub(data).then(res => {
        if (res.err_no === 0) {
          wx.hideLoading()
          wx.showToast({
            title: '社团创建成功！',
            icon: 'success',
          });

          if (that.data.edit_club_id != '' && that.data.edit_club_id != '0') {
            // 向社团详情页发布通知重新刷新
            WxNotificationCenter.postNotificationName('refreshClubDetail',that.data.edit_club_id);
          }

          that.setData({
            isLoading: true,
            edit_club_id:'',
            club_name: '',
            club_content: '',
            club_icon: [],
            decode_club_icon:'',
            club_back_img: [],
            decode_club_back_img:'',
            club_back_img_width: 717,
            club_back_img_height: 603,
            before_img: [],
            activeTab: 1,
            showPublishClub: false
          }, () => {
            that.getData(1, 1);
          })

          
        } else{
          wx.hideLoading()
          wx.showToast({
            title: '社团创建失败！',
            icon: 'error',
          })
        }

      }).catch(err => {
        console.log(err);
      })


      // try {

      //   if (tempFilePaths[0] !== '' || tempFilePaths[1] !== '') {
      //     for (var i = 0; i < tempFilePaths.length; i++) {
      //       if (this.data.before_img.includes(tempFilePaths[i])) {
      //         imgUrl.push(tempFilePaths[i]);
      //       } else {
      //         if (tempFilePaths[i] != '') {
      //           needUploadImg.push(tempFilePaths[i]);
      //         } else {
      //           imgUrl.push('');
      //         }
      //       }
      //     }

      //     console.log(needUploadImg);
      //     console.log(imgUrl);

      //     if (needUploadImg.length > 0) {
      //       for (var i = 0; i < needUploadImg.length; i++) {
      //         if (needUploadImg[i] === '') {
      //           times += 1;
      //           imgUrl.push('')
      //           continue;
      //         }

      //         wx.uploadFile({
      //           url: 'http://124.220.84.200:5455/api/uploadStream',
      //           filePath: needUploadImg[i],
      //           name: "file",
      //           header: {
      //             "content-type": "multipart/form-data"
      //           },
      //           formData: {
      //             token: LoginBiz.getToken(), // 用户token
      //             biz_type: 1, // 业务线  1：普通活动，必要
      //           },
      //           success: function (res) {
      //             times += 1
      //             var jsonObj = JSON.parse(res.data);
      //             if (res.statusCode == 200) {
      //               imgUrl.push(jsonObj.data.file_download_http)
      //               if (times === needUploadImg.length) { //图片传完了
      //                 var data = {};
          
      //                 console.log(imgUrl)
      //                 if (imgUrl[0] !== '') {
      //                   data = {
      //                     club_id: that.data.edit_club_id,
      //                     club_name: that.data.club_name,
      //                     club_summary: that.data.club_content,
      //                     club_icon: imgUrl[0],
      //                     club_back_img: imgUrl[1],
      //                     club_back_img_width: that.data.club_back_img_width,
      //                     club_back_img_height: that.data.club_back_img_height
      //                   };
      //                 } else {
      //                   data = {
      //                     club_id: that.data.edit_club_id,
      //                     club_name: that.data.club_name,
      //                     club_summary: that.data.club_content,
      //                     club_icon: tempFilePaths[0] === '' ? 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/e21405990022308da593789d244e3a30.png' : imgUrl[0],
      //                     club_back_img: tempFilePaths[1] === '' ? 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/dc27bcb8ed6da24c452ef24a7495df06.jpg' : imgUrl[1],
      //                     club_back_img_width: tempFilePaths[1] === '' ? 717 : that.data.club_back_img_width,
      //                     club_back_img_height: tempFilePaths[1] === '' ? 603 : that.data.club_back_img_height
      //                   };
      //                 }
      //                 console.log(data);
      //                 wx.showLoading({
      //                   title: '发布中...'
      //                 })
      //                 createClub(data).then(res => {
      //                   if (res.err_no === 0) {
      //                     wx.hideLoading()
      //                     wx.showToast({
      //                       title: '社团创建成功！',
      //                       icon: 'success',
      //                     })
      //                     that.setData({
      //                       isLoading: true,
      //                       edit_club_id:'',
      //                       club_name: '',
      //                       club_content: '',
      //                       club_icon: '',
      //                       club_back_img: '',
      //                       club_back_img_width: 717,
      //                       club_back_img_height: 603,
      //                       before_img: [],
      //                       activeTab: 1,
      //                       showPublishClub: false
      //                     }, () => {
      //                       that.getData(1, 1);
      //                     })
      //                   } else{
      //                     wx.hideLoading()
      //                     wx.showToast({
      //                       title: '社团创建失败！',
      //                       icon: 'fail',
      //                     })
      //                     // that.setData({
      //                     //   isLoading: true,
      //                     //   edit_club_id:'',
      //                     //   club_name: '',
      //                     //   club_content: '',
      //                     //   club_icon: '',
      //                     //   club_back_img: '',
      //                     //   club_back_img_width: 717,
      //                     //   club_back_img_height: 603,
      //                     //   before_img: [],
      //                     //   activeTab: 1
      //                     // })
      //                   }
    
      //                 }).catch(err => {
      //                   console.log(err);
      //                 })
    
      //                 //
      //                 //向主页发布通知重新刷新
      //                 // WxNotificationCenter.postNotificationName('refresh')
      //               }
      //             }
      //           },
      //           fail: function (err) {
      //             wx.showToast({
      //               title: "图片上传失败",
      //               icon: "none",
      //               duration: 2000
      //             })
      //             console.log(err);
      //             this.setData({
      //               edit_club_id: '',
      //               club_name: '',
      //               club_content: '',
      //               club_icon: '',
      //               club_back_img: '',
      //               club_back_img_width: 717,
      //               club_back_img_height: 603,
      //               before_img: [],
      //             })
      //           },
      //           complete: function (result) {
      //             console.log(result.errMsg)
      //           }
      //         })
      //       }
      //     } else{
      //       data = {
      //         club_id: that.data.edit_club_id,
      //         club_name: that.data.club_name,
      //         club_summary: that.data.club_content,
      //         club_icon: imgUrl[0] === '' ? 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/e21405990022308da593789d244e3a30.png' : imgUrl[0],
      //         club_back_img: imgUrl[1] === '' ? 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/dc27bcb8ed6da24c452ef24a7495df06.jpg' : imgUrl[1],
      //         club_back_img_width: tempFilePaths[1] === '' ? 717 : that.data.club_back_img_width,
      //         club_back_img_height: tempFilePaths[1] === '' ? 603 : that.data.club_back_img_height
      //       };

      //     console.log(data);
      //     wx.showLoading({
      //       title: '发布中...'
      //     })
      //     createClub(data).then(res => {
      //       if (res.err_no === 0) {
      //         wx.hideLoading()
      //         wx.showToast({
      //           title: '社团创建成功！',
      //           icon: 'success',
      //         })
      //         that.setData({
      //           isLoading: true,
      //           edit_club_id:'',
      //           club_name: '',
      //           club_content: '',
      //           club_icon: '',
      //           club_back_img: '',
      //           club_back_img_width: 717,
      //           club_back_img_height: 603,
      //           before_img: [],
      //           before_img: [],
      //           showPublishClub: false,
      //           activeTab: 1
      //         }, () => {
      //           that.getData(1, 1);
      //         })
      //       }else{
      //         wx.hideLoading()
      //         wx.showToast({
      //           title: '社团创建失败！',
      //           icon: 'fail',
      //         })
      //         // that.setData({
      //         //   isLoading: true,
      //         //   edit_club_id:'',
      //         //   club_name: '',
      //         //   club_content: '',
      //         //   club_icon: '',
      //         //   club_back_img: '',
      //         //   club_back_img_width: 717,
      //         //   club_back_img_height: 603,
      //         //   before_img: [],
      //         //   before_img: [],
      //         //   activeTab: 1
      //         // })
      //       }

      //     }).catch(err => {
      //       console.log(err);
      //     })
      //     }
      //   } else {
      //     var data = {
      //       club_id: that.data.edit_club_id,
      //       club_name: that.data.club_name,
      //       club_summary: that.data.club_content,
      //       club_icon: 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/e21405990022308da593789d244e3a30.png',
      //       club_back_img: 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/dc27bcb8ed6da24c452ef24a7495df06.jpg',
      //       club_back_img_width: 717,
      //       club_back_img_height: 603
      //     }; //传参
      //     wx.showLoading({
      //       title: '发布中...'
      //     })
      //     createClub(data).then(res => {
      //       if (res.err_no === 0) {
      //         wx.hideLoading()
      //         wx.showToast({
      //           title: '社团创建成功！',
      //           icon: 'success',
      //         })
      //         that.setData({
      //           isLoading: true,
      //           edit_club_id: '',
      //           club_name: '',
      //           club_content: '',
      //           club_icon: '',
      //           club_back_img: '',
      //           club_back_img_width: 717,
      //           club_back_img_height: 603,
      //           showPublishClub: false,
      //           before_img: [],
      //           activeTab: 1
      //         }, () => {
      //           console.log('==>>社团创建成功,重新进入页面请求getData')
      //           that.getData(1, 1);
      //         })
      //       } else {
      //         wx.hideLoading()
      //         wx.showToast({
      //           title: '社团创建失败！',
      //           icon: 'fail',
      //         })

      //         // that.setData({
      //         //   isLoading: true,
      //         //   edit_club_id: '',
      //         //   club_name: '',
      //         //   club_content: '',
      //         //   club_icon: '',
      //         //   club_back_img: '',
      //         //   club_back_img_width: 717,
      //         //   club_back_img_height: 603,
      //         //   before_img: [],
      //         //   activeTab: 1
      //         // })
      //       }
  
      //     }).catch(err => {
      //       console.log(err);
      //     })
  
      //     //
      //     //向主页发布通知重新刷新
      //     // WxNotificationCenter.postNotificationName('refresh')
      //   }
  
      // } catch (err) {
      //   wx.showToast({
      //     title: "图片上传失败",
      //     icon: "none",
      //     duration: 2000
      //   })
      //   console.log(err);
      //   this.setData({
      //     edit_club_id: '',
      //     club_name: '',
      //     club_content: '',
      //     club_icon: '',
      //     club_back_img: '',
      //     before_img: [],
      //     club_back_img_width: 717,
      //     club_back_img_height: 603
      //   })
      // }
  
    },
    onClose() {
      this.setData({
        close: false
      });
    },

		beforeClose (action, done) {
			console.log("onBeforeClose方法");
			if (action === "confirm") {
				return done(false);
			} else {
				return done();
			}
		},

  // // 删除图片
  // deleteImg: function (e) {
  //   console.log(e)
  //   var that = this
  //   wx.showModal({
  //     title: "提示",
  //     content: "是否删除",
  //     success: function (res) {
  //       if (res.confirm) {
  //         if (e.currentTarget.dataset.imgType === 'logo') {
  //           that.setData({
  //             club_icon: []
  //           })
  //         } else {
  //           that.setData({
  //             club_back_img: [],
  //             club_back_img_width: 717,
  //             club_back_img_height: 603
  //           })
  //         }

  //       } else if (res.cancel) {
  //         console.log("用户点击取消")
  //       }
  //     }
  //   })
  // },

  // bindUpload(e) {
  //   console.log(e)
  //   var that = this
  //   wx.chooseMedia({
  //     count: 1,
  //     mediaType: ['image'],
  //     sourceType: ['album', 'camera'],
  //     maxDuration: 30,
  //     camera: 'back',
  //     success(res) {
  //       console.log(res);
  //       // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
  //       var tempFilePaths = res.tempFiles;
  //       if (e.currentTarget.dataset.imgType === 'logo') {
  //         that.data.club_icon = tempFilePaths[0].tempFilePath;
  //         that.setData({
  //           club_icon: that.data.club_icon
  //         })
  //       } else {
  //         that.data.club_back_img = tempFilePaths[1].tempFilePath;
  //         wx.getImageInfo({
  //           src: that.data.club_back_img,
  //           success(res) {
  //             that.setData({
  //               club_back_img: that.data.club_back_img,
  //               club_back_img_width: res.width,
  //               club_back_img_height: res.height
  //             })
  //           }
  //         })

  //       }

  //     }
  //   })
  // },

  onclickPublishClub() {
    this.setData({
      showPublishClub: true
    });
  },

    // typeKey: tab索引
  // pageNo: 页码
  async getData(typeKey, pageNo) {
    const idMap = {
      0: 1,
      1: 2,
      2: 0
    };
    const {
      clubList: oldClubList,
      activeTab
    } = this.data;

    getClubList({
      scene: idMap[typeKey],
      page_no: pageNo
    }).then(async (res) => {
      const filterNoWidthClubList = res.data.club_list.map((item) => {
        // var club_icon_url = (item.club_icon || 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/e21405990022308da593789d244e3a30.png');
        // var club_back_img_url = (item.club_back_img || 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/dc27bcb8ed6da24c452ef24a7495df06.jpg');
        var club_icon_url = item.club_icon;
        var club_back_img_url = item.club_back_img;

        return {
          ...item,
          club_back_img_height: item.club_back_img_height ? item.club_back_img_height : 603,
          club_back_img_width: item.club_back_img_width ? item.club_back_img_width : 717,
          club_back_img: [{
            url: club_back_img_url,
            name: "",
            isImage: true,
          }],
          club_icon: [{
            url: club_icon_url,
            name: "",
            isImage: true,
          }]
        }
      })
      const list = await addHeightArray(filterNoWidthClubList, 'club_back_img');
      console.log(list);
      if (list.length < 10) {
        // 没有更多了
        this.setData({
          isNoMore: true
        })
      }

      for (var i in list) {
        if (list[i].club_name.length > 4) {
          var name = list[i].club_name.slice(0,3);
          list[i].club_name = name + "...";
        }
      }

      const completeList = (pageNo === 1 ? [] : oldClubList).concat(list);
      this.setData({
        clubList: completeList,
        currentActiveTab: activeTab,
        isLoading: false,
        loadingFlag: false,
        currentPageNo: pageNo + 1
      })
    })
  },

  // 是否隐藏发布按钮
  hideButton(e) {
    console.log(e);
    this.setData({
      hideBtn: e,
    })
  },

  onClickEdit(e){
    this.setData({
      showPublishClub:true
    });
    console.log("收到社团数据")
    console.log(e);

    var imgList = [];
    imgList.push(e.club_icon);
    imgList.push(e.club_back_img);

    // var club_icon_url = (e.club_icon || 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/e21405990022308da593789d244e3a30.png');
    var club_icon_url = e.club_icon;

    // var club_back_img_url = (e.club_back_img || 'https://hermes-activity-1259481177.cos.ap-shanghai.myqcloud.com/dc27bcb8ed6da24c452ef24a7495df06.jpg');
    var club_back_img_url = e.club_back_img;

    this.setData({
      publishTitle: "编辑活动",
      edit_club_id: e.club_id,
      club_name: e.club_name,
      club_content: e.club_summary,
      club_icon: [{
        url:club_icon_url,
        name: "",
        isImage: true,
      }],
      decode_club_icon: e.club_icon,
      club_back_img: [{
        url:club_back_img_url,
        name: "",
        isImage: true,
      }],
      decode_club_back_img: e.club_back_img,
      before_img: imgList,
    })

    console.log(this.data);
  },

  afterClubIconRead(e){
    console.log("上传社团图标");
    console.log(e);

    const file = e.detail;
    var that = this;

    // if (file.file.size > 2000000) {
    //   wx.showToast({
    //     title: '图片太大！',
    //     icon: "error",
    //     duration: 2000
    //   })
    //   return
    // }

    that.setData({ 
      club_icon: [{
        url: file.file.url,
        name:"",
        isImage: true,
        status: 'uploading',
        message: '上传中',
      }],
    });

    wx.uploadFile({
      url: 'https://www.mirthdata.com/api/uploadStream',
      // url: 'http://124.220.84.200:5455/api/uploadStream',
      filePath: file.file.url,
      name: "file",
      header: {
        "content-type": "multipart/form-data"
      },
      formData: {
        token: LoginBiz.getToken(), // 用户token
        biz_type: 1, // 业务线  1：普通活动，必要
      },
  
      success(res) {
        that.setData({ 
          club_icon: [],
        });

        
        if (res.statusCode == 200) {
          var jsonObj = JSON.parse(res.data);
          console.log(res);
          if (jsonObj.err_no == 0) {
            // 上传完成需要更新 fileList
            that.setData({ 
              club_icon: [{
                url: file.file.url,
                name:"",
                isImage: true,
                status: 'done',
                message: '上传成功',
              }],
              decode_club_icon: jsonObj.data.file_download_http,
            });
          } else{
            wx.showToast({
              title: '图片上传失败！',
              icon: 'error',
              duration: 2000
            })
  
            that.setData({ 
              club_icon: [],
            });
  
            console.log(res);
          }
        } else {
          wx.showToast({
            title: '图片上传失败！',
            icon: 'error',
            duration: 2000
          })

          that.setData({ 
            club_icon: [{
              url: file.file.url,
              name:"",
              isImage: true,
              status: 'failed',
              message: '上传失败',
            }],
          });

          console.log(res);
        }
      },

      fail: function (err) {
        wx.showToast({
          title: "图片上传失败",
          icon: "none",
          duration: 2000
        });
        console.log(err);
        that.setData({
          club_icon: [],
          decode_club_icon:'',
        })

        that.setData({ 
          club_icon: [{
            url: file.file.url,
            name:"",
            isImage: true,
            status: 'failed',
            message: '上传失败',
          }],
        });
      },
    });
  },
    
  afterClubBackImgRead(e){
    console.log("上传社团背景图");
    console.log(e);

    const file = e.detail;
    var that = this;

    // if (file.file.size > 2000000) {
    //   wx.showToast({
    //     title: '图片太大！',
    //     icon: "error",
    //     duration: 2000
    //   })
    //   return
    // }

    that.setData({ 
      club_back_img: [{
        url: file.file.url,
        name:"",
        isImage: true,
        status: 'uploading',
        message: '上传中',
      }],
    });

    wx.uploadFile({
      url: 'https://www.mirthdata.com/api/uploadStream',
      // url: 'http://124.220.84.200:5455/api/uploadStream',
      filePath: file.file.url,
      name: "file",
      header: {
        "content-type": "multipart/form-data"
      },
      formData: {
        token: LoginBiz.getToken(), // 用户token
        biz_type: 1, // 业务线  1：普通活动，必要
      },
  
      success(res) {
        that.setData({ 
          club_back_img: [],
        });

        if (res.statusCode == 200) {
          var jsonObj = JSON.parse(res.data);
          console.log(res);
          if (jsonObj.err_no == 0) {
            // 上传完成需要更新 fileList
            that.setData({ 
              club_back_img: [{
                url: file.file.url,
                name:"",
                isImage: true,
                status: 'done',
                message: '上传成功',
              }],
              decode_club_back_img:jsonObj.data.file_download_http,
              club_back_img_width: jsonObj.data.image_width,
              club_back_img_height: jsonObj.data.image_height,
            });

            console.log(that.data);
          }else{
            wx.showToast({
              title: '图片上传失败！',
              icon: 'error',
              duration: 2000
            })
  
            that.setData({ 
              club_back_img: [{}],
            });
  
            console.log(res);
          }
        } else {
          wx.showToast({
            title: '图片上传失败！',
            icon: 'error',
            duration: 2000
          })

          that.setData({ 
            club_back_img: [{
              url: file.file.url,
              name:"",
              isImage: true,
              status: 'failed',
              message: '上传失败',
            }],
          });

          console.log(res);
        }
      },

      fail: function (err) {
        wx.showToast({
          title: "图片上传失败",
          icon: "none",
          duration: 2000
        })
        console.log(err);
        that.setData({
          club_back_img: [],
          decode_club_back_img:'',
          club_back_img_width: 717,
          club_back_img_height: 603,
        })

        that.setData({ 
          club_back_img: [{
            url: file.file.url,
            name:"",
            isImage: true,
            status: 'failed',
            message: '上传失败',
          }],
        });
      },
    });
  },

  deleteClubIcon(event) {
    console.log(event);
    let list = this.data.club_icon;
    list.splice(event.detail.index, 1);
    this.setData({
      club_icon: list,
      decode_club_icon:'',
    })
    console.log(this.data);
  },

  deleteClubBackImg(event) {
    console.log(event);
    let list = this.data.club_back_img;
    list.splice(event.detail.index, 1);
    this.setData({
      club_back_img: list,
      decode_club_back_img:'',
    })
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


  onClose() {
    this.setData({
      close: false
    });
  },

	}
})
