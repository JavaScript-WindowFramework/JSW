namespace JSW {
	interface FunctionData {
		name: string
		params: any[]
	}
	interface FunctionSet {
		functions: FunctionData[]
		promise: { [key: string]: Function }
		array: boolean
	}

	interface AdapterFormat {
		globalHash: string		//ブラウザ共通セッションキー
		sessionHash: string		//タブ用セッションキー
		functions: 				//命令格納用
		{
			function: string	//命令
			params: any[]		//パラメータ
		}[]
	}

	export class Adapter {
		handle: number
		scriptUrl: string
		globalHash: string
		keyName: string
		functionSet: FunctionSet[] = []



		constructor(scriptUrl: string, keyName?: string) {
			this.scriptUrl = scriptUrl
			this.keyName = keyName || 'Session'
		}

		exec(functions: any[][]): Promise<any>
		exec(funcName: string, ...params): Promise<any>
		exec(v1, ...v2): Promise<any> {
			let functionSet: FunctionSet
			if (Array.isArray(v1)) {
				const functions: FunctionData[] = []
				for (let func of v1 as any[][]) {
					functions.push({ name: func[0], params: func.slice(1) })
				}
				functionSet = { functions: functions, promise: {}, array: true }
			} else {
				functionSet = { functions: [{ name: v1, params: v2 }], promise: {}, array: false }
			}

			const promise = new Promise((resolve, reject) => {
				functionSet.promise.resolve = resolve
				functionSet.promise.reject = reject
			})
			this.functionSet.push(functionSet)
			this.callSend()
			return promise
		}
		callSend() {
			if (!this.handle) {
				this.handle = window.setTimeout(() => { this.send() }, 0)
			}
		}
		send() {
			this.handle = null
			const globalHash = localStorage.getItem(this.keyName)
			const sessionHash = sessionStorage.getItem(this.keyName)
			const functionSet = this.functionSet
			this.functionSet = []
			const params: AdapterFormat = {
				globalHash: globalHash,
				sessionHash: sessionHash,
				functions: []
			}
			for (let funcs of functionSet) {
				for (let func of funcs.functions)
					params.functions.push({ function: func.name, params: func.params })
			}
			Adapter.sendJson(this.scriptUrl + '?cmd=exec', params, (res) => {
				if (res == null) {
					for (let funcs of functionSet) {
						console.error('通信エラー')
						funcs.promise.reject('通信エラー')
					}
				} else {
					if (res.globalHash)
						localStorage.setItem(this.keyName, res.globalHash)
					if (res.sessionHash)
						sessionStorage.setItem(this.keyName, res.sessionHash)
					const results = res.results
					let index = 0
					for (let funcs of functionSet) {
						const length = funcs.functions.length;
						if (funcs.array) {
							const values = []
							for (let i = index; i < length; i++) {
								if (results[i].error) {
									console.error(results[i].error)
									funcs.promise.reject(results[i].error)
									break
								}
								values.push(results[i].value)
							}
							funcs.promise.resolve(values)
						} else{
							const result = results[index]
							if (result.error)
								console.error(result.error)
							else
								funcs.promise.resolve(result.value)
						}
						index += length
					}
				}
			})
		}
		static sendJsonAsync(url: string, data?: any, headers?: { [key: string]: string }){
			return new Promise((resolve)=>{
				Adapter.sendJson(url,data,(value)=>{
					resolve(value)
				}, headers)
			})
		}
		static sendJson(url: string, data: any, proc: Function, headers?: { [key: string]: string }) : Promise<any>{
			const req = new XMLHttpRequest()

			//ネイティブでJSON変換が可能かチェック
			var jsonFlag = false
			try {
				req.responseType = 'json'
			} catch (e) { jsonFlag = true }
			if (proc == null) {
				req.open('POST', url, false)
				return JSON.parse(req.responseText)
			}
			else {
				req.onreadystatechange = function () {
					if (req.readyState == 4) {
						var obj = null
						try {
							if (jsonFlag) //JSON変換の仕分け
								obj = JSON.parse(req.response)
							else
								obj = req.response

						} catch (e) {
							proc(null)
							return
						}
						proc(obj)
					}
				}
			}
			req.open('POST', url, true);
			req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
			if (headers) {
				for (let index in headers) {
					req.setRequestHeader(index, sessionStorage.getItem(headers[index]));
				}
			}
			req.send(data==null?null:JSON.stringify(data));
		}
	}

}