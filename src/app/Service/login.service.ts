import { Injectable } from '@angular/core';
import { UserInformation } from '../Utils/user-information';
import { Http, Headers } from '@angular/http';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable()

export class LoginService {
    public userInfo: UserInformation = new UserInformation();
    private loginUrl = 'http://39.108.155.174/index.php?m=home&c=index&a=login';
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http) {
    }

    login(userInfo: UserInformation): Promise<boolean> {
        userInfo.password = Md5.hashStr(userInfo.password).toString();
        console.log(userInfo.password);
        return this.http.post(this.loginUrl, userInfo)
                        .toPromise()
                        .then(response => JSON.parse(response.json()) as boolean)
                        .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
