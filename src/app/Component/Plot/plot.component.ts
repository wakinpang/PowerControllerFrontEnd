import {Component, OnInit, ViewChild} from '@angular/core';
import {ElementItems} from '../../Utils/plot/element-items';
import {ElementItem} from '../../Utils/plot/element-item';
import {Loop} from '../../Utils/plot/Loop';
import {DeviceService} from '../../Service/device.service';
import {DevicePojo} from '../../Entity/DevicePojo';
import * as $ from 'jquery';
import {NavigationEnd, Router} from '@angular/router';
import {RatioPojo} from '../../Entity/RatioPojo';
import {DataPojo, ViewDayData} from '../../Entity/DataPojo';
import {DataService} from '../../Service/data.service';
import {RatioService} from '../../Service/ratio.service';

declare let go: any;
let that = null;

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.css'],
})
export class PlotComponent implements OnInit {
  @ViewChild('myDiagramDiv') div;
  @ViewChild('data') textarea;
  private elements: ElementItem[] = ElementItems;
  json: string;
  private diagram;
  private isLoop = new Loop(false);
  list: DevicePojo[] = [];

  // Chart
  formula = '';
  formulaErrorMsg = '';
  CustomChart: any;
  ratios: any = {
    coal: 0,
    oil: 0,
    electric: 0,
    steam: 0,
    heat: 0,
    gas: 0,
    water: 0,
  };
  classes: string[] = ['煤', '油', '电', '蒸汽', '热力', '天然气', '自来水'];
  types: boolean[] = [];
  disabled: boolean[] = [];
  chartType = 'line';
  unitType = '标准煤';
  timeType = '日';
  timeVal = 1;
  ratioList: RatioPojo[] = [];
  colors: any[] = ['#B5C334', '#FCCE10', '#E87C25', '#27727B', '#FE8463', '#9BCA63', '#FAD860'];

  // 查询
  dateRange: Date[] = [new Date(), new Date()];
  dataList: DataPojo[] = [];
  days: ViewDayData[];

  constructor(private deviceService: DeviceService,
              private router: Router,
              private dataService: DataService,
              private ratioService: RatioService) {

    router.events.subscribe((val) => {
      // see also
      if (val instanceof NavigationEnd) {
        this.isLoop.isLoop = false;
      }
    });
    that = this;
  }


  // 获取当前绘图数据
  loadClick(): void {
    this.json = this.diagram.model.toJson();
  }

  // 加载json数据
  saveClick(): void {
    this.diagram.model = go.Model.fromJson(this.json);
  }

  loopClick(): void {
    if (this.isLoop.isLoop) {
      return;
    }
    this.isLoop.isLoop = true;
    const opacity = 1;
    const down = true;
    this.loop(down, opacity, this.diagram, this.loop, this);
  }

  stopClick(): void {
    this.isLoop.isLoop = false;
  }

  // 重新布局
  relayoutClick(): void {
    this.diagram.commandHandler.resetZoom();
    this.diagram.layoutDiagram(true);
  }

  // 放大
  bigClick(): void {
    this.diagram.commandHandler.increaseZoom();
  }

  // 缩小
  narrowClick(): void {
    this.diagram.commandHandler.decreaseZoom();
  }


