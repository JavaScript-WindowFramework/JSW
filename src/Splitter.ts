/// <reference path="./Window.ts" />

namespace JSW{
	export interface JSWSPLITDATA {
		splitterThick : number
		splitterPos : number
		splitterType : string
		splitter : Window
		childList: Window[]
		pos? : number
		type?: string
		drawerMode:boolean
		drawerModeNow: boolean
		splitterMoving : boolean
		menuIcon?:HTMLElement
		drawerWidth: number
	}
	/**
	 *分割ウインドウ用クラス
	 *
	 * @export
	 * @class Splitter
	 * @extends {Window}
	 */
	export class Splitter extends Window {
		JDataSplit: JSWSPLITDATA = {
			drawerMode:false,
			drawerModeNow: false,
			splitterMoving:false,
			splitterThick:10,
			splitterPos:100,
			splitterType:'we',
			splitter:null,
			childList:null,
			drawerWidth:0
		}
		/**
		 *Creates an instance of Splitter.
		 * @param {number} [splitPos]
		 * @param {('ns'|'sn'|'ew'|'we')} [splitType] 分割領域のタイプ
		 * @memberof Splitter
		 */
		constructor(splitPos?: number, splitType?: 'ns' | 'sn' | 'ew' | 'we') {
			super()
			this.setJswStyle('SplitterView')
			this.setSize(640, 480)
			if(splitPos != null)
				this.JDataSplit.splitterPos = splitPos
			if(splitType != null){
				this.JDataSplit.splitterType = splitType
			}
			const client = this.getClient()
			client.dataset.splitterType = this.JDataSplit.splitterType
			this.JDataSplit.childList = [new Window(), new Window()]
			super.addChild(this.JDataSplit.childList[0])
			super.addChild(this.JDataSplit.childList[1])


			const icon = document.createElement('div')
			this.JDataSplit.menuIcon = icon
			icon.dataset.kind = 'SplitterMenu'
			icon.style.display = 'none'
			client.appendChild(icon)
			icon.addEventListener('click',()=>{
				const child0 = this.JDataSplit.childList[0]
				this.JDataSplit.childList[0].addEventListener('visibled', e => {
					if (e.visible) {
						this.JDataSplit.splitter.setVisible(true)
					}
				})

				child0.setVisible(true)
				child0.active(true)
				icon.style.display = 'none'
			})

			let splitter = new Window()
			this.JDataSplit.splitter = splitter
			splitter.setJswStyle('Splitter')
			splitter.setOrderTop(true)
			splitter.setNoActive(true)
			super.addChild(splitter)

			let that = this
			let handle = null
			splitter.getNode().addEventListener("move", function (e: any) {

				let p = e.params as MovePoint
				let width = that.getClientWidth()
				let height = that.getClientHeight()
				const JDataSplit = that.JDataSplit
				let splitterThick = JDataSplit.splitterThick
				let x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
				let y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
				switch (that.getClient().dataset.splitterType) {
					case "ns":
						JDataSplit.splitterPos = y
						break
					case "sn":
						JDataSplit.splitterPos = height - (y + splitterThick)
						break
					case "we":
						JDataSplit.splitterPos = x
						break
					case "ew":
						JDataSplit.splitterPos = width - (x + splitterThick)
						break

				}
				JDataSplit.splitterMoving = true
				if(handle)
					clearTimeout(handle)
				handle = setTimeout(function(){handle=null;JDataSplit.splitterMoving = false;that.layout()},2000)
				that.layout()

			})
			this.addEventListener("layout", ()=> {
				const JDataSplit = that.JDataSplit
				const child0 = this.JDataSplit.childList[0]
				const child1 = this.JDataSplit.childList[1]

				function active(e) {
					if (!e.active) {
						JDataSplit.splitter.setVisible(false)
						child0.setVisible(false)
						JDataSplit.menuIcon.style.display = 'block'
					}
				}
				//動的分割機能の処理
				if (JDataSplit.drawerMode && !JDataSplit.splitterMoving){
					const type = JDataSplit.splitterType
					const dsize = JDataSplit.drawerWidth+JDataSplit.splitterPos
					const ssize =  type==='ew'||type==='we'?this.getWidth():this.getHeight()
					if(!JDataSplit.drawerModeNow){
						if (dsize > 0 && ssize < dsize){
							JDataSplit.drawerModeNow = true
							child1.setChildStyle('client')
							child0.setOrderTop(true)
							this.JDataSplit.splitter.setVisible(false)
							child0.getNode().style.backgroundColor = 'rgba(255,255,255,0.8)'
							child0.addEventListener('active', active)
							child0.setAnimation('show', JDataSplit.splitterType+'DrawerShow 0.5s ease 0s normal')
							child0.setAnimation('close', JDataSplit.splitterType+'DrawerClose 0.5s ease 0s normal')
							child0.active()
							child0.setVisible(false)
							this.JDataSplit.menuIcon.style.display = 'block'
						}
					}else{
						if (dsize > 0 && ssize >= dsize){
							JDataSplit.drawerModeNow = false
							child0.removeEventListener('active', active)
							child1.setChildStyle(null)
							child0.setOrderTop(false)
							child0.setVisible(true)
							this.JDataSplit.splitter.setVisible(true)
							this.JDataSplit.menuIcon.style.display = 'none'
						}
					}
				}

				let width = that.getClientWidth()
				let height = that.getClientHeight()
				let splitterThick = JDataSplit.splitterThick

				if (JDataSplit.splitterPos < 0)
					JDataSplit.splitterPos = 0
				switch (JDataSplit.splitterType) {
					case "we":
						if (JDataSplit.splitterPos >= width - splitterThick)
							JDataSplit.splitterPos = width - splitterThick - 1
						splitter.setSize(splitterThick, height)
						splitter.setPos(JDataSplit.splitterPos, 0)
						child0.setPos(0,0)
						child0.setSize(splitter.getPosX(), height)
						child1.setPos(JDataSplit.splitterPos + splitterThick,0)
						child1.setSize(width - (JDataSplit.splitterPos + splitterThick), height)
						break
					case "ew":
						if (JDataSplit.splitterPos >= width - splitterThick)
							JDataSplit.splitterPos = width - splitterThick - 1
						let p = width - JDataSplit.splitterPos - splitterThick
						splitter.setSize(splitterThick, height)
						splitter.setPos(p, 0)
						child1.setPos(0,0)
						child1.setSize(p, height)
						child0.setPos(p + splitterThick,0)
						child0.setSize(JDataSplit.splitterPos, height)
						break
					case "ns":
						if (JDataSplit.splitterPos >= height - splitterThick)
							JDataSplit.splitterPos = height - splitterThick - 1
						splitter.setSize(width, splitterThick)
						splitter.setPos(0, JDataSplit.splitterPos)
						child0.setPos(0,0)
						child0.setSize(width, JDataSplit.splitterPos)
						child1.setPos(0,JDataSplit.splitterPos + splitterThick)
						child1.setSize(width, height - (JDataSplit.splitterPos + splitterThick))
						break
					case "sn":
						if (JDataSplit.splitterPos >= height - splitterThick)
							JDataSplit.splitterPos = height - splitterThick - 1
						splitter.setSize(width, splitterThick)
						p = height - JDataSplit.splitterPos - splitterThick
						splitter.setPos(0, p)
						child1.setPos(0,0)
						child1.setSize(width, p)
						child0.setPos(0,p + splitterThick)
						child0.setSize(width, JDataSplit.splitterPos)
						break
				}
			})
		}

