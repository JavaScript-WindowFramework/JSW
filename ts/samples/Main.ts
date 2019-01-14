class UserList extends JSW.ListView{
	//Ajaxのデータ取得元URL
	static URL = 'https://randomuser.me/api?results=100'

	constructor(){
		super({frame:true})				//フレーム有りのウインドウを作成
		this.setSize(800,600)			//ウインドウサイズの設定
		this.setTitle('ユーザリスト')	//タイトルの設定
		//リストビューのヘッダを設定
		this.addHeader([['画像', 35], ['ID', 80], 'EMail','Password','LastName','FirstName'],150)
		this.load()						//データの取得要求
	}

	//データ取得処理
	load(){
		//Ajaxによるデータ要求処理
		let xmlHttp = new XMLHttpRequest()
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				let results = JSON.parse(xmlHttp.responseText).results
				for (let i = 0; i < results.length;i++){
					let value = results[i]
					//顔イメージ用
					let pic = document.createElement('img')
					pic.style.height='100%'
					pic.src = value.picture.thumbnail;
					//リストビューにアイテムを追加
					this.addItem([pic, value.id.name, value.email, value.login.password, value.name.last, value.name.first]);
				}
				this.sortItem(2,true)
			}
		}.bind(this)
		xmlHttp.open('GET', UserList.URL,true)
		xmlHttp.send()
	}
}

class MainWindow extends JSW.Window{
	constructor(){
		super()

		let panel = new JSW.Panel
		this.addChild(panel,'top')

		let splitter = new JSW.Splitter()
		this.addChild(splitter,'client')

		let tree = new JSW.TreeView()
		splitter.addChild(0, tree)
		tree.getRootItem().setItemText('メニュー')
		tree.addItem(['メッセージ',0])
		tree.addItem(['ユーザリスト', 1])

		tree.addEventListener('itemSelect',function(e){
			let value = tree.getSelectItemValue()
			switch(value){
				case 0:
					break;
				case 1:
					//ユーザリスト
					let list = new UserList()
					splitter.addChild(1,list)
					//位置を真ん中に設定
					//list.setPos()
					break;
			}
		})
		this.setMaximize(true)
	}

}


//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", Main)
//ページ読み込み後に実行される内容
function Main() {
	let mainWindow = new MainWindow()


}
