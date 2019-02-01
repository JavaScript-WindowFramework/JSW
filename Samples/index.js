//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", MainIndex);
//ページ読み込み後に実行される内容
function MainIndex() {
	//フレームウインドウの作成
	var listWindow = new JSW.ListView({
		'frame': true
	});
	listWindow.setSize(320, 400);
	//タイトルの設定
	listWindow.setTitle('サンプルリスト');
	//ヘッダ作成
	listWindow.addHeader([
		['番号', 50],
		['名前', 250]
	]);
	var titles = [
		['フレームウインドウの表示', 'Sample01.html'],
		['複数ウインドウの表示', 'Sample02.html'],
		['ウインドウの親子関係', 'Sample03.html'],
		['ツリービュー', 'Sample04.html'],
		['ツリービュー(フレームウインドウ化)', 'Sample04_1.html'],
		['リストビュー', 'Sample05.html'],
		['分割ウインドウ', 'Sample06.html'],
		['TypeDoc Viewer', 'https://javascript-windowframework.github.io/TypeDocViewer/'],
	];
	for (var i = 0, l = titles.length; i < l; i++) {
		listWindow.addItem([(i + 1).toString(), titles[i][0]]);
		listWindow.setItemValue(i, titles[i][1]);
	}
	listWindow.addEventListener('itemClick', function (e) {
		var value = listWindow.getItemValue(e.itemIndex);
		window.open(value);
	});
	listWindow.setOverlap(true);
	listWindow.setPos();
}