  // 初始化
  async ngOnInit() {
    const $go = go.GraphObject.make;
    try {
      this.list = await this.deviceService.getDevices();
      console.log(this.list);
    } catch (e) {
      console.log(e);
    }

    function ResizeMultipleTool() {
      go.ResizingTool.call(this);
      this.name = 'ResizeMultiple';
    }

    // resize
    go.Diagram.inherit(ResizeMultipleTool, go.ResizingTool);
    ResizeMultipleTool.prototype.resize = function (newr) {
      const diagram = this.diagram;
      if (diagram === null) return;
      diagram.selection.each(function (part) {
        if (part instanceof go.Link || part instanceof go.Group) return; // only Nodes and simple Parts
        const obj = part.resizeObject;

        // calculate new location
        const pos = part.position.copy();
        const angle = obj.getDocumentAngle();
        const sc = obj.getDocumentScale();

        const radAngle = Math.PI * angle / 180;
        const angleCos = Math.cos(radAngle);
        const angleSin = Math.sin(radAngle);

        const deltaWidth = newr.width - obj.naturalBounds.width;
        const deltaHeight = newr.height - obj.naturalBounds.height;

        const angleRight = (angle > 270 || angle < 90) ? 1 : 0;
        const angleBottom = (angle > 0 && angle < 180) ? 1 : 0;
        const angleLeft = (angle > 90 && angle < 270) ? 1 : 0;
        const angleTop = (angle > 180 && angle < 360) ? 1 : 0;

        pos.x += sc * ((newr.x + deltaWidth * angleLeft) * angleCos - (newr.y + deltaHeight * angleBottom) * angleSin);
        pos.y += sc * ((newr.x + deltaWidth * angleTop) * angleSin + (newr.y + deltaHeight * angleLeft) * angleCos);

        obj.desiredSize = newr.size;
        part.position = pos;
        part.updateTargetBindings();
      });
    };

    //rotate

    function RotateMultipleTool() {
      go.RotatingTool.call(this);
      this.name = 'RotateMultiple';
      // holds references to all selected non-Link Parts and their offset & angles
      this.initialInfo = null;
      // initial angle when rotating as a whole
      this.initialAngle = 0;
      // rotation point of selection
      this.centerPoint = null;
    }

    go.Diagram.inherit(RotateMultipleTool, go.RotatingTool);

    /**
     * Calls RotatingTool.doActivate, and then remembers the center point of the collection,
     * and the initial distances and angles of selected parts to the center.
     * @this {RotateMultipleTool}
     */
    RotateMultipleTool.prototype.doActivate = function () {
      go.RotatingTool.prototype.doActivate.call(this);
      const diagram = this.diagram;
      // center point of the collection
      this.centerPoint = diagram.computePartsBounds(diagram.selection).center;

      // remember the angle relative to the center point when rotating the whole collection
      this.initialAngle = this.centerPoint.directionPoint(diagram.lastInput.documentPoint);

      // remember initial angle and distance for each Part
      const infos = new go.Map(go.Part, PartInfo);
      const tool = this;
      diagram.selection.each(function (part) {
        tool.walkTree(part, infos);
      });
      this.initialInfo = infos;
    };

    /**
     * @ignore
     * @param {Part} part
     * @param {Map} infos
     */
    RotateMultipleTool.prototype.walkTree = function (part, infos) {
      if (part === null || part instanceof go.Link) return;
      // distance from centerPoint to locationSpot of part
      const dist = Math.sqrt(this.centerPoint.distanceSquaredPoint(part.location));
      // calculate initial relative angle
      const dir = this.centerPoint.directionPoint(part.location);
      // saves part-angle combination in array
      infos.add(part, new PartInfo(dir, dist, part.rotateObject.angle));
      // recurse into Groups
      if (part instanceof go.Group) {
        const it = part.memberParts.iterator;
        while (it.next()) this.walkTree(it.value, infos);
      }
    };

    /**
     * @ignore
     * Internal class that remembers a Part's offset & angle.
     */
    function PartInfo(placementAngle, distance, rotationAngle) {
      this.placementAngle = placementAngle * (Math.PI / 180);  // in radians
      this.distance = distance;
      this.rotationAngle = rotationAngle;  // in degrees
    }

    /**
     * Clean up any references to Parts.
     * @this {RotateMultipleTool}
     */
    RotateMultipleTool.prototype.doDeactivate = function () {
      this.initialInfo = null;
      go.RotatingTool.prototype.doDeactivate.call(this);
    };

    /**
     * Overrides rotatingTool.rotate to rotate all selected objects about their collective center.
     * When the control key is held down while rotating, all selected objects are rotated individually.
     * @this {RotateMultipleTool}
     * @param {number} newangle
     */
    RotateMultipleTool.prototype.rotate = function (newangle) {
      const diagram = this.diagram;
      const e = diagram.lastInput;
      // when rotating individual parts, remember the original angle difference
      const angleDiff = newangle - this.adornedObject.part.rotateObject.angle;
      const tool = this;
      this.initialInfo.each(function (kvp) {
        const part = kvp.key;
        if (part instanceof go.Link) return; // only Nodes and simple Parts
        const partInfo = kvp.value;
        // rotate every selected non-Link Part
        // find information about the part set in RotateMultipleTool.initialInformation
        if (e.control || e.meta) {
          if (tool.adornedObject.part === part) {
            part.rotateObject.angle = newangle;
          } else {
            part.rotateObject.angle += angleDiff;
          }
        } else {
          const radAngle = newangle * (Math.PI / 180); // converts the angle traveled from degrees to radians
          // calculate the part's x-y location relative to the central rotation point
          const offsetX = partInfo.distance * Math.cos(radAngle + partInfo.placementAngle);
          const offsetY = partInfo.distance * Math.sin(radAngle + partInfo.placementAngle);
          // move part
          part.location = new go.Point(tool.centerPoint.x + offsetX, tool.centerPoint.y + offsetY);
          // rotate part
          part.rotateObject.angle = partInfo.rotationAngle + newangle;
        }
      });
    };

    /**
     * This override needs to calculate the desired angle with different rotation points,
     * depending on whether we are rotating the whole selection as one, or Parts individually.
     * @this {RotateMultipleTool}
     * @param {Point} newPoint in document coordinates
     */
    RotateMultipleTool.prototype.computeRotate = function (newPoint) {
      const diagram = this.diagram;
      let angle;
      const e = diagram.lastInput;
      if (e.control || e.meta) {  // relative to the center of the Node whose handle we are rotating
        const part = this.adornedObject.part;
        const rotationPoint = part.getDocumentPoint(part.locationSpot);
        angle = rotationPoint.directionPoint(newPoint);
      } else {  // relative to the center of the whole selection
        angle = this.centerPoint.directionPoint(newPoint) - this.initialAngle;
      }
      if (angle >= 360) angle -= 360;
      else if (angle < 0) angle += 360;
      const interval = Math.min(Math.abs(this.snapAngleMultiple), 180);
      const epsilon = Math.min(Math.abs(this.snapAngleEpsilon), interval / 2);
      // if it's close to a multiple of INTERVAL degrees, make it exactly so
      if (!diagram.lastInput.shift && interval > 0 && epsilon > 0) {
        if (angle % interval < epsilon) {
          angle = Math.floor(angle / interval) * interval;
        } else if (angle % interval > interval - epsilon) {
          angle = (Math.floor(angle / interval) + 1) * interval;
        }
        if (angle >= 360) angle -= 360;
        else if (angle < 0) angle += 360;
      }
      return angle;
    };

    const myDiagram = $go(go.Diagram, 'myDiagramDiv',  // 创建视图
      {
        initialContentAlignment: go.Spot.Center,
        allowDrop: true,  // must be true to accept drops from the Palette
        'LinkDrawn': showLinkLabel,  // this DiagramEvent listener is defined below
        'LinkRelinked': showLinkLabel,
        // "scrollsPageOnFocus": false,
        'undoManager.isEnabled': true  // enable undo & redo
        , 'toolManager.hoverDelay': 10,
        resizingTool: new ResizeMultipleTool(),  // defined in ResizeMultipleTool.js
        rotatingTool: new RotateMultipleTool(),
        //   "ChangedSelection": onSelectionChanged, // view additional information
      });
    this.diagram = myDiagram;
    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener('Modified', function (e) {
      const button = document.getElementById('SaveButton');
      //   if (button) button.disabled = !myDiagram.isModified;
      const idx = document.title.indexOf('*');
      if (myDiagram.isModified) {
        if (idx < 0) document.title += '*';
      } else {
        if (idx >= 0) document.title = document.title.substr(0, idx);
      }
    });

    let dragged = null, self = this; // A reference to the element currently being dragged

    document.addEventListener('dragstart', function (event) {
      event.dataTransfer.setData('text', '');
      dragged = event.target;
    }, false);
    // This event resets styles after a drag has completed (successfully or not)
    document.addEventListener('dragend', function (event) {

    }, false);
    const div = document.getElementById('myDiagramDiv');
    div.addEventListener('dragenter', function (event) {
      event.preventDefault();
    }, false);

    div.addEventListener('dragover', function (event) {
      event.preventDefault();
    }, false);

    div.addEventListener('dragleave', function (event) {

    }, false);
    const elements = this.elements;
    div.addEventListener('drop', function (event) {
      event.preventDefault();
      if (this === myDiagram.div) {
        const can = event.target;
        const pixelratio = 2;

        // if the target is not the canvas, we may have trouble, so just quit:
        if (!(can instanceof HTMLCanvasElement)) return;

        const bbox = can.getBoundingClientRect();
        let bbw = bbox.width;
        if (bbw === 0) bbw = 0.001;
        let bbh = bbox.height;
        if (bbh === 0) bbh = 0.001;
        const mx = event.clientX - bbox.left * ((can.width / pixelratio) / bbw);
        const my = event.clientY - bbox.top * ((can.height / pixelratio) / bbh);
        const point = myDiagram.transformViewToDoc(new go.Point(mx, my));
        myDiagram.startTransaction('new node');
        createNode(point, elements);
      }
    }, false);

    // 创建节点
    function createNode(point, elements) {
      const coordinateObj = point;
      let categoryData;
      for (let i = 0; i < elements.length; i++) {
        for (let j = 0; j < elements[i].content.length; j++) {
          if (elements[i].content[j].key === dragged.textContent) {
            categoryData = elements[i].content[j].parameters;
          }
        }

      }
      myDiagram.model.addNodeData({
        category: dragged.textContent,
        location: coordinateObj,
        text: dragged.textContent,
        data: categoryData
        // 这里用深度克隆
      });
      myDiagram.commitTransaction('new node');
    }

    function nodeStyle() {
      return [
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        {
          // the Node.location is at the center of each node
          locationSpot: go.Spot.Center,
          // isShadowed: true,
          // shadowColor: "#888",
          // handle mouse enter/leave events to show/hide the ports
          mouseEnter: function (e, obj) {
            showPorts(obj.part, true);
          },
          mouseLeave: function (e, obj) {
            showPorts(obj.part, false);
          }
        }
      ];
    }

    function showPorts(node, show) {
      const diagram = node.diagram;
      if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
      node.ports.each(function (port) {
        port.fill = (show ? 'gray' : null);
      });
    }

    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate =
      $go(go.Link, {
          toShortLength: -2,
          fromShortLength: -2,
          layerName: 'Background',
          routing: go.Link.AvoidsNodes, // 路径避免路过节点
          corner: 15,
        },
        new go.Binding('points').makeTwoWay(),
        // mark each Shape to get the link geometry with isPanelMain: true
        $go(go.Shape, {isPanelMain: true, stroke: '#41BFEC'/* blue*/, strokeWidth: 4},
          new go.Binding('stroke', 'color')),
        $go(go.Shape, {isPanelMain: true, stroke: 'white', strokeWidth: 3, name: 'PIPE', strokeDashArray: [20, 40]}),
        $go(go.Shape,   // the arrowhead
          {toArrow: 'OpenTriangle', fill: null})
      );

    function showLinkLabel(e) {
      const label = e.subject.findObject('LABEL');
      if (label !== null) label.visible = (e.subject.fromNode.data.figure === 'Diamond');
    }

    // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
    myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.AvoidsNodes; //路径避免路过节点
    myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.AvoidsNodes; //路径避免路过节点


    const categorys = this.elements.map((value) => {
      return value.category;
    });


    this.addMoudleElement(this.elements, myDiagram, $go, nodeStyle);
    myDiagram.addModelChangedListener(onModelChanged);

    function onModelChanged(e) {  // handle insertions
      if (e.model.skipsUndoManager) return;
      if (e.change === go.ChangedEvent.Insert) {
        if (e.propertyName === 'nodeDataArray') {
          // do something with e.newValue
        } else if (e.propertyName === 'linkDataArray') {
          const fromNode = myDiagram.findNodeForKey(e.newValue.from);


          const toNode = myDiagram.findNodeForKey(e.newValue.to);
          const model = myDiagram.links;

          e.newValue.color = getChannelType(fromNode.data.category, toNode.data.category);
          myDiagram.links.each(function (l) {
            l.updateTargetBindings();
          });
        }
      }
    }

    function detectEnergy(fromCatergy, toCatergy) {
      return '#E63538';
    }

    // 下面不同的连线颜色，能量不同，颜色不同。
    const coalColor = 'black';
    const youColor = 'red';
    const oilColor = '#E63538';
    const whiteColor = '#FFBC00';
    const workColor = 'blue';

    function getChannelType(fromType, toType) {

      if (fromType === 'eqEnergy') {
        if (toType === 'substation') {
          return youColor;
        }
        if (toType === 'wasteHeatPowerGeneration' || toType === 'firedClinker') {
          return coalColor;
        }
        if (toType === 'other') {
          return oilColor;
        }

      }

      if (fromType === 'wasteHeatPowerGeneration') {
        if (toType === 'substation') {
          return youColor;
        } else {
          return workColor;
        }
      }
      if (fromType === 'substation') {

        if (toType === 'white' || toType === 'cementGrinding' || toType === 'other') {
          return youColor;
        }

      }
      if (fromType === 'firedClinker' || fromType === 'rawMaterialPreparation' || fromType === 'cementGrinding' || fromType === 'other') {
        return workColor;
      }

      return '#FFBC00';
    }

    window.onbeforeunload = function () {
      if (confirm('确定关闭页面?')) {
        return true;
      }
      else {
        return false;
      }
    };

    for (let i = 0; i < 7; i++) {
      this.types.push(true);
      this.disabled.push(false);
    }
    this.ratioService.getDatas().then(res => {
      this.ratioList = res;
      this.unitChanged();
    });

  }

