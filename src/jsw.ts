/**
 * JavaScriptWindowフレームワーク用名前空間
 * namespaceの前に「export」を入れると、モジュールとして利用可能
*/

namespace JSW {
	/**
	 * 位置設定用
	*/
	export interface Point {
		x: number
		y: number
	}
	/**
	 * サイズ設定用
	*/
	export interface Size {
		width: number
		height: number
	}

	/**
	 * ドラッグドロップ機能用
	 *
	 * @export
	 * @interface MovePoint
	 * @param {Point} basePoint クリック基準位置
	 * @param {Point} nowPoint 移動位置位置
	 * @param {Point} nodePoint ノード初期位置
	 * @param {Size} nodeSize ノード初期サイズ
	 */
	export interface MovePoint {
		basePoint: Point
		nowPoint: Point
		nodePoint: Point
		nodeSize: Size
	}
	/**
	 * ウインドウ等総合管理クラス
	 *
	 * @export
	 * @class Jsw
	 */
	export class Jsw {
		static nodeX: number
		static nodeY: number
		static baseX: number
		static baseY: number
		static nodeWidth: number
		static nodeHeight: number
		static moveNode: HTMLElement = null
		static frame: any = null
		static layoutForced: boolean
		static layoutHandler

		/**
		 * マウスとタッチイベントの座標取得処理
		 * @param  {MouseEvent|TouchEvent} e
		 * @returns {Point} マウスの座標
		 */
		static getPos(e: MouseEvent | TouchEvent): Point {
			let p: Point
			if ((e as TouchEvent).targetTouches && (e as TouchEvent).targetTouches.length) {
				let touch = (e as TouchEvent).targetTouches[0]
				p = { x: touch.pageX, y: touch.pageY }
			} else {
				p = { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
			}
			return p
		}
		/**
		 * 対象ノードに対して移動を許可し、イベントを発生させる
		 *
		 * @static
		 * @param {HTMLElement} node
		 * @memberof Jsw
		 */
		static enableMove(node: HTMLElement) {
			function mouseDown(e) {
				if (Jsw.moveNode == null) {
					Jsw.moveNode = node
					let p = Jsw.getPos(e)
					Jsw.baseX = p.x
					Jsw.baseY = p.y
					Jsw.nodeX = node.offsetLeft
					Jsw.nodeY = node.offsetTop
					Jsw.nodeWidth = node.clientWidth
					Jsw.nodeHeight = node.clientWidth
					e.preventDefault()
					return false;
				}
			}
			node.addEventListener("touchstart", mouseDown, { passive: false })
			node.addEventListener("mousedown", mouseDown)

		}
		/**
		 * ノードに対してイベントを発生させる
		 *
		 * @static
		 * @param {HTMLElement} node 対象ノード
		 * @param {string} ename イベント名
		 * @param {*} [params] イベント発生時にevent.paramsの形で送られる
		 * @memberof Jsw
		 */
		static callEvent(node: HTMLElement, ename: string, params?: any) {
			node.dispatchEvent(Jsw.createEvent(ename, params))
		}
		/**
		 *イベントを作成する
		 *
		 * @static
		 * @param {string} ename イベント名
		 * @param {*} [params] イベント発生時にevent.paramsの形で送られる
		 * @returns {Event} 作成したイベント
		 * @memberof Jsw
		 */

		static createEvent(ename: string, params?: any): Event {
			let event: any
			if (!!(window as any).MSStream) {
				event = document.createEvent('CustomEvent')
				event.initCustomEvent(ename, false, false, null)
			} else {
				event = new CustomEvent(ename, null)
			}
			event.params = params
			return event
		}
		/**
		 *ノードを作成する
		 *
		 * @static
		 * @param {string} tagName タグ名
		 * @param {*} [params] タグパラメータ
		 * @returns {HTMLElement} 作成したノード
		 * @memberof Jsw
		 */
		static createElement(tagName: string, params?: any): HTMLElement {
			let tag = document.createElement(tagName)
			for (let index in params) {
				let p = params[index]
				if (typeof p == 'object') {
					for (let index2 in p)
						tag[index][index2] = p[index2]
				} else
					tag[index] = p
			}
			return tag
		}

		/**
		 *ウインドウレイアウトの更新要求
		 *実際の処理は遅延非同期で行われる
		 *
		 * @static
		 * @param {boolean} flag	true:全Window強制更新 false:更新の必要があるWindowのみ更新
		 * @memberof Jsw
		 */
		static layout(flag: boolean) {
			Jsw.layoutForced = Jsw.layoutForced || flag
			if (!Jsw.layoutHandler) {
				//タイマーによる遅延実行
				Jsw.layoutHandler = setTimeout(function () {
					let nodes = document.querySelectorAll("[data-type=Window]")
					let count = nodes.length
					for (let i = 0; i < count; i++) {
						let node = nodes[i] as JNode
						if (!node.Jsw.getParent())
							node.Jsw.onMeasure(Jsw.layoutForced)
						node.Jsw.onLayout(Jsw.layoutForced)
					}
					Jsw.layoutHandler = null
					Jsw.layoutForced = false
				}, 0)
			}
		}
	}
	//各サイズ
	const FRAME_SIZE = 10	//フレーム枠のサイズ
	const TITLE_SIZE = 24	//タイトルバーのサイズ

	//各イベント設定
	addEventListener("resize", function () { Jsw.layout(true) })
	addEventListener("mouseup", mouseUp, false)
	addEventListener("touchend", mouseUp, { passive: false })
	addEventListener("mousemove", mouseMove, false)
	addEventListener("touchmove", mouseMove, { passive: false })

	//マウスが離された場合に選択をリセット
	function mouseUp() {
		Jsw.moveNode = null
		Jsw.frame = null
	}
	//マウス移動時の処理
	function mouseMove(e) {
		if (Jsw.moveNode) {
			let node = Jsw.moveNode;	//移動中ノード
			let p = Jsw.getPos(e);		//座標の取得
			let params: MovePoint = {
				nodePoint: { x: Jsw.nodeX, y: Jsw.nodeY },
				basePoint: { x: Jsw.baseX, y: Jsw.baseY },
				nowPoint: { x: p.x, y: p.y },
				nodeSize: { width: node.clientWidth, height: node.clientHeight }
			}
			Jsw.callEvent(node, 'move', params)
			//e.preventDefault()
			return false
		}
	}

	/**
	 *ウインドウ管理用基本データ
	 *
	 * @interface JDATA
	 */
	interface JDATA {
		x: number
		y: number
		width: number
		height: number
		frameSize: number
		titleSize: number
		redraw: boolean
		parent: Window
		orderTop: boolean
		orderLayer: number
		layoutFlag: boolean
		clientArea: HTMLElement
		style: string
		visible: boolean
		minimize: boolean
		normalX: number
		normalY: number
		normalWidth: number
		normalHeight: number
		margin: { x1: number, y1: number, x2: number, y2: number }
		padding: { x1: number, y1: number, x2: number, y2: number }
		moveable: boolean
	}
	/**
	 *ウインドウノードにWindowの参照を持たせる
	 *
	 * @interface JNode
	 * @extends {HTMLElement}
	 */
	interface JNode extends HTMLElement {
		Jsw: Window	//ノードを保持しているWindow
	}

