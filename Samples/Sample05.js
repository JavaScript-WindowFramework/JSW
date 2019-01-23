//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", Sample05)
//ページ読み込み後に実行される内容
function Sample05() {
	//リストビューの作成
	let listView = new JSW.ListView({ frame: true })
	//サイズ設定
	listView.setSize(400, 300)
	//ルートアイテムに対して名前の設定
	listView.addHeader(['番号',['名前',150],['情報',200]])
	//アイテムの表示位置
	listView.setColumnStyles(['right','center','left'])
	//アイテムの追加
	listView.addItem([1, 'シュネッケン', 'なんとも言えない味だがヨーロッパでは大人気'])
	listView.addItem([2, 'デスソース', 'スパゲティーにタバスコのかわりに使うと、意外といける'])
	listView.addItem([3, 'サルミアッキ', 'これはどうにもならない'])


	//アイテムが選択された場合のイベント
	listView.addEventListener('itemClick',function(e){
		//ウインドウにメッセージを出す
		const p = e.params
		const index = p.itemIndex
		let win = new JSW.FrameWindow()
		win.getClient().textContent = listView.getItemText(index,1)+'が選択された'
		win.setPos()
		win.foreground()
	})
}