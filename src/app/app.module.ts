import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpModule } from '@angular/http';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { FontAwesomeModule } from 'ngx-icons';
import {BsDatepickerModule, CollapseModule, ModalModule, PaginationModule, TimepickerModule, AlertModule} from 'ngx-bootstrap';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCardModule} from '@angular/material/card';

import { AppComponent } from './app.component';
import { SidebarModule } from 'ng-sidebar';
import { PlotComponent } from './Component/Plot/plot.component';
import { LoginComponent } from './Component/Login/login.component';
import { LoginService } from './Service/login.service';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from './Component/Register/register.component';
import { RegisterService } from './Service/register.service';
import {AdminComponent} from './Component/Admin/admin.component';
import {DashboardComponent} from './Component/Dashboard/dashboard.component';
import {SettingComponent} from './Component/Setting/setting.component';
import {DeviceComponent} from './Component/Device/device.component';
import {DataComponent} from './Component/Data/data.component';
import {RealtimeComponent} from './Component/Realtime/realtime.component';
import {AlarmComponent} from './Component/Alarm/alarm.component';
import {RealtimeContainerComponent} from './Component/RealtimeContainer/realtime-container.component';
import {RatioSettingComponent} from './Component/RatioSetting/ratio-setting.component';
import {SettingContainerComponent} from './Component/SettingContainer/setting-container.component';
import {UnitComponent} from './Component/Unit/unit.component';
import {UnitService} from './Service/unit.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { DataService } from './Service/data.service';
import { DeviceService } from './Service/device.service';
import { AlarmService } from './Service/alarm.service';
import { RatioService } from './Service/ratio.service';
import {ExportService} from './Service/export.service';


@NgModule({
  declarations: [
    AppComponent,
    PlotComponent,
    LoginComponent,
    RegisterComponent,
    AdminComponent,
    DashboardComponent,
    SettingComponent,
    DeviceComponent,
    DataComponent,
    RealtimeComponent,
    RealtimeContainerComponent,
    AlarmComponent,
    RatioSettingComponent,
    SettingContainerComponent,
    UnitComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SidebarModule.forRoot(),
    FormsModule,
    NgxEchartsModule,
    HttpModule,
    NgxMyDatePickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    FontAwesomeModule,
    CollapseModule.forRoot(),
    AlertModule.forRoot(),
    BrowserAnimationsModule,
    MatSidenavModule,
    MatExpansionModule,
    MatCardModule,
  ],
  providers: [
    LoginService,
    RegisterService,
    UnitService,
    DataService,
    DeviceService,
    AlarmService,
    RatioService,
    ExportService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
