/// <reference path="./Window.ts" />

namespace JSW{
	export class TextBox extends Window{
		nodeLabel: HTMLElement
		nodeText: HTMLInputElement
		constructor(params?:{text?: string,label?:string,type?:string,image?:string}) {
			super()

			this.setJswStyle('TextBox')
			this.setAutoSize(true)

			let node = this.getClient()
			let img = document.createElement('img')
			if (params && params.image)
				img.src = params.image

			node.appendChild(img)

			let textArea = document.createElement('div')
			node.appendChild(textArea)

			let nodeLabel = document.createElement('div')
			textArea.appendChild(nodeLabel)
			if (params && params.label)
				nodeLabel.textContent = params.label

			let nodeText = document.createElement('input')
			if (params && params.type)
				nodeText.type = params.type
			textArea.appendChild(nodeText)
			this.nodeText = nodeText

			if (params && params.text)
				this.setText(params.text)

		}

		setText(text: string) {
			let nodeText = this.nodeText
			nodeText.value = text
		}
		getText():string{
			return this.nodeText.value
		}
		setLabel(text: string) {
			let node = this.nodeLabel
			node.textContent = text
		}
		getLabel(): string {
			return this.nodeLabel.textContent
		}
		getTextNode(){
			return this.nodeText
		}
	}
}