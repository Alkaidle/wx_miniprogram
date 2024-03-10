const app=getApp();
import QQMapWX from '../../utils/qqmap-wx-jssdk.min.js'; //引入SDK文件
var qqmapsdk;
Page({
    data: {
        border: {
            color: '#f6f6f6',
        },
        province: '',
        city: '',
        latitude: '',
        longitude: '',
    },
    onLoad: function() {
        qqmapsdk=new QQMapWX({
            key: 'H5KBZ-PHI34-BBJUW-KGWUO-T7LMO-Q4BY3'
        });
    },
    onShow: function() {
        let _this=this;
        _this.getUserLocation();
    },
    getUserLocation: function() {
        let _this=this;
        wx.getSetting({
            success: (res) => {
                console.log(JSON.stringify(res))
                // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
                // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
                // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
                if(res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true){
                    //如果没有授权则需提升授权
                    wx.showModal({
                        title: '请求授权当前位置',
                        content: '需要获取您的地理位置，请确认授权',
                        success: function (res) {
                            if (res.cancel) {
                                wx.showToast({
                                    title: '拒绝授权',
                                    icon: 'none',
                                    duration: 1000
                                })
                            }
                            else if (res.confirm) {
                                wx.openSetting({
                                    success: function (dataAu) {
                                        if (dataAu.authSetting["scope.userLocation"] == true) {
                                            wx.showToast({
                                            title: '授权成功',
                                            icon: 'success',
                                            duration: 1000
                                            })
                                            //再次授权，调用wx.getLocation的API
                                            _this.getLocation();
                                        } else {
                                            wx.showToast({
                                                title: '授权失败',
                                                icon: 'none',
                                                duration: 1000
                                            })
                                        }              
                                    }
                                })
                            }
                        },
                    })
                } else if (res.authSetting['scope.userLocation'] == undefined) {
                    //调用wx.getLocation的API
                    _this.getLocation();
                } else {
                    //调用wx.getLocation的API
                    _this.getLocation();
                }
            }
        })
    },
    //获得经纬度
    getLocation: function() {
        let _this=this;
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                console.log(JSON.stringify(res))
                var latitude = res.latitude;
                var longitude = res.longitude;
                _this.getLocal(latitude, longitude)
            },
            fail: function (res) {
                console.log('fail' + JSON.stringify(res))
            }
        })      
    },
    //获取当前地理位置
    getLocal: function (latitude, longitude) {
        let _this=this;
        qqmapsdk.reverseGeocoder({
            location: {
                latitude: latitude,
                longitude: longitude,
            },
            success: function (res) {
                // console.log(JSON.stringify(res));
                let province = res.result.ad_info.province
                let city = res.result.ad_info.city
                _this.setData({
                    province: province,
                    city: city
                })
            },
            fail: function (res) {
                console.log(res);
            },
            complete: function (res) {
                // console.log(res);
            }
        });
    }
})