  addMoudleElement(elements: ElementItem[], myDiagram, $go, nodeStyle): void {
    //显示小端口
    function showSmallPorts(node, show) {
      node.ports.each(function (port) {
        if (port.portId !== '') {  // don't change the default port, which is the big shape
          port.fill = show ? 'rgba(0,0,0,.3)' : null;
        }
      });
    }

    // 这里添加连线节点
    function makePort(name, spot, output, input) {
      return $go(go.Shape, 'Rectangle',
        {
          fill: null,
          stroke: null,  // this is changed to "white" in the showPorts function
          desiredSize: new go.Size(7, 7),
          alignment: spot,
          alignmentFocus: spot,  // align the port on the main Shape
          portId: name,  // declare this object to be a "port"
          fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
          fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
          cursor: 'pointer'  // show a different cursor to indicate potential link point
        });
    }

    function nodeInfo(node) { // Tooltip info for a node data object
      console.log(node.parameters);
      const data = node.parameters;
      let str = '';
      for (let i = 0; i < data.length; i++) {
        str = str + data[i].description + ':' + data[i].value + '\n';
      }

      return str;
    }

    const lightText = 'whitesmoke';
    const f = [
      {figure: 'Square', color: '#79C900'},
      {figure: 'Circle', color: '#DC3C00'},
      {figure: 'TriangleUp', color: '#EFFAB4'},
      {figure: 'Diamond', color: '#00A9C9'},
      {figure: 'Ellipse', color: '#333'},
      {figure: 'Pentagon', color: 'red'},
      {figure: 'Arrow', color: 'red'},
      {figure: 'Trapezoid', color: 'red'},
      {figure: 'ManualOperation', color: 'red'},
    ];


    const fieldTemplate =
      $go(go.Panel, 'TableRow',  // this Panel is a row in the containing Table
        new go.Binding('portId', 'name'),  // this Panel is a "port"
        {
          background: 'transparent',  // so this port's background can be picked by the mouse
          fromSpot: go.Spot.Right,  // links only go from the right side to the left side
          toSpot: go.Spot.Left
        },  // allow drawing links from or to this port
        $go(go.Shape,
          {width: 6, height: 6, column: 0, strokeWidth: 2, margin: 4},
          new go.Binding('figure', 'figure'),
          new go.Binding('fill', 'color')),
        $go(go.TextBlock,
          {margin: new go.Margin(0, 2), column: 1, font: 'bold 10px sans-serif'},
          new go.Binding('text', 'description')),
        $go(go.TextBlock,
          {margin: new go.Margin(0, 2), column: 2, font: '10px sans-serif'},
          new go.Binding('text', 'value'))
      );


    myDiagram.nodeTemplateMap.add('',  // the default category
      $go(go.Node, 'Spot', nodeStyle(),
        {resizable: true, rotatable: true},
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $go(go.Panel, 'Auto',
          $go(go.Shape,
            {stroke: 'black', fill: 'white', minSize: new go.Size(60, 60)},
            new go.Binding('figure', 'category'),
            new go.Binding('angle', 'angle'),
            // new go.Binding("fill", "color"),
          ),
          $go(go.Panel, 'Vertical',
            // this is the header for the whole node
            $go(go.Panel, 'Auto',
              {stretch: go.GraphObject.Horizontal},  // as wide as the whole node

              $go(go.TextBlock,
                {
                  text: '设备名称',
                  alignment: go.Spot.Center,
                  margin: 0,
                  stroke: 'black',
                  textAlign: 'center',
                  font: 'bold 12pt sans-serif',
                  editable: true,

                },
                new go.Binding('text').makeTwoWay(),
                {
                  wrap: go.TextBlock.None,
                  overflow: go.TextBlock.OverflowEllipsis
                })),
          )),  // end Vertical Panel
        {
          toolTip:  // define a tooltip for each node that displays the color as text
            $go(go.Adornment, 'Auto',
              $go(go.Shape, {fill: 'white'}),
              $go(go.Panel, 'Table',
                {
                  alignment: go.Spot.Bottom,
                  padding: 2,
                  minSize: new go.Size(100, 10),
                  itemTemplate: fieldTemplate
                },
                new go.Binding('itemArray', 'parameters')
              )  // end Table Panel of items
            )  // end of Adornment
        },

        {
          selectionAdorned: false, // 是否框起来
          doubleClick: nodeDoubleClick,

        },
        // four named ports, one on each side:
        makePort('T', go.Spot.Top, false, true),
        makePort('L', go.Spot.Left, true, true),
        makePort('R', go.Spot.Right, true, true),
        makePort('B', go.Spot.Bottom, true, false)
      ));


    myDiagram.nodeTemplateMap.add('label',  // the default category
      $go(go.Node, 'Spot', nodeStyle(),
        {resizable: true, rotatable: true},
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $go(go.Panel, 'Auto',
          $go(go.Shape, 'Rectangle',
            {stroke: 'transparent', fill: 'white', minSize: new go.Size(120, 21), margin: 0},
          ),
          $go(go.Panel, 'Horizontal',
            // this is the header for the whole node
            // $go(go.Panel, 'Auto',

            $go(go.TextBlock,
              {
                stroke: 'black', font: 'bold 12px sans-serif', editable: false, text: 'Label:',
                margin: new go.Margin(3, 0, 3, 0), alignment: go.Spot.Left
              },),
            $go(go.TextBlock,
              {
                text: '',
                alignment: go.Spot.Center,
                margin: 0,
                stroke: 'black',
                textAlign: 'center',
                font: 'bold 12pt sans-serif',
                editable: true,
                isMultiline: true,

              }
            )),
        )),  // end Vertical Panel

      {
        selectionAdorned: false, // 是否框起来
      },
    )
    ;
    const copyList = this.list;

    // 双击元素执行的事件
    function nodeDoubleClick(e, obj) {
      // console.log($('a'));
      const clicked = obj.part;

      if (clicked !== null) {
        const node = clicked.data;

        const data = node.parameters;
        const key = node.key;

        const setting = $('.rightSetting');
        setting.show();
        const settingForm = setting.find('form');
        settingForm.html('');
        settingForm.append('<span class=\'heading\'>设置</span>');
        for (let i = 0; i < data.length; i++) {
          if (data[i].type === 'text') {
            const div = $('<div class="form-group">');
            div.attr('style', 'margin-top: 10px;');
            const input = $('<input class=\'form-control\'  type=\'text\' />');
            input.attr('placeholder', data[i].description);
            input.attr('id', key + 'text' + i);
            input.attr('name', data[i].key);
            // input.attr('style', 'width:60%!important;');
            if (data[i].value) {
              input.val(data[i].value);

            } else {
              input.val(data[i].defaultValue);
            }
            const label = $('<label class="col-sm-3 control-label">');
            label.attr('for', key + 'text' + i);
            // label.attr('style', ' width: 30%;\
            //             float: left;\
            //             line-height: 36px;\
            //             white-space:nowrap;');
            label.html(data[i].description);
            const selectWrap = $('<div class="col-sm-9"></div>');
            selectWrap.append(input);
            div.append(label);
            div.append(selectWrap);
            settingForm.append(div);
            $('#' + key + 'text' + i).on('change paste keyup', function () {
              for (let j = 0; j < data.length; j++) {
                if (data[j].key === this.name) {
                  data[j].value = this.value;
                  console.log(node);
                  clicked.updateTargetBindings();
                }
              }
            });

          }

          if (data[i].type === 'select') {
            console.log(data);
            const div = $('<div class="form-group">');
            // div.attr('style', '  margin-top: 10px;');
            const select = $('<select class=\'js-example-basic-multiple form-control\' multiple="true"></select>');
            select.attr('id', key + 'text' + i);
            select.attr('name', data[i].key);
            select.attr('label', data[i].description);
            // select.attr('style', 'width:60%!important;');
            for (let j = 0; j < copyList.length; j++) {
              const option = $('<option></option>');
              option.val(copyList[j].id).text(copyList[j].name);
              select.append(option);
              if (data[i].value) {
                select.val(data[i].value);
              } else {
                select.val(data[i].defaultValue);
              }

            }
            const label = $('<label class="control-label col-sm-3">');
            label.attr('for', key + 'text' + i);
            label.html(data[i].description);
            // label.attr('style', ' width: 30%;\
            //             float: left;\
            //             line-height: 36px;');
            const selectWrap = $('<div class="col-sm-9"></div>');
            selectWrap.append(select);
            div.append(label);
            div.append(selectWrap);
            settingForm.append(div);
            // console.log($('#' + key + 'text' + i));
            // $("#" + key + "text" + i).select2();

            $('#' + key + 'text' + i).change(function (e) {
              for (let j = 0; j < data.length; j++) {
                if (data[j].key === this.name) {
                  console.log($(e.target).val());
                  data[j].value = $(e.target).val();
                  console.log(data[j]);
                  clicked.updateTargetBindings();
                }
              }
            });


          }
          if (data[i].type === 'multipeSelect') {

          }


        }
      }
    }

    // Coal, oil, natural gas, tap water, electricity, steam
    const parameters = [
      {
        'key': 'water',
        'description': '水',
        'type': 'text',
        defaultValue: '0',
        selectValue: [],
        'value': '0',
        color: 'white',
        figure: 'Ellipse'
      },
      {
        'key': 'coal',
        'description': '煤',
        'type': 'text',
        defaultValue: '0',
        selectValue: [],
        'value': '0',
        color: 'white',
        figure: 'Ellipse'
      },
      {
        'key': 'naturalGas',
        'description': '天然气',
        'type': 'text',
        defaultValue: '0',
        selectValue: [],
        'value': '0',
        color: 'white',
        figure: 'Ellipse'
      },
      {
        'key': 'tapWater',
        'description': '自来水',
        'type': 'text',
        defaultValue: '0',
        selectValue: [],
        'value': '0',
        color: 'white',
        figure: 'Ellipse'
      },
      {
        'key': 'electricity',
        'description': '电',
        'type': 'text',
        defaultValue: '0',
        selectValue: [],
        'value': '0',
        color: 'white',
        figure: 'Ellipse'
      },
      {
        'key': 'steam',
        'description': '蒸汽',
        'type': 'text',
        defaultValue: '0',
        selectValue: [],
        'value': '0',
        color: 'white',
        figure: 'Ellipse'
      },
      {
        'key': 'inputSenors',
        'description': '输入传感器',
        'type': 'select',
        defaultValue: '0',
        selectValue: null,
        'value': '0',
        color: 'white',
        figure: 'Ellipse'
      },
      {
        'key': 'outputSenors',
        'description': '输出传感器',
        'type': 'select',
        defaultValue: '0',
        selectValue: null,
        'value': '0',
        color: 'white',
        figure: 'Ellipse'
      },

    ];
    // create the Palette
    const myPalette2 =
      $go(go.Palette, 'myPaletteDiv',
        { // customize the GridLayout to align the centers of the locationObjects
          layout: $go(go.GridLayout, {alignment: go.GridLayout.Location})
        });
    myPalette2.nodeTemplate = $go(go.Node, 'Vertical',
      {locationObjectName: 'TB', locationSpot: go.Spot.Center},
      $go(go.Shape,
        {width: 30, height: 30, fill: 'white'},
        new go.Binding('figure', 'category'),
        new go.Binding('width', 'width'),
        new go.Binding('height', 'height'),
        new go.Binding('angle', 'angle'),
      ),
      $go(go.TextBlock, {text: 'TB'},
        new go.Binding('text', 'text').makeTwoWay(),
        new go.Binding('height', 'textHeight').makeTwoWay(),
      )
    );


    // the list of data to show in the Palette
    myPalette2.model.copiesArrays = true;
    myPalette2.model.copiesArrayObjects = true;
    // console.log(myPalette.model.copiesArrays)
    // console.log(myPalette.model.copiesArrayObjects)
    function deepClone(source) {
      $.map(source, function (obj) {
        // console.log(obj)
        return $.extend(true, {}, obj);
      });
    }

    myPalette2.model.nodeDataArray =
      [
        {
          category: 'Square', text: '', textHeight: 0, height: 30, parameters: parameters, color: 'aquamarine', angle: 0
        },
        {
          category: 'Circle', text: '', textHeight: 0, height: 30, parameters: parameters, color: 'lightcoral', angle: 0
        },
        {
          category: 'TriangleUp',
          text: '',
          textHeight: 0,
          height: 30,
          parameters: parameters,
          color: 'salmon',
          angle: 0
        },
        {
          category: 'Diamond',
          text: '',
          textHeight: 0,
          height: 30,
          parameters: parameters,
          color: 'powderblue',
          angle: 0
        },
        {
          category: 'Terminator',
          text: '',
          textHeight: 0,
          height: 30,
          parameters: parameters,
          color: 'deepskyblue',
          angle: 0
        },
        {
          category: 'Arrow',
          text: '',
          height: 30,
          textHeight: 0,
          parameters: parameters,
          color: 'deepskyblue',
          angle: 0
        },
        {
          category: 'Trapezoid',
          text: '',
          height: 30,
          textHeight: 0,
          parameters: parameters,
          color: 'deepskyblue',
          angle: 90
        },
        {
          category: 'ManualOperation',
          text: '',
          textHeight: 0,
          height: 30,
          parameters: parameters,
          color: 'deepskyblue',
          angle: 90
        },
        {category: 'label', text: 'Label', height: 0, parameters: parameters, color: 'deepskyblue', angle: 0},
        {
          category: 'ThinX',
          text: '',
          height: 30,
          textHeight: 0,
          parameters: parameters,
          color: 'deepskyblue',
          angle: 0
        },
      ];


    myPalette2.model.copyNodeData = function (nodedata) {
      const copy = go.GraphLinksModel.prototype.copyNodeData.call(this, nodedata);
      return copy;
    };

    myPalette2.model.copyNodeDataFunction = function (node, Model) {

      node.parameters = [
        {
          'key': 'water',
          'description': '水',
          'type': 'text',
          defaultValue: '0',
          selectValue: [],
          'value': '0',
          color: '#F7B84B',
          figure: 'Ellipse'
        },
        {
          'key': 'coal',
          'description': '煤',
          'type': 'text',
          defaultValue: '0',
          selectValue: [],
          'value': '0',
          color: '#F7B84B',
          figure: 'Ellipse'
        },
        {
          'key': 'naturalGas',
          'description': '天然气',
          'type': 'text',
          defaultValue: '0',
          selectValue: [],
          'value': '0',
          color: '#F7B84B',
          figure: 'Ellipse'
        },
        {
          'key': 'tapWater',
          'description': '自来水',
          'type': 'text',
          defaultValue: '0',
          selectValue: [],
          'value': '0',
          color: '#F7B84B',
          figure: 'Ellipse'
        },
        {
          'key': 'electricity',
          'description': '电',
          'type': 'text',
          defaultValue: '0',
          selectValue: [],
          'value': '0',
          color: '#F7B84B',
          figure: 'Ellipse'
        },
        {
          'key': 'steam',
          'description': '蒸汽',
          'type': 'text',
          defaultValue: '0',
          selectValue: [],
          'value': '0',
          color: '#F7B84B',
          figure: 'Ellipse'
        },
        {
          'key': 'inputSenors',
          'description': '输入传感器',
          'type': 'select',
          defaultValue: '0',
          selectValue: null,
          'value': '0',
          color: '#F7B84B',
          figure: 'Ellipse'
        },
        {
          'key': 'outputSenors',
          'description': '输出传感器',
          'type': 'select',
          defaultValue: '0',
          selectValue: null,
          'value': '0',
          color: '#F7B84B',
          figure: 'Ellipse'
        },

      ];
      return node;
      // console.log(node)
    };
  }

