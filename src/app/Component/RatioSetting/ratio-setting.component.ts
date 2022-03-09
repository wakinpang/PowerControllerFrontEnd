import {Component, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {RatioPojo} from '../../Entity/RatioPojo';
import {RatioService} from '../../Service/ratio.service';
import {UnitService} from '../../Service/unit.service';
import {UnitPojo} from '../../Entity/UnitPojo';

@Component({
  selector: 'app-ratio-setting',
  templateUrl: './ratio-setting.component.html',
  styleUrls: ['./ratio-setting.component.css']
})
export class RatioSettingComponent implements OnInit {
  constructor(private modalService: BsModalService,
              private ratioService: RatioService,
              private unitService: UnitService) {
  }

  successMsg = '';
  warningMsg = '';

  // 分页
  TotalItems = 0;
  CurrentPage = 1;
  MaxSize = 5;
  PerPage = 20;

  // Modal
  modalRef: BsModalRef;
  nowData: RatioPojo;

  from = -1;
  to = -1;
  value = 0;
  oldItem: RatioPojo | null = null;

  // 查询
  unitList: UnitPojo[];
  list: RatioPojo[] = [];
  siftList: RatioPojo[] = [];
  page: RatioPojo[] = [];
  unitA = -1;
  unitB = -1;

  async ngOnInit() {
    try {
      this.unitList = await this.unitService.fetchUnits();

      this.list = await this.ratioService.getDatas();
      this.siftList = this.list;
      this.onPageChanged();
    } catch (e) {
      console.log(e);
      this.warningMsg = '系数加载失败！';
    }
  }

  onPageChanged($event: any = null) {
    if (!$event) {
      this.CurrentPage = 1;
      this.TotalItems = this.siftList.length;
    } else {
      this.CurrentPage = $event.page;
    }
    const from = (this.CurrentPage - 1) * this.PerPage;
    const to = from + this.PerPage;
    this.page = this.siftList.slice(from, to);
  }

  searchUnit() {
    this.unitA = Number(this.unitA);
    this.unitB = Number(this.unitB);
    if (isNaN(this.unitA) || isNaN(this.unitB)) {
      return;
    }
    if (this.unitB === -1 && this.unitA === -1) {
      this.siftList = this.list;
    } else {
      if (this.unitA === -1) {
        this.siftList = this.list.filter(item => item.to.id === this.unitB);
      } else if (this.unitB === -1) {
        this.siftList = this.list.filter(item => item.from.id === this.unitA);
      } else {
        this.siftList = this.list.filter(item => item.from.id === this.unitA && item.to.id === this.unitB);
      }
    }
    this.onPageChanged();
  }

  async onItemConfirm(data: RatioPojo) {
    try {
      if (!this.from || this.from < 0 || !this.to || this.to < 0 || Number(this.value) === 0) {
        this.warningMsg = '修改失败！';
        return;
      }
      const result = await this.ratioService.updateRatio(data, this.from, this.to, this.value);
      if (result) {
        this.successMsg = '修改成功！';
        await this.onRefresh();
        this.onItemCancel();
      } else {
        this.warningMsg = '修改失败！';
      }
    } catch (e) {
      console.log(e);
      this.warningMsg = '修改失败！';
    }
  }

  onItemEdit(data: RatioPojo) {
    this.oldItem = data;
    this.value = data.value;
    this.from = data.from.id;
    this.to = data.to.id;
  }

  onItemCancel() {
    this.oldItem = null;
    this.from = -1;
    this.to = -1;
    this.value = 0;
  }

  openModal(template: TemplateRef<any>, data: RatioPojo) {
    this.nowData = data;
    this.modalRef = this.modalService.show(template);
  }

  async onDelete() {
    try {
      const result = await this.ratioService.deleteRatio(this.nowData);
      if (result) {
        this.successMsg = '删除成功！';
        await this.onRefresh();
      } else {
        this.warningMsg = '删除失败！';
      }
    } catch (e) {
      console.log(e);
      this.warningMsg = '删除失败！';
    }
    this.modalRef.hide();
  }

  onNew(template: TemplateRef<any>) {
    this.nowData = new RatioPojo();
    this.openModal(template, this.nowData);
  }

  async onRefresh() {
    try {
      this.list = await this.ratioService.getDatas();
      this.siftList = this.list;
      this.onPageChanged({page: this.CurrentPage});
    } catch (e) {
      console.log(e);
      this.warningMsg = '系数刷新失败！';
    }
  }

  async onUpdate() {
    try {
      if (!this.nowData.from || !this.nowData.to || !this.nowData.value) {
        this.warningMsg = '系数信息不完整！';
        return;
      }
      const result = await this.ratioService.putRatio(this.nowData);
      if (result) {
        this.successMsg = '新增成功！';
        await this.onRefresh();
      } else {
        this.warningMsg = '新增失败！';
      }
    } catch (e) {
      console.log(e);
      this.warningMsg = '新增失败！';
    } finally {
      this.modalRef.hide();
    }
  }

  onSuccessClick() {
    this.successMsg = '';
  }

  onWarningClick() {
    this.warningMsg = '';
  }
}
