export const BaseUrl = 'http://39.108.155.174/index.php?';
export const MockUrl = 'https://www.easy-mock.com/mock/5a60f0c8bef1c22c445919f9/Power';
export const MockApi = MockUrl + '/api';

export const LoginUrl = BaseUrl + 'm=home&c=index&a=login';

export const UnitUrl = MockApi + '/units';
export const DataUrl = MockApi + '/datas';
export const DeviceUrl = MockApi + '/devices';
export const AlarmUrl = MockApi + '/alarm';

//data
export const SearchWeekData = BaseUrl + 'm=home&c=data&a=searchWeekDay';
export const SearchData = BaseUrl + 'm=home&c=data&a=searchDay';
export const AddData = BaseUrl + 'm=home&c=data&a=insertDatas';
export const ChangeData = BaseUrl + 'm=home&c=data&a=changeDatas';
export const DeleteData = BaseUrl + 'm=home&c=data&a=deleteDatas';
export const SearchOneDay = BaseUrl + 'm=home&c=data&a=searchOneDay';

//Unit
export const AddUnit = BaseUrl + 'm=home&c=units&a=addId';
export const DeleteUnit = BaseUrl + 'm=home&c=units&a=deleteId';
export const ChangeUnit = BaseUrl + 'm=home&c=units&a=changeId';
export const ShowUnits = BaseUrl + 'm=home&c=units&a=showList';

//Ratio
export const AddRatio = BaseUrl + 'm=home&c=coefficient&a=addId';
export const DeleteRatio = BaseUrl + 'm=home&c=coefficient&a=deleteId';
export const ChangeRatio = BaseUrl + 'm=home&c=coefficient&a=change';
export const ShowRatios = BaseUrl + 'm=home&c=coefficient&a=showList';

//Device
export const AddDevice = BaseUrl + 'm=home&c=Sensor&a=addId';
export const DeleteDevice = BaseUrl + 'm=home&c=Sensor&a=deleteId';
export const ChangeDevice = BaseUrl + 'm=home&c=Sensor&a=change';
export const SearchDevice = BaseUrl + 'm=home&c=Sensor&a=search';
export const ShowDevices = BaseUrl + 'm=home&c=Sensor&a=showList';

//Alarm
export const AddAlarm = BaseUrl + 'm=home&c=Clock&a=addId';
export const DeleteAlarm = BaseUrl + 'm=home&c=Clock&a=deleteId';
export const ChangeAlarm = BaseUrl + 'm=home&c=Clock&a=change';
export const SearchAlarm = BaseUrl + 'm=home&c=Clock&a=search';
export const ShowAlarms = BaseUrl + 'm=home&c=Clock&a=showList';