  loop(down, opacity, diagram, loop, thisCopy): void {
    const loopFunc = loop;
    const isLoopCopy = thisCopy;
    setTimeout(function () {
      if (!thisCopy.isLoop.isLoop) {
        return;
      }
      const oldskips = diagram.skipsUndoManager;
      diagram.skipsUndoManager = true;

      // TODO 在这里http请求后台，获取计算得到的监控数据，存放到线上面。理解图形的node节点数据，然后根据key搜索做相应的改变。下面是改变value值的一个自增数字demo
      const sensors: number[] = [];

      diagram.nodes.each(function (node) {
        const data = node.data.parameters;
        for (let i = 0; i < data.length; i++) {
          if (data[i].key === 'inputSenors' || data[i].key === 'outputSenors') {
            if (data[i].value !== '0' && data[i].value !== 0) {
              for (const j of data[i].value) {
                sensors.push(parseInt(j, 10));
              }
            }
          }
          // FIXME
          // data[i].value = parseInt(data[i].value, 10) + 1;
        }

        // TODO POST sensors
        console.log(sensors);

        that.dataService.fetchDatas(that.dateRange, sensors).then(res => {
          if (res === null) {
            return;
          }
          that.dataList = res;
          that.days = [];

          for (let i = 0; i < that.list.length; i++) {
            for (let j = 0; j < that.list[i].datas.length; j++) {
              for (let k = 0; k < that.list[i].datas[j].values.length; k++) {
                for (let m = 0; m < that.list[i].datas[j].values[k].values.length; m++) {
                  that.days.push({
                    device: that.list[i].id,
                    date: that.list[i].datas[j].year + '-' + that.list[i].datas[j].values[k].month + '-'
                    + that.list[i].datas[j].values[k].values[m].day,
                    values: that.list[i].datas[j].values[k].values[m].values
                  });
                }
              }
            }
          }
        });

        that.loadChart();

        // fields.push( { name: "field1", info: "", color: "#F7B84B", figure: "Ellipse" });
        console.log(node.data);
        // data[0].value=parseInt(data[0].value)+1;
        node.updateTargetBindings();
      });
      diagram.skipsUndoManager = oldskips;
      loopFunc(down, opacity, diagram, loopFunc, thisCopy);
    }, 1000);

  }

