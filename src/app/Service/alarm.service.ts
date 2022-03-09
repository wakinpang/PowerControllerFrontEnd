import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {AlarmInterface, AlarmPojo} from '../Entity/AlarmPojo';
import * as Urls from '../Share/Api';

@Injectable()
export class AlarmService {
  constructor(private http: Http) {
  }

  async fetchAlarm(): Promise<AlarmPojo[]> {
    const resp = await this.http.get(Urls.ShowAlarms).toPromise();
    const json = await JSON.parse(resp.json());
    console.log(json);

    if (!json.success) {
      throw new Error('报警信息加载失败');
    }

    return json.data as AlarmPojo[];
  }

  async putAlarm(data: AlarmInterface): Promise<boolean> {
    const resp = await this.http.post(Urls.AlarmUrl, (data)).toPromise();
    const json = await JSON.parse(resp.json());

    return json.success;
  }

  async updateAlarm(data: AlarmPojo): Promise<boolean> {
    const resp = await this.http.post(Urls.ChangeAlarm, (data)).toPromise();
    const json = await JSON.parse(resp.json());

    return json.success;
  }

  async deleteAlarm(id: number): Promise<boolean> {
    const resp = await this.http.post(Urls.DeleteAlarm, {id: id}).toPromise();
    const json = await JSON.parse(resp.json());
    console.log(json);
    return json.success;
  }

  async searchAlarm(id: string, date: Date[]): Promise<AlarmPojo[]> {
    const res = await this.http.post(Urls.SearchAlarm, {
      id: id,
      datefrom: new Date(+date[0] + 8 * 3600 * 1000).toISOString(),
      dateto: new Date(+date[1] + 8 * 3600 * 1000).toISOString()
    }).toPromise();
    const json = await JSON.parse(res.json());
    console.log(json);
    if (!json.success) {
      throw new Error('查询失败！');
    }

    return json.data as AlarmPojo[];
  }
}
