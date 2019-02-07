/// <reference path="./jsw.ts" />
namespace JSW {
	//各サイズ
	const FRAME_SIZE = 10	//フレーム枠のサイズ
	const TITLE_SIZE = 24	//タイトルバーのサイズ

	/**
	 *ウインドウ管理用基本データ
	 *
	 * @interface JDATA
	 */
	export interface JDATA {
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
		reshow:boolean
		animation:{}
		noActive:boolean
	}


	export interface WINDOW_EVENT_MAP {
		any:any
		active:{active:boolean}
		closed:{}
		layout:{}
	}
	/**
	 *ウインドウ基本クラス
	 *
	 * @export
	 * @class Window
	 */
	export class Window {
		private Events = new Map<string,any[]>()
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
			reshow:true,
			noActive:false,
			animation: {}
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
			hNode.style.visibility = 'hidden'
			if (params) {
				if (params.frame) {
					this.addFrame(params.title == null ? true : params.title)
					if (params.layer == null)
						this.setOrderLayer(10)
					if (params.overlap == null)
						this.setOverlap(true)
					this.JData.animation['show'] = 'JSWFrameShow 0.5s ease 0s 1 normal'
					this.JData.animation['close'] = 'JSWclose 0.2s ease 0s 1 forwards'
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
			//表示
			this.show(true)
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
				if (WindowManager.frame == null)
					WindowManager.frame = this.dataset.index
				//EDGEはここでイベントを止めないとテキスト選択が入る
				//if (WindowManager.frame < 9)
				//	if (e.preventDefault) e.preventDefault(); else e.returnValue = false
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
				frame.addEventListener("touchend", function () { WindowManager.frame = null; }, { passive: false })
				frame.addEventListener("mousedown", onFrame, false)
				frame.addEventListener("mouseup", function () { WindowManager.frame = null; }, false)
			}
			let node = this.hNode
			//タイトルバーの作成
			let title = node.childNodes[8]
			let titleText = WindowManager.createElement("div", { "dataset": { type: "text" } })
			title.appendChild(titleText)
			//アイコンの作成
			let icons = ["min", "max", "close"]
			for (let index in icons) {
				let icon = WindowManager.createElement("div", { style: { "width": this.JData.titleSize + "px", "height": this.JData.titleSize + "px" }, "dataset": { type: "icon", kind: icons[index] } })
				title.appendChild(icon)
				icon.addEventListener("click", function () {
					WindowManager.callEvent(node, "JSW" + this.dataset.kind)
				})
			}
			//クライアント領域の取得を書き換える
			this.JData.clientArea = this.hNode.childNodes[9] as HTMLElement
		}

