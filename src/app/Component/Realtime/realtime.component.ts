import {Component, OnInit, OnDestroy} from '@angular/core';
import {DataService} from '../../Service/data.service';

@Component({
  selector: 'app-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.css']
})
export class RealtimeComponent implements OnInit, OnDestroy {
  constructor(private dataService: DataService) {
  }

  // Form
  device = '';
  dateRange: Date[] = [new Date(), new Date()];

  // 图
  ChartType: 'line' | 'bar' | 'pie' = 'line';
  ChartOption: any;
  updateOptions: any;
  data: any[];
  timer: any;
  isLoading = false;

  ngOnInit() {
    this.isLoading = true;
    this.ChangeType();
  }

  onSearch() {
    // TODO
  }

  ChangeType() {
    switch (this.ChartType) {
      case 'line':
        this.InitLineChart();
        break;
      case 'bar':
        this.InitBarChart();
        break;
      case 'pie':
        this.InitPieChart();
        break;
    }
  }

  async InitLineChart() {
    this.data = [];
    this.ChartOption = {
      title: {
        text: '数据监控',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
          show: false
        }
      },
      series: [{
        name: '实时数据',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: this.data,
      }]
    };
    await this.GetLineData();
    this.timer = setInterval(async () => await this.GetLineData(), 1000 * 10 * 60);
  }

  async GetLineData() {
    try {
      const coal = new Array(24).fill(0),
        electric = new Array(24).fill(0),
        oil = new Array(24).fill(0),
        steam = new Array(24).fill(0),
        heat = new Array(24).fill(0),
        water = new Array(24).fill(0),
        gas = new Array(24).fill(0);
      const now = new Date();
      const data = await this.dataService.fetchDay(new Date(+now + 8 * 3600 * 1000).toISOString(), ''); // 获取今天数据
      for (const device of data) {
        for (const item of device) {
          const time = new Date(item.createdAt.replace(/-/g, '/'));
          const hour = time.getHours();
          coal[hour] += Number(item.coal);
          electric[hour] += Number(item.electric);
          oil[hour] += Number(item.oil);
          steam[hour] += Number(item.steam);
          heat[hour] += Number(item.heat);
          water[hour] += Number(item.water);
          gas[hour] += Number(item.gas);
        }
      }
      this.data = [];
      for (let i = 0; i < now.getHours() + 1; i++) {
        this.data.push({
          name: String(i).concat(':00'),
          value: [
            [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/').concat(' ').concat(String(i)).concat(':00'),
            coal[i] + electric[i] + oil[i] + steam[i] + heat[i] + water[i] + gas[i]
          ]
        });
      }
      this.updateOptions = {
        series: [{
          data: this.data
        }]
      };
    } catch (e) {
      console.log(e);
    } finally {
      this.isLoading = false;
    }
  }

  InitBarChart() {
    // TODO
  }

  InitPieChart() {
    // TODO
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
