<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ChartPeriodRolling.aspx.cs" Inherits="Scada.Web.Plugins.ChartPro.WFrmChartPeriodRolling" %>

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
    <form id="frmChartPeriodRolling" runat="server">
        <asp:Button ID="btnSubmit" runat="server" CssClass="hidden" Text="Submit" OnClick="btnSubmit_Click" />
        <asp:Panel ID="pnlErrMsg" runat="server" CssClass="alert alert-danger">
            <asp:Label ID="lblErrMsg" runat="server" Text=""></asp:Label>
        </asp:Panel>
        <div class="form-group">
            <asp:Label ID="lblPeriod" runat="server" Text="Period" AssociatedControlID="txtPeriod"></asp:Label>
            <div class="input-group">
                <asp:TextBox ID="txtPeriod" runat="server" CssClass="form-control" autocomplete="off"></asp:TextBox>
                <asp:Label ID="lblPeriodUnit" runat="server" CssClass="input-group-addon" Text="min"></asp:Label>
            </div>
        </div>

        <div class="alert alert-danger invisible">Vertical Spacer Begin</div>
        <div class="invisible" style="height:0">Vertical Spacer End</div>
    </form>
</body>
</html>
