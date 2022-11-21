/*
 * Extra components rendering
 *
 * Author   : Mikhail Shiryaev
 * Created  : 2018
 * Modified : 2020
 *
 * Requires:
 * - jquery
 * - schemecommon.js
 * - schemerender.js
 */

/********** Extra Components Utilities **********/

scada.scheme.extraCompUtils = {
    // Calculate a proportion of the specified value between minimum and maximum
    calcProportion: function (val, min, max) {
        var proportion = min < max ? (val - min) / (max - min) : 0;

        if (proportion < 0) {
            proportion = 0;
        } else if (proportion > 1) {
            proportion = 1;
        }

        return proportion;
    },

    // Normalize angle to the range from 0 to 2*Pi
    normAngle: function (angle) {
        var doublePi = 2 * Math.PI;

        while (angle < 0) {
            angle += doublePi;
        }

        while (angle >= doublePi) {
            angle -= doublePi;
        }

        return angle;
    }
};

/********** Chart Renderer **********/

scada.scheme.ChartRenderer = function () {
    scada.scheme.ComponentRenderer.call(this);
};

scada.scheme.ChartRenderer.prototype = Object.create(scada.scheme.ComponentRenderer.prototype);
scada.scheme.ChartRenderer.constructor = scada.scheme.ChartRenderer;

scada.scheme.ChartRenderer.prototype.createDom = function (component, renderContext) {
    var divComp = $("<div id='comp" + component.id + "' class='extra-chart'></div>");
    this.prepareComponent(divComp, component);
    var props = component.props;

    if (renderContext.editMode) {
        // display chart title and channel numbers
        if (props.Title) {
            $("<div></div>").text(props.Title).appendTo(divComp);
        }

        if (props.CnlNums.length > 0) {
            $("<div></div>").text(props.CnlNums.join(", ")).appendTo(divComp);
        }
    } else {
        // create iframe to display chart
        var viewHub = renderContext.schemeEnv.viewHub;
        var dialogs = viewHub ? viewHub.dialogs : null;
        var chartDialog = dialogs ? dialogs.getChartDialog() : null;

        if (chartDialog) {
            var viewIDs = Array(props.CnlNums.length).fill(renderContext.viewID);
            var chartOptions = {
                mode: props.Mode === 0 ? "fixed" : "rolling",
                period: -props.Period,
                title: props.Title,
                config: props.Config
            };
            var url = dialogs.rootPath + chartDialog.getChartUrl(
                props.CnlNums.join(","), viewIDs.join(","), null, chartOptions);
            var borders = props.BorderWidth * 2;

            $("<iframe></iframe>")
                .css({
                    "width": props.Size.Width - borders,
                    "height": props.Size.Height - borders
                })
                .attr("src", url)
                .appendTo(divComp);
        } else {
            console.warn("Chart dialog object is undefined");
        }
    }

    component.dom = divComp;
};

/********** Frame Renderer **********/

scada.scheme.FrameRenderer = function () {
    scada.scheme.ComponentRenderer.call(this);
};

scada.scheme.FrameRenderer.prototype = Object.create(scada.scheme.ComponentRenderer.prototype);
scada.scheme.FrameRenderer.constructor = scada.scheme.FrameRenderer;

scada.scheme.FrameRenderer.prototype.createDom = function (component, renderContext) {
    var divComp = $("<div id='comp" + component.id + "' class='extra-frame'></div>");
    this.prepareComponent(divComp, component);
    var props = component.props;

    if (renderContext.editMode) {
        // display URL
        var frameText = props.ViewID > 0 ? scada.utils.getViewUrl(props.ViewID, true) : props.Url;
        divComp.text(frameText ? frameText : "Frame is empty");
    } else {
        // create iframe
        var url = props.Url;

        if (props.ViewID > 0 && renderContext.schemeEnv.viewHub) {
            url = renderContext.schemeEnv.viewHub.getFullViewUrl(props.ViewID, true);
        }

        if (url) {
            var borders = props.BorderWidth * 2;

            $("<iframe></iframe>")
                .css({
                    "width": props.Size.Width - borders,
                    "height": props.Size.Height - borders
                })
                .attr("src", url)
                .appendTo(divComp);
        }
    }

    component.dom = divComp;
};