  isTimeIn(to: string, time: string): boolean {
    if (this.timeType === '分' || this.timeType === '时' || this.timeType === '日') {
      const dataTime = this.parseTime(time);
      const bound = this.parseTime(to);

      if (bound.hour > dataTime.hour) {
        return true;
      }
      else if (bound.hour === dataTime.hour && bound.min > dataTime.min) {
        return true;
      }
      else if (bound.hour === dataTime.hour && bound.min === dataTime.min && bound.sec > dataTime.sec) {
        return true;
      }
      else {
        return false;
      }
    }
    else if (this.timeType === '月') {
      const yearTo = parseInt(to.slice(0, 4));
      const yearData = parseInt(time.slice(0, 4));
      const monTo = parseInt(to.slice(5, 7));
      const monData = parseInt(time.slice(5, 7));

      if (yearTo > yearData) {
        return true;
      }
      else if (yearTo === yearData && monTo > monData) {
        return true;
      }
      else {
        return false;
      }
    }
    else if (this.timeType === '年') {
      const yearTo = parseInt(to);
      const yearData = parseInt(time);
      if (yearTo >= yearData) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  TimeAdd(src: string, num: number): [string, number] {
    const srcParsed: any = this.parseTime(src);
    console.log(src, num, srcParsed);
    let switchDay = 0;
    let resStr;
    if (this.timeType === '分' || this.timeType === '时' || this.timeType === '日') {
      if (this.timeType === '分') {
        srcParsed.min += num;
      }
      else if (this.timeType === '时') {
        srcParsed.hour += num;
      }
      else if (this.timeType === '日') {
        srcParsed.hour += num * 24;
      }

      while (srcParsed.min >= 60) {
        srcParsed.hour += 1;
        srcParsed.min -= 60;
      }

      while (srcParsed.hour >= 24) {
        srcParsed.hour -= 24;
        switchDay++;
      }
      resStr = this.convertTime(srcParsed);
    }
    else if (this.timeType === '月') {
      let year = parseInt(src.slice(0, 4));
      let month = parseInt(src.slice(5, 7));

      month += num;

      while (month > 12) {
        month -= 12;
        year += 1;
        switchDay++;
      }

      resStr = year.toString() + '-' + (month < 10 ? '0' : '') + month.toString();
    }
    else if (this.timeType === '年') {
      let year = parseInt(src);
      year += num;
      resStr = year.toString();
    }
    console.log(resStr);
    return [resStr, switchDay];
  }

  convertTime(data: any): string {
    let res = '';
    if (data.hour < 10) res += '0';
    res += data.hour.toString() + ':';
    if (data.min < 10) res += '0';
    res += data.min.toString() + ':';
    if (data.sec < 10) res += '0';
    res += data.sec.toString();

    return res;
  }

  parseTime(time: string): any {
    if (this.timeType === '月' || this.timeType === '年') return;
    const houStr = time.slice(0, 2);
    const minStr = time.slice(3, 5);
    const secStr = time.slice(6, 8);

    return {
      hour: parseInt(houStr),
      min: parseInt(minStr),
      sec: parseInt(secStr)
    };
  }

  getTimeLength(): number {
    if (this.timeType === '分') {
      const startStr = this.days[0].values[0].createdAt;
      const endStr = this.TimeAdd(this.days[this.days.length - 1].values[this.days[this.days.length - 1].values.length - 1].createdAt, 1)[0];

      const start = this.parseTime(startStr);
      const end = this.parseTime(endStr);
      const dayLength = this.days.length;
      if (dayLength === 1) {
        return (end.hour - start.hour) * 60 + end.min - start.min;
      }
      else {
        return (dayLength - 2) * 1440 + (24 - start.hour) * 60 - start.min + end.hour * 60 + end.min;
      }
    }
    else if (this.timeType === '时') {
      const startStr = this.days[0].values[0].createdAt;
      const endStr = this.TimeAdd(this.days[this.days.length - 1].values[this.days[this.days.length - 1].values.length - 1].createdAt, 1)[0];

      const start = this.parseTime(startStr);
      const end = this.parseTime(endStr);
      const dayLength = this.days.length;
      if (dayLength === 1) {
        return (end.hour - start.hour);
      }
      else {
        return (dayLength - 2) * 24 + 24 - start.hour + end.hour;
      }
    }
    else if (this.timeType === '日') {
      return this.days.length;
    }
  }

  loadChart() {
    console.log(this.types);
    const chartDatas: number[][][] = [];
    const legend: string[] = [];
    const xaxisData: string[] = [];

    for (let i = 0; i < 7; i++) {
      if (this.types[i]) {
        legend.push(this.classes[i]);
      }
    }

    if (this.formula !== '') {
      const exists: boolean[] = [false, false, false, false, false, false, false];
      for (let i = 0; i < this.formula.length; i++) {
        if (this.formula[i] === 'a') exists[0] = true;
        if (this.formula[i] === 'b') exists[1] = true;
        if (this.formula[i] === 'c') exists[2] = true;
        if (this.formula[i] === 'd') exists[3] = true;
        if (this.formula[i] === 'e') exists[4] = true;
        if (this.formula[i] === 'f') exists[5] = true;
        if (this.formula[i] === 'g') exists[6] = true;
      }

      for (let i = 0; i < exists.length; i++) {
        if (exists[i]) {
          let now = '';
          let ok = false;
          switch (i) {
            case 0: {
              now = '煤';
              break;
            }
            case 1: {
              now = '油';
              break;
            }
            case 2: {
              now = '电';
              break;
            }
            case 3: {
              now = '蒸汽';
              break;
            }
            case 4: {
              now = '热力';
              break;
            }
            case 5: {
              now = '天然气';
              break;
            }
            case 6: {
              now = '自来水';
              break;
            }
          }
          for (let j = 0; j < legend.length; j++) {
            if (legend[j] === now) {
              ok = true;
              break;
            }
          }

          if (!ok) {
            this.formulaErrorMsg = '公式中元素不存在对应关系！';
            return;
          }
        }
      }
    }
    this.formulaErrorMsg = '';

    chartDatas.push([]);
    for (let j = 0; j < legend.length; j++) {
      chartDatas[0].push([]);
    }

    if (this.timeType === '分' || this.timeType === '时' || this.timeType === '日') {
      const length = this.getTimeLength();
      const step = length / this.timeVal + ((length % this.timeVal === 0) ? 0 : 1);
      let startStr = (this.timeType === '分' || this.timeType === '时') ? this.days[0].values[0].createdAt : '00:00:00';
      let dayNo = 0, minNo = 0;

      for (let i = 0; i < step; i++) {
        xaxisData.push(this.days[dayNo].date + ' ' + startStr);
        let switchDay = 0;
        const data: any = {
          coal: 0,
          oil: 0,
          electric: 0,
          steam: 0,
          heat: 0,
          gas: 0,
          water: 0,
        };
        const addRes = this.TimeAdd(startStr, this.timeVal);
        const next = addRes[0];
        switchDay = addRes[1];

        while (this.isTimeIn(next, this.days[dayNo].values[minNo].createdAt) || switchDay > 0) {
          console.log(this.days[dayNo].values[minNo].createdAt, dayNo, minNo, switchDay);
          data.coal += parseFloat(this.days[dayNo].values[minNo].coal.toString());
          data.oil += parseFloat(this.days[dayNo].values[minNo].oil.toString());
          data.electric += parseFloat(this.days[dayNo].values[minNo].electric.toString());
          data.steam += parseFloat(this.days[dayNo].values[minNo].steam.toString());
          data.heat += parseFloat(this.days[dayNo].values[minNo].heat.toString());
          data.gas += parseFloat(this.days[dayNo].values[minNo].gas.toString());
          data.water += parseFloat(this.days[dayNo].values[minNo].water.toString());

          if (minNo === this.days[dayNo].values.length - 1) {
            minNo = 0;
            dayNo++;
            switchDay--;
            if (switchDay < 0) switchDay = 0;
            if (dayNo === this.days.length) {
              dayNo--;
              break;
            }
          }
          else {
            minNo++;
          }
        }

        for (let k = 0; k < legend.length; k++) {
          if (legend[k] === '煤') chartDatas[0][k].push(data.coal * this.ratios.coal);
          if (legend[k] === '油') chartDatas[0][k].push(data.oil * this.ratios.oil);
          if (legend[k] === '电') chartDatas[0][k].push(data.electric * this.ratios.electric);
          if (legend[k] === '蒸汽') chartDatas[0][k].push(data.steam * this.ratios.steam);
          if (legend[k] === '热力') chartDatas[0][k].push(data.heat * this.ratios.heat);
          if (legend[k] === '天然气') chartDatas[0][k].push(data.gas * this.ratios.gas);
          if (legend[k] === '自来水') chartDatas[0][k].push(data.water * this.ratios.water);
        }

        console.log(dayNo);

        startStr = next;
      }
    }
    else {
      if (this.timeType === '月') {
        const monthData: any[] = [];
        for (let i = 0; i < this.dataList.length; i++) {
          for (let j = 0; j < this.dataList[i].datas.length; j++) {
            for (let k = 0; k < this.dataList[i].datas[j].values.length; k++) {
              const data: any = {
                date: '',
                coal: 0,
                oil: 0,
                electric: 0,
                steam: 0,
                heat: 0,
                gas: 0,
                water: 0,
              };
              for (let m = 0; m < this.dataList[i].datas[j].values[k].values.length; m++) {
                for (let n = 0; n < this.dataList[i].datas[j].values[k].values[m].values.length; n++) {
                  data.coal += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].coal.toString());
                  data.oil += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].oil.toString());
                  data.electric += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].electric.toString());
                  data.steam += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].steam.toString());
                  data.heat += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].heat.toString());
                  data.gas += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].gas.toString());
                  data.water += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].water.toString());
                }
              }

              data.date = this.dataList[i].datas[j].year + '-' + ((this.dataList[i].datas[j].values[k].month < 10) ? '0' : '') + this.dataList[i].datas[j].values[k].month;
              monthData.push(data);
            }
          }
        }

        let timeLength = (parseInt(monthData[monthData.length - 1].date.slice(0, 4)) - parseInt(monthData[0].date.slice(0, 4)))
          * 12 + parseInt(monthData[monthData.length - 1].date.slice(5, 7)) - parseInt(monthData[0].date.slice(5, 7));
        timeLength = timeLength === 0 ? 1 : timeLength;
        const step = timeLength / this.timeVal + ((length % this.timeVal === 0) ? 0 : 1);
        console.log(timeLength, step);
        let startStr = monthData[0].date;
        let switchYear = 0;
        let monNo = 0;

        for (let i = 0; i < step; i++) {
          xaxisData.push(startStr);
          const data: any = {
            coal: 0,
            oil: 0,
            electric: 0,
            steam: 0,
            heat: 0,
            gas: 0,
            water: 0,
          };
          const addRes = this.TimeAdd(startStr, this.timeVal);
          const next = addRes[0];
          switchYear = addRes[1];

          while (this.isTimeIn(next, monthData[monNo].date)) {
            data.coal += parseFloat(monthData[monNo].coal.toString());
            data.oil += parseFloat(monthData[monNo].oil.toString());
            data.electric += parseFloat(monthData[monNo].electric.toString());
            data.steam += parseFloat(monthData[monNo].steam.toString());
            data.heat += parseFloat(monthData[monNo].heat.toString());
            data.gas += parseFloat(monthData[monNo].gas.toString());
            data.water += parseFloat(monthData[monNo].water.toString());

            monNo++;
            if (monNo === monthData.length) break;
          }

          for (let k = 0; k < legend.length; k++) {
            if (legend[k] === '煤') chartDatas[0][k].push(data.coal * this.ratios.coal);
            if (legend[k] === '油') chartDatas[0][k].push(data.oil * this.ratios.oil);
            if (legend[k] === '电') chartDatas[0][k].push(data.electric * this.ratios.electric);
            if (legend[k] === '蒸汽') chartDatas[0][k].push(data.steam * this.ratios.steam);
            if (legend[k] === '热力') chartDatas[0][k].push(data.heat * this.ratios.heat);
            if (legend[k] === '天然气') chartDatas[0][k].push(data.gas * this.ratios.gas);
            if (legend[k] === '自来水') chartDatas[0][k].push(data.water * this.ratios.water);
          }
          startStr = next;
        }
      }

      if (this.timeType === '年') {
        const yearData: any[] = [];
        for (let i = 0; i < this.list.length; i++) {
          for (let j = 0; j < this.dataList[i].datas.length; j++) {
            const data: any = {
              date: '',
              coal: 0,
              oil: 0,
              electric: 0,
              steam: 0,
              heat: 0,
              gas: 0,
              water: 0,
            };
            for (let k = 0; k < this.dataList[i].datas[j].values.length; k++) {
              for (let m = 0; m < this.dataList[i].datas[j].values[k].values.length; m++) {
                for (let n = 0; n < this.dataList[i].datas[j].values[k].values[m].values.length; n++) {
                  data.coal += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].coal.toString());
                  data.oil += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].oil.toString());
                  data.electric += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].electric.toString());
                  data.steam += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].steam.toString());
                  data.heat += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].heat.toString());
                  data.gas += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].gas.toString());
                  data.water += parseFloat(this.dataList[i].datas[j].values[k].values[m].values[n].water.toString());
                }
              }
            }
            data.date = this.dataList[i].datas[j].year;
            yearData.push(data);
          }
        }

        let timeLength = parseInt(yearData[yearData.length - 1].date) - parseInt(yearData[0].date);
        timeLength = timeLength === 0 ? 1 : timeLength;
        const step = timeLength / this.timeVal + ((length % this.timeVal === 0) ? 0 : 1);
        let startStr = yearData[0].date;
        let yearNo = 0;

        for (let i = 0; i < step; i++) {
          xaxisData.push(startStr);
          const data: any = {
            coal: 0,
            oil: 0,
            electric: 0,
            steam: 0,
            heat: 0,
            gas: 0,
            water: 0,
          };
          const addRes = this.TimeAdd(startStr, this.timeVal);
          const next = addRes[0];

          while (this.isTimeIn(next, yearData[yearNo].date)) {
            data.coal += parseFloat(yearData[yearNo].coal.toString());
            data.oil += parseFloat(yearData[yearNo].oil.toString());
            data.electric += parseFloat(yearData[yearNo].electric.toString());
            data.steam += parseFloat(yearData[yearNo].steam.toString());
            data.heat += parseFloat(yearData[yearNo].heat.toString());
            data.gas += parseFloat(yearData[yearNo].gas.toString());
            data.water += parseFloat(yearData[yearNo].water.toString());

            yearNo++;
            if (yearNo === yearData.length) break;
          }

          for (let k = 0; k < legend.length; k++) {
            if (legend[k] === '煤') chartDatas[0][k].push(data.coal * this.ratios.coal);
            if (legend[k] === '油') chartDatas[0][k].push(data.oil * this.ratios.oil);
            if (legend[k] === '电') chartDatas[0][k].push(data.electric * this.ratios.electric);
            if (legend[k] === '蒸汽') chartDatas[0][k].push(data.steam * this.ratios.steam);
            if (legend[k] === '热力') chartDatas[0][k].push(data.heat * this.ratios.heat);
            if (legend[k] === '天然气') chartDatas[0][k].push(data.gas * this.ratios.gas);
            if (legend[k] === '自来水') chartDatas[0][k].push(data.water * this.ratios.water);
          }

          startStr = next;
        }
      }
    }

    if (this.chartType === 'line') {
      this.CustomChart = {
        title: {
          text: '能源总量趋势图',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: legend,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: xaxisData,
            name: this.timeVal.toString() + this.timeType,
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: this.unitType
          }
        ],
        series: this.getSeries('line', chartDatas, legend)
      };
    }
    else if (this.chartType === 'bar') {
      this.CustomChart = {
        title: {
          text: '各能源详细图',
        },
        legend: {
          data: legend,
          align: 'left'
        },
        tooltip: {},
        xAxis: {
          data: xaxisData,
          silent: false,
          splitLine: {
            show: false
          },
          name: this.timeVal.toString() + this.timeType,
        },
        yAxis: {
          name: this.unitType
        },
        series: this.getSeries('bar', chartDatas, legend),
        animationEasing: 'elasticOut',
        animationDelayUpdate: function (idx) {
          return idx * 5;
        }
      };
    }
    else {
      this.CustomChart = {
        title: {
          text: '各能源占比图',
        },
        legend: {
          data: legend,
          align: 'left'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{c} ({d}%)'
        },
        color: this.colors,
        series: this.getSeries('pie', chartDatas, legend),
        animationEasing: 'elasticOut',
        animationDelayUpdate: function (idx) {
          return idx * 5;
        }
      };
    }
  }

  getSeries(type: string, datas: number[][][], legend: string[]): any[] {
    const series: any[] = [];
    if (type === 'pie') {
      const tmpDatas: any[] = [];
      for (let i = 0; i < legend.length; i++) {
        let temp = 0;
        for (let k = 0; k < datas.length; k++) {
          for (let j = 0; j < datas[k][i].length; j++) {
            temp += parseFloat(datas[k][i][j].toString());
          }
        }
        tmpDatas.push({
          value: temp,
          name: legend[i]
        });
      }

      const one: any = {
        name: legend,
        type: type,
        data: tmpDatas,
        animationDelay: function (idx) {
          return idx * 10;
        }
      };
      series.push(one);
    }
    else if (type === 'line') {
      const data: number[] = [];
      console.log(datas);
      for (let k = 0; k < datas.length; k++) {
        for (let i = 0; i < datas[k][0].length; i++) {
          let temp = 0;
          let a, b, c, d, e, f, g = 0;
          for (let j = 0; j < legend.length; j++) {
            if (this.formula !== '') {
              if (legend[j] === '煤') a = parseFloat(datas[k][j][i].toString());
              if (legend[j] === '油') b = parseFloat(datas[k][j][i].toString());
              if (legend[j] === '电') c = parseFloat(datas[k][j][i].toString());
              if (legend[j] === '蒸汽') d = parseFloat(datas[k][j][i].toString());
              if (legend[j] === '热力') e = parseFloat(datas[k][j][i].toString());
              if (legend[j] === '天然气') f = parseFloat(datas[k][j][i].toString());
              if (legend[j] === '自来水') g = parseFloat(datas[k][j][i].toString());
            }
            else {
              temp = temp + parseFloat(datas[k][j][i].toString());
            }
            // console.log(temp, this.chart.datas[j][i]);
          }

          if (this.formula !== '') {
            data.push(eval(this.formula));
          }
          else {
            data.push(temp);
          }
        }
      }

      const temp: any = {
        name: '总能量',
        type: type,
        data: data,
        itemStyle: {
          normal: {
            color: this.colors[6]
          }
        },
        animationDelay: function (idx) {
          return idx * 10;
        }
      };
      series.push(temp);
    }
    else {
      for (let i = 0; i < legend.length; i++) {
        const len: number = datas.length * datas[0][0].length;
        const data: number[] = [];
        for (let j = 0; j < datas.length; j++) {
          for (let k = 0; k < datas[j][0].length; k++) {
            data.push(datas[j][i][k]);
          }
        }
        const temp: any = {
          name: legend[i],
          type: type,
          data: data,
          itemStyle: {
            normal: {
              color: this.colors[i]
            }
          },
          animationDelay: function (idx) {
            return idx * 10;
          }
        };
        series.push(temp);
      }
    }

    return series;
  }

  unitChanged() {
    this.ratios = {
      coal: 0,
      oil: 0,
      electric: 0,
      steam: 0,
      heat: 0,
      gas: 0,
      water: 0,
    };
    for (let i = 0; i < this.disabled.length; i++) {
      this.disabled[i] = false;
    }

    for (let i = 0; i < this.ratioList.length; i++) {
      for (let j = 0; j < this.classes.length; j++) {
        if (this.ratioList[i].from.name === this.classes[j] &&
          this.ratioList[i].to.name === this.unitType) {
          if (this.classes[j] === '煤') this.ratios.coal = this.ratioList[i].value;
          if (this.classes[j] === '油') this.ratios.oil = this.ratioList[i].value;
          if (this.classes[j] === '电') this.ratios.electric = this.ratioList[i].value;
          if (this.classes[j] === '蒸汽') this.ratios.steam = this.ratioList[i].value;
          if (this.classes[j] === '热力') this.ratios.heat = this.ratioList[i].value;
          if (this.classes[j] === '天然气') this.ratios.gas = this.ratioList[i].value;
          if (this.classes[j] === '自来水') this.ratios.water = this.ratioList[i].value;
        }
      }
    }

    // if (this.ratios.coal === 0) {
    //   this.types[0] = false;
    //   this.disabled[0] = true;
    // }
    // if (this.ratios.oil === 0) {
    //   this.types[1] = false;
    //   this.disabled[1] = true;
    // }
    // if (this.ratios.electric === 0) {
    //   this.types[2] = false;
    //   this.disabled[2] = true;
    // }
    // if (this.ratios.steam === 0) {
    //   this.types[3] = false;
    //   this.disabled[3] = true;
    // }
    // if (this.ratios.heat === 0) {
    //   this.types[4] = false;
    //   this.disabled[4] = true;
    // }
    // if (this.ratios.gas === 0) {
    //   this.types[5] = false;
    //   this.disabled[5] = true;
    // }
    // if (this.ratios.water === 0) {
    //   this.types[6] = false;
    //   this.disabled[6] = true;
    // }
  }

}


