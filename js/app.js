var app = {
    container: null,
    canvas: null,
    context: null,
    paint: false,
    canvasWidth: document.documentElement.clientWidth,
    canvasHeight: document.documentElement.clientHeight,

    points: [],
    clickColor: "red",
    clickAlpha: 1,
    clickTool: "marker",
    clickSize: "small",

    templine: {
        points: [],
        clickColor: null,
        clickAlpha: null,
        clickTool: null,
        clickSize: null
    },

    lines: new Array(),

    curTool: "pen",
    curColor: 'red',
    curSize: "normal",
    curAlpha: 1,

    create: function() {
        var _W = this.canvasWidth;
        var _H = this.canvasHeight;
        var canvasDiv = document.querySelector(this.container);
        var canvas = this.canvas = document.createElement('canvas');
        canvas.setAttribute('width', _W);
        canvas.setAttribute('height', _H);
        canvas.setAttribute('id', 'canvas');
        canvasDiv.appendChild(canvas);
        this.context = canvas.getContext("2d");
    },

    emitTime: {
        start: 0,
        end: 0,
        debounce: 50
    },

    /**
     * 事件触发器
     */
    delegate: function() {
        var _self = this;
        //start
        _self.canvas.onmousedown = function(e) {
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;

            if (_self.curTool == "pen" || _self.curTool == "marker") {
                _self.paint = true;
                _self.addLine(mouseX, mouseY, false);
            } else if (_self.curTool == "easer") {
                //橡皮擦工具 碰撞检测
                var willdelLine = _self.checkIntersection(mouseX, mouseY);
                if (willdelLine != null) {
                    _self.delSingleLine(willdelLine);
                }
            };
        };

        //move
        _self.canvas.onmousemove = function(e) {
            //过滤高频响应
            _self.emitTime.end = new Date().getTime();
            if ((_self.emitTime.end - _self.emitTime.start) < _self.emitTime.debounce) {
                return;
            } else {
                _self.emitTime.start = _self.emitTime.end;
            };

            if (_self.paint == true) {
                _self.addLine(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);

                //重新绘制原始数据
                _self.clearCanvas();
                _self.drawOldLines();

                _self.drawLine();
            }

        };

        //listener end
        _self.canvas.onmouseup = function(e) {
            mouseReset();
        };

        //listener mouseleave
        _self.canvas.onmouseleave = function(e) {
            mouseReset();
        };

        //mouseup || mouseleave handle
        var mouseReset = function() {
            if (_self.paint == true) {
                _self.paint = false;
                _self.lines.push(_self.templine);
                //reset arrays
                _self.resetTempline();
            };
        };
    },

    /**
     * Adds a point to the drawing array.
     * @param x
     * @param y
     * @param flag
     */
    addLine: function(x, y, flag) {
        var _self = this;
        _self.templine.points.push({ "x": x, "y": y });
        _self.templine.clickTool = _self.curTool;
        _self.templine.clickColor = _self.curColor;
        _self.templine.clickAlpha = _self.curAlpha;
        _self.templine.clickSize = _self.curSize;
    },

    /**
     * 工具参数设置
     * ${param type} 0:pen,  1:marker,  2:easer
     ***/
    toolsSet: function() {
        var _self = this;
        if (_self.curTool == "pen") { //实心笔
            _self.curAlpha = 1;
            _self.curSize = "normal";
        } else if (_self.curTool == "marker") { //萤光笔
            _self.curAlpha = 0.15;
            _self.curSize = "huge";
        } else if (_self.curTool == "easer") { //橡皮擦

        }
    },

    /**
     * 绘制原始数据 基于数据<Array>
     * */
    drawOldLines: function() {
        var _self = this;

        /*pen size*/
        var radius;
        _self.toolsSet();

        for (var i = 0, l = _self.lines.length; i < l; i++) {
            var item = _self.lines[i];
            _self.drawSingleLines(item);
        }
    },

    /**
     * 单线绘制
     * @{param item} 数据元素数据
     */
    drawSingleLines: function(item) {
        var _self = this;
        var radius = null;


        //set type
        if (item.curTool == "pen") { //实心笔
            _self.curAlpha = 1;
            _self.curSize = "normal";
        } else if (item.curTool == "marker") { //萤光笔
            _self.curAlpha = 0.12;
            _self.curSize = "huge";
        } else if (item.curTool == "easer") { //橡皮擦

        }

        //set size
        if (item.clickSize == "small") {
            radius = 2;
        } else if (item.clickSize == "normal") {
            radius = 5;
        } else if (item.clickSize == "large") {
            radius = 10;
        } else if (item.clickSize == "huge") {
            radius = 20;
        } else {
            radius = 0;
        }

        _self.context.strokeStyle = item.clickColor;
        _self.context.globalAlpha = item.clickAlpha;

        for (var i = 0, l = item.points.length; i < l; i++) {
            //begin a new path
            _self.context.beginPath();

            if (i) {
                _self.context.moveTo(item.points[i - 1].x, item.points[i - 1].y);
            } else {
                _self.context.moveTo(item.points[i].x, item.points[i].y);
            }

            _self.context.lineTo(item.points[i].x, item.points[i].y);
            _self.context.closePath();

            _self.context.lineJoin = "round";
            _self.context.lineWidth = radius;
            _self.context.stroke();
        };

        //end a the new path
        _self.context.restore();
    },

    /**
     * nw端实时绘制当前线
     * */
    drawLine: function() {
        var _self = this;
        /*clean area */
        // _self.clearCanvas();

        /*pen size*/
        var radius;

        _self.toolsSet();

        for (var i = 0, l = _self.templine.points.length; i < l; i++) {
            if (_self.templine.clickSize == "small") {
                radius = 2;
            } else if (_self.templine.clickSize == "normal") {
                radius = 5;
            } else if (_self.templine.clickSize == "large") {
                radius = 10;
            } else if (_self.templine.clickSize == "huge") {
                radius = 20;
            } else {
                radius = 0;
            }

            _self.context.beginPath();

            if (i) {
                _self.context.moveTo(_self.templine.points[i - 1].x, _self.templine.points[i - 1].y);
            } else {
                _self.context.moveTo(_self.templine.points[i].x, _self.templine.points[i].y);
            }
            _self.context.lineTo(_self.templine.points[i].x, _self.templine.points[i].y);
            _self.context.closePath();

            _self.context.strokeStyle = _self.templine.clickColor;
            _self.context.globalAlpha = _self.templine.clickAlpha;

            _self.context.lineJoin = "round";
            _self.context.lineWidth = radius;
            _self.context.stroke();
        }

        _self.context.restore();
    },

    /**
     * 重置当前画线
     */
    resetTempline: function() {
        this.templine = {
            points: [],
            clickColor: null,
            clickAlpha: null,
            clickTool: null,
            clickSize: null
        }
    },

    /**
     * clear canvas
     * 清除画布 并不删除数据
     * */
    clearCanvas: function() {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    },

    /**
     * 清除画布并删除数据
     */
    clearAndClear: function() {
        var _self = this;
        _self.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        _self.resetTempline();
        _self.lines = [];
    },

    /**
     * 检测是否交界
     * @{param} x, y
     * @return 碰撞的线
     * */
    checkIntersection: function(x, y) {
        var _self = this;
        var x1, x2, y1, y2;
        var boo = false;
        var willDelLine = null;

        for (var i = 0, len = _self.lines.length; i < len; i++) {
            var item = _self.lines[i];
            for (var j = 0, jlen = item.points.length - 1; j < jlen; j++) {
                x1 = item.points[j].x;
                x2 = item.points[j + 1].x;
                y1 = item.points[j].y;
                y2 = item.points[j + 1].y;

                boo = _self.checkout({
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    x: x,
                    y: y
                });

                if (boo) {
                    willDelLine = i;
                }
            }
        };

        return willDelLine;
    },

    /***
     * 数学公式计算斜率
     * 换算斜率公式
     * 求点到直线的距离
     */
    checkout: function(options) {
        var x1 = options.x1,
            x2 = options.x2,
            y1 = options.y1,
            y2 = options.y2,
            x = options.x,
            y = options.y;

        var radio = 10; //检测半径

        var returnBoo = false; //default
        var boundary = 15;

        var maxX = Math.max(x1, x2) + radio,
            maxY = Math.max(y1, y2) + radio,
            minX = Math.min(x1, x2) - radio,
            minY = Math.min(y1, y2) - radio;

        //设置检测区域    
        //判断是否在检测区域内
        if (x > minX && x < maxX && y > minY && y < maxY) {
            var l = Math.abs((y2 - y1) * x - (x2 - x1) * y + (x2 - x1) * y1 - (y2 - y1) * x1);
            var value = Math.sqrt(Math.pow((y2 - y1), 2) + Math.pow((x2 - x1), 2));

            if (l / value < boundary) {
                returnBoo = true;
            }
        }

        return returnBoo;
    },

    /**
     * 工具选择
     * ${param type} 0:pen,  1:marker,  2:easer
     ***/
    changeTool: function(type) {
        var _self = this;
        switch (type) {
            case 0:
                _self.curTool = "pen";
                break;
            case 1:
                _self.curTool = "marker";
                break;
            case 2:
                _self.curTool = "easer";
                break;
            default:
                break;
        };
    },

    /**
     * 删除单一线 并绘制出来
     * */
    delSingleLine: function(index) {
        var _self = this;
        _self.lines.splice(index, 1);

        //重新绘制
        _self.clearCanvas();
        _self.drawOldLines();
    },

    /**
     * 添加单一线 并绘制出来
     * */
    addSingleLine: function(item) {
        _self.lines.push(item);

        //重新绘制
        _self.clearCanvas();
        _self.drawOldLines();
    },

    /**
     * change color
     */
    changeColor: function(color) {
        var _self = this;
        _self.curColor = color;
    },

    //app init
    init: function(options) {
        this.container = options.container || 'body';
        this.create();
        this.delegate();
    },

    //app close
    close: function() {
        var _self = this;
        document.getElementById(_self.container).innerHTML = '';
        _self.resetTempline();
        _self.lines = [];
    }
};