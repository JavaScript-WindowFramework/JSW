//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", MainIndex)
//ページ読み込み後に実行される内容
function MainIndex() {
	//フレームウインドウの作成
	let listWindow = new JSW.ListView({'frame':true})
	listWindow.setSize(320,400)
	//タイトルの設定
	listWindow.setTitle('サンプルリスト')

	listWindow.addHeader([['番号',50],['名前',250]])

	const titles = [
		['TypeDoc Viewer', 'https://javascript-windowframework.github.io/TypeDocViewer/'],
		['フレームウインドウの表示','Samples/Sample01.html'],
		['複数ウインドウの表示', 'Samples/Sample02.html'],
		['ウインドウの親子関係', 'Samples/Sample03.html'],
		['ツリービュー', 'Samples/Sample04.html']
	]

	for(let i=0,l=titles.length;i<l;i++){
		listWindow.addItem([(i+1).toString(),titles[i][0]])
		listWindow.setItemValue(i,titles[i][1])
	}

	listWindow.addEventListener('itemClick',e=>{
		const p = e.params
		const value = listWindow.getItemValue(p.itemIndex)
		window.open(value)
	})
	listWindow.setOverlap(true)
	listWindow.setPos()
}