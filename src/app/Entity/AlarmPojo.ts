import {DevicePojo} from './DevicePojo';

export class AlarmPojo {
    id: number;
    sensor: DevicePojo;
    createdAt: string;
    value: string;
    unit: string;
    desc: string;
    mode: string;
    type: string;
    status: number;
}

export interface AlarmInterface {
    device: string;
    time: string;
    value: string;
    unit: string;
    desc: string;
    mode: string;
    type: string;
    status: boolean;
}