	/**
	 *ウインドウ基本クラス
	 *
	 * @export
	 * @class Window
	 */
	export class Window {
		private hNode: JNode
		private JData: JDATA = {
			x: 0,
			y: 0,
			width: 400,
			height: 300,
			frameSize: 0,
			titleSize: 0,
			redraw: true,
			parent: null,
			orderTop: false,
			orderLayer: 0,
			layoutFlag: false,
			clientArea: null,
			style: null,
			visible: true,
			minimize: false,
			normalX: 0,
			normalY: 0,
			normalWidth: 0,
			normalHeight: 0,
			margin: { x1: 0, y1: 0, x2: 0, y2: 0 },
			padding: { x1: 0, y1: 0, x2: 0, y2: 0 },
			moveable: false,
		}
		/**
		 * Creates an instance of Window.
		 * @param {{ frame?: boolean, title?: boolean, layer?: number}} [params] ウインドウ作成用パラメータ
		 * {	frame?:boolean,
		 * 		title?:boolean,
		 * 		layer?:number
		 * }
		 * @memberof Window
		 */
		constructor(params?: { frame?: boolean, title?: boolean, layer?: number, overlap?: boolean }) {
			//ウインドウ用ノードの作成
			let hNode = document.createElement('DIV') as JNode
			hNode.Jsw = this
			this.JData.clientArea = hNode
			this.hNode = hNode
			hNode.dataset.type = "Window"
			//位置を絶対位置指定
			hNode.style.position = 'absolute'
			if (params) {
				if (params.frame) {
					this.addFrame(params.title == null ? true : params.title)
					if (params.layer == null)
						this.setOrderLayer(10)
					if (params.overlap == null)
						this.setOverlap(true)
				}
				if (params.layer) {
					this.setOrderLayer(params.layer)
				}
				if (params.overlap) {
					this.setOverlap(params.overlap)
				}
			}


			//移動に備えて、必要な情報を収集
			hNode.addEventListener("touchstart", this.onMouseDown.bind(this), { passive: false })
			hNode.addEventListener("mousedown", this.onMouseDown.bind(this))
			hNode.addEventListener('move', this.onMouseMove.bind(this))
			//タイトルバーアイコンの機能設定
			hNode.addEventListener("JSWclose", this.close.bind(this))
			hNode.addEventListener("JSWmax", this.setMaximize.bind(this, true))
			hNode.addEventListener("JSWnormal", this.setMaximize.bind(this, false))
			hNode.addEventListener("JSWmin", this.setMinimize.bind(this, true))
			hNode.addEventListener("JSWrestore", this.setMinimize.bind(this, false))
			//ノードを本文へ追加
			document.body.appendChild(hNode)
			//更新要求
			this.layout()
			//新規ウインドウをフォアグラウンドにする
			this.foreground(false)
		}
		setOverlap(flag: boolean) {
			this.hNode.style.position = flag ? 'fixed' : 'absolute'
		}
		//フレーム追加処理
		private addFrame(titleFlag: boolean): void {
			this.hNode.dataset.style = 'frame'
			//タイトルの設定
			this.JData.titleSize = titleFlag ? TITLE_SIZE : 0
			this.hNode.style.minHeight = this.JData.titleSize + "px"
			//各パーツのスタイル設定
			let frameStyles = [
				["frame", "cursor:n-resize; left:0px;top:-{0}px;right:0px;height:{0}px;"],//上
				["frame", "cursor:e-resize; top:0px;right:-{0}px;bottom:0px;width:{0}px;"],//右
				["frame", "cursor:s-resize; left:0px;right:0px;height:{0}px;bottom:-{0}px;"],//下
				["frame", "cursor:w-resize; top:0px;left:-{0}px;bottom:0px;width:{0}px;"],//左
				["frame", "cursor:nw-resize;left:-{0}px;top:-{0}px;width:{0}px;height:{0}px;"],//左上
				["frame", "cursor:ne-resize;right:-{0}px;top:-{0}px;width:{0}px;height:{0}px;"],//右上
				["frame", "cursor:sw-resize;left:-{0}px;bottom:-{0}px;width:{0}px;height:{0}px;"],//左下
				["frame", "cursor:se-resize;right:-{0}px;bottom:-{0}px;width:{0}px;height:{0}px;"],//右下
				["title", "left:0px;top:0px;right:0px;height:{1}px"],//タイトル
				["client", "left:0px;top:{1}px;right:0px;bottom:0px"],//クライアント領域
			]


			//フレームクリックイベントの処理
			function onFrame(e) {
				if (Jsw.frame == null)
					Jsw.frame = this.dataset.index
				//EDGEはここでイベントを止めないとテキスト選択が入る
				if (Jsw.frame < 9)
					if (e.preventDefault) e.preventDefault(); else e.returnValue = false
			}
			//フレームとタイトル、クライアント領域の作成
			for (let i = 0; i < frameStyles.length; i++) {
				let frame = document.createElement('div')
				frame.style.cssText = frameStyles[i][1].replace(/\{0\}/g, FRAME_SIZE.toString()).replace(/\{1\}/g,
					this.JData.titleSize.toString())
				frame.dataset.index = i.toString()
				frame.dataset.type = frameStyles[i][0]
				this.hNode.appendChild(frame)

				frame.addEventListener("touchstart", onFrame, { passive: false })
				frame.addEventListener("touchend", function () { Jsw.frame = null; }, { passive: false })
				frame.addEventListener("mousedown", onFrame, false)
				frame.addEventListener("mouseup", function () { Jsw.frame = null; }, false)
			}
			let node = this.hNode
			//タイトルバーの作成
			let title = node.childNodes[8]
			let titleText = Jsw.createElement("div", { "dataset": { type: "text" } })
			title.appendChild(titleText)
			//アイコンの作成
			let icons = ["min", "max", "close"]
			for (let index in icons) {
				let icon = Jsw.createElement("div", { style: { "width": this.JData.titleSize + "px", "height": this.JData.titleSize + "px" }, "dataset": { type: "icon", kind: icons[index] } })
				title.appendChild(icon)
				icon.addEventListener("click", function () {
					Jsw.callEvent(node, "JSW" + this.dataset.kind)
				})
			}
			//クライアント領域の取得を書き換える
			this.JData.clientArea = this.hNode.childNodes[9] as HTMLElement
		}

		private onMouseDown(e) {
			if (Jsw.moveNode == null) {
				this.foreground()
				Jsw.moveNode = this.hNode
				let p = Jsw.getPos(e)
				Jsw.baseX = p.x
				Jsw.baseY = p.y
				Jsw.nodeX = this.getPosX()
				Jsw.nodeY = this.getPosY()
				Jsw.nodeWidth = this.getWidth()
				Jsw.nodeHeight = this.getHeight()
				//e.preventDefault()
				//return false
			}
		}
		private onMouseMove(e) {
			let p = e.params as MovePoint
			let x = this.getPosX()
			let y = this.getPosY()

			let width = this.getWidth()
			let height = this.getHeight()

			//選択されている場所によって挙動を変える
			let frameIndex = parseInt(Jsw.frame)
			switch (frameIndex) {
				case 0://上
					y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
					height = Jsw.nodeHeight - (p.nowPoint.y - p.basePoint.y)
					break
				case 1://右
					width = Jsw.nodeWidth + (p.nowPoint.x - p.basePoint.x)
					break
				case 2://下
					height = Jsw.nodeHeight + (p.nowPoint.y - p.basePoint.y)
					break
				case 3://左
					x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
					width = Jsw.nodeWidth - (p.nowPoint.x - p.basePoint.x)
					break
				case 4://左上
					x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
					y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
					width = Jsw.nodeWidth - (p.nowPoint.x - p.basePoint.x)
					height = Jsw.nodeHeight - (p.nowPoint.y - p.basePoint.y)
					break
				case 5://右上
					y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
					width = Jsw.nodeWidth + (p.nowPoint.x - p.basePoint.x)
					height = Jsw.nodeHeight - (p.nowPoint.y - p.basePoint.y)
					break
				case 6://左下
					x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
					width = Jsw.nodeWidth - (p.nowPoint.x - p.basePoint.x)
					height = Jsw.nodeHeight + (p.nowPoint.y - p.basePoint.y)
					break
				case 7://右下
					width = Jsw.nodeWidth + (p.nowPoint.x - p.basePoint.x)
					height = Jsw.nodeHeight + (p.nowPoint.y - p.basePoint.y)
					break
				default: //クライアント領域
					if (!this.JData.moveable)
						break;
				case 8://タイトル
					x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
					y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
					break
			}
			//位置とサイズの設定
			this.setPos(x, y)
			this.setSize(width, height)
			//移動フレーム処理時はイベントを止める
			if (frameIndex < 9)
				if (e.preventDefault) e.preventDefault(); else e.returnValue = false
		}
		/**
		 *イベントの受け取り
		 *
		 * @param {string} type イベントタイプ
		 * @param {*} listener コールバックリスナー
		 * @param {*} [options] オプション
		 * @memberof Window
		 */
		addEventListener(type: string, listener, options?) {
			this.hNode.addEventListener(type, listener, options)
		}
		/**
		 *イベントの要求
		 *
		 * @param {string} type イベントタイプ
		 * @param {*} params パラメータ
		 * @memberof Window
		 */
		callEvent(type: string, params) {
			Jsw.callEvent(this.hNode, type, params)
		}
		/**
		 *ウインドウのノードを得る
		 *
		 * @returns {HTMLElement} ウインドウノード
		 * @memberof Window
		 */
		getNode(): HTMLElement {
			return this.hNode
		}
		/**
		 *ウインドウの移動
		 *
		 * @param {number} x
		 * @param {number} y
		 * @memberof Window
		 */
		movePos(x: number, y: number): void {
			this.JData.x = this.JData.x + parseInt(x as any)
			this.JData.y = this.JData.y + parseInt(y as any)
			this.layout()
		}
		/**
		 *ウインドウの位置設定
		 *引数を省略した場合は親のサイズを考慮して中央へ
		 * @param {number} [x]
		 * @param {number} [y]
		 * @memberof Window
		 */
		setPos(x?: number, y?: number): void {
			if (x == null) {
				let parentWidth = this.getParentWidth()
				let width = this.getWidth()
				if (parentWidth < width)
					x = 0
				else
					x = (parentWidth - width) / 2
			}
			if (y == null) {
				let parentHeight = this.getParentHeight()
				let height = this.getHeight()
				if (parentHeight < height)
					y = 0
				else
					y = (parentHeight - height) / 2
			}
			this.JData.x = x
			this.JData.y = y
			this.layout()
		}
		/**
		 *X座標の設定
		 *
		 * @param {number} x
		 * @memberof Window
		 */
		setPosX(x: number): void {
			this.JData.x = parseInt(x as any)
			this.layout()
		}
		/**
		 *Y座標の設定
		 *
		 * @param {number} y
		 * @memberof Window
		 */
		setPosY(y: number): void {
			this.JData.y = parseInt(y as any)
			this.layout()
		}
		/**
		 *親ウインドウの取得
		 *
		 * @returns {Window} 親ウインドウ
		 * @memberof Window
		 */
		getParent(): Window {
			return this.JData.parent
		}
		/**
		 *クライアント領域のドラッグによる移動の許可
		 *
		 * @param {boolean} moveable true:許可 false:不許可
		 * @memberof Window
		 */
		setMoveable(moveable: boolean): void {
			this.JData.moveable = moveable
		}

