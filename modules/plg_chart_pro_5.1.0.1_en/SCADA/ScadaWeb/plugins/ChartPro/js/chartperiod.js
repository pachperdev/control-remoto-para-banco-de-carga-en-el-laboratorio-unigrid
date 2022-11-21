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

// Closes the modal with a successful result in the Fixed mode.
function closeFixedPeriodModal(year, month, day, period) {
    var popup = scada.popupLocator.getPopup();
    if (popup) {
        var extraParams = {
            date: new Date(year, month - 1, day),
            year: year,
            month: month,
            day: day,
            period: period
        };
        popup.closeModal(window, true, extraParams);
    }
}

// Closes the modal with a successful result in the Rolling mode.
function closeRollingPeriodModal(period) {
    var popup = scada.popupLocator.getPopup();
    if (popup) {
        var extraParams = { period: period };
        popup.closeModal(window, true, extraParams);
    }
}

$(document).ready(function () {
    // open a calendar popup on a calendar button click
    $("button.calendar").click(function () {
        selectDate($(this).parent().siblings("input"), $(this));
    });

    // submit the form on OK button click
    $(window).on(scada.EventTypes.MODAL_BTN_CLICK, function (event, result) {
        if (result === scada.ModalButtons.OK) {
            $("#btnSubmit").click();
        }
    });
});
