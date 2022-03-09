import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { UserInformation } from '../Utils/user-information';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable()

export class RegisterService {
    private changeUrl = 'http://39.108.155.174/index.php?m=home&c=index&a=changePassword';
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http) {

    }

    change(username: string, oldpassword: string, newpassword: string): Promise<boolean> {
        newpassword = Md5.hashStr(newpassword).toString();
        oldpassword = Md5.hashStr(oldpassword).toString();
        return this.http.post(this.changeUrl, {
            oldpassword: oldpassword,
            newpassword: newpassword,
            username: username
        }).toPromise().then(response => JSON.parse(response.json()).data as boolean)
                        .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}