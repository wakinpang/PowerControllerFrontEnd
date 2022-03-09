export class DataPojo {
  id: string;
  sid: string;
  name: string;
  desc: string;
  type: string;
  position: string;

  datas: YearData[];
}

class YearData {
  year: number;
  values: MonthData[];
}

class MonthData {
  month: number;
  values: DayData[];
}

export class DayData {
  day: number;
  values: TimeData[];
}

export class ViewDayData {
  device: string;
  date: string;
  values: TimeData[];
}

export class TimeData {
  id: string;
  coal: number;
  oil: number;
  electric: number;
  steam: number;
  heat: number;
  gas: number;
  water: number;
  createdAt: string;
}
