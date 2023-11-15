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

export const verifyPhoneNum = (mobile) => {
  var re = /^1[3,4,5,6,7,8,9][0-9]{9}$/;
  var result = re.test(mobile); 
  if(!result) {
    // alert("手机号码格式不正确！");
    return false;//若手机号码格式不正确则返回false
    }
  return true;
}