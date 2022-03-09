import {Component, OnInit} from '@angular/core';
import {LoginService} from '../../Service/login.service';
import {Router} from '@angular/router';
import {UserInformation} from '../../Utils/user-information';
import {RegisterService} from '../../Service/register.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  constructor(private loginService: LoginService,
              private router: Router,
              private registerService: RegisterService) {
  }

  userInfo: UserInformation = new UserInformation();
  isEditing = false;
  isUpdating = false;

  newPwd: string;
  conPwd: string;

  errorMsg = '';
  warnMsg = '';
  succMsg = '';

  ngOnInit() {
    this.userInfo = this.loginService.userInfo;
  }

  toggleEdit() {
    if (this.isEditing) {
      // reset
      this.newPwd = '';
      this.conPwd = '';
    }
    this.isEditing = !this.isEditing;
  }

  async onChangePwd() {
    try {
      this.onClearMsg();
      if (!this.newPwd || this.newPwd === '' || !this.conPwd || this.conPwd === '') {
        this.warnMsg = '密码不能为空';
        return;
      }
      if (this.newPwd.length < 6 || this.conPwd.length < 6) {
        this.warnMsg = '密码长度不得少于6位';
        return;
      }
      if (this.newPwd !== this.conPwd) {
        this.warnMsg = '两次输入的密码不一致';
        return;
      }
      this.isUpdating = true;
      const result = await this.registerService.change(this.userInfo.phone, this.userInfo.password, this.newPwd);
      this.isUpdating = false;
      if (result) {
        this.succMsg = '密码修改成功！';
        this.toggleEdit();
      } else {
        this.errorMsg = '密码修改失败！';
      }
    } catch (e) {
      console.log(e);
      this.errorMsg = '密码修改失败！';
    }
  }

  onClearMsg() {
    this.errorMsg = '';
    this.warnMsg = '';
    this.succMsg = '';
  }

  onErrorClick() {
    this.errorMsg = '';
  }

  onWarnClick() {
    this.warnMsg = '';
  }

  onSuccessClick() {
    this.succMsg = '';
  }
}
