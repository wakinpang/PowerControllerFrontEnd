import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PlotComponent } from './Component/Plot/plot.component';
import { LoginComponent } from './Component/Login/login.component';
import { RegisterComponent } from './Component/Register/register.component';
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

const routesForSetting: Routes = [
  { path: 'main', component: SettingComponent },
  { path: 'ratio', component: RatioSettingComponent },
  { path: 'change', component: RegisterComponent},
  { path: 'unit', component: UnitComponent },
  { path: '**', redirectTo: 'main' }
];

const routesForRealTime: Routes = [
  { path: 'main', component: RealtimeComponent },
  { path: 'alarm', component: AlarmComponent },
  { path: '**', redirectTo: 'main' }
];

const routesForAdmin: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'real-time', component: RealtimeContainerComponent, children: routesForRealTime },
  { path: 'plot', component: PlotComponent },
  { path: 'data', component: DataComponent},
  { path: 'device', component: DeviceComponent},
  { path: 'setting', component: SettingContainerComponent, children: routesForSetting },
  { path: '**', redirectTo: 'dashboard' }
];

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'admin', children: routesForAdmin, component: AdminComponent },
    { path: '**', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
    exports: [ RouterModule ],
    imports: [
        RouterModule.forRoot(routes),
    ]
})

export class AppRoutingModule {

}