/********** Gauge Renderer **********/

scada.scheme.GaugeRenderer = function () {
    this.GAUGE_BACK_IMAGE = "url('../SchExtraComp/images/gauge-back.svg')";
    this.GAUGE_POINTER_IMAGE = "url('../SchExtraComp/images/gauge-pointer.svg')";

    scada.scheme.StaticPictureRenderer.call(this);
};

scada.scheme.GaugeRenderer.prototype = Object.create(scada.scheme.StaticPictureRenderer.prototype);
scada.scheme.GaugeRenderer.constructor = scada.scheme.GaugeRenderer;

scada.scheme.GaugeRenderer.prototype._getCanvasFont = function (fontProp) {
    // underline not supported
    return (fontProp.Italic ? "italic " : "") + (fontProp.Bold ? "bold " : "") +
        fontProp.Size + "px " + fontProp.Name;
};

scada.scheme.GaugeRenderer.prototype._createScale = function (props) {
    var min = props.Minimum;
    var max = props.Maximum;
    var valRange = max - min;
    var scaleProps = props.Scale;
    var step = scaleProps.Step;
    var showLabels = scaleProps.ShowLabels;
    var showTicks = scaleProps.ShowTicks;

    if (valRange > 0 && step > 0 && (showLabels || showTicks)) {
        var cnvScale = $("<canvas class='extra-gauge-scale'></canvas>");

        cnvScale.css({
            "width": props.Size.Width,
            "height": props.Size.Height
        });

        var canvas = cnvScale[0];
        canvas.width = props.Size.Width;
        canvas.height = props.Size.Height;

        var context = canvas.getContext("2d");
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = scaleProps.ForeColor;

        if (props.Scale.Font) {
            context.font = this._getCanvasFont(scaleProps.Font);
        }

        var minAngle = (90 - props.MinAngle) * Math.PI / 180; // in radians
        var angleRange = (props.MaxAngle - props.MinAngle) * Math.PI / 180;
        var decimalPlaces = scaleProps.DecimalPlaces;
        var lableRadius = scaleProps.LabelRadius;
        var rotateLabels = scaleProps.RotateLabels;
        var tickRadius = scaleProps.TickRadius;
        var tickWidth = scaleProps.TickSize.Width;
        var halfTickWidth = tickWidth / 2;
        var tickHeight = scaleProps.TickSize.Height;
        var pivotX = props.PivotLocation.X;
        var pivotY = props.PivotLocation.Y;
        var halfPi = Math.PI / 2;

        for (var val = min; val <= max; val += step) {
            var angle = minAngle - angleRange * (val - min) / valRange;
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);

            if (showLabels) {
                var text = val.toFixed(decimalPlaces);
                var labelX = Math.round(cos * lableRadius) + pivotX;
                var labelY = Math.round(-sin * lableRadius) + pivotY;

                if (rotateLabels) {
                    var normAngle = scada.scheme.extraCompUtils.normAngle(angle);
                    var labelAngle = halfPi - normAngle;

                    if (normAngle > Math.PI) {
                        labelAngle += Math.PI;
                    }

                    context.translate(labelX, labelY);
                    context.rotate(labelAngle);
                    context.fillText(text, 0, 0);
                    context.rotate(-labelAngle);
                    context.translate(-labelX, -labelY);
                } else {
                    context.fillText(text, labelX, labelY);
                }
            }

            if (showTicks) {
                var tickX = Math.round(cos * tickRadius) + pivotX;
                var tickY = Math.round(-sin * tickRadius) + pivotY;
                var tickAngle = halfPi - angle;

                context.translate(tickX, tickY);
                context.rotate(tickAngle);
                context.fillRect(-halfTickWidth, 0, tickWidth, tickHeight);
                context.rotate(-tickAngle);
                context.translate(-tickX, -tickY);
            }
        }

        return cnvScale;
    } else {
        return $();
    }
};

