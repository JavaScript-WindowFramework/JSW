var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TypeDocView = /** @class */ (function (_super) {
    __extends(TypeDocView, _super);
    function TypeDocView() {
        var _this = _super.call(this) || this;
        _this.setTitle('TypeDoc Viewer');
        _this.setSize(800, 600);
        var splitter = new JSW.Splitter();
        _this.addChild(splitter, 'client');
        splitter.setSplitterPos(200);
        var treeView = new JSW.TreeView();
        _this.mTreeView = treeView;
        splitter.addChild(0, treeView, 'client');
        treeView.addEventListener('itemSelect', _this.onTreeItem.bind(_this));
        var listView = new JSW.ListView();
        _this.mListView = listView;
        splitter.addChild(1, listView, 'client');
        listView.addHeader(['項目', ['値', 800]]);
        _this.setPos();
        _this.load('../doc/document.json');
        return _this;
    }
    TypeDocView.prototype.load = function (url) {
        var that = this;
        //Ajaxによるデータ要求処理
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                var value = JSON.parse(xmlHttp.responseText);
                TypeDocView.createTree(that.mTreeView.getRootItem(), value);
            }
        }.bind(this);
        xmlHttp.open('GET', url, true);
        xmlHttp.send();
    };
    TypeDocView.createTree = function (item, value) {
        var that = this;
        item.setItemText(value.name);
        item.setItemValue(value);
        var children = value.children;
        for (var i in children) {
            var childItem = item.addItem();
            TypeDocView.createTree(childItem, children[i]);
        }
    };
    TypeDocView.prototype.onTreeItem = function (e) {
        var p = e.params;
        var item = p.item;
        var listView = this.mListView;
        var value = item.getItemValue();
        listView.clearItem();
        if (value.kindString) {
            listView.addItem(['種別', value.kindString]);
        }
        if (value.signatures && value.signatures.length) {
            var signature = value.signatures[0];
            if (signature.comment) {
                if (signature.comment.shortText)
                    listView.addItem(['説明', signature.comment.shortText]);
                if (signature.comment.returns) {
                    var type = (signature.type && signature.type.name) ? signature.type.name : '';
                    listView.addItem(['戻り値', '{' + type + '} ' + signature.comment.returns]);
                }
            }
            if (signature.parameters) {
                var params = signature.parameters;
                for (var i in params) {
                    var param = params[i];
                    var comment = (param.comment && param.comment.text) ? param.comment.text : '';
                    var type = (param.name && param.type.name) ? param.type.name : '';
                    listView.addItem(["." + param.name, '{' + type + '} ' + comment]);
                }
            }
        }
    };
    return TypeDocView;
}(JSW.FrameWindow));
//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", docMain);
//ページ読み込み後に実行される内容
function docMain() {
    var typeDocView = new TypeDocView();
}
//# sourceMappingURL=document.js.map