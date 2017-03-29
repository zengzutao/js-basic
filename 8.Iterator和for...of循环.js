1.Iterator（遍历器）: 是一种接口，为各种不同的数据结构提供统一的访问机制
作用：
(1).为各种数据结构，提供一个统一的、简便的访问接口
(2).使得数据结构的成员能够按某种次序排列
(3).ES6 创造了一种新的遍历命令for...of循环，Iterator接口主要供for...of消费

2.数据结构的默认Iterator接口 [Symbol.iterator]:function () {}
//部署iterator
class RangeIterator {
  constructor(start, stop) {
    this.value = start;
    this.stop = stop;
  }

  [Symbol.iterator]() { return this; }

  next() {
    var value = this.value;
    if (value < this.stop) {
      this.value++;
      return {done: false, value: value};
    }
    return {done: true, value: undefined};
  }
}

function range(start, stop) {
  return new RangeIterator(start, stop);
}

for (var value of range(0, 3)) {
  console.log(value);
}

3.调用Iterator接口的场合
(1).解构赋值 对数组和Set结构进行解构赋值时，会默认调用Symbol.iterator
let set = new Set().add('a').add('b').add('c');

let [x,y] = set;
// x='a'; y='b'

let [first, ...rest] = set;
// first='a'; rest=['b','c'];

（2）扩展运算符 扩展运算符（...）也会调用默认的iterator接口
// 例一
var str = 'hello';
[...str] //  ['h','e','l','l','o']

// 例二
let arr = ['b', 'c'];
['a', ...arr, 'd']
// ['a', 'b', 'c', 'd']

(3).yield*
let generator = function* () {
  yield 1;
  yield* [2,3,4];
  yield 5;
};

var iterator = generator();

(4).其他场合  由于数组的遍历会调用遍历器接口，所以任何接受数组作为参数的场合，其实都调用了遍历器接口

4.字符串的Iterator接口 字符串原生具有Iterator接口
var someString = "hi";
typeof someString[Symbol.iterator]
// "function"

var iterator = someString[Symbol.iterator]();

iterator.next()  // { value: "h", done: false }
iterator.next()  // { value: "i", done: false }
iterator.next()  // { value: undefined, done: true }

5.Iterator接口与Generator函数
let obj = {
  * [Symbol.iterator]() {
    yield 'hello';
    yield 'world';
  }
};

for (let x of obj) {
  console.log(x);
}
// hello
// world

6.遍历器对象的return()，throw()
(1).return方法
使用场合是:
1).如果for...of循环提前退出（通常是因为出错，或者有break语句或continue语句），就会调用return方法
2).return方法必须返回一个对象
3).清理或释放资源
function readLinesSync(file) {
  return {
    next() {
      if (file.isAtEndOfFile()) {
        file.close();
        return { done: true };
      }
    },
    return() {
      file.close();
      return { done: true };
    },
  };
}

(2).throw方法主要是配合Generator函数使用，一般的遍历器对象用不到这个方法

7.for...of循环 for...of循环内部调用的是数据结构的Symbol.iterator方法
1).for: 原始方法，遍历数组
2).for...in: 遍历对象，循环不仅遍历数字键名，还会遍历手动添加的其他键，甚至包括原型链上的键
3).for...of: 遍历数组
4).forEach: 数组的内置方法，但break命令或return命令都不能该循环
