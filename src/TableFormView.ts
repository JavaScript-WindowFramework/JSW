namespace JSW {
export interface ITEM_OPTION{
	label?: string,
	type?: string,
	name?: string,
	value?: string | number | boolean
	link?:string
	image?:string
	image_width?:string
	events?:  {[key:string]:object}
	options?:{
		name: string;
		value: string;
	}[]
}
export class TableFormView extends Window{
	table:HTMLDivElement
	items:HTMLDivElement
	footer: HTMLDivElement
	constructor(params?: WINDOW_PARAMS){
		super(params)
		this.setJswStyle('TableFormView')
		const table = document.createElement('div')
		this.table = table
		this.getClient().appendChild(table)

		const items = document.createElement('div')
		this.items = items
		table.appendChild(items)

		const footer = document.createElement('div')
		this.footer = footer
		this.getClient().appendChild(footer)
	}
	addItem(params:ITEM_OPTION){
		if(params.type === 'submit'){
			const button = document.createElement('button')
			button.textContent = params.label
			this.footer.appendChild(button)
			if(params.events){
				const events = params.events
				for(const key in events){
					button.addEventListener(key, events[key] as any)
				}
			}
			return button
		}else{
			const row = document.createElement(params.type === 'checkbox' ? 'label' : 'div')

			const label = document.createElement('div')
			row.appendChild(label)
			label.innerText = params.label
			const data = document.createElement('div')
			row.appendChild(data)

			switch (params.type) {
				case 'checkbox':
					const checkbox = document.createElement('input')
					checkbox.type = 'checkbox'
					checkbox.name = params.name || ''
					checkbox.checked = params.value == true
					data.appendChild(checkbox)
					break
				case 'select':
					const select = document.createElement('select')
					select.name = params.name || ''

					for (const o of params.options) {
						const option = document.createElement('option')
						option.textContent = o.name
						option.value = o.value
						select.appendChild(option)
					}
					data.appendChild(select)
					break
				default:
					let tag;
					if(params.link){
						tag = document.createElement('a')
						tag.target = '_blank'
						tag.href = params.link
					}else{
						tag = document.createElement('div')
					}
					if(params.image){
						const image = document.createElement('img')
						image.src = params.image
						if (params.image_width)
							image.style.width = params.image_width
						tag.appendChild(image)
					}else{
						tag.innerText = params.value.toString()
					}
					data.appendChild(tag)
					break
			}

			this.items.appendChild(row)
			return row
		}
	}
	getParams(){
		const values : {[key:string]:string|number|boolean} = {}
		const nodes = this.items.querySelectorAll('select,input')
		for(let length=nodes.length,i=0;i<length;++i){
			const v = nodes[i]
			if (v instanceof HTMLSelectElement){
				const name = v.name
				const value = v.value
				values[name] = value
			}else if(v instanceof HTMLInputElement) {
				const name = v.name
				const value = v.type=='checkbox'?v.checked:v.value
				values[name] = value
			}
		}
		return values
	}
	setParams(params:{[key:string]:string|number|boolean}){
		const nodes = this.items.querySelectorAll('select,input')
		for (let length = nodes.length, i = 0; i < length; ++i) {
			const v = nodes[i]
			if (v instanceof HTMLSelectElement) {
				const value = params[v.name]
				if(value != null)
					v.value = value.toString()

			} else if (v instanceof HTMLInputElement) {
				const value = params[v.name]
				if (value != null)
					if (v.type === 'checkbox')
						v.checked = value as boolean
					else
						v.value = value.toString()
			}
		}
	}
}
}