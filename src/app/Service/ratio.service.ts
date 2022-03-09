import {Injectable} from '@angular/core';
import {RatioPojo} from '../Entity/RatioPojo';
import {Http} from '@angular/http';
import * as Urls from '../Share/Api';

@Injectable()

export class RatioService {
  constructor(private http: Http) {

  }

  getDatas(): Promise<RatioPojo[]> {
    return this.http.get(Urls.ShowRatios).toPromise()
      .then(res => JSON.parse(res.json()).data as RatioPojo[]);
  }

  async updateRatio(old: RatioPojo, from: number, to: number, value: number): Promise<boolean> {
    const res = await this.http.post(Urls.ChangeRatio, {
      from: old.from.id,
      to: old.to.id,
      new_from: from,
      new_to: to,
      value: value,
    }).toPromise();

    const json = await JSON.parse(res.json());

    return json.success;
  }

  async putRatio(data: RatioPojo): Promise<boolean> {
    const res = await this.http.post(Urls.AddRatio, {
      from: data.from.id,
      to: data.to.id,
      value: data.value
    }).toPromise();

    const json = await JSON.parse(res.json());

    return json.success;
  }

  async deleteRatio(data: RatioPojo): Promise<boolean> {
    const res = await this.http.post(Urls.DeleteRatio, {
      from: data.from.id,
      to: data.to.id
    }).toPromise();

    const json = await JSON.parse(res.json());

    return json.success;
  }
}
