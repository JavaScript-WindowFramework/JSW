//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", Sample03)
//ページ読み込み後に実行される内容
function Sample03() {
	//フレームウインドウの作成
	let mainWindow = new JSW.FrameWindow()
	//タイトルの設定
	mainWindow.setTitle('サンプル03')
	//クライアントノードを呼び出して
	mainWindow.getClient().innerHTML = 'ノードに対して<br>フレームウインドウの表示'

	//フレームウインドウの作成
	let mainWindow2 = new JSW.FrameWindow()
	//タイトルの設定
	mainWindow2.setTitle('サンプル03 ふたつ目')
	//クライアントノードを呼び出して
	mainWindow2.getClient().innerHTML = 'ウインドウをセンタリング'
	//サイズ指定
	mainWindow2.setSize(300, 400)
	//位置の設定
	mainWindow2.setPos(50, 50)
	//mainWindow2をmainWindowの子にする
	mainWindow.addChild(mainWindow2)

}