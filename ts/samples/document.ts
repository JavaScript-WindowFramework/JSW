namespace TYPEDOC{
	/**
	 *TypeDocのJSON処理用
	*
	* @export
	* @interface TypeDoc
	*/
	export interface TypeDoc {
	id: number;
	name: string;
	kind: number;
	kindString: string;
	flags: Flags;
	originalName?: string;
	children: TypeDoc[];
	groups: Group[];
	sources?: Source[];
	comment?: Comment;
	extendedTypes?: Type[];
	signatures?: Signature[];
	overwrites?: Type;
	type?: Type;
	inheritedFrom?: Type;
	defaultValue?: string;
	}
	interface ElementType {
	type: string;
	name?: string;
	types?: Type[];
	}

	interface Signature {
	id: number;
	name: string;
	kind: number;
	kindString: string;
	flags: Flags;
	type: Type;
	comment?: Comment;
	parameters?: Parameter[];
	overwrites?: Type;
	inheritedFrom?: Type;
	}
	interface Parameter {
	id: number;
	name: string;
	kind: number;
	kindString: string;
	flags: Flags;
	type: Type;
	comment?: Comment;
	}
	interface Group {
	title: string;
	kind: number;
	children: number[];
	}

	interface Type {
	type: string;
	name?: string;
	id?: number;
	types?: Type[];
	value?: string;
	declaration?: Declaration;
	elementType?: ElementType;
	}
	interface Comment {
	text?: string
	shortText: string;
	tags?: Tag[];
	returns?: string;
	}

	interface Declaration {
	id: number;
	name: string;
	kind: number;
	kindString: string;
	flags: Flags;
	signatures: Signature[];
	sources: Source[];
	}

	interface Source {
	fileName: string;
	line: number;
	character: number;
	}



	interface Flags {
	isOptional?: boolean;
		isStatic?: boolean;
		isExported?: boolean;
	}

	interface Tag {
	tag: string;
	text: string;
	}

}

class SearchWindow extends JSW.ListView{
	constructor(treeView : JSW.TreeView,docData:TYPEDOC.TypeDoc,keywords : string){
		super({frame:true})
		this.addHeader('検索結果')
		if(docData == null)
			return

		let that = this
		this.addEventListener('itemClick',function(e){
			let index = e.params.itemIndex
			let item = that.getItemValue(index) as JSW.TreeItem
			item.selectItem(true)
		})

		let keys = keywords.toLowerCase().split(' ')
		this.findItems(treeView.getRootItem(),keys)

	}
	findItems(item:JSW.TreeItem,keys){
		let doc : TYPEDOC.TypeDoc = item.getItemValue()
		let word = doc.name;
		if(doc.signatures && doc.signatures[0]){
			let signature = doc.signatures[0]
			if(signature.parameters){
				for(let p of doc.signatures[0].parameters){
					word += ' '+p.name
				}
			}
			if(signature.comment && signature.comment.shortText){
				word += ' '+signature.comment.shortText
			}
		}

		if(SearchWindow.findKeys(word.toLowerCase(),keys)){
			let index = this.addItem(doc.name)
			this.setItemValue(index,item)
		}
		for(let i=0,l=item.getChildCount();i<l;i++){
			this.findItems(item.getChildItem(i),keys)
		}
	}
	static findKeys(value:string,keys:string[]){
		for(let key of keys){
			if(value.indexOf(key) === -1)
				return false
		}
		return true
	}
}
/**
 *TypeDocViewerのメインウインドウ
 *
 * @class TypeDocView
 * @extends {JSW.FrameWindow}
 */
class TypeDocView extends JSW.FrameWindow{
	mTreeView : JSW.TreeView
	mListView : JSW.ListView
	mDocData : TYPEDOC.TypeDoc
	constructor(){
		super()
		const that = this
		this.setTitle('TypeDoc Viewer')
		this.setSize(800,600)

		const panel = new JSW.Panel()
		this.addChild(panel,'top')
		const searchButton = new JSW.Button('Search')
		panel.addChild(searchButton,'left')
		searchButton.addEventListener('click',function(e){
			const search = new SearchWindow(that.mTreeView,that.mDocData,textBox.getText())
			that.addChild(search)
		})
		const textBox = new JSW.TextBox()
		textBox.setMargin(1,1,1,1)
		textBox.getTextNode().style.backgroundColor = '#dddddd'
		panel.addChild(textBox,'client')

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

		listView.addHeader([['項目',100],['値',800]])
		this.setPos()
	}

	loadUrl(url) {
		const that = this
		//Ajaxによるデータ要求処理
		let xmlHttp = new XMLHttpRequest()
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				let value = JSON.parse(xmlHttp.responseText)
				that.load(value)

			}
		}.bind(this)
		xmlHttp.open('GET', url, true)
		xmlHttp.send()
	}
	load(value:TYPEDOC.TypeDoc){
		this.mDocData = value
		TypeDocView.createTree(this.mTreeView.getRootItem(),value)
	}
	static createTree(item:JSW.TreeItem,value : TYPEDOC.TypeDoc){
		item.setItemText(value.name)
		item.setItemValue(value)

		const fromName = this.getInheritedFrom(value)
		if(fromName){
			item.getBody().style.color = '#888822'
		}


		if(value.children){
			const children = [].concat(value.children)
			children.sort(function(a,b){
				if(a.kindString !== b.kindString)
					return a.kindString<b.kindString?-1:1
				return a.name.toLowerCase()<b.name.toLowerCase()?-1:1
			})
			for(let i in children){
				if(!children[i].flags.isPrivate){
					let childItem = item.addItem()
					TypeDocView.createTree(childItem, children[i])
				}

			}
		}
	}
	static getInheritedFrom(value:TYPEDOC.TypeDoc){
		if(value.inheritedFrom){
			return value.inheritedFrom.name
		}
		return null
	}

	onTreeItem(e: JSW.TREEVIEW_EVENT_SELECT){
		const p = e.params
		const item = p.item
		const listView = this.mListView
		const value = item.getItemValue() as TYPEDOC.TypeDoc

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
			if(signature.inheritedFrom){
				listView.addItem(['継承', signature.inheritedFrom.name])
			}
			if (signature.parameters){
				const params = signature.parameters
				for(let i in params){
					const param = params[i]
					const comment = (param.comment && param.comment.text) ? param.comment.text:''
					const type = (param.name && param.type.name) ? param.type.name : ''

					listView.addItem(["["+param.name+"]",'{'+type+'} '+ comment])
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
	typeDocView.loadUrl('../doc/document.json')

	//メッセージの表示
	let msgWindow = new JSW.FrameWindow()
	msgWindow.setTitle('説明')
	msgWindow.setSize(300,200)
	msgWindow.getClient().innerHTML =
		'<a target="_blank" href="../doc/document.json">JSON</a>から、その内容を表示'
}