		/**
		 *X座標を返す
		 *
		 * @returns {number}
		 * @memberof Window
		 */
		getPosX(): number { return this.JData.x; }
		/**
		 *Y座標を返す
		 *
		 * @returns {number}
		 * @memberof Window
		 */
		getPosY(): number { return this.JData.y; }
		/**
		 *ウインドウの幅を返す
		 *
		 * @returns
		 * @memberof Window
		 */
		getWidth() { return this.JData.width; }
		/**
		 *ウインドウの高さを返す
		 *
		 * @returns
		 * @memberof Window
		 */
		getHeight() { return this.JData.height; }
		/**
		 *ウインドウサイズの設定
		 *
		 * @param {number} width
		 * @param {number} height
		 * @memberof Window
		 */
		setSize(width: number, height: number): void {
			this.JData.width = parseInt(width as any)
			this.JData.height = parseInt(height as any)
			this.layout()
		}
		/**
		 *ウインドウの幅の設定
		 *
		 * @param {number} width
		 * @memberof Window
		 */
		setWidth(width: number): void {
			this.JData.width = parseInt(width as any)
			this.layout()
		}

		/**
		 *ウインドウの高さの設定
		 *
		 * @param {number} height
		 * @memberof Window
		 */
		setHeight(height: number): void {
			this.JData.height = parseInt(height as any)
			this.layout()
		}

		/**
		 * クライアント領域のpadding設定
		 *
		 * @param {number} x1
		 * @param {number} y1
		 * @param {number} x2
		 * @param {number} y2
		 * @memberof Window
		 */
		setPadding(x1: number, y1: number, x2: number, y2: number) {
			this.JData.padding.x1 = x1;
			this.JData.padding.y1 = y1;
			this.JData.padding.x2 = x2;
			this.JData.padding.y2 = y2;
		}
		/**
		 *配置時のマージン設定
		 *
		 * @param {number} x1
		 * @param {number} y1
		 * @param {number} x2
		 * @param {number} y2
		 * @memberof Window
		 */
		setMargin(x1: number, y1: number, x2: number, y2: number) {
			this.JData.margin.x1 = x1;
			this.JData.margin.y1 = y1;
			this.JData.margin.x2 = x2;
			this.JData.margin.y2 = y2;
		}
		/**
		 *ウインドウの可視状態の取得
		 *
		 * @returns {boolean}
		 * @memberof Window
		 */
		isVisible(): boolean {
			if (!this.JData.visible)
				return false;
			if (this.getParent())
				return this.getParent().isVisible();
			return true;
		}

		/**
		 *ウインドウの可視状態の設定
		 *
		 * @param {boolean} flag
		 * @memberof Window
		 */
		setVisible(flag: boolean) {
			this.JData.visible = flag;
			this.getNode().style.display = flag ? 'block' : 'none';
			if (this.getParent())
				this.getParent().layout();
		}
		/**
		 *ウインドウの重ね合わせを最上位に設定
		 *
		 * @param {boolean} flag
		 * @memberof Window
		 */
		setOrderTop(flag: boolean): void {
			this.JData.orderTop = flag
		}
		/**
		 *ウインドウの重ね合わせ順位の設定
		 *値が大きいほど上位
		 * @param {number} level デフォルト:0 FrameWindow:10
		 * @memberof Window
		 */
		setOrderLayer(level: number): void {
			this.JData.orderLayer = level
		}
		/**
		 *レイアウトの再構成要求
		 *
		 * @memberof Window
		 */
		layout(): void {
			if (this.JData.layoutFlag)
				return
			this.JData.layoutFlag = true
			this.JData.redraw = true
			Jsw.layout(false)
			this.JData.layoutFlag = false
		}
		/**
		 *子ウインドウのサイズを再計算
		 *
		 * @param {boolean} flag true:強制再計算 false:必要があれば再計算
		 * @returns {boolean} 再計算の必要を行ったかどうか
		 * @memberof Window
		 */
		onMeasure(flag: boolean): boolean {
			let client = this.getClient()
			for (let i = 0; i < client.childNodes.length; i++) {
				let node = client.childNodes[i] as JNode
				if (node.dataset && node.dataset.type === "Window")
					(flag as any) |= node.Jsw.onMeasure(false) as any
			}
			if (!this.isAutoSize())
				return false;
			if (!flag && !this.JData.redraw) {
				return false;
			}
			this.JData.redraw = true
			this.getClient().style.width = 'auto'
			this.getClient().style.height = 'auto'
			this.setClientSize(this.getClient().scrollWidth, this.getClient().scrollHeight)
			return true;
		}
		/**
		 *親のクライアント領域を返す
		 *
		 * @returns
		 * @memberof Window
		 */
		getParentWidth() {
			const node = this.hNode
			if (node.style.position === 'fixed')
				return window.innerWidth
			let parent = node.parentNode as HTMLElement
			return parent.scrollWidth
		}
		/**
		 *親のクライアント領域を返す
		 *
		 * @returns
		 * @memberof Window
		 */
		getParentHeight() {
			const node = this.hNode
			if (node.style.position === 'fixed')
				return window.innerHeight
			let parent = node.parentNode as HTMLElement
			return parent.scrollHeight
		}
		/**
		 *位置やサイズの確定処理
		 *非同期で必要なときに呼び出されるので、基本的には直接呼び出さないこと
		 * @param {boolean} flag true:強制 false:必要なら
		 * @memberof Window
		 */
		onLayout(flag: boolean): void {
			if (flag || this.JData.redraw) {
				if (this.hNode.dataset.stat == 'maximize') {
					this.setPos(0, 0)
					this.setSize(this.getParentWidth(), this.getParentHeight())
				}

				this.JData.redraw = false
				this.hNode.style.left = this.JData.x + 'px'
				this.hNode.style.top = this.JData.y + 'px'
				this.hNode.style.width = this.JData.width + 'px'
				this.hNode.style.height = this.JData.height + 'px'
				flag = true

				Jsw.callEvent(this.hNode, 'layout')
			}
			//直下の子リスト
			let client = this.getClient()
			let nodes = []
			for (let i = 0; i < client.childNodes.length; i++) {
				let node = client.childNodes[i] as HTMLElement
				if (node.dataset && node.dataset.type === "Window")
					nodes.push(node)
			}
			let count = nodes.length

			//配置順序リスト
			nodes.sort(function (a: JNode, b: JNode) {
				let priority = { top: 10, bottom: 10, left: 8, right: 8, client: 5 }
				return priority[b.Jsw.JData.style] - priority[a.Jsw.JData.style]
			})

			const padding = this.JData.padding
			let width = this.getClientWidth()
			let height = this.getClientHeight()
			let x1 = padding.x1
			let y1 = padding.y1
			let x2 = x1 + width - padding.x2
			let y2 = y1 + height - padding.y2

			for (let i = 0; i < count; i++) {
				let child: JNode = nodes[i]
				let win = child.Jsw
				if (child.dataset.visible === 'false')
					continue
				const margin = win.JData.margin
				let px1 = x1 + margin.x1
				let py1 = y1 + margin.y1
				let px2 = x2 - margin.x2
				let py2 = y2 - margin.y2
				switch (child.Jsw.JData.style) {
					case "top":
						win.setPos(px1, py1)
						win.setWidth(px2 - px1)
						y1 += win.getHeight() + margin.y2
						break
					case "bottom":
						win.setPos(px1, py2 - win.getHeight())
						win.setWidth(px2 - px1)
						y2 = py2 - win.getHeight() - margin.y1
						break
					case "left":
						win.setPos(px1, py1)
						win.setHeight(y2 - y1 - margin.y1 - margin.y2)
						x1 += win.getWidth() + margin.x1 + margin.x2
						break
					case "right":
						win.setPos(px2 - win.getWidth(), py1)
						win.setHeight(py2 - py1)
						x2 = px2 - win.getWidth() - margin.x2
						break
					case "client":
						win.setPos(px1, py1)
						win.setSize(px2 - px1, py2 - py1)
						break
				}
				win.onLayout(flag)
			}


			this.JData.redraw = false
		}
		/**
		 *ウインドウの重ね合わせ順位を上位に持って行く
		 *
		 * @param {boolean} [flag] ウインドウをアクティブにするかどうか
		 * @memberof Window
		 */
		foreground(flag?: boolean): void {
			//親をフォアグラウンドに設定
			let activeNodes = new Set<HTMLElement>()
			let p = this.hNode
			activeNodes.add(p)
			while (p = p.parentNode as JNode) {
				activeNodes.add(p)
				if (p.Jsw)
					p.Jsw.foreground(flag)
			}


			if (flag || flag == null) {
				this.hNode.dataset.active = 'true'
				var activeWindows = document.querySelectorAll('[data-type="Window"][data-active="true"]')
				for (let i = 0, l = activeWindows.length; i < l; i++) {
					let w = activeWindows[i] as HTMLElement
					if (!activeNodes.has(w))
						w.dataset.active = 'false'
				}
			}

			//兄弟ウインドウの列挙しソート
			let childs = this.hNode.parentNode.childNodes
			let nodes = []
			for (let i = 0; i < childs.length; i++) {
				let node = childs[i] as HTMLElement
				if (node.dataset && node.dataset.type === "Window")
					nodes.push(node)
			}
			let node = this.hNode
			nodes.sort(function (a: JNode, b: JNode) {
				if (a.Jsw.JData.orderTop)
					return 1
				if (b.Jsw.JData.orderTop)
					return -1
				let layer = a.Jsw.JData.orderLayer - b.Jsw.JData.orderLayer
				if (layer)
					return layer

				if (a === node)
					return 1
				if (b === node)
					return -1
				return parseInt(a.style.zIndex) - parseInt(b.style.zIndex)
			})
			//Zオーダーの再附番
			for (let i = 0; i < nodes.length; i++) {
				nodes[i].style.zIndex = i
			}
		}

