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
var UserList = /** @class */ (function (_super) {
    __extends(UserList, _super);
    function UserList() {
        var _this = _super.call(this, { frame: true }) //フレーム有りのウインドウを作成
         || this;
        _this.setSize(800, 600); //ウインドウサイズの設定
        _this.setTitle('ユーザリスト'); //タイトルの設定
        //リストビューのヘッダを設定
        _this.addHeader([['画像', 35], ['ID', 80], 'EMail', 'Password', 'LastName', 'FirstName'], 150);
        _this.load(); //データの取得要求
        return _this;
    }
    //データ取得処理
    UserList.prototype.load = function () {
        //Ajaxによるデータ要求処理
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                var results = JSON.parse(xmlHttp.responseText).results;
                for (var i = 0; i < results.length; i++) {
                    var value = results[i];
                    //顔イメージ用
                    var pic = document.createElement('img');
                    pic.style.height = '100%';
                    pic.src = value.picture.thumbnail;
                    //リストビューにアイテムを追加
                    this.addItem([pic, value.id.name, value.email, value.login.password, value.name.last, value.name.first]);
                }
                this.sortItem(2, true);
            }
        }.bind(this);
        xmlHttp.open('GET', UserList.URL, true);
        xmlHttp.send();
    };
    //Ajaxのデータ取得元URL
    UserList.URL = 'https://randomuser.me/api?results=100';
    return UserList;
}(JSW.ListView));
var MainWindow = /** @class */ (function (_super) {
    __extends(MainWindow, _super);
    function MainWindow() {
        var _this = _super.call(this) || this;
        var panel = new JSW.Panel;
        _this.addChild(panel, 'top');
        var splitter = new JSW.Splitter();
        _this.addChild(splitter, 'client');
        var tree = new JSW.TreeView();
        splitter.addChild(0, tree);
        tree.getRootItem().setItemText('メニュー');
        tree.addItem(['メッセージ', 0]);
        tree.addItem(['ユーザリスト', 1]);
        tree.addEventListener('itemSelect', function (e) {
            var value = tree.getSelectItemValue();
            switch (value) {
                case 0:
                    break;
                case 1:
                    //ユーザリスト
                    var list = new UserList();
                    splitter.addChild(1, list);
                    //位置を真ん中に設定
                    //list.setPos()
                    break;
            }
        });
        _this.setMaximize(true);
        return _this;
    }
    return MainWindow;
}(JSW.Window));
//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", Main);
//ページ読み込み後に実行される内容
function Main() {
    var mainWindow = new MainWindow();
}
//# sourceMappingURL=Main.js.map