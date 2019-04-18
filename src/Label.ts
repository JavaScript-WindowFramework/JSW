/// <reference path="./Window.ts" />

namespace JSW{
	export class Label extends Window{
		nodeText: HTMLSpanElement
		constructor(text?: string) {
			super()
			this.setJswStyle('Label')
			let node = this.getClient()

			let nodeText = document.createElement('span')
			node.appendChild(nodeText)
			this.nodeText = nodeText

			if (text)
				this.setText(text)

			this.setAutoSize(true)
		}
		setFontSize(size:number){
			let nodeText = this.nodeText
			nodeText.style.fontSize = size + 'px'
			this.layout()
		}
		setText(text: string) {
			let nodeText = this.nodeText
			nodeText.textContent = text
		}
		getText():string{
			return this.nodeText.textContent
		}
		getTextNode(){
			return this.nodeText
		}
		setAlign(style:string){
			let node = this.getClient()
			//node.style.alignItems = style;
			node.style.justifyContent = style;
		}
	}
}