//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", Sample04);
//ページ読み込み後に実行される内容
function Sample04() {
    //リストビューの作成
    var treeView = new JSW.TreeView();
    //フレームウインドウとして作成したい場合
    //let treeView = new JSW.TreeView({frame:true})
    //サイズ設定
    treeView.setSize(300, 300);
    //ルートアイテムに対して名前の設定
    treeView.getRootItem().setItemText('ルートアイテム');
    //アイテムを作成
    var item;
    item = treeView.addItem('アイテム1');
    item.addItem('アイテム1-1');
    item.addItem('アイテム1-2');
    item = treeView.addItem('アイテム2');
    item.addItem('アイテム2-1');
    item.addItem('アイテム2-2');
    //アイテムが選択された場合のイベント
    treeView.addEventListener('itemSelect', function (e) {
        //ウインドウにメッセージを出す
        var p = e.params;
        var win = new JSW.FrameWindow();
        win.getClient().textContent = p.item.getItemText() + 'が選択された';
        win.setPos();
        win.foreground();
    });
}
//# sourceMappingURL=Sample04.js.map