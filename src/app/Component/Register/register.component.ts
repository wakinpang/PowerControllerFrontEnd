import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../Service/register.service';

@Component({
    selector: 'register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
    constructor(private registerService: RegisterService) {

    }

    //userInfo
    username: string = '';
    oldpassword: string = '';
    newpassword: string = '';
    confirmpassword: string = '';

    //msg
    errorMessage = '';

    ngOnInit() {

    }

    confirmClick() {
        if (this.confirmpassword != this.newpassword || this.confirmpassword == '') {
            this.errorMessage = '两次输入的密码不一致！';
            return;
        }

        this.registerService.change(this.username, this.oldpassword, this.newpassword)
                            .then(success => {
                                if (!success) {
                                    console.log('change failed');
                                }
                            })
    }
}