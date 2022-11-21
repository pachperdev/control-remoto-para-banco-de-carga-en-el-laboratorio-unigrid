<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ChartPro.aspx.cs" Inherits="Scada.Web.Plugins.ChartPro.WFrmChartPro" EnableViewState="false" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- The above 3 meta tags are required by Bootstrap -->
    <title>Chart Pro</title>
    <link href="~/images/favicon.ico" rel="shortcut icon" type="image/x-icon" />
    <link href="~/lib/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="~/lib/open-sans/css/open-sans.css" rel="stylesheet" type="text/css" />
    <link href="~/css/controls/popup.min.css" rel="stylesheet" type="text/css" />
    <link href="~/css/controls/splitter.min.css" rel="stylesheet" type="text/css" />
    <link href="~/css/controls/tableheader.min.css" rel="stylesheet" type="text/css" />
    <link href="~/plugins/ChartPro/css/chartpro.min.css" rel="stylesheet" type="text/css" />
    <link href="~/plugins/ChartPro/css/chartproform.min.css" rel="stylesheet" type="text/css" />
    <script type="text/javascript" src="../../lib/jquery/jquery.min.js"></script>
    <script type="text/javascript" src="../../lib/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../../lib/pdfmake/pdfmake.min.js"></script>
    <script type="text/javascript" src="../../lib/pdfmake/vfs_fonts.js"></script>
    <script type="text/javascript" src="lib/hammer/hammer.min.js"></script>
    <script type="text/javascript" src="lib/filesaver/FileSaver.min.js"></script>
    <script type="text/javascript" src="../../js/api/utils.js"></script>
    <script type="text/javascript" src="../../js/api/eventtypes.js"></script>
    <script type="text/javascript" src="../../js/api/export.js"></script>
    <script type="text/javascript" src="../../js/controls/popup.js"></script>
    <script type="text/javascript" src="../../js/controls/splitter.js"></script>
    <script type="text/javascript" src="../../js/controls/tableheader.js"></script>
    <script type="text/javascript" src="../../js/dialogs/dialogs.js"></script>
    <script type="text/javascript" src="../Chart/js/chart.js"></script>
    <script type="text/javascript" src="js/chartdialog.js"></script>
    <script type="text/javascript" src="js/chartexport.js"></script>
    <script type="text/javascript" src="js/chartpro.js"></script>
    <script type="text/javascript">
        <%= sbClientScript.ToString() %>
        var phrases = <%= Scada.Web.WebUtils.DictionaryToJs("Scada.Web.Plugins.ChartPro.WFrmChartPro.Js") %>;
        scada.modalButtonCaptions = <%= Scada.Web.WebUtils.DictionaryToJs("Scada.Web.Js.ModalButtons") %>;
        var exportObj = scada.chart.export;
        exportObj.productName = "<%= Scada.CommonPhrases.ProductName %>";
    </script>
    <script type="text/javascript" src="js/chartproform.js"></script>
</head>
<body>
    <form id="frmChartPro" runat="server">
        <div id="divChartContent">
            <div id="divMenuContainer" class="chart-menu"><div id="divMenu" class="dropdown">
                <button id="btnMenu" class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
                    <span id="spanMenuBtn" class="glyphicon glyphicon-menu-hamburger"></span>
                </button>
                <ul class="dropdown-menu">
                    <li><asp:HyperLink ID="hlSelectCnls" runat="server" NavigateUrl="#">Select Channels</asp:HyperLink></li>
                    <li><asp:HyperLink ID="hlChangePeriod" runat="server" NavigateUrl="#">Change Period</asp:HyperLink></li>
                    <li><asp:HyperLink ID="hlShowData" runat="server" NavigateUrl="#">Show Data</asp:HyperLink><asp:HyperLink 
                        ID="hlHideData" runat="server" NavigateUrl="#" CssClass="hidden">Hide Data</asp:HyperLink></li>
                    <li><asp:HyperLink ID="hlExport" runat="server" NavigateUrl="#">Export</asp:HyperLink></li>
                </ul>
            </div></div>
            <div id="divClose"><asp:Button ID="btnClose" runat="server" class="btn btn-danger btn-xs" Text="Close" UseSubmitBehavior="False" /></div>
            <div id="divChart" class="chart"></div><div 
                id="divChartSplitter" class="splitter vert"></div><div 
                id="divData" class="table-wrapper"><asp:Label ID="lblNoData" runat="server" Text="No data"></asp:Label></div>
        </div>
    </form>
</body>
</html>
