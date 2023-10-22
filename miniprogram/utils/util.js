const factoryID = () => {
	let preId = '';
	let diff = 0;
	return () => {
			const date = new Date();
			let id = `${date.getTime()}${date.getMilliseconds()}`;
			if (id === preId) {
					diff += 1;
			} else {
					diff = 0;
			}
			preId = id;
			return `${id}_${diff}`;
	};
};

const generate = factoryID();

export const getID = () => {
	return generate();
};

// base64 缓存
export class Cache {
	constructor() {
			this.db = {};
	}

	get(id) {
			const i = this.db[id];
			if (i === undefined) {
					return undefined;
			}
			if (i.type === 'once') {
					delete this.db[id];
			}
			return i.data;
	}

	add(data) {
			const id = getID();
			// 缓存四种滤镜数据
			this.set(id, data);
			return id;
	}

	set(key, data) {
			this.db[key] = {
					type: 'always',
					data
			};
	}

	setOnce(key, data) {
			this.db[key] = {
					type: 'once',
					data
			};
	}
}

export const globalCache = new Cache();