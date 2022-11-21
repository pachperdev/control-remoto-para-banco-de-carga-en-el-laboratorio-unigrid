// The variables below must be defined in ChartPro.aspx
// object displayOptions
// object behaviorOptions
// object timeRange
// object chartData
// int chartMode
// int period
// string startDateStr
// string endDateStr
// string todayStr
// string chartTitle
// string chartStatus
// object phrases

// Specifies the chart modes.
ChartMode = {
    FIXED: 0,
    ROLLING: 1
};

// Specifies the loading states.
LoadState = {
    NOT_STARTED: 0,
    FAST_LOADING: 1,
    AUTO_REFRESH: 2,
    COMPLETE: 3
};

// The data request rate in FAST_LOADING state.
var FAST_RATE = 50;
// The data request rate if error occurs in any loading state.
var ERROR_RATE = 10000;
// The delay loading chart.
var LOAD_DELAY = 1000;
// The site root path relative to ChartPro.aspx.
var ROOT_PATH = "../../";

// The current loading state.
var loadState = LoadState.NOT_STARTED;
// The time offset of requested data.
var timeOffset = 0;
// Indicates whether the last request is successful.
var lastReqSuccessful = true;
// The input channel numbers retrieved from the query string.
var cnlNumsParam = "";
// The view IDs retrieved from the query string.
var viewIDsParam = "";
// The date of the last requested data in string format.
var reqDateStr = "";
// The current server date and time in string format.
var nowStr = "";
// The chart.
var chart = null;
// The number of displayed points in the data panel.
var dataPtCnt = 0;
// Manipulates popup dialogs.
var popup = new scada.Popup();


// Starts the chart loading process.
function startLoadingChart() {
    cnlNumsParam = scada.utils.getQueryParam("cnlNums");
    viewIDsParam = scada.utils.getQueryParam("viewIDs");

    if (chartMode === ChartMode.FIXED) {
        reqDateStr = startDateStr;
        timeOffset = timeRange.startTime;
    } else {
        reqDateStr = "";
        timeOffset = timeRange.startTime - 1;
    }

    continueLoadingChart();
}

// Continues the chart loading process.
function continueLoadingChart() {
    if (lastReqSuccessful) {
        // determine loading state and time offset
        if (reqDateStr < endDateStr) {
            loadState = LoadState.FAST_LOADING;
            timeOffset = Math.floor(timeOffset) + 1;
        } else {
            if (reqDateStr === todayStr) {
                loadState = LoadState.AUTO_REFRESH;
                timeOffset = getNextTime();
            } else {
                loadState = LoadState.COMPLETE;
            }

            if (nowStr) {
                chart.showStatus(phrases.Generated + nowStr);
            }
        }

        logLoadingState();
    } else {
        chart.showStatus(phrases.LoadError, true);
    }

    // enqueue chart loading
    switch (loadState) {
        case LoadState.FAST_LOADING:
            setTimeout(loadChart, lastReqSuccessful ? FAST_RATE : ERROR_RATE);
            break;
        case LoadState.AUTO_REFRESH:
            setTimeout(loadChart, lastReqSuccessful ? chart.behaviorOptions.refreshRate : ERROR_RATE);
            break;
    }
}

// Gets the next time point to request.
function getNextTime() {
    var len = chart.chartData.timePoints.length;
    return len ? chart.chartData.timePoints[len - 1] + scada.chart.const.TIME_EPSILON : timeRange.startTime;
}

// Logs loading state and time offset to console.
function logLoadingState() {
    var stateName = "unknown";
    switch (loadState) {
        case LoadState.NOT_STARTED:
            stateName = "NOT_STARTED";
            break;
        case LoadState.FAST_LOADING:
            stateName = "FAST_LOADING";
            break;
        case LoadState.AUTO_REFRESH:
            stateName = "AUTO_REFRESH";
            break;
        case LoadState.COMPLETE:
            stateName = "COMPLETE";
            break;
    }

    console.info(scada.utils.getCurTime() + " Chart loading state is " + stateName + ", time offset is " + timeOffset);
}

