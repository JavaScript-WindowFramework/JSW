var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * JavaScriptWindowフレームワーク用名前空間
*/
var JSW;
(function (JSW) {
    /**
     * ウインドウ等総合管理クラス
     *
     * @export
     * @class Jsw
     */
    var Jsw = /** @class */ (function () {
        function Jsw() {
        }
        /**
         * マウスとタッチイベントの座標取得処理
         * @param  {MouseEvent|TouchEvent} e
         * @returns Point
         */
        Jsw.getPos = function (e) {
            var p;
            if (e.targetTouches && e.targetTouches.length) {
                var touch = e.targetTouches[0];
                p = { x: touch.pageX, y: touch.pageY };
            }
            else {
                p = { x: e.clientX, y: e.clientY };
            }
            return p;
        };
        /**
         * 対象ノードに対して移動を許可し、イベントを発生させる
         *
         * @static
         * @param {HTMLElement} node
         * @memberof Jsw
         */
        Jsw.enableMove = function (node) {
            function mouseDown(e) {
                if (Jsw.moveNode == null) {
                    Jsw.moveNode = node;
                    var p = Jsw.getPos(e);
                    Jsw.baseX = p.x;
                    Jsw.baseY = p.y;
                    Jsw.nodeX = node.offsetLeft;
                    Jsw.nodeY = node.offsetTop;
                    Jsw.nodeWidth = node.clientWidth;
                    Jsw.nodeHeight = node.clientWidth;
                    e.preventDefault();
                    return false;
                }
            }
            node.addEventListener("touchstart", mouseDown, { passive: false });
            node.addEventListener("mousedown", mouseDown);
        };
        /**
         * ノードに対してイベントを発生させる
         *
         * @static
         * @param {HTMLElement} node 対象ノード
         * @param {string} ename イベント名
         * @param {*} [params] イベント発生時にevent.paramsの形で送られる
         * @memberof Jsw
         */
        Jsw.callEvent = function (node, ename, params) {
            node.dispatchEvent(Jsw.createEvent(ename, params));
        };
        /**
         *イベントを作成する
         *
         * @static
         * @param {string} ename イベント名
         * @param {*} [params] イベント発生時にevent.paramsの形で送られる
         * @returns {Event} 作成したイベント
         * @memberof Jsw
         */
        Jsw.createEvent = function (ename, params) {
            var event;
            if (!!window.MSStream) {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent(ename, false, false, null);
            }
            else {
                event = new CustomEvent(ename, null);
            }
            event.params = params;
            return event;
        };
        /**
         *ノードを作成する
         *
         * @static
         * @param {string} tagName タグ名
         * @param {*} [params] タグパラメータ
         * @returns {HTMLElement} 作成したノード
         * @memberof Jsw
         */
        Jsw.createElement = function (tagName, params) {
            var tag = document.createElement(tagName);
            for (var index in params) {
                var p = params[index];
                if (typeof p == 'object') {
                    for (var index2 in p)
                        tag[index][index2] = p[index2];
                }
                else
                    tag[index] = p;
            }
            return tag;
        };
        /**
         *ウインドウレイアウトの更新要求
         *実際の処理は遅延非同期で行われる
         *
         * @static
         * @param {boolean} flag	true:全Window強制更新 false:更新の必要があるWindowのみ更新
         * @memberof Jsw
         */
        Jsw.layout = function (flag) {
            Jsw.layoutForced = Jsw.layoutForced || flag;
            if (!Jsw.layoutHandler) {
                //タイマーによる遅延実行
                Jsw.layoutHandler = setTimeout(function () {
                    var nodes = document.querySelectorAll("[data-type=Window]");
                    var count = nodes.length;
                    for (var i = 0; i < count; i++) {
                        var node = nodes[i];
                        if (!node.Jsw.getParent())
                            node.Jsw.onMeasure(Jsw.layoutForced);
                        node.Jsw.onLayout(Jsw.layoutForced);
                    }
                    Jsw.layoutHandler = null;
                    Jsw.layoutForced = false;
                }, 0);
            }
        };
        Jsw.moveNode = null;
        Jsw.frame = null;
        return Jsw;
    }());
    JSW.Jsw = Jsw;
    //各サイズ
    var FRAME_SIZE = 10; //フレーム枠のサイズ
    var TITLE_SIZE = 24; //タイトルバーのサイズ
    //各イベント設定
    addEventListener("resize", function () { Jsw.layout(true); });
    addEventListener("mouseup", mouseUp, false);
    addEventListener("touchend", mouseUp, { passive: false });
    addEventListener("mousemove", mouseMove, false);
    addEventListener("touchmove", mouseMove, { passive: false });
    //マウスが離された場合に選択をリセット
    function mouseUp(e) {
        Jsw.moveNode = null;
        Jsw.frame = null;
    }
    //マウス移動時の処理
    function mouseMove(e) {
        if (Jsw.moveNode) {
            var node = Jsw.moveNode; //移動中ノード
            var p = Jsw.getPos(e); //座標の取得
            var params = {
                nodePoint: { x: Jsw.nodeX, y: Jsw.nodeY },
                basePoint: { x: Jsw.baseX, y: Jsw.baseY },
                nowPoint: { x: p.x, y: p.y },
                nodeSize: { width: node.clientWidth, height: node.clientHeight }
            };
            Jsw.callEvent(node, 'move', params);
            //e.preventDefault()
            return false;
        }
    }
    /**
     *ウインドウ基本クラス
     *
     * @export
     * @class Window
     */
    var Window = /** @class */ (function () {
        /**
         * Creates an instance of Window.
         * @param {{ frame?: boolean, title?: boolean, layer?: number}} [params] ウインドウ作成用パラメータ
         * {	frame?:boolean,
         * 		title?:boolean,
         * 		layer?:number
         * }
         * @memberof Window
         */
        function Window(params) {
            this.JData = {
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
            };
            //ウインドウ用ノードの作成
            var hNode = document.createElement('DIV');
            hNode.Jsw = this;
            this.JData.clientArea = hNode;
            this.hNode = hNode;
            hNode.dataset.type = "Window";
            //位置を絶対位置指定
            hNode.style.position = 'absolute';
            if (params) {
                if (params.frame) {
                    this.addFrame(params.title == null ? true : params.title);
                    if (params.layer == null)
                        this.setOrderLayer(10);
                    if (params.overlap == null)
                        this.setOverlap(true);
                }
                if (params.layer) {
                    this.setOrderLayer(params.layer);
                }
                if (params.overlap) {
                    this.setOverlap(params.overlap);
                }
            }
            //移動に備えて、必要な情報を収集
            hNode.addEventListener("touchstart", this.onMouseDown.bind(this), { passive: false });
            hNode.addEventListener("mousedown", this.onMouseDown.bind(this));
            hNode.addEventListener('move', this.onMouseMove.bind(this));
            //タイトルバーアイコンの機能設定
            hNode.addEventListener("JSWclose", this.close.bind(this));
            hNode.addEventListener("JSWmax", this.setMaximize.bind(this, true));
            hNode.addEventListener("JSWnormal", this.setMaximize.bind(this, false));
            hNode.addEventListener("JSWmin", this.setMinimize.bind(this, true));
            hNode.addEventListener("JSWrestore", this.setMinimize.bind(this, false));
            //ノードを本文へ追加
            document.body.appendChild(hNode);
            //更新要求
            //this.layout()
            //新規ウインドウをフォアグラウンドにする
            this.foreground(false);
        }
        Window.prototype.setOverlap = function (flag) {
            this.hNode.style.position = flag ? 'fixed' : 'absolute';
        };
        //フレーム追加処理
        Window.prototype.addFrame = function (titleFlag) {
            this.hNode.dataset.style = 'frame';
            //タイトルの設定
            this.JData.titleSize = titleFlag ? TITLE_SIZE : 0;
            this.hNode.style.minHeight = this.JData.titleSize + "px";
            //各パーツのスタイル設定
            var frameStyles = [
                ["frame", "cursor:n-resize; left:0px;top:-{0}px;right:0px;height:{0}px;"],
                ["frame", "cursor:e-resize; top:0px;right:-{0}px;bottom:0px;width:{0}px;"],
                ["frame", "cursor:s-resize; left:0px;right:0px;height:{0}px;bottom:-{0}px;"],
                ["frame", "cursor:w-resize; top:0px;left:-{0}px;bottom:0px;width:{0}px;"],
                ["frame", "cursor:nw-resize;left:-{0}px;top:-{0}px;width:{0}px;height:{0}px;"],
                ["frame", "cursor:ne-resize;right:-{0}px;top:-{0}px;width:{0}px;height:{0}px;"],
                ["frame", "cursor:sw-resize;left:-{0}px;bottom:-{0}px;width:{0}px;height:{0}px;"],
                ["frame", "cursor:se-resize;right:-{0}px;bottom:-{0}px;width:{0}px;height:{0}px;"],
                ["title", "left:0px;top:0px;right:0px;height:{1}px"],
                ["client", "left:0px;top:{1}px;right:0px;bottom:0px"],
            ];
            //フレームクリックイベントの処理
            function onFrame(e) {
                if (Jsw.frame == null)
                    Jsw.frame = this.dataset.index;
                //EDGEはここでイベントを止めないとテキスト選択が入る
                if (Jsw.frame < 9)
                    if (e.preventDefault)
                        e.preventDefault();
                    else
                        e.returnValue = false;
            }
            //フレームとタイトル、クライアント領域の作成
            for (var i = 0; i < frameStyles.length; i++) {
                var frame = document.createElement('div');
                frame.style.cssText = frameStyles[i][1].replace(/\{0\}/g, FRAME_SIZE.toString()).replace(/\{1\}/g, this.JData.titleSize.toString());
                frame.dataset.index = i.toString();
                frame.dataset.type = frameStyles[i][0];
                this.hNode.appendChild(frame);
                frame.addEventListener("touchstart", onFrame, { passive: false });
                frame.addEventListener("touchend", function () { Jsw.frame = null; }, { passive: false });
                frame.addEventListener("mousedown", onFrame, false);
                frame.addEventListener("mouseup", function () { Jsw.frame = null; }, false);
            }
            var node = this.hNode;
            //タイトルバーの作成
            var title = node.childNodes[8];
            var titleText = Jsw.createElement("div", { "dataset": { type: "text" } });
            title.appendChild(titleText);
            //アイコンの作成
            var icons = ["min", "max", "close"];
            for (var index in icons) {
                var icon = Jsw.createElement("div", { style: { "width": this.JData.titleSize + "px", "height": this.JData.titleSize + "px" }, "dataset": { type: "icon", kind: icons[index] } });
                title.appendChild(icon);
                icon.addEventListener("click", function () {
                    Jsw.callEvent(node, "JSW" + this.dataset.kind);
                });
            }
            //クライアント領域の取得を書き換える
            this.JData.clientArea = this.hNode.childNodes[9];
        };
        Window.prototype.onMouseDown = function (e) {
            if (Jsw.moveNode == null) {
                this.foreground();
                Jsw.moveNode = this.hNode;
                var p = Jsw.getPos(e);
                Jsw.baseX = p.x;
                Jsw.baseY = p.y;
                Jsw.nodeX = this.getPosX();
                Jsw.nodeY = this.getPosY();
                Jsw.nodeWidth = this.getWidth();
                Jsw.nodeHeight = this.getHeight();
                //e.preventDefault()
                //return false
            }
        };
        Window.prototype.onMouseMove = function (e) {
            var p = e.params;
            var x = this.getPosX();
            var y = this.getPosY();
            var width = this.getWidth();
            var height = this.getHeight();
            //選択されている場所によって挙動を変える
            var frameIndex = parseInt(Jsw.frame);
            switch (frameIndex) {
                case 0: //上
                    y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
                    height = Jsw.nodeHeight - (p.nowPoint.y - p.basePoint.y);
                    break;
                case 1: //右
                    width = Jsw.nodeWidth + (p.nowPoint.x - p.basePoint.x);
                    break;
                case 2: //下
                    height = Jsw.nodeHeight + (p.nowPoint.y - p.basePoint.y);
                    break;
                case 3: //左
                    x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                    width = Jsw.nodeWidth - (p.nowPoint.x - p.basePoint.x);
                    break;
                case 4: //左上
                    x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                    y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
                    width = Jsw.nodeWidth - (p.nowPoint.x - p.basePoint.x);
                    height = Jsw.nodeHeight - (p.nowPoint.y - p.basePoint.y);
                    break;
                case 5: //右上
                    y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
                    width = Jsw.nodeWidth + (p.nowPoint.x - p.basePoint.x);
                    height = Jsw.nodeHeight - (p.nowPoint.y - p.basePoint.y);
                    break;
                case 6: //左下
                    x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                    width = Jsw.nodeWidth - (p.nowPoint.x - p.basePoint.x);
                    height = Jsw.nodeHeight + (p.nowPoint.y - p.basePoint.y);
                    break;
                case 7: //右下
                    width = Jsw.nodeWidth + (p.nowPoint.x - p.basePoint.x);
                    height = Jsw.nodeHeight + (p.nowPoint.y - p.basePoint.y);
                    break;
                default: //クライアント領域
                    if (!this.JData.moveable)
                        break;
                case 8: //タイトル
                    x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                    y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
                    break;
            }
            //位置とサイズの設定
            this.setPos(x, y);
            this.setSize(width, height);
            //移動フレーム処理時はイベントを止める
            //if (frameIndex < 9)
            //	if (e.preventDefault) e.preventDefault(); else e.returnValue = false
        };
        /**
         *イベントの受け取り
         *
         * @param {string} type イベントタイプ
         * @param {*} listener コールバックリスナー
         * @param {*} [options] オプション
         * @memberof Window
         */
        Window.prototype.addEventListener = function (type, listener, options) {
            this.hNode.addEventListener(type, listener, options);
        };
        /**
         *イベントの要求
         *
         * @param {string} type イベントタイプ
         * @param {*} params パラメータ
         * @memberof Window
         */
        Window.prototype.callEvent = function (type, params) {
            Jsw.callEvent(this.hNode, type, params);
        };
        /**
         *ウインドウのノードを得る
         *
         * @returns {HTMLElement} ウインドウノード
         * @memberof Window
         */
        Window.prototype.getNode = function () {
            return this.hNode;
        };
        /**
         *ウインドウの移動
         *
         * @param {number} x
         * @param {number} y
         * @memberof Window
         */
        Window.prototype.movePos = function (x, y) {
            this.JData.x = this.JData.x + parseInt(x);
            this.JData.y = this.JData.y + parseInt(y);
            this.layout();
        };
        /**
         *ウインドウの位置設定
         *引数を省略した場合は親のサイズを考慮して中央へ
         * @param {number} [x]
         * @param {number} [y]
         * @memberof Window
         */
        Window.prototype.setPos = function (x, y) {
            if (x == null) {
                var parentWidth = this.getParentWidth();
                var width = this.getWidth();
                if (parentWidth < width)
                    x = 0;
                else
                    x = (parentWidth - width) / 2;
            }
            if (y == null) {
                var parentHeight = this.getParentHeight();
                var height = this.getHeight();
                if (parentHeight < height)
                    y = 0;
                else
                    y = (parentHeight - height) / 2;
            }
            this.JData.x = x;
            this.JData.y = y;
            this.layout();
        };
        /**
         *X座標の設定
         *
         * @param {number} x
         * @memberof Window
         */
        Window.prototype.setPosX = function (x) {
            this.JData.x = parseInt(x);
            this.layout();
        };
        /**
         *Y座標の設定
         *
         * @param {number} y
         * @memberof Window
         */
        Window.prototype.setPosY = function (y) {
            this.JData.y = parseInt(y);
            this.layout();
        };
        /**
         *親ウインドウの取得
         *
         * @returns {Window} 親ウインドウ
         * @memberof Window
         */
        Window.prototype.getParent = function () {
            return this.JData.parent;
        };
        /**
         *クライアント領域のドラッグによる移動の許可
         *
         * @param {boolean} moveable true:許可 false:不許可
         * @memberof Window
         */
        Window.prototype.setMoveable = function (moveable) {
            this.JData.moveable = moveable;
        };
        /**
         *X座標を返す
         *
         * @returns {number}
         * @memberof Window
         */
        Window.prototype.getPosX = function () { return this.JData.x; };
        /**
         *Y座標を返す
         *
         * @returns {number}
         * @memberof Window
         */
        Window.prototype.getPosY = function () { return this.JData.y; };
        /**
         *ウインドウの幅を返す
         *
         * @returns
         * @memberof Window
         */
        Window.prototype.getWidth = function () { return this.JData.width; };
        /**
         *ウインドウの高さを返す
         *
         * @returns
         * @memberof Window
         */
        Window.prototype.getHeight = function () { return this.JData.height; };
        /**
         *ウインドウサイズの設定
         *
         * @param {number} width
         * @param {number} height
         * @memberof Window
         */
        Window.prototype.setSize = function (width, height) {
            this.JData.width = parseInt(width);
            this.JData.height = parseInt(height);
            this.layout();
        };
        /**
         *ウインドウの幅の設定
         *
         * @param {number} width
         * @memberof Window
         */
        Window.prototype.setWidth = function (width) {
            this.JData.width = parseInt(width);
            this.layout();
        };
        /**
         *ウインドウの高さの設定
         *
         * @param {number} height
         * @memberof Window
         */
        Window.prototype.setHeight = function (height) {
            this.JData.height = parseInt(height);
            this.layout();
        };
        /**
         * クライアント領域のpadding設定
         *
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
         * @memberof Window
         */
        Window.prototype.setPadding = function (x1, y1, x2, y2) {
            this.JData.padding.x1 = x1;
            this.JData.padding.y1 = y1;
            this.JData.padding.x2 = x2;
            this.JData.padding.y2 = y2;
        };
        /**
         *配置時のマージン設定
         *
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
         * @memberof Window
         */
        Window.prototype.setMargin = function (x1, y1, x2, y2) {
            this.JData.margin.x1 = x1;
            this.JData.margin.y1 = y1;
            this.JData.margin.x2 = x2;
            this.JData.margin.y2 = y2;
        };
        /**
         *ウインドウの可視状態の取得
         *
         * @returns {boolean}
         * @memberof Window
         */
        Window.prototype.isVisible = function () {
            if (!this.JData.visible)
                return false;
            if (this.getParent())
                return this.getParent().isVisible();
            return true;
        };
        /**
         *ウインドウの可視状態の設定
         *
         * @param {boolean} flag
         * @memberof Window
         */
        Window.prototype.setVisible = function (flag) {
            this.JData.visible = flag;
            this.getNode().style.display = flag ? 'block' : 'none';
            if (this.getParent())
                this.getParent().layout();
        };
        /**
         *ウインドウの重ね合わせを最上位に設定
         *
         * @param {boolean} flag
         * @memberof Window
         */
        Window.prototype.setOrderTop = function (flag) {
            this.JData.orderTop = flag;
        };
        /**
         *ウインドウの重ね合わせ順位の設定
         *値が大きいほど上位
         * @param {number} level デフォルト:0 FrameWindow:10
         * @memberof Window
         */
        Window.prototype.setOrderLayer = function (level) {
            this.JData.orderLayer = level;
        };
        /**
         *レイアウトの再構成要求
         *
         * @memberof Window
         */
        Window.prototype.layout = function () {
            if (this.JData.layoutFlag)
                return;
            this.JData.layoutFlag = true;
            this.JData.redraw = true;
            Jsw.layout(false);
            this.JData.layoutFlag = false;
        };
        /**
         *子ウインドウのサイズを再計算
         *
         * @param {boolean} flag true:強制再計算 false:必要があれば再計算
         * @returns {boolean} 再計算の必要を行ったかどうか
         * @memberof Window
         */
        Window.prototype.onMeasure = function (flag) {
            var client = this.getClient();
            for (var i = 0; i < client.childNodes.length; i++) {
                var node = client.childNodes[i];
                if (node.dataset && node.dataset.type === "Window")
                    flag |= node.Jsw.onMeasure(false);
            }
            if (!this.isAutoSize())
                return false;
            if (!flag && !this.JData.redraw) {
                return false;
            }
            this.JData.redraw = true;
            this.getClient().style.width = 'auto';
            this.getClient().style.height = 'auto';
            this.setClientSize(this.getClient().scrollWidth, this.getClient().scrollHeight);
            return true;
        };
        /**
         *親のクライアント領域を返す
         *
         * @returns
         * @memberof Window
         */
        Window.prototype.getParentWidth = function () {
            var node = this.hNode;
            if (node.style.position === 'fixed')
                return window.innerWidth;
            var parent = node.parentNode;
            return parent.scrollWidth;
        };
        /**
         *親のクライアント領域を返す
         *
         * @returns
         * @memberof Window
         */
        Window.prototype.getParentHeight = function () {
            var node = this.hNode;
            if (node.style.position === 'fixed')
                return window.innerHeight;
            var parent = node.parentNode;
            return parent.scrollHeight;
        };
        /**
         *位置やサイズの確定処理
         *非同期で必要なときに呼び出されるので、基本的には直接呼び出さないこと
         * @param {boolean} flag true:強制 false:必要なら
         * @memberof Window
         */
        Window.prototype.onLayout = function (flag) {
            if (flag || this.JData.redraw) {
                if (this.hNode.dataset.stat == 'maximize') {
                    var parent_1 = this.hNode.parentNode;
                    this.setPos(0, 0);
                    this.setSize(this.getParentWidth(), this.getParentHeight());
                }
                this.JData.redraw = false;
                this.hNode.style.left = this.JData.x + 'px';
                this.hNode.style.top = this.JData.y + 'px';
                this.hNode.style.width = this.JData.width + 'px';
                this.hNode.style.height = this.JData.height + 'px';
                flag = true;
                Jsw.callEvent(this.hNode, 'layout');
            }
            //直下の子リスト
            var client = this.getClient();
            var nodes = [];
            for (var i = 0; i < client.childNodes.length; i++) {
                var node = client.childNodes[i];
                if (node.dataset && node.dataset.type === "Window")
                    nodes.push(node);
            }
            var count = nodes.length;
            //配置順序リスト
            nodes.sort(function (a, b) {
                var priority = { top: 10, bottom: 10, left: 8, right: 8, client: 5 };
                return priority[b.Jsw.JData.style] - priority[a.Jsw.JData.style];
            });
            var padding = this.JData.padding;
            var width = this.getClientWidth();
            var height = this.getClientHeight();
            var x1 = padding.x1;
            var y1 = padding.y1;
            var x2 = x1 + width - padding.x2;
            var y2 = y1 + height - padding.y2;
            for (var i = 0; i < count; i++) {
                var child = nodes[i];
                var win = child.Jsw;
                if (child.dataset.visible === 'false')
                    continue;
                var margin = win.JData.margin;
                var px1 = x1 + margin.x1;
                var py1 = y1 + margin.y1;
                var px2 = x2 - margin.x2;
                var py2 = y2 - margin.y2;
                switch (child.Jsw.JData.style) {
                    case "top":
                        win.setPos(px1, py1);
                        win.setWidth(px2 - px1);
                        y1 += win.getHeight() + margin.y2;
                        break;
                    case "bottom":
                        win.setPos(px1, py2 - win.getHeight());
                        win.setWidth(px2 - px1);
                        y2 = py2 - win.getHeight() - margin.y1;
                        break;
                    case "left":
                        win.setPos(px1, py1);
                        win.setHeight(y2 - y1 - margin.y1 - margin.y2);
                        x1 += win.getWidth() + margin.x1 + margin.x2;
                        break;
                    case "right":
                        win.setPos(px2 - win.getWidth(), py1);
                        win.setHeight(py2 - py1);
                        x2 = px2 - win.getWidth() - margin.x2;
                        break;
                    case "client":
                        win.setPos(px1, py1);
                        win.setSize(px2 - px1, py2 - py1);
                        break;
                }
                win.onLayout(flag);
            }
            this.JData.redraw = false;
        };
        /**
         *ウインドウの重ね合わせ順位を上位に持って行く
         *
         * @param {boolean} [flag] ウインドウをアクティブにするかどうか
         * @memberof Window
         */
        Window.prototype.foreground = function (flag) {
            //親をフォアグラウンドに設定
            var activeNodes = new Set();
            var p = this.hNode;
            activeNodes.add(p);
            while (p = p.parentNode) {
                activeNodes.add(p);
                if (p.Jsw)
                    p.Jsw.foreground(flag);
            }
            if (flag || flag == null) {
                this.hNode.dataset.active = 'true';
                var activeWindows = document.querySelectorAll('[data-type="Window"][data-active="true"]');
                for (var i = 0, l = activeWindows.length; i < l; i++) {
                    var w = activeWindows[i];
                    if (!activeNodes.has(w))
                        w.dataset.active = 'false';
                }
            }
            //兄弟ウインドウの列挙しソート
            var childs = this.hNode.parentNode.childNodes;
            var nodes = [];
            for (var i = 0; i < childs.length; i++) {
                var node_1 = childs[i];
                if (node_1.dataset && node_1.dataset.type === "Window")
                    nodes.push(node_1);
            }
            var node = this.hNode;
            nodes.sort(function (a, b) {
                if (a.Jsw.JData.orderTop)
                    return 1;
                if (b.Jsw.JData.orderTop)
                    return -1;
                var layer = a.Jsw.JData.orderLayer - b.Jsw.JData.orderLayer;
                if (layer)
                    return layer;
                if (a === node)
                    return 1;
                if (b === node)
                    return -1;
                return parseInt(a.style.zIndex) - parseInt(b.style.zIndex);
            });
            //Zオーダーの再附番
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].style.zIndex = i;
            }
        };
        /**
         *クライアント領域のスクロールの可否
         *
         * @param {boolean} flag
         * @memberof Window
         */
        Window.prototype.setScroll = function (flag) {
            this.getClient().style.overflow = flag ? 'auto' : 'hidden';
        };
        /**
         *クライアント領域のスクロールが有効かどうか
         *
         * @returns {boolean}
         * @memberof Window
         */
        Window.prototype.isScroll = function () {
            return this.getClient().style.overflow === 'auto';
        };
        /**
         *ウインドウを閉じる
         *
         * @memberof Window
         */
        Window.prototype.close = function () {
            function animationEnd() {
                var nodes = this.querySelectorAll('[data-type="Window"]');
                var count = nodes.length;
                for (var i = 0; i < count; i++) {
                    nodes[i].Jsw.layout();
                }
                if (this.parentNode)
                    this.parentNode.removeChild(this);
                this.removeEventListener("animationend", animationEnd);
                var event = Jsw.createEvent("JSWclosed");
                this.dispatchEvent(event);
            }
            this.hNode.addEventListener("animationend", animationEnd);
            this.hNode.style.animation = "JSWclose 0.2s ease 0s 1 forwards";
        };
        /**
         *絶対位置の取得
         *
         * @returns
         * @memberof Window
         */
        Window.prototype.getAbsX = function () {
            var px = this.JData.x;
            var parent = this;
            while (parent = parent.getParent()) {
                px += this.getClient().offsetLeft + parent.getClientX() + parent.JData.x;
            }
            return px;
        };
        /**
        *絶対位置の取得
        *
        * @returns
        * @memberof Window
        */
        Window.prototype.getAbsY = function () {
            var py = this.JData.y;
            var parent = this;
            while (parent = parent.getParent()) {
                py += this.getClient().offsetTop + parent.getClientX() + parent.JData.y;
            }
            return py;
        };
        /**
         *クライアントノードを返す
         *WindowクラスはgetNode()===getClient()
         *FrameWindowはgetNode()!==getClient()
         * @returns {HTMLElement}
         * @memberof Window
         */
        Window.prototype.getClient = function () {
            return this.JData.clientArea;
        };
        /**
         *クライアント領域の基準位置を返す
         *
         * @returns
         * @memberof Window
         */
        Window.prototype.getClientX = function () {
            return this.JData.padding.x1;
        };
        /**
         *クライアント領域の基準位置を返す
         *
         * @returns
         * @memberof Window
         */
        Window.prototype.getClientY = function () {
            return this.JData.padding.y1;
        };
        /**
         *クライアントサイズを元にウインドウサイズを設定
         *
         * @param {number} width
         * @param {number} height
         * @memberof Window
         */
        Window.prototype.setClientSize = function (width, height) {
            this.setSize(this.getNode().offsetWidth - this.getClientWidth() + width, this.getNode().offsetHeight - this.getClientHeight() + height);
        };
        /**
         *クライアントサイズを元にウインドウサイズを設定
         *
         * @param {number} width
         * @memberof Window
         */
        Window.prototype.setClientWidth = function (width) {
            this.setWidth(this.getNode().offsetWidth - this.getClientWidth() + width);
        };
        /**
         *クライアントサイズを元にウインドウサイズを設定
         *
         * @param {number} height
         * @memberof Window
         */
        Window.prototype.setClientHeight = function (height) {
            this.setHeight(this.getNode().offsetHeight - this.getClientHeight() + height);
        };
        /**
         *クライアントサイズを取得
         *
         * @returns {number}
         * @memberof Window
         */
        Window.prototype.getClientWidth = function () {
            return this.getClient().clientWidth;
        };
        /**
         *クライアントサイズを取得
         *
         * @returns {number}
         * @memberof Window
         */
        Window.prototype.getClientHeight = function () {
            return this.getClient().clientHeight;
        };
        /**
         *子ノードの追加
         *
         * @param {Window} child 子ウインドウ
         * @param {('left' | 'right' | 'top' | 'bottom' | 'client' | null)} [style] ドッキング位置
         * @memberof Window
         */
        Window.prototype.addChild = function (child, style) {
            child.setChildStyle(style);
            child.JData.parent = this;
            this.getClient().appendChild(child.hNode);
            this.layout();
        };
        /**
         *ドッキングスタイルの設定
         *
         * @param {('left' | 'right' | 'top' | 'bottom' | 'client' | null)} style ドッキング位置
         * @memberof Window
         */
        Window.prototype.setChildStyle = function (style) {
            this.JData.style = style;
            var parent = this.hNode.parentNode;
            if (parent && parent.Jsw)
                parent.Jsw.layout();
        };
        /**
         *子ウインドウを全て切り離す
         *
         * @memberof Window
         */
        Window.prototype.removeChildAll = function () {
            var client = this.getClient();
            var childList = client.childNodes;
            for (var i = childList.length - 1; i >= 0; i--) {
                var child = childList[i];
                if (child.dataset.type === "Window") {
                    child.Jsw.JData.parent = null;
                    client.removeChild(child);
                }
            }
            this.layout();
        };
        /**
         *子ウインドウを切り離す
         *
         * @param {Window} child
         * @returns
         * @memberof Window
         */
        Window.prototype.removeChild = function (child) {
            if (child.getParent() !== this)
                return;
            child.JData.parent = null;
            this.getClient().removeChild(child.hNode);
            this.layout();
        };
        /**
         *自動サイズ調整の状態を取得
         *
         * @returns
         * @memberof Window
         */
        Window.prototype.isAutoSize = function () {
            return this.getClient().dataset.scale === 'auto';
        };
        /**
         *自動サイズ調整を設定
         *
         * @param {boolean} scale
         * @memberof Window
         */
        Window.prototype.setAutoSize = function (scale) {
            this.getClient().dataset.scale = scale ? 'auto' : '';
        };
        /**
         *タイトル設定
         *
         * @param {string} title
         * @memberof Window
         */
        Window.prototype.setTitle = function (title) {
            if (this.hNode.childNodes[8]) {
                this.hNode.childNodes[8].childNodes[0].textContent = title;
            }
        };
        /**
         *タイトル取得
         *
         * @returns {string}
         * @memberof Window
         */
        Window.prototype.getTitle = function () {
            if (this.hNode.childNodes[8]) {
                return this.hNode.childNodes[8].childNodes[0].textContent;
            }
            return "";
        };
        /**
         *ウインドウの最大化
         *
         * @param {boolean} flag
         * @memberof Window
         */
        Window.prototype.setMaximize = function (flag) {
            var that = this;
            function animationEnd() {
                this.style.minWidth = null;
                this.style.minHeight = that.JData.titleSize + "px";
                this.removeEventListener("animationend", animationEnd);
            }
            if (this.hNode.dataset.stat != 'maximize') {
                this.JData.normalX = this.JData.x;
                this.JData.normalY = this.JData.y;
                this.JData.normalWidth = this.JData.width;
                this.JData.normalHeight = this.JData.height;
                this.hNode.dataset.stat = 'maximize';
                this.hNode.style.minWidth = this.JData.width + "px";
                this.hNode.style.minHeight = this.JData.height + "px";
                this.hNode.style.animation = "JSWmaximize 0.2s ease 0s 1 forwards";
                this.hNode.addEventListener("animationend", animationEnd);
            }
            else {
                this.JData.x = this.JData.normalX;
                this.JData.y = this.JData.normalY;
                this.JData.width = this.JData.normalWidth;
                this.JData.height = this.JData.normalHeight;
                this.hNode.dataset.stat = 'normal';
                this.hNode.style.animation = "JSWmaxrestore 0.2s ease 0s 1 forwards";
            }
            if (flag) {
                var icon = this.hNode.querySelector("*>[data-type=title]>[data-type=icon][data-kind=max]");
                icon.dataset.kind = "normal";
            }
            else {
                var icon = this.hNode.querySelector("*>[data-type=title]>[data-type=icon][data-kind=normal]");
                icon.dataset.kind = "max";
            }
            this.layout();
        };
        /**
         *ウインドウの最小化
         *
         * @param {boolean} flag
         * @memberof Window
         */
        Window.prototype.setMinimize = function (flag) {
            var that = this;
            this.hNode.addEventListener("animationend", function () { that.layout(); });
            if (this.hNode.dataset.stat != 'minimize') {
                //client.style.animation="Jswminimize 0.2s ease 0s 1 forwards"
                this.hNode.style.animation = "JSWminimize 0.2s ease 0s 1 forwards";
                this.hNode.dataset.stat = 'minimize';
            }
            else {
                //client.style.animation="Jswrestore 0.2s ease 0s 1 backwards"
                this.hNode.style.animation = "JSWrestore 0.2s ease 0s 1 forwards";
                this.hNode.dataset.stat = 'normal';
            }
            if (flag) {
                var icon = this.hNode.querySelector("*>[data-type=title]>[data-type=icon][data-kind=min]");
                icon.dataset.kind = "restore";
            }
            else {
                var icon = this.hNode.querySelector("*>[data-type=title]>[data-type=icon][data-kind=restore]");
                icon.dataset.kind = "min";
            }
            this.JData.minimize = flag;
            this.layout();
        };
        return Window;
    }());
    JSW.Window = Window;
    /**
     *フレームウインドウクラス
     *
     * @export
     * @class FrameWindow
     * @extends {Window}
     */
    var FrameWindow = /** @class */ (function (_super) {
        __extends(FrameWindow, _super);
        function FrameWindow() {
            var _this = _super.call(this, { frame: true, title: true, layer: 10 }) || this;
            _this.setOverlap(true);
            return _this;
        }
        return FrameWindow;
    }(Window));
    JSW.FrameWindow = FrameWindow;
    /**
     *分割ウインドウ用クラス
     *
     * @export
     * @class Splitter
     * @extends {Window}
     */
    var Splitter = /** @class */ (function (_super) {
        __extends(Splitter, _super);
        /**
         *Creates an instance of Splitter.
         * @param {number} [splitPos]
         * @param {('ns'|'sn'|'ew'|'we')} [splitType] 分割領域のタイプ
         * @memberof Splitter
         */
        function Splitter(splitPos, splitType) {
            var _this = _super.call(this) || this;
            _this.JDataSplit = {};
            _this.slideHandle = null;
            _this.slideTimeoutHandle = null;
            _this.setSize(640, 480);
            _this.JDataSplit.overlay = false;
            _this.JDataSplit.overlayOpen = true;
            _this.JDataSplit.overlayMove = 0;
            _this.JDataSplit.splitterThick = 10;
            _this.JDataSplit.splitterPos = (splitPos == null ? 100 : splitPos);
            _this.getNode().dataset.splitterType = (splitType == null ? "we" : splitType);
            _this.JDataSplit.childList = [new Window(), new Window()];
            _super.prototype.addChild.call(_this, _this.JDataSplit.childList[0]);
            _super.prototype.addChild.call(_this, _this.JDataSplit.childList[1]);
            var splitter = new Window();
            splitter.getNode().dataset.kind = 'Splitter';
            splitter.setOrderTop(true);
            _super.prototype.addChild.call(_this, splitter);
            var that = _this;
            _this.JDataSplit.childList[0].getNode().addEventListener("mousedown", function () { that.slideTimeout(); });
            _this.JDataSplit.childList[0].getNode().addEventListener("touchstart", function () { that.slideTimeout(); });
            _this.JDataSplit.childList[1].getNode().addEventListener("mousedown", function () { that.slideClose(); });
            _this.JDataSplit.childList[1].getNode().addEventListener("touchstart", function () { that.slideClose(); });
            splitter.getNode().addEventListener("mousedown", function () { that.slide(); });
            splitter.getNode().addEventListener("touchstart", function () { that.slide(); });
            splitter.getNode().addEventListener("move", function (e) {
                if (that.JDataSplit.overlay)
                    return;
                var p = e.params;
                var width = that.getClientWidth();
                var height = that.getClientHeight();
                var splitterThick = that.JDataSplit.splitterThick;
                var x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                var y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
                switch (that.getNode().dataset.splitterType) {
                    case "ns":
                        that.JDataSplit.splitterPos = y;
                        break;
                    case "sn":
                        that.JDataSplit.splitterPos = height - (y + splitterThick);
                        break;
                    case "we":
                        that.JDataSplit.splitterPos = x;
                        break;
                    case "ew":
                        that.JDataSplit.splitterPos = width - (x + splitterThick);
                        break;
                }
                that.layout();
            });
            that.getNode().addEventListener("layout", function () {
                var width = that.getClientWidth();
                var height = that.getClientHeight();
                var JDataSplit = that.JDataSplit;
                var splitterThick = JDataSplit.splitterThick;
                var child0 = JDataSplit.childList[0];
                var child1 = JDataSplit.childList[1];
                if (JDataSplit.splitterPos < 0)
                    JDataSplit.splitterPos = 0;
                switch (that.getNode().dataset.splitterType) {
                    case "we":
                        if (JDataSplit.splitterPos >= width - splitterThick)
                            JDataSplit.splitterPos = width - splitterThick - 1;
                        splitter.setSize(splitterThick, height);
                        splitter.setPos(JDataSplit.splitterPos, 0);
                        child0.setSize(splitter.getPosX(), height);
                        if (JDataSplit.overlay) {
                            that.movePos(-Math.floor(JDataSplit.splitterPos * JDataSplit.overlayMove), 0);
                            child0.setPosX(-JDataSplit.splitterPos * JDataSplit.overlayMove);
                            child1.setPosX(0);
                            child1.setSize(width, height);
                        }
                        else {
                            child1.setPosX(JDataSplit.splitterPos + splitterThick);
                            child1.setSize(width - (JDataSplit.splitterPos + splitterThick), height);
                        }
                        break;
                    case "ew":
                        if (JDataSplit.splitterPos >= width - splitterThick)
                            JDataSplit.splitterPos = width - splitterThick - 1;
                        var p = width - JDataSplit.splitterPos - splitterThick;
                        splitter.setSize(splitterThick, height);
                        if (JDataSplit.overlay) {
                            that.setPos(p + (width - splitterThick - p) * JDataSplit.overlayMove, 0);
                            child1.setSize(width, height);
                            child0.setPosX(p + splitterThick + (width - splitterThick - p) * JDataSplit.overlayMove);
                            child0.setSize(p + splitterThick, height);
                        }
                        else {
                            splitter.setPos(p, 0);
                            child1.setSize(p, height);
                            child0.setPosX(p + splitterThick);
                            child0.setSize(p + splitterThick, height);
                        }
                        break;
                    case "ns":
                        if (JDataSplit.splitterPos >= height - splitterThick)
                            JDataSplit.splitterPos = height - splitterThick - 1;
                        splitter.setSize(width, splitterThick);
                        if (JDataSplit.overlay) {
                            splitter.setPos(0, JDataSplit.splitterPos - Math.floor(JDataSplit.splitterPos * JDataSplit.overlayMove));
                            child0.movePos(0, -Math.floor(JDataSplit.splitterPos * JDataSplit.overlayMove));
                            child0.setSize(width, JDataSplit.splitterPos);
                            child0.setPosY(0);
                            child1.setSize(width, height);
                        }
                        else {
                            splitter.setPos(0, JDataSplit.splitterPos);
                            child0.setSize(width, JDataSplit.splitterPos);
                            child1.setPosY(JDataSplit.splitterPos + splitterThick);
                            child1.setSize(width, height - (JDataSplit.splitterPos + splitterThick));
                        }
                        break;
                    case "sn":
                        if (JDataSplit.splitterPos >= height - splitterThick)
                            JDataSplit.splitterPos = height - splitterThick - 1;
                        splitter.setSize(width, splitterThick);
                        p = height - JDataSplit.splitterPos - splitterThick;
                        if (JDataSplit.overlay) {
                            splitter.setSize(width, splitterThick);
                            splitter.setPos(0, height - JDataSplit.splitterPos + (JDataSplit.splitterPos - splitterThick) * JDataSplit.overlayMove);
                            child1.setSize(width, height);
                            child0.setPosY(height - JDataSplit.splitterPos + splitterThick + (JDataSplit.splitterPos - splitterThick) * JDataSplit.overlayMove);
                            child0.setSize(width, JDataSplit.splitterPos - splitterThick);
                        }
                        else {
                            splitter.setPos(0, p);
                            child1.setSize(width, p);
                            child0.setPosY(p + splitterThick);
                            child0.setSize(width, p + splitterThick);
                        }
                        break;
                }
            });
            return _this;
        }
        /**
         *子ウインドウの追加
         *
         * @param {number} index 追加位置
         * @param {Window} child 追加ウインドウ
         * @param {('left' | 'right' | 'top' | 'bottom' | 'client' | null)} [arrgement] ドッキングタイプ
         * @memberof Splitter
         */
        Splitter.prototype.addChild = function (index, child, arrgement) {
            this.JDataSplit.childList[index].addChild(child, arrgement);
        };
        /**
         *子ウインドウを切り離す
         *
         * @param {number} index 削除位置
         * @param {Window} [child] 削除ウインドウ
         * @memberof Splitter
         */
        Splitter.prototype.removeChild = function (index, child) {
            if (child == null)
                return;
            this.JDataSplit.childList[index].removeChild(child);
        };
        /**
         *子ウインドウを全て切り離す
         *
         * @param {number} [index] 削除位置
         * @memberof Splitter
         */
        Splitter.prototype.removeChildAll = function (index) {
            if (index == null)
                return;
            this.JDataSplit.childList[index].removeChildAll();
        };
        /**
         *分割バーの位置設定
         *
         * @param {number} pos
         * @param {('ns'|'sn'|'ew'|'we')} [type]
         * @memberof Splitter
         */
        Splitter.prototype.setSplitterPos = function (pos, type) {
            this.JDataSplit.pos = pos;
            if (type) {
                this.JDataSplit.type = type;
            }
            this.JDataSplit.splitterPos = this.JDataSplit.pos;
            if (this.JDataSplit.type != null) {
                this.JDataSplit.splitterType = this.JDataSplit.type;
            }
            this.layout();
        };
        /**
         *動的バーの設定
         *
         * @param {boolean} flag true:有効 false:無効
         * @memberof Splitter
         */
        Splitter.prototype.setOverlay = function (flag) {
            if (flag) {
                this.JDataSplit.overlay = true;
                this.JDataSplit.overlayOpen = true;
                this.JDataSplit.overlayMove = 0;
                this.slideTimeout();
            }
            else {
                this.JDataSplit.overlay = false;
                this.JDataSplit.overlayOpen = true;
                this.JDataSplit.overlayMove = 0;
            }
            this.layout();
        };
        /**
         *子ウインドウの取得
         *
         * @param {number} index 位置
         * @returns {Window} 子ウインドウ
         * @memberof Splitter
         */
        Splitter.prototype.getChild = function (index) {
            return this.JDataSplit.childList[index];
        };
        /**
         *動的バーを閉じる
         *
         * @memberof Splitter
         */
        Splitter.prototype.slideClose = function () {
            if (this.JDataSplit.overlayOpen) {
                this.slide();
            }
        };
        Splitter.prototype.slide = function () {
            if (!this.JDataSplit.overlay || this.slideHandle)
                return;
            this.slideHandle = setInterval(function () {
                if (this.JData.overlayOpen) {
                    this.JData.overlayMove += 0.1;
                    if (this.JData.overlayMove >= 1) {
                        this.JData.overlayMove = 1;
                        this.JData.overlayOpen = false;
                        clearInterval(this.slideHandle);
                        this.slideHandle = null;
                    }
                }
                else {
                    this.JData.overlayMove -= 0.1;
                    if (this.JData.overlayMove < 0) {
                        this.JData.overlayMove = 0;
                        this.JData.overlayOpen = true;
                        clearInterval(this.slideHandle);
                        this.slideHandle = null;
                        this.slideTimeout();
                    }
                }
                this.layout();
            }, 10);
        };
        Splitter.prototype.slideTimeout = function (e) {
            if (e === void 0) { e = null; }
            if (this.slideTimeoutHandle)
                clearTimeout(this.slideTimeoutHandle);
            if (this.JDataSplit.overlay) {
                this.slideTimeoutHandle = setTimeout(function () {
                    if (this.JData.overlayOpen) {
                        this.slide();
                        this.slideTimeoutHandle = null;
                    }
                }, 3000);
            }
            if (e)
                e.preventDefault();
        };
        return Splitter;
    }(Window));
    JSW.Splitter = Splitter;
    var Panel = /** @class */ (function (_super) {
        __extends(Panel, _super);
        function Panel() {
            var _this = _super.call(this) || this;
            _this.setHeight(32);
            var node = _this.getClient();
            node.dataset.kind = 'Panel';
            return _this;
        }
        return Panel;
    }(Window));
    JSW.Panel = Panel;
    /**
     *
     *
     * @export
     * @class TreeItem
     */
    var TreeItem = /** @class */ (function () {
        /**
         *Creates an instance of TreeItem.
         * @param {string} [label]
         * @param {boolean} [opened]
         * @memberof TreeItem
         */
        function TreeItem(label, opened) {
            this.keys = {};
            var that = this;
            var hNode = document.createElement('div');
            this.hNode = hNode;
            hNode.treeItem = this;
            hNode.dataset.kind = 'TreeItem';
            var row1 = document.createElement('div');
            row1.dataset.kind = 'TreeRow';
            hNode.appendChild(row1);
            row1.addEventListener("click", function (e) {
                that.selectItem();
            });
            row1.addEventListener('dragstart', function (e) {
                that.getTreeView().callEvent('itemDragStart', { item: that, event: e });
            });
            row1.addEventListener('dragleave', function (e) {
                row1.dataset.drag = '';
            });
            row1.addEventListener('dragenter', function (e) {
                row1.dataset.drag = 'over';
                event.preventDefault();
            });
            row1.addEventListener('dragover', function (e) {
                //row1.dataset.drag = 'over'
                event.preventDefault();
            });
            row1.addEventListener('drop', function (e) {
                that.getTreeView().callEvent('itemDrop', { event: e, item: that });
                row1.dataset.drag = '';
                event.preventDefault();
            });
            var icon = document.createElement('div');
            icon.dataset.kind = 'TreeIcon';
            row1.appendChild(icon);
            icon.addEventListener("click", function (e) {
                that.openItem(!that.opened);
                e.preventDefault();
                e.stopPropagation();
            });
            var body = document.createElement('div');
            this.body = body;
            row1.appendChild(body);
            body.textContent = label != null ? label : '';
            body.draggable = true;
            var row2 = document.createElement('div');
            row2.dataset.kind = 'TreeRow';
            hNode.appendChild(row2);
            var child = document.createElement('div');
            this.childNode = child;
            child.dataset.kind = 'TreeChild';
            row2.appendChild(child);
            this.openItem(opened);
        }
        /**
         *アイテムのノードを返す
         *
         * @returns {HTMLElement}
         * @memberof TreeItem
         */
        TreeItem.prototype.getNode = function () {
            return this.hNode;
        };
        /**
         *アイテムのラベル部分のノードを返す
         *
         * @returns {HTMLElement}
         * @memberof TreeItem
         */
        TreeItem.prototype.getBody = function () {
            return this.body;
        };
        /**
         *アイテムに対してキーを関連付ける
         *
         * @param {string} name
         * @param {*} value
         * @memberof TreeItem
         */
        TreeItem.prototype.setKey = function (name, value) {
            this.keys[name] = value;
        };
        /**
         *アイテムのキーを取得する
         *
         * @param {string} name
         * @returns
         * @memberof TreeItem
         */
        TreeItem.prototype.getKey = function (name) {
            return this.keys[name];
        };
        /**
         *アイテムを追加する
         *
         * @param {*} [label] ラベル
         * @param {boolean} [opened] オープン状態
         * @returns {TreeItem} 追加したアイテム
         * @memberof TreeItem
         */
        TreeItem.prototype.addItem = function (label, opened) {
            var name;
            var value = null;
            if (label instanceof Array) {
                name = label[0];
                value = label[1];
            }
            else {
                name = label;
            }
            var item = new TreeItem(name, opened);
            if (value != null)
                item.setItemValue(value);
            this.childNode.appendChild(item.getNode());
            this.openItem(this.opened, false);
            return item;
        };
        /**
         *子アイテムを全てクリア
         *
         * @memberof TreeItem
         */
        TreeItem.prototype.clearItem = function () {
            var childs = this.childNode.childNodes;
            while (childs.length) {
                this.childNode.removeChild(childs[0]);
            }
            this.openItem(this.opened);
        };
        /**
         *自分自身を親から切り離す
         *
         * @memberof TreeItem
         */
        TreeItem.prototype.removeItem = function () {
            var treeView = this.getTreeView();
            if (this !== treeView.getRootItem() && this.hNode.parentNode)
                this.hNode.parentNode.removeChild(this.hNode);
        };
        /**
         *子アイテムの数を返す
         *
         * @returns {number}
         * @memberof TreeItem
         */
        TreeItem.prototype.getChildCount = function () {
            return this.childNode.childElementCount;
        };
        /**
         *アイテムに関連付ける値を設定
         *
         * @param {*} value
         * @memberof TreeItem
         */
        TreeItem.prototype.setItemValue = function (value) {
            this.value = value;
        };
        /**
         *アイテムに関連付けた値を取得
         *
         * @returns {*}
         * @memberof TreeItem
         */
        TreeItem.prototype.getItemValue = function () {
            return this.value;
        };
        /**
         *アイテムのラベルを設定
         *
         * @param {string} value
         * @memberof TreeItem
         */
        TreeItem.prototype.setItemText = function (value) {
            this.body.textContent = value;
        };
        /**
         *アイテムのラベルを取得
         *
         * @returns {string}
         * @memberof TreeItem
         */
        TreeItem.prototype.getItemText = function () {
            return this.body.textContent;
        };
        /**
         *子アイテムを取得
         *
         * @param {number} index
         * @returns {TreeItem}
         * @memberof TreeItem
         */
        TreeItem.prototype.getChildItem = function (index) {
            return this.childNode.childNodes[index].treeItem;
        };
        /**
         *親アイテムを取得
         *
         * @returns {TreeItem}
         * @memberof TreeItem
         */
        TreeItem.prototype.getParentItem = function () {
            var parent = this.hNode.parentNode.parentNode.parentNode;
            if (parent.dataset.kind === 'TreeItem')
                return parent.treeItem;
            return null;
        };
        /**
         *自分を含めた階層から値を参照してアイテムを探す
         *
         * @param {*} value
         * @returns {TreeItem}
         * @memberof TreeItem
         */
        TreeItem.prototype.findItemFromValue = function (value) {
            if (this.getItemValue() == value)
                return this;
            var nodes = this.childNode.childNodes;
            var count = nodes.length;
            for (var i = 0; i < count; i++) {
                var child = nodes[i].treeItem;
                var f = child.findItemFromValue(value);
                if (f != null)
                    return f;
            }
            return null;
        };
        /**
         *ツリーを展開する
         *
         * @param {boolean} opened
         * @param {boolean} [anime]
         * @memberof TreeItem
         */
        TreeItem.prototype.openItem = function (opened, anime) {
            var flag = this.opened !== opened;
            this.opened = opened;
            if (this.getChildCount() == 0)
                this.hNode.dataset.stat = "alone";
            else {
                this.hNode.dataset.stat = opened ? "open" : "close";
                if (opened) {
                    var items = this.hNode.querySelectorAll("[data-kind=TreeItem][data-stat=open] > [data-kind=TreeRow]:nth-child(2) > [data-kind=TreeChild] > [data-kind=TreeItem]");
                    for (var i = 0; i < items.length; i++) {
                        var n = items[i];
                        n.style.animation = "treeOpen 0.3s ease 0s 1 normal";
                        n.style.display = 'block';
                    }
                }
                else {
                    var items = this.childNode.querySelectorAll("[data-kind=TreeItem]");
                    for (var i = 0; i < items.length; i++) {
                        var n = items[i];
                        if (anime === false)
                            n.style.animation = "treeClose forwards";
                        else
                            n.style.animation = "treeClose 0.8s ease 0s 1 forwards";
                    }
                }
            }
            if (flag) {
                var treeView = this.getTreeView();
                if (treeView)
                    treeView.callEvent('itemOpen', { item: this, opened: opened });
            }
        };
        /**
         *アイテムを選択する
         *
         * @memberof TreeItem
         */
        TreeItem.prototype.selectItem = function (scroll) {
            var treeView = this.getTreeView();
            treeView.selectItem(this, scroll);
        };
        /**
         *所属先のTreeViewを返す
         *
         * @returns {TreeView}
         * @memberof TreeItem
         */
        TreeItem.prototype.getTreeView = function () {
            var node = this.hNode;
            while (node && node.dataset.kind !== 'TreeView')
                node = node.parentElement;
            if (node)
                return node.treeView;
            return null;
        };
        return TreeItem;
    }());
    JSW.TreeItem = TreeItem;
    /**
     *TreeView用クラス
     *
     * @export
     * @class TreeView
     * @extends {Window}
     */
    var TreeView = /** @class */ (function (_super) {
        __extends(TreeView, _super);
        /**
         *Creates an instance of TreeView.
         * @memberof TreeView
         */
        function TreeView(params) {
            var _this = _super.call(this, params) || this;
            var client = _this.getClient();
            client.dataset.kind = 'TreeView';
            client.treeView = _this;
            var item = new TreeItem('root', true);
            _this.mRootItem = item;
            client.appendChild(item.getNode());
            return _this;
        }
        /**
         * 設定されている相対を条件にアイテムを検索
         *
         * @param {*} value
         * @returns {TreeItem}
         * @memberof TreeView
         */
        TreeView.prototype.findItemFromValue = function (value) {
            return this.mRootItem.findItemFromValue(value);
        };
        /**
         *最上位のアイテムを返す
         *
         * @returns {TreeItem}
         * @memberof TreeView
         */
        TreeView.prototype.getRootItem = function () {
            return this.mRootItem;
        };
        /**
         *最上位の子としてアイテムを追加する
         *
         * @param {*} [label]
         * @param {boolean} [opened]
         * @returns {TreeItem}
         * @memberof TreeView
         */
        TreeView.prototype.addItem = function (label, opened) {
            return this.mRootItem.addItem(label, opened);
        };
        /**
         *アイテムを全て削除する
         *
         * @memberof TreeView
         */
        TreeView.prototype.clearItem = function () {
            this.mRootItem.clearItem();
            this.mRootItem.setItemText('root');
            this.mRootItem.setItemValue(null);
        };
        /**
         *アイテムを選択する
         *子アイテムが使用するので基本的には直接呼び出さない
         * @param {TreeItem} item 選択するアイテム
         * @memberof TreeView
         */
        TreeView.prototype.selectItem = function (item, scroll) {
            var that = this;
            function animationEnd(e) {
                this.removeEventListener('animationend', animationEnd);
                that.getClient().scrollTo(0, item.getNode().offsetTop - that.getClientHeight() / 2);
            }
            if (this.mSelectItem !== item) {
                if (this.mSelectItem)
                    this.mSelectItem.getNode().dataset.select = 'false';
                item.getNode().dataset.select = 'true';
                this.mSelectItem = item;
                item.openItem(true);
                var parent_2 = item;
                while (parent_2 = parent_2.getParentItem()) {
                    parent_2.openItem(true);
                }
                if (scroll) {
                    this.getClient().scrollTo(0, item.getNode().offsetTop - this.getClientHeight() / 2);
                    item.getNode().addEventListener('animationend', animationEnd);
                }
            }
            this.callEvent('itemSelect', { item: item });
        };
        /**
         * 設定されている値を条件にアイテムを選択
         *
         * @param {*} value
         * @memberof TreeView
         */
        TreeView.prototype.selectItemFromValue = function (value) {
            var item = this.mRootItem.findItemFromValue(value);
            if (item)
                item.selectItem();
        };
        /**
         *選択されているアイテムを返す
         *
         * @returns 選択されているアイテム
         * @memberof TreeView
         */
        TreeView.prototype.getSelectItem = function () {
            return this.mSelectItem;
        };
        /**
         *選択されているアイテムの値を返す
         *
         * @returns
         * @memberof TreeView
         */
        TreeView.prototype.getSelectItemValue = function () {
            if (!this.mSelectItem)
                return null;
            return this.mSelectItem.getItemValue();
        };
        TreeView.prototype.addEventListener = function (type, callback, options) {
            _super.prototype.addEventListener.call(this, type, callback, options);
        };
        return TreeView;
    }(Window));
    JSW.TreeView = TreeView;
    /**
     *ListView用クラス
    *
    * @export
    * @class ListView
    * @extends {Window}
    */
    var ListView = /** @class */ (function (_super) {
        __extends(ListView, _super);
        /**
         *Creates an instance of ListView.
         * @param {*} [params] ウインドウ作成パラメータ
         * @memberof ListView
         */
        function ListView(params) {
            var _this = _super.call(this, params) || this;
            _this.lastIndex = 0;
            _this.selectIndexes = [];
            _this.sortIndex = -1;
            _this.sortVector = false;
            _this.columnWidth = [];
            _this.columnAutoIndex = -1;
            var that = _this;
            var client = _this.getClient();
            client.dataset.kind = 'ListView';
            var headerBack = document.createElement('div');
            _this.headerBack = headerBack;
            headerBack.dataset.kind = 'ListHeaderBack';
            client.appendChild(headerBack);
            var headerArea = document.createElement('div');
            _this.headerArea = headerArea;
            headerArea.dataset.kind = 'ListHeaderArea';
            client.appendChild(headerArea);
            var resizers = document.createElement('div');
            _this.resizers = resizers;
            resizers.dataset.kind = 'ListResizers';
            headerArea.appendChild(resizers);
            var headers = document.createElement('div');
            _this.headers = headers;
            headers.dataset.kind = 'ListHeaders';
            headerArea.appendChild(headers);
            var itemArea = document.createElement('div');
            itemArea.dataset.kind = 'ListItemArea';
            _this.itemArea = itemArea;
            client.appendChild(itemArea);
            client.addEventListener('scroll', function () {
                itemArea.style.left = this.scrollLeft + 'px';
                if (itemArea.childElementCount) {
                    var column = itemArea.childNodes[0];
                    column.style.marginLeft = -this.scrollLeft + 'px';
                    headerBack.style.marginLeft = this.scrollLeft + 'px';
                }
            });
            client.addEventListener('dragover', function (e) {
                event.preventDefault();
            });
            client.addEventListener('drop', function (e) {
                that.callEvent('itemDrop', { itemIndex: -1, subItemIndex: -1, event: e });
                event.preventDefault();
            });
            return _this;
        }
        /**
         *カラムのサイズを設定
         *
         * @param {number} index
         * @param {number} size
         * @memberof ListView
         */
        ListView.prototype.setColumnWidth = function (index, size) {
            this.columnWidth[index] = size;
            this.headers.children[index].style.width = size + 'px';
            this.resize();
        };
        /**
         *カラムのスタイルを設定
         *
         * @param {number} col カラム番号
         * @param {('left'|'right'|'center')} style スタイル
         * @memberof ListView
         */
        ListView.prototype.setColumnStyle = function (col, style) {
            var columns = this.itemArea.childNodes;
            var column = columns[col];
            column.style.justifyContent = style;
        };
        /**
         *カラムのスタイルを複数設定
         *
         * @param {(('left' | 'right' | 'center')[])} styles スタイル
         * @memberof ListView
         */
        ListView.prototype.setColumnStyles = function (styles) {
            var columns = this.itemArea.childNodes;
            for (var i = 0, l = styles.length; i < l; i++) {
                var column = columns[i];
                column.vector = styles[i];
            }
        };
        /**
         *ヘッダを追加
         *配列にすると複数追加でき、さらに配列を含めるとサイズが指定できる
         * @param {(string|(string|[string,number])[])} labels ラベル | [ラベル,ラベル,・・・] | [[ラベル,幅],[ラベル,幅],・・・]
         * @param {number} [size] 幅
         * @memberof ListView
         */
        ListView.prototype.addHeader = function (label, size) {
            var headers = this.headers;
            var labels = [];
            if (label instanceof Array)
                labels = label;
            else
                labels = [label];
            var _loop_1 = function (i, l) {
                var label_1 = labels[i];
                var text = void 0;
                var width = size;
                if (label_1 instanceof Array) {
                    text = label_1[0];
                    width = label_1[1];
                }
                else {
                    text = label_1;
                }
                index = headers.childElementCount;
                header = document.createElement('div');
                headers.appendChild(header);
                header.textContent = text;
                if (width != null) {
                    this_1.columnWidth[index] = width;
                    header.style.width = width + 'px';
                }
                else {
                    this_1.columnWidth[index] = header.offsetWidth;
                }
                var that = this_1;
                //ヘッダが押されたらソート処理
                header.addEventListener('click', function () {
                    var j;
                    for (j = 0; j < headers.childElementCount; j++) {
                        if (headers.childNodes[j] === this)
                            break;
                    }
                    var sort = true;
                    if (that.sortIndex === j)
                        sort = !that.sortVector;
                    that.sortItem(j, sort);
                });
                itemArea = this_1.itemArea;
                column = document.createElement('div');
                column.dataset.kind = 'ListColumn';
                this_1.itemArea.appendChild(column);
                //リサイズバーの設定
                resizers = this_1.resizers;
                var resize = document.createElement('div');
                resize.index = index;
                resizers.appendChild(resize);
                Jsw.enableMove(resize);
                resize.addEventListener("move", function (e) {
                    var p = e.params;
                    var x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                    var h = headers.childNodes[this.index];
                    var width = x - h.offsetLeft;
                    h.style.width = width + 'px';
                    that.columnWidth[this.index] = width;
                    for (var i_1 = this.index, length_1 = resizers.childElementCount; i_1 < length_1; i_1++) {
                        var node = headers.children[i_1];
                        var r = resizers.childNodes[i_1];
                        r.style.left = node.offsetLeft + node.offsetWidth + 'px';
                        var column_1 = itemArea.children[i_1];
                        column_1.style.width = node.clientLeft + node.offsetWidth - column_1.clientLeft + 'px';
                    }
                });
            };
            var this_1 = this, index, header, itemArea, column, resizers;
            for (var i = 0, l = labels.length; i < l; i++) {
                _loop_1(i, l);
            }
        };
        /**
         *アイテムのソートを行う
         *
         * @param {number} [index] カラム番号
         * @param {boolean} [order] 方向 true:昇順 false:降順
         * @memberof ListView
         */
        ListView.prototype.sortItem = function (index, order) {
            this.clearSelectItem();
            if (index != null) {
                this.sortIndex = index;
                order = order == null ? true : order;
                this.sortVector = order;
                var headers = this.headers;
                for (var i = 0, length_2 = headers.childElementCount; i < length_2; i++) {
                    if (index === i)
                        headers.childNodes[i].dataset.sort = order ? 'asc' : 'desc';
                    else
                        headers.childNodes[i].dataset.sort = '';
                }
            }
            index = this.sortIndex;
            order = this.sortVector;
            var columns = this.itemArea.childNodes;
            var column = columns[index];
            var items = column.childNodes;
            //ソートリストの作成
            var sortList = [];
            for (var i = 0, length_3 = items.length; i < length_3; i++) {
                sortList.push(i);
            }
            sortList.sort(function (a, b) {
                var v1 = items[a].keyValue != null ? items[a].keyValue : items[a].textContent;
                var v2 = items[b].keyValue != null ? items[b].keyValue : items[b].textContent;
                return (v1 > v2 ? 1 : -1) * (order ? 1 : -1);
            });
            //ソート処理
            for (var i = 0, length_4 = columns.length; i < length_4; i++) {
                var column_2 = columns[i];
                //子ノードの保存と削除
                var items_1 = [];
                while (column_2.childElementCount) {
                    items_1.push(column_2.childNodes[0]);
                    column_2.removeChild(column_2.childNodes[0]);
                }
                //子ノードの再追加
                for (var j = 0, length_5 = sortList.length; j < length_5; j++) {
                    column_2.appendChild(items_1[sortList[j]]);
                }
            }
        };
        /**
         *アイテムを選択する
         *すでにある選択は解除される
         * @param {(number | number[])} index レコード番号
         * @memberof ListView
         */
        ListView.prototype.selectItem = function (index) {
            this.clearSelectItem();
            this.addSelectItem(index);
        };
        /**
         *アイテムの選択を全て解除する
         *
         * @memberof ListView
         */
        ListView.prototype.clearSelectItem = function () {
            var columns = this.itemArea.childNodes;
            for (var i = 0, length_6 = columns.length; i < length_6; i++) {
                var column = columns[i];
                for (var j = 0, l = this.selectIndexes.length; j < l; j++) {
                    column.childNodes[this.selectIndexes[j]].dataset.itemSelect = 'false';
                }
            }
            this.selectIndexes = [];
        };
        /**
         *アイテムの選択を追加する
         *
         * @param {(number | number[])} index レコード番号
         * @memberof ListView
         */
        ListView.prototype.addSelectItem = function (index) {
            var indexes = (index instanceof Array ? index : [index]);
            Array.prototype.push.apply(this.selectIndexes, indexes);
            var columns = this.itemArea.childNodes;
            for (var i = 0, length_7 = columns.length; i < length_7; i++) {
                var column = columns[i];
                for (var j = 0, l = this.selectIndexes.length; j < l; j++) {
                    column.childNodes[this.selectIndexes[j]].dataset.itemSelect = 'true';
                }
            }
        };
        /**
         *アイテムの選択を解除する
         *
         * @param {(number | number[])} index レコード番号
         * @memberof ListView
         */
        ListView.prototype.delSelectItem = function (index) {
            var indexes = (typeof index === 'object' ? index : [index]);
            var columns = this.itemArea.childNodes;
            for (var i = 0, length_8 = columns.length; i < length_8; i++) {
                var column = columns[i];
                for (var j = 0, l = indexes.length; j < l; j++) {
                    column.childNodes[indexes[j]].dataset.itemSelect = 'false';
                }
            }
            var newIndexes = [];
            for (var j = 0, l = this.selectIndexes.length; j < l; j++) {
                var index_1 = this.selectIndexes[j];
                if (indexes.indexOf(index_1) < 0)
                    newIndexes.push(index_1);
            }
            this.selectIndexes = newIndexes;
        };
        /**
         *アイテムが選択されているか返す
         *
         * @param {number} index レコード番号
         * @returns {boolean}
         * @memberof ListView
         */
        ListView.prototype.isSelectItem = function (index) {
            return this.selectIndexes.indexOf(index) >= 0;
        };
        ListView.getIndexOfNode = function (node) {
            return [].slice.call(node.parentNode.childNodes).indexOf(node);
        };
        /**
         *アイテムを全て削除する
         *
         * @memberof ListView
         */
        ListView.prototype.clearItem = function () {
            this.selectIndexes = [];
            var columns = this.itemArea.childNodes;
            for (var i = 0, length_9 = columns.length; i < length_9; i++) {
                var column = columns[i];
                while (column.childElementCount)
                    column.removeChild(column.childNodes[0]);
            }
        };
        /**
         *対象セルのノードを取得
         *
         * @param {number} row
         * @param {number} col
         * @returns
         * @memberof ListView
         */
        ListView.prototype.getCell = function (row, col) {
            var columns = this.itemArea.childNodes;
            var column = columns[col];
            if (column == null)
                return null;
            return column.childNodes[row];
        };
        /**
         *アイテムに値を設定する
         *
         * @param {number} index レコード番号
         * @param {*} value 値
         * @memberof ListView
         */
        ListView.prototype.setItemValue = function (index, value) {
            var cell = this.getCell(index, 0);
            if (cell)
                cell.value = value;
        };
        /**
         *アイテムの値を取得する
         *
         * @param {number} index レコード番号
         * @returns 値
         * @memberof ListView
         */
        ListView.prototype.getItemValue = function (index) {
            var cell = this.getCell(index, 0);
            return cell.value;
        };
        /**
         *最初に選択されているアイテムを返す
         *
         * @returns {number}
         * @memberof ListView
         */
        ListView.prototype.getSelectItem = function () {
            for (var _i = 0, _a = this.selectIndexes; _i < _a.length; _i++) {
                var index = _a[_i];
                return index;
            }
            return -1;
        };
        /**
         *選択されている値を全て取得する
         *
         * @returns {any[]}
         * @memberof ListView
         */
        ListView.prototype.getSelectValues = function () {
            var values = [];
            for (var _i = 0, _a = this.selectIndexes; _i < _a.length; _i++) {
                var index = _a[_i];
                values.push(this.getItemValue(index));
            }
            return values;
        };
        /**
         *指定行のセルノードを返す
         *
         * @param {number} row
         * @returns
         * @memberof ListView
         */
        ListView.prototype.getLineCells = function (row) {
            var cells = [];
            var columns = this.itemArea.childNodes;
            for (var i = 0, length_10 = columns.length; i < length_10; i++) {
                var column = columns[i];
                cells.push(column.childNodes[row]);
            }
            return cells;
        };
        /**
         *アイテムを追加する
         *アイテムはテキストかノードが指定できる
         *配列を渡した場合は、複数追加となる
         * @param {(string|(string|HTMLElement)[])} value テキストもしくはノード
         * @returns
         * @memberof ListView
         */
        ListView.prototype.addItem = function (value) {
            var vector = { left: 'flex-start', center: 'center', right: 'flex-end' };
            var that = this;
            var columns = this.itemArea.childNodes;
            for (var i = 0, length_11 = columns.length; i < length_11; i++) {
                var column = columns[i];
                var cell = document.createElement('div');
                cell.draggable = true;
                cell.dataset.kind = 'ListCell';
                if (column.vector)
                    cell.style.justifyContent = vector[column.vector];
                column.appendChild(cell);
                cell.addEventListener('mouseover', function (e) {
                    var index = ListView.getIndexOfNode(this);
                    for (var i_2 = 0, length_12 = columns.length; i_2 < length_12; i_2++) {
                        var column_3 = columns[i_2];
                        if (that.overIndex != null && that.overIndex < column_3.childElementCount) {
                            column_3.childNodes[that.overIndex].dataset.itemHover = 'false';
                        }
                        column_3.childNodes[index].dataset.itemHover = 'true';
                    }
                    that.overIndex = index;
                });
                cell.addEventListener('dragstart', function (e) {
                    var index = ListView.getIndexOfNode(this);
                    var index2 = ListView.getIndexOfNode(this.parentNode);
                    that.callEvent('itemDragStart', { itemIndex: index, subItemIndex: index2, event: e });
                });
                cell.addEventListener('dragleave', function (e) {
                    var index = ListView.getIndexOfNode(this);
                    var cells = that.getLineCells(index);
                    for (var _i = 0, cells_1 = cells; _i < cells_1.length; _i++) {
                        var cell_1 = cells_1[_i];
                        cell_1.dataset.drag = '';
                    }
                });
                cell.addEventListener('dragenter', function (e) {
                    var index = ListView.getIndexOfNode(this);
                    var cells = that.getLineCells(index);
                    for (var _i = 0, cells_2 = cells; _i < cells_2.length; _i++) {
                        var cell_2 = cells_2[_i];
                        cell_2.dataset.drag = 'over';
                    }
                    event.preventDefault();
                });
                cell.addEventListener('dragover', function (e) {
                    event.preventDefault();
                });
                cell.addEventListener('drop', function (e) {
                    var index = ListView.getIndexOfNode(this);
                    var index2 = ListView.getIndexOfNode(this.parentNode);
                    var cells = that.getLineCells(index);
                    for (var _i = 0, cells_3 = cells; _i < cells_3.length; _i++) {
                        var cell_3 = cells_3[_i];
                        cell_3.dataset.drag = 'over';
                    }
                    that.callEvent('itemDrop', { itemIndex: index, subItemIndex: index2, event: e });
                    event.preventDefault();
                });
                cell.addEventListener('dragstart', function (e) {
                    var index = ListView.getIndexOfNode(this);
                    var index2 = ListView.getIndexOfNode(this.parentNode);
                    that.callEvent('itemDragStart', { itemIndex: index, subItemIndex: index2, event: e });
                });
                cell.addEventListener('click', function (e) {
                    var index = ListView.getIndexOfNode(this);
                    var index2 = ListView.getIndexOfNode(this.parentNode);
                    if (e.ctrlKey) {
                        if (!that.isSelectItem(index))
                            that.addSelectItem(index);
                        else
                            that.delSelectItem(index);
                    }
                    else if (e.shiftKey) {
                        var indexes = [];
                        var s = Math.min(that.lastIndex, index);
                        var e_1 = Math.max(that.lastIndex, index);
                        for (var i_3 = s; i_3 <= e_1; i_3++)
                            indexes.push(i_3);
                        that.selectItem(indexes);
                    }
                    else
                        that.selectItem(index);
                    that.lastIndex = index;
                    that.callEvent('itemClick', { itemIndex: index, subItemIndex: index2, event: e });
                });
                cell.addEventListener('dblclick', function (e) {
                    var index = ListView.getIndexOfNode(this);
                    var index2 = ListView.getIndexOfNode(this.parentNode);
                    that.callEvent('itemDblClick', { itemIndex: index, subItemIndex: index2, event: e });
                });
            }
            if (columns.length === 0)
                return -1;
            var index = columns[0].childElementCount - 1;
            if (value instanceof Array) {
                for (var i = 0, l = value.length; i < l; i++) {
                    this.setItem(index, i, value[i]);
                }
            }
            else
                this.setItem(index, 0, value);
            return index;
        };
        /**
         *ソート用のキーを設定する
         *
         * @param {number} row レコード番号
         * @param {number} column カラム番号
         * @param {*} value キー
         * @returns
         * @memberof ListView
         */
        ListView.prototype.setSortKey = function (row, column, value) {
            var c = this.itemArea.childNodes[column];
            if (c == null)
                return false;
            var r = c.childNodes[row];
            if (r == null)
                return false;
            r.keyValue = value;
            return true;
        };
        /**
         *ソート用のキーをまとめて設定する
         *
         * @param {number} row レコード番号
         * @param {any[]} values キー配列
         * @memberof ListView
         */
        ListView.prototype.setSortKeys = function (row, values) {
            for (var i = 0, l = values.length; i < l; i++) {
                var c = this.itemArea.childNodes[i];
                if (c == null)
                    break;
                var r = c.childNodes[row];
                if (r == null)
                    break;
                r.keyValue = values[i];
            }
        };
        /**
         *アイテムを書き換える
         *
         * @param {number} row レコード番号
         * @param {number} column カラム番号
         * @param {(string|HTMLElement)} value テキストもしくはノード
         * @returns
         * @memberof ListView
         */
        ListView.prototype.setItem = function (row, column, value) {
            var c = this.itemArea.childNodes[column];
            if (c == null)
                return false;
            var r = c.childNodes[row];
            if (r == null)
                return false;
            if (!(value instanceof HTMLElement)) {
                var item = document.createElement('div');
                item.textContent = value;
                r.appendChild(item);
            }
            else {
                r.appendChild(value);
            }
        };
        /**
         *ヘッダに合わせてカラムサイズを調整する
         *基本的には直接呼び出さない
         * @memberof ListView
         */
        ListView.prototype.resize = function () {
            var headers = this.headers;
            var resizers = this.resizers;
            var itemArea = this.itemArea;
            var lmitWidth = this.getClientWidth();
            for (var i = 0, length_13 = headers.childElementCount; i < length_13; i++) {
                lmitWidth -= this.columnWidth[i];
            }
            var autoIndex = this.columnAutoIndex;
            for (var i = 0, length_14 = headers.childElementCount; i < length_14; i++) {
                var node = headers.childNodes[i];
                var resize = resizers.childNodes[i];
                var column = itemArea.children[i];
                var width = this.columnWidth[i];
                if (autoIndex === i || (autoIndex === -1 && i === length_14 - 1))
                    width += lmitWidth;
                node.style.width = width + 'px';
                resize.style.left = node.offsetLeft + width - resize.offsetWidth / 2 + 'px';
                column.style.width = width + 'px';
            }
        };
        ListView.prototype.onLayout = function (flag) {
            _super.prototype.onLayout.call(this, flag);
            this.resize();
        };
        ListView.prototype.addEventListener = function (type, callback, options) {
            _super.prototype.addEventListener.call(this, type, callback, options);
        };
        return ListView;
    }(Window));
    JSW.ListView = ListView;
})(JSW || (JSW = {}));
//# sourceMappingURL=Window.js.map