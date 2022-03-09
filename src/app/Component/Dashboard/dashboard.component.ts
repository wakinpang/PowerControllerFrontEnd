import {Component, OnInit} from '@angular/core';
import {DataPojo} from '../../Entity/DataPojo';
import {DataService} from '../../Service/data.service';
import {AlarmService} from '../../Service/alarm.service';
import {Router} from '@angular/router';
import {RatioService} from '../../Service/ratio.service';
import {RatioPojo} from '../../Entity/RatioPojo';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(private dataService: DataService,
              private alarmService: AlarmService,
              private ratioService: RatioService,
              private router: Router) {
  }

  // Charts
  CustomChart: any; // 图
  updateOptions: any;
  isLoading = false;

  // Form
  ratioList: RatioPojo[]; // 系数列表
  classes: string[] = ['煤', '油', '电', '蒸汽', '热力', '天然气', '水'];
  types: boolean[] = []; // CheckBox 状态
  unitType: 'standard' | 'CO2' = 'standard';
  timeType: 'week' | 'month' = 'month';
  chartType: 'line' | 'bar' | 'pie' = 'line';
  ratios: any = {
    coal: 0,
    oil: 0,
    electric: 0,
    steam: 0,
    heat: 0,
    gas: 0,
    water: 0,
  }; // 标准煤 => CO2系数
  colors: any[] = ['#B5C334', '#FCCE10', '#E87C25', '#27727B', '#FE8463', '#9BCA63', '#FAD860'];

  dataList: DataPojo[] = [];

  // 警告
  alarmNumber = 0;

  async ngOnInit() {
    try {
      for (let i = 0; i < 7; i++) {
        this.types.push(true);
      }
      const alarms = await this.alarmService.fetchAlarm();
      this.alarmNumber = alarms.filter(item => Number(item.status) === 0).length;

      this.initChart();

      // InitData
      this.ratioList = await this.ratioService.getDatas();

      this.dataList = await this.dataService.fetchDatas(this.getThisMonth(), ''); // 1号到今天

      this.initRatios(); // 初始化：标准煤 => CO2系数

      this.initDatas(); // 数据统一为标准煤单位

      this.loadChart();
    } catch (e) {
      console.log(e);
    } finally {
      this.isLoading = false;
    }
  }

  initChart() {
    this.isLoading = true;
    this.CustomChart = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: []
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          restore: {show: true},
          saveAsImage: {show: true}
        }
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: []
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: []
    };
  }

  // 1号到今天
  getThisMonth(): Date[] {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = new Date(year, month, 1, 1);
    return [start, now];
  }

  navToAlarm() {
    this.router.navigate(['/admin/real-time/alarm']);
  }

  // FIXME 初始化系数
  initRatios() {
    for (const ratio of this.ratioList) {
      if (ratio.from.type === '煤' && ratio.to.name === 'CO2') {
        this.ratios.coal = ratio.value;
      }
      if (ratio.from.type === '油' && ratio.to.name === 'CO2') {
        this.ratios.oil = ratio.value;
      }
      if (ratio.from.type === '电' && ratio.to.name === 'CO2') {
        this.ratios.electric = ratio.value;
      }
      if (ratio.from.type === '水蒸气' && ratio.to.name === 'CO2') {
        this.ratios.steam = ratio.value;
      }
      if (ratio.from.type === '热力' && ratio.to.name === 'CO2') {
        this.ratios.heat = ratio.value;
      }
      if (ratio.from.type === '天然气' && ratio.to.name === 'CO2') {
        this.ratios.gas = ratio.value;
      }
      if (ratio.from.type === '水' && ratio.to.name === 'CO2') {
        this.ratios.water = ratio.value;
      }
    }
  }

  initDatas() {
    // TODO 数据统一为标准煤单位
  }

  // 加载图表
  loadChart() {
    switch (this.chartType) {
      case 'line':
        this.loadLineChart();
        break;
      case 'bar':
        this.loadBarChart();
        break;
      case 'pie':
        this.loadPieChart();
        break;
      default:
        this.CustomChart = {};
        break;
    }
  }

  loadLineChart() {
    try {
      const lineData = this.getLineData();
      this.CustomChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          ...lineData.legend
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            restore: {show: true},
            saveAsImage: {show: true}
          }
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            ...lineData.xAxis
          }
        ],
        yAxis: [
          {
            type: 'value',
            ...lineData.yAxis,
          }
        ],
        series: [
          ...lineData.series,
        ]
      };
    } catch (e) {
      console.log(e);
    }
  }

  getLineData() {
    let xAxis = {}, yAxis = {};
    const series = [];
    const legend = {data: this.classes};
    const now = new Date();
    const date = now.getDate();
    let datas = [];
    if (this.timeType === 'week') {
      xAxis = {data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']}; // FIXME x轴
      // TODO 筛选本周数据
      // for (const device of datas) {
      //   if (device.datas && device.datas.length > 0) {
      //     for (const year of device) {
      //       if (Number(year.year) === now.getFullYear() && year.values && year.values.length > 0) {
      //         for (const month of year) {
      //           if (Number(month.month) === now.getMonth() + 1 && month.values && month.values.length > 0) {
      //             for (const DayData of month) {
      //               // TODO 前6天
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
    } else {
      const xA: string[] = [];
      for (let i = 1; i < date + 1; i++) { // 1号到今天
        xA.push([now.getMonth() + 1, i].join('.'));
      }
      xAxis = xA; // x 轴
      datas = datas.concat(this.dataList);

      // ['煤', '油', '电', '蒸汽', '热力', '天然气', '水']
      const classDatas = new Array(7);
      classDatas.fill(new Array(date).fill(0));
      for (const device of datas) {
        if (device.datas && device.datas.length > 0) {
          for (const year of device.datas) {
            if (Number(year.year) === now.getFullYear() && year.values && year.values.length > 0) {
              for (const month of year.values) {
                if (Number(month.month) === now.getMonth() + 1 && month.values && month.values.length > 0) {
                  for (const day of month.values) {
                    if (day.values && day.values.length > 0) {
                      for (const item of day.values) {
                        classDatas[0][day.day - 1] += Number(item.coal);
                        classDatas[1][day.day - 1] += Number(item.oil);
                        classDatas[2][day.day - 1] += Number(item.electric);
                        classDatas[3][day.day - 1] += Number(item.steam);
                        classDatas[4][day.day - 1] += Number(item.heat);
                        classDatas[5][day.day - 1] += Number(item.gas);
                        classDatas[6][day.day - 1] += Number(item.water);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      for (let i = 0; i < this.classes.length; i++) {
        series.push({
          name: this.classes[i],
          type: 'line',
          stack: '总量',
          areaStyle: {normal: {}},
          data: classDatas[i],
        });
      }
    }
    if (this.unitType === 'CO2') {
      yAxis = {
        name: 'CO2',
        axisLabel: {
          formatter: '{value} kcal'
        }
      };
    } else {
      yAxis = {
        name: '标准煤',
        axisLabel: {
          formatter: '{value} kgce'
        }
      };
      // 重计算
      // ['煤', '油', '电', '蒸汽', '热力', '天然气', '水']
      const ratios = [this.ratios.coal, this.ratios.oil, this.ratios.electric,
        this.ratios.steam, this.ratios.heat, this.ratios.gas, this.ratios.water];
      for (let j = 0; j < series.length; j++) {
        for (let i = 0; i < series[j].data.length; i++) {
          series[j].data[i] *= Number(ratios[j]);
        }
      }
    }
    return {legend: legend, xAxis: xAxis, yAxis: yAxis, series: series};
  }

  loadBarChart() {
    try {
      const barData = this.getBarData();
      this.CustomChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            dataView: {show: true, readOnly: true},
            magicType: {show: true, type: ['line', 'bar']},
            restore: {show: true},
            saveAsImage: {show: true}
          }
        },
        legend: {
          ...barData.legend,
        },
        xAxis: [
          ...barData.xAxis,
        ],
        yAxis: [
          ...barData.yAxis,
        ],
        series: [
          ...barData.series,
        ]
      };
    } catch (e) {
      console.log(e);
    }
  }

  // 二氧化碳 + 能源
  getBarData() {
    const xAxis = [], series = [];
    const yAxis = [
      {
        type: 'value',
        name: '标准煤',
        axisLabel: {
          formatter: '{value} kgce'
        }
      },
      {
        type: 'value',
        name: 'CO2',
        axisLabel: {
          formatter: '{value} kcal'
        }
      }
    ];
    const legend = {data: ['标准煤', 'CO2']};
    const now = new Date();
    const date = now.getDate();
    let datas = [];
    if (this.timeType === 'week') {
      // TODO 筛选本周数据
    } else {
      const xA: string[] = [];
      for (let i = 1; i < date + 1; i++) { // 1号到今天
        xA.push([now.getMonth() + 1, i].join('.'));
      }
      xAxis.push({
        type: 'category',
        data: xA,
        axisPointer: {
          type: 'shadow'
        }
      });
      datas = datas.concat(this.dataList);

      // ['煤', '油', '电', '蒸汽', '热力', '天然气', '水']
      const classDatas = new Array(7);
      classDatas.fill(new Array(date).fill(0));
      for (const device of datas) {
        if (device.datas && device.datas.length > 0) {
          for (const year of device.datas) {
            if (Number(year.year) === now.getFullYear() && year.values && year.values.length > 0) {
              for (const month of year.values) {
                if (Number(month.month) === now.getMonth() + 1 && month.values && month.values.length > 0) {
                  for (const day of month.values) {
                    if (day.values && day.values.length > 0) {
                      for (const item of day.values) {
                        classDatas[0][day.day - 1] += Number(item.coal);
                        classDatas[1][day.day - 1] += Number(item.oil);
                        classDatas[2][day.day - 1] += Number(item.electric);
                        classDatas[3][day.day - 1] += Number(item.steam);
                        classDatas[4][day.day - 1] += Number(item.heat);
                        classDatas[5][day.day - 1] += Number(item.gas);
                        classDatas[6][day.day - 1] += Number(item.water);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // ['煤', '油', '电', '蒸汽', '热力', '天然气', '水']
      const ratios = [this.ratios.coal, this.ratios.oil, this.ratios.electric,
        this.ratios.steam, this.ratios.heat, this.ratios.gas, this.ratios.water];
      const dataSet1 = new Array(date).fill(0);
      const dataSet2 = new Array(date).fill(0);
      for (let i = 0; i < classDatas.length; i++) {
        for (let j = 0; j < classDatas[i].length; j++) {
          dataSet1[j] += Number(classDatas[i][j]);
          dataSet2[j] += (Number(classDatas[i][j]) * ratios[i]);
        }
      }
      series.push({
        name: '标准煤',
        type: 'bar',
        data: dataSet1
      }, {
        name: 'CO2',
        type: 'line',
        yAxisIndex: 1,
        data: dataSet2
      });
    }
    return {legend: legend, xAxis: xAxis, yAxis: yAxis, series: series};
  }

  loadPieChart() {
    try {
      const pieData = this.getPieData();
      this.CustomChart = {
        title: {
          text: '能源消耗统计',
          x: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 20,
          bottom: 20,
          ...pieData.legend
        },
        series: [
          {
            name: '能源',
            type: 'pie',
            radius: '55%',
            center: ['40%', '50%'],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            ...pieData.series
          }
        ]
      };
    } catch (e) {
      console.log(e);
    }
  }

  getPieData() {
    const legend = {data: this.classes};
    let series = {data: []};
    const now = new Date();
    const date = now.getDate();
    let datas = [];
    if (this.timeType === 'week') {
      // TODO 筛选本周数据
    } else {
      datas = datas.concat(this.dataList);

      // ['煤', '油', '电', '蒸汽', '热力', '天然气', '水']
      const classDatas = new Array(7);
      classDatas.fill(new Array(date).fill(0));
      for (const device of datas) {
        if (device.datas && device.datas.length > 0) {
          for (const year of device.datas) {
            if (Number(year.year) === now.getFullYear() && year.values && year.values.length > 0) {
              for (const month of year.values) {
                if (Number(month.month) === now.getMonth() + 1 && month.values && month.values.length > 0) {
                  for (const day of month.values) {
                    if (day.values && day.values.length > 0) {
                      for (const item of day.values) {
                        classDatas[0][day.day - 1] += Number(item.coal);
                        classDatas[1][day.day - 1] += Number(item.oil);
                        classDatas[2][day.day - 1] += Number(item.electric);
                        classDatas[3][day.day - 1] += Number(item.steam);
                        classDatas[4][day.day - 1] += Number(item.heat);
                        classDatas[5][day.day - 1] += Number(item.gas);
                        classDatas[6][day.day - 1] += Number(item.water);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      const seriesData = [this.classes.length].fill(0);
      for (let i = 0; i < classDatas.length; i++) {
        for (let j = 0; j < classDatas[i].length; j++) {
          seriesData[i] += Number(classDatas[i][j]);
        }
      }
      series = {
        data: seriesData,
      };
    }
    if (this.unitType === 'CO2') {
      // ['煤', '油', '电', '蒸汽', '热力', '天然气', '水']
      const ratios = [this.ratios.coal, this.ratios.oil, this.ratios.electric,
        this.ratios.steam, this.ratios.heat, this.ratios.gas, this.ratios.water];
      for (let i = 0; i < this.classes.length; i++) {
        series.data[i] *= ratios[i];
      }
    }
    return {legend: legend, series: series};
  }
}