scada.scheme.GaugeRenderer.prototype._createPointer = function (props, renderContext) {
   var ImageStretches = scada.scheme.ImageStretches;
   var divPointer = $("<div class='extra-gauge-pointer'></div>");

    divPointer.css({
        "width": props.Pointer.Size.Width,
        "height": props.Pointer.Size.Height,
        "top": props.PivotLocation.Y - props.Pointer.CapLocation.Y,
        "left": props.PivotLocation.X - props.Pointer.CapLocation.X,
        "transform-origin": props.Pointer.CapLocation.X + "px " + props.Pointer.CapLocation.Y + "px",
        "background-repeat": "no-repeat",
        "background-position": "center",
        "background-clip": "padding-box"
    });

    switch (props.Pointer.ImageStretch) {
        case ImageStretches.FILL:
            divPointer.css("background-size",
                props.Pointer.Size.Width + "px " + props.Pointer.Size.Height + "px");
            break;
        case ImageStretches.ZOOM:
            divPointer.css("background-size", "contain");
            break;
    }

    if (props.Pointer.ImageName) {
        var pointerImage = renderContext.getImage(props.Pointer.ImageName);
        this.setBackgroundImage(divPointer, pointerImage);
    } else {
        divPointer.css("background-image", this.GAUGE_POINTER_IMAGE);
    }

    return divPointer;
};

scada.scheme.GaugeRenderer.prototype.createDom = function (component, renderContext) {
    scada.scheme.StaticPictureRenderer.prototype.createDom.call(this, component, renderContext);

    var props = component.props;
    var divComp = component.dom;
    this.bindAction(divComp, component, renderContext);
    divComp.addClass("extra-gauge");

    if (!props.ImageName) {
        divComp.css("background-image", this.GAUGE_BACK_IMAGE);
    }

    if (!renderContext.editMode) {
        divComp.addClass("undef");
    }

    var divContainer = $("<div class='extra-gauge-container'></div>");
    var scaleElem = this._createScale(props);
    var pointerElem = this._createPointer(props, renderContext);

    divContainer.append(scaleElem);
    divContainer.append(pointerElem);
    divComp.append(divContainer);
};

scada.scheme.GaugeRenderer.prototype.setSize = function (component, width, height) {
    scada.scheme.ComponentRenderer.prototype.setSize.call(this, component, width, height);

    // replace the scale
    var divComp = component.dom;
    var oldScaleElem = divComp.children(".extra-gauge-scale");
    var newScaleElem = this._createScale(component.props);
    oldScaleElem.replaceWith(newScaleElem);
};

scada.scheme.GaugeRenderer.prototype.updateData = function (component, renderContext) {
    var props = component.props;

    if (props.InCnlNum > 0) {
        var divComp = component.dom;
        var cnlDataExt = renderContext.getCnlDataExt(props.InCnlNum);

        if (cnlDataExt.Stat > 0) {
            // rotate the pointer
            divComp.removeClass("undef");
            var divPointer = divComp.find(".extra-gauge-pointer:first");
            var proportion = scada.scheme.extraCompUtils.calcProportion(cnlDataExt.Val, props.Minimum, props.Maximum);
            var angle = (props.MaxAngle - props.MinAngle) * proportion + props.MinAngle;
            divPointer.css("transform", "rotate(" + angle + "deg)");
        } else {
            divComp.addClass("undef");
        }
    }
};

/********** Level Renderer **********/

scada.scheme.LevelRenderer = function () {
    scada.scheme.ComponentRenderer.call(this);
};

scada.scheme.LevelRenderer.prototype = Object.create(scada.scheme.ComponentRenderer.prototype);
scada.scheme.LevelRenderer.constructor = scada.scheme.LevelRenderer;

