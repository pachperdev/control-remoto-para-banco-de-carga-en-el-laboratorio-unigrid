// Selects begin or end date using a calendar popup.
function selectDate(inputElem, buttonElem) {
    var dialogs = window.parent.scada.dialogs;
    if (dialogs) {
        dialogs.showCalendar(buttonElem, inputElem.val(), function (dialogResult, extraParams) {
            if (dialogResult) {
                inputElem.val(extraParams.dateStr);
            }
        });
    }
}

// Closes the modal with a successful result.
function closeModal(exportFormat, opt_year, opt_month, opt_day, opt_period) {
    var popup = scada.popupLocator.getPopup();
    if (popup) {
        var extraParams = {
            exportFormat: exportFormat,
            year: opt_year,
            month: opt_month,
            day: opt_day,
            period: opt_period
        };
        popup.closeModal(window, true, extraParams);
    }
}

$(document).ready(function () {
    // open a calendar popup on a calendar button click
    $("button.calendar").click(function () {
        selectDate($(this).parent().siblings("input"), $(this));
    });

    // close the modal with a result of the clicked export format
    $(".btn-export-client").click(function () {
        closeModal($(this).data("export-format"));
    });
});
