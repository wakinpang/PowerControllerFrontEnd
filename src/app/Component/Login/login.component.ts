import {Component, OnInit} from '@angular/core';
import {UserInformation} from '../../Utils/user-information';
import {LoginService} from '../../Service/login.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  userInfo: UserInformation = new UserInformation();
  warningMessage = '';
  errorMessage = '';

  constructor(private loginService: LoginService, private router: Router) {

  }

  ngOnInit(): void {
  }

  loginClick(): void {
    // todo
    // const numReg = new RegExp(/^1[0-9]{10}$/);
    // const passwordReg = new RegExp(/^[a-zA-Z0-9]{6,20}$/);
    //
    // const phoneValid: boolean = numReg.test(this.userInfo.phone);
    // const passwordValid: boolean = passwordReg.test(this.userInfo.password);
    //
    // if (!phoneValid) {
    //   this.warningMessage = '手机号格式错误！';
    //   return;
    // }
    // if (!passwordValid) {
    //   this.warningMessage = '密码格式错误！';
    //   return;
    // }
    //
    // this.loginService.login(this.userInfo).then(success => {
    //   this.loginService.userInfo = this.userInfo;
    //   if (!success) {
    //     this.userInfo.password = '';
    //     return;
    //   }
    
    //   this.router.navigate(['/admin']);
    // });
    this.router.navigate(['/admin']);
  }

  onErrorClick() {
    this.errorMessage = '';
  }

  onWarnClick() {
    this.warningMessage = '';
  }
}
