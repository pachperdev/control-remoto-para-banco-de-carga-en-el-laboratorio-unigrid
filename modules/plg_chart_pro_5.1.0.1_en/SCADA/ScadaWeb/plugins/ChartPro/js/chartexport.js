/*
 * Chart export implementation
 *
 * Author   : Mikhail Shiryaev
 * Created  : 2016
 * Modified : 2020
 *
 * Requires:
 * - jquery
 * - filesaver
 * - pdfmake
 * - export.js
 */

// Rapid SCADA namespace
var scada = scada || {};
// Chart namespace
scada.chart = scada.chart || {};

// Chart export object
scada.chart.export = {
    // The product name
    productName: "Rapid SCADA",


    // Get file name to export chart
    _getFileName: function (exportFormat) {
        return scada.export.buildFileName("Chart", exportFormat);
    },

    // Get chart canvas if the default value is not specified
    _getCanvas: function (opt_defaultCanvas) {
        if (typeof opt_defaultCanvas === "undefined") {
            var canvasJqElem = $(".chart-canvas");
            return canvasJqElem.length > 0 ? canvasJqElem[0] : null;
        } else {
            return opt_defaultCanvas;
        }
    },

    // Get chart title if the default value is not specified
    _getTitle: function (opt_defaultTitle) {
        return typeof opt_defaultTitle === "undefined" ?
            $(".chart-title-text").text() : opt_defaultTitle;
    },

    // Get chart status if the default value is not specified
    _getStatus: function (opt_defaultStatus) {
        return typeof opt_defaultStatus === "undefined" ?
            $(".chart-status span").text() : opt_defaultStatus;
    },

    // Create PDF document definition
    _createPdfDoc: function (canvasDomElem, titleText, statusText) {
        return {
            pageSize: "A4",
            pageOrientation: "landscape",
            pageMargins: [30, 25, 30, 25],

            content: this.createPdfContent(canvasDomElem, titleText, statusText),

            footer: {
                text: this.productName,
                style: "chartFooterStyle"
            },

            styles: this.createPdfStyles()
        };
    },

    // Convert data URL to BLOB for saving to file
    _dataUrlToBlob: function (dataUrl) {
        var binary = atob(dataUrl.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: 'image/png' });
    },


    // Export chart to PDF
    exportToPdf: function () {
        var canvasDomElem = this._getCanvas();
        var titleText = this._getTitle();
        var statusText = this._getStatus();

        if (canvasDomElem) {
            var docDefinition = this._createPdfDoc(canvasDomElem, titleText, statusText);
            pdfMake.createPdf(docDefinition).download(this._getFileName(scada.ExportFormats.PDF)); // done by pdfmake
        } else {
            console.warn("Unable to export chart to PDF because canvas element is undefined");
        }
    },

    // Create an object describes PDF content for pdf maker
    createPdfContent: function (opt_canvasDomElem, opt_titleText, opt_statusText) {
        opt_canvasDomElem = this._getCanvas(opt_canvasDomElem);
        opt_titleText = this._getTitle(opt_titleText);
        opt_statusText = this._getStatus(opt_statusText);

        return [
            {
                columns: [
                    {
                        width: "*",
                        text: opt_titleText,
                        style: "chartTitleStyle"
                    },
                    {
                        width: "auto",
                        text: opt_statusText,
                        style: "chartStatusStyle"
                    }
                ],
                columnGap: 10
            },
            {
                image: opt_canvasDomElem ? opt_canvasDomElem.toDataURL() : "",
                fit: [780, 500]
            }
        ];
    },

    // Create an object describes PDF styles for pdf maker
    createPdfStyles: function () {
        return {
            chartTitleStyle: {
                fontSize: 14,
                bold: true,
                margin: [0, 0, 0, 5]
            },
            chartStatusStyle: {
                fontSize: 8,
                margin: [0, 5, 0, 5]
            },
            chartFooterStyle: {
                fontSize: 8,
                alignment: "right",
                margin: [0, 0, 30, 0]
            }
        };
    },

    // Export chart to PNG
    exportToPng: function () {
        var canvasDomElem = this._getCanvas();

        if (canvasDomElem) {
            var dataURL = canvasDomElem.toDataURL();
            var blob = this._dataUrlToBlob(dataURL);
            saveAs(blob, this._getFileName(scada.ExportFormats.PNG)); // done by filesaver
        } else {
            console.warn("Unable to export chart to PNG because canvas element is undefined");
        }
    },

    // Export data to Excel
    exportToExcel: function (cnlNums, viewIDs, year, month, day, period) {
        window.location = "../Chart/MinDataRepOut.aspx?cnlNums=" + cnlNums + "&viewIDs=" + viewIDs +
            "&year=" + year + "&month=" + month + "&day=" + day + "&period=" + period;
    }
};