		/**
		 *クライアント領域のスクロールの可否
		 *
		 * @param {boolean} flag
		 * @memberof Window
		 */
		setScroll(flag: boolean): void {
			this.getClient().style.overflow = flag ? 'auto' : 'hidden'
		}
		/**
		 *クライアント領域のスクロールが有効かどうか
		 *
		 * @returns {boolean}
		 * @memberof Window
		 */
		isScroll(): boolean {
			return this.getClient().style.overflow === 'auto'
		}
		/**
		 *ウインドウを閉じる
		 *
		 * @memberof Window
		 */
		close(): void {
			function animationEnd() {
				let nodes = this.querySelectorAll('[data-type="Window"]') as JNode[]
				let count = nodes.length
				for (let i = 0; i < count; i++) {
					nodes[i].Jsw.layout()
				}
				if (this.parentNode)
					this.parentNode.removeChild(this)
				this.removeEventListener("animationend", animationEnd)

				let event = Jsw.createEvent("JSWclosed")
				this.dispatchEvent(event)
			}

			this.hNode.addEventListener("animationend", animationEnd)
			this.hNode.style.animation = "JSWclose 0.2s ease 0s 1 forwards"
		}
		/**
		 *絶対位置の取得
		 *
		 * @returns
		 * @memberof Window
		 */
		getAbsX() {
			var px = this.JData.x;
			var parent: Window = this;
			while (parent = parent.getParent()) {
				px += this.getClient().offsetLeft + parent.getClientX() + parent.JData.x;
			}
			return px;
		}
		/**
		*絶対位置の取得
		*
		* @returns
		* @memberof Window
		*/
		getAbsY() {
			var py = this.JData.y;
			var parent: Window = this;
			while (parent = parent.getParent()) {
				py += this.getClient().offsetTop + parent.getClientX() + parent.JData.y;
			}
			return py;
		}

		/**
		 *クライアントノードを返す
		 *WindowクラスはgetNode()===getClient()
		 *FrameWindowはgetNode()!==getClient()
		 * @returns {HTMLElement}
		 * @memberof Window
		 */
		getClient(): HTMLElement {
			return this.JData.clientArea
		}
		/**
		 *クライアント領域の基準位置を返す
		 *
		 * @returns
		 * @memberof Window
		 */
		getClientX(): number {
			return this.JData.padding.x1;
		}

		/**
		 *クライアント領域の基準位置を返す
		 *
		 * @returns
		 * @memberof Window
		 */
		getClientY(): number {
			return this.JData.padding.y1;
		}

		/**
		 *クライアントサイズを元にウインドウサイズを設定
		 *
		 * @param {number} width
		 * @param {number} height
		 * @memberof Window
		 */
		setClientSize(width: number, height: number) {
			this.setSize(
				this.getNode().offsetWidth - this.getClientWidth() + width,
				this.getNode().offsetHeight - this.getClientHeight() + height)

		}

		/**
		 *クライアントサイズを元にウインドウサイズを設定
		 *
		 * @param {number} width
		 * @memberof Window
		 */
		setClientWidth(width: number) {
			this.setWidth(this.getNode().offsetWidth - this.getClientWidth() + width)
		}
		/**
		 *クライアントサイズを元にウインドウサイズを設定
		 *
		 * @param {number} height
		 * @memberof Window
		 */
		setClientHeight(height: number) {
			this.setHeight(this.getNode().offsetHeight - this.getClientHeight() + height)
		}
		/**
		 *クライアントサイズを取得
		 *
		 * @returns {number}
		 * @memberof Window
		 */
		getClientWidth(): number {
			return this.getClient().clientWidth
		}
		/**
		 *クライアントサイズを取得
		 *
		 * @returns {number}
		 * @memberof Window
		 */
		getClientHeight(): number {
			return this.getClient().clientHeight
		}

		/**
		 *子ノードの追加
		 *
		 * @param {Window} child 子ウインドウ
		 * @param {('left' | 'right' | 'top' | 'bottom' | 'client' | null)} [style] ドッキング位置
		 * @memberof Window
		 */
		addChild(child: Window, style?: 'left' | 'right' | 'top' | 'bottom' | 'client' | null): void {
			child.setChildStyle(style)
			child.JData.parent = this
			this.getClient().appendChild(child.hNode)
			this.layout()
		}

		/**
		 *ドッキングスタイルの設定
		 *
		 * @param {('left' | 'right' | 'top' | 'bottom' | 'client' | null)} style ドッキング位置
		 * @memberof Window
		 */
		setChildStyle(style: 'left' | 'right' | 'top' | 'bottom' | 'client' | null): void {
			this.JData.style = style
			let parent = this.hNode.parentNode as JNode
			if (parent && parent.Jsw)
				parent.Jsw.layout()
		}
		/**
		 *子ウインドウを全て切り離す
		 *
		 * @memberof Window
		 */
		removeChildAll() {
			var client = this.getClient()
			var childList = client.childNodes;
			for (var i = childList.length - 1; i >= 0; i--) {
				var child = childList[i] as JNode
				if (child.dataset.type === "Window") {
					child.Jsw.JData.parent = null;
					client.removeChild(child);
				}
			}
			this.layout();
		}

		/**
		 *子ウインドウを切り離す
		 *
		 * @param {Window} child
		 * @returns
		 * @memberof Window
		 */
		removeChild(child: Window) {
			if (child.getParent() !== this)
				return;
			child.JData.parent = null;
			this.getClient().removeChild(child.hNode)
			this.layout();
		}
		/**
		 *自動サイズ調整の状態を取得
		 *
		 * @returns
		 * @memberof Window
		 */
		isAutoSize() {
			return this.getClient().dataset.scale === 'auto'
		}
		/**
		 *自動サイズ調整を設定
		 *
		 * @param {boolean} scale
		 * @memberof Window
		 */
		setAutoSize(scale: boolean) {
			this.getClient().dataset.scale = scale ? 'auto' : ''
		}
		/**
		 *タイトル設定
		 *
		 * @param {string} title
		 * @memberof Window
		 */
		setTitle(title: string): void {
			if (this.hNode.childNodes[8]) {
				this.hNode.childNodes[8].childNodes[0].textContent = title
			}
		}
		/**
		 *タイトル取得
		 *
		 * @returns {string}
		 * @memberof Window
		 */
		getTitle(): string {
			if (this.hNode.childNodes[8]) {
				return this.hNode.childNodes[8].childNodes[0].textContent
			}
			return ""
		}

		/**
		 *ウインドウの最大化
		 *
		 * @param {boolean} flag
		 * @memberof Window
		 */
		setMaximize(flag: boolean): void {
			let that = this
			function animationEnd() {
				this.style.minWidth = null
				this.style.minHeight = that.JData.titleSize + "px";
				this.removeEventListener("animationend", animationEnd)
			}
			if (this.hNode.dataset.stat != 'maximize') {
				this.JData.normalX = this.JData.x
				this.JData.normalY = this.JData.y
				this.JData.normalWidth = this.JData.width
				this.JData.normalHeight = this.JData.height
				this.hNode.dataset.stat = 'maximize'
				this.hNode.style.minWidth = this.JData.width + "px"
				this.hNode.style.minHeight = this.JData.height + "px"
				this.hNode.style.animation = "JSWmaximize 0.2s ease 0s 1 forwards"
				this.hNode.addEventListener("animationend", animationEnd)
			} else {
				this.JData.x = this.JData.normalX
				this.JData.y = this.JData.normalY
				this.JData.width = this.JData.normalWidth
				this.JData.height = this.JData.normalHeight
				this.hNode.dataset.stat = 'normal'
				this.hNode.style.animation = "JSWmaxrestore 0.2s ease 0s 1 forwards"
			}
			if (flag) {
				let icon = this.hNode.querySelector("*>[data-type=title]>[data-type=icon][data-kind=max]") as HTMLElement
				if (icon)
					icon.dataset.kind = "normal"
			} else {
				let icon = this.hNode.querySelector("*>[data-type=title]>[data-type=icon][data-kind=normal]") as HTMLElement
				if (icon)
					icon.dataset.kind = "max"
			}

			this.layout()
		}

