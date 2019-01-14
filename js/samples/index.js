//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", MainIndex);
//ページ読み込み後に実行される内容
function MainIndex() {
    //フレームウインドウの作成
    var listWindow = new JSW.ListView({ 'frame': true });
    listWindow.setSize(320, 400);
    //タイトルの設定
    listWindow.setTitle('サンプルリスト');
    listWindow.addHeader([['番号', 50], ['名前', 250]]);
    var titles = [
        ['TypeDoc Viewer', 'Document.html'],
        ['フレームウインドウの表示', 'Sample01.html'],
        ['複数ウインドウの表示', 'Sample02.html'],
        ['ウインドウの親子関係', 'Sample03.html'],
        ['ツリービュー', 'Sample04.html']
    ];
    for (var i = 0, l = titles.length; i < l; i++) {
        listWindow.addItem([(i + 1).toString(), titles[i][0]]);
        listWindow.setItemValue(i, titles[i][1]);
    }
    listWindow.addEventListener('itemClick', function (e) {
        var p = e.params;
        var value = listWindow.getItemValue(p.itemIndex);
        window.open('Samples/' + value);
    });
    listWindow.setOverlap(true);
    listWindow.setPos();
}
//# sourceMappingURL=index.js.map