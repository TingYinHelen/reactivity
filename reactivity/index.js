const isObject = target => target !== null && typeof target === 'object';
const convert = target => isObject(target) ? reactive(target) : target;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (target, key) => hasOwnProperty.call(target, key);



export function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      // 收集依赖
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      return convert(result);
    },
    set(target, key, value, receiver) {
      let result = true;
      const oldValue = Reflect.get(target, key, receiver);
      if (oldValue !== value) {
        Reflect.set(target, key, value, receiver);
        // 触发更新
        trigger(target, key);
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
let activeEffect = null;
export function effect(callback) {
  activeEffect = callback;
  callback(); // 访问响应式对象的属性，去手机依赖
  activeEffect = null;
}

const targetMap = new WeakMap();
export function track(target, key) {
  if (!activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => {
      effect();
    });
  }
}

export function ref(row) {
  if (isObject(row) && row.__isRef_) return;
  let value = convert(row);
  const r = {
    __isRef_: true,
    get value() {
      track(r, 'value');
      return value;
    },
    set value(newVal) {
      if (newVal !== value) {
        row = newVal;
        value = convert(newVal);
        trigger(r, 'value');
      }
    }
  };
  return r;
}

