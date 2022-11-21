/*
 * Provides methods for opening a chart
 *
 * Author   : Mikhail Shiryaev
 * Created  : 2016
 * Modified : 2020
 *
 * Requires:
 * - utils.js
 */

// Rapid SCADA namespace.
var scada = scada || {};
// Chart namespace.
scada.chart = scada.chart || {};

// Represents chart options.
scada.chart.ChartOptions = function () {
    this.mode = "";
    this.period = 1;
    this.title = "";
    this.config = "";
};

// Provides methods for opening a chart.
scada.chart.dialog = {
    // Gets the chart URL.
    getChartUrl: function (cnlNums, viewIDs, date, opt_chartOptions) {
        var options = opt_chartOptions ?
            "&mode=" + opt_chartOptions.mode +
            "&period=" + opt_chartOptions.period +
            "&title=" + encodeURIComponent(opt_chartOptions.title) +
            "&config=" + encodeURIComponent(opt_chartOptions.config) :
            "";
        return "plugins/ChartPro/ChartPro.aspx?cnlNums=" + cnlNums + "&viewIDs=" + viewIDs +
            scada.utils.dateToQueryString(date, true) + options;
    },

    // Opens a chart in a new tab.
    show: function (rootPath, cnlNums, viewIDs, date) {
        window.open(rootPath + this.getChartUrl(cnlNums, viewIDs, date));
    }
};