		/**
		 *ウインドウの最小化
		 *
		 * @param {boolean} flag
		 * @memberof Window
		 */
		setMinimize(flag: boolean): void {
			var that = this
			this.hNode.addEventListener("animationend", function () { that.layout() })
			if (this.hNode.dataset.stat != 'minimize') {

				//client.style.animation="Jswminimize 0.2s ease 0s 1 forwards"
				this.hNode.style.animation = "JSWminimize 0.2s ease 0s 1 forwards"
				this.hNode.dataset.stat = 'minimize'
			} else {
				//client.style.animation="Jswrestore 0.2s ease 0s 1 backwards"
				this.hNode.style.animation = "JSWrestore 0.2s ease 0s 1 forwards"
				this.hNode.dataset.stat = 'normal'
			}
			if (flag) {
				let icon = this.hNode.querySelector("*>[data-type=title]>[data-type=icon][data-kind=min]") as HTMLElement
				icon.dataset.kind = "restore"
			} else {
				let icon = this.hNode.querySelector("*>[data-type=title]>[data-type=icon][data-kind=restore]") as HTMLElement
				icon.dataset.kind = "min"
			}
			this.JData.minimize = flag
			this.layout()
		}


	}
	/**
	 *フレームウインドウクラス
	 *
	 * @export
	 * @class FrameWindow
	 * @extends {Window}
	 */
	export class FrameWindow extends Window {
		constructor(param?) {
			let p = { frame: true, title: true, layer: 10 }
			if (param)
				Object.assign(p, param)
			super(p)
			this.setOverlap(true)
		}
	}

	interface JSWSPLITDATA {
		overlay
		overlayOpen
		overlayMove
		splitterThick
		splitterPos
		splitterType
		pos
		type
		childList: Window[]
	}

	/**
	 *分割ウインドウ用クラス
	 *
	 * @export
	 * @class Splitter
	 * @extends {Window}
	 */
	export class Splitter extends Window {
		JDataSplit: JSWSPLITDATA = {} as any
		/**
		 *Creates an instance of Splitter.
		 * @param {number} [splitPos]
		 * @param {('ns'|'sn'|'ew'|'we')} [splitType] 分割領域のタイプ
		 * @memberof Splitter
		 */
		constructor(splitPos?: number, splitType?: 'ns' | 'sn' | 'ew' | 'we') {
			super()
			this.setSize(640, 480)
			this.JDataSplit.overlay = false
			this.JDataSplit.overlayOpen = true
			this.JDataSplit.overlayMove = 0
			this.JDataSplit.splitterThick = 10
			this.JDataSplit.splitterPos = (splitPos == null ? 100 : splitPos)
			this.getNode().dataset.splitterType = (splitType == null ? "we" : splitType)
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
			that.getNode().addEventListener("layout", function () {
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
				this.slideTimeout()
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
				if (this.JData.overlayOpen) {
					this.JData.overlayMove += 0.1
					if (this.JData.overlayMove >= 1) {
						this.JData.overlayMove = 1
						this.JData.overlayOpen = false
						clearInterval(this.slideHandle)
						this.slideHandle = null
					}
				} else {
					this.JData.overlayMove -= 0.1
					if (this.JData.overlayMove < 0) {
						this.JData.overlayMove = 0
						this.JData.overlayOpen = true
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
					if (this.JData.overlayOpen) {
						this.slide()
						this.slideTimeoutHandle = null
					}
				}, 3000)
			}
			if (e)
				e.preventDefault()
		}
	}
	export class Panel extends Window {
		constructor() {
			super()
			this.setHeight(32)
			let node = this.getClient()
			node.dataset.kind = 'Panel'
		}
	}
	export interface TREEVIEW_EVENT_SELECT extends Event {
		params: {
			item: TreeItem
		}
	}
	export interface TREEVIEW_EVENT_DROP extends Event {
		params: {
			item: TreeItem
			event: DragEvent
		}
	}
	export interface TREEVIEW_EVENT_DRAG_START extends Event {
		params: {
			item: TreeItem
			event: DragEvent
		}
	}
	export interface TREEVIEW_EVENT_OPEN extends Event {
		params: {
			item: TreeItem
			opened: boolean
		}
	}

	/**
	 *
	 *
	 * @export
	 * @class TreeItem
	 */
	export class TreeItem {
		private hNode: HTMLElement
		private childNode: HTMLElement
		private opened: boolean
		private body: HTMLElement
		private value: any
		private keys = {}
		/**
		 *Creates an instance of TreeItem.
		 * @param {string} [label]
		 * @param {boolean} [opened]
		 * @memberof TreeItem
		 */
		constructor(label?: |string, opened?: boolean) {
			let that = this
			let hNode = document.createElement('div') as any
			this.hNode = hNode
			hNode.treeItem = this
			hNode.dataset.kind = 'TreeItem'
			let row1 = document.createElement('div')
			row1.dataset.kind = 'TreeRow'
			hNode.appendChild(row1)
			row1.addEventListener("click", function () {
				that.selectItem();
			});
			row1.addEventListener('dragstart', function (e) {
				that.getTreeView().callEvent('itemDragStart', { item: that, event: e })
			})
			row1.addEventListener('dragleave', function () {
				row1.dataset.drag = ''
			})
			row1.addEventListener('dragenter', function () {
				row1.dataset.drag = 'over'
				event.preventDefault()
			})
			row1.addEventListener('dragover', function () {
				//row1.dataset.drag = 'over'
				event.preventDefault()
			})
			row1.addEventListener('drop', function (e) {
				that.getTreeView().callEvent('itemDrop', { event: e, item: that })
				row1.dataset.drag = ''
				event.preventDefault()
			})
			let icon = document.createElement('div')
			icon.dataset.kind = 'TreeIcon'
			row1.appendChild(icon)
			icon.addEventListener("click", function (e) {
				that.openItem(!that.opened);
				e.preventDefault();
				e.stopPropagation()
			});

			let body = document.createElement('div')
			this.body = body
			row1.appendChild(body)
			body.textContent = label != null ? label : ''
			body.draggable = true


			let row2 = document.createElement('div')
			row2.dataset.kind = 'TreeRow'
			hNode.appendChild(row2)
			let child = document.createElement('div')
			this.childNode = child
			child.dataset.kind = 'TreeChild'
			row2.appendChild(child)

			this.openItem(opened)
		}
		/**
		 *アイテムのノードを返す
		 *
		 * @returns {HTMLElement}
		 * @memberof TreeItem
		 */
		getNode(): HTMLElement {
			return this.hNode
		}
		/**
		 *アイテムのラベル部分のノードを返す
		 *
		 * @returns {HTMLElement}
		 * @memberof TreeItem
		 */
		getBody(): HTMLElement {
			return this.body
		}
		/**
		 *アイテムに対してキーを関連付ける
		 *
		 * @param {string} name
		 * @param {*} value
		 * @memberof TreeItem
		 */
		setKey(name: string, value) {
			this.keys[name] = value
		}
		/**
		 *アイテムのキーを取得する
		 *
		 * @param {string} name
		 * @returns
		 * @memberof TreeItem
		 */
		getKey(name: string) {
			return this.keys[name];
		}
		/**
		 *アイテムを追加する
		 *
		 * @param {*} [label] ラベル
		 * @param {boolean} [opened] オープン状態
		 * @returns {TreeItem} 追加したアイテム
		 * @memberof TreeItem
		 */
		addItem(label?, opened?: boolean): TreeItem {
			let name
			let value = null
			if (label instanceof Array) {
				name = label[0]
				value = label[1]
			} else {
				name = label;
			}
			let item = new TreeItem(name, opened)
			if (value != null)
				item.setItemValue(value)
			this.childNode.appendChild(item.getNode())
			this.openItem(this.opened, false)
			return item
		}
		/**
		 *子アイテムを全てクリア
		 *
		 * @memberof TreeItem
		 */
		clearItem() {
			let childs = this.childNode.childNodes;
			while (childs.length) {
				this.childNode.removeChild(childs[0]);
			}
			this.openItem(this.opened)
		}
		/**
		 *自分自身を親から切り離す
		 *
		 * @memberof TreeItem
		 */
		removeItem() {
			let treeView = this.getTreeView()
			if (this !== treeView.getRootItem() && this.hNode.parentNode)
				this.hNode.parentNode.removeChild(this.hNode);
		}
		/**
		 *子アイテムの数を返す
		 *
		 * @returns {number}
		 * @memberof TreeItem
		 */
		getChildCount(): number {
			return this.childNode.childElementCount;
		}
		/**
		 *アイテムに関連付ける値を設定
		 *
		 * @param {*} value
		 * @memberof TreeItem
		 */
		setItemValue(value) {
			this.value = value;
		}
		/**
		 *アイテムに関連付けた値を取得
		 *
		 * @returns {*}
		 * @memberof TreeItem
		 */
		getItemValue(): any {
			return this.value;
		}
		/**
		 *アイテムのラベルを設定
		 *
		 * @param {string} value
		 * @memberof TreeItem
		 */
		setItemText(value: string) {
			this.body.textContent = value;
		}
		/**
		 *アイテムのラベルを取得
		 *
		 * @returns {string}
		 * @memberof TreeItem
		 */
		getItemText(): string {
			return this.body.textContent;
		}
		/**
		 *子アイテムを取得
		 *
		 * @param {number} index
		 * @returns {TreeItem}
		 * @memberof TreeItem
		 */
		getChildItem(index: number): TreeItem {
			return (this.childNode.childNodes[index] as any).treeItem as TreeItem;
		}
		/**
		 *親アイテムを取得
		 *
		 * @returns {TreeItem}
		 * @memberof TreeItem
		 */
		getParentItem(): TreeItem {
			let parent = this.hNode.parentNode.parentNode.parentNode as any
			if (parent.dataset.kind === 'TreeItem')
				return parent.treeItem
			return null
		}
		/**
		 *自分を含めた階層から値を参照してアイテムを探す
		 *
		 * @param {*} value
		 * @returns {TreeItem}
		 * @memberof TreeItem
		 */
		findItemFromValue(value): TreeItem {
			if (this.getItemValue() == value)
				return this;
			var nodes = this.childNode.childNodes;
			var count = nodes.length;
			for (var i = 0; i < count; i++) {
				var child = (nodes[i] as any).treeItem as TreeItem;
				var f = child.findItemFromValue(value);
				if (f != null)
					return f;
			}
			return null
		}
		/**
		 *ツリーを展開する
		 *
		 * @param {boolean} opened
		 * @param {boolean} [anime]
		 * @memberof TreeItem
		 */
		openItem(opened: boolean, anime?: boolean) {
			let flag = this.opened !== opened;
			this.opened = opened;
			if (this.getChildCount() == 0)
				this.hNode.dataset.stat = "alone";
			else {
				this.hNode.dataset.stat = opened ? "open" : "close";
				if (opened) {
					var items = this.hNode.querySelectorAll("[data-kind=TreeItem][data-stat=open] > [data-kind=TreeRow]:nth-child(2) > [data-kind=TreeChild] > [data-kind=TreeItem]");
					for (var i = 0; i < items.length; i++) {
						var n = items[i] as HTMLElement;
						n.style.animation = "treeOpen 0.3s ease 0s 1 normal";
						n.style.display = 'block';
					}
				} else {
					var items = this.childNode.querySelectorAll("[data-kind=TreeItem]");
					for (var i = 0; i < items.length; i++) {
						var n = items[i] as HTMLElement;
						if (anime === false)
							n.style.animation = "treeClose forwards";
						else
							n.style.animation = "treeClose 0.8s ease 0s 1 forwards";
					}
				}
			}
			if (flag) {
				let treeView = this.getTreeView()
				if (treeView)
					treeView.callEvent('itemOpen', { item: this, opened: opened })
			}
		}
		/**
		 *アイテムを選択する
		 *
		 * @memberof TreeItem
		 */
		selectItem(scroll?: boolean) {
			let treeView = this.getTreeView()
			treeView.selectItem(this, scroll)
		}
		/**
		 *所属先のTreeViewを返す
		 *
		 * @returns {TreeView}
		 * @memberof TreeItem
		 */
		getTreeView(): TreeView {
			var node = this.hNode
			while (node && node.dataset.kind !== 'TreeView')
				node = node.parentElement;
			if (node)
				return (node as any).treeView
			return null
		}

	}

