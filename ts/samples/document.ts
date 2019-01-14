class TypeDocView extends JSW.FrameWindow{
	mTreeView : JSW.TreeView
	mListView : JSW.ListView
	constructor(){
		super()
		this.setTitle('TypeDoc Viewer')
		this.setSize(800,600)

		const splitter = new JSW.Splitter()
		this.addChild(splitter,'client')
		splitter.setSplitterPos(200)

		const treeView = new JSW.TreeView()
		this.mTreeView = treeView
		splitter.addChild(0,treeView,'client')
		treeView.addEventListener('itemSelect',this.onTreeItem.bind(this))

		const listView = new JSW.ListView()
		this.mListView = listView
		splitter.addChild(1, listView, 'client')

		listView.addHeader(['項目',['値',800]])
		this.setPos()
		this.load('../doc/document.json')

	}

	load(url) {
		const that = this
		//Ajaxによるデータ要求処理
		let xmlHttp = new XMLHttpRequest()
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				let value = JSON.parse(xmlHttp.responseText)
				TypeDocView.createTree(that.mTreeView.getRootItem(),value)

			}
		}.bind(this)
		xmlHttp.open('GET', url, true)
		xmlHttp.send()
	}
	static createTree(item:JSW.TreeItem,value){
		const that = this
		item.setItemText(value.name)
		item.setItemValue(value)

		const children = value.children
		for(let i in children){
			let childItem = item.addItem()
			TypeDocView.createTree(childItem, children[i])
		}
	}
	onTreeItem(e: JSW.TREEVIEW_EVENT_SELECT){
		const p = e.params
		const item = p.item
		const listView = this.mListView
		const value = item.getItemValue()

		listView.clearItem()
		if (value.kindString){
			listView.addItem(['種別',value.kindString])
		}
		if (value.signatures && value.signatures.length){
			const signature = value.signatures[0]
			if (signature.comment){
				if(signature.comment.shortText)
					listView.addItem(['説明', signature.comment.shortText])
				if (signature.comment.returns){
					const type = (signature.type && signature.type.name) ? signature.type.name:''
					listView.addItem(['戻り値', '{' + type + '} '+signature.comment.returns])
				}
			}
			if (signature.parameters){
				const params = signature.parameters
				for(let i in params){
					const param = params[i]
					const comment = (param.comment && param.comment.text) ? param.comment.text:''
					const type = (param.name && param.type.name) ? param.type.name : ''

					listView.addItem(["."+param.name,'{'+type+'} '+ comment])
				}
			}
		}
	}
}

//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", docMain)
//ページ読み込み後に実行される内容
function docMain() {
	let typeDocView = new TypeDocView()

	//メッセージの表示
	let msgWindow = new JSW.FrameWindow()
	msgWindow.setTitle('説明')
	msgWindow.setSize(300,200)
	msgWindow.getClient().innerHTML =
		'<a target="_blank" href="../doc/document.json">JSON</a>から、その内容を表示'
}