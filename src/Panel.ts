/// <reference path="./Window.ts" />

namespace JSW{
	export class Panel extends Window {
		constructor() {
			super()
			this.setHeight(32)
			let node = this.getClient()
			node.dataset.kind = 'Panel'
		}
	}
}