import * as echarts from '../../ec-canvas/echarts';
import geoJson from './mapData.js';
import SDJson from './shandong.js'
const app=getApp();
import QQMapWX from '../../utils/qqmap-wx-jssdk.min.js'; //引入SDK文件
const base64=require('../../utils/base64.modified.js');
var qqmapsdk;
const appKey='Ud_t9LASR';
const appSecret='a3be567dde8811ee8fe012c7de235200';
const tokenEndpoint='https://oauth.cleargrass.com/oauth2/token';
Page({
    data: {
        border: {
            color: '#f6f6f6',
        },
        province: '',
        city: '',
        // total: '',
        // temperature: '',
        // humidity: '',
        // CO2: '',
        // datas: {},
        CNMap: {
            onInit: initChartMap
        },
        SDMap: {
            onInit: initShandongMap
        },
    },
    onLoad: function() {
        qqmapsdk=new QQMapWX({
            key: 'H5KBZ-PHI34-BBJUW-KGWUO-T7LMO-Q4BY3'
        });
    },
    onShow: function() {
        let _this=this;
        //_this.getUserLocation();
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
    },
    //////////////////////////////////////////////////////
    getAccessToken: function() {
        let _this=this;
        wx.request({
            url: tokenEndpoint,
            method: 'POST',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + base64.encode(appKey + ':' + appSecret),
            },
            data: {
                grant_type: 'client_credentials'
            },
            success: function(res) {
                var accessToken=res.data.access_token;
                _this.getData(accessToken);
                console.log('getAccessToken Success!');
            },
            fail: function(err) {
                console.error('Failed to get Access Token:', err);
            }
        })
    },
    getData: function(accessToken) {
        let _this=this;
        wx.request({
            url: 'https://apis.cleargrass.com/v1/apis/devices',
            header: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(res) {
                //var devicesObj=JSON.parse(res.devices);
                console.log('res:' + typeof res);
                console.log('res.data:' + typeof res.data);
                console.log('res.data.temperature:' + typeof res.data.temperature);
                console.log('res.data.humidity:' + typeof res.data.humidity);
                let temperature=res.data.temperature.value;
                let humidity=res.data.humidity.value;
                let CO2=res.data.co2.value;
                _this.setData({
                    datas: res.data,
                    temperature: temperature,
                    humidity: humidity,
                    CO2: CO2,
                });
                console.log('getData Success!');
            },
            fail: function(err) {
                console.error('Request failed:',err);
            }
        });
    },
})
///////////////////////////////////
function randomData() {
    return Math.round(Math.random()*10000);
}

function initChartMap(canvas, width, height) {
    console.log("initChartMap!");
    let myMap=echarts.init(canvas, null, {
        width: width,
        height: height
    });
    canvas.setChart(myMap);
    echarts.registerMap('china',geoJson);
    const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: "#FFF",
          padding: [
            10,  // 上
            15, // 右
            8,  // 下
            15, // 左
          ],
        //   extraCssText: 'box-shadow: 2px 2px 10px rgba(21, 126, 245, 0.randomData());',
        //   textStyle: {
        //     fontFamily: "'Microsoft YaHei', Arial, 'Avenir', Helvetica, sans-serif",
        //     color: '#005dff',
        //     fontSize: 12,
        //   },
          formatter: `{b} :  {c}确诊`
        },
        geo: [
          {
            // 地理坐标系组件
            map: "china",
            roam: false, // 可以缩放和平移
            aspectScale: 0.78, // 宽高比
            layoutCenter: ["50%", "38%"], // position位置
            layoutSize: 300, // 地图大小，保证了不超过 370x370 的区域
            label: {
              // 图形上的文本标签
              normal: {
                show: true,
                textStyle: {
                    color: "rgba(0, 0, 0, 0.9)",
                    fontSize: '8.5',
                    fontWeight: 'bold',
                    textBorderColor: '#fff',
                    textBorderWidth: 1,
                }
              },
              emphasis: { // 高亮时样式
                color: "#333"
              }
            },
            itemStyle: {
              // 图形上的地图区域
              normal: {
                borderColor: "rgba(0,0,0,0.2)",
                areaColor: "#005dff"
              }
            }
          }
        ],
        toolbox: {
          show: true,
          orient: 'vertical',
          left: 'right',
          top: 'center',
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
          }
        },
        visualMap: {
          min: 800,
          max: 50000,
          text: ['High', 'Low'],
          realtime: true,
          calculable: false,
          inRange: {
            color: ['lightskyblue', 'yellow', 'orangered']
          }
        },
        series: [
          {
            type: 'map',
            mapType: 'china',
            geoIndex: 0,
            roam: false, // 鼠标是否可以缩放
            label: {
                normal: {
                    show: true
                },
                emphasis: {
                    show: true
                }
            },
            itemStyle: {
                normal: {
                  areaColor: '#fbfbfb',
                  borderColor: '#b9b4b7'
                },
                emphasis: {
                //   areaColor: '#389BB7',
                  borderWidth: 0
                }
              },
            animation: false,

            data: [
              { name: '北京', value: randomData() },
              { name: '天津', value: randomData() },
              { name: '上海', value: randomData() },
              { name: '重庆', value: randomData() },
              { name: '河北', value: randomData() },
              { name: '河南', value: randomData() },
              { name: '云南', value: randomData() },
              { name: '辽宁', value: randomData() },
              { name: '黑龙江', value: randomData() },
              { name: '湖南', value: randomData() },
              { name: '安徽', value: randomData() },
              { name: '山东', value: randomData() },
              { name: '新疆', value: randomData() },
              { name: '江苏', value: randomData() },
              { name: '浙江', value: randomData() },
              { name: '江西', value: randomData() },
              { name: '湖北', value: randomData() },
              { name: '广西', value: randomData() },
              { name: '甘肃', value: randomData() },
              { name: '山西', value: randomData() },
              { name: '内蒙古', value: randomData() },
              { name: '陕西', value: randomData() },
              { name: '吉林', value: randomData() },
              { name: '福建', value: randomData() },
              { name: '贵州', value: randomData() },
              { name: '广东', value: randomData() },
              { name: '青海', value: randomData() },
              { name: '西藏', value: randomData() },
              { name: '四川', value: randomData() },
              { name: '宁夏', value: randomData() },
              { name: '海南', value: randomData() },
              { name: '台湾', value: randomData() },
              { name: '香港', value: randomData() },
              { name: '澳门', value: randomData() }
            ]
          }],
      };
    myMap.setOption(option);
    console.log("init finish!");
    return myMap;
}

