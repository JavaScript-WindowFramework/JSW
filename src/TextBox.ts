/// <reference path="./Window.ts" />

namespace JSW{
	export class TextBox extends Window{
		nodeText: HTMLInputElement
		constructor(text?: string) {
			super()
			let node = this.getClient()

			let nodeText = document.createElement('input')
			nodeText.style.width = '100%'
			nodeText.style.height = '100%'
			node.appendChild(nodeText)
			this.nodeText = nodeText

			//デフォルトの高さをinputタグに合わせる
			let size = nodeText.getBoundingClientRect()
			this.setSize(300,size.top + size.bottom + 1)

			if (text)
				this.setText(text)

		}
		setText(text: string) {
			let nodeText = this.nodeText
			nodeText.value = text
		}
		getText(){
			return this.nodeText.value
		}
		getTextNode(){
			return this.nodeText
		}
	}
}