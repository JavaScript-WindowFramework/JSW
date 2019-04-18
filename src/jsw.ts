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
		event:MouseEvent
		basePoint: Point
		nowPoint: Point
		nodePoint: Point
		nodeSize: Size
	}
	/**
	 *ウインドウノードにWindowの参照を持たせる
	*
	* @interface JNode
	* @extends {HTMLElement}
	*/
	export interface JNode extends HTMLElement {
		Jsw: Window	//ノードを保持しているWindow
	}
	/**
	 * ウインドウ等総合管理クラス
	 *
	 * @export
	 * @class Jsw
	 */
	export class WindowManager {
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
				if (WindowManager.moveNode == null) {
					WindowManager.moveNode = node
					let p = WindowManager.getPos(e)
					WindowManager.baseX = p.x
					WindowManager.baseY = p.y
					WindowManager.nodeX = node.offsetLeft
					WindowManager.nodeY = node.offsetTop
					WindowManager.nodeWidth = node.clientWidth
					WindowManager.nodeHeight = node.clientWidth
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
			node.dispatchEvent(WindowManager.createEvent(ename, params))
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
			WindowManager.layoutForced = WindowManager.layoutForced || flag
			if (!WindowManager.layoutHandler) {
				//タイマーによる遅延実行
				WindowManager.layoutHandler = setTimeout(function () {
					WindowManager.layoutHandler = null
					let nodes = document.querySelectorAll("[data-jsw=Window]")
					let count = nodes.length
					for (let i = 0; i < count; i++) {
						let node = nodes[i] as JNode
						if (!node.Jsw.getParent())
							node.Jsw.onMeasure(WindowManager.layoutForced)
						node.Jsw.onLayout(WindowManager.layoutForced)
					}

					WindowManager.layoutForced = false
				}, 0)
			}
		}
	}

	//各イベント設定
	addEventListener("resize", function () { WindowManager.layout(true) })
	addEventListener("mouseup", mouseUp, false)
	addEventListener("touchend", mouseUp, { passive: false })
	addEventListener("mousemove", mouseMove, false)
	addEventListener("touchmove", mouseMove, { passive: false })
	addEventListener("touchstart", mouseDown, { passive: false })
	addEventListener("mousedown", mouseDown, false)

	function mouseDown(e:MouseEvent|TouchEvent){
		let node = e.target as HTMLElement
		do{
			if(node.dataset && node.dataset.jsw === "Window"){
				return
			}
		}while(node = node.parentNode as HTMLElement)
		deactive()
		return false
	}
	function deactive(){
		let activeWindows = document.querySelectorAll('[data-jsw="Window"][data-jsw-active="true"]')
		for (let i = 0, l = activeWindows.length; i < l; i++) {
			let w = activeWindows[i] as JNode
			w.dataset.jswActive = 'false'
			w.Jsw.callEvent('active',{active:false})
		}
	}

	//マウスが離された場合に選択をリセット
	function mouseUp() {
		WindowManager.moveNode = null
		WindowManager.frame = null
	}
	//マウス移動時の処理
	function mouseMove(e:MouseEvent) {
		if (WindowManager.moveNode) {
			let node = WindowManager.moveNode;	//移動中ノード
			let p = WindowManager.getPos(e);	//座標の取得
			let params: MovePoint = {
				event:e,
				nodePoint: { x: WindowManager.nodeX, y: WindowManager.nodeY },
				basePoint: { x: WindowManager.baseX, y: WindowManager.baseY },
				nowPoint: { x: p.x, y: p.y },
				nodeSize: { width: node.clientWidth, height: node.clientHeight }
			}
			WindowManager.callEvent(node, 'move', params)
		}
	}

}
