/// <reference path="./Window.ts" />

namespace JSW{
	export class TextBox extends Window{
		nodeLabel: HTMLElement
		nodeText: HTMLInputElement
		constructor(params?:{text?: string,label?:string,type?:string,image?:string}) {
			super()

			this.getNode().dataset.jswStyle = 'TextBox'

			let node = this.getClient()
			node.style.overflow = 'visible'
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

			//デフォルトの高さをinputタグに合わせる
			let size = nodeText.getBoundingClientRect()
			this.setSize(300,size.top + size.bottom)

			if (params && params.text)
				this.setText(params.text)

			this.addEventListener('layouted', () => {
				this.resize()
			})
			this.addEventListener('measure', () => {
				this.resize()
			})

		}
		resize() {
			//デフォルトの高さをタグに合わせる
			const height = this.getHeight()
			let size = this.nodeText.getBoundingClientRect()
			const height2 = size.bottom - size.top
			if (height !== height2) {
				this.setHeight(height2)
				const parent = this.getParent()
				if (parent)
					parent.layout()
			}
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