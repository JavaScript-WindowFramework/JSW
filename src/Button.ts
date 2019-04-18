/// <reference path="./Window.ts" />
namespace JSW {
	export interface BUTTON_EVENT_ITEM_CLICK{
		event: Event
	}
	export interface ButtonEventMap extends WINDOW_EVENT_MAP{
		"buttonClick": BUTTON_EVENT_ITEM_CLICK
		"buttonDblClick": BUTTON_EVENT_ITEM_CLICK
	}
	/**
	 *ボタン用クラス
	 *
	 * @export
	 * @class Button
	 * @extends {Window}
	 */
	export class Button extends Window {
		nodeText : HTMLElement
		nodeValue : any
		/**
		 *Creates an instance of Button.
		 * @param {string} [text] ボタンに設定するテキスト
		 * @memberof Button
		 */
		constructor(text?:string,value?:any){
			super()
			this.setAutoSize(true)
			this.setJswStyle('Button')
			this.nodeValue = value
			//this.setAlign('center')

			const button = document.createElement('div')
			this.getClient().appendChild(button)
			button.tabIndex = 0

			let nodeText = document.createElement('span')
			button.appendChild(nodeText)
			this.nodeText = nodeText
			if (text)
				this.setText(text)

			button.addEventListener('keypress',e=>{
				if (e.keyCode !== 13)
					this.callEvent('submit', { event: e } as BUTTON_EVENT_ITEM_CLICK)
			})
			button.addEventListener('click',(e)=>{
				this.callEvent('buttonClick', { event: e } as BUTTON_EVENT_ITEM_CLICK)
				this.callEvent('submit', { event: e } as BUTTON_EVENT_ITEM_CLICK)
			})
			button.addEventListener('dblclick',(e)=>{
				this.callEvent('buttonDblClick', { event: e } as BUTTON_EVENT_ITEM_CLICK)
			})
		}
		/**
		 *ボタンに対してテキストを設定する
		 *
		 * @param {string} text
		 * @memberof Button
		 */
		setText(text:string){
			let nodeText = this.nodeText
			nodeText.textContent = text
			this.layout()
		}
		/**
		 *ボタンに設定したテキストを取得する
		 *
		 * @returns {string}
		 * @memberof Button
		 */
		getText():string{
			return this.nodeText.textContent
		}
		setAlign(style: string) {
			let node = this.getClient()
			node.style.justifyContent = style;
		}
		getValue(){
			return this.nodeValue
		}
		/**
		 *イベントの設定
		 * 'buttonClick','buttonDblClick'
		 *
		 * @template K
		 * @param {K} type
		 * @param {(ev: ButtonEventMap[K]) => any} listener
		 * @memberof Button
		 */
		addEventListener<K extends keyof ButtonEventMap>(type: K, listener: (ev: ButtonEventMap[K]) => any): void{
			super.addEventListener(type as any, listener)
		}
	}
	export class ImageButton extends Window {
		nodeImg: HTMLImageElement
		/**
		 *Creates an instance of Button.
		 * @param {string} [text] ボタンに設定するテキスト
		 * @memberof Button
		 */
		constructor(image: string,alt?:string) {
			super()
			this.setWidth(64)
			//this.setAutoSize(true)
			this.setJswStyle('Button')
			//this.setAlign('center')

			const button = document.createElement('div')
			this.getClient().appendChild(button)
			button.tabIndex = 0

			let nodeImg = document.createElement('img')
			button.appendChild(nodeImg)
			this.nodeImg = nodeImg
			if (alt)
				nodeImg.alt = alt
			nodeImg.addEventListener('load',()=>{
				console.log('load %d %d', nodeImg.naturalWidth, nodeImg.naturalHeight )
				this.layout()
			})
			nodeImg.src = image

			button.addEventListener('keypress', e => {
				if (e.keyCode !== 13)
					this.callEvent('submit', { event: e } as BUTTON_EVENT_ITEM_CLICK)
			})
			button.addEventListener('click', (e) => {
				this.callEvent('buttonClick', { event: e } as BUTTON_EVENT_ITEM_CLICK)
				this.callEvent('submit', { event: e } as BUTTON_EVENT_ITEM_CLICK)
			})
			button.addEventListener('dblclick', (e) => {
				this.callEvent('buttonDblClick', { event: e } as BUTTON_EVENT_ITEM_CLICK)
			})
		}
		/**
		 *ボタンに対してテキストを設定する
		 *
		 * @param {string} text
		 * @memberof Button
		 */
		setText(text: string) {
			this.nodeImg.alt = text
			this.layout()
		}
		/**
		 *ボタンに設定したテキストを取得する
		 *
		 * @returns {string}
		 * @memberof Button
		 */
		getText(): string {
			return this.nodeImg.alt
		}
		setAlign(style: string) {
			let node = this.getClient()
			node.style.justifyContent = style;
		}
		/**
		 *イベントの設定
		 * 'buttonClick','buttonDblClick'
		 *
		 * @template K
		 * @param {K} type
		 * @param {(ev: ButtonEventMap[K]) => any} listener
		 * @memberof Button
		 */
		addEventListener<K extends keyof ButtonEventMap>(type: K, listener: (ev: ButtonEventMap[K]) => any): void {
			super.addEventListener(type as any, listener)
		}
	}
}