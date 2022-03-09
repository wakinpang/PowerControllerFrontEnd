import {Component, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {DeviceService} from '../../Service/device.service';
import {DevicePojo} from '../../Entity/DevicePojo';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
})
export class DeviceComponent implements OnInit {
  constructor(private modalService: BsModalService,
              private deviceService: DeviceService) {
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
  list: DevicePojo[] = [];
  pageList: DevicePojo[] = [];
  page: DevicePojo[] = [];
  editData: DevicePojo | null = null;

  // Modal
  modalRef: BsModalRef;
  newDevice: DevicePojo;

  async ngOnInit() {
    try {
      this.list = await this.deviceService.getDevices();
      this.pageList = this.list;
      this.onPageChanged();

    } catch (e) {
      console.log(e);
      this.warningMsg = '设备加载失败！';
    }
  }

  onPageChanged($event = null) {
    if (!$event) {
      this.CurrentPage = 1;
      this.TotalItems = this.pageList.length;
    } else {
      this.CurrentPage = $event.page;
    }
    const from = (this.CurrentPage - 1) * this.PerPage;
    const to = from + this.PerPage;
    this.page = this.pageList.slice(from, to);
  }

  onItemEdit(data: DevicePojo) {
    this.editData = new DevicePojo();
    this.editData.id = data.id;
    this.editData.sid = data.sid;
    this.editData.name = data.name;
    this.editData.desc = data.desc;
    this.editData.type = data.type;
    this.editData.location = data.location;
    this.editData.status = data.status;
  }

  onItemCancel() {
    this.editData = null;
  }

  onSearch() {
    if (this.device === '') {
      this.pageList = this.list;
    } else {
      const regx = new RegExp(this.device, 'i');
      this.pageList = this.list.filter(item => regx.test(item.sid));
    }
    this.onPageChanged();
  }

  async onSave() {
    try {
      if (!this.valDevice(this.newDevice)) {
        return;
      }
      const result = await this.deviceService.putDevice(this.newDevice);
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

  async onItemConfirm(data: DevicePojo) {
    try {
      if (!this.valDevice(this.editData)) {
        return;
      }
      const result = await this.deviceService.updateDevice(this.editData);
      if (result) {
        this.successMsg = '修改成功！';
        data.sid = this.editData.sid;
        data.name = this.editData.name;
        data.desc = this.editData.desc;
        data.type = this.editData.type;
        data.location = this.editData.location;
        data.status = this.editData.status;
        await this.onRefresh();
      } else {
        this.warningMsg = '修改失败！';
      }
    } catch (e) {
      console.log(e);
      this.warningMsg = '修改失败！';
    } finally {
      this.editData = null;
    }
  }

  async onDelete() {
    try {
      const result = await this.deviceService.deleteDevice(this.newDevice.id);
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

  async onRefresh() {
    try {
      this.list = await this.deviceService.getDevices();
      this.pageList = this.list;
      this.onPageChanged({page: this.CurrentPage});

    } catch (e) {
      console.log(e);
      this.warningMsg = '设备刷新失败！';
    }
  }

  valDevice(data: DevicePojo): boolean {
    if (!data.sid || data.sid === '') {
      this.warningMsg = '序列号不能为空';
      return false;
    }
    if (!data.name || data.name === '') {
      this.warningMsg = '名称不能为空';
      return false;
    }
    if (!data.desc || data.desc === '') {
      this.warningMsg = '描述不能为空';
      return false;
    }
    if (!data.location || data.location === '') {
      this.warningMsg = '位置不能为空';
      return false;
    }
    if (!data.type || data.type === '') {
      this.warningMsg = '类型不能为空';
      return false;
    }
    return true;
  }

  onNew(template: TemplateRef<any>) {
    this.openModal(template, new DevicePojo());
  }

  openModal(template: TemplateRef<any>, data: DevicePojo) {
    this.newDevice = data;
    this.modalRef = this.modalService.show(template);
  }

  onSuccessClick() {
    this.successMsg = '';
  }

  onWarningClick() {
    this.warningMsg = '';
  }
}
