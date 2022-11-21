/*
 * Extends chart control
 *
 * Author   : Mikhail Shiryaev
 * Created  : 2016
 * Modified : 2020
 *
 * Requires:
 * - jquery
 * - hummer
 * - utils.js
 * - chart.js
 */

/********** Default Phrases **********/

// The default phrases object.
scada.chart.defaultPhrases = {
    ZoomIn: "Zoom In",
    ZoomOut: "Zoom Out",
    ResetZoom: "Reset Zoom"
};

/********** Time Selection **********/

// Represents a time selection.
scada.chart.TimeSelection = function () {
    // The absolute start coordinate of the selection relative to the document.
    this.absStartX = 0;
    // The absolute end coordinate of the selection relative to the document.
    this.absEndX = 0;
    // Indicates whether selection is in progress.
    this.inProgress = false;
};

/********** Pinch Data **********/

// Represents pinch data.
scada.chart.PinchData = function (pinchEvent) {
    // The zoom scale.
    this.scale = 1;
    // The X-coordinate of the gesture center relative to the chart.
    this.centerX = 0;
    // The Y-coordinate of the gesture center relative to the chart.
    this.centerY = 0;

    this._init(pinchEvent);
};

// Initializes the pinch data based on the specified event.
scada.chart.PinchData.prototype._init = function (pinchEvent) {
    this.scale = pinchEvent.scale;
    this.centerX = pinchEvent.center.x;
    this.centerY = pinchEvent.center.y;
};

/********** XAxisMode Enumeration **********/

// Specifies the X-axis modes.
scada.chart.XAxisMode = {
    FIXED: 0,
    ROLLING: 1
};

/********** Behavior Options **********/

// Represents chart behavior options.
scada.chart.BehaviorOptions = function () {
    // The chart refresh rate, ms.
    this.refreshRate = 60000;
};

/********** Extension of Chart Control **********/

// The time selection set by a user.
scada.chart.Chart.prototype._timeSelection = new scada.chart.TimeSelection();
// The time selection jQuery element.
scada.chart.Chart.prototype._timeSelectionElem = null;
// The pinch information jQuery element.
scada.chart.Chart.prototype._pinchInfoElem = null;
// The reset zoom button.
scada.chart.Chart.prototype._resetZoomBtn = null;
// The behavior options.
scada.chart.Chart.prototype.behaviorOptions = new scada.chart.BehaviorOptions();
// The localized phrases used by the chart.
scada.chart.Chart.prototype.phrases = scada.chart.defaultPhrases;

// Creates a time selection element if it doesn't exist.
scada.chart.Chart.prototype._initTimeSelectionElem = function () {
    if (!this._timeSelectionElem) {
        this._timeSelectionElem = $("<div class='chart-time-selection hidden'></div>")
            .css("background-color", this.displayOptions.plotArea.selectionColor);
        this._chartJqElem.append(this._timeSelectionElem);
    }
};

// Starts the time selection from the specified point.
scada.chart.Chart.prototype._startTimeSelection = function (pageX, pageY) {
    this._chartLayout.updateAbsCoordinates(this._canvasJqElem);

    pageX = Math.floor(pageX);
    pageY = Math.floor(pageY);

    if (this._chartLayout.pointInPlotArea(pageX, pageY)) {
        var areaRect = this._chartLayout.absPlotAreaRect;
        var chartOffset = this._chartJqElem.offset();

        this._timeSelection.absStartX = pageX;
        this._timeSelection.absEndX = pageX;
        this._timeSelection.inProgress = true;

        this._initTimeSelectionElem();
        this._timeSelectionElem
            .css({
                "left": pageX - chartOffset.left,
                "top": areaRect.top - chartOffset.top,
                "width": 1,
                "height": areaRect.height
            })
            .removeClass("hidden");

        return true;
    } else {
        this._cancelTimeSelection();
        return false;
    }
};

// Continues the time selection at the specified point.
scada.chart.Chart.prototype._continueTimeSelection = function (pageX, pageY) {
    pageX = Math.floor(pageX);
    pageY = Math.floor(pageY);

    if (this._timeSelection.inProgress && this._chartLayout.pointInPlotArea(pageX, pageY)) {
        var chartOffset = this._chartJqElem.offset();
        this._timeSelection.absEndX = pageX;
        var startX = this._timeSelection.absStartX;

        if (pageX >= startX) {
            this._timeSelectionElem.css({
                "left": startX - chartOffset.left,
                "width": pageX - startX + 1
            });
        } else {
            this._timeSelectionElem.css({
                "left": pageX - chartOffset.left,
                "width": startX - pageX + 1
            });
        }
    }
};

// Stops the time selection at the specified point and applies the new scale.
scada.chart.Chart.prototype._stopTimeSelection = function () {
    var timeSel = this._timeSelection;

    if (timeSel.inProgress) {
        this._cancelTimeSelection();

        if (timeSel.absStartX !== timeSel.absEndX) {
            var startX = this._pageXToTrendX(timeSel.absStartX);
            var endX = this._pageXToTrendX(timeSel.absEndX);
            this.setRange(startX, endX);
        }

        this._showHideResetZoomBtn();
    }
};

// Cancels the time selection.
scada.chart.Chart.prototype._cancelTimeSelection = function () {
    this._timeSelection.inProgress = false;
    if (this._timeSelectionElem) {
        this._timeSelectionElem.addClass("hidden");
    }
};

// Creates a pinch information element if it doesn't exist.
scada.chart.Chart.prototype._initPinchInfoElem = function () {
    if (!this._pinchInfoElem) {
        this._pinchInfoElem = $("<div class='chart-trend-hint hidden'></div>");
        this._chartJqElem.append(this._pinchInfoElem);
    }
};

