const isObject = target => target !== null && typeof target === 'object';
const convert = target => isObject(target) ? reactive(target) : target;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (target, key) => hasOwnProperty.call(target, key);



export function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      // 收集依赖
      console.log('get==', key);
      const result = Reflect.get(target, key, receiver);
      return convert(result);
    },
    set(target, key, value, receiver) {
      let result = true;
      const oldValue = Reflect.get(target, key, receiver);
      if (oldValue !== value) {
        Reflect.set(target, key, value, receiver);
        // 触发更新
        console.log('set==', key, value);
      }
      return result;
    },
    deletePropery(target, key) {
      const hadKey = hasOwn(target, key);
      const result = Reflect.deletePropery(target, key);
      if (hadKey && result) {
        // 触发更新
        console.log('delete', key);
      }
      return result;
    }
  };
  return new Proxy(target, handler);
}