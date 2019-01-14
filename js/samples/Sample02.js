//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", Sample02);
//ページ読み込み後に実行される内容
function Sample02() {
    //フレームウインドウの作成
    var mainWindow = new JSW.FrameWindow();
    //タイトルの設定
    mainWindow.setTitle('サンプル02');
    //クライアントノードを呼び出して
    mainWindow.getClient().innerHTML = 'ノードに対して<br>フレームウインドウの表示';
    //フレームウインドウの作成
    var mainWindow2 = new JSW.FrameWindow();
    //タイトルの設定
    mainWindow2.setTitle('サンプル02 ふたつ目');
    //クライアントノードを呼び出して
    mainWindow2.getClient().innerHTML = 'ウインドウをセンタリング';
    //サイズ指定
    mainWindow2.setSize(300, 400);
    //引数未指定でセンタリング
    mainWindow2.setPos();
}
//# sourceMappingURL=Sample02.js.map