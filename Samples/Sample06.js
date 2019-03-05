//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", Sample06)
//ページ読み込み後に実行される内容
function Sample06() {
	//各ウインドウのインスタンスを作成
	const frame = new JSW.FrameWindow()
	const splitter = new JSW.Splitter()
	const tree = new JSW.TreeView()
	const list = new JSW.ListView()

	//タイトル設定
	frame.setTitle('分割ウインドウのサンプル')
	//frameに対して、分割ウインドウをclient(画面いっぱい)で追加する
	frame.addChild(splitter,'client')
	//splitterの分割領域0にtreeを追加
	splitter.addChild(0,tree,'client')
	//splitterの分割領域1にlistを追加
	splitter.addChild(1,list,'client')

	//分割バーの分割サイズと方向設定(WestEast、左右)
	//weは左が領域0、右が領域1
	//nsにすると上下分割も可能
	splitter.setSplitterPos(200,'we')
	//表示領域が300を切ると、動的なオーバーレイ表示にする
	splitter.setOverlay(true,300)

	//treeにアイテムを追加
	tree.getRootItem().setItemText('最上位アイテム')
	for (let j = 0; j < 5; j++) {
		let item = tree.addItem("アイテム" + j,true)
		for (let i = 0; i < 5; i++)
			item.addItem("サブアイテム" + j + "-" + i, false)
	}
	//アイテムが選択された場合のイベント
	tree.addEventListener('itemSelect',function(e){
		const value = e.item.getItemText()
		if(value){
			const no = list.getItemCount()
			const date = (new Date()).toLocaleString()
			list.addItem([no.toString(),value,date])
		}
	})

	//listにヘッダを追加
	list.addHeader(['番号',['名前',200],'時刻'])

	//位置とサイズの設定
	frame.setSize(800,600)
	frame.setPos()
}