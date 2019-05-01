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
var JSW;
(function (JSW) {
    var Adapter = /** @class */ (function () {
        function Adapter(scriptUrl, keyName) {
            this.functionSet = [];
            this.scriptUrl = scriptUrl;
            this.keyName = keyName || 'Session';
        }
        Adapter.prototype.exec = function (v1) {
            var v2 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                v2[_i - 1] = arguments[_i];
            }
            var functionSet;
            if (Array.isArray(v1)) {
                var functions = [];
                for (var _a = 0, _b = v1; _a < _b.length; _a++) {
                    var func = _b[_a];
                    functions.push({ name: func[0], params: func.slice(1) });
                }
                functionSet = { functions: functions, promise: {}, array: true };
            }
            else {
                functionSet = { functions: [{ name: v1, params: v2 }], promise: {}, array: false };
            }
            var promise = new Promise(function (resolve, reject) {
                functionSet.promise.resolve = resolve;
                functionSet.promise.reject = reject;
            });
            this.functionSet.push(functionSet);
            this.callSend();
            return promise;
        };
        Adapter.prototype.callSend = function () {
            var _this = this;
            if (!this.handle) {
                this.handle = window.setTimeout(function () { _this.send(); }, 0);
            }
        };
        Adapter.prototype.send = function () {
            var _this = this;
            this.handle = null;
            var globalHash = localStorage.getItem(this.keyName);
            var sessionHash = sessionStorage.getItem(this.keyName);
            var functionSet = this.functionSet;
            this.functionSet = [];
            var params = {
                globalHash: globalHash,
                sessionHash: sessionHash,
                functions: []
            };
            for (var _i = 0, functionSet_1 = functionSet; _i < functionSet_1.length; _i++) {
                var funcs = functionSet_1[_i];
                for (var _a = 0, _b = funcs.functions; _a < _b.length; _a++) {
                    var func = _b[_a];
                    params.functions.push({ function: func.name, params: func.params });
                }
            }
            Adapter.sendJson(this.scriptUrl + '?cmd=exec', params, function (res) {
                if (res == null) {
                    for (var _i = 0, functionSet_2 = functionSet; _i < functionSet_2.length; _i++) {
                        var funcs = functionSet_2[_i];
                        console.error('通信エラー');
                        funcs.promise.reject('通信エラー');
                    }
                }
                else {
                    if (res.globalHash)
                        localStorage.setItem(_this.keyName, res.globalHash);
                    if (res.sessionHash)
                        sessionStorage.setItem(_this.keyName, res.sessionHash);
                    var results = res.results;
                    var index = 0;
                    for (var _a = 0, functionSet_3 = functionSet; _a < functionSet_3.length; _a++) {
                        var funcs = functionSet_3[_a];
                        var length_1 = funcs.functions.length;
                        if (funcs.array) {
                            var values = [];
                            for (var i = index; i < length_1; i++) {
                                if (results[i].error) {
                                    console.error(results[i].error);
                                    funcs.promise.reject(results[i].error);
                                    break;
                                }
                                values.push(results[i].value);
                            }
                            funcs.promise.resolve(values);
                        }
                        else {
                            var result = results[index];
                            if (result.error)
                                console.error(result.error);
                            else
                                funcs.promise.resolve(result.value);
                        }
                        index += length_1;
                    }
                }
            });
        };
        Adapter.sendJsonAsync = function (url, data, headers) {
            return new Promise(function (resolve) {
                Adapter.sendJson(url, data, function (value) {
                    resolve(value);
                }, headers);
            });
        };
        Adapter.sendJson = function (url, data, proc, headers) {
            var req = new XMLHttpRequest();
            //ネイティブでJSON変換が可能かチェック
            var jsonFlag = false;
            try {
                req.responseType = 'json';
            }
            catch (e) {
                jsonFlag = true;
            }
            if (proc == null) {
                req.open('POST', url, false);
                return JSON.parse(req.responseText);
            }
            else {
                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        var obj = null;
                        try {
                            if (jsonFlag) //JSON変換の仕分け
                                obj = JSON.parse(req.response);
                            else
                                obj = req.response;
                        }
                        catch (e) {
                            proc(null);
                            return;
                        }
                        proc(obj);
                    }
                };
            }
            req.open('POST', url, true);
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            if (headers) {
                for (var index in headers) {
                    req.setRequestHeader(index, sessionStorage.getItem(headers[index]));
                }
            }
            req.send(data == null ? null : JSON.stringify(data));
        };
        return Adapter;
    }());
    JSW.Adapter = Adapter;
})(JSW || (JSW = {}));
/**
 * JavaScriptWindowフレームワーク用名前空間
 * namespaceの前に「export」を入れると、モジュールとして利用可能
*/
var JSW;
(function (JSW) {
    //---------------------------------------
    //書式付文字列生成
    //	引数	format,・・・
    //	戻り値	生成文字列
    function sprintf(format) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (args[0] == null)
            return '';
        var paramIndex = 0;
        var dest = "";
        for (var i = 0; format.charAt(i); i++) {
            if (format.charAt(i) == '%') {
                var flagZero = false;
                var num = 0;
                i++;
                if (format.charAt(i) == '0') {
                    flagZero = true;
                    i++;
                }
                for (; format.charAt(i) >= '0' && format.charAt(i) <= '9'; i++) {
                    num *= 10;
                    num += parseInt(format.charAt(i));
                }
                switch (format.charAt(i)) {
                    case 's':
                        var work = String(args[paramIndex++]);
                        var len = num - work.length;
                        dest += work;
                        var len = num - work.length;
                        if (len > 0) {
                            for (j = 0; j < len; j++)
                                dest += ' ';
                        }
                        break;
                    case 'd':
                        var work = String(args[paramIndex++]);
                        var len = num - work.length;
                        if (len > 0) {
                            var j;
                            var c;
                            if (flagZero)
                                c = '0';
                            else
                                c = ' ';
                            for (j = 0; j < len; j++)
                                dest += c;
                        }
                        dest += work;
                }
            }
            else
                dest += format.charAt(i);
        }
        return dest;
    }
    JSW.sprintf = sprintf;
    /**
     * ウインドウ等総合管理クラス
     *
     * @export
     * @class Jsw
     */
    var WindowManager = /** @class */ (function () {
        function WindowManager() {
        }
        /**
         * マウスとタッチイベントの座標取得処理
         * @param  {MouseEvent|TouchEvent} e
         * @returns {Point} マウスの座標
         */
        WindowManager.getPos = function (e) {
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
        WindowManager.enableMove = function (node) {
            function mouseDown(e) {
                if (WindowManager.moveNode == null) {
                    WindowManager.moveNode = node;
                    var p = WindowManager.getPos(e);
                    WindowManager.baseX = p.x;
                    WindowManager.baseY = p.y;
                    WindowManager.nodeX = node.offsetLeft;
                    WindowManager.nodeY = node.offsetTop;
                    WindowManager.nodeWidth = node.clientWidth;
                    WindowManager.nodeHeight = node.clientWidth;
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
        WindowManager.callEvent = function (node, ename, params) {
            node.dispatchEvent(WindowManager.createEvent(ename, params));
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
        WindowManager.createEvent = function (ename, params) {
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
        WindowManager.createElement = function (tagName, params) {
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
        WindowManager.layout = function (flag) {
            WindowManager.layoutForced = WindowManager.layoutForced || flag;
            if (!WindowManager.layoutHandler) {
                //タイマーによる遅延実行
                WindowManager.layoutHandler = setTimeout(function () {
                    WindowManager.layoutHandler = null;
                    var nodes = document.querySelectorAll("[data-jsw=Window]");
                    var count = nodes.length;
                    for (var i = 0; i < count; i++) {
                        var node = nodes[i];
                        if (!node.Jsw.getParent())
                            node.Jsw.onMeasure(WindowManager.layoutForced);
                        node.Jsw.onLayout(WindowManager.layoutForced);
                    }
                    WindowManager.layoutForced = false;
                }, 0);
            }
        };
        WindowManager.moveNode = null;
        WindowManager.frame = null;
        return WindowManager;
    }());
    JSW.WindowManager = WindowManager;
    //各イベント設定
    addEventListener("resize", function () { WindowManager.layout(true); });
    addEventListener("mouseup", mouseUp, false);
    addEventListener("touchend", mouseUp, { passive: false });
    addEventListener("mousemove", mouseMove, false);
    addEventListener("touchmove", mouseMove, { passive: false });
    addEventListener("touchstart", mouseDown, { passive: false });
    addEventListener("mousedown", mouseDown, false);
    function mouseDown(e) {
        var node = e.target;
        do {
            if (node.dataset && node.dataset.jsw === "Window") {
                return;
            }
        } while (node = node.parentNode);
        deactive();
        return false;
    }
    function deactive() {
        var activeWindows = document.querySelectorAll('[data-jsw="Window"][data-jsw-active="true"]');
        for (var i = 0, l = activeWindows.length; i < l; i++) {
            var w = activeWindows[i];
            w.dataset.jswActive = 'false';
            w.Jsw.callEvent('active', { active: false });
        }
    }
    //マウスが離された場合に選択をリセット
    function mouseUp() {
        WindowManager.moveNode = null;
        WindowManager.frame = null;
    }
    //マウス移動時の処理
    function mouseMove(e) {
        if (WindowManager.moveNode) {
            var node = WindowManager.moveNode; //移動中ノード
            var p = WindowManager.getPos(e); //座標の取得
            var params = {
                event: e,
                nodePoint: { x: WindowManager.nodeX, y: WindowManager.nodeY },
                basePoint: { x: WindowManager.baseX, y: WindowManager.baseY },
                nowPoint: { x: p.x, y: p.y },
                nodeSize: { width: node.clientWidth, height: node.clientHeight }
            };
            WindowManager.callEvent(node, 'move', params);
        }
    }
})(JSW || (JSW = {}));
/// <reference path="./jsw.ts" />
var JSW;
(function (JSW) {
    //各サイズ
    var FRAME_SIZE = 10; //フレーム枠のサイズ
    var TITLE_SIZE = 24; //タイトルバーのサイズ
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
            var _this = this;
            this.Events = new Map();
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
                reshow: true,
                noActive: false,
                animation: {},
                animationEnable: true,
                autoSizeNode: null
            };
            //ウインドウ用ノードの作成
            var hNode = document.createElement('DIV');
            hNode.Jsw = this;
            this.hNode = hNode;
            hNode.dataset.jsw = "Window";
            //位置を絶対位置指定
            hNode.style.position = 'absolute';
            hNode.style.visibility = 'hidden';
            //クライアント領域を作成
            var client = document.createElement('div');
            this.JData.clientArea = client;
            client.dataset.jswType = 'client';
            hNode.appendChild(client);
            //パラメータに従いウインドウの作成
            if (params) {
                if (params.frame) {
                    this.addFrame(params.title == null ? true : params.title);
                    if (params.layer == null)
                        this.setOrderLayer(10);
                    if (params.overlap == null)
                        this.setOverlap(true);
                    this.JData.animation['show'] = 'JSWFrameShow 0.5s ease 0s 1 normal';
                    this.JData.animation['close'] = 'JSWclose 0.2s ease 0s 1 forwards';
                    this.JData.animation['maximize'] = 'JSWmaximize 0.2s ease 0s 1 forwards';
                    this.JData.animation['minimize'] = 'JSWminimize 0.2s ease 0s 1 forwards';
                    this.JData.animation['maxrestore'] = 'JSWmaxrestore 0.2s ease 0s 1 forwards';
                    this.JData.animation['restore'] = 'JSWrestore 0.2s ease 0s 1 forwards';
                }
                if (params.layer) {
                    this.setOrderLayer(params.layer);
                }
                if (params.overlap) {
                    this.setOverlap(params.overlap);
                }
            }
            hNode.addEventListener("animationend", function () {
                _this.layout();
            });
            // hNode.addEventListener("animationiteration", () => {
            // 	this.layout()
            // });
            // hNode.addEventListener("animationstart", () => {
            // 	this.layout()
            // });
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
            //表示
            this.show(true);
            //更新要求
            this.layout();
            //新規ウインドウをフォアグラウンドにする
            this.foreground(false);
        }
        Window.prototype.setOverlap = function (flag) {
            this.hNode.style.position = flag ? 'fixed' : 'absolute';
        };
        Window.prototype.setJswStyle = function (style) {
            this.getClient().dataset.jswStyle = style;
        };
        Window.prototype.getJswStyle = function () {
            return this.getNode().dataset.jswStyle;
        };
        //フレーム追加処理
        Window.prototype.addFrame = function (titleFlag) {
            this.hNode.dataset.jswType = 'Frame';
            //タイトルの設定
            this.JData.titleSize = titleFlag ? TITLE_SIZE : 0;
            this.hNode.style.minHeight = this.JData.titleSize + "px";
            //各パーツのスタイル設定
            var frameStyles = [
                ["border", "cursor:n-resize; left:0px;top:-{0}px;right:0px;height:{0}px;"],
                ["border", "cursor:e-resize; top:0px;right:-{0}px;bottom:0px;width:{0}px;"],
                ["border", "cursor:s-resize; left:0px;right:0px;height:{0}px;bottom:-{0}px;"],
                ["border", "cursor:w-resize; top:0px;left:-{0}px;bottom:0px;width:{0}px;"],
                ["border", "cursor:nw-resize;left:-{0}px;top:-{0}px;width:{0}px;height:{0}px;"],
                ["border", "cursor:ne-resize;right:-{0}px;top:-{0}px;width:{0}px;height:{0}px;"],
                ["border", "cursor:sw-resize;left:-{0}px;bottom:-{0}px;width:{0}px;height:{0}px;"],
                ["border", "cursor:se-resize;right:-{0}px;bottom:-{0}px;width:{0}px;height:{0}px;"],
                ["title", "left:0px;top:0px;right:0px;height:{1}px"] //タイトル
            ];
            //フレームクリックイベントの処理
            function onFrame() {
                if (JSW.WindowManager.frame == null)
                    JSW.WindowManager.frame = this.dataset.index;
                //EDGEはここでイベントを止めないとテキスト選択が入る
                //if (WindowManager.frame < 9)
                //	if (e.preventDefault) e.preventDefault(); else e.returnValue = false
            }
            //フレームとタイトル、クライアント領域の作成
            for (var i = 0; i < frameStyles.length; i++) {
                var frame = document.createElement('div');
                frame.style.cssText = frameStyles[i][1].replace(/\{0\}/g, FRAME_SIZE.toString()).replace(/\{1\}/g, this.JData.titleSize.toString());
                frame.dataset.index = i.toString();
                frame.dataset.jswType = frameStyles[i][0];
                this.hNode.appendChild(frame);
                frame.addEventListener("touchstart", onFrame, { passive: false });
                frame.addEventListener("touchend", function () { JSW.WindowManager.frame = null; }, { passive: false });
                frame.addEventListener("mousedown", onFrame, false);
                frame.addEventListener("mouseup", function () { JSW.WindowManager.frame = null; }, false);
            }
            this.JData.frameSize = 1;
            this.getClient().style.top = this.JData.titleSize + 'px';
            var node = this.hNode;
            //タイトルバーの作成
            var title = node.childNodes[9];
            var titleText = JSW.WindowManager.createElement("div", { "dataset": { jswType: "text" } });
            title.appendChild(titleText);
            //アイコンの作成
            var icons = ["min", "max", "close"];
            for (var index in icons) {
                var icon = JSW.WindowManager.createElement("div", { style: { "width": this.JData.titleSize + "px", "height": this.JData.titleSize + "px" }, "dataset": { jswType: "icon", jswKind: icons[index] } });
                title.appendChild(icon);
                icon.addEventListener("click", function () {
                    JSW.WindowManager.callEvent(node, "JSW" + this.dataset.jswKind);
                });
            }
        };
        Window.prototype.onMouseDown = function (e) {
            if (JSW.WindowManager.moveNode == null) {
                this.foreground();
                JSW.WindowManager.moveNode = this.hNode;
                var p = JSW.WindowManager.getPos(e);
                JSW.WindowManager.baseX = p.x;
                JSW.WindowManager.baseY = p.y;
                JSW.WindowManager.nodeX = this.getPosX();
                JSW.WindowManager.nodeY = this.getPosY();
                JSW.WindowManager.nodeWidth = this.getWidth();
                JSW.WindowManager.nodeHeight = this.getHeight();
                e.stopPropagation();
                return false;
            }
            else {
                e.preventDefault();
            }
        };
        Window.prototype.onMouseMove = function (e) {
            var p = e.params;
            var x = this.getPosX();
            var y = this.getPosY();
            var width = this.getWidth();
            var height = this.getHeight();
            //選択されている場所によって挙動を変える
            var frameIndex = parseInt(JSW.WindowManager.frame);
            switch (frameIndex) {
                case 0: //上
                    y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
                    height = JSW.WindowManager.nodeHeight - (p.nowPoint.y - p.basePoint.y);
                    break;
                case 1: //右
                    width = JSW.WindowManager.nodeWidth + (p.nowPoint.x - p.basePoint.x);
                    break;
                case 2: //下
                    height = JSW.WindowManager.nodeHeight + (p.nowPoint.y - p.basePoint.y);
                    break;
                case 3: //左
                    x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                    width = JSW.WindowManager.nodeWidth - (p.nowPoint.x - p.basePoint.x);
                    break;
                case 4: //左上
                    x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                    y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
                    width = JSW.WindowManager.nodeWidth - (p.nowPoint.x - p.basePoint.x);
                    height = JSW.WindowManager.nodeHeight - (p.nowPoint.y - p.basePoint.y);
                    break;
                case 5: //右上
                    y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
                    width = JSW.WindowManager.nodeWidth + (p.nowPoint.x - p.basePoint.x);
                    height = JSW.WindowManager.nodeHeight - (p.nowPoint.y - p.basePoint.y);
                    break;
                case 6: //左下
                    x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                    width = JSW.WindowManager.nodeWidth - (p.nowPoint.x - p.basePoint.x);
                    height = JSW.WindowManager.nodeHeight + (p.nowPoint.y - p.basePoint.y);
                    break;
                case 7: //右下
                    width = JSW.WindowManager.nodeWidth + (p.nowPoint.x - p.basePoint.x);
                    height = JSW.WindowManager.nodeHeight + (p.nowPoint.y - p.basePoint.y);
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
            if (frameIndex < 9 || this.JData.moveable) {
                p.event.preventDefault();
                try {
                    window.getSelection().removeAllRanges();
                }
                catch (e) { }
            }
        };
        /**
         *イベントの受け取り
         *
         * @param {string} type イベントタイプ
         * @param {*} listener コールバックリスナー
         * @memberof Window
         */
        Window.prototype.addEventListener = function (type, listener) {
            var eventData = this.Events.get(type);
            if (!eventData) {
                eventData = [];
                this.Events.set(type, eventData);
            }
            for (var _i = 0, eventData_1 = eventData; _i < eventData_1.length; _i++) {
                var ev = eventData_1[_i];
                if (String(ev) === String(listener))
                    return;
            }
            eventData.push(listener);
        };
        /**
         *イベントの削除
         *
         * @template K
         * @param {(K | string)} type イベントタイプ
         * @param {(this: Window, ev: WINDOW_EVENT_MAP[K]) => any} listener コールバックリスナー
         * @memberof Window
         */
        Window.prototype.removeEventListener = function (type, listener) {
            if (listener == null) {
                this.Events.delete(type);
                return;
            }
            var eventData = this.Events.get(type);
            if (!eventData) {
                eventData = [];
                this.Events.set(type, eventData);
            }
            for (var index in eventData) {
                if (String(eventData[index]) === String(listener)) {
                    eventData.splice(parseInt(index), 1);
                }
            }
        };
        /**
         *イベントの要求
         *
         * @param {string} type イベントタイプ
         * @param {*} params パラメータ
         * @memberof Window
         */
        Window.prototype.callEvent = function (type, params) {
            var eventData = this.Events.get(type);
            if (eventData) {
                for (var _i = 0, eventData_2 = eventData; _i < eventData_2.length; _i++) {
                    var ev = eventData_2[_i];
                    ev(params);
                }
            }
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
        Window.prototype.setNoActive = function (flag) {
            this.JData.noActive = flag;
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
            if (this.JData.x === x && this.JData.y === y)
                return;
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
            x = parseInt(x);
            if (this.JData.x === x)
                return;
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
            y = parseInt(y);
            if (this.JData.x === y)
                return;
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
            width = parseInt(width);
            height = parseInt(height);
            if (this.JData.width === width && this.JData.height === height)
                return;
            this.JData.width = width;
            this.JData.height = height;
            this.layout();
            if (this.getParent())
                this.getParent().layout();
        };
        /**
         *ウインドウの幅の設定
         *
         * @param {number} width
         * @memberof Window
         */
        Window.prototype.setWidth = function (width) {
            width = parseInt(width);
            if (this.JData.width === width)
                return;
            this.JData.width = width;
            this.layout();
            if (this.getParent())
                this.getParent().layout();
        };
        /**
         *ウインドウの高さの設定
         *
         * @param {number} height
         * @memberof Window
         */
        Window.prototype.setHeight = function (height) {
            height = parseInt(height);
            if (this.JData.height === height)
                return;
            this.JData.height = height;
            this.layout();
            if (this.getParent())
                this.getParent().layout();
        };
        Window.prototype.setPadding = function (p1, p2, p3, p4) {
            if (typeof p2 === 'undefined') {
                this.JData.padding.x1 = p1;
                this.JData.padding.y1 = p1;
                this.JData.padding.x2 = p1;
                this.JData.padding.y2 = p1;
            }
            else {
                this.JData.padding.x1 = p1;
                this.JData.padding.y1 = p2;
                this.JData.padding.x2 = p3;
                this.JData.padding.y2 = p4;
            }
        };
        Window.prototype.setMargin = function (p1, p2, p3, p4) {
            if (typeof p2 === 'undefined') {
                this.JData.margin.x1 = p1;
                this.JData.margin.y1 = p1;
                this.JData.margin.x2 = p1;
                this.JData.margin.y2 = p1;
            }
            else {
                this.JData.margin.x1 = p1;
                this.JData.margin.y1 = p2;
                this.JData.margin.x2 = p3;
                this.JData.margin.y2 = p4;
            }
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
            var _this = this;
            var node = this.getNode();
            this.JData.visible = flag;
            if (flag) {
                node.style.display = '';
                var animation = this.JData.animationEnable ? this.JData.animation['show'] : '';
                var animationEnd_1 = function () {
                    _this.callEvent('visibled', { visible: true });
                    node.removeEventListener("animationend", animationEnd_1);
                    node.style.animation = '';
                    node.style.display = '';
                };
                if (animation) {
                    node.addEventListener("animationend", animationEnd_1);
                    node.style.animation = animation;
                }
                else {
                    node.style.animation = '';
                    animationEnd_1.bind(node)();
                }
            }
            else {
                var animationEnd_2 = function () {
                    var nodes = node.querySelectorAll('[data-jsw="Window"]');
                    var count = nodes.length;
                    for (var i = 0; i < count; i++) {
                        nodes[i].Jsw.layout();
                    }
                    node.style.display = 'none';
                    node.removeEventListener("animationend", animationEnd_2);
                    node.style.animation = '';
                    _this.callEvent('visibled', { visible: false });
                };
                var animation = this.JData.animationEnable ? this.JData.animation['close'] : '';
                if (animation) {
                    node.addEventListener("animationend", animationEnd_2);
                    node.style.animation = animation;
                }
                else {
                    animationEnd_2.bind(node)();
                }
            }
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
            if (this.getParent())
                this.getParent().layout();
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
            JSW.WindowManager.layout(false);
            this.JData.layoutFlag = false;
        };
        Window.prototype.active = function (flag) {
            if (!this.JData.noActive)
                this.getNode().dataset.jswActive = (flag || flag == null) ? 'true' : 'false';
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
            if (parent.Jsw)
                return parent.Jsw.getWidth();
            return parent.offsetWidth;
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
            if (parent.Jsw)
                return parent.Jsw.getHeight();
            return parent.offsetHeight;
        };
        /**
         *子ウインドウのサイズを再計算
        *
        * @param {boolean} flag true:強制再計算 false:必要があれば再計算
        * @returns {boolean} 再計算の必要を行ったかどうか
        * @memberof Window
        */
        Window.prototype.onMeasure = function (flag) {
            //表示状態の更新
            if (this.JData.reshow) {
                this.JData.reshow = false;
                this.hNode.style.visibility = '';
                var animation = this.JData.animationEnable ? this.JData.animation['show'] : '';
                if (animation)
                    this.hNode.style.animation = animation;
            }
            var client = this.getClient();
            for (var i = 0; i < client.childNodes.length; i++) {
                var node = client.childNodes[i];
                if (node.dataset && node.dataset.jsw === "Window")
                    flag |= node.Jsw.onMeasure(flag);
            }
            if (!flag && !this.JData.redraw)
                return false;
            //this.layout()
            if (!this.isAutoSize())
                return false;
            this.callEvent('measure', {});
            var width = this.getClient().scrollWidth;
            var height = this.getClient().scrollHeight;
            if (width === this.getClientWidth() && height === this.getClientHeight())
                return false;
            this.setClientSize(width, height);
            this.JData.redraw = true;
            //if (this.getParent())
            //	this.getParent().layout()
            //this.layout()
            return true;
        };
        /**
         *位置やサイズの確定処理
         *非同期で必要なときに呼び出されるので、基本的には直接呼び出さないこと
         * @param {boolean} flag true:強制 false:必要なら
         * @memberof Window
         */
        Window.prototype.onLayout = function (flag) {
            if (flag || this.JData.redraw) {
                //this.onMeasure(true)			//直下の子リスト
                if (this.hNode.dataset.jswStat == 'maximize') {
                    this.setPos(0, 0);
                    this.setSize(this.getParentWidth(), this.getParentHeight());
                }
                this.hNode.style.left = this.JData.x + 'px';
                this.hNode.style.top = this.JData.y + 'px';
                this.hNode.style.width = this.JData.width + 'px';
                this.hNode.style.height = this.JData.height + 'px';
                flag = true;
                this.callEvent('layout', {});
            }
            var client = this.getClient();
            var nodes = [];
            for (var i = 0; i < client.childNodes.length; i++) {
                var node = client.childNodes[i];
                if (node.dataset && node.dataset.jsw === "Window")
                    nodes.push(node);
            }
            var count = nodes.length;
            //配置順序リスト
            nodes.sort(function (anode, bnode) {
                var priority = { top: 10, bottom: 10, left: 8, right: 8, client: 5 };
                var a = anode.Jsw.JData;
                var b = bnode.Jsw.JData;
                return priority[b.style] - priority[a.style];
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
                        y1 += win.getHeight() + margin.y1 + margin.y2;
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
            this.orderSort(client);
            this.callEvent('layouted', {});
        };
        Window.prototype.orderSort = function (client) {
            var nodes = [];
            for (var i = 0; i < client.childNodes.length; i++) {
                var node = client.childNodes[i];
                if (node.dataset && node.dataset.jsw === "Window")
                    nodes.push(node);
            }
            //重ね合わせソート
            nodes.sort(function (anode, bnode) {
                var a = anode.Jsw.JData;
                var b = bnode.Jsw.JData;
                if (a.orderTop)
                    return 1;
                if (b.orderTop)
                    return -1;
                var layer = a.orderLayer - b.orderLayer;
                if (layer)
                    return layer;
                return parseInt(anode.style.zIndex) - parseInt(bnode.style.zIndex);
            });
            //Zオーダーの再附番
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].style.zIndex = i;
            }
        };
        Window.prototype.show = function (flag) {
            if (flag == null || flag) {
                this.JData.reshow = true;
            }
            else {
                //this.hNode.style.visibility = 'hidden'
            }
        };
        /**
         *ウインドウの重ね合わせ順位を上位に持って行く
         *
         * @param {boolean} [flag] ウインドウをアクティブにするかどうか
         * @memberof Window
         */
        Window.prototype.foreground = function (flag) {
            if (this.JData.noActive)
                return;
            //親をフォアグラウンドに設定
            var activeNodes = new Set();
            var p = this.hNode;
            do {
                if ((flag || flag == null) && p.dataset) {
                    activeNodes.add(p);
                    p.dataset.jswActive = 'true';
                    p.style.zIndex = '1000';
                    if (p.Jsw)
                        p.Jsw.callEvent('active', { active: true });
                }
                this.orderSort(p);
            } while (p = p.parentNode);
            if (flag || flag == null) {
                var activeWindows = document.querySelectorAll('[data-jsw="Window"][data-jsw-active="true"]');
                for (var i = 0, l = activeWindows.length; i < l; i++) {
                    var w = activeWindows[i];
                    if (!activeNodes.has(w)) {
                        w.dataset.jswActive = 'false';
                        w.Jsw.callEvent('active', { active: false });
                    }
                }
            }
            var parent = this.getParent();
            if (parent)
                parent.layout();
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
            var that = this;
            function animationEnd() {
                var nodes = this.querySelectorAll('[data-jsw="Window"]');
                var count = nodes.length;
                for (var i = 0; i < count; i++) {
                    nodes[i].Jsw.layout();
                }
                if (this.parentNode)
                    this.parentNode.removeChild(this);
                this.removeEventListener("animationend", animationEnd);
                that.callEvent('closed', {});
            }
            var animation = this.JData.animationEnable ? this.JData.animation['close'] : '';
            if (animation) {
                this.hNode.addEventListener("animationend", animationEnd);
                this.hNode.style.animation = animation;
            }
            else {
                animationEnd.bind(this.hNode)();
            }
        };
        /**
         *アニメーションの設定
         *
         * @param {string} name アニメーション名
         * @param {string} value アニメーションパラメータ
         * @memberof Window
         */
        Window.prototype.setAnimation = function (name, value) {
            this.JData.animation[name] = value;
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
            this.setSize(width + this.JData.frameSize * 2 + this.JData.padding.x1 + this.JData.padding.x2, height + this.JData.frameSize + this.JData.padding.y1 + this.JData.padding.y2 * 2 + this.JData.titleSize);
        };
        /**
         *クライアントサイズを元にウインドウサイズを設定
         *
         * @param {number} width
         * @memberof Window
         */
        Window.prototype.setClientWidth = function (width) {
            this.setWidth(width + this.JData.frameSize * 2 + this.JData.padding.x1 + this.JData.padding.x2);
        };
        /**
         *クライアントサイズを元にウインドウサイズを設定
         *
         * @param {number} height
         * @memberof Window
         */
        Window.prototype.setClientHeight = function (height) {
            this.setWidth(height + this.JData.frameSize + this.JData.padding.y1 + this.JData.padding.y2 * 2 + this.JData.titleSize);
        };
        /**
         *クライアントサイズを取得
         *
         * @returns {number}
         * @memberof Window
         */
        Window.prototype.getClientWidth = function () {
            return this.getWidth() - this.JData.frameSize * 2 - this.JData.padding.x1 - this.JData.padding.x2;
        };
        /**
         *クライアントサイズを取得
         *
         * @returns {number}
         * @memberof Window
         */
        Window.prototype.getClientHeight = function () {
            return this.getHeight() - this.JData.frameSize * 2 - this.JData.padding.y1 - this.JData.padding.y2 - this.JData.titleSize;
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
            var parent = this.getParent();
            if (parent)
                parent.layout();
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
                if (child.dataset.jsw === "Window") {
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
            if (this.hNode.childNodes[9]) {
                this.hNode.childNodes[9].childNodes[0].textContent = title;
            }
        };
        /**
         *タイトル取得
         *
         * @returns {string}
         * @memberof Window
         */
        Window.prototype.getTitle = function () {
            if (this.hNode.childNodes[9]) {
                return this.hNode.childNodes[9].childNodes[0].textContent;
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
            if (this.hNode.dataset.jswStat != 'maximize') {
                this.JData.normalX = this.JData.x;
                this.JData.normalY = this.JData.y;
                this.JData.normalWidth = this.JData.width;
                this.JData.normalHeight = this.JData.height;
                this.hNode.dataset.jswStat = 'maximize';
                this.hNode.style.minWidth = this.JData.width + "px";
                this.hNode.style.minHeight = this.JData.height + "px";
                var animation = this.JData.animationEnable ? this.JData.animation['maximize'] : '';
                this.hNode.style.animation = animation;
                if (animation)
                    this.hNode.addEventListener("animationend", animationEnd);
                else
                    animationEnd.bind(this.hNode)();
            }
            else {
                this.JData.x = this.JData.normalX;
                this.JData.y = this.JData.normalY;
                this.JData.width = this.JData.normalWidth;
                this.JData.height = this.JData.normalHeight;
                this.hNode.dataset.jswStat = 'normal';
                var animation = this.JData.animationEnable ? this.JData.animation['maxrestore'] : '';
                this.hNode.style.animation = animation;
            }
            if (flag) {
                var icon = this.hNode.querySelector("*>[data-jsw-type=title]>[data-jsw-type=icon][data-jsw-kind=max]");
                if (icon)
                    icon.dataset.jswKind = "normal";
            }
            else {
                var icon = this.hNode.querySelector("*>[data-jsw-type=title]>[data-jsw-type=icon][data-jsw-kind=normal]");
                if (icon)
                    icon.dataset.jswKind = "max";
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
            if (this.hNode.dataset.jswStat != 'minimize') {
                //client.style.animation="Jswminimize 0.2s ease 0s 1 forwards"
                var animation = this.JData.animationEnable ? this.JData.animation['minimize'] : '';
                this.hNode.style.animation = animation;
                this.hNode.dataset.jswStat = 'minimize';
            }
            else {
                //client.style.animation="Jswrestore 0.2s ease 0s 1 backwards"
                var animation = this.JData.animationEnable ? this.JData.animation['restore'] : '';
                this.hNode.style.animation = animation;
                this.hNode.dataset.jswStat = 'normal';
            }
            if (flag) {
                var icon = this.hNode.querySelector("*>[data-jsw-type=title]>[data-jsw-type=icon][data-jsw-kind=min]");
                icon.dataset.jswKind = "restore";
            }
            else {
                var icon = this.hNode.querySelector("*>[data-jsw-type=title]>[data-jsw-type=icon][data-jsw-kind=restore]");
                icon.dataset.jswKind = "min";
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
        function FrameWindow(param) {
            var _this = this;
            var p = { frame: true, title: true, layer: 10 };
            if (param)
                Object.assign(p, param);
            _this = _super.call(this, p) || this;
            _this.setOverlap(true);
            return _this;
        }
        return FrameWindow;
    }(Window));
    JSW.FrameWindow = FrameWindow;
})(JSW || (JSW = {}));
/// <reference path="./Window.ts" />
var JSW;
(function (JSW) {
    /**
     *ボタン用クラス
     *
     * @export
     * @class Button
     * @extends {Window}
     */
    var Button = /** @class */ (function (_super) {
        __extends(Button, _super);
        /**
         *Creates an instance of Button.
         * @param {string} [text] ボタンに設定するテキスト
         * @memberof Button
         */
        function Button(text, value) {
            var _this = _super.call(this) || this;
            _this.setAutoSize(true);
            _this.setJswStyle('Button');
            _this.nodeValue = value;
            //this.setAlign('center')
            var button = document.createElement('div');
            _this.getClient().appendChild(button);
            button.tabIndex = 0;
            var nodeText = document.createElement('span');
            button.appendChild(nodeText);
            _this.nodeText = nodeText;
            if (text)
                _this.setText(text);
            button.addEventListener('keypress', function (e) {
                if (e.keyCode !== 13)
                    _this.callEvent('submit', { event: e });
            });
            button.addEventListener('click', function (e) {
                _this.callEvent('buttonClick', { event: e });
                _this.callEvent('submit', { event: e });
            });
            button.addEventListener('dblclick', function (e) {
                _this.callEvent('buttonDblClick', { event: e });
            });
            return _this;
        }
        /**
         *ボタンに対してテキストを設定する
         *
         * @param {string} text
         * @memberof Button
         */
        Button.prototype.setText = function (text) {
            var nodeText = this.nodeText;
            nodeText.textContent = text;
            this.layout();
        };
        /**
         *ボタンに設定したテキストを取得する
         *
         * @returns {string}
         * @memberof Button
         */
        Button.prototype.getText = function () {
            return this.nodeText.textContent;
        };
        Button.prototype.setAlign = function (style) {
            var node = this.getClient();
            node.style.justifyContent = style;
        };
        Button.prototype.getValue = function () {
            return this.nodeValue;
        };
        /**
         *イベントの設定
         * 'buttonClick','buttonDblClick'
         *
         * @template K
         * @param {K} type
         * @param {(ev: ButtonEventMap[K]) => any} listener
         * @memberof Button
         */
        Button.prototype.addEventListener = function (type, listener) {
            _super.prototype.addEventListener.call(this, type, listener);
        };
        return Button;
    }(JSW.Window));
    JSW.Button = Button;
    var ImageButton = /** @class */ (function (_super) {
        __extends(ImageButton, _super);
        /**
         *Creates an instance of Button.
         * @param {string} [text] ボタンに設定するテキスト
         * @memberof Button
         */
        function ImageButton(image, alt) {
            var _this = _super.call(this) || this;
            _this.setWidth(64);
            //this.setAutoSize(true)
            _this.setJswStyle('Button');
            //this.setAlign('center')
            var button = document.createElement('div');
            _this.getClient().appendChild(button);
            button.tabIndex = 0;
            var nodeImg = document.createElement('img');
            button.appendChild(nodeImg);
            _this.nodeImg = nodeImg;
            if (alt)
                nodeImg.alt = alt;
            nodeImg.addEventListener('load', function () {
                console.log('load %d %d', nodeImg.naturalWidth, nodeImg.naturalHeight);
                _this.layout();
            });
            nodeImg.src = image;
            button.addEventListener('keypress', function (e) {
                if (e.keyCode !== 13)
                    _this.callEvent('submit', { event: e });
            });
            button.addEventListener('click', function (e) {
                _this.callEvent('buttonClick', { event: e });
                _this.callEvent('submit', { event: e });
            });
            button.addEventListener('dblclick', function (e) {
                _this.callEvent('buttonDblClick', { event: e });
            });
            return _this;
        }
        /**
         *ボタンに対してテキストを設定する
         *
         * @param {string} text
         * @memberof Button
         */
        ImageButton.prototype.setText = function (text) {
            this.nodeImg.alt = text;
            this.layout();
        };
        /**
         *ボタンに設定したテキストを取得する
         *
         * @returns {string}
         * @memberof Button
         */
        ImageButton.prototype.getText = function () {
            return this.nodeImg.alt;
        };
        ImageButton.prototype.setAlign = function (style) {
            var node = this.getClient();
            node.style.justifyContent = style;
        };
        /**
         *イベントの設定
         * 'buttonClick','buttonDblClick'
         *
         * @template K
         * @param {K} type
         * @param {(ev: ButtonEventMap[K]) => any} listener
         * @memberof Button
         */
        ImageButton.prototype.addEventListener = function (type, listener) {
            _super.prototype.addEventListener.call(this, type, listener);
        };
        return ImageButton;
    }(JSW.Window));
    JSW.ImageButton = ImageButton;
})(JSW || (JSW = {}));
/// <reference path="./Window.ts" />
var JSW;
(function (JSW) {
    var CheckBox = /** @class */ (function (_super) {
        __extends(CheckBox, _super);
        function CheckBox(params) {
            var _this = _super.call(this) || this;
            _this.setJswStyle('CheckBox');
            _this.setAutoSize(true);
            var node = _this.getClient();
            var textArea = document.createElement('label');
            node.appendChild(textArea);
            var nodeCheck = document.createElement('input');
            _this.nodeCheck = nodeCheck;
            nodeCheck.type = 'checkbox';
            textArea.appendChild(nodeCheck);
            if (params && params.checked != null)
                nodeCheck.checked = params.checked;
            var nodeText = document.createElement('span');
            _this.nodeText = nodeText;
            textArea.appendChild(nodeText);
            if (params && params.text)
                _this.setText(params.text);
            return _this;
        }
        CheckBox.prototype.isCheck = function () {
            return this.nodeCheck.checked;
        };
        CheckBox.prototype.setCheck = function (check) {
            this.nodeCheck.checked = check;
        };
        CheckBox.prototype.setText = function (text) {
            var nodeText = this.nodeText;
            nodeText.textContent = text;
        };
        CheckBox.prototype.getText = function () {
            var nodeText = this.nodeText;
            return nodeText.textContent;
        };
        CheckBox.prototype.getTextNode = function () {
            return this.nodeText;
        };
        return CheckBox;
    }(JSW.Window));
    JSW.CheckBox = CheckBox;
})(JSW || (JSW = {}));
/// <reference path="./Window.ts" />
var JSW;
(function (JSW) {
    var DrawerView = /** @class */ (function (_super) {
        __extends(DrawerView, _super);
        function DrawerView() {
            var _this = _super.call(this) || this;
            var client = _this.getClient();
            client.dataset.kind = 'Drawer';
            _this.setSize(300, 200);
            _this.setOverlap(true);
            _this.addEventListener('active', function (e) {
                if (!e.active)
                    _this.close();
            });
            _this.setAnimation('show', 'weDrawerShow 0.5s ease 0s normal');
            _this.setAnimation('close', 'weDrawerClose 0.5s ease 0s normal');
            _this.foreground(true);
            return _this;
        }
        DrawerView.prototype.addEventListener = function (type, listener) {
            _super.prototype.addEventListener.call(this, type, listener);
        };
        DrawerView.prototype.addItem = function (text, value, icon) {
            var _this = this;
            var client = this.getClient();
            var itemNode = document.createElement('div');
            itemNode.dataset.kind = 'DrawerItem';
            var iconNode = document.createElement('div');
            iconNode.dataset.kind = 'DrawerIcon';
            itemNode.appendChild(iconNode);
            if (icon)
                iconNode.style.backgroundImage = 'url("' + icon + '")';
            var textNode = document.createElement('div');
            textNode.dataset.kind = 'DrawerText';
            itemNode.appendChild(textNode);
            textNode.textContent = text;
            itemNode.addEventListener('click', function () {
                _this.callEvent('selectItem', { text: text, value: value, icon: icon });
                _this.close();
            });
            client.appendChild(itemNode);
        };
        DrawerView.prototype.onLayout = function (flag) {
            var height = this.getParentHeight();
            if (height != this.getHeight())
                this.setHeight(height);
            _super.prototype.onLayout.call(this, flag);
        };
        return DrawerView;
    }(JSW.Window));
    JSW.DrawerView = DrawerView;
})(JSW || (JSW = {}));
/// <reference path="./Window.ts" />
var JSW;
(function (JSW) {
    var Label = /** @class */ (function (_super) {
        __extends(Label, _super);
        function Label(text) {
            var _this = _super.call(this) || this;
            _this.setJswStyle('Label');
            var node = _this.getClient();
            var nodeText = document.createElement('span');
            node.appendChild(nodeText);
            _this.nodeText = nodeText;
            if (text)
                _this.setText(text);
            _this.setAutoSize(true);
            return _this;
        }
        Label.prototype.setFontSize = function (size) {
            var nodeText = this.nodeText;
            nodeText.style.fontSize = size + 'px';
            this.layout();
        };
        Label.prototype.setText = function (text) {
            var nodeText = this.nodeText;
            nodeText.textContent = text;
        };
        Label.prototype.getText = function () {
            return this.nodeText.textContent;
        };
        Label.prototype.getTextNode = function () {
            return this.nodeText;
        };
        Label.prototype.setAlign = function (style) {
            var node = this.getClient();
            //node.style.alignItems = style;
            node.style.justifyContent = style;
        };
        return Label;
    }(JSW.Window));
    JSW.Label = Label;
})(JSW || (JSW = {}));
var JSW;
(function (JSW) {
    function Sleep(timeout) {
        return new Promise(function (resolv) {
            setTimeout(function () {
                resolv();
            }, timeout);
        });
    }
    JSW.Sleep = Sleep;
})(JSW || (JSW = {}));
/// <reference path="./Window.ts" />
var JSW;
(function (JSW) {
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
            _this.areaWidth = 0;
            var that = _this;
            var client = _this.getClient();
            client.dataset.jswStyle = 'ListView';
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
            client.addEventListener('dragover', function () {
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
                JSW.WindowManager.enableMove(resize);
                resize.addEventListener("move", function (e) {
                    var p = e.params;
                    var x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                    var h = headers.childNodes[this.index];
                    var width = x - h.offsetLeft;
                    h.style.width = width + 'px';
                    that.columnWidth[this.index] = width;
                    for (var i_1 = this.index, length_2 = resizers.childElementCount; i_1 < length_2; i_1++) {
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
                for (var i = 0, length_3 = headers.childElementCount; i < length_3; i++) {
                    var node = headers.childNodes[i];
                    if (index === i)
                        node.dataset.sort = order ? 'asc' : 'desc';
                    else
                        node.dataset.sort = '';
                    node.className = node.className; //IE11対策
                }
            }
            index = this.sortIndex;
            order = this.sortVector;
            var columns = this.itemArea.childNodes;
            var column = columns[index];
            var items = column.childNodes;
            //ソートリストの作成
            var sortList = [];
            for (var i = 0, length_4 = items.length; i < length_4; i++) {
                sortList.push(i);
            }
            sortList.sort(function (a, b) {
                var v1 = items[a].keyValue != null ? items[a].keyValue : items[a].textContent;
                var v2 = items[b].keyValue != null ? items[b].keyValue : items[b].textContent;
                return (v1 > v2 ? 1 : -1) * (order ? 1 : -1);
            });
            //ソート処理
            for (var i = 0, length_5 = columns.length; i < length_5; i++) {
                var column_2 = columns[i];
                //子ノードの保存と削除
                var items_1 = [];
                while (column_2.childElementCount) {
                    items_1.push(column_2.childNodes[0]);
                    column_2.removeChild(column_2.childNodes[0]);
                }
                //子ノードの再追加
                for (var j = 0, length_6 = sortList.length; j < length_6; j++) {
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
            for (var i = 0, length_7 = columns.length; i < length_7; i++) {
                var column = columns[i];
                for (var j = 0, l = this.selectIndexes.length; j < l; j++) {
                    var node = column.childNodes[this.selectIndexes[j]];
                    node.dataset.itemSelect = 'false';
                    node.className = node.className; //IE11対策
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
            for (var i = 0, length_8 = columns.length; i < length_8; i++) {
                var column = columns[i];
                for (var j = 0, l = this.selectIndexes.length; j < l; j++) {
                    var node = column.childNodes[this.selectIndexes[j]];
                    node.dataset.itemSelect = 'true';
                    node.className = node.className; //IE11対策
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
            for (var i = 0, length_9 = columns.length; i < length_9; i++) {
                var column = columns[i];
                for (var j = 0, l = indexes.length; j < l; j++) {
                    var node = column.childNodes[indexes[j]];
                    node.dataset.itemSelect = 'false';
                    node.className = node.className; //IE11対策
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
         *アイテムの数を返す
         *
         * @returns {number} アイテム数
         * @memberof ListView
         */
        ListView.prototype.getItemCount = function () {
            if (this.itemArea.childElementCount === 0)
                return 0;
            return this.itemArea.childNodes[0].childElementCount;
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
            for (var i = 0, length_10 = columns.length; i < length_10; i++) {
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
         * @returns {string} アイテムに設定されている値
         */
        ListView.prototype.getItemValue = function (index) {
            var cell = this.getCell(index, 0);
            return cell.value;
        };
        /**
         *アイテムのテキスト内容を取得
         *
         * @param {number} row 行
         * @param {number} col 列
         * @returns {string} アイテムに設定されているテキスト
         * @memberof ListView
         */
        ListView.prototype.getItemText = function (row, col) {
            var cell = this.getCell(row, col);
            return cell.textContent;
        };
        /**
         *最初に選択されているアイテムを返す
         *
         * @returns {number} 選択されているアイテム番号(見つからなかったら-1)
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
         * @returns {any[]} 選択されているアイテムの値
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
            for (var i = 0, length_11 = columns.length; i < length_11; i++) {
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
        ListView.prototype.addItem = function (value, itemValue) {
            var vector = { left: 'flex-start', center: 'center', right: 'flex-end' };
            var that = this;
            var columns = this.itemArea.childNodes;
            for (var i = 0, length_12 = columns.length; i < length_12; i++) {
                var column = columns[i];
                var cell = document.createElement('div');
                cell.draggable = true;
                cell.dataset.kind = 'ListCell';
                if (column.vector)
                    cell.style.justifyContent = vector[column.vector];
                column.appendChild(cell);
                cell.addEventListener('mouseover', function () {
                    var index = ListView.getIndexOfNode(this);
                    for (var i_2 = 0, length_13 = columns.length; i_2 < length_13; i_2++) {
                        var column_3 = columns[i_2];
                        if (that.overIndex != null && that.overIndex < column_3.childElementCount) {
                            var node = column_3.childNodes[that.overIndex];
                            node.dataset.itemHover = 'false';
                            node.className = node.className; //IE対策
                        }
                        var node2 = column_3.childNodes[index];
                        node2.dataset.itemHover = 'true';
                        node2.className = node2.className; //IE対策
                    }
                    that.overIndex = index;
                });
                cell.addEventListener('dragstart', function (e) {
                    var index = ListView.getIndexOfNode(this);
                    var index2 = ListView.getIndexOfNode(this.parentNode);
                    that.callEvent('itemDragStart', { itemIndex: index, subItemIndex: index2, event: e });
                });
                cell.addEventListener('dragleave', function () {
                    var index = ListView.getIndexOfNode(this);
                    var cells = that.getLineCells(index);
                    for (var _i = 0, cells_1 = cells; _i < cells_1.length; _i++) {
                        var cell_1 = cells_1[_i];
                        cell_1.dataset.drag = '';
                        cell_1.className = cell_1.className; //IE対策
                    }
                });
                cell.addEventListener('dragenter', function () {
                    var index = ListView.getIndexOfNode(this);
                    var cells = that.getLineCells(index);
                    for (var _i = 0, cells_2 = cells; _i < cells_2.length; _i++) {
                        var cell_2 = cells_2[_i];
                        cell_2.dataset.drag = 'over';
                        cell_2.className = cell_2.className; //IE対策
                    }
                    event.preventDefault();
                });
                cell.addEventListener('dragover', function () {
                    event.preventDefault();
                });
                cell.addEventListener('drop', function (e) {
                    var index = ListView.getIndexOfNode(this);
                    var index2 = ListView.getIndexOfNode(this.parentNode);
                    var cells = that.getLineCells(index);
                    for (var _i = 0, cells_3 = cells; _i < cells_3.length; _i++) {
                        var cell_3 = cells_3[_i];
                        cell_3.dataset.drag = 'over';
                        cell_3.className = cell_3.className; //IE対策
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
            if (itemValue)
                this.setItemValue(index, itemValue);
            if (this.areaWidth !== this.itemArea.clientWidth) {
                this.areaWidth = this.itemArea.clientWidth;
                this.resize();
            }
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
                item.textContent = value.toString();
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
            var lmitWidth = itemArea.clientWidth;
            for (var i = 0, length_14 = headers.childElementCount; i < length_14; i++) {
                lmitWidth -= this.columnWidth[i];
            }
            var autoIndex = this.columnAutoIndex;
            for (var i = 0, length_15 = headers.childElementCount; i < length_15; i++) {
                var node = headers.childNodes[i];
                var resize = resizers.childNodes[i];
                var column = itemArea.children[i];
                var width = this.columnWidth[i];
                if (autoIndex === i || (autoIndex === -1 && i === length_15 - 1))
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
        ListView.prototype.addEventListener = function (type, listener) {
            _super.prototype.addEventListener.call(this, type, listener);
        };
        return ListView;
    }(JSW.Window));
    JSW.ListView = ListView;
})(JSW || (JSW = {}));
/// <reference path="./Window.ts" />
var JSW;
(function (JSW) {
    var MessageBox = /** @class */ (function (_super) {
        __extends(MessageBox, _super);
        function MessageBox(title, msg, buttons) {
            var _this = _super.call(this) || this;
            _this.setSize(300, 200);
            _this.setPos();
            _this.setTitle(title);
            _this.active();
            _this.setPadding(10, 10, 10, 10);
            var label = new JSW.Label(msg);
            _this.label = label;
            _this.addChild(label, 'top');
            label.setAlign('center');
            label.setMargin(10, 10, 10, 50);
            var that = _this;
            if (!buttons) {
                buttons = { 'OK': true };
            }
            for (var name_1 in buttons) {
                var b = new JSW.Button(name_1, buttons[name_1]);
                b.setAlign('center');
                _this.addChild(b, 'top');
                b.addEventListener('buttonClick', function () {
                    that.callEvent('buttonClick', this.getValue());
                    that.close();
                }.bind(b));
            }
            return _this;
        }
        MessageBox.prototype.addEventListener = function (type, listener) {
            _super.prototype.addEventListener.call(this, type, listener);
        };
        MessageBox.prototype.setText = function (text) {
            this.label.setText(text);
        };
        return MessageBox;
    }(JSW.FrameWindow));
    JSW.MessageBox = MessageBox;
})(JSW || (JSW = {}));
/// <reference path="./Window.ts" />
var JSW;
(function (JSW) {
    /**
     *パネル用クラス
     *
     * @export
     * @class Panel
     * @extends {Window}
     */
    var Panel = /** @class */ (function (_super) {
        __extends(Panel, _super);
        function Panel() {
            var _this = _super.call(this) || this;
            _this.setJswStyle('Panel');
            _this.setHeight(32);
            return _this;
        }
        return Panel;
    }(JSW.Window));
    JSW.Panel = Panel;
})(JSW || (JSW = {}));
var JSW;
(function (JSW) {
    var SelectBox = /** @class */ (function (_super) {
        __extends(SelectBox, _super);
        function SelectBox(option) {
            var _this = _super.call(this) || this;
            _this.setJswStyle('SelectBox');
            _this.setAutoSize(true);
            var node = _this.getClient();
            var select = document.createElement('select');
            _this.select = select;
            var options = option.options;
            for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                var o = options_1[_i];
                var opNode = document.createElement('option');
                opNode.textContent = o.name;
                opNode.value = o.value;
                select.appendChild(opNode);
            }
            node.appendChild(select);
            return _this;
        }
        return SelectBox;
    }(JSW.Window));
    JSW.SelectBox = SelectBox;
})(JSW || (JSW = {}));
/// <reference path="./Window.ts" />
var JSW;
(function (JSW) {
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
            _this.JDataSplit = {
                drawerMode: false,
                drawerModeNow: false,
                splitterMoving: false,
                splitterThick: 10,
                splitterPos: 100,
                splitterType: 'we',
                splitter: null,
                childList: null,
                drawerWidth: 0
            };
            _this.setJswStyle('SplitterView');
            _this.setSize(640, 480);
            if (splitPos != null)
                _this.JDataSplit.splitterPos = splitPos;
            if (splitType != null) {
                _this.JDataSplit.splitterType = splitType;
            }
            var client = _this.getClient();
            client.dataset.splitterType = _this.JDataSplit.splitterType;
            _this.JDataSplit.childList = [new JSW.Window(), new JSW.Window()];
            _super.prototype.addChild.call(_this, _this.JDataSplit.childList[0]);
            _super.prototype.addChild.call(_this, _this.JDataSplit.childList[1]);
            var icon = document.createElement('div');
            _this.JDataSplit.menuIcon = icon;
            icon.dataset.kind = 'SplitterMenu';
            icon.style.display = 'none';
            client.appendChild(icon);
            icon.addEventListener('click', function () {
                var child0 = _this.JDataSplit.childList[0];
                _this.JDataSplit.childList[0].addEventListener('visibled', function (e) {
                    if (e.visible) {
                        _this.JDataSplit.splitter.setVisible(true);
                    }
                });
                child0.setVisible(true);
                child0.active(true);
                icon.style.display = 'none';
            });
            var splitter = new JSW.Window();
            _this.JDataSplit.splitter = splitter;
            splitter.setJswStyle('Splitter');
            splitter.setOrderTop(true);
            splitter.setNoActive(true);
            _super.prototype.addChild.call(_this, splitter);
            var that = _this;
            var handle = null;
            splitter.getNode().addEventListener("move", function (e) {
                var p = e.params;
                var width = that.getClientWidth();
                var height = that.getClientHeight();
                var JDataSplit = that.JDataSplit;
                var splitterThick = JDataSplit.splitterThick;
                var x = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
                var y = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
                switch (that.getClient().dataset.splitterType) {
                    case "ns":
                        JDataSplit.splitterPos = y;
                        break;
                    case "sn":
                        JDataSplit.splitterPos = height - (y + splitterThick);
                        break;
                    case "we":
                        JDataSplit.splitterPos = x;
                        break;
                    case "ew":
                        JDataSplit.splitterPos = width - (x + splitterThick);
                        break;
                }
                JDataSplit.splitterMoving = true;
                if (handle)
                    clearTimeout(handle);
                handle = setTimeout(function () { handle = null; JDataSplit.splitterMoving = false; that.layout(); }, 2000);
                that.layout();
            });
            _this.addEventListener("layout", function () {
                var JDataSplit = that.JDataSplit;
                var child0 = _this.JDataSplit.childList[0];
                var child1 = _this.JDataSplit.childList[1];
                function active(e) {
                    if (!e.active) {
                        JDataSplit.splitter.setVisible(false);
                        child0.setVisible(false);
                        JDataSplit.menuIcon.style.display = 'block';
                    }
                }
                //動的分割機能の処理
                if (JDataSplit.drawerMode && !JDataSplit.splitterMoving) {
                    var type = JDataSplit.splitterType;
                    var dsize = JDataSplit.drawerWidth + JDataSplit.splitterPos;
                    var ssize = type === 'ew' || type === 'we' ? _this.getWidth() : _this.getHeight();
                    if (!JDataSplit.drawerModeNow) {
                        if (dsize > 0 && ssize < dsize) {
                            JDataSplit.drawerModeNow = true;
                            child1.setChildStyle('client');
                            child0.setOrderTop(true);
                            _this.JDataSplit.splitter.setVisible(false);
                            child0.getNode().style.backgroundColor = 'rgba(255,255,255,0.8)';
                            child0.addEventListener('active', active);
                            child0.setAnimation('show', JDataSplit.splitterType + 'DrawerShow 0.5s ease 0s normal');
                            child0.setAnimation('close', JDataSplit.splitterType + 'DrawerClose 0.5s ease 0s normal');
                            child0.active();
                            child0.setVisible(false);
                            _this.JDataSplit.menuIcon.style.display = 'block';
                        }
                    }
                    else {
                        if (dsize > 0 && ssize >= dsize) {
                            JDataSplit.drawerModeNow = false;
                            child0.removeEventListener('active', active);
                            child1.setChildStyle(null);
                            child0.setOrderTop(false);
                            child0.setVisible(true);
                            _this.JDataSplit.splitter.setVisible(true);
                            _this.JDataSplit.menuIcon.style.display = 'none';
                        }
                    }
                }
                var width = that.getClientWidth();
                var height = that.getClientHeight();
                var splitterThick = JDataSplit.splitterThick;
                if (JDataSplit.splitterPos < 0)
                    JDataSplit.splitterPos = 0;
                switch (JDataSplit.splitterType) {
                    case "we":
                        if (JDataSplit.splitterPos >= width - splitterThick)
                            JDataSplit.splitterPos = width - splitterThick - 1;
                        splitter.setSize(splitterThick, height);
                        splitter.setPos(JDataSplit.splitterPos, 0);
                        child0.setPos(0, 0);
                        child0.setSize(splitter.getPosX(), height);
                        child1.setPos(JDataSplit.splitterPos + splitterThick, 0);
                        child1.setSize(width - (JDataSplit.splitterPos + splitterThick), height);
                        break;
                    case "ew":
                        if (JDataSplit.splitterPos >= width - splitterThick)
                            JDataSplit.splitterPos = width - splitterThick - 1;
                        var p = width - JDataSplit.splitterPos - splitterThick;
                        splitter.setSize(splitterThick, height);
                        splitter.setPos(p, 0);
                        child1.setPos(0, 0);
                        child1.setSize(p, height);
                        child0.setPos(p + splitterThick, 0);
                        child0.setSize(JDataSplit.splitterPos, height);
                        break;
                    case "ns":
                        if (JDataSplit.splitterPos >= height - splitterThick)
                            JDataSplit.splitterPos = height - splitterThick - 1;
                        splitter.setSize(width, splitterThick);
                        splitter.setPos(0, JDataSplit.splitterPos);
                        child0.setPos(0, 0);
                        child0.setSize(width, JDataSplit.splitterPos);
                        child1.setPos(0, JDataSplit.splitterPos + splitterThick);
                        child1.setSize(width, height - (JDataSplit.splitterPos + splitterThick));
                        break;
                    case "sn":
                        if (JDataSplit.splitterPos >= height - splitterThick)
                            JDataSplit.splitterPos = height - splitterThick - 1;
                        splitter.setSize(width, splitterThick);
                        p = height - JDataSplit.splitterPos - splitterThick;
                        splitter.setPos(0, p);
                        child1.setPos(0, 0);
                        child1.setSize(width, p);
                        child0.setPos(0, p + splitterThick);
                        child0.setSize(width, JDataSplit.splitterPos);
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
            if (pos != null)
                this.JDataSplit.pos = pos;
            if (type) {
                this.JDataSplit.type = type;
            }
            this.JDataSplit.splitterPos = this.JDataSplit.pos;
            if (this.JDataSplit.type != null) {
                this.getClient().dataset.splitterType = this.JDataSplit.type;
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
        Splitter.prototype.setOverlay = function (flag, size) {
            if (flag) {
                this.JDataSplit.drawerMode = true;
                this.JDataSplit.drawerWidth = size != null ? size : 0;
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
        return Splitter;
    }(JSW.Window));
    JSW.Splitter = Splitter;
})(JSW || (JSW = {}));
var JSW;
(function (JSW) {
    var TableFormView = /** @class */ (function (_super) {
        __extends(TableFormView, _super);
        function TableFormView(params) {
            var _this = _super.call(this, params) || this;
            _this.setJswStyle('TableFormView');
            var table = document.createElement('div');
            _this.table = table;
            _this.getClient().appendChild(table);
            var items = document.createElement('div');
            _this.items = items;
            table.appendChild(items);
            var footer = document.createElement('div');
            _this.footer = footer;
            _this.getClient().appendChild(footer);
            return _this;
        }
        TableFormView.prototype.addItem = function (params) {
            if (params.type === 'submit') {
                var button = document.createElement('button');
                button.textContent = params.label;
                this.footer.appendChild(button);
                if (params.events) {
                    var events = params.events;
                    for (var key in events) {
                        button.addEventListener(key, events[key]);
                    }
                }
                return button;
            }
            else {
                var row = document.createElement(params.type === 'checkbox' ? 'label' : 'div');
                var label = document.createElement('div');
                row.appendChild(label);
                label.innerText = params.label;
                var data = document.createElement('div');
                row.appendChild(data);
                switch (params.type) {
                    case 'checkbox':
                        var checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.name = params.name || '';
                        checkbox.checked = params.value == true;
                        data.appendChild(checkbox);
                        break;
                    case 'select':
                        var select = document.createElement('select');
                        select.name = params.name || '';
                        for (var _i = 0, _a = params.options; _i < _a.length; _i++) {
                            var o = _a[_i];
                            var option = document.createElement('option');
                            option.textContent = o.name;
                            option.value = o.value;
                            select.appendChild(option);
                        }
                        data.appendChild(select);
                        break;
                    default:
                        var tag = void 0;
                        if (params.link) {
                            tag = document.createElement('a');
                            tag.target = '_blank';
                            tag.href = params.link;
                        }
                        else {
                            tag = document.createElement('div');
                        }
                        if (params.image) {
                            var image = document.createElement('img');
                            image.src = params.image;
                            if (params.image_width)
                                image.style.width = params.image_width;
                            tag.appendChild(image);
                        }
                        else {
                            tag.innerText = params.value.toString();
                        }
                        data.appendChild(tag);
                        break;
                }
                this.items.appendChild(row);
                return row;
            }
        };
        TableFormView.prototype.getParams = function () {
            var values = {};
            var nodes = this.items.querySelectorAll('select,input');
            for (var length_16 = nodes.length, i = 0; i < length_16; ++i) {
                var v = nodes[i];
                if (v instanceof HTMLSelectElement) {
                    var name_2 = v.name;
                    var value = v.value;
                    values[name_2] = value;
                }
                else if (v instanceof HTMLInputElement) {
                    var name_3 = v.name;
                    var value = v.type == 'checkbox' ? v.checked : v.value;
                    values[name_3] = value;
                }
            }
            return values;
        };
        TableFormView.prototype.setParams = function (params) {
            var nodes = this.items.querySelectorAll('select,input');
            for (var length_17 = nodes.length, i = 0; i < length_17; ++i) {
                var v = nodes[i];
                if (v instanceof HTMLSelectElement) {
                    var value = params[v.name];
                    if (value != null)
                        v.value = value.toString();
                }
                else if (v instanceof HTMLInputElement) {
                    var value = params[v.name];
                    if (value != null)
                        if (v.type === 'checkbox')
                            v.checked = value;
                        else
                            v.value = value.toString();
                }
            }
        };
        return TableFormView;
    }(JSW.Window));
    JSW.TableFormView = TableFormView;
})(JSW || (JSW = {}));
/// <reference path="./Window.ts" />
var JSW;
(function (JSW) {
    var TextBox = /** @class */ (function (_super) {
        __extends(TextBox, _super);
        function TextBox(params) {
            var _this = _super.call(this) || this;
            _this.setJswStyle('TextBox');
            _this.setAutoSize(true);
            var node = _this.getClient();
            var img = document.createElement('img');
            if (params && params.image)
                img.src = params.image;
            node.appendChild(img);
            var textArea = document.createElement('div');
            node.appendChild(textArea);
            var nodeLabel = document.createElement('div');
            textArea.appendChild(nodeLabel);
            if (params && params.label)
                nodeLabel.textContent = params.label;
            var nodeText = document.createElement('input');
            if (params && params.type)
                nodeText.type = params.type;
            textArea.appendChild(nodeText);
            _this.nodeText = nodeText;
            if (params && params.text)
                _this.setText(params.text);
            return _this;
        }
        TextBox.prototype.setText = function (text) {
            var nodeText = this.nodeText;
            nodeText.value = text;
        };
        TextBox.prototype.getText = function () {
            return this.nodeText.value;
        };
        TextBox.prototype.setLabel = function (text) {
            var node = this.nodeLabel;
            node.textContent = text;
        };
        TextBox.prototype.getLabel = function () {
            return this.nodeLabel.textContent;
        };
        TextBox.prototype.getTextNode = function () {
            return this.nodeText;
        };
        return TextBox;
    }(JSW.Window));
    JSW.TextBox = TextBox;
})(JSW || (JSW = {}));
/// <reference path="./Window.ts" />
//
var JSW;
(function (JSW) {
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
            var _this = this;
            this.keys = {};
            var hNode = document.createElement('div');
            this.hNode = hNode;
            hNode.treeItem = this;
            hNode.dataset.kind = 'TreeItem';
            var row1 = document.createElement('div');
            row1.dataset.kind = 'TreeRow';
            hNode.appendChild(row1);
            row1.addEventListener("click", function () {
                _this.selectItem();
            });
            row1.addEventListener("dblclick", function () {
                _this.getTreeView().callEvent('itemDblClick', { item: _this });
            });
            row1.addEventListener('dragstart', function (e) {
                _this.getTreeView().callEvent('itemDragStart', { item: _this, event: e });
            });
            row1.addEventListener('dragleave', function () {
                row1.dataset.drag = '';
            });
            row1.addEventListener('dragenter', function () {
                row1.dataset.drag = 'over';
                event.preventDefault();
            });
            row1.addEventListener('dragover', function () {
                //row1.dataset.drag = 'over'
                event.preventDefault();
            });
            row1.addEventListener('drop', function (e) {
                _this.getTreeView().callEvent('itemDrop', { event: e, item: _this });
                row1.dataset.drag = '';
                event.preventDefault();
            });
            var icon = document.createElement('div');
            icon.dataset.kind = 'TreeIcon';
            row1.appendChild(icon);
            icon.addEventListener("click", function (e) {
                _this.openItem(!_this.opened);
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
            if (treeView)
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
            while (node && node.dataset.jswStyle !== 'TreeView')
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
            client.dataset.jswStyle = 'TreeView';
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
            function animationEnd() {
                this.removeEventListener('animationend', animationEnd);
                that.getClient().scrollTo(0, item.getNode().offsetTop - that.getClientHeight() / 2);
            }
            if (this.mSelectItem !== item) {
                if (this.mSelectItem)
                    this.mSelectItem.getNode().dataset.select = 'false';
                item.getNode().dataset.select = 'true';
                this.mSelectItem = item;
                item.openItem(true);
                var parent_1 = item;
                while (parent_1 = parent_1.getParentItem()) {
                    parent_1.openItem(true);
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
        /**
         *アイテムツリーが展開されら発生する
         *
         * @param {'itemOpen'} type
         * @param {(event:TREEVIEW_EVENT_OPEN)=>void} callback
         * @memberof TreeView
         */
        /**
         *アイテムが選択されたら発生
         *
         * @param {'itemSelect'} type
         * @param {(event:TREEVIEW_EVENT_SELECT)=>void} callback
         * @memberof TreeView
         */
        /**
         *アイテムにドラッグドロップされたら発生
         *
         * @param {'itemDrop'} type
         * @param {(event: TREEVIEW_EVENT_DROP) => void} callback
         * @memberof TreeView
         */
        TreeView.prototype.addEventListener = function (type, listener) {
            _super.prototype.addEventListener.call(this, type, listener);
        };
        return TreeView;
    }(JSW.Window));
    JSW.TreeView = TreeView;
})(JSW || (JSW = {}));
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.6+9869a4bc
 */
var define;
var exports;
var module;
var process;
var require;
var global;
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.ES6Promise = factory());
}(this, (function () {
    'use strict';
    function objectOrFunction(x) {
        var type = typeof x;
        return x !== null && (type === 'object' || type === 'function');
    }
    function isFunction(x) {
        return typeof x === 'function';
    }
    var _isArray = void 0;
    if (Array.isArray) {
        _isArray = Array.isArray;
    }
    else {
        _isArray = function (x) {
            return Object.prototype.toString.call(x) === '[object Array]';
        };
    }
    var isArray = _isArray;
    var len = 0;
    var vertxNext = void 0;
    var customSchedulerFn = void 0;
    var asap = function asap(callback, arg) {
        queue[len] = callback;
        queue[len + 1] = arg;
        len += 2;
        if (len === 2) {
            // If len is 2, that means that we need to schedule an async flush.
            // If additional callbacks are queued before the queue is flushed, they
            // will be processed by this flush that we are scheduling.
            if (customSchedulerFn) {
                customSchedulerFn(flush);
            }
            else {
                scheduleFlush();
            }
        }
    };
    function setScheduler(scheduleFn) {
        customSchedulerFn = scheduleFn;
    }
    function setAsap(asapFn) {
        asap = asapFn;
    }
    var browserWindow = typeof window !== 'undefined' ? window : undefined;
    var browserGlobal = browserWindow || {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
    var importScripts;
    // test for web worker but not in IE10
    var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
    // node
    function useNextTick() {
        // node version 0.10.x displays a deprecation warning when nextTick is used recursively
        // see https://github.com/cujojs/when/issues/410 for details
        return function () {
            return process.nextTick(flush);
        };
    }
    // vertx
    function useVertxTimer() {
        if (typeof vertxNext !== 'undefined') {
            return function () {
                vertxNext(flush);
            };
        }
        return useSetTimeout();
    }
    function useMutationObserver() {
        var iterations = 0;
        var observer = new BrowserMutationObserver(flush);
        var node = document.createTextNode('');
        observer.observe(node, { characterData: true });
        return function () {
            node.data = iterations = ++iterations % 2;
        };
    }
    // web worker
    function useMessageChannel() {
        var channel = new MessageChannel();
        channel.port1.onmessage = flush;
        return function () {
            return channel.port2.postMessage(0);
        };
    }
    function useSetTimeout() {
        // Store setTimeout reference so es6-promise will be unaffected by
        // other code modifying setTimeout (like sinon.useFakeTimers())
        var globalSetTimeout = setTimeout;
        return function () {
            return globalSetTimeout(flush, 1);
        };
    }
    var queue = new Array(1000);
    function flush() {
        for (var i = 0; i < len; i += 2) {
            var callback = queue[i];
            var arg = queue[i + 1];
            callback(arg);
            queue[i] = undefined;
            queue[i + 1] = undefined;
        }
        len = 0;
    }
    function attemptVertx() {
        try {
            var vertx = Function('return this')().require('vertx');
            vertxNext = vertx.runOnLoop || vertx.runOnContext;
            return useVertxTimer();
        }
        catch (e) {
            return useSetTimeout();
        }
    }
    var scheduleFlush = void 0;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (isNode) {
        scheduleFlush = useNextTick();
    }
    else if (BrowserMutationObserver) {
        scheduleFlush = useMutationObserver();
    }
    else if (isWorker) {
        scheduleFlush = useMessageChannel();
    }
    else if (browserWindow === undefined && typeof require === 'function') {
        scheduleFlush = attemptVertx();
    }
    else {
        scheduleFlush = useSetTimeout();
    }
    function then(onFulfillment, onRejection) {
        var parent = this;
        var child = new this.constructor(noop);
        if (child[PROMISE_ID] === undefined) {
            makePromise(child);
        }
        var _state = parent._state;
        if (_state) {
            var callback = arguments[_state - 1];
            asap(function (a, b) {
                return invokeCallback(_state, child, callback, parent._result);
            });
        }
        else {
            subscribe(parent, child, onFulfillment, onRejection);
        }
        return child;
    }
    /**
      `Promise.resolve` returns a promise that will become resolved with the
      passed `value`. It is shorthand for the following:
    
      ```javascript
      let promise = new Promise(function(resolve, reject){
        resolve(1);
      });
    
      promise.then(function(value){
        // value === 1
      });
      ```
    
      Instead of writing the above, your code now simply becomes the following:
    
      ```javascript
      let promise = Promise.resolve(1);
    
      promise.then(function(value){
        // value === 1
      });
      ```
    
      @method resolve
      @static
      @param {Any} value value that the returned promise will be resolved with
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    function resolve$1(object) {
        /*jshint validthis:true */
        var Constructor = this;
        if (object && typeof object === 'object' && object.constructor === Constructor) {
            return object;
        }
        var promise = new Constructor(noop);
        resolve(promise, object);
        return promise;
    }
    var PROMISE_ID = Math.random().toString(36).substring(2);
    function noop() { }
    var PENDING = void 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    var TRY_CATCH_ERROR = { error: null };
    function selfFulfillment() {
        return new TypeError("You cannot resolve a promise with itself");
    }
    function cannotReturnOwn() {
        return new TypeError('A promises callback cannot return that same promise.');
    }
    function getThen(promise) {
        try {
            return promise.then;
        }
        catch (error) {
            TRY_CATCH_ERROR.error = error;
            return TRY_CATCH_ERROR;
        }
    }
    function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler, x) {
        try {
            then$$1.call(value, fulfillmentHandler, rejectionHandler);
        }
        catch (e) {
            return e;
        }
    }
    function handleForeignThenable(promise, thenable, then$$1) {
        asap(function (promise) {
            var sealed = false;
            var error = tryThen(then$$1, thenable, function (value) {
                if (sealed) {
                    return;
                }
                sealed = true;
                if (thenable !== value) {
                    resolve(promise, value);
                }
                else {
                    fulfill(promise, value);
                }
            }, function (reason) {
                if (sealed) {
                    return;
                }
                sealed = true;
                reject(promise, reason);
            }, 'Settle: ' + (promise._label || ' unknown promise'));
            if (!sealed && error) {
                sealed = true;
                reject(promise, error);
            }
        }, promise);
    }
    function handleOwnThenable(promise, thenable) {
        if (thenable._state === FULFILLED) {
            fulfill(promise, thenable._result);
        }
        else if (thenable._state === REJECTED) {
            reject(promise, thenable._result);
        }
        else {
            subscribe(thenable, undefined, function (value) {
                return resolve(promise, value);
            }, function (reason) {
                return reject(promise, reason);
            });
        }
    }
    function handleMaybeThenable(promise, maybeThenable, then$$1) {
        if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
            handleOwnThenable(promise, maybeThenable);
        }
        else {
            if (then$$1 === TRY_CATCH_ERROR) {
                reject(promise, TRY_CATCH_ERROR.error);
                TRY_CATCH_ERROR.error = null;
            }
            else if (then$$1 === undefined) {
                fulfill(promise, maybeThenable);
            }
            else if (isFunction(then$$1)) {
                handleForeignThenable(promise, maybeThenable, then$$1);
            }
            else {
                fulfill(promise, maybeThenable);
            }
        }
    }
    function resolve(promise, value) {
        if (promise === value) {
            reject(promise, selfFulfillment());
        }
        else if (objectOrFunction(value)) {
            handleMaybeThenable(promise, value, getThen(value));
        }
        else {
            fulfill(promise, value);
        }
    }
    function publishRejection(promise) {
        if (promise._onerror) {
            promise._onerror(promise._result);
        }
        publish(promise);
    }
    function fulfill(promise, value) {
        if (promise._state !== PENDING) {
            return;
        }
        promise._result = value;
        promise._state = FULFILLED;
        if (promise._subscribers.length !== 0) {
            asap(publish, promise);
        }
    }
    function reject(promise, reason) {
        if (promise._state !== PENDING) {
            return;
        }
        promise._state = REJECTED;
        promise._result = reason;
        asap(publishRejection, promise);
    }
    function subscribe(parent, child, onFulfillment, onRejection) {
        var _subscribers = parent._subscribers;
        var length = _subscribers.length;
        parent._onerror = null;
        _subscribers[length] = child;
        _subscribers[length + FULFILLED] = onFulfillment;
        _subscribers[length + REJECTED] = onRejection;
        if (length === 0 && parent._state) {
            asap(publish, parent);
        }
    }
    function publish(promise) {
        var subscribers = promise._subscribers;
        var settled = promise._state;
        if (subscribers.length === 0) {
            return;
        }
        var child = void 0, callback = void 0, detail = promise._result;
        for (var i = 0; i < subscribers.length; i += 3) {
            child = subscribers[i];
            callback = subscribers[i + settled];
            if (child) {
                invokeCallback(settled, child, callback, detail);
            }
            else {
                callback(detail);
            }
        }
        promise._subscribers.length = 0;
    }
    function tryCatch(callback, detail) {
        try {
            return callback(detail);
        }
        catch (e) {
            TRY_CATCH_ERROR.error = e;
            return TRY_CATCH_ERROR;
        }
    }
    function invokeCallback(settled, promise, callback, detail) {
        var hasCallback = isFunction(callback), value = void 0, error = void 0, succeeded = void 0, failed = void 0;
        if (hasCallback) {
            value = tryCatch(callback, detail);
            if (value === TRY_CATCH_ERROR) {
                failed = true;
                error = value.error;
                value.error = null;
            }
            else {
                succeeded = true;
            }
            if (promise === value) {
                reject(promise, cannotReturnOwn());
                return;
            }
        }
        else {
            value = detail;
            succeeded = true;
        }
        if (promise._state !== PENDING) {
            // noop
        }
        else if (hasCallback && succeeded) {
            resolve(promise, value);
        }
        else if (failed) {
            reject(promise, error);
        }
        else if (settled === FULFILLED) {
            fulfill(promise, value);
        }
        else if (settled === REJECTED) {
            reject(promise, value);
        }
    }
    function initializePromise(promise, resolver) {
        try {
            resolver(function resolvePromise(value) {
                resolve(promise, value);
            }, function rejectPromise(reason) {
                reject(promise, reason);
            });
        }
        catch (e) {
            reject(promise, e);
        }
    }
    var id = 0;
    function nextId() {
        return id++;
    }
    function makePromise(promise) {
        promise[PROMISE_ID] = id++;
        promise._state = undefined;
        promise._result = undefined;
        promise._subscribers = [];
    }
    function validationError() {
        return new Error('Array Methods must be provided an Array');
    }
    var Enumerator = function () {
        function Enumerator(Constructor, input) {
            this._instanceConstructor = Constructor;
            this.promise = new Constructor(noop);
            if (!this.promise[PROMISE_ID]) {
                makePromise(this.promise);
            }
            if (isArray(input)) {
                this.length = input.length;
                this._remaining = input.length;
                this._result = new Array(this.length);
                if (this.length === 0) {
                    fulfill(this.promise, this._result);
                }
                else {
                    this.length = this.length || 0;
                    this._enumerate(input);
                    if (this._remaining === 0) {
                        fulfill(this.promise, this._result);
                    }
                }
            }
            else {
                reject(this.promise, validationError());
            }
        }
        Enumerator.prototype._enumerate = function _enumerate(input) {
            for (var i = 0; this._state === PENDING && i < input.length; i++) {
                this._eachEntry(input[i], i);
            }
        };
        Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
            var c = this._instanceConstructor;
            var resolve$$1 = c.resolve;
            if (resolve$$1 === resolve$1) {
                var _then = getThen(entry);
                if (_then === then && entry._state !== PENDING) {
                    this._settledAt(entry._state, i, entry._result);
                }
                else if (typeof _then !== 'function') {
                    this._remaining--;
                    this._result[i] = entry;
                }
                else if (c === Promise$2) {
                    var promise = new c(noop);
                    handleMaybeThenable(promise, entry, _then);
                    this._willSettleAt(promise, i);
                }
                else {
                    this._willSettleAt(new c(function (resolve$$1) {
                        return resolve$$1(entry);
                    }), i);
                }
            }
            else {
                this._willSettleAt(resolve$$1(entry), i);
            }
        };
        Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
            var promise = this.promise;
            if (promise._state === PENDING) {
                this._remaining--;
                if (state === REJECTED) {
                    reject(promise, value);
                }
                else {
                    this._result[i] = value;
                }
            }
            if (this._remaining === 0) {
                fulfill(promise, this._result);
            }
        };
        Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
            var enumerator = this;
            subscribe(promise, undefined, function (value) {
                return enumerator._settledAt(FULFILLED, i, value);
            }, function (reason) {
                return enumerator._settledAt(REJECTED, i, reason);
            });
        };
        return Enumerator;
    }();
    /**
      `Promise.all` accepts an array of promises, and returns a new promise which
      is fulfilled with an array of fulfillment values for the passed promises, or
      rejected with the reason of the first passed promise to be rejected. It casts all
      elements of the passed iterable to promises as it runs this algorithm.
    
      Example:
    
      ```javascript
      let promise1 = resolve(1);
      let promise2 = resolve(2);
      let promise3 = resolve(3);
      let promises = [ promise1, promise2, promise3 ];
    
      Promise.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```
    
      If any of the `promises` given to `all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:
    
      Example:
    
      ```javascript
      let promise1 = resolve(1);
      let promise2 = reject(new Error("2"));
      let promise3 = reject(new Error("3"));
      let promises = [ promise1, promise2, promise3 ];
    
      Promise.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```
    
      @method all
      @static
      @param {Array} entries array of promises
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
      @static
    */
    function all(entries) {
        return new Enumerator(this, entries).promise;
    }
    /**
      `Promise.race` returns a new promise which is settled in the same way as the
      first passed promise to settle.
    
      Example:
    
      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });
    
      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 2');
        }, 100);
      });
    
      Promise.race([promise1, promise2]).then(function(result){
        // result === 'promise 2' because it was resolved before promise1
        // was resolved.
      });
      ```
    
      `Promise.race` is deterministic in that only the state of the first
      settled promise matters. For example, even if other promises given to the
      `promises` array argument are resolved, but the first settled promise has
      become rejected before the other promises became fulfilled, the returned
      promise will become rejected:
    
      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });
    
      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error('promise 2'));
        }, 100);
      });
    
      Promise.race([promise1, promise2]).then(function(result){
        // Code here never runs
      }, function(reason){
        // reason.message === 'promise 2' because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```
    
      An example real-world use case is implementing timeouts:
    
      ```javascript
      Promise.race([ajax('foo.json'), timeout(5000)])
      ```
    
      @method race
      @static
      @param {Array} promises array of promises to observe
      Useful for tooling.
      @return {Promise} a promise which settles in the same way as the first passed
      promise to settle.
    */
    function race(entries) {
        /*jshint validthis:true */
        var Constructor = this;
        if (!isArray(entries)) {
            return new Constructor(function (_, reject) {
                return reject(new TypeError('You must pass an array to race.'));
            });
        }
        else {
            return new Constructor(function (resolve, reject) {
                var length = entries.length;
                for (var i = 0; i < length; i++) {
                    Constructor.resolve(entries[i]).then(resolve, reject);
                }
            });
        }
    }
    /**
      `Promise.reject` returns a promise rejected with the passed `reason`.
      It is shorthand for the following:
    
      ```javascript
      let promise = new Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });
    
      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```
    
      Instead of writing the above, your code now simply becomes the following:
    
      ```javascript
      let promise = Promise.reject(new Error('WHOOPS'));
    
      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```
    
      @method reject
      @static
      @param {Any} reason value that the returned promise will be rejected with.
      Useful for tooling.
      @return {Promise} a promise rejected with the given `reason`.
    */
    function reject$1(reason) {
        /*jshint validthis:true */
        var Constructor = this;
        var promise = new Constructor(noop);
        reject(promise, reason);
        return promise;
    }
    function needsResolver() {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }
    function needsNew() {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.
    
      Terminology
      -----------
    
      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.
    
      A promise can be in one of three states: pending, fulfilled, or rejected.
    
      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.
    
      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.
    
    
      Basic Usage:
      ------------
    
      ```js
      let promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);
    
        // on failure
        reject(reason);
      });
    
      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```
    
      Advanced Usage:
      ---------------
    
      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.
    
      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          let xhr = new XMLHttpRequest();
    
          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();
    
          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }
    
      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```
    
      Unlike callbacks, promises are great composable primitives.
    
      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON
    
        return values;
      });
      ```
    
      @class Promise
      @param {Function} resolver
      Useful for tooling.
      @constructor
    */
    var Promise$2 = function () {
        function Promise(resolver) {
            this[PROMISE_ID] = nextId();
            this._result = this._state = undefined;
            this._subscribers = [];
            if (noop !== resolver) {
                typeof resolver !== 'function' && needsResolver();
                this instanceof Promise ? initializePromise(this, resolver) : needsNew();
            }
        }
        /**
        The primary way of interacting with a promise is through its `then` method,
        which registers callbacks to receive either a promise's eventual value or the
        reason why the promise cannot be fulfilled.
         ```js
        findUser().then(function(user){
          // user is available
        }, function(reason){
          // user is unavailable, and you are given the reason why
        });
        ```
         Chaining
        --------
         The return value of `then` is itself a promise.  This second, 'downstream'
        promise is resolved with the return value of the first promise's fulfillment
        or rejection handler, or rejected if the handler throws an exception.
         ```js
        findUser().then(function (user) {
          return user.name;
        }, function (reason) {
          return 'default name';
        }).then(function (userName) {
          // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
          // will be `'default name'`
        });
         findUser().then(function (user) {
          throw new Error('Found user, but still unhappy');
        }, function (reason) {
          throw new Error('`findUser` rejected and we're unhappy');
        }).then(function (value) {
          // never reached
        }, function (reason) {
          // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
          // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
        });
        ```
        If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
         ```js
        findUser().then(function (user) {
          throw new PedagogicalException('Upstream error');
        }).then(function (value) {
          // never reached
        }).then(function (value) {
          // never reached
        }, function (reason) {
          // The `PedgagocialException` is propagated all the way down to here
        });
        ```
         Assimilation
        ------------
         Sometimes the value you want to propagate to a downstream promise can only be
        retrieved asynchronously. This can be achieved by returning a promise in the
        fulfillment or rejection handler. The downstream promise will then be pending
        until the returned promise is settled. This is called *assimilation*.
         ```js
        findUser().then(function (user) {
          return findCommentsByAuthor(user);
        }).then(function (comments) {
          // The user's comments are now available
        });
        ```
         If the assimliated promise rejects, then the downstream promise will also reject.
         ```js
        findUser().then(function (user) {
          return findCommentsByAuthor(user);
        }).then(function (comments) {
          // If `findCommentsByAuthor` fulfills, we'll have the value here
        }, function (reason) {
          // If `findCommentsByAuthor` rejects, we'll have the reason here
        });
        ```
         Simple Example
        --------------
         Synchronous Example
         ```javascript
        let result;
         try {
          result = findResult();
          // success
        } catch(reason) {
          // failure
        }
        ```
         Errback Example
         ```js
        findResult(function(result, err){
          if (err) {
            // failure
          } else {
            // success
          }
        });
        ```
         Promise Example;
         ```javascript
        findResult().then(function(result){
          // success
        }, function(reason){
          // failure
        });
        ```
         Advanced Example
        --------------
         Synchronous Example
         ```javascript
        let author, books;
         try {
          author = findAuthor();
          books  = findBooksByAuthor(author);
          // success
        } catch(reason) {
          // failure
        }
        ```
         Errback Example
         ```js
         function foundBooks(books) {
         }
         function failure(reason) {
         }
         findAuthor(function(author, err){
          if (err) {
            failure(err);
            // failure
          } else {
            try {
              findBoooksByAuthor(author, function(books, err) {
                if (err) {
                  failure(err);
                } else {
                  try {
                    foundBooks(books);
                  } catch(reason) {
                    failure(reason);
                  }
                }
              });
            } catch(error) {
              failure(err);
            }
            // success
          }
        });
        ```
         Promise Example;
         ```javascript
        findAuthor().
          then(findBooksByAuthor).
          then(function(books){
            // found books
        }).catch(function(reason){
          // something went wrong
        });
        ```
         @method then
        @param {Function} onFulfilled
        @param {Function} onRejected
        Useful for tooling.
        @return {Promise}
        */
        /**
        `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
        as the catch block of a try/catch statement.
        ```js
        function findAuthor(){
        throw new Error('couldn't find that author');
        }
        // synchronous
        try {
        findAuthor();
        } catch(reason) {
        // something went wrong
        }
        // async with promises
        findAuthor().catch(function(reason){
        // something went wrong
        });
        ```
        @method catch
        @param {Function} onRejection
        Useful for tooling.
        @return {Promise}
        */
        Promise.prototype.catch = function _catch(onRejection) {
            return this.then(null, onRejection);
        };
        /**
          `finally` will be invoked regardless of the promise's fate just as native
          try/catch/finally behaves
      
          Synchronous example:
      
          ```js
          findAuthor() {
            if (Math.random() > 0.5) {
              throw new Error();
            }
            return new Author();
          }
      
          try {
            return findAuthor(); // succeed or fail
          } catch(error) {
            return findOtherAuther();
          } finally {
            // always runs
            // doesn't affect the return value
          }
          ```
      
          Asynchronous example:
      
          ```js
          findAuthor().catch(function(reason){
            return findOtherAuther();
          }).finally(function(){
            // author was either found, or not
          });
          ```
      
          @method finally
          @param {Function} callback
          @return {Promise}
        */
        Promise.prototype.finally = function _finally(callback) {
            var promise = this;
            var constructor = promise.constructor;
            if (isFunction(callback)) {
                return promise.then(function (value) {
                    return constructor.resolve(callback()).then(function () {
                        return value;
                    });
                }, function (reason) {
                    return constructor.resolve(callback()).then(function () {
                        throw reason;
                    });
                });
            }
            return promise.then(callback, callback);
        };
        return Promise;
    }();
    Promise$2.prototype.then = then;
    Promise$2.all = all;
    Promise$2.race = race;
    Promise$2.resolve = resolve$1;
    Promise$2.reject = reject$1;
    Promise$2._setScheduler = setScheduler;
    Promise$2._setAsap = setAsap;
    Promise$2._asap = asap;
    /*global self*/
    function polyfill() {
        var local = void 0;
        if (typeof global !== 'undefined') {
            local = global;
        }
        else if (typeof self !== 'undefined') {
            local = self;
        }
        else {
            try {
                local = Function('return this')();
            }
            catch (e) {
                throw new Error('polyfill failed because global object is unavailable in this environment');
            }
        }
        var P = local.Promise;
        if (P) {
            var promiseToString = null;
            try {
                promiseToString = Object.prototype.toString.call(P.resolve());
            }
            catch (e) {
                // silently ignored
            }
            if (promiseToString === '[object Promise]' && !P.cast) {
                return;
            }
        }
        local.Promise = Promise$2;
    }
    // Strange compat..
    Promise$2.polyfill = polyfill;
    Promise$2.Promise = Promise$2;
    Promise$2.polyfill();
    return Promise$2;
})));
//# sourceMappingURL=es6-promise.auto.map
define("index", ["require", "exports"], function (require, exports) {
    "use strict";
    return { JSW: JSW };
});
//# sourceMappingURL=jsw.js.map