/// <reference path="./Window.ts" />

namespace JSW{
	export class Label extends Window{
		nodeText: HTMLSpanElement
		constructor(text?: string) {
			super()
			let node = this.getClient()
			node.style.overflow = 'visible'
			node.style.display = 'flex'

			let nodeText = document.createElement('span')
			node.appendChild(nodeText)
			this.nodeText = nodeText

			if (text)
				this.setText(text)

			//this.setAutoSize(true)
			this.addEventListener('layout',()=>{
				this.resize()
			})

		}
		resize(){
			//デフォルトの高さをタグに合わせる
			const height = this.getHeight()
			let size = this.nodeText.getBoundingClientRect()
			const height2 = size.bottom - size.top
			if(height !== height2){
				this.setHeight(height2)
				const parent = this.getParent()
				if(parent)
					parent.layout()
			}
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
			node.style.alignItems = style;
			node.style.justifyContent = style;
		}
	}
}