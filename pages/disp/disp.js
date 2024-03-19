const app = getApp();
import * as echarts from '../../ec-canvas/echarts';
import geoJson from './mapData.js';
import SDJson from './shandong.js'
import QQMapWX from '../../utils/qqmap-wx-jssdk.min.js'; //引入SDK文件
var qqmapsdk;
Component({
  //
  lifetimes: {
    attached() {
      // 在组件被插入到页面时执行的操作
      console.log('Custom component attached to page');
      // 执行其他逻辑...
      qqmapsdk = new QQMapWX({
        key: 'H5KBZ-PHI34-BBJUW-KGWUO-T7LMO-Q4BY3'
      });
      this.getUserLocation();
    },
    ready() {
      let place0 = this.GetColorAndGrade(60);
      let room0 = this.GetColorAndGrade(80);
      this.setData({
        room: room0,
        place: place0
      })
    }
  },

  data: {
    tabvalue:0,
    provinceText: '定位中',
    provinceValue: [],
    city: '',
    provinces : [
      { label: '北京市', value: '北京市' },
      { label: '上海市', value: '上海市' },
      { label: '广东省', value: '广东省' },
      { label: '江苏省', value: '江苏省' },
      { label: '浙江省', value: '浙江省' },
      { label: '山东省', value: '山东省' },
      { label: '河南省', value: '河南省' },
      { label: '河北省', value: '河北省' },
      { label: '湖南省', value: '湖南省' },
      { label: '湖北省', value: '湖北省' },
      { label: '福建省', value: '福建省' },
      { label: '安徽省', value: '安徽省' },
      { label: '辽宁省', value: '辽宁省' },
      { label: '吉林省', value: '吉林省' },
      { label: '黑龙江省', value: '黑龙江省' },
      { label: '陕西省', value: '陕西省' },
      { label: '山西省', value: '山西省' },
      { label: '云南省', value: '云南省' },
      { label: '四川省', value: '四川省' },
      { label: '江西省', value: '江西省' },
      { label: '广西壮族自治区', value: '广西壮族自治区' },
      { label: '内蒙古自治区', value: '内蒙古自治区' },
      { label: '宁夏回族自治区', value: '宁夏回族自治区' },
      { label: '甘肃省', value: '甘肃省' },
      { label: '青海省', value: '青海省' },
      { label: '新疆维吾尔自治区', value: '新疆维吾尔自治区' },
      { label: '西藏自治区', value: '西藏自治区' },
      { label: '台湾省', value: '台湾省' },
      { label: '香港特别行政区', value: '香港特别行政区' },
      { label: '澳门特别行政区', value: '澳门特别行政区' }
    ],
    province: '',
    backTopTheme: 'round',
    backTopText: '顶部',
    footerText: '由 X-Hunter 创业项目研发',
    footerText2: '场所信息由青萍开发者平台提供',
    links: [
      { name: '项目地址', url: '' },
      { name: '青萍开发者平台', url: '' }],
    place: { percentage: 0, grade: '较低', color: 'lime' },
    room: { percentage: 0, grade: '较低', color: 'lime' },
    ecMap: {
      onInit: initChartMap
    },
    SDMap: {
      onInit: initShandongMap
    },
  },
  properties: {
    scrollTop: { type: Number, value: 0 },
  },
  methods: {
    onColumnChange(e) {
      console.log('picker pick:', e);
    },

    onPickerChange(e) {
      const { key } = e.currentTarget.dataset;
      const { value } = e.detail;

      console.log('picker change:', e.detail);
      this.setData({
        [`${key}Visible`]: false,
        [`${key}Value`]: value,
        [`${key}Text`]: value.join(' '),
        tabvalue:0
      });
    },

    onPickerCancel(e) {
      const { key } = e.currentTarget.dataset;
      console.log(e, '取消');
      console.log('picker1 cancel:');
      this.setData({
        [`${key}Visible`]: false,
        tabvalue:0
      });
    },

    onCityPicker() {
      this.setData({ cityVisible: true,tabvalue:-1});

    },
    GetColorAndGrade: function (per) {
      console.log("Color!");
      let color = '';
      let grade = '';
      if (per <= 20) color = 'limegreen';
      else if (per <= 50) color = 'limegreen';
      else if (per <= 70) color = 'orange';
      else color = 'red';
      if (per <= 30) grade = '较低';
      else if (per <= 70) grade = '中等';
      else grade = '较高';
      return {
        percentage: per,
        color: color,
        grade: grade
      };
      

    },
    onTabsClick(event) {
      console.log(`Click tab, tab-panel value is ${event.detail.value}.`);
      this.setData({
        tabvalue:event.detail.value
      })
    },
    onToTop(e) {
      console.log('backToTop', e);
    },
    ///////////////
    getUserLocation: function () {
      let _this = this;
      wx.getSetting({
        success: (res) => {
          console.log(JSON.stringify(res))
          // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
          // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
          // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
          if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
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
    getLocation: function () {
      let _this = this;
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
      let _this = this;
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
            provinceText: province,
            cityText: city
          })
          return city;
        },
        fail: function (res) {
          console.log(res);
        },
        complete: function (res) {
          // console.log(res);
        }
      });
    },
  },
});
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
      //   extraCssText: 'box-shadow: 2px 2px 10px rgba(21, 126, 245, 0.35);',
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
          layoutCenter: ["50%", "40%"], // position位置
          layoutSize: 280, // 地图大小，保证了不超过 370x370 的区域
          label: {
            // 图形上的文本标签
            normal: {
              show: true,
              textStyle: {
                  color: "rgba(0, 0, 0, 0.6)",
                  fontSize: '8.4',
                  fontWeight: 'bold',
                  textBorderColor: '#bbb',
                  textBorderWidth: 0.4,
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
        top:'240',
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
          animation: true,

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