	/**
	 *TreeView用クラス
	 *
	 * @export
	 * @class TreeView
	 * @extends {Window}
	 */
	export class TreeView extends Window {

		private mRootItem: TreeItem
		private mSelectItem: TreeItem
		/**
		 *Creates an instance of TreeView.
		 * @memberof TreeView
		 */
		constructor(params?) {
			super(params)
			let client = this.getClient() as any
			client.dataset.kind = 'TreeView'
			client.treeView = this

			let item = new TreeItem('root', true)
			this.mRootItem = item
			client.appendChild(item.getNode())
		}

		/**
		 * 設定されている相対を条件にアイテムを検索
		 *
		 * @param {*} value
		 * @returns {TreeItem}
		 * @memberof TreeView
		 */
		findItemFromValue(value): TreeItem {
			return this.mRootItem.findItemFromValue(value)
		}
		/**
		 *最上位のアイテムを返す
		 *
		 * @returns {TreeItem}
		 * @memberof TreeView
		 */
		getRootItem(): TreeItem {
			return this.mRootItem
		}
		/**
		 *最上位の子としてアイテムを追加する
		 *
		 * @param {*} [label]
		 * @param {boolean} [opened]
		 * @returns {TreeItem}
		 * @memberof TreeView
		 */
		addItem(label?, opened?: boolean): TreeItem {
			return this.mRootItem.addItem(label, opened)
		}
		/**
		 *アイテムを全て削除する
		 *
		 * @memberof TreeView
		 */
		clearItem() {
			this.mRootItem.clearItem()
			this.mRootItem.setItemText('root')
			this.mRootItem.setItemValue(null)
		}
		/**
		 *アイテムを選択する
		 *子アイテムが使用するので基本的には直接呼び出さない
		 * @param {TreeItem} item 選択するアイテム
		 * @memberof TreeView
		 */
		selectItem(item: TreeItem, scroll?: boolean) {
			const that = this
			function animationEnd() {
				this.removeEventListener('animationend', animationEnd)
				that.getClient().scrollTo(0, item.getNode().offsetTop - that.getClientHeight() / 2)
			}

			if (this.mSelectItem !== item) {
				if (this.mSelectItem)
					this.mSelectItem.getNode().dataset.select = 'false'
				item.getNode().dataset.select = 'true'
				this.mSelectItem = item;

				item.openItem(true)
				let parent: TreeItem = item
				while (parent = parent.getParentItem()) {
					parent.openItem(true)
				}
				if (scroll) {
					this.getClient().scrollTo(0, item.getNode().offsetTop - this.getClientHeight() / 2)
					item.getNode().addEventListener('animationend', animationEnd)
				}


			}
			this.callEvent('itemSelect', { item: item })
		}
		/**
		 * 設定されている値を条件にアイテムを選択
		 *
		 * @param {*} value
		 * @memberof TreeView
		 */
		selectItemFromValue(value) {
			let item = this.mRootItem.findItemFromValue(value)
			if (item)
				item.selectItem()
		}
		/**
		 *選択されているアイテムを返す
		 *
		 * @returns 選択されているアイテム
		 * @memberof TreeView
		 */
		getSelectItem() {
			return this.mSelectItem
		}
		/**
		 *選択されているアイテムの値を返す
		 *
		 * @returns
		 * @memberof TreeView
		 */
		getSelectItemValue() {
			if (!this.mSelectItem)
				return null
			return this.mSelectItem.getItemValue()
		}

		/**
		 *アイテムツリーが展開されら発生する
		 *
		 * @param {'itemOpen'} type
		 * @param {(event:TREEVIEW_EVENT_OPEN)=>void} callback
		 * @memberof TreeView
		 */
		addEventListener(type: 'itemOpen', callback: (event: TREEVIEW_EVENT_OPEN) => void): void;
		/**
		 *アイテムが選択されたら発生
		 *
		 * @param {'itemSelect'} type
		 * @param {(event:TREEVIEW_EVENT_SELECT)=>void} callback
		 * @memberof TreeView
		 */
		addEventListener(type: 'itemSelect', callback: (event: TREEVIEW_EVENT_SELECT) => void): void
		/**
		 *アイテムにドラッグドロップされたら発生
		 *
		 * @param {'itemDrop'} type
		 * @param {(event: TREEVIEW_EVENT_DROP) => void} callback
		 * @memberof TreeView
		 */
		addEventListener(type: 'itemDrop', callback: (event: TREEVIEW_EVENT_DROP) => void): void
		addEventListener(type: 'itemDragStart', callback: (event: TREEVIEW_EVENT_DRAG_START) => void): void
		addEventListener(type: string, callback: any, options?) {
			super.addEventListener(type, callback, options)
		}

	}

	interface LISTVIEW_EVENT_ITEM_CLICK extends Event {
		params: {
			itemIndex: number
			subItemIndex: number
			event: MouseEvent
		}
	}
	interface LISTVIEW_EVENT_DRAG_START extends Event {
		params: {
			itemIndex: number
			subItemIndex: number
			event: DragEvent
		}
	}

	/**
	 *ListView用クラス
	*
	* @export
	* @class ListView
	* @extends {Window}
	*/
	export class ListView extends Window {
		headerArea: HTMLElement
		headerBack: HTMLElement
		headers: HTMLElement
		resizers: HTMLElement
		itemArea: HTMLElement
		itemColumn: HTMLElement
		overIndex: number
		lastIndex: number = 0
		selectIndexes: number[] = []
		sortIndex: number = -1
		sortVector: boolean = false
		columnWidth: number[] = []
		columnAutoIndex: number = -1
		areaWidth: number = 0

