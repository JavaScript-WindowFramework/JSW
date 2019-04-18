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
			this.setJswStyle('Panel')
			this.setHeight(32)
		}
	}
}