import { ElementItem } from './element-item'

export const ElementItems: ElementItem[] = [
    {
        "category": "设备图形",
        "content": [{ "key": "圆形", "value": "","parameters":[
            {"key":"input","description":"输入值","type":"text",defaultValue:"0",selectValue:[],"value":""}
        ] },
         { "key": "正方形", value: "" ,parameters:[
             {"key":"input","description":"测试参数2","type":"select",defaultValue:"1",selectValue:['1','2'],"value":""}]}, 
         { "key": "椭圆形", value: "",parameters:[] },
         { "key": "三角形", value: "" ,parameters:[]}, 
         { "key": "长方形", "value": "",parameters:[] }]
    },
    {
        "category": "损失", "content": [{ "key": "损失去处", "value": "",parameters:[] }]
    }
]