		/**
		 *Creates an instance of ListView.
		 * @param {*} [params] ウインドウ作成パラメータ
		 * @memberof ListView
		 */
		constructor(params?) {
			super(params)
			const that = this
			var client = this.getClient()
			client.dataset.kind = 'ListView'

			var headerBack = document.createElement('div')
			this.headerBack = headerBack
			headerBack.dataset.kind = 'ListHeaderBack'
			client.appendChild(headerBack)

			var headerArea = document.createElement('div')
			this.headerArea = headerArea
			headerArea.dataset.kind = 'ListHeaderArea'
			client.appendChild(headerArea)

			var resizers = document.createElement('div')
			this.resizers = resizers
			resizers.dataset.kind = 'ListResizers'
			headerArea.appendChild(resizers)

			var headers = document.createElement('div')
			this.headers = headers
			headers.dataset.kind = 'ListHeaders'
			headerArea.appendChild(headers)


			var itemArea = document.createElement('div')
			itemArea.dataset.kind = 'ListItemArea'
			this.itemArea = itemArea
			client.appendChild(itemArea)

			client.addEventListener('scroll', function () {
				itemArea.style.left = this.scrollLeft + 'px'
				if (itemArea.childElementCount) {
					let column = itemArea.childNodes[0] as HTMLElement
					column.style.marginLeft = -this.scrollLeft + 'px'
					headerBack.style.marginLeft = this.scrollLeft + 'px'
				}
			})

			client.addEventListener('dragover', function () {
				event.preventDefault()
			})
			client.addEventListener('drop', function (e) {
				that.callEvent('itemDrop', { itemIndex: -1, subItemIndex: -1, event: e })
				event.preventDefault()
			})

		}
		/**
		 *カラムのサイズを設定
		 *
		 * @param {number} index
		 * @param {number} size
		 * @memberof ListView
		 */
		setColumnWidth(index: number, size: number) {
			this.columnWidth[index] = size;
			(this.headers.children[index] as HTMLElement).style.width = size + 'px'
			this.resize()
		}
		/**
		 *カラムのスタイルを設定
		 *
		 * @param {number} col カラム番号
		 * @param {('left'|'right'|'center')} style スタイル
		 * @memberof ListView
		 */
		setColumnStyle(col: number, style: 'left' | 'right' | 'center') {
			let columns = this.itemArea.childNodes as any
			let column = columns[col]
			column.style.justifyContent = style
		}
		/**
		 *カラムのスタイルを複数設定
		 *
		 * @param {(('left' | 'right' | 'center')[])} styles スタイル
		 * @memberof ListView
		 */
		setColumnStyles(styles: ('left' | 'right' | 'center')[]) {
			let columns = this.itemArea.childNodes as any
			for (let i = 0, l = styles.length; i < l; i++) {
				let column = columns[i]
				column.vector = styles[i]
			}
		}
		/**
		 *ヘッダを追加
		 *配列にすると複数追加でき、さらに配列を含めるとサイズが指定できる
		 * @param {(string|(string|[string,number])[])} labels ラベル | [ラベル,ラベル,・・・] | [[ラベル,幅],[ラベル,幅],・・・]
		 * @param {number} [size] 幅
		 * @memberof ListView
		 */
		addHeader(label: string | (string | [string, number])[], size?: number) {
			var headers = this.headers

			let labels: (string | [string, number])[] = []
			if (label instanceof Array)
				labels = label
			else
				labels = [label]


			for (let i = 0, l = labels.length; i < l; i++) {
				let label = labels[i]
				let text: string
				let width = size
				if (label instanceof Array) {
					text = label[0]
					width = label[1]
				} else {
					text = label
				}

				var index = headers.childElementCount
				var header = document.createElement('div')
				headers.appendChild(header)
				header.textContent = text
				if (width != null) {
					this.columnWidth[index] = width
					header.style.width = width + 'px'
				} else {
					this.columnWidth[index] = header.offsetWidth
				}


				let that = this
				//ヘッダが押されたらソート処理
				header.addEventListener('click', function () {
					let j
					for (j = 0; j < headers.childElementCount; j++) {
						if (headers.childNodes[j] === this)
							break;
					}
					let sort = true
					if (that.sortIndex === j)
						sort = !that.sortVector
					that.sortItem(j, sort)
				})

				var itemArea = this.itemArea;
				var column = document.createElement('div')
				column.dataset.kind = 'ListColumn'
				this.itemArea.appendChild(column)

				//リサイズバーの設定
				var resizers = this.resizers
				let resize: any = document.createElement('div')
				resize.index = index
				resizers.appendChild(resize)
				Jsw.enableMove(resize)
				resize.addEventListener("move", function (e) {
					let p = e.params as MovePoint
					let x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
					let h = headers.childNodes[this.index] as HTMLElement
					let width = x - h.offsetLeft
					h.style.width = width + 'px'
					that.columnWidth[this.index] = width

					for (let i = this.index, length = resizers.childElementCount; i < length; i++) {
						let node = headers.children[i] as HTMLElement
						var r = resizers.childNodes[i] as HTMLElement
						r.style.left = node.offsetLeft + node.offsetWidth + 'px'

						let column = itemArea.children[i] as HTMLElement
						column.style.width = node.clientLeft + node.offsetWidth - column.clientLeft + 'px'
					}

				});
			}
		}