scada.scheme.LevelRenderer.prototype._applySize = function (divComp, divContainer, divBar, component) {
    var props = component.props;
    var borders = (props.BorderWidth + props.Padding) * 2;
    var isVertical = props.Size.Width <= props.Size.Height;
    var levelWidth = props.Size.Width - borders;
    var levelHeight = props.Size.Height - borders;

    divComp.css({
        "padding": props.Padding
    });

    divContainer.css({
        "width": levelWidth,
        "height": levelHeight,
        "min-width": levelWidth,
        "min-height": levelHeight
    });

    if (isVertical) {
        divBar.css({
            "width": levelWidth,
            "height": levelHeight / 2
        });
    } else {
        divBar.css({
            "width": levelWidth / 2,
            "height": levelHeight
        });
    }
};

scada.scheme.LevelRenderer.prototype.createDom = function (component, renderContext) {
    var props = component.props;

    var divComp = $("<div id='comp" + component.id + "' class='extra-level'></div>");
    var divContainer = $("<div class='extra-level-container'></div>");
    var divBar = $("<div class='extra-level-bar'></div>");

    this.prepareComponent(divComp, component, true);
    this.bindAction(divComp, component, renderContext);
    this.setBackColor(divBar, props.BarColor);
    this._applySize(divComp, divContainer, divBar, component);

    if (!renderContext.editMode) {
        divComp.addClass("undef");
    }

    divContainer.append(divBar);
    divComp.append(divContainer);
    component.dom = divComp;
};

scada.scheme.LevelRenderer.prototype.setSize = function (component, width, height) {
    scada.scheme.ComponentRenderer.prototype.setSize.call(this, component, width, height);

    var divComp = component.dom;
    var divContainer = divComp.children(".extra-level-container");
    var divBar = divContainer.children(".extra-level-bar");
    this._applySize(divComp, divContainer, divBar, component);
};

scada.scheme.LevelRenderer.prototype.updateData = function (component, renderContext) {
    var props = component.props;
    component.cmdVal = 0;

    if (props.InCnlNum > 0) {
        var divComp = component.dom;
        var divBar = divComp.find(".extra-level-bar");
        var cnlDataExt = renderContext.getCnlDataExt(props.InCnlNum);

        if (cnlDataExt.Stat > 0) {
            divComp.removeClass("undef");

            var proportion = scada.scheme.extraCompUtils.calcProportion(cnlDataExt.Val, props.Minimum, props.Maximum);
            var isVertical = props.Size.Width <= props.Size.Height;
            var borders = (props.BorderWidth + props.Padding) * 2;

            if (isVertical) {
                divBar.css("height", (props.Size.Height - borders) * proportion);
            } else {
                divBar.css("width", (props.Size.Width - borders) * proportion);
            }
        } else {
            divComp.addClass("undef");
        }

        // set colors that depend on status
        var statusColor = cnlDataExt.Color;
        this.setBackColor(divComp, props.BackColor, true, statusColor);
        this.setBorderColor(divComp, props.BorderColor, true, statusColor);
        this.setBackColor(divBar, props.BarColor, true, statusColor);
    }
};

/********** Trend Renderer **********/

scada.scheme.TrendPoint = function (timeStamp) {
    this.timeStamp = timeStamp;
    this.value = NaN;
};

scada.scheme.TrendRange = function (isEmpty, min, max) {
    this.isEmpty = isEmpty;
    this.min = min;
    this.max = max;
};

scada.scheme.TrendRenderer = function () {
    this.DEFAULT_FORE_COLOR = "Black";
    this.DEFAULT_FONT_SIZE = 12;
    this.MS_PER_MIN = 60000;

    this.trendPoints = [];
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.context = null;
    this.yRange = null;
    this.startTime = 0;
    this.endTime = 0;
    scada.scheme.ComponentRenderer.call(this);
};

scada.scheme.TrendRenderer.prototype = Object.create(scada.scheme.ComponentRenderer.prototype);
scada.scheme.TrendRenderer.constructor = scada.scheme.TrendRenderer;