		/**
		 *子ウインドウの追加
		 *
		 * @param {number} index 追加位置
		 * @param {Window} child 追加ウインドウ
		 * @param {('left' | 'right' | 'top' | 'bottom' | 'client' | null)} [arrgement] ドッキングタイプ
		 * @memberof Splitter
		 */
		addChild(index, child, arrgement?: 'left' | 'right' | 'top' | 'bottom' | 'client' | null): void {
			this.JDataSplit.childList[index].addChild(child, arrgement)
		}
		/**
		 *子ウインドウを切り離す
		 *
		 * @param {number} index 削除位置
		 * @param {Window} [child] 削除ウインドウ
		 * @memberof Splitter
		 */
		removeChild(index, child?): void {
			if (child == null)
				return
			this.JDataSplit.childList[index].removeChild(child)
		}
		/**
		 *子ウインドウを全て切り離す
		 *
		 * @param {number} [index] 削除位置
		 * @memberof Splitter
		 */
		removeChildAll(index?: number): void {
			if (index == null)
				return
			this.JDataSplit.childList[index].removeChildAll()
		}
		/**
		 *分割バーの位置設定
		 *
		 * @param {number} pos
		 * @param {('ns'|'sn'|'ew'|'we')} [type]
		 * @memberof Splitter
		 */
		setSplitterPos(pos: number, type?: 'ns' | 'sn' | 'ew' | 'we') {
			if(pos != null)
				this.JDataSplit.pos = pos
			if (type) {
				this.JDataSplit.type = type
			}

			this.JDataSplit.splitterPos = this.JDataSplit.pos
			if (this.JDataSplit.type != null) {
				this.getClient().dataset.splitterType = this.JDataSplit.type
				this.JDataSplit.splitterType = this.JDataSplit.type
			}
			this.layout()
		}
		/**
		 *動的バーの設定
		 *
		 * @param {boolean} flag true:有効 false:無効
		 * @memberof Splitter
		 */
		setOverlay(flag: boolean,size?:number) {
			if (flag) {
				this.JDataSplit.drawerMode = true
				this.JDataSplit.drawerWidth = size!=null?size:0
			}
			this.layout()
		}
		/**
		 *子ウインドウの取得
		 *
		 * @param {number} index 位置
		 * @returns {Window} 子ウインドウ
		 * @memberof Splitter
		 */
		getChild(index: number): Window {
			return this.JDataSplit.childList[index]
		}

	}
}