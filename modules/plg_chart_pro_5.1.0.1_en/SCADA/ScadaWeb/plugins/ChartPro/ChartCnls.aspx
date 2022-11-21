<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ChartCnls.aspx.cs" Inherits="Scada.Web.Plugins.ChartPro.WFrmChartCnls" %>
<%@ Import Namespace="Scada.Web.Plugins.Chart" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- The above 3 meta tags are required by Bootstrap -->
    <title>Chart Channels</title>
    <link href="~/lib/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="~/lib/open-sans/css/open-sans.css" rel="stylesheet" type="text/css" />
    <link href="~/plugins/ChartPro/css/chartcnls.min.css" rel="stylesheet" type="text/css" />
    <script type="text/javascript" src="../../lib/jquery/jquery.min.js"></script>
    <script type="text/javascript" src="../../lib/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../../js/api/utils.js"></script>
    <script type="text/javascript" src="../../js/api/eventtypes.js"></script>
    <script type="text/javascript" src="../../js/controls/popup.js"></script>
    <script type="text/javascript" src="../Chart/js/selectcnls.js"></script>
    <script type="text/javascript" src="js/chartcnls.js"></script>
</head>
<body>
    <form id="frmChartCnls" runat="server">
        <asp:Button ID="btnSubmit" runat="server" CssClass="hidden" Text="Submit" OnClick="btnSubmit_Click" />
        <asp:Panel ID="pnlPerfWarn" runat="server" CssClass="alert alert-warning">
            <asp:Label ID="lblPerfWarn" runat="server" Text=""></asp:Label>
        </asp:Panel>
        <asp:MultiView ID="mvCnls" runat="server" ActiveViewIndex="0">
            <asp:View ID="viewSelCnls" runat="server">
                <div class="form-group">
                    <asp:Button ID="btnAddCnls" runat="server" CssClass="btn btn-default" UseSubmitBehavior="False" Text="Add Channels" OnClick="btnAddCnls_Click" />
                </div>
                <div class="form-group">
                    <asp:Label ID="lblSelCnls" runat="server" Text="Selected Channels:" AssociatedControlID="pnlSelCnls"></asp:Label>
                    <asp:Panel ID="pnlSelCnls" runat="server" CssClass="cnl-list">
                        <asp:Repeater ID="repSelCnls" runat="server" OnItemCommand="repSelCnls_ItemCommand">
                            <ItemTemplate>
                                <div class="cnl-item">
                                    <div class="cnl-field cnl-name">[<%# Eval("CnlNum") %>] <%# HttpUtility.HtmlEncode(Eval("CnlName")) %></div>
                                    <div class="cnl-field cnl-btns"><asp:Button 
                                        ID="btnRemoveCnl" runat="server" CssClass="btn btn-default btn-sm" UseSubmitBehavior="False" 
                                            CommandName="RemoveCnl" CommandArgument='<%# Container.ItemIndex %>' Text='<%# ChartPhrases.RemoveCnlBtn %>' /><a 
                                        tabindex="0" role="button" class="btn btn-default btn-sm" data-toggle="popover" data-trigger="focus" data-placement="auto left" 
                                        data-content="<%# Scada.Web.WebUtils.HtmlEncodeWithBreak(Eval("Info")) %>"><%# ChartPhrases.CnlInfoBtn %></a></div>
                                </div>
                            </ItemTemplate>
                        </asp:Repeater>
                    </asp:Panel>
                    <asp:Label ID="lblNoSelCnls" runat="server" CssClass="list-msg" Text="Input channels are not selected"></asp:Label>
                </div>
            </asp:View>
            <asp:View ID="viewAddCnls" runat="server">
                <div class="form-group">
                    <asp:LinkButton ID="lbtnBackToCnls" runat="server" OnClick="lbtnBackToCnls_Click">Back to selected channels</asp:LinkButton>
                </div>
                <div class="form-group">
                    <asp:DropDownList ID="ddlView" runat="server" CssClass="form-control" AutoPostBack="True" OnSelectedIndexChanged="ddlView_SelectedIndexChanged"></asp:DropDownList>
                </div>
                <div class="form-group">
                    <asp:Panel ID="pnlCnlsByView" runat="server" CssClass="cnl-list">
                        <asp:Repeater ID="repCnlsByView" runat="server" OnItemCommand="repCnlsByView_ItemCommand">
                            <ItemTemplate>
                                <div class="cnl-item">
                                    <div class="cnl-field cnl-name">[<%# Eval("CnlNum") %>] <%# HttpUtility.HtmlEncode(Eval("CnlName")) %></div>
                                    <div class="cnl-field cnl-btns"><asp:Button 
                                        ID="btnAddCnl" runat="server" CssClass="btn btn-default btn-sm" UseSubmitBehavior="False" 
                                            CommandName="AddCnl" CommandArgument='<%# Eval("CnlNum") %>' Text='<%# ChartPhrases.AddCnlBtn %>' /><a 
                                        tabindex="0" role="button" class="btn btn-default btn-sm" data-toggle="popover" data-trigger="focus" data-placement="auto left" 
                                            data-content="<%# Scada.Web.WebUtils.HtmlEncodeWithBreak(Eval("Info")) %>"><%# ChartPhrases.CnlInfoBtn %></a><asp:Label 
                                        ID="lblCnlAdded" runat="server" CssClass="glyphicon glyphicon-ok text-success" Visible='<%# selCnlSet.Contains((int)Eval("CnlNum")) %>'></asp:Label></div>
                                </div>
                            </ItemTemplate>
                        </asp:Repeater>
                    </asp:Panel>
                    <asp:Label ID="lblLoading" runat="server" CssClass="cnl-list-msg loading hidden" Text="Loading..."></asp:Label>
                    <asp:Label ID="lblUnableLoadView" runat="server" CssClass="cnl-list-msg" Text="Unable to load view"></asp:Label>
                    <asp:Label ID="lblNoCnlsByView" runat="server" CssClass="cnl-list-msg" Text="Input channels not found"></asp:Label>
                </div>
            </asp:View>
        </asp:MultiView>
    </form>
</body>
</html>
