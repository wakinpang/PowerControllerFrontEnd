import {Component, OnInit, TemplateRef} from '@angular/core';
import {BsLocaleService, BsModalRef, BsModalService} from 'ngx-bootstrap';
import {defineLocale} from 'ngx-bootstrap';
// import {zhCn} from 'ngx-bootstrap/locale';
import { DataService } from '../../Service/data.service';
import { DataPojo, DayData, ViewDayData, TimeData } from '../../Entity/DataPojo';
import { AdminComponent } from '../Admin/admin.component';
import { UnitService } from '../../Service/unit.service';
import { RatioService } from '../../Service/ratio.service';
import { UnitPojo } from '../../Entity/UnitPojo';
import { RatioPojo } from '../../Entity/RatioPojo';

// defineLocale('zh-cn', zhCn);

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {
  constructor(private _localeService: BsLocaleService,
              private modalService: BsModalService,
              private dataService: DataService,
              private ratioService: RatioService) {
    // this._localeService.use('zh-cn');
  }

  // 分页
  TotalItems = 0;
  CurrentPage = 1;
  MaxSize = 5;
  PerPage = 20;
  page: ViewDayData[];

  // 查询
  device = '';
  dateRange: Date[];
  list: DataPojo[] = [];
  isDerive: boolean[] = [];
  days: ViewDayData[];

  // Modal
  modalRef: BsModalRef;
  isModify = false;
  nowData: ViewDayData;
  modifying: boolean[] = [];
  ids: number[] = [];
  selecting: boolean = false;
  isDelete: boolean[] = [];
  backData: TimeData[];

  // 增加
  isCreating: boolean = false;
  newData: any = {
    id: "",
    coal: 0,
    oil: 0,
    electric: 0,
    steam: 0,
    heat: 0,
    gas: 0,
    water: 0,
    createdAt: "",
  }

  // Chart
  formula: string = '';
  formulaErrorMsg: string = '';
  CustomChart: any;
  ratios: any = {
    coal: 0,
    oil: 0,
    electric: 0,
    steam: 0,
    heat: 0,
    gas: 0,
    water: 0,
  }
  classes: string[] = ['煤', '油', '电', '蒸汽', '热力', '天然气', '自来水'];
  types: boolean[] = [];
  disabled: boolean[] = [];
  chartType: string = 'line';
  unitType: string = '标准煤';
  timeType: string = '日';
  timeVal: number = 1;
  ratioList: RatioPojo[] = [];
  colors: any[] = ['#B5C334','#FCCE10','#E87C25','#27727B','#FE8463','#9BCA63', '#FAD860']

  ngOnInit() {
    //AdminComponent.current = 4;
    // TODO fetch data
    this.dateRange = [new Date(), new Date()];
    for (var i = 0; i < 7; i++) {
      this.types.push(true);
      this.disabled.push(false);
    }
    this.ratioService.getDatas().then(res => {
      this.ratioList = res;
      this.unitChanged();
    })

    this.onSearch();
  }

  verifyClick(id: number) {
    this.modifying[id] = false;
    this.backData[id].coal = this.nowData.values[id].coal;
    this.backData[id].oil = this.nowData.values[id].oil;
    this.backData[id].electric = this.nowData.values[id].electric;
    this.backData[id].gas = this.nowData.values[id].gas;
    this.backData[id].heat = this.nowData.values[id].heat;
    this.backData[id].steam = this.nowData.values[id].steam;
    this.backData[id].water = this.nowData.values[id].water;

    this.dataService.updateData(this.nowData.values[id], this.nowData.device)
                    .then(success => {
                      if (!success) console.log('change data failed');
                    })
  }

  cancelClick(id: number) {
    console.log(this.backData);
    this.modifying[id] = false;
    this.nowData.values[id].coal = this.backData[id].coal;
    this.nowData.values[id].oil = this.backData[id].oil;
    this.nowData.values[id].electric = this.backData[id].electric;
    this.nowData.values[id].gas = this.backData[id].gas;
    this.nowData.values[id].heat = this.backData[id].heat;
    this.nowData.values[id].steam = this.backData[id].steam;
    this.nowData.values[id].water = this.backData[id].water;
    console.log(this.backData);
  }

  unitChanged() {
    this.ratios = {
      coal: 0,
      oil: 0,
      electric: 0,
      steam: 0,
      heat: 0,
      gas: 0,
      water: 0,
    }
    for (var i = 0; i < this.disabled.length; i++) {
      this.disabled[i] = false;
    }

    for (var i = 0; i < this.ratioList.length; i++) {
      for (var j = 0; j < this.classes.length; j++) {
        if (this.ratioList[i].from.name == this.classes[j] &&
            this.ratioList[i].to.name == this.unitType) {
          if (this.classes[j] == '煤') this.ratios.coal = this.ratioList[i].value;
          if (this.classes[j] == '油') this.ratios.oil = this.ratioList[i].value;
          if (this.classes[j] == '电') this.ratios.electric = this.ratioList[i].value;
          if (this.classes[j] == '蒸汽') this.ratios.steam = this.ratioList[i].value;
          if (this.classes[j] == '热力') this.ratios.heat = this.ratioList[i].value;
          if (this.classes[j] == '天然气') this.ratios.gas = this.ratioList[i].value;
          if (this.classes[j] == '自来水') this.ratios.water = this.ratioList[i].value;
        }
      }
    }

    // if (this.ratios.coal == 0) { this.types[0] = false; this.disabled[0] = true; }
    // if (this.ratios.oil == 0) { this.types[1] = false; this.disabled[1] = true; }
    // if (this.ratios.electric == 0) { this.types[2] = false; this.disabled[2] = true; }
    // if (this.ratios.steam == 0) { this.types[3] = false; this.disabled[3] = true; }
    // if (this.ratios.heat == 0) { this.types[4] = false; this.disabled[4] = true; }
    // if (this.ratios.gas == 0) { this.types[5] = false; this.disabled[5] = true; }
    // if (this.ratios.water == 0) { this.types[6] = false; this.disabled[6] = true; }
  }

  isTimeIn(to: string, time: string): boolean {
    if (this.timeType == '分' || this.timeType == '时' || this.timeType == '日') {
      let dataTime = this.parseTime(time);
      let bound = this.parseTime(to);

      if (bound.hour > dataTime.hour) {
        return true;
      }
      else if (bound.hour == dataTime.hour && bound.min > dataTime.min) {
        return true;
      }
      else if (bound.hour == dataTime.hour && bound.min == dataTime.min && bound.sec > dataTime.sec) {
        return true;
      }
      else {
        return false;
      }
    }
    else if (this.timeType == '月') {
      let yearTo = parseInt(to.slice(0, 4));
      let yearData = parseInt(time.slice(0, 4));
      let monTo = parseInt(to.slice(5, 7));
      let monData = parseInt(time.slice(5, 7));

      if (yearTo > yearData) {
        return true;
      }
      else if (yearTo == yearData && monTo > monData) {
        return true;
      }
      else {
        return false;
      }
    }
    else if (this.timeType == '年') {
      let yearTo = parseInt(to);
      let yearData = parseInt(time);
      if (yearTo >= yearData) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  TimeAdd(src: string, num: number): [string, number] {
    let srcParsed: any = this.parseTime(src);
    console.log(src, num, srcParsed);
    let switchDay = 0;
    let resStr;
    if (this.timeType == '分' || this.timeType == '时' || this.timeType == '日') {
      if (this.timeType == '分') {
        srcParsed.min += num;
      }
      else if (this.timeType == '时') {
        srcParsed.hour += num;
      }
      else if (this.timeType == '日') {
        srcParsed.hour += num * 24;
      }

      while (srcParsed.min >= 60) {
        srcParsed.hour += 1;
        srcParsed.min -= 60;
      }

      while (srcParsed.hour >= 24) {
        srcParsed.hour -= 24;
        switchDay++;
      }
      resStr = this.convertTime(srcParsed);
    }
    else if (this.timeType == '月') {
      let year = parseInt(src.slice(0, 4));
      let month = parseInt(src.slice(5, 7));

      month += num;

      while (month > 12) {
        month -= 12;
        year += 1;
        switchDay++;
      }

      resStr = year.toString() + '-' + (month < 10 ? '0' : '') + month.toString();
    }
    else if (this.timeType == '年') {
      let year = parseInt(src);
      year += num;
      resStr = year.toString();
    }
    console.log(resStr);
    return [resStr, switchDay];
  }

  convertTime(data: any): string {
    let res: string = '';
    if (data.hour < 10) res += '0';
    res += data.hour.toString() + ':';
    if (data.min < 10) res += '0';
    res += data.min.toString() + ':';
    if (data.sec < 10) res += '0';
    res += data.sec.toString();

    return res;
  }

  parseTime(time: string): any {
    if (this.timeType == '月' || this.timeType == '年') return;
    let houStr = time.slice(0, 2);
    let minStr = time.slice(3, 5);
    let secStr = time.slice(6, 8);

    return {hour: parseInt(houStr),
            min: parseInt(minStr),
            sec: parseInt(secStr)}
  }

  getTimeLength(): number {
    if (this.timeType == '分') {
      let startStr = this.days[0].values[0].createdAt;
      let endStr = this.TimeAdd(this.days[this.days.length - 1].values[this.days[this.days.length - 1].values.length - 1].createdAt, 1)[0];

      let start = this.parseTime(startStr);
      let end = this.parseTime(endStr);
      let dayLength = this.days.length;
      if (dayLength == 1) {
        return (end.hour - start.hour) * 60 + end.min - start.min;
      }
      else {
        return (dayLength - 2) * 1440 + (24 - start.hour) * 60 - start.min + end.hour * 60 + end.min;
      }
    }
    else if ( this.timeType == '时') {
      let startStr = this.days[0].values[0].createdAt;
      let endStr = this.TimeAdd(this.days[this.days.length - 1].values[this.days[this.days.length - 1].values.length - 1].createdAt, 1)[0];

      let start = this.parseTime(startStr);
      let end = this.parseTime(endStr);
      let dayLength = this.days.length;
      if (dayLength == 1) {
        return (end.hour - start.hour);
      }
      else {
        return (dayLength - 2) * 24 + 24 - start.hour + end.hour;
      }
    }
    else if (this.timeType == '日') {
      return this.days.length;
    }
  }

  loadChart() {
    console.log(this.types);
    let chartDatas: number[][][] = []
    let legend: string[] = [];
    let xaxisData: string[] = [];

    for (var i = 0; i < 7; i++) {
      if (this.types[i]) {
        legend.push(this.classes[i]);
      }
    }

    if (this.formula != '') {
      let exists: boolean[] = [false, false, false, false, false, false, false];
      for (var i = 0; i < this.formula.length; i++) {
        if (this.formula[i] == 'a') exists[0] = true;
        if (this.formula[i] == 'b') exists[1] = true;
        if (this.formula[i] == 'c') exists[2] = true;
        if (this.formula[i] == 'd') exists[3] = true;
        if (this.formula[i] == 'e') exists[4] = true;
        if (this.formula[i] == 'f') exists[5] = true;
        if (this.formula[i] == 'g') exists[6] = true;
      }

      for (var i = 0; i < exists.length; i++) {
        if (exists[i]) {
          let now = '';
          let ok = false;
          switch (i) {
            case 0: { now = '煤';break; }
            case 1: { now = '油';break; }
            case 2: { now = '电';break; }
            case 3: { now = '蒸汽';break; }
            case 4: { now = '热力';break; }
            case 5: { now = '天然气';break; }
            case 6: { now = '自来水';break; }
          }
          for (var j = 0; j < legend.length; j++) {
            if (legend[j] == now) {
              ok = true;
              break;
            }
          }

          if (!ok) {
            this.formulaErrorMsg = '公式中元素不存在对应关系！';
            return;
          }
        }
      }
    }
    this.formulaErrorMsg = '';

    chartDatas.push([]);
    for (var j = 0; j < legend.length; j++) {
      chartDatas[0].push([]);
    }

    if (this.timeType == '分' || this.timeType == '时' || this.timeType == '日') {
      let length = this.getTimeLength();
      let step = length / this.timeVal + ((length % this.timeVal == 0) ? 0 : 1)
      let startStr = (this.timeType == '分' || this.timeType == '时') ? this.days[0].values[0].createdAt : '00:00:00';
      let dayNo = 0, minNo = 0;

      for (var i = 0; i < step; i++) {
        xaxisData.push(this.days[dayNo].date + " " + startStr);
        let switchDay: number = 0;
        let data: any = {
          coal: 0,
          oil: 0,
          electric: 0,
          steam: 0,
          heat: 0,
          gas: 0,
          water: 0,
        }
        let addRes = this.TimeAdd(startStr, this.timeVal);
        let next = addRes[0];
        switchDay = addRes[1];

        while (this.isTimeIn(next, this.days[dayNo].values[minNo].createdAt) || switchDay > 0) {
          console.log(this.days[dayNo].values[minNo].createdAt,dayNo, minNo, switchDay);
          data.coal += parseFloat(this.days[dayNo].values[minNo].coal.toString());
          data.oil += parseFloat(this.days[dayNo].values[minNo].oil.toString());
          data.electric += parseFloat(this.days[dayNo].values[minNo].electric.toString());
          data.steam += parseFloat(this.days[dayNo].values[minNo].steam.toString());
          data.heat += parseFloat(this.days[dayNo].values[minNo].heat.toString());
          data.gas += parseFloat(this.days[dayNo].values[minNo].gas.toString());
          data.water += parseFloat(this.days[dayNo].values[minNo].water.toString());

          if (minNo == this.days[dayNo].values.length - 1) {
            minNo = 0;
            dayNo++;
            switchDay--;
            if (switchDay < 0) switchDay = 0;
            if (dayNo === this.days.length){dayNo--;break;}
          }
          else {
            minNo++;
          }
        }

        for (var k = 0; k < legend.length; k++) {
          if (legend[k] == '煤') chartDatas[0][k].push(data.coal * this.ratios.coal)
          if (legend[k] == '油') chartDatas[0][k].push(data.oil * this.ratios.oil)
          if (legend[k] == '电') chartDatas[0][k].push(data.electric * this.ratios.electric)
          if (legend[k] == '蒸汽') chartDatas[0][k].push(data.steam * this.ratios.steam)
          if (legend[k] == '热力') chartDatas[0][k].push(data.heat * this.ratios.heat)
          if (legend[k] == '天然气') chartDatas[0][k].push(data.gas * this.ratios.gas)
          if (legend[k] == '自来水') chartDatas[0][k].push(data.water * this.ratios.water)
        }

        console.log(dayNo)

        startStr = next;
      }
    }
    else {
      if (this.timeType == '月') {
        let monthData: any[] = [];
        for (var i = 0; i < this.list.length; i++) {
          for (var j = 0; j < this.list[i].datas.length; j++) {
            for (var k = 0; k < this.list[i].datas[j].values.length; k++) {
              let data: any = {
                date: '',
                coal: 0,
                oil: 0,
                electric: 0,
                steam: 0,
                heat: 0,
                gas: 0,
                water: 0,
              }
              for (var m = 0; m < this.list[i].datas[j].values[k].values.length; m++) {
                for (var n = 0; n < this.list[i].datas[j].values[k].values[m].values.length; n++) {
                  data.coal += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].coal.toString());
                  data.oil += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].oil.toString());
                  data.electric += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].electric.toString());
                  data.steam += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].steam.toString());
                  data.heat += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].heat.toString());
                  data.gas += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].gas.toString());
                  data.water += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].water.toString());
                }
              }

              data.date = this.list[i].datas[j].year + '-' + ((this.list[i].datas[j].values[k].month < 10) ? '0': '') + this.list[i].datas[j].values[k].month;
              monthData.push(data);
            }
          }
        }

        let timeLength = (parseInt(monthData[monthData.length - 1].date.slice(0, 4)) - parseInt(monthData[0].date.slice(0, 4)))
                          * 12 + parseInt(monthData[monthData.length - 1].date.slice(5, 7)) - parseInt(monthData[0].date.slice(5, 7));
        timeLength = timeLength == 0 ? 1 : timeLength;
        let step = timeLength / this.timeVal + ((length % this.timeVal == 0) ? 0 : 1);
        console.log(timeLength, step);
        let startStr = monthData[0].date;
        let switchYear = 0;
        let monNo = 0;

        for (var i = 0; i < step; i++) {
          xaxisData.push(startStr);
          let data: any = {
            coal: 0,
            oil: 0,
            electric: 0,
            steam: 0,
            heat: 0,
            gas: 0,
            water: 0,
          }
          let addRes = this.TimeAdd(startStr, this.timeVal);
          let next = addRes[0];
          switchYear = addRes[1];

          while (this.isTimeIn(next, monthData[monNo].date)) {
            data.coal += parseFloat(monthData[monNo].coal.toString());
            data.oil += parseFloat(monthData[monNo].oil.toString());
            data.electric += parseFloat(monthData[monNo].electric.toString());
            data.steam += parseFloat(monthData[monNo].steam.toString());
            data.heat += parseFloat(monthData[monNo].heat.toString());
            data.gas += parseFloat(monthData[monNo].gas.toString());
            data.water += parseFloat(monthData[monNo].water.toString());

            monNo++;
            if (monNo == monthData.length) break;
          }

          for (var k = 0; k < legend.length; k++) {
            if (legend[k] == '煤') chartDatas[0][k].push(data.coal * this.ratios.coal)
            if (legend[k] == '油') chartDatas[0][k].push(data.oil * this.ratios.oil)
            if (legend[k] == '电') chartDatas[0][k].push(data.electric * this.ratios.electric)
            if (legend[k] == '蒸汽') chartDatas[0][k].push(data.steam * this.ratios.steam)
            if (legend[k] == '热力') chartDatas[0][k].push(data.heat * this.ratios.heat)
            if (legend[k] == '天然气') chartDatas[0][k].push(data.gas * this.ratios.gas)
            if (legend[k] == '自来水') chartDatas[0][k].push(data.water * this.ratios.water)
          }
          startStr = next;
        }
      }

      if (this.timeType == '年') {
        let yearData: any[] = [];
        for (var i = 0; i < this.list.length; i++) {
          for (var j = 0; j < this.list[i].datas.length; j++) {
            let data: any = {
              date: '',
              coal: 0,
              oil: 0,
              electric: 0,
              steam: 0,
              heat: 0,
              gas: 0,
              water: 0,
            }
            for (var k = 0; k < this.list[i].datas[j].values.length; k++) {
              for (var m = 0; m < this.list[i].datas[j].values[k].values.length; m++) {
                for (var n = 0; n < this.list[i].datas[j].values[k].values[m].values.length; n++) {
                  data.coal += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].coal.toString());
                  data.oil += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].oil.toString());
                  data.electric += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].electric.toString());
                  data.steam += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].steam.toString());
                  data.heat += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].heat.toString());
                  data.gas += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].gas.toString());
                  data.water += parseFloat(this.list[i].datas[j].values[k].values[m].values[n].water.toString());
                }
              }
            }
            data.date = this.list[i].datas[j].year;
            yearData.push(data);
          }
        }

        let timeLength = parseInt(yearData[yearData.length - 1].date) - parseInt(yearData[0].date);
        timeLength = timeLength == 0 ? 1 : timeLength;
        let step = timeLength / this.timeVal + ((length % this.timeVal == 0) ? 0 : 1);
        let startStr = yearData[0].date;
        let yearNo = 0;

        for (var i = 0; i < step; i++) {
          xaxisData.push(startStr);
          let data: any = {
            coal: 0,
            oil: 0,
            electric: 0,
            steam: 0,
            heat: 0,
            gas: 0,
            water: 0,
          }
          let addRes = this.TimeAdd(startStr, this.timeVal);
          let next = addRes[0];

          while (this.isTimeIn(next, yearData[yearNo].date)) {
            data.coal += parseFloat(yearData[yearNo].coal.toString());
            data.oil += parseFloat(yearData[yearNo].oil.toString());
            data.electric += parseFloat(yearData[yearNo].electric.toString());
            data.steam += parseFloat(yearData[yearNo].steam.toString());
            data.heat += parseFloat(yearData[yearNo].heat.toString());
            data.gas += parseFloat(yearData[yearNo].gas.toString());
            data.water += parseFloat(yearData[yearNo].water.toString());

            yearNo++;
            if (yearNo == yearData.length) break;
          }

          for (var k = 0; k < legend.length; k++) {
            if (legend[k] == '煤') chartDatas[0][k].push(data.coal * this.ratios.coal)
            if (legend[k] == '油') chartDatas[0][k].push(data.oil * this.ratios.oil)
            if (legend[k] == '电') chartDatas[0][k].push(data.electric * this.ratios.electric)
            if (legend[k] == '蒸汽') chartDatas[0][k].push(data.steam * this.ratios.steam)
            if (legend[k] == '热力') chartDatas[0][k].push(data.heat * this.ratios.heat)
            if (legend[k] == '天然气') chartDatas[0][k].push(data.gas * this.ratios.gas)
            if (legend[k] == '自来水') chartDatas[0][k].push(data.water * this.ratios.water)
          }

          startStr = next;
        }
      }
    }

    if (this.chartType == 'line') {
      this.CustomChart = {
        title: {
					text: '能源总量趋势图',
				},
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
					data: legend,
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				xAxis: [
					{
						type: 'category',
						boundaryGap: false,
            data: xaxisData,
            name: this.timeVal.toString() + this.timeType,
					}
				],
				yAxis: [
					{
            type: 'value',
            name: this.unitType
					}
				],
				series: this.getSeries('line', chartDatas, legend)
      }
    }
    else if (this.chartType == 'bar') {
      this.CustomChart = {
        title: {
					text: '各能源详细图',
				},
				legend: {
					data: legend,
					align: 'left'
				},
				tooltip: {},
				xAxis: {
					data: xaxisData,
					silent: false,
					splitLine: {
						show: false
					},
					name: this.timeVal.toString() + this.timeType,
				},
				yAxis: {
          name: this.unitType
				},
				series: this.getSeries('bar', chartDatas, legend),
				animationEasing: 'elasticOut',
				animationDelayUpdate: function (idx) {
					return idx * 5;
				}
      }
    }
    else {
      this.CustomChart = {
        title: {
					text: '各能源占比图',
        },
				legend: {
					data: legend,
					align: 'left'
				},
				tooltip: {
					trigger: 'item',
					formatter: '{c} ({d}%)'
        },
        color: this.colors,
				series: this.getSeries('pie', chartDatas, legend),
				animationEasing: 'elasticOut',
				animationDelayUpdate: function (idx) {
					return idx * 5;
				}
      }
    }
  }

  getSeries(type: string, datas: number[][][], legend: string[]): any[] {
		let series: any[] = [];
		if (type == 'pie'){
			let tmpDatas: any[] = [];
			for (var i = 0; i < legend.length; i++){
        let temp: number = 0;
        for (var k = 0; k < datas.length; k++) {
          for (var j = 0; j < datas[k][i].length; j++) {
            temp += parseFloat(datas[k][i][j].toString());
          }
        }
        tmpDatas.push({
          value: temp,
          name: legend[i]
        });
			}

			let one: any = {
				name: legend,
				type: type,
        data: tmpDatas,
				animationDelay: function (idx) {
					return idx * 10;
				}
			}
			series.push(one);
		}
		else if (type == 'line') {
      let data: number[] = [];
      console.log(datas);
      for (var k = 0; k < datas.length; k++) {
        for (var i = 0; i < datas[k][0].length; i++) {
          let temp: number = 0;
          let a, b, c, d, e, f, g: number = 0;
          for (var j = 0; j < legend.length; j++) {
            if (this.formula != '') {
              if (legend[j] == '煤') a = parseFloat(datas[k][j][i].toString());
              if (legend[j] == '油') b = parseFloat(datas[k][j][i].toString());
              if (legend[j] == '电') c = parseFloat(datas[k][j][i].toString());
              if (legend[j] == '蒸汽') d = parseFloat(datas[k][j][i].toString());
              if (legend[j] == '热力') e = parseFloat(datas[k][j][i].toString());
              if (legend[j] == '天然气') f = parseFloat(datas[k][j][i].toString());
              if (legend[j] == '自来水') g = parseFloat(datas[k][j][i].toString());
            }
            else {
              temp = temp + parseFloat(datas[k][j][i].toString());
            }
            //console.log(temp, this.chart.datas[j][i]);
          }

          if (this.formula != '') {
            data.push(eval(this.formula));
          }
          else {
            data.push(temp);
          }
        }
      }

			let temp: any = {
				name: '总能量',
				type: type,
        data: data,
        itemStyle: {
          normal: {
            color: this.colors[6]
          }
        },
				animationDelay: function (idx) {
					return idx * 10;
				}
			}
      series.push(temp);
		}
		else {
        for (var i = 0; i < legend.length; i++) {
          let len: number = datas.length * datas[0][0].length;
          let data: number[] = [];
          for (var j = 0; j < datas.length; j++) {
            for (var k = 0; k < datas[j][0].length; k++) {
              data.push(datas[j][i][k])
            }
          }
          let temp: any = {
            name: legend[i],
            type: type,
            data: data,
            itemStyle: {
              normal: {
                color: this.colors[i]
              }
            },
            animationDelay: function (idx) {
              return idx * 10;
            }
          }
          series.push(temp);
        }
    }

		return series;
	}

  onSearch() {
    // TODO onSearch
    console.log(this.dateRange);
    this.dataService.fetchDatas(this.dateRange, this.device).then(res => {
      if (res == null) return;
      this.list = res;
      this.isDerive = [];
      this.days = [];
      this.TotalItems = 0;

      for (var i = 0; i < this.list.length; i++) {
        console.log(1);
        for (var j = 0; j < this.list[i].datas.length; j++) {
          console.log(2)
          for (var k = 0; k < this.list[i].datas[j].values.length; k++) {
            console.log(this.list[i].datas[j].values[0].values.length);
            for (var m = 0; m < this.list[i].datas[j].values[k].values.length; m++) {
              console.log(4)
              this.isDerive.push(false);
              this.days.push({
                device: this.list[i].id,
                date: this.list[i].datas[j].year + '-' + this.list[i].datas[j].values[k].month + '-'
                      + this.list[i].datas[j].values[k].values[m].day,
                values: this.list[i].datas[j].values[k].values[m].values
              });
              this.TotalItems++;
            }
          }
        }
      }
      console.log(this.days)
      this.onPageChanged();
      this.CurrentPage = 1;
      console.log(this.list);
    });
  }

  onNew() {
    this.isCreating = true;
    this.newData = {
      id: "",
      coal: 0,
      oil: 0,
      electric: 0,
      steam: 0,
      heat: 0,
      gas: 0,
      water: 0,
      createdAt: "",
    }
  }

  verifyNew() {
    this.isCreating = false;
    this.dataService.putData({
      id: "",
      coal: this.newData.coal,
      oil: this.newData.oil,
      water: this.newData.water,
      steam: this.newData.steam,
      electric: this.newData.electric,
      heat: this.newData.heat,
      gas: this.newData.gas,
      createdAt: this.newData.createdAt
    }, this.nowData.device).then(success => {
      if (!success) console.log('create data failed')
    })
  }

  onPageChanged() {
    // TODO onPageChanged
    this.page = [];
    for (var i = (this.CurrentPage - 1) * this.PerPage; i < (this.CurrentPage) * this.PerPage; i++) {
      if (i >= this.days.length) break;
      this.page.push(this.days[i]);
    }
    console.log(this.TotalItems, this.days.length, this.CurrentPage)
  }

  save() {
    this.backData = [];
    for (var i = 0; i < this.nowData.values.length; i++) {
      this.backData.push(new TimeData());
      this.backData[i].coal = this.nowData.values[i].coal;
      this.backData[i].oil = this.nowData.values[i].oil;
      this.backData[i].electric = this.nowData.values[i].electric;
      this.backData[i].gas = this.nowData.values[i].gas;
      this.backData[i].heat = this.nowData.values[i].heat;
      this.backData[i].steam = this.nowData.values[i].steam;
      this.backData[i].water = this.nowData.values[i].water;
    }
  }

  delete() {
    let dels: string[] = [];
    for (var i = 0; i < this.isDelete.length; i++) {
      if (this.isDelete[i]) {
        dels.push(this.nowData[i].id);
      }
    }

    this.dataService.deleteData(dels).then(success => {
      if (!success) {
        console.log('delete failed');
      }
      else {
        this.nowData.values.splice(i, 1);

        if (this.nowData.values.length == 0) {
          this.days.splice(this.days.indexOf(this.nowData), 1);
        }

        this.modalRef.hide();
        this.onSearch();
      }
    })
  }

  openModal(template: TemplateRef<any>, data: ViewDayData) {
    this.nowData = data;
    this.save();
    this.ids = [];
    this.modifying = [];
    this.isDelete = [];

    for (var i = 0; i < this.nowData.values.length; i++) {
      this.ids.push(i);
      this.modifying.push(false);
      this.isDelete.push(false);
    }

    this.modalRef = this.modalService.show(template);
  }

  onOutput() {

  }
}
