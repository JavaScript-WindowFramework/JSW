/// <reference path="../dist/js/jsw.d.ts" />
function createLogin() {
    var win = new JSW.FrameWindow();
    win.setSize(300, 300);
    win.setTitle('ログイン');
    win.setPadding(10, 30, 10, 10);
    // const label = new JSW.Label('ログイン')
    // //win.addChild(label,'top')
    // label.setAlign('center')
    // label.setFontSize(32)
    var textBox = new JSW.TextBox({ label: 'ユーザID', image: 'dist/css/images/login_id.svg' });
    win.addChild(textBox, 'top');
    textBox.setMargin(0, 0, 0, 10);
    var textBox2 = new JSW.TextBox({ label: 'パスワード', type: 'password', image: 'dist/css/images/login_pass.svg' });
    textBox2.setMargin(0, 10, 0, 10);
    win.addChild(textBox2, 'top');
    var localCheck = new JSW.CheckBox({ text: "ローカルログイン" });
    win.addChild(localCheck, 'top');
    var keepCheck = new JSW.CheckBox({ text: "ログイン情報の保存" });
    win.addChild(keepCheck, 'top');
    var button = new JSW.Button('ログイン');
    button.setMargin(0, 10, 0, 5);
    button.setAlign('center');
    win.addChild(button, 'top');
    var button2 = new JSW.Button('ログアウト');
    button2.setAlign('center');
    win.addChild(button2, 'top');
    win.setPos();
    return win;
}
//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", Main);
//ページ読み込み後に実行される内容
function Main() {
    var drawer = new JSW.DrawerView();
    drawer.addItem('閉じる', 0, 'dist/css/images/close.svg');
    drawer.addItem('開く', 1);
    drawer.addEventListener('selectItem', function (e) {
        console.log(e.value);
    });
    //各ウインドウのインスタンスを作成
    var frame = new JSW.FrameWindow();
    var splitter = new JSW.Splitter();
    var tree = new JSW.TreeView();
    var list = new JSW.ListView();
    var panel = new JSW.Panel();
    frame.addChild(panel, 'top');
    var names = ["we", "ew", "ns", "sn"];
    var _loop_1 = function (n) {
        var button = new JSW.Button(n);
        panel.addChild(button, 'left');
        button.addEventListener('buttonClick', function () {
            splitter.setSplitterPos(200, button.getText());
        });
    };
    for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
        var n = names_1[_i];
        _loop_1(n);
    }
    //タイトル設定
    frame.setTitle('分割ウインドウのサンプル');
    //frameに対して、分割ウインドウをclient(画面いっぱい)で追加する
    frame.addChild(splitter, 'client');
    //splitterの分割領域0にtreeを追加
    splitter.addChild(0, tree, 'client');
    //splitterの分割領域1にlistを追加
    splitter.addChild(1, list, 'client');
    //分割バーの分割サイズと方向設定(WestEast、左右)
    //weは左が領域0、右が領域1
    //nsにすると上下分割も可能
    splitter.setSplitterPos(200, 'sn');
    splitter.setOverlay(true, 300);
    //treeにアイテムを追加
    tree.getRootItem().setItemText('最上位アイテム');
    for (var j = 0; j < 5; j++) {
        var item = tree.addItem("アイテム" + j, true);
        for (var i = 0; i < 5; i++)
            item.addItem("サブアイテム" + j + "-" + i, false);
    }
    //アイテムが選択された場合のイベント
    tree.addEventListener('itemSelect', function (e) {
        var value = e.item.getItemText();
        if (value) {
            var no = list.getItemCount();
            var date = (new Date()).toLocaleString();
            list.addItem([no.toString(), value, date]);
        }
    });
    //listにヘッダを追加
    list.addHeader(['番号', ['名前', 200], '時刻']);
    //位置とサイズの設定
    frame.setSize(800, 600);
    frame.setPos();
    createLogin();
}
//# sourceMappingURL=index.js.map