scada.scheme.TrendRenderer.prototype._fillWithDemoPoints = function (period) {
    this.endTime = Date.now();
    this.startTime = this.endTime - period * this.MS_PER_MIN;
    var time = this.startTime;
    this.trendPoints = [];

    while (time <= this.endTime) {
        var trendPoint = new scada.scheme.TrendPoint(time);
        trendPoint.value = Math.sin(2 * Math.PI * (time - this.startTime) / this.MS_PER_MIN);
        this.trendPoints.push(trendPoint);
        time += 1000; // 1 second
    }
};

scada.scheme.TrendRenderer.prototype._getTrendColor = function (foreColor, statusColor) {
    return foreColor === this.STATUS_COLOR ? statusColor : foreColor || this.DEFAULT_FORE_COLOR;
};

scada.scheme.TrendRenderer.prototype._calcYRange = function () {
    var isEmpty = true;
    var min = NaN;
    var max = NaN;

    if (this.trendPoints.length > 0) {
        for (let trendPoint of this.trendPoints) {
            let val = trendPoint.value;

            if (!isNaN(val)) {
                if (isNaN(min) || min > val) {
                    min = val;
                }
                if (isNaN(max) || max < val) {
                    max = val;
                }
            }
        }

        if (!isNaN(min) && !isNaN(max)) {
            isEmpty = false;
            if (min === max) {
                min -= 1;
                max += 1;
            }
        }
    }

    return new scada.scheme.TrendRange(isEmpty, min, max);
};

scada.scheme.TrendRenderer.prototype._drawLine = function (x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;

    if (dx !== 0 || dy !== 0) {
        if (Math.abs(dx) > Math.abs(dy)) {
            let a = dy / dx;
            let b = -a * x1 + y1;

            if (dx < 0) {
                var x0 = x1;
                x1 = x2;
                x2 = x0;
            }

            for (let x = x1; x <= x2; x++) {
                let y = Math.round(a * x + b);
                this.context.fillRect(x, y, 1, 1);
            }
        } else {
            let a = dx / dy;
            let b = -a * y1 + x1;

            if (dy < 0) {
                var y0 = y1;
                y1 = y2;
                y2 = y0;
            }

            for (let y = y1; y <= y2; y++) {
                let x = Math.round(a * y + b);
                this.context.fillRect(x, y, 1, 1);
            }
        }
    }
};

scada.scheme.TrendRenderer.prototype._draw = function (color) {
    var yRange = this.yRange || this._calcYRange();
    this.context.fillStyle = color;
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    if (!yRange.isEmpty && this.startTime < this.endTime) {
        var coefX = (this.canvasWidth - 1) / (this.endTime - this.startTime);
        var coefY = (this.canvasHeight - 3) / (yRange.max - yRange.min);
        var prevX = NaN;
        var prevY = NaN;

        for (var trendPoint of this.trendPoints) {
            if (isNaN(trendPoint.value)) {
                prevX = NaN;
                prevY = NaN;
            } else {
                var x = Math.round((trendPoint.timeStamp - this.startTime) * coefX);
                var y = Math.round((yRange.max - trendPoint.value) * coefY + 1);

                if (!isNaN(prevX)) {
                    this._drawLine(prevX, prevY, x, y);
                }

                prevX = x;
                prevY = y;
            }
        }
    }
};

scada.scheme.TrendRenderer.prototype._printCnlNum = function (cnlNum) {
    this.context.textAlign = "left";
    this.context.textBaseline = "top";
    this.context.font = this.DEFAULT_FONT_SIZE + "px Arial";

    var text = "[" + cnlNum + "]";
    var textWidth = this.context.measureText(text).width;
    var x = Math.trunc((this.canvasWidth - textWidth) / 2);
    var y = Math.trunc((this.canvasHeight - this.DEFAULT_FONT_SIZE) / 2);
    this.context.clearRect(x, y, textWidth, this.DEFAULT_FONT_SIZE);
    this.context.fillText(text, x, y);
};

