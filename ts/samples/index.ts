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
		'フレームウインドウの表示',
		'複数ウインドウの表示',
		'ウインドウの親子関係',
		'ツリービュー'
		]

	for(let i=0,l=titles.length;i<l;i++){
		listWindow.addItem([(i+1).toString(),titles[i]])
	}

	listWindow.addEventListener('itemClick',e=>{
		const p = e.params
		window.open('Samples/Sample' + ("0" + (p.itemIndex+1)).slice(-2)+'.html','_blank')
	})
}