// Starts a pinch zooming process.
scada.chart.Chart.prototype._startPinchZoom = function (pinchData) {
    this._hintEnabled = false;
    this._continuePinchZoom(pinchData);
};

// Continues the pinch zooming process.
scada.chart.Chart.prototype._continuePinchZoom = function (pinchData) {
    this._chartLayout.updateAbsCoordinates(this._canvasJqElem);
    this._initPinchInfoElem();

    // construct zoom info
    var scaleStr = Math.round(pinchData.scale * 10) / 10.0;
    var infoText = (pinchData.scale >= 1 ? this.phrases.ZoomIn : this.phrases.ZoomOut) +
        " " + scaleStr + "x";

    // allow measuring the pinch info element
    var pinchInfoElem = this._pinchInfoElem;
    pinchInfoElem
        .text(infoText)
        .css({
            "left": 0,
            "top": 0,
            "visibility": "hidden"
        })
        .removeClass("hidden");

    // display the pinch info element
    var chartOffset = this._chartJqElem.offset();
    pinchInfoElem.css({
        "left": pinchData.centerX - chartOffset.left - pinchInfoElem.outerWidth() / 2,
        "top": pinchData.centerY - chartOffset.top - this._chartLayout.HINT_OFFSET - pinchInfoElem.outerHeight(),
        "visibility": ""
    });
};

// Stops the pinch zooming process.
scada.chart.Chart.prototype._stopPinchZoom = function (pinchData) {
    this._cancelPinchZoom();
    var timeRange = this._getTimeRange(pinchData);
    this.setRange(timeRange.startTime, timeRange.endTime);
    this._showHideResetZoomBtn();
};

// Cancels the pinch zooming process.
scada.chart.Chart.prototype._cancelPinchZoom = function () {
    this._hintEnabled = true;
    this._pinchInfoElem.addClass("hidden");
};

// Gets the time range according to the specified pinch data.
scada.chart.Chart.prototype._getTimeRange = function (pinchData) {
    var centerTime = this._pageXToTrendX(pinchData.centerX);
    var rangeWidth = (this._xAxisTag.max - this._xAxisTag.min) / pinchData.scale;
    var startTime = centerTime - rangeWidth / 2;
    var endTime = startTime + rangeWidth;

    if (startTime < this.timeRange.startTime) {
        var shift = this.timeRange.startTime - startTime;
        startTime = this.timeRange.startTime;
        endTime += shift;
    }

    if (endTime > this.timeRange.endTime) {
        endTime = this.timeRange.endTime;
    }

    var timeRange = new scada.chart.TimeRange();
    timeRange.startTime = startTime;
    timeRange.endTime = endTime;
    return timeRange;
};

// Creates a reset zoom button if it doesn't exist.
scada.chart.Chart.prototype._initResetZoomBtn = function () {
    if (!this._resetZoomBtn) {
        this._resetZoomBtn = $("<div class='chart-reset-zoom hidden' title='" + this.phrases.ResetZoom + "'>" +
            "<span class='glyphicon glyphicon-zoom-out'></span></div>");
        this._chartJqElem.append(this._resetZoomBtn);

        var thisObj = this;
        this._resetZoomBtn.on("mousedown", function (event) {
            event.stopPropagation();
            $(this).addClass("hidden");
            thisObj.resetRange();
        });
    }
};

// Determines visibility of the reset zoom button.
scada.chart.Chart.prototype._showHideResetZoomBtn = function () {
    this._initResetZoomBtn();

    if (this._zoomMode) {
        this._resetZoomBtn
            .css({
                "right": this._chartLayout.width - this._chartLayout.plotAreaRect.right,
                "top": this._chartLayout.plotAreaRect.top
            })
            .removeClass("hidden");
    } else {
        this._resetZoomBtn.addClass("hidden");
    }
};

// Binds events to allow scaling.
scada.chart.Chart.prototype.bindScalingEvents = function () {
    if (this._canvasJqElem && this._canvasJqElem.length) {
        var thisObj = this;

        // events for desktop
        $(this._canvasJqElem.parent())
        .off(".scada.chart.scaling")
        .on("touchstart.scada.chart.scaling", function () {
            // switch off mouse selection for tablets
            $(this).off("mousedown.scada.chart.scaling");
        })
        .on("mousedown.scada.chart.scaling", function (event) {
            if (thisObj._startTimeSelection(event.pageX, event.pageY)) {
                event.preventDefault();
            }
        })
        .on("mousemove.scada.chart.scaling", function (event) {
            thisObj._continueTimeSelection(event.pageX, event.pageY);
        })
        .on("mouseup.scada.chart.scaling", function () {
            thisObj._stopTimeSelection();
        });

        // touch events
        var touchArea = this._canvasJqElem[0];
        var mc = new Hammer.Manager(touchArea, {
            recognizers: [
                [Hammer.Pinch, { enable: true }]
            ]
        });

        mc
        .on("pinchstart", function (event) {
            thisObj._startPinchZoom(new scada.chart.PinchData(event));
        })
        .on("pinchmove", function (event) {
            thisObj._continuePinchZoom(new scada.chart.PinchData(event));
        })
        .on("pinchend", function (event) {
            thisObj._stopPinchZoom(new scada.chart.PinchData(event));
        })
        .on("pinchcancel", function () {
            thisObj._cancelPinchZoom();
        });
    }
};

// Gets a value indicating whether the chart is zoomed.
scada.chart.Chart.prototype.getZoomMode = function () {
    return this._zoomMode;
};
