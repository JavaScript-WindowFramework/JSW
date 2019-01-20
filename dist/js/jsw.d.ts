/**
 * JavaScriptWindowフレームワーク用名前空間
*/
declare namespace JSW {
    /**
     * 位置設定用
    */
    interface Point {
        x: number;
        y: number;
    }
    /**
     * サイズ設定用
    */
    interface Size {
        width: number;
        height: number;
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
    interface MovePoint {
        basePoint: Point;
        nowPoint: Point;
        nodePoint: Point;
        nodeSize: Size;
    }
    /**
     * ウインドウ等総合管理クラス
     *
     * @export
     * @class Jsw
     */
    class Jsw {
        static nodeX: number;
        static nodeY: number;
        static baseX: number;
        static baseY: number;
        static nodeWidth: number;
        static nodeHeight: number;
        static moveNode: HTMLElement;
        static frame: any;
        static layoutForced: boolean;
        static layoutHandler: any;
        /**
         * マウスとタッチイベントの座標取得処理
         * @param  {MouseEvent|TouchEvent} e
         * @returns {Point} マウスの座標
         */
        static getPos(e: MouseEvent | TouchEvent): Point;
        /**
         * 対象ノードに対して移動を許可し、イベントを発生させる
         *
         * @static
         * @param {HTMLElement} node
         * @memberof Jsw
         */
        static enableMove(node: HTMLElement): void;
        /**
         * ノードに対してイベントを発生させる
         *
         * @static
         * @param {HTMLElement} node 対象ノード
         * @param {string} ename イベント名
         * @param {*} [params] イベント発生時にevent.paramsの形で送られる
         * @memberof Jsw
         */
        static callEvent(node: HTMLElement, ename: string, params?: any): void;
        /**
         *イベントを作成する
         *
         * @static
         * @param {string} ename イベント名
         * @param {*} [params] イベント発生時にevent.paramsの形で送られる
         * @returns {Event} 作成したイベント
         * @memberof Jsw
         */
        static createEvent(ename: string, params?: any): Event;
        /**
         *ノードを作成する
         *
         * @static
         * @param {string} tagName タグ名
         * @param {*} [params] タグパラメータ
         * @returns {HTMLElement} 作成したノード
         * @memberof Jsw
         */
        static createElement(tagName: string, params?: any): HTMLElement;
        /**
         *ウインドウレイアウトの更新要求
         *実際の処理は遅延非同期で行われる
         *
         * @static
         * @param {boolean} flag	true:全Window強制更新 false:更新の必要があるWindowのみ更新
         * @memberof Jsw
         */
        static layout(flag: boolean): void;
    }
    /**
     *ウインドウ基本クラス
     *
     * @export
     * @class Window
     */
    class Window {
        private hNode;
        private JData;
        /**
         * Creates an instance of Window.
         * @param {{ frame?: boolean, title?: boolean, layer?: number}} [params] ウインドウ作成用パラメータ
         * {	frame?:boolean,
         * 		title?:boolean,
         * 		layer?:number
         * }
         * @memberof Window
         */
        constructor(params?: {
            frame?: boolean;
            title?: boolean;
            layer?: number;
            overlap?: boolean;
        });
        setOverlap(flag: boolean): void;
        private addFrame;
        private onMouseDown;
        private onMouseMove;
        /**
         *イベントの受け取り
         *
         * @param {string} type イベントタイプ
         * @param {*} listener コールバックリスナー
         * @param {*} [options] オプション
         * @memberof Window
         */
        addEventListener(type: string, listener: any, options?: any): void;
        /**
         *イベントの要求
         *
         * @param {string} type イベントタイプ
         * @param {*} params パラメータ
         * @memberof Window
         */
        callEvent(type: string, params: any): void;
        /**
         *ウインドウのノードを得る
         *
         * @returns {HTMLElement} ウインドウノード
         * @memberof Window
         */
        getNode(): HTMLElement;
        /**
         *ウインドウの移動
         *
         * @param {number} x
         * @param {number} y
         * @memberof Window
         */
        movePos(x: number, y: number): void;
        /**
         *ウインドウの位置設定
         *引数を省略した場合は親のサイズを考慮して中央へ
         * @param {number} [x]
         * @param {number} [y]
         * @memberof Window
         */
        setPos(x?: number, y?: number): void;
        /**
         *X座標の設定
         *
         * @param {number} x
         * @memberof Window
         */
        setPosX(x: number): void;
        /**
         *Y座標の設定
         *
         * @param {number} y
         * @memberof Window
         */
        setPosY(y: number): void;
        /**
         *親ウインドウの取得
         *
         * @returns {Window} 親ウインドウ
         * @memberof Window
         */
        getParent(): Window;
        /**
         *クライアント領域のドラッグによる移動の許可
         *
         * @param {boolean} moveable true:許可 false:不許可
         * @memberof Window
         */
        setMoveable(moveable: boolean): void;
        /**
         *X座標を返す
         *
         * @returns {number}
         * @memberof Window
         */
        getPosX(): number;
        /**
         *Y座標を返す
         *
         * @returns {number}
         * @memberof Window
         */
        getPosY(): number;
        /**
         *ウインドウの幅を返す
         *
         * @returns
         * @memberof Window
         */
        getWidth(): number;
        /**
         *ウインドウの高さを返す
         *
         * @returns
         * @memberof Window
         */
        getHeight(): number;
        /**
         *ウインドウサイズの設定
         *
         * @param {number} width
         * @param {number} height
         * @memberof Window
         */
        setSize(width: number, height: number): void;
        /**
         *ウインドウの幅の設定
         *
         * @param {number} width
         * @memberof Window
         */
        setWidth(width: number): void;
        /**
         *ウインドウの高さの設定
         *
         * @param {number} height
         * @memberof Window
         */
        setHeight(height: number): void;
        /**
         * クライアント領域のpadding設定
         *
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
         * @memberof Window
         */
        setPadding(x1: number, y1: number, x2: number, y2: number): void;
        /**
         *配置時のマージン設定
         *
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
         * @memberof Window
         */
        setMargin(x1: number, y1: number, x2: number, y2: number): void;
        /**
         *ウインドウの可視状態の取得
         *
         * @returns {boolean}
         * @memberof Window
         */
        isVisible(): boolean;
        /**
         *ウインドウの可視状態の設定
         *
         * @param {boolean} flag
         * @memberof Window
         */
        setVisible(flag: boolean): void;
        /**
         *ウインドウの重ね合わせを最上位に設定
         *
         * @param {boolean} flag
         * @memberof Window
         */
        setOrderTop(flag: boolean): void;
        /**
         *ウインドウの重ね合わせ順位の設定
         *値が大きいほど上位
         * @param {number} level デフォルト:0 FrameWindow:10
         * @memberof Window
         */
        setOrderLayer(level: number): void;
        /**
         *レイアウトの再構成要求
         *
         * @memberof Window
         */
        layout(): void;
        /**
         *子ウインドウのサイズを再計算
         *
         * @param {boolean} flag true:強制再計算 false:必要があれば再計算
         * @returns {boolean} 再計算の必要を行ったかどうか
         * @memberof Window
         */
        onMeasure(flag: boolean): boolean;
        /**
         *親のクライアント領域を返す
         *
         * @returns
         * @memberof Window
         */
        getParentWidth(): number;
        /**
         *親のクライアント領域を返す
         *
         * @returns
         * @memberof Window
         */
        getParentHeight(): number;
        /**
         *位置やサイズの確定処理
         *非同期で必要なときに呼び出されるので、基本的には直接呼び出さないこと
         * @param {boolean} flag true:強制 false:必要なら
         * @memberof Window
         */
        onLayout(flag: boolean): void;
        /**
         *ウインドウの重ね合わせ順位を上位に持って行く
         *
         * @param {boolean} [flag] ウインドウをアクティブにするかどうか
         * @memberof Window
         */
        foreground(flag?: boolean): void;
        /**
         *クライアント領域のスクロールの可否
         *
         * @param {boolean} flag
         * @memberof Window
         */
        setScroll(flag: boolean): void;
        /**
         *クライアント領域のスクロールが有効かどうか
         *
         * @returns {boolean}
         * @memberof Window
         */
        isScroll(): boolean;
        /**
         *ウインドウを閉じる
         *
         * @memberof Window
         */
        close(): void;
        /**
         *絶対位置の取得
         *
         * @returns
         * @memberof Window
         */
        getAbsX(): number;
        /**
        *絶対位置の取得
        *
        * @returns
        * @memberof Window
        */
        getAbsY(): number;
        /**
         *クライアントノードを返す
         *WindowクラスはgetNode()===getClient()
         *FrameWindowはgetNode()!==getClient()
         * @returns {HTMLElement}
         * @memberof Window
         */
        getClient(): HTMLElement;
        /**
         *クライアント領域の基準位置を返す
         *
         * @returns
         * @memberof Window
         */
        getClientX(): number;
        /**
         *クライアント領域の基準位置を返す
         *
         * @returns
         * @memberof Window
         */
        getClientY(): number;
        /**
         *クライアントサイズを元にウインドウサイズを設定
         *
         * @param {number} width
         * @param {number} height
         * @memberof Window
         */
        setClientSize(width: number, height: number): void;
        /**
         *クライアントサイズを元にウインドウサイズを設定
         *
         * @param {number} width
         * @memberof Window
         */
        setClientWidth(width: number): void;
        /**
         *クライアントサイズを元にウインドウサイズを設定
         *
         * @param {number} height
         * @memberof Window
         */
        setClientHeight(height: number): void;
        /**
         *クライアントサイズを取得
         *
         * @returns {number}
         * @memberof Window
         */
        getClientWidth(): number;
        /**
         *クライアントサイズを取得
         *
         * @returns {number}
         * @memberof Window
         */
        getClientHeight(): number;
        /**
         *子ノードの追加
         *
         * @param {Window} child 子ウインドウ
         * @param {('left' | 'right' | 'top' | 'bottom' | 'client' | null)} [style] ドッキング位置
         * @memberof Window
         */
        addChild(child: Window, style?: 'left' | 'right' | 'top' | 'bottom' | 'client' | null): void;
        /**
         *ドッキングスタイルの設定
         *
         * @param {('left' | 'right' | 'top' | 'bottom' | 'client' | null)} style ドッキング位置
         * @memberof Window
         */
        setChildStyle(style: 'left' | 'right' | 'top' | 'bottom' | 'client' | null): void;
        /**
         *子ウインドウを全て切り離す
         *
         * @memberof Window
         */
        removeChildAll(): void;
        /**
         *子ウインドウを切り離す
         *
         * @param {Window} child
         * @returns
         * @memberof Window
         */
        removeChild(child: Window): void;
        /**
         *自動サイズ調整の状態を取得
         *
         * @returns
         * @memberof Window
         */
        isAutoSize(): boolean;
        /**
         *自動サイズ調整を設定
         *
         * @param {boolean} scale
         * @memberof Window
         */
        setAutoSize(scale: boolean): void;
        /**
         *タイトル設定
         *
         * @param {string} title
         * @memberof Window
         */
        setTitle(title: string): void;
        /**
         *タイトル取得
         *
         * @returns {string}
         * @memberof Window
         */
        getTitle(): string;
        /**
         *ウインドウの最大化
         *
         * @param {boolean} flag
         * @memberof Window
         */
        setMaximize(flag: boolean): void;
        /**
         *ウインドウの最小化
         *
         * @param {boolean} flag
         * @memberof Window
         */
        setMinimize(flag: boolean): void;
    }
    /**
     *フレームウインドウクラス
     *
     * @export
     * @class FrameWindow
     * @extends {Window}
     */
    class FrameWindow extends Window {
        constructor(param?: any);
    }
    interface JSWSPLITDATA {
        overlay: any;
        overlayOpen: any;
        overlayMove: any;
        splitterThick: any;
        splitterPos: any;
        splitterType: any;
        pos: any;
        type: any;
        childList: Window[];
    }
    /**
     *分割ウインドウ用クラス
     *
     * @export
     * @class Splitter
     * @extends {Window}
     */
    class Splitter extends Window {
        JDataSplit: JSWSPLITDATA;
        /**
         *Creates an instance of Splitter.
         * @param {number} [splitPos]
         * @param {('ns'|'sn'|'ew'|'we')} [splitType] 分割領域のタイプ
         * @memberof Splitter
         */
        constructor(splitPos?: number, splitType?: 'ns' | 'sn' | 'ew' | 'we');
        /**
         *子ウインドウの追加
         *
         * @param {number} index 追加位置
         * @param {Window} child 追加ウインドウ
         * @param {('left' | 'right' | 'top' | 'bottom' | 'client' | null)} [arrgement] ドッキングタイプ
         * @memberof Splitter
         */
        addChild(index: any, child: any, arrgement?: 'left' | 'right' | 'top' | 'bottom' | 'client' | null): void;
        /**
         *子ウインドウを切り離す
         *
         * @param {number} index 削除位置
         * @param {Window} [child] 削除ウインドウ
         * @memberof Splitter
         */
        removeChild(index: any, child?: any): void;
        /**
         *子ウインドウを全て切り離す
         *
         * @param {number} [index] 削除位置
         * @memberof Splitter
         */
        removeChildAll(index?: number): void;
        /**
         *分割バーの位置設定
         *
         * @param {number} pos
         * @param {('ns'|'sn'|'ew'|'we')} [type]
         * @memberof Splitter
         */
        setSplitterPos(pos: number, type?: 'ns' | 'sn' | 'ew' | 'we'): void;
        /**
         *動的バーの設定
         *
         * @param {boolean} flag true:有効 false:無効
         * @memberof Splitter
         */
        setOverlay(flag: boolean): void;
        /**
         *子ウインドウの取得
         *
         * @param {number} index 位置
         * @returns {Window} 子ウインドウ
         * @memberof Splitter
         */
        getChild(index: number): Window;
        /**
         *動的バーを閉じる
         *
         * @memberof Splitter
         */
        slideClose(): void;
        slideHandle: any;
        private slide;
        slideTimeoutHandle: any;
        private slideTimeout;
    }
    class Panel extends Window {
        constructor();
    }
    interface TREEVIEW_EVENT_SELECT extends Event {
        params: {
            item: TreeItem;
        };
    }
    interface TREEVIEW_EVENT_DROP extends Event {
        params: {
            item: TreeItem;
            event: DragEvent;
        };
    }
    interface TREEVIEW_EVENT_DRAG_START extends Event {
        params: {
            item: TreeItem;
            event: DragEvent;
        };
    }
    interface TREEVIEW_EVENT_OPEN extends Event {
        params: {
            item: TreeItem;
            opened: boolean;
        };
    }
    /**
     *
     *
     * @export
     * @class TreeItem
     */
    class TreeItem {
        private hNode;
        private childNode;
        private opened;
        private body;
        private value;
        private keys;
        /**
         *Creates an instance of TreeItem.
         * @param {string} [label]
         * @param {boolean} [opened]
         * @memberof TreeItem
         */
        constructor(label?: string, opened?: boolean);
        /**
         *アイテムのノードを返す
         *
         * @returns {HTMLElement}
         * @memberof TreeItem
         */
        getNode(): HTMLElement;
        /**
         *アイテムのラベル部分のノードを返す
         *
         * @returns {HTMLElement}
         * @memberof TreeItem
         */
        getBody(): HTMLElement;
        /**
         *アイテムに対してキーを関連付ける
         *
         * @param {string} name
         * @param {*} value
         * @memberof TreeItem
         */
        setKey(name: string, value: any): void;
        /**
         *アイテムのキーを取得する
         *
         * @param {string} name
         * @returns
         * @memberof TreeItem
         */
        getKey(name: string): any;
        /**
         *アイテムを追加する
         *
         * @param {*} [label] ラベル
         * @param {boolean} [opened] オープン状態
         * @returns {TreeItem} 追加したアイテム
         * @memberof TreeItem
         */
        addItem(label?: any, opened?: boolean): TreeItem;
        /**
         *子アイテムを全てクリア
         *
         * @memberof TreeItem
         */
        clearItem(): void;
        /**
         *自分自身を親から切り離す
         *
         * @memberof TreeItem
         */
        removeItem(): void;
        /**
         *子アイテムの数を返す
         *
         * @returns {number}
         * @memberof TreeItem
         */
        getChildCount(): number;
        /**
         *アイテムに関連付ける値を設定
         *
         * @param {*} value
         * @memberof TreeItem
         */
        setItemValue(value: any): void;
        /**
         *アイテムに関連付けた値を取得
         *
         * @returns {*}
         * @memberof TreeItem
         */
        getItemValue(): any;
        /**
         *アイテムのラベルを設定
         *
         * @param {string} value
         * @memberof TreeItem
         */
        setItemText(value: string): void;
        /**
         *アイテムのラベルを取得
         *
         * @returns {string}
         * @memberof TreeItem
         */
        getItemText(): string;
        /**
         *子アイテムを取得
         *
         * @param {number} index
         * @returns {TreeItem}
         * @memberof TreeItem
         */
        getChildItem(index: number): TreeItem;
        /**
         *親アイテムを取得
         *
         * @returns {TreeItem}
         * @memberof TreeItem
         */
        getParentItem(): TreeItem;
        /**
         *自分を含めた階層から値を参照してアイテムを探す
         *
         * @param {*} value
         * @returns {TreeItem}
         * @memberof TreeItem
         */
        findItemFromValue(value: any): TreeItem;
        /**
         *ツリーを展開する
         *
         * @param {boolean} opened
         * @param {boolean} [anime]
         * @memberof TreeItem
         */
        openItem(opened: boolean, anime?: boolean): void;
        /**
         *アイテムを選択する
         *
         * @memberof TreeItem
         */
        selectItem(scroll?: boolean): void;
        /**
         *所属先のTreeViewを返す
         *
         * @returns {TreeView}
         * @memberof TreeItem
         */
        getTreeView(): TreeView;
    }
    /**
     *TreeView用クラス
     *
     * @export
     * @class TreeView
     * @extends {Window}
     */
    class TreeView extends Window {
        private mRootItem;
        private mSelectItem;
        /**
         *Creates an instance of TreeView.
         * @memberof TreeView
         */
        constructor(params?: any);
        /**
         * 設定されている相対を条件にアイテムを検索
         *
         * @param {*} value
         * @returns {TreeItem}
         * @memberof TreeView
         */
        findItemFromValue(value: any): TreeItem;
        /**
         *最上位のアイテムを返す
         *
         * @returns {TreeItem}
         * @memberof TreeView
         */
        getRootItem(): TreeItem;
        /**
         *最上位の子としてアイテムを追加する
         *
         * @param {*} [label]
         * @param {boolean} [opened]
         * @returns {TreeItem}
         * @memberof TreeView
         */
        addItem(label?: any, opened?: boolean): TreeItem;
        /**
         *アイテムを全て削除する
         *
         * @memberof TreeView
         */
        clearItem(): void;
        /**
         *アイテムを選択する
         *子アイテムが使用するので基本的には直接呼び出さない
         * @param {TreeItem} item 選択するアイテム
         * @memberof TreeView
         */
        selectItem(item: TreeItem, scroll?: boolean): void;
        /**
         * 設定されている値を条件にアイテムを選択
         *
         * @param {*} value
         * @memberof TreeView
         */
        selectItemFromValue(value: any): void;
        /**
         *選択されているアイテムを返す
         *
         * @returns 選択されているアイテム
         * @memberof TreeView
         */
        getSelectItem(): TreeItem;
        /**
         *選択されているアイテムの値を返す
         *
         * @returns
         * @memberof TreeView
         */
        getSelectItemValue(): any;
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
        addEventListener(type: 'itemSelect', callback: (event: TREEVIEW_EVENT_SELECT) => void): void;
        /**
         *アイテムにドラッグドロップされたら発生
         *
         * @param {'itemDrop'} type
         * @param {(event: TREEVIEW_EVENT_DROP) => void} callback
         * @memberof TreeView
         */
        addEventListener(type: 'itemDrop', callback: (event: TREEVIEW_EVENT_DROP) => void): void;
        addEventListener(type: 'itemDragStart', callback: (event: TREEVIEW_EVENT_DRAG_START) => void): void;
    }
    interface LISTVIEW_EVENT_ITEM_CLICK extends Event {
        params: {
            itemIndex: number;
            subItemIndex: number;
            event: MouseEvent;
        };
    }
    interface LISTVIEW_EVENT_DRAG_START extends Event {
        params: {
            itemIndex: number;
            subItemIndex: number;
            event: DragEvent;
        };
    }
    /**
     *ListView用クラス
    *
    * @export
    * @class ListView
    * @extends {Window}
    */
    class ListView extends Window {
        headerArea: HTMLElement;
        headerBack: HTMLElement;
        headers: HTMLElement;
        resizers: HTMLElement;
        itemArea: HTMLElement;
        itemColumn: HTMLElement;
        overIndex: number;
        lastIndex: number;
        selectIndexes: number[];
        sortIndex: number;
        sortVector: boolean;
        columnWidth: number[];
        columnAutoIndex: number;
        areaWidth: number;
        /**
         *Creates an instance of ListView.
         * @param {*} [params] ウインドウ作成パラメータ
         * @memberof ListView
         */
        constructor(params?: any);
        /**
         *カラムのサイズを設定
         *
         * @param {number} index
         * @param {number} size
         * @memberof ListView
         */
        setColumnWidth(index: number, size: number): void;
        /**
         *カラムのスタイルを設定
         *
         * @param {number} col カラム番号
         * @param {('left'|'right'|'center')} style スタイル
         * @memberof ListView
         */
        setColumnStyle(col: number, style: 'left' | 'right' | 'center'): void;
        /**
         *カラムのスタイルを複数設定
         *
         * @param {(('left' | 'right' | 'center')[])} styles スタイル
         * @memberof ListView
         */
        setColumnStyles(styles: ('left' | 'right' | 'center')[]): void;
        /**
         *ヘッダを追加
         *配列にすると複数追加でき、さらに配列を含めるとサイズが指定できる
         * @param {(string|(string|[string,number])[])} labels ラベル | [ラベル,ラベル,・・・] | [[ラベル,幅],[ラベル,幅],・・・]
         * @param {number} [size] 幅
         * @memberof ListView
         */
        addHeader(label: string | (string | [string, number])[], size?: number): void;
        /**
         *アイテムのソートを行う
         *
         * @param {number} [index] カラム番号
         * @param {boolean} [order] 方向 true:昇順 false:降順
         * @memberof ListView
         */
        sortItem(index?: number, order?: boolean): void;
        /**
         *アイテムを選択する
         *すでにある選択は解除される
         * @param {(number | number[])} index レコード番号
         * @memberof ListView
         */
        selectItem(index: number | number[]): void;
        /**
         *アイテムの選択を全て解除する
         *
         * @memberof ListView
         */
        clearSelectItem(): void;
        /**
         *アイテムの選択を追加する
         *
         * @param {(number | number[])} index レコード番号
         * @memberof ListView
         */
        addSelectItem(index: number | number[]): void;
        /**
         *アイテムの選択を解除する
         *
         * @param {(number | number[])} index レコード番号
         * @memberof ListView
         */
        delSelectItem(index: number | number[]): void;
        /**
         *アイテムが選択されているか返す
         *
         * @param {number} index レコード番号
         * @returns {boolean}
         * @memberof ListView
         */
        isSelectItem(index: number): boolean;
        private static getIndexOfNode;
        /**
         *アイテムを全て削除する
         *
         * @memberof ListView
         */
        clearItem(): void;
        /**
         *対象セルのノードを取得
         *
         * @param {number} row
         * @param {number} col
         * @returns
         * @memberof ListView
         */
        getCell(row: number, col: number): any;
        /**
         *アイテムに値を設定する
         *
         * @param {number} index レコード番号
         * @param {*} value 値
         * @memberof ListView
         */
        setItemValue(index: number, value: any): void;
        /**
         *アイテムの値を取得する
         *
         * @param {number} index レコード番号
         * @returns 値
         * @memberof ListView
         */
        getItemValue(index: number): any;
        /**
         *最初に選択されているアイテムを返す
         *
         * @returns {number}
         * @memberof ListView
         */
        getSelectItem(): number;
        /**
         *選択されている値を全て取得する
         *
         * @returns {any[]}
         * @memberof ListView
         */
        getSelectValues(): any[];
        /**
         *指定行のセルノードを返す
         *
         * @param {number} row
         * @returns
         * @memberof ListView
         */
        getLineCells(row: number): any[];
        /**
         *アイテムを追加する
         *アイテムはテキストかノードが指定できる
         *配列を渡した場合は、複数追加となる
         * @param {(string|(string|HTMLElement)[])} value テキストもしくはノード
         * @returns
         * @memberof ListView
         */
        addItem(value: string | HTMLElement | (string | HTMLElement)[]): number;
        /**
         *ソート用のキーを設定する
         *
         * @param {number} row レコード番号
         * @param {number} column カラム番号
         * @param {*} value キー
         * @returns
         * @memberof ListView
         */
        setSortKey(row: number, column: number, value: any): boolean;
        /**
         *ソート用のキーをまとめて設定する
         *
         * @param {number} row レコード番号
         * @param {any[]} values キー配列
         * @memberof ListView
         */
        setSortKeys(row: number, values: any[]): void;
        /**
         *アイテムを書き換える
         *
         * @param {number} row レコード番号
         * @param {number} column カラム番号
         * @param {(string|HTMLElement)} value テキストもしくはノード
         * @returns
         * @memberof ListView
         */
        setItem(row: number, column: number, value: string | HTMLElement): boolean;
        /**
         *ヘッダに合わせてカラムサイズを調整する
         *基本的には直接呼び出さない
         * @memberof ListView
         */
        resize(): void;
        onLayout(flag: boolean): void;
        addEventListener(type: 'itemClick', callback: (event: LISTVIEW_EVENT_ITEM_CLICK) => void): void;
        addEventListener(type: 'itemDblClick', callback: (event: LISTVIEW_EVENT_ITEM_CLICK) => void): void;
        addEventListener(type: 'itemDragStart', callback: (event: LISTVIEW_EVENT_DRAG_START) => void): void;
    }
}
