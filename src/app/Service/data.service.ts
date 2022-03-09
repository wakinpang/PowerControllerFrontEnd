import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {DataPojo, TimeData, ViewDayData} from '../Entity/DataPojo';
import * as Urls from '../Share/Api';

@Injectable()
export class DataService {
  constructor(private http: Http) {
  }

  async fetchDatas(range: Date[], device: any): Promise<DataPojo[]> {
    const resp = await this.http.post(Urls.SearchData, {
      datefrom: new Date(+range[0] + 8 * 3600 * 1000).toISOString(),
      dateto: new Date(+range[1] + 8 * 3600 * 1000).toISOString(),
      device: device
    }).toPromise();
    const json = await JSON.parse(resp.json());
    console.log(json);

    if (!json.success) {
      throw new Error('数据加载异常');
    }

    return json.data as DataPojo[];
  }

  async fetchDay(day: string, device: string): Promise<TimeData[][]> {
    const res = await this.http.post(Urls.SearchOneDay, {
      day: day,
      device: device,
    }).toPromise();
    const json = await JSON.parse(res.json());
    console.log(json);

    if (!json.success) {
      throw new Error('数据加载异常');
    }

    return json.datas as TimeData[][];
  }

  async putData(data: TimeData, device: string): Promise<boolean> {
    const resp = await this.http.post(Urls.AddData, {
      coal: data.coal,
      oil: data.oil,
      electric: data.electric,
      steam: data.steam,
      heat: data.heat,
      gas: data.gas,
      water: data.water,
      sensor: device
    }).toPromise();
    const json = await JSON.parse(resp.json());

    return json.success;
  }

  async updateData(data: TimeData, device: string): Promise<boolean> {
    const resp = await this.http.post(Urls.ChangeData, {
      id: data.id,
      coal: data.coal,
      oil: data.oil,
      electric: data.electric,
      steam: data.steam,
      heat: data.heat,
      gas: data.gas,
      water: data.water,
      sensor: device
    }).toPromise();
    const json = await JSON.parse(resp.json());

    return json.success;
  }

  async deleteData(id: string[]): Promise<boolean> {
    const resp = await this.http.post(Urls.DeleteData, {id: id}).toPromise();
    const json = await JSON.parse(resp.json());
    console.log(json);

    return json.success;
  }

  fetchWeekData(): Promise<TimeData[]> {
    return this.http.get(Urls.SearchWeekData).toPromise()
      .then(res => JSON.parse(res.json()).data.datas as TimeData[]);
  }
}
