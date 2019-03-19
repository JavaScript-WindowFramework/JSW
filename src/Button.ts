/// <reference path="./Window.ts" />
namespace JSW {
	export class Button extends Window {
		nodeText : HTMLElement
		constructor(text?:string){
			super()
			this.setMargin(1,1,1,1)
			this.setAutoSize(true)
			let node = this.getClient()
			node.dataset.kind = 'JButton'

			let nodeText = document.createElement('span')
			nodeText.style.whiteSpace = 'nowrap'
			node.appendChild(nodeText)
			this.nodeText = nodeText
			if (text)
				this.setText(text)
		}
		setText(text:string){
			let nodeText = this.nodeText
			nodeText.textContent = text
			this.layout()
		}
	}
}