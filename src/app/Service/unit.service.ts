import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as Urls from '../Share/Api';
import {UnitPojo} from '../Entity/UnitPojo';

@Injectable()
export class UnitService {
  constructor(private http: Http) {
  }

  async fetchUnits(): Promise<UnitPojo[]> {
    const resp = await this.http.get(Urls.ShowUnits).toPromise();
    const json = await JSON.parse(resp.json());

    if (!json.success) {
      throw new Error('单位加载异常');
    }

    return json.data as UnitPojo[];
  }

  async putUnit(name: string, type: string, sign: string): Promise<boolean> {
    const resp = await this.http.post(Urls.AddUnit, {
      type: type,
      name: name,
      unit: sign,
    }).toPromise();
    const json = await JSON.parse(resp.json());

    return json.success;
  }

  async updateUnit(id: number, name: string, type: string, sign: string): Promise<boolean> {
    const resp = await this.http.post(Urls.ChangeUnit, {
      id: id,
      type: type,
      name: name,
      unit: sign,
    }).toPromise();
    const json = await JSON.parse(resp.json());

    return json.success;
  }

  async deleteUnit(id: number): Promise<boolean> {
    const resp = await this.http.post(Urls.DeleteUnit, {id: id}).toPromise();
    const json = await JSON.parse(resp.json());

    return json.success;
  }
}
