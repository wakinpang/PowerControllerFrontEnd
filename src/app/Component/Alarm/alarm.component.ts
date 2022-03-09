import {Component, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {AlarmPojo} from '../../Entity/AlarmPojo';
import {AlarmService} from '../../Service/alarm.service';

@Component({
  selector: 'app-alarm',
  templateUrl: './alarm.component.html',
  styleUrls: ['./alarm.component.css']
})
export class AlarmComponent implements OnInit {
  constructor(private modalService: BsModalService,
              private alarmService: AlarmService) {
  }

  successMsg = '';
  warningMsg = '';

  // 分页
  TotalItems = 0;
  CurrentPage = 1;
  MaxSize = 5;
  PerPage = 20;

  // 查询
  device = '';
  dateRange: Date[] = [new Date(), new Date()];
  page: AlarmPojo[] = [];
  list: AlarmPojo[] = [];
  pageList: AlarmPojo[] = [];

  // Modal
  modalRef: BsModalRef;
  nowData: AlarmPojo;

  async ngOnInit() {
    try {
      this.list = await this.alarmService.fetchAlarm();
      this.pageList = this.list;
      this.onPageChanged();
    } catch (e) {
      console.log(e);
      this.warningMsg = '警告加载失败！';
    }
  }


  onPageChanged($event = null) {
    if (!$event) {
      this.TotalItems = this.pageList.length;
      this.CurrentPage = 1;
    } else {
      this.CurrentPage = $event.page;
    }
    const from = (this.CurrentPage - 1) * this.PerPage;
    const to = from + this.PerPage;
    this.page = this.pageList.slice(from, to);
  }

  async onSearch() {
    try {
      this.pageList = await this.alarmService.searchAlarm(this.device, this.dateRange);
    } catch (e) {
      console.log(e);
      this.warningMsg = '查询失败！';
      return;
    }
    this.onPageChanged();
  }

  openModal(template: TemplateRef<any>, data: AlarmPojo) {
    this.nowData = data;
    this.modalRef = this.modalService.show(template);
  }

  async onDelete() {
    try {
      const result = await this.alarmService.deleteAlarm(this.nowData.id);
      if (result) {
        this.successMsg = '删除成功！';
        await this.onRefresh();
      } else {
        this.warningMsg = '删除失败！';
      }
    } catch (e) {
      console.log(e);
      this.warningMsg = '删除失败！';
    } finally {
      this.modalRef.hide();
    }
  }

  async onConfirm(data: AlarmPojo) {
    try {
      data.status = 1;
      const result = await this.alarmService.updateAlarm(data);
      if (result) {
        this.successMsg = '处理成功！';
        data.status = 1;
      } else {
        this.warningMsg = '处理失败！';
        data.status = 0;
      }
    } catch (e) {
      console.log(e);
      this.warningMsg = '处理失败！';
    }
  }

  async onRefresh() {
    try {
      this.list = await this.alarmService.fetchAlarm();
      this.pageList = this.list;
      this.onPageChanged({page: this.CurrentPage});
    } catch (e) {
      console.log(e);
      this.warningMsg = '警告刷新失败！';
    }
  }

  onSuccessClick() {
    this.successMsg = '';
  }

  onWarningClick() {
    this.warningMsg = '';
  }
}
