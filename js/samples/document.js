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
var SearchWindow = /** @class */ (function (_super) {
    __extends(SearchWindow, _super);
    function SearchWindow(treeView, docData, keywords) {
        var _this = _super.call(this, { frame: true }) || this;
        _this.addHeader('検索結果');
        if (docData == null)
            return _this;
        var that = _this;
        _this.addEventListener('itemClick', function (e) {
            var index = e.params.itemIndex;
            var item = that.getItemValue(index);
            item.selectItem(true);
        });
        var keys = keywords.toLowerCase().split(' ');
        _this.findItems(treeView.getRootItem(), keys);
        return _this;
    }
    SearchWindow.prototype.findItems = function (item, keys) {
        var doc = item.getItemValue();
        var word = doc.name;
        if (doc.signatures && doc.signatures[0]) {
            var signature = doc.signatures[0];
            if (signature.parameters) {
                for (var _i = 0, _a = doc.signatures[0].parameters; _i < _a.length; _i++) {
                    var p = _a[_i];
                    word += ' ' + p.name;
                }
            }
            if (signature.comment && signature.comment.shortText) {
                word += ' ' + signature.comment.shortText;
            }
        }
        if (SearchWindow.findKeys(word.toLowerCase(), keys)) {
            var index = this.addItem(doc.name);
            this.setItemValue(index, item);
        }
        for (var i = 0, l = item.getChildCount(); i < l; i++) {
            this.findItems(item.getChildItem(i), keys);
        }
    };
    SearchWindow.findKeys = function (value, keys) {
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (value.indexOf(key) === -1)
                return false;
        }
        return true;
    };
    return SearchWindow;
}(JSW.ListView));
/**
 *TypeDocViewerのメインウインドウ
 *
 * @class TypeDocView
 * @extends {JSW.FrameWindow}
 */
var TypeDocView = /** @class */ (function (_super) {
    __extends(TypeDocView, _super);
    function TypeDocView() {
        var _this = _super.call(this) || this;
        var that = _this;
        _this.setTitle('TypeDoc Viewer');
        _this.setSize(800, 600);
        var panel = new JSW.Panel();
        _this.addChild(panel, 'top');
        var searchButton = new JSW.Button('Search');
        panel.addChild(searchButton, 'left');
        searchButton.addEventListener('click', function (e) {
            var search = new SearchWindow(that.mTreeView, that.mDocData, textBox.getText());
            that.addChild(search);
        });
        var textBox = new JSW.TextBox();
        textBox.setMargin(1, 1, 1, 1);
        textBox.getTextNode().style.backgroundColor = '#dddddd';
        panel.addChild(textBox, 'client');
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
        listView.addHeader([['項目', 100], ['値', 800]]);
        _this.setPos();
        return _this;
    }
    TypeDocView.prototype.loadUrl = function (url) {
        var that = this;
        //Ajaxによるデータ要求処理
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                var value = JSON.parse(xmlHttp.responseText);
                that.load(value);
            }
        }.bind(this);
        xmlHttp.open('GET', url, true);
        xmlHttp.send();
    };
    TypeDocView.prototype.load = function (value) {
        this.mDocData = value;
        TypeDocView.createTree(this.mTreeView.getRootItem(), value);
    };
    TypeDocView.createTree = function (item, value) {
        item.setItemText(value.name);
        item.setItemValue(value);
        var fromName = this.getInheritedFrom(value);
        if (fromName) {
            item.getBody().style.color = '#888822';
        }
        if (value.children) {
            var children = [].concat(value.children);
            children.sort(function (a, b) {
                if (a.kindString !== b.kindString)
                    return a.kindString < b.kindString ? -1 : 1;
                return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
            });
            for (var i in children) {
                if (!children[i].flags.isPrivate) {
                    var childItem = item.addItem();
                    TypeDocView.createTree(childItem, children[i]);
                }
            }
        }
    };
    TypeDocView.getInheritedFrom = function (value) {
        if (value.inheritedFrom) {
            return value.inheritedFrom.name;
        }
        return null;
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
            if (signature.inheritedFrom) {
                listView.addItem(['継承', signature.inheritedFrom.name]);
            }
            if (signature.parameters) {
                var params = signature.parameters;
                for (var i in params) {
                    var param = params[i];
                    var comment = (param.comment && param.comment.text) ? param.comment.text : '';
                    var type = (param.name && param.type.name) ? param.type.name : '';
                    listView.addItem(["[" + param.name + "]", '{' + type + '} ' + comment]);
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
    typeDocView.loadUrl('../doc/document.json');
    //メッセージの表示
    var msgWindow = new JSW.FrameWindow();
    msgWindow.setTitle('説明');
    msgWindow.setSize(300, 200);
    msgWindow.getClient().innerHTML =
        '<a target="_blank" href="../doc/document.json">JSON</a>から、その内容を表示';
}
//# sourceMappingURL=document.js.map