function initShandongMap(canvas, width, height) {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
    });
    canvas.setChart(chart);
    echarts.registerMap('shandong', SDJson);
    
    const option = {
        tooltip: {
          trigger: 'item',
          // backgroundColor: "white",
          padding: [
            10,  // 上
            15, // 右
            8,  // 下
            15, // 左
          ],
          formatter: `{b} :  {c}确诊`
        },
        geo: [
          {
            // 地理坐标系组件
            map: "shandong",
            roam: false, // 可以缩放和平移
            aspectScale: 0.78, // 宽高比
            layoutCenter: ["50%", "40%"], // position位置
            layoutSize: 280, // 地图大小，保证了不超过 370x370 的区域
            label: {
              // 图形上的文本标签
              normal: {
                show: true,
                textStyle: {
                  color: "rgba(83, 83, 83, 0.9)",
                  fontSize: '8.5',
                  fontWeight: 'bold',
                  textBorderColor: '#fff',
                  textBorderWidth: 0.24,
                }
              },
              emphasis: { // 高亮时样式
                color: "#333",
                textStyle: {
                  color: "rgba(83, 83, 83, 0.9)",
                  fontSize: '8.5',
                  fontWeight: 'bold',
                  textBorderColor: '#fff',
                  textBorderWidth: 0.24,
                }
              }
            },
            itemStyle: {
              // 图形上的地图区域
              normal: {
                borderColor: "rgba(0,0,0,0.2)",
                areaColor: "#005dff"
              },
              emphasis: {
                show: false
              },
            }
          }
        ],
        toolbox: {
          show: false,
          orient: 'vertical',
          left: 'right',
          top: 'center',
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
          }
        },
        visualMap: {
          min: 800,
          max: 50000,
          text: ['高', '低'],
          realtime: true,
          orient: 'horizontal',
          left:'center',
          top:'280',
          calculable: false,
          inRange: {
            color: ['lightskyblue', 'yellow', 'orangered']
          }
        },
        series: [
          {
            type: 'map',
            mapType: 'shandong',
            geoIndex: 0,
            roam: false, // 鼠标是否可以缩放
            label: {
                normal: {
                    show: true
                },
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                  areaColor: '#fbfbfb',
                  borderColor: '#b9b4b7'
                },
                emphasis: {
                //   areaColor: '#389BB7',
                  // borderWidth: 0
                  show: false
                }
              },
            animation: true,
        data: [//数据
            { name: '济南市', value: randomData() },
            { name: '青岛市', value: randomData() },
            { name: '德州市', value: randomData() },
            { name: '淄博市', value: randomData() },
            { name: '潍坊市', value: randomData() },
            { name: '日照市', value: randomData() },
            { name: '济宁市', value: randomData() },
            { name: '菏泽市', value: randomData() },
            { name: '烟台市', value: randomData() },
            { name: '威海市', value: randomData() },
            { name: '泰安市', value: randomData() },
            { name: '临沂市', value: randomData() },
            { name: '枣庄市', value: randomData() },
            { name: '滨州市', value: randomData() },
            { name: '东营市', value: randomData() },
            { name: '莱芜市', value: randomData() },
            { name: '聊城市', value: randomData() }
          ]
        }],
    }
    chart.setOption(option);
    return chart;
  }