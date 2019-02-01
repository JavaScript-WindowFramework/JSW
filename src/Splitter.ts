/// <reference path="./Window.ts" />

namespace JSW{
	export interface JSWSPLITDATA {
		overlay : boolean
		overlayOpen : boolean
		overlayMove : number
		splitterThick : number
		splitterPos : number
		splitterType : string
		childList: Window[],
		pos? : number,
		type?: string
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
			overlay:false,
			overlayOpen:true,
			overlayMove:0,
			splitterThick:10,
			splitterPos:100,
			splitterType:'we',
			childList:null
		}
		/**
		 *Creates an instance of Splitter.
		 * @param {number} [splitPos]
		 * @param {('ns'|'sn'|'ew'|'we')} [splitType] 分割領域のタイプ
		 * @memberof Splitter
		 */
		constructor(splitPos?: number, splitType?: 'ns' | 'sn' | 'ew' | 'we') {
			super()
			this.setSize(640, 480)
			if(splitPos != null)
				this.JDataSplit.splitterPos = splitPos
			if(splitType != null){
				this.JDataSplit.splitterType = splitType
			}
			this.getNode().dataset.splitterType = this.JDataSplit.splitterType
			this.JDataSplit.childList = [new Window(), new Window()]
			super.addChild(this.JDataSplit.childList[0])
			super.addChild(this.JDataSplit.childList[1])

			let splitter = new Window()
			splitter.getNode().dataset.kind = 'Splitter'
			splitter.setOrderTop(true)
			super.addChild(splitter)

			let that = this
			this.JDataSplit.childList[0].getNode().addEventListener("mousedown", () => { that.slideTimeout() })
			this.JDataSplit.childList[0].getNode().addEventListener("touchstart", () => { that.slideTimeout() })
			this.JDataSplit.childList[1].getNode().addEventListener("mousedown", () => { that.slideClose() })
			this.JDataSplit.childList[1].getNode().addEventListener("touchstart", () => { that.slideClose() })

			splitter.getNode().addEventListener("mousedown", () => { that.slide() })
			splitter.getNode().addEventListener("touchstart", () => { that.slide() })
			splitter.getNode().addEventListener("move", function (e: any) {
				if (that.JDataSplit.overlay)
					return

				let p = e.params as MovePoint
				let width = that.getClientWidth()
				let height = that.getClientHeight()
				let splitterThick = that.JDataSplit.splitterThick
				let x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
				let y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
				switch (that.getNode().dataset.splitterType) {
					case "ns":
						that.JDataSplit.splitterPos = y
						break
					case "sn":
						that.JDataSplit.splitterPos = height - (y + splitterThick)
						break
					case "we":
						that.JDataSplit.splitterPos = x
						break
					case "ew":
						that.JDataSplit.splitterPos = width - (x + splitterThick)
						break

				}
				that.layout()

			})
			that.addEventListener("layout", function () {
				let width = that.getClientWidth()
				let height = that.getClientHeight()
				let JDataSplit = that.JDataSplit
				let splitterThick = JDataSplit.splitterThick
				let child0 = JDataSplit.childList[0]
				let child1 = JDataSplit.childList[1]

				if (JDataSplit.splitterPos < 0)
					JDataSplit.splitterPos = 0
				switch (that.getNode().dataset.splitterType) {
					case "we":
						if (JDataSplit.splitterPos >= width - splitterThick)
							JDataSplit.splitterPos = width - splitterThick - 1
						splitter.setSize(splitterThick, height)
						splitter.setPos(JDataSplit.splitterPos, 0)
						child0.setSize(splitter.getPosX(), height)
						if (JDataSplit.overlay) {
							that.movePos(-Math.floor(JDataSplit.splitterPos * JDataSplit.overlayMove), 0)
							child0.setPosX(-JDataSplit.splitterPos * JDataSplit.overlayMove)
							child1.setPosX(0)
							child1.setSize(width, height)
						} else {
							child1.setPosX(JDataSplit.splitterPos + splitterThick)
							child1.setSize(width - (JDataSplit.splitterPos + splitterThick), height)
						} break
					case "ew":
						if (JDataSplit.splitterPos >= width - splitterThick)
							JDataSplit.splitterPos = width - splitterThick - 1
						let p = width - JDataSplit.splitterPos - splitterThick
						splitter.setSize(splitterThick, height)
						if (JDataSplit.overlay) {
							that.setPos(p + (width - splitterThick - p) * JDataSplit.overlayMove, 0)
							child1.setSize(width, height)
							child0.setPosX(p + splitterThick + (width - splitterThick - p) * JDataSplit.overlayMove)
							child0.setSize(p + splitterThick, height)
						}
						else {
							splitter.setPos(p, 0)
							child1.setSize(p, height)
							child0.setPosX(p + splitterThick)
							child0.setSize(p + splitterThick, height)
						}
						break
					case "ns":
						if (JDataSplit.splitterPos >= height - splitterThick)
							JDataSplit.splitterPos = height - splitterThick - 1
						splitter.setSize(width, splitterThick)
						if (JDataSplit.overlay) {
							splitter.setPos(0, JDataSplit.splitterPos - Math.floor(JDataSplit.splitterPos * JDataSplit.overlayMove))
							child0.movePos(0, -Math.floor(JDataSplit.splitterPos * JDataSplit.overlayMove))
							child0.setSize(width, JDataSplit.splitterPos)
							child0.setPosY(0)
							child1.setSize(width, height)
						}
						else {
							splitter.setPos(0, JDataSplit.splitterPos)
							child0.setSize(width, JDataSplit.splitterPos)
							child1.setPosY(JDataSplit.splitterPos + splitterThick)
							child1.setSize(width, height - (JDataSplit.splitterPos + splitterThick))
						}
						break
					case "sn":
						if (JDataSplit.splitterPos >= height - splitterThick)
							JDataSplit.splitterPos = height - splitterThick - 1
						splitter.setSize(width, splitterThick)
						p = height - JDataSplit.splitterPos - splitterThick
						if (JDataSplit.overlay) {
							splitter.setSize(width, splitterThick)
							splitter.setPos(0, height - JDataSplit.splitterPos + (JDataSplit.splitterPos - splitterThick) * JDataSplit.overlayMove)
							child1.setSize(width, height)
							child0.setPosY(height - JDataSplit.splitterPos + splitterThick + (JDataSplit.splitterPos - splitterThick) * JDataSplit.overlayMove)
							child0.setSize(width, JDataSplit.splitterPos - splitterThick)
						} else {
							splitter.setPos(0, p)
							child1.setSize(width, p)
							child0.setPosY(p + splitterThick)
							child0.setSize(width, p + splitterThick)
						}
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
			this.JDataSplit.pos = pos
			if (type) {
				this.JDataSplit.type = type
			}

			this.JDataSplit.splitterPos = this.JDataSplit.pos
			if (this.JDataSplit.type != null) {
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
		setOverlay(flag: boolean) {
			if (flag) {
				this.JDataSplit.overlay = true
				this.JDataSplit.overlayOpen = true
				this.JDataSplit.overlayMove = 0
				this.JDataSplit.childList[0].setOrderTop(true)
				this.JDataSplit.childList[0].getNode().style.backgroundColor = 'rgba(255,255,255,0.8)'
				//this.slideTimeout()
			} else {
				this.JDataSplit.overlay = false
				this.JDataSplit.overlayOpen = true
				this.JDataSplit.overlayMove = 0
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
		/**
		 *動的バーを閉じる
		 *
		 * @memberof Splitter
		 */
		slideClose() {
			if (this.JDataSplit.overlayOpen) {
				this.slide()
			}
		}
		slideHandle = null
		private slide() {
			if (!this.JDataSplit.overlay || this.slideHandle)
				return
			this.slideHandle = setInterval(function () {
				if (this.JDataSplit.overlayOpen) {
					this.JDataSplit.overlayMove += 0.1
					if (this.JDataSplit.overlayMove >= 1) {
						this.JDataSplit.overlayMove = 1
						this.JDataSplit.overlayOpen = false
						clearInterval(this.slideHandle)
						this.slideHandle = null
					}
				} else {
					this.JDataSplit.overlayMove -= 0.1
					if (this.JDataSplit.overlayMove < 0) {
						this.JDataSplit.overlayMove = 0
						this.JDataSplit.overlayOpen = true
						clearInterval(this.slideHandle)
						this.slideHandle = null
						this.slideTimeout()
					}
				}
				this.layout()
			}, 10)
		}
		slideTimeoutHandle = null
		private slideTimeout(e = null) {
			if (this.slideTimeoutHandle)
				clearTimeout(this.slideTimeoutHandle)
			if (this.JDataSplit.overlay) {
				this.slideTimeoutHandle = setTimeout(function () {
					if (this.JDataSplit.overlayOpen) {
						this.slide()
						this.slideTimeoutHandle = null
					}
				}, 3000)
			}
			if (e)
				e.preventDefault()
		}
	}
}