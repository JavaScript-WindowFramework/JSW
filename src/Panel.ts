/// <reference path="./Window.ts" />

namespace JSW{
	/**
	 *パネル用クラス
	 *
	 * @export
	 * @class Panel
	 * @extends {Window}
	 */
	export class Panel extends Window {
		constructor() {
			super()
			this.setHeight(32)
			let node = this.getNode()
			node.dataset.jswStyle = 'Panel'
		}
	}
}