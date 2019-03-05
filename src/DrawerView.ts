/// <reference path="./Window.ts" />
module JSW{
	export interface ListViewEventMap extends WINDOW_EVENT_MAP{
		"selectItem": {text:string,value:any,icon:string}
	}

	export class DrawerView extends Window{
		constructor() {
			super()
			const client = this.getClient()
			client.dataset.kind = 'Drawer'
			this.setSize(300,200)
			this.setOverlap(true)

			this.addEventListener('active',e=>{
				if(!e.active)
					this.close()
			})
			this.setAnimation('show','weDrawerShow 0.5s ease 0s normal')
			this.setAnimation('close','weDrawerClose 0.5s ease 0s normal')
			this.foreground(true)
		}
		addEventListener<K extends keyof ListViewEventMap>(type: K|string, listener: (this: Window,ev: ListViewEventMap[K]) => any): void{
			super.addEventListener(type,listener)
		}

		addItem(text:string,value?:any,icon?:string){
			const client = this.getClient()
			const itemNode = document.createElement('div')
			itemNode.dataset.kind = 'DrawerItem'
			const iconNode = document.createElement('div')
			iconNode.dataset.kind = 'DrawerIcon'
			itemNode.appendChild(iconNode)
			if(icon)
				iconNode.style.backgroundImage = 'url("'+icon+'")'
			const textNode = document.createElement('div')
			textNode.dataset.kind = 'DrawerText'
			itemNode.appendChild(textNode)
			textNode.textContent = text

			itemNode.addEventListener('click',()=>{
				this.callEvent('selectItem',{text:text,value:value,icon:icon})
				this.close()
			})

			client.appendChild(itemNode)
		}
		onLayout(flag:boolean){
			const height = this.getParentHeight()
			if(height != this.getHeight())
				this.setHeight(height)
			super.onLayout(flag)
		}
	}
}