		private onMouseDown(e) {
			if (WindowManager.moveNode == null) {
				this.foreground()
				WindowManager.moveNode = this.hNode
				let p = WindowManager.getPos(e)
				WindowManager.baseX = p.x
				WindowManager.baseY = p.y
				WindowManager.nodeX = this.getPosX()
				WindowManager.nodeY = this.getPosY()
				WindowManager.nodeWidth = this.getWidth()
				WindowManager.nodeHeight = this.getHeight()
				e.stopPropagation()
				return false
			}else{
				e.preventDefault()
			}
		}
		private onMouseMove(e) {
			let p = e.params as MovePoint
			let x = this.getPosX()
			let y = this.getPosY()

			let width = this.getWidth()
			let height = this.getHeight()

			//選択されている場所によって挙動を変える
			let frameIndex = parseInt(WindowManager.frame)
			switch (frameIndex) {
				case 0://上
					y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
					height = WindowManager.nodeHeight - (p.nowPoint.y - p.basePoint.y)
					break
				case 1://右
					width = WindowManager.nodeWidth + (p.nowPoint.x - p.basePoint.x)
					break
				case 2://下
					height = WindowManager.nodeHeight + (p.nowPoint.y - p.basePoint.y)
					break
				case 3://左
					x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
					width = WindowManager.nodeWidth - (p.nowPoint.x - p.basePoint.x)
					break
				case 4://左上
					x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
					y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
					width = WindowManager.nodeWidth - (p.nowPoint.x - p.basePoint.x)
					height = WindowManager.nodeHeight - (p.nowPoint.y - p.basePoint.y)
					break
				case 5://右上
					y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
					width = WindowManager.nodeWidth + (p.nowPoint.x - p.basePoint.x)
					height = WindowManager.nodeHeight - (p.nowPoint.y - p.basePoint.y)
					break
				case 6://左下
					x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
					width = WindowManager.nodeWidth - (p.nowPoint.x - p.basePoint.x)
					height = WindowManager.nodeHeight + (p.nowPoint.y - p.basePoint.y)
					break
				case 7://右下
					width = WindowManager.nodeWidth + (p.nowPoint.x - p.basePoint.x)
					height = WindowManager.nodeHeight + (p.nowPoint.y - p.basePoint.y)
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
				e.preventDefault()
		}
		/**
		 *イベントの受け取り
		 *
		 * @param {string} type イベントタイプ
		 * @param {*} listener コールバックリスナー
		 * @memberof Window
		 */
	    addEventListener<K extends keyof WINDOW_EVENT_MAP>(type: K|string, listener: (this: Window,ev: WINDOW_EVENT_MAP[K]) => any): void{
			let eventData = this.Events.get(type)
			if(!eventData){
				eventData = []
				this.Events.set(type,eventData)
			}
			for(let ev of eventData){
				if (String(ev) === String(listener))
					return
			}
			eventData.push(listener)
		}
		/**
		 *イベントの削除
		 *
		 * @template K
		 * @param {(K | string)} type イベントタイプ
		 * @param {(this: Window, ev: WINDOW_EVENT_MAP[K]) => any} listener コールバックリスナー
		 * @memberof Window
		 */
		removeEventListener<K extends keyof WINDOW_EVENT_MAP>(type: K | string, listener?: (this: Window, ev: WINDOW_EVENT_MAP[K]) => any): void {
			if (listener == null){
				this.Events.delete(type)
				return
			}

			let eventData = this.Events.get(type)
			if (!eventData) {
				eventData = []
				this.Events.set(type, eventData)
			}
			for (let index in eventData) {
				if (String(eventData[index]) === String(listener)){
					eventData.splice(parseInt(index), 1)
				}
			}
		}
		/**
		 *イベントの要求
		 *
		 * @param {string} type イベントタイプ
		 * @param {*} params パラメータ
		 * @memberof Window
		 */
		callEvent(type: string, params) {
			const eventData = this.Events.get(type)
			if(eventData){
				for(let ev of eventData){
					ev(params)
				}
			}
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
		setNoActive(flag:boolean) : void{
			this.JData.noActive = flag
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
			const node = this.getNode()
			this.JData.visible = flag;


			if (flag){
				node.style.display = '';
				const animation = this.JData.animation['show']
				const animationEnd = () => {
					this.callEvent('visibled', { visible: true })
					node.removeEventListener("animationend", animationEnd)
					node.style.animation = ''
					node.style.display = '';
					console.log(0)
				}
				if (animation) {
					node.addEventListener("animationend", animationEnd)
					node.style.animation = animation
				}else{
					node.style.animation = ''
					animationEnd.bind(node)()
				}
			}
			else{
				const animationEnd = () => {
					let nodes = node.querySelectorAll('[data-type="Window"]') as any as JNode[]
					let count = nodes.length
					for (let i = 0; i < count; i++) {
						nodes[i].Jsw.layout()
					}
					console.log(1)
					node.style.display = 'none';
					node.removeEventListener("animationend", animationEnd)
					node.style.animation = ''
					this.callEvent('visibled', { visible: false })
				}
				const animation = this.JData.animation['close']
				if (animation) {
					node.addEventListener("animationend", animationEnd)
					node.style.animation = animation
				} else {
					animationEnd.bind(node)()
				}
			}
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
			if (this.getParent())
				this.getParent().layout();
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
			WindowManager.layout(false)
			this.JData.layoutFlag = false
		}
		active(flag?:boolean){
			if (!this.JData.noActive)
				this.getNode().dataset.active = (flag||flag==null)?'true':'false'
		}
		/**
		 *子ウインドウのサイズを再計算
		 *
		 * @param {boolean} flag true:強制再計算 false:必要があれば再計算
		 * @returns {boolean} 再計算の必要を行ったかどうか
		 * @memberof Window
		 */
		onMeasure(flag: boolean): boolean {
			//表示状態の更新
			if(this.JData.reshow){
				this.JData.reshow = false
				this.hNode.style.visibility = ''
				const animation = this.JData.animation['show']
				if(animation)
					this.hNode.style.animation = animation
			}

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

				this.callEvent('layout',{})
			}
			//直下の子リスト
			let client = this.getClient()
			let nodes = []
			for (let i = 0; i < client.childElementCount; i++) {
				let node = client.childNodes[i] as HTMLElement
				if (node.dataset && node.dataset.type === "Window")
					nodes.push(node)
			}
			let count = nodes.length

			//配置順序リスト
			nodes.sort(function (anode: JNode, bnode: JNode) {
				const priority = { top: 10, bottom: 10, left: 8, right: 8, client: 5 }
				const a = anode.Jsw.JData
				const b = bnode.Jsw.JData
				return priority[a.style] - priority[b.style]
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

			//重ね合わせソート
			nodes.sort(function (anode: JNode, bnode: JNode) {
				const a = anode.Jsw.JData
				const b = bnode.Jsw.JData
				if (a.orderTop)
					return 1
				if (b.orderTop)
					return -1
				let layer = a.orderLayer - b.orderLayer
				if (layer)
					return layer
				return parseInt(anode.style.zIndex) - parseInt(bnode.style.zIndex)
			})

			//Zオーダーの再附番
			for (let i = 0; i < nodes.length; i++) {
				nodes[i].style.zIndex = i
			}

		}
		show(flag:boolean):void{
			if(flag==null || flag){
				this.JData.reshow = true
			}else{
				//this.hNode.style.visibility = 'hidden'
			}
		}
		/**
		 *ウインドウの重ね合わせ順位を上位に持って行く
		 *
		 * @param {boolean} [flag] ウインドウをアクティブにするかどうか
		 * @memberof Window
		 */
		foreground(flag?: boolean): void {
			if (this.JData.noActive)
				return
			//親をフォアグラウンドに設定
			let activeNodes = new Set<HTMLElement>()
			let p = this.hNode
			do {
				activeNodes.add(p)
				if ((flag || flag == null) && p.dataset) {
					p.dataset.active = 'true';
					p.style.zIndex = '1000';
					if (p.Jsw)
						p.Jsw.callEvent('active', { active: true });
				}
			}
			while (p = p.parentNode as JNode)

			if (flag || flag == null) {
				var activeWindows = document.querySelectorAll('[data-type="Window"][data-active="true"]')
				for (let i = 0, l = activeWindows.length; i < l; i++) {
					let w = activeWindows[i] as JNode
					if (!activeNodes.has(w)){
						w.dataset.active = 'false'
						w.Jsw.callEvent('active',{active:false})
					}
				}
			}
			const parent = this.getParent();
			if(parent)
				parent.layout()
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
			const that = this
			function animationEnd() {
				let nodes = this.querySelectorAll('[data-type="Window"]') as JNode[]
				let count = nodes.length
				for (let i = 0; i < count; i++) {
					nodes[i].Jsw.layout()
				}
				if (this.parentNode)
					this.parentNode.removeChild(this)
				this.removeEventListener("animationend", animationEnd)
				that.callEvent('closed',{})


			}
			const animation = this.JData.animation['close']
			if(animation){
				this.hNode.addEventListener("animationend", animationEnd)
				this.hNode.style.animation = animation
			}else{
				animationEnd.bind(this.hNode)()
			}
		}
		/**
		 *アニメーションの設定
		 *
		 * @param {string} name アニメーション名
		 * @param {string} value アニメーションパラメータ
		 * @memberof Window
		 */
		setAnimation(name:string,value:string):void{
			this.JData.animation[name] = value
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
			let parent = this.getParent()
			if (parent)
				parent.layout()
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
}