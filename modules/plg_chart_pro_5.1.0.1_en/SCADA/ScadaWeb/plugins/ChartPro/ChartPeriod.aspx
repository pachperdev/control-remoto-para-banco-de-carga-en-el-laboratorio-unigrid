<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ChartPeriod.aspx.cs" Inherits="Scada.Web.Plugins.ChartPro.WFrmChartPeriod" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- The above 3 meta tags are required by Bootstrap -->
    <title>Chart Period</title>
    <link href="~/lib/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="~/lib/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
    <link href="~/lib/open-sans/css/open-sans.css" rel="stylesheet" type="text/css" />
    <link href="~/plugins/ChartPro/css/chartperiod.min.css" rel="stylesheet" type="text/css" />
    <script type="text/javascript" src="../../lib/jquery/jquery.min.js"></script>
    <script type="text/javascript" src="../../lib/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../../js/api/utils.js"></script>
    <script type="text/javascript" src="../../js/api/eventtypes.js"></script>
    <script type="text/javascript" src="../../js/controls/popup.js"></script>
    <script type="text/javascript" src="js/chartperiod.js"></script>
</head>
<body>
    <form id="frmChartPeriod" runat="server">
        <asp:Button ID="btnSubmit" runat="server" CssClass="hidden" Text="Submit" OnClick="btnSubmit_Click" />
        <asp:Panel ID="pnlErrMsg" runat="server" CssClass="alert alert-danger">
            <asp:Label ID="lblErrMsg" runat="server" Text=""></asp:Label>
        </asp:Panel>
        <div class="form-group">
            <asp:Label ID="lblDateFrom" runat="server" Text="From" AssociatedControlID="txtDateFrom"></asp:Label>
            <div class="input-group">
                <asp:TextBox ID="txtDateFrom" runat="server" CssClass="form-control" autocomplete="off"></asp:TextBox>
                <span class="input-group-btn">
                    <button class="btn btn-default calendar" type="button"><i class="fa fa-calendar"></i></button>
                </span>
            </div>
        </div>
        <div class="form-group">
            <asp:Label ID="lblDateTo" runat="server" Text="To" AssociatedControlID="txtDateTo"></asp:Label>
            <div class="input-group">
                <asp:TextBox ID="txtDateTo" runat="server" CssClass="form-control" autocomplete="off"></asp:TextBox>
                <span class="input-group-btn">
                    <button class="btn btn-default calendar" type="button"><i class="fa fa-calendar"></i></button>
                </span>
            </div>
        </div>
        <div class="btn-group btn-group-justified">
            <div class="btn-group">
                <asp:Button ID="btnPrevDay" runat="server" Text="Previous Day" CssClass="btn btn-default" UseSubmitBehavior="False" OnClick="btnPrevDay_Click" /></div>
            <div class="btn-group">
                <asp:Button ID="btnNextDay" runat="server" Text="Next Day" CssClass="btn btn-default" UseSubmitBehavior="False" OnClick="btnNextDay_Click" /></div>
        </div>
        <div class="btn-group btn-group-justified">
            <div class="btn-group">
                <asp:Button ID="btnPrevWeek" runat="server" Text="Previous Week" CssClass="btn btn-default" UseSubmitBehavior="False" OnClick="btnPrevWeek_Click" /></div>
            <div class="btn-group">
                <asp:Button ID="btnNextWeek" runat="server" Text="Next Week" CssClass="btn btn-default" UseSubmitBehavior="False" OnClick="btnNextWeek_Click" /></div>
        </div>
        <div class="btn-group btn-group-justified">
            <div class="btn-group">
                <asp:Button ID="btnPrevMonth" runat="server" Text="Previous Month" CssClass="btn btn-default" UseSubmitBehavior="False" OnClick="btnPrevMonth_Click" /></div>
            <div class="btn-group">
                <asp:Button ID="btnNextMonth" runat="server" Text="Next Month" CssClass="btn btn-default" UseSubmitBehavior="False" OnClick="btnNextMonth_Click" /></div>
        </div>

        <div class="alert alert-danger invisible">Vertical Spacer Begin</div>
        <div class="invisible" style="height:0">Vertical Spacer End</div>
    </form>
</body>
</html>
