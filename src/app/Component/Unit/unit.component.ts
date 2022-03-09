import {Component, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {UnitService} from '../../Service/unit.service';
import {UnitPojo} from '../../Entity/UnitPojo';

@Component({
  selector: 'app-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.css']
})
export class UnitComponent implements OnInit {
  constructor(private modalService: BsModalService,
              private unitService: UnitService) {
  }

  successMsg = '';
  warningMsg = '';

  // 分页
  Items: UnitPojo[] = [];
  TotalItems = 0;
  CurrentPage = 0;
  MaxSize = 5;
  PerPage = 20;

  // Modal
  modalRef: BsModalRef;
  isModify = false;

  // Input
  name = '';
  type = '';
  sign = '';
  units: UnitPojo[] = [];

  // Target
  target: UnitPojo | null = null;

  async ngOnInit() {
    try {
      this.units = await this.unitService.fetchUnits();
      this.TotalItems = this.units.length;
      this.CurrentPage = 1;
      this.Items = this.units.slice(0, this.PerPage);
    } catch (e) {
      console.log(e);
      this.warningMsg = '单位加载失败！';
    }
  }

  onPageChanged(event: any) {
    const from = (event.page - 1) * this.PerPage;
    const to = from + this.PerPage;
    this.Items = this.units.slice(from, to);
  }

  openModal(template: TemplateRef<any>, target: UnitPojo = null) {
    this.modalRef = this.modalService.show(template);
    this.target = target;
  }

  onNew(template: TemplateRef<any>) {
    this.isModify = false;
    this.name = '';
    this.type = '';
    this.sign = '';
    this.openModal(template);
  }

  onModify(template: TemplateRef<any>, target: UnitPojo) {
    this.isModify = true;
    this.name = target.name;
    this.type = target.type;
    this.sign = target.unit;
    this.openModal(template, target);
  }

  async onDelete() {
    if (this.target) {
      try {
        const result = await this.unitService.deleteUnit(this.target.id);
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
    }
    this.modalRef.hide();
  }

  async onUpdate() {
    if (!this.name || this.name === '') {
      this.warningMsg = '名称不能为空！';
      this.modalRef.hide();
      return;
    }
    if (!this.type || this.type === '') {
      this.warningMsg = '分类不能为空！';
      this.modalRef.hide();
      return;
    }
    if (!this.sign || this.sign === '') {
      this.warningMsg = '符号不能为空！';
      this.modalRef.hide();
      return;
    }
    if (this.isModify) {
      if (this.target) {
        try {
          const result = await this.unitService.updateUnit(this.target.id, this.name, this.type, this.sign);
          if (result) {
            this.successMsg = '修改成功！';
            this.target.name = this.name;
            this.target.type = this.type;
            this.target.unit = this.sign;
          } else {
            this.warningMsg = '修改失败！';
          }
        } catch (e) {
          console.log(e);
          this.warningMsg = '修改失败！';
        }
      }
    } else {
      try {
        const result = await this.unitService.putUnit(this.name, this.type, this.sign);
        if (result) {
          this.successMsg = '新增成功！';
          await this.onRefresh();
        } else {
          this.warningMsg = '新增失败！';
        }
      } catch (e) {
        console.log(e);
        this.warningMsg = '新增失败！';
      }
    }
    this.modalRef.hide();
  }

  async onRefresh() {
    try {
      this.units = await this.unitService.fetchUnits();
      this.TotalItems = this.units.length;
      const from = (this.CurrentPage - 1) * this.PerPage;
      const to = from + this.PerPage;
      this.Items = this.units.slice(from, to);
    } catch (e) {
      this.warningMsg = '单位刷新失败！';
    }
  }

  onSuccessClick() {
    this.successMsg = '';
  }

  onWarningClick() {
    this.warningMsg = '';
  }
}