		/**
		 *アイテムのソートを行う
		 *
		 * @param {number} [index] カラム番号
		 * @param {boolean} [order] 方向 true:昇順 false:降順
		 * @memberof ListView
		 */
		sortItem(index?: number, order?: boolean) {
			this.clearSelectItem()

			if (index != null) {
				this.sortIndex = index
				order = order == null ? true : order
				this.sortVector = order
				var headers = this.headers;
				for (let i = 0, length = headers.childElementCount; i < length; i++) {
					if (index === i)
						(headers.childNodes[i] as HTMLElement).dataset.sort = order ? 'asc' : 'desc'
					else
						(headers.childNodes[i] as HTMLElement).dataset.sort = ''
				}
			}

			index = this.sortIndex
			order = this.sortVector
			let columns = this.itemArea.childNodes as any
			let column = columns[index]
			let items = column.childNodes
			//ソートリストの作成
			let sortList = []
			for (let i = 0, length = items.length; i < length; i++) {
				sortList.push(i)
			}
			sortList.sort(function (a, b) {
				let v1 = items[a].keyValue != null ? items[a].keyValue : items[a].textContent
				let v2 = items[b].keyValue != null ? items[b].keyValue : items[b].textContent
				return (v1 > v2 ? 1 : -1) * (order ? 1 : -1)
			})
			//ソート処理
			for (let i = 0, length = columns.length; i < length; i++) {
				let column = columns[i] as HTMLElement
				//子ノードの保存と削除
				let items = []
				while (column.childElementCount) {
					items.push(column.childNodes[0])
					column.removeChild(column.childNodes[0])
				}
				//子ノードの再追加
				for (let j = 0, length = sortList.length; j < length; j++) {
					column.appendChild(items[sortList[j]])
				}

			}

		}
		/**
		 *アイテムを選択する
		 *すでにある選択は解除される
		 * @param {(number | number[])} index レコード番号
		 * @memberof ListView
		 */
		selectItem(index: number | number[]) {
			this.clearSelectItem()
			this.addSelectItem(index)
		}
		/**
		 *アイテムの選択を全て解除する
		 *
		 * @memberof ListView
		 */
		clearSelectItem() {
			let columns = this.itemArea.childNodes as any
			for (let i = 0, length = columns.length; i < length; i++) {
				let column = columns[i]
				for (let j = 0, l = this.selectIndexes.length; j < l; j++) {
					column.childNodes[this.selectIndexes[j]].dataset.itemSelect = 'false'
				}
			}
			this.selectIndexes = []
		}
		/**
		 *アイテムの選択を追加する
		 *
		 * @param {(number | number[])} index レコード番号
		 * @memberof ListView
		 */
		addSelectItem(index: number | number[]) {
			let indexes = (index instanceof Array ? index : [index]) as number[]
			Array.prototype.push.apply(this.selectIndexes, indexes);

			let columns = this.itemArea.childNodes as any
			for (let i = 0, length = columns.length; i < length; i++) {
				let column = columns[i]

				for (let j = 0, l = this.selectIndexes.length; j < l; j++) {
					column.childNodes[this.selectIndexes[j]].dataset.itemSelect = 'true'
				}
			}
		}
		/**
		 *アイテムの選択を解除する
		 *
		 * @param {(number | number[])} index レコード番号
		 * @memberof ListView
		 */
		delSelectItem(index: number | number[]) {
			let indexes = (typeof index === 'object' ? index : [index]) as number[]
			let columns = this.itemArea.childNodes as any
			for (let i = 0, length = columns.length; i < length; i++) {
				let column = columns[i]

				for (let j = 0, l = indexes.length; j < l; j++) {
					column.childNodes[indexes[j]].dataset.itemSelect = 'false'
				}
			}
			let newIndexes = []
			for (let j = 0, l = this.selectIndexes.length; j < l; j++) {
				let index = this.selectIndexes[j]
				if (indexes.indexOf(index) < 0)
					newIndexes.push(index)
			}
			this.selectIndexes = newIndexes
		}
		/**
		 *アイテムが選択されているか返す
		 *
		 * @param {number} index レコード番号
		 * @returns {boolean}
		 * @memberof ListView
		 */
		isSelectItem(index: number): boolean {
			return this.selectIndexes.indexOf(index) >= 0
		}
		private static getIndexOfNode(node: HTMLElement) {
			return [].slice.call(node.parentNode.childNodes).indexOf(node)
		}
		/**
		 *アイテムを全て削除する
		 *
		 * @memberof ListView
		 */
		clearItem() {
			this.selectIndexes = []
			let columns = this.itemArea.childNodes as any
			for (let i = 0, length = columns.length; i < length; i++) {
				let column = columns[i];
				while (column.childElementCount)
					column.removeChild(column.childNodes[0])
			}
		}
		/**
		 *対象セルのノードを取得
		 *
		 * @param {number} row
		 * @param {number} col
		 * @returns
		 * @memberof ListView
		 */
		getCell(row: number, col: number) {
			let columns = this.itemArea.childNodes as any
			let column = columns[col]
			if (column == null)
				return null
			return column.childNodes[row]
		}
		/**
		 *アイテムに値を設定する
		 *
		 * @param {number} index レコード番号
		 * @param {*} value 値
		 * @memberof ListView
		 */
		setItemValue(index: number, value) {
			let cell = this.getCell(index, 0)
			if (cell)
				cell.value = value
		}
		/**
		 *アイテムの値を取得する
		 *
		 * @param {number} index レコード番号
		 * @returns 値
		 * @memberof ListView
		 */
		getItemValue(index: number) {
			let cell = this.getCell(index, 0)
			return cell.value
		}
		/**
		 *最初に選択されているアイテムを返す
		 *
		 * @returns {number}
		 * @memberof ListView
		 */
		getSelectItem(): number {
			for (let index of this.selectIndexes) {
				return index
			}
			return -1
		}
		/**
		 *選択されている値を全て取得する
		 *
		 * @returns {any[]}
		 * @memberof ListView
		 */
		getSelectValues(): any[] {
			let values = []
			for (let index of this.selectIndexes) {
				values.push(this.getItemValue(index))
			}
			return values
		}
		/**
		 *指定行のセルノードを返す
		 *
		 * @param {number} row
		 * @returns
		 * @memberof ListView
		 */
		getLineCells(row: number) {
			let cells = []
			let columns = this.itemArea.childNodes as any
			for (let i = 0, length = columns.length; i < length; i++) {
				let column = columns[i];
				cells.push(column.childNodes[row])
			}
			return cells
		}
		/**
		 *アイテムを追加する
		 *アイテムはテキストかノードが指定できる
		 *配列を渡した場合は、複数追加となる
		 * @param {(string|(string|HTMLElement)[])} value テキストもしくはノード
		 * @returns
		 * @memberof ListView
		 */
		addItem(value: string | HTMLElement | (string | HTMLElement)[]) {
			const vector = { left: 'flex-start', center: 'center', right: 'flex-end' }
			let that = this
			let columns = this.itemArea.childNodes as any
			for (let i = 0, length = columns.length; i < length; i++) {
				let column = columns[i];
				let cell = document.createElement('div')
				cell.draggable = true
				cell.dataset.kind = 'ListCell'

				if (column.vector)
					cell.style.justifyContent = vector[column.vector]
				column.appendChild(cell)
				cell.addEventListener('mouseover', function () {
					let index = ListView.getIndexOfNode(this)
					for (let i = 0, length = columns.length; i < length; i++) {
						let column = columns[i]
						if (that.overIndex != null && that.overIndex < column.childElementCount) {
							column.childNodes[that.overIndex].dataset.itemHover = 'false'
						}
						column.childNodes[index].dataset.itemHover = 'true'
					}
					that.overIndex = index
				})
				cell.addEventListener('dragstart', function (e) {
					let index = ListView.getIndexOfNode(this)
					let index2 = ListView.getIndexOfNode(this.parentNode as HTMLElement)
					that.callEvent('itemDragStart', { itemIndex: index, subItemIndex: index2, event: e })
				})
				cell.addEventListener('dragleave', function () {
					let index = ListView.getIndexOfNode(this)
					let cells = that.getLineCells(index)
					for (let cell of cells) {
						cell.dataset.drag = ''
					}
				})
				cell.addEventListener('dragenter', function () {
					let index = ListView.getIndexOfNode(this)
					let cells = that.getLineCells(index)
					for (let cell of cells) {
						cell.dataset.drag = 'over'
					}
					event.preventDefault()
				})
				cell.addEventListener('dragover', function () {
					event.preventDefault()
				})
				cell.addEventListener('drop', function (e) {
					let index = ListView.getIndexOfNode(this)
					let index2 = ListView.getIndexOfNode(this.parentNode as HTMLElement)
					let cells = that.getLineCells(index)
					for (let cell of cells) {
						cell.dataset.drag = 'over'
					}
					that.callEvent('itemDrop', { itemIndex: index, subItemIndex: index2, event: e })
					event.preventDefault()
				})
				cell.addEventListener('dragstart', function (e) {
					let index = ListView.getIndexOfNode(this)
					let index2 = ListView.getIndexOfNode(this.parentNode as HTMLElement)
					that.callEvent('itemDragStart', { itemIndex: index, subItemIndex: index2, event: e })
				})
				cell.addEventListener('click', function (e) {
					let index = ListView.getIndexOfNode(this)
					let index2 = ListView.getIndexOfNode(this.parentNode as HTMLElement)
					if (e.ctrlKey) {
						if (!that.isSelectItem(index))
							that.addSelectItem(index)
						else
							that.delSelectItem(index)
					} else if (e.shiftKey) {
						let indexes = [] as number[];
						let s = Math.min(that.lastIndex, index)
						let e = Math.max(that.lastIndex, index)
						for (let i = s; i <= e; i++)
							indexes.push(i)
						that.selectItem(indexes)

					} else
						that.selectItem(index)
					that.lastIndex = index

					that.callEvent('itemClick', { itemIndex: index, subItemIndex: index2, event: e })
				})
				cell.addEventListener('dblclick', function (e) {
					let index = ListView.getIndexOfNode(this)
					let index2 = ListView.getIndexOfNode(this.parentNode as HTMLElement)
					that.callEvent('itemDblClick', { itemIndex: index, subItemIndex: index2, event: e })
				})
			}
			if (columns.length === 0)
				return -1
			let index = columns[0].childElementCount - 1
			if (value instanceof Array) {
				for (let i = 0, l = value.length; i < l; i++) {
					this.setItem(index, i, value[i])
				}
			}
			else
				this.setItem(index, 0, value)

			if(this.areaWidth !== this.itemArea.clientWidth){
				this.areaWidth = this.itemArea.clientWidth
				this.resize()
			}
			return index
		}
		/**
		 *ソート用のキーを設定する
		 *
		 * @param {number} row レコード番号
		 * @param {number} column カラム番号
		 * @param {*} value キー
		 * @returns
		 * @memberof ListView
		 */
		setSortKey(row: number, column: number, value: any) {
			let c = this.itemArea.childNodes[column]
			if (c == null)
				return false
			let r = c.childNodes[row]
			if (r == null)
				return false;
			(r as any).keyValue = value
			return true
		}
		/**
		 *ソート用のキーをまとめて設定する
		 *
		 * @param {number} row レコード番号
		 * @param {any[]} values キー配列
		 * @memberof ListView
		 */
		setSortKeys(row: number, values: any[]) {
			for (let i = 0, l = values.length; i < l; i++) {
				let c = this.itemArea.childNodes[i]
				if (c == null)
					break
				let r = c.childNodes[row]
				if (r == null)
					break
				(r as any).keyValue = values[i]
			}
		}
		/**
		 *アイテムを書き換える
		 *
		 * @param {number} row レコード番号
		 * @param {number} column カラム番号
		 * @param {(string|HTMLElement)} value テキストもしくはノード
		 * @returns
		 * @memberof ListView
		 */
		setItem(row: number, column: number, value: string | HTMLElement) {
			let c = this.itemArea.childNodes[column]
			if (c == null)
				return false
			let r = c.childNodes[row]
			if (r == null)
				return false
			if (!(value instanceof HTMLElement)) {
				var item = document.createElement('div')
				item.textContent = value
				r.appendChild(item)
			} else {
				r.appendChild(value)
			}
		}
		/**
		 *ヘッダに合わせてカラムサイズを調整する
		 *基本的には直接呼び出さない
		 * @memberof ListView
		 */
		resize() {
			var headers = this.headers
			var resizers = this.resizers
			var itemArea = this.itemArea
			var lmitWidth = itemArea.clientWidth
			for (let i = 0, length = headers.childElementCount; i < length; i++) {
				lmitWidth -= this.columnWidth[i]
			}
			const autoIndex = this.columnAutoIndex
			for (let i = 0, length = headers.childElementCount; i < length; i++) {
				let node = headers.childNodes[i] as HTMLElement
				let resize = resizers.childNodes[i] as HTMLElement
				let column = itemArea.children[i] as HTMLElement
				let width = this.columnWidth[i]
				if (autoIndex === i || (autoIndex === -1 && i === length - 1))
					width += lmitWidth
				node.style.width = width + 'px'
				resize.style.left = node.offsetLeft + width - resize.offsetWidth / 2 + 'px'
				column.style.width = width + 'px'
			}
		}
		onLayout(flag: boolean) {
			super.onLayout(flag)
			this.resize()
		}
		addEventListener(type: 'itemClick', callback: (event: LISTVIEW_EVENT_ITEM_CLICK) => void): void
		addEventListener(type: 'itemDblClick', callback: (event: LISTVIEW_EVENT_ITEM_CLICK) => void): void
		addEventListener(type: 'itemDragStart', callback: (event: LISTVIEW_EVENT_DRAG_START) => void): void
		addEventListener(type: string, callback: any, options?) {
			super.addEventListener(type, callback, options)
		}
	}

}