scada.scheme.TrendRenderer.prototype._setCanvasSize = function (canvasJqElem, width, height, borderWidth) {
    var borders = borderWidth * 2;
    this.canvasWidth = width - borders;
    this.canvasHeight = height - borders;

    canvasJqElem.css({
        "width": this.canvasWidth,
        "height": this.canvasHeight
    });

    var canvas = canvasJqElem[0];
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
};

scada.scheme.TrendRenderer.prototype.createDom = function (component, renderContext) {
    var divComp = $("<div id='comp" + component.id + "' class='extra-trend'></div>");
    this.prepareComponent(divComp, component);
    this.bindAction(divComp, component, renderContext);
    var props = component.props;

    // create canvas and context
    var canvasElem = $("<canvas></canvas>");
    this.context = canvasElem[0].getContext("2d");
    this._setCanvasSize(canvasElem, props.Size.Width, props.Size.Height, props.BorderWidth);
    divComp.append(canvasElem);

    // initialize Y range
    this.yRange = props.Minimum < props.Maximum ?
        new scada.scheme.TrendRange(false, props.Minimum, props.Maximum) : null;

    // draw trend in edit mode
    if (renderContext.editMode) {
        this._fillWithDemoPoints(props.Period);
        this._draw(this._getTrendColor(props.ForeColor, this.STATUS_DISPLAY_COLOR));
        this._printCnlNum(props.InCnlNum);
    }

    component.dom = divComp;
};

scada.scheme.TrendRenderer.prototype.setSize = function (component, width, height) {
    scada.scheme.ComponentRenderer.prototype.setSize.call(this, component, width, height);

    var props = component.props;
    var canvasElem = component.dom.children("canvas:first");
    this._setCanvasSize(canvasElem, props.Size.Width, props.Size.Height, props.BorderWidth);
    this._draw(this._getTrendColor(props.ForeColor, this.STATUS_DISPLAY_COLOR));
    this._printCnlNum(props.InCnlNum);
};

scada.scheme.TrendRenderer.prototype.updateData = function (component, renderContext) {
    var props = component.props;

    if (props.InCnlNum > 0) {
        // remove outdated points
        this.endTime = Date.now();
        this.startTime = this.endTime - props.Period * this.MS_PER_MIN;
        var startIdx = 0;

        for (let i = 0, len = this.trendPoints.length; i < len; i++) {
            let point = this.trendPoints[i];
            if (point.timeStamp < this.startTime) {
                startIdx = i + 1;
            } else {
                break;
            }
        }

        if (startIdx > 0) {
            this.trendPoints = this.trendPoints.slice(startIdx);
        }

        // add new point
        var cnlDataExt = renderContext.getCnlDataExt(props.InCnlNum);
        var trendPoint = new scada.scheme.TrendPoint(this.endTime);

        if (cnlDataExt.Stat > 0 && !isNaN(cnlDataExt.Val)) {
            trendPoint.value = cnlDataExt.Val;
        }

        this.trendPoints.push(trendPoint);

        // set colors that depend on status
        var divComp = component.dom;
        var statusColor = cnlDataExt.Color;
        this.setBackColor(divComp, props.BackColor, true, statusColor);
        this.setBorderColor(divComp, props.BorderColor, true, statusColor);

        // draw trend
        this._draw(this._getTrendColor(props.ForeColor, statusColor));
    }
};

/********** Renderer Map **********/

// Add components to the renderer map
scada.scheme.rendererMap.set("Scada.Web.Plugins.SchExtraComp.Chart", new scada.scheme.ChartRenderer());
scada.scheme.rendererMap.set("Scada.Web.Plugins.SchExtraComp.Frame", new scada.scheme.FrameRenderer());
scada.scheme.rendererMap.set("Scada.Web.Plugins.SchExtraComp.Gauge", new scada.scheme.GaugeRenderer());
scada.scheme.rendererMap.set("Scada.Web.Plugins.SchExtraComp.Level", new scada.scheme.LevelRenderer());
scada.scheme.rendererMap.set("Scada.Web.Plugins.SchExtraComp.Trend", new scada.scheme.TrendRenderer());
