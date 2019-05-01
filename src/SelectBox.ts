
namespace JSW {
export class SelectBox extends JSW.Window{
	select : HTMLSelectElement
	constructor(option: { label?:string,options: { name: string, value: string | number }[] }) {
		super()

		this.setJswStyle('SelectBox')
		this.setAutoSize(true)

		let node = this.getClient()
		let select = document.createElement('select')
		this.select = select

		const options = option.options
		for(const o of options){
			const opNode = document.createElement('option')
			opNode.textContent = o.name
			opNode.value = o.value as string
			select.appendChild(opNode)
		}
		node.appendChild(select)
	}
}
}