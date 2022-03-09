import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ExportService {
  constructor(private http: Http) {
  }

  // TODO 导出数据
}
