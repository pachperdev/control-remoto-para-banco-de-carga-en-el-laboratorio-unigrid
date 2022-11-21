<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ChartExport.aspx.cs" Inherits="Scada.Web.Plugins.ChartPro.WFrmChartExport" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- The above 3 meta tags are required by Bootstrap -->
    <title>Chart Export</title>
    <link href="~/lib/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="~/lib/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
    <link href="~/lib/open-sans/css/open-sans.css" rel="stylesheet" type="text/css" />
    <link href="~/plugins/ChartPro/css/chartexport.min.css" rel="stylesheet" type="text/css" />
    <script type="text/javascript" src="../../lib/jquery/jquery.min.js"></script>
    <script type="text/javascript" src="../../lib/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../../js/api/utils.js"></script>
    <script type="text/javascript" src="../../js/api/eventtypes.js"></script>
    <script type="text/javascript" src="../../js/controls/popup.js"></script>
    <script type="text/javascript" src="js/chartexportform.js"></script>
</head>
<body>
    <form id="frmChartExport" runat="server">
        <asp:Panel ID="pnlErrMsg" runat="server" CssClass="alert alert-danger">
            <asp:Label ID="lblErrMsg" runat="server" Text=""></asp:Label>
        </asp:Panel>
        <div class="form-group">
            <asp:Button ID="btnExportPdf" runat="server" CssClass="btn btn-default btn-export btn-export-client" data-export-format="pdf" 
                UseSubmitBehavior="False" Text="Export chart to PDF" OnClientClick="return false;" />
        </div>
        <div class="form-group">
            <asp:Button ID="btnExportPng" runat="server" CssClass="btn btn-default btn-export btn-export-client" data-export-format="png" 
                UseSubmitBehavior="False" Text="Export chart to PNG" OnClientClick="return false;" />
        </div>
        <div class="form-group">
            <asp:Button ID="btnExportExcel" runat="server" CssClass="btn btn-default btn-export" data-export-format="xml" 
                UseSubmitBehavior="False" Text="Export data to Excel" OnClick="btnExportExcel_Click" />
        </div>
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

        <div class="alert alert-danger invisible">Vertical Spacer Begin</div>
        <div class="invisible" style="height:0">Vertical Spacer End</div>
    </form>
</body>
</html>
