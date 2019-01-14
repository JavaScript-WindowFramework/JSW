//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", Sample01);
//ページ読み込み後に実行される内容
function Sample01() {
    //フレームウインドウの作成
    var mainWindow = new JSW.FrameWindow();
    //タイトルの設定
    mainWindow.setTitle('サンプル01');
    //クライアントノードを呼び出して
    mainWindow.getClient().innerHTML = 'ノードに対して<br>フレームウインドウの表示';
}
//# sourceMappingURL=Sample01.js.map