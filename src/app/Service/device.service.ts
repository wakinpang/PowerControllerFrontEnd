import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import * as Urls from '../Share/Api';
import {DevicePojo} from '../Entity/DevicePojo';

@Injectable()

export class DeviceService {
  constructor(private http: Http) {
  }

  async getDevices(): Promise<DevicePojo[]> {
    const res = await this.http.get(Urls.ShowDevices).toPromise();
    const json = await JSON.parse(res.json());

    if (!json.success) {
      throw new Error('加载设备失败！');
    }

    return json.data as DevicePojo[];
  }

  async putDevice(data: DevicePojo): Promise<boolean> {
    const resp = await this.http.post(Urls.AddDevice, {
      sid: data.sid,
      name: data.name,
      desc: data.desc,
      location: data.location,
      type: data.type,
      status: 1,
    }).toPromise();
    const json = await JSON.parse(resp.json());

    return json.success;
  }

  async updateDevice(data: DevicePojo): Promise<boolean> {
    const res = await this.http.post(Urls.ChangeDevice, {
      id: data.id,
      sid: data.sid,
      name: data.name,
      desc: data.desc,
      location: data.location,
      type: data.type,
      status: data.status,
    }).toPromise();
    const json = await JSON.parse(res.json());

    return json.success;
  }

  async deleteDevice(id: number): Promise<boolean> {
    const res = await this.http.post(Urls.DeleteDevice, {id: id}).toPromise();
    const json = await JSON.parse(res.json());

    return json.success;
  }

  async searchDevice(id: string): Promise<DevicePojo[]> {
    const res = await this.http.post(Urls.SearchDevice, {id: id}).toPromise();
    const json = await JSON.parse(res.json());
    if (!json.success) {
      throw new Error('搜索设备失败！');
    }

    return json.data as DevicePojo[];
  }
}