// Loads chart data.
function loadChart() {
    // postpone loading if the chart is zoomed in the Rolling mode
    if (chartMode === ChartMode.ROLLING && chart.getZoomMode()) {
        setTimeout(loadChart, LOAD_DELAY);
        return;
    }

    // request chart data
    var operation;
    var query = "?cnlNums=" + cnlNumsParam + "&viewIDs=" + viewIDsParam + "&timeOffset=" + timeOffset;

    if (chartMode === ChartMode.FIXED) {
        operation = "ChartSvc.svc/GetDailyChartData";
    } else {
        operation = "ChartSvc.svc/GetTailChartData";
        query += "&period=" + period;
    }

    chart.showStatus(phrases.DataLoading);

    $.ajax({
        url: operation + query,
        method: "GET",
        dataType: "json",
        cache: false
    })
    .done(function (data, textStatus, jqXHR) {
        try {
            var parsedData = $.parseJSON(data.d);
            if (parsedData.Success) {
                scada.utils.logSuccessfulRequest(operation);
                if (obtainChartData(parsedData)) {
                    lastReqSuccessful = true;
                } else {
                    console.warn(scada.utils.getCurTime() + " Received data were not correctly processed");
                    lastReqSuccessful = false;
                }
            } else {
                scada.utils.logServiceError(operation, parsedData.ErrorMessage);
                lastReqSuccessful = false;
            }
        }
        catch (ex) {
            scada.utils.logProcessingError(operation, ex.message);
            lastReqSuccessful = false;
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        scada.utils.logFailedRequest(operation, jqXHR);
        lastReqSuccessful = false;
    })
    .always(function () {
        continueLoadingChart();
    });
}

// Obtains received chart data.
function obtainChartData(parsedData) {
    var timePoints = chart.chartData.timePoints;
    var trends = chart.chartData.trends;
    var newTimePoints = parsedData.TimePoints;
    var newTrends = parsedData.TrendDataArr;
    var isRollingMode = chartMode === ChartMode.ROLLING;

    if (newTimePoints.length) {
        var existingLen = timePoints.length;

        // validate data
        if (newTrends.length !== trends.length ||
            existingLen > 0 && timePoints[existingLen - 1] >= newTimePoints[0]) {
            return false;
        }

        // append the received chart data to the existing
        Array.prototype.push.apply(timePoints, newTimePoints);

        for (var i = 0; i < trends.length; i++) {
            Array.prototype.push.apply(trends[i].trendPoints, newTrends[i].TrendPoints);
        }

        if (isRollingMode) {
            // remove outdated points
            var firstPtIdx = 0;
            var startTime = parsedData.StartTime;

            for (let i = 0, len = timePoints.length; i < len; i++) {
                if (startTime <= timePoints[i]) {
                    firstPtIdx = i;
                    break;
                }
            }

            if (firstPtIdx > 0) {
                chart.chartData.timePoints = timePoints.slice(firstPtIdx);
                for (let trend of trends) {
                    trend.trendPoints = trend.trendPoints.slice(firstPtIdx);
                }
            }

            // draw the chart
            chart.timeRange.startTime = parsedData.StartTime;
            chart.timeRange.endTime = parsedData.EndTime;
            chart.resetRange();
        } else {
            // resume the chart
            chart.resume(existingLen);
        }

        // add rows to data table if it is visible
        if ($("#divData").hasClass("show")) {
            generateDataHtml();
        }
    }

    reqDateStr = parsedData.ReqDateStr;
    todayStr = parsedData.TodayStr;
    nowStr = parsedData.NowStr;

    if (isRollingMode) {
        startDateStr = parsedData.StartDateStr;
        endDateStr = todayStr;
    }

    return true;
}

// Applies additional CSS styles in case of using iOS.
function styleIOS() {
    if (scada.utils.iOS()) {
        scada.utils.styleIOS($("#divData"));
        $(".chart-wrapper").css("display", "inline-block");
        $("#hlExport").parent().addClass("hidden"); // hide Export menu item
    }
}

// Updates layout of the form.
function updateLayout() {
    var divChartContent = $("#divChartContent");
    var divChart = $("#divChart");
    var divChartSplitter = $("#divChartSplitter");
    var divData = $("#divData");
    var winH = $(window).height();

    divChartContent.outerHeight(winH);
    divChart.outerHeight(winH);
    divChartSplitter.outerHeight(winH);
    divData.outerHeight(winH, true);

    if (divData.hasClass("show")) {
        divChart.outerWidth($(window).width() - divData.outerWidth() - $("#divChartSplitter").outerWidth());
    } else {
        divChart.outerWidth($(window).width());
    }
}

// Generates HTML to display data if needed.
function generateDataHtml() {
    var TrendPointIndex = scada.chart.TrendPointIndex;
    var timePoints = chart.chartData.timePoints;
    var trends = chart.chartData.trends;
    var timePtCnt = timePoints.length;
    var dataTable = $("#tblData");

    // remove outdated rows
    if (chartMode === ChartMode.ROLLING) {
        dataPtCnt = 0;

        if (timePtCnt > 0) {
            var startTime = timePoints[0];
            dataTable.find("tr").each(function () {
                var rowElem = $(this);
                var time = rowElem.data("time");

                if (time) {
                    if (time < startTime) {
                        rowElem.remove();
                    } else if (rowElem.hasClass("point")) {
                        dataPtCnt++;
                    }
                }
            });
        } else {
            dataTable.find("tr.date, tr.point").remove();
        }
    }

    if (timePtCnt > 0 && trends.length > 0) {
        var createTableRequired = dataTable.length === 0;

        if (createTableRequired) {
            var dataTableHtml = "<table id='tblData'></table>";
            dataTable = $(dataTableHtml);

            // add table header
            var hdrRowHtml = "<tr class='hdr'><td><span>" + phrases.TimeCol + "</span></td>";
            for (let trend of trends) {
                hdrRowHtml += "<td><span>[" + trend.cnlNum + "]</span></td>";
            }
            hdrRowHtml += "</tr>";
            dataTable.append(hdrRowHtml);

            $(".table-wrapper").append(dataTable);
            $("#lblNoData").addClass("hidden");
        }

        // add trends data
        if (dataPtCnt < timePtCnt) {
            var newRows = new Array(timePtCnt - dataPtCnt);
            var rowInd = 0;
            var showDates = Math.trunc(chart.timeRange.startTime) < Math.trunc(chart.timeRange.endTime) - 1;
            var prevDate = dataPtCnt > 0 ? Math.floor(timePoints[dataPtCnt - 1]) : null;
            var emptyCells = "";

            if (showDates) {
                for (let trend of trends) {
                    emptyCells += "<td></td>";
                }
            }

            for (var timePtInd = dataPtCnt; timePtInd < timePtCnt; timePtInd++) {
                var timePoint = timePoints[timePtInd];

                if (showDates) {
                    // add date row if date is changed
                    var curDate = Math.floor(timePoint);
                    if (prevDate !== curDate) {
                        prevDate = curDate;
                        var dateRowHtml = "<tr class='date' data-time='" + curDate + "'><td>" +
                            chart.dateToStr(timePoint) + "</td>" + emptyCells + "</tr>";
                        newRows.length++;
                        newRows[rowInd] = dateRowHtml;
                        rowInd++;
                    }
                }

                // add data row
                var dataRowHtml = "<tr class='point' data-time='" + timePoint + "'><td>" +
                    chart.timeToStrFast(timePoint, true) + "</td>";

                for (let trend of trends) {
                    var trendPoint = trend.trendPoints[timePtInd];
                    dataRowHtml += "<td style='color:" + trendPoint[TrendPointIndex.COLOR_IND] + "'>" +
                        trendPoint[TrendPointIndex.TEXT_IND] + "</td>";
                }

                dataRowHtml += "</tr>";
                newRows[rowInd] = dataRowHtml;
                rowInd++;
            }

            dataTable.append(newRows);
            dataPtCnt = timePtCnt;

            // create or update fixed table header
            if (createTableRequired) {
                setTimeout(scada.tableHeader.create.bind(scada.tableHeader), 0);
            } else {
                setTimeout(scada.tableHeader.update.bind(scada.tableHeader), 0);
            }
        }
    }
}

// Shows modal dialog to select the chart channels.
function showCnlsModal() {
    popup.showModal("ChartCnls.aspx" + window.location.search,
        new scada.ModalOptions([scada.ModalButtons.OK, scada.ModalButtons.CANCEL]),
        function (dialogResult, extraParams) {
            if (dialogResult) {
                // reload the chart with the selected channels
                var url = decodeURIComponent(window.location);
                url = scada.utils.setQueryParam("cnlNums", extraParams.cnlNums, url);
                url = scada.utils.setQueryParam("viewIDs", extraParams.viewIDs, url);
                window.location = url;
            }
        });
}

// Shows modal dialog to change the chart time period in the Fixed mode.
function showFixedPeriodModal() {
    popup.showModal("ChartPeriod.aspx" + window.location.search,
        new scada.ModalOptions([scada.ModalButtons.OK, scada.ModalButtons.CANCEL]),
        function (dialogResult, extraParams) {
            if (dialogResult) {
                // reload the chart with the selected start date and period
                var url = decodeURIComponent(window.location);
                url = scada.utils.setQueryParam("year", extraParams.year, url);
                url = scada.utils.setQueryParam("month", extraParams.month, url);
                url = scada.utils.setQueryParam("day", extraParams.day, url);
                url = scada.utils.setQueryParam("period", extraParams.period, url);
                window.location = url;
            }
        });
}

// Shows modal dialog to change the chart time period in the Rolling mode.
function showRollingPeriodModal() {
    popup.showModal("ChartPeriodRolling.aspx" + window.location.search,
        new scada.ModalOptions([scada.ModalButtons.OK, scada.ModalButtons.CANCEL]),
        function (dialogResult, extraParams) {
            if (dialogResult) {
                // reload the chart with the selected period
                var url = decodeURIComponent(window.location);
                url = scada.utils.setQueryParam("period", extraParams.period, url);
                window.location = url;
            }
        });
}

// Shows modal dialog contains export options.
function showExportModal() {
    popup.showModal("ChartExport.aspx" + window.location.search,
        new scada.ModalOptions([scada.ModalButtons.CLOSE]),
        function (dialogResult, extraParams) {
            if (dialogResult) {
                // export the chart
                switch (extraParams.exportFormat)
                {
                    case scada.ExportFormats.PDF:
                        scada.chart.export.exportToPdf();
                        break;
                    case scada.ExportFormats.PNG:
                        scada.chart.export.exportToPng();
                        break;
                    case scada.ExportFormats.EXCEL:
                        let cnlNums = scada.utils.getQueryParam("cnlNums");
                        let viewIDs = scada.utils.getQueryParam("viewIDs");
                        scada.chart.export.exportToExcel(cnlNums, viewIDs, 
                            extraParams.year, extraParams.month, extraParams.day, extraParams.period);
                        break;
                }
            }
        });
}

// Constructs chart data markup and shows it.
function showData() {
    var MAX_DATA_WIDTH = 250;

    generateDataHtml();

    var divChartSplitter = $("#divChartSplitter");
    var divData = $("#divData");

    divChartSplitter.addClass("show");
    divData.addClass("show");

    if (!divData.data("alreadyShown")) {
        divData.data("alreadyShown", true);
        var dataWidth = divData.outerWidth() + scada.utils.getScrollbarWidth();
        divData.outerWidth(dataWidth <= MAX_DATA_WIDTH ? dataWidth : MAX_DATA_WIDTH);
    }

    updateLayout();
    chart.draw();
}

// Hides chart data.
function hideData() {
    $("#divChartSplitter").removeClass("show");
    $("#divData").removeClass("show");
    updateLayout();
    chart.draw();
}

// Setups the Close button.
function setupCloseButton() {
    if (scada.utils.isRealFullscreen()) {
        $("#divClose").detach().appendTo(".chart-status");

        $("#btnClose").click(function () {
            window.close();
            return false;
        });
    } else {
        $("#divClose").hide();
    }
}

// Binds events of the menu items.
function bindMenuEvents() {
    $("#hlSelectCnls").click(function (event) {
        event.preventDefault();
        showCnlsModal();
    });

    $("#hlChangePeriod").click(function (event) {
        event.preventDefault();
        if (chartMode === ChartMode.FIXED) {
            showFixedPeriodModal();
        } else {
            showRollingPeriodModal();
        }
    });

    $("#hlExport").click(function (event) {
        event.preventDefault();
        showExportModal();
    });

    $("#hlShowData").click(function (event) {
        event.preventDefault();
        $(this).addClass("hidden");
        $("#hlHideData").removeClass("hidden");
        setTimeout(showData, 0); // allow to close the dropdown before data are shown
    });

    $("#hlHideData").click(function (event) {
        event.preventDefault();
        $(this).addClass("hidden");
        $("#hlShowData").removeClass("hidden");
        hideData();
    });
}

$(document).ready(function () {
    // chart properties must be defined in ChartPro.aspx
    chart = new scada.chart.Chart($("#divChart"));
    chart.displayOptions = displayOptions;
    chart.behaviorOptions = behaviorOptions;
    chart.timeRange = timeRange;
    chart.chartData = chartData;
    chart.phrases = $.extend(chart.phrases, phrases);
    chart.buildDom();
    chart.showTitle(chartTitle);
    chart.showStatus(chartStatus, chartError);

    scada.dialogs.rootPath = ROOT_PATH;
    styleIOS();

    setTimeout(function () {
        updateLayout();
        chart.draw();
        chart.bindHintEvents();
        chart.bindScalingEvents();
    }, 0); // timeout is needed to open chart in a popup window in Firefox
    
    scada.splitter.prepare(function () {
        chart.draw();
    });

    $(window).resize(function () {
        updateLayout();
        chart.draw();
    });

    setupCloseButton();
    bindMenuEvents();
    startLoadingChart();
});
