namespace JSW {
	export function Sleep(timeout: number): Promise<void> {
		return new Promise((resolv) => {
			setTimeout(() => {
				resolv()
			}, timeout)
		})
	}
}