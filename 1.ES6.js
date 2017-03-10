//ES6共有6种声明变量的方法
// 全局变量（顶层对象的属性）var function
// 全局变量 let const import class
// 从ES6开始，全局变量将逐步与顶层对象的属性脱钩

/*
浏览器里面，顶层对象是window，但 Node 和 Web Worker 没有window。
浏览器和 Web Worker 里面，self也指向顶层对象，但是Node没有self。
Node 里面，顶层对象是global，但其他环境都不支持

全局环境中，this会返回顶层对象。但是，Node模块和ES6模块中，this返回的是当前模块。
函数里面的this，如果函数不是作为对象的方法运行，而是单纯作为函数运行，this会指向顶层对象。
但是，严格模式下，这时this会返回undefined。
不管是严格模式，还是普通模式，new Function('return this')()，
总是会返回全局对象。但是，如果浏览器用了CSP（Content Security Policy，内容安全政策），
那么eval、new Function这些方法都可能无法使用。
 */

//基本规则
/*
不要使用new Number()、new Boolean()、new String()创建包装对象；

用parseInt()或parseFloat()来转换任意类型到number；

用String()来转换任意类型到string，或者直接调用某个对象的toString()方法；

通常不必把任意类型转换为boolean再判断，因为可以直接写if (myVar) {...}；

typeof操作符可以判断出number、boolean、string、function和undefined；

判断Array要使用Array.isArray(arr)；

判断null请使用myVar === null；

判断某个全局变量是否存在用typeof window.myVar === 'undefined'；

函数内部判断某个变量是否存在用typeof myVar === 'undefined'。
 */



//获取顶层对象（勉强的方法）
// 方法一
(typeof window !== 'undefined'
   ? window
   : (typeof process === 'object' &&
      typeof require === 'function' &&
      typeof global === 'object')
     ? global
     : this);

// 方法二
var getGlobal = function () {
  if (typeof self !== 'undefined') { return self; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  throw new Error('unable to locate global object');
};

// CommonJS的写法
var global = require('system.global')();

// ES6模块的写法
import getGlobal from 'system.global';
const global = getGlobal();

//顶层对象 浏览器环境：windows  Node.js环境：global

//全局作用域 函数作用域 块级作用域

let a=1;
const b=0;
typeof a;

const a = [];
a.push('Hello'); // 可执行
a.length = 0;    // 可执行
a = ['Dave'];    // 报错


const foo = Object.freeze({});//冻结对象

// 常规模式时，下面一行不起作用；
// 严格模式时，该行会报错
foo.prop = 123;

//彻底冻结
var constantize = (obj) => {
  Object.freeze(obj);
  Object.keys(obj).forEach( (key, value) => {
    if ( typeof obj[key] === 'object' ) {
      constantize( obj[key] );
    }
  });
};


let x = do {
  let t = f();
  t * t + 1;
}

//ES6 解构赋值
//模式匹配
{

var [a, b, c] = [1, 2, 3];

let [a, [b], d] = [1, [2, 3], 4];

let [foo, [[bar], baz]] = [1, [[2], 3]];

var [v1, v2, ..., vN ] = array;
let [v1, v2, ..., vN ] = array;
const [v1, v2, ..., vN ] = array;

let [x, y, z] = new Set(["a", "b", "c"]);


function* fibs() {
  var a = 0;
  var b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

var [first, second, third, fourth, fifth, sixth] = fibs();

var { bar, foo } = { foo: "aaa", bar: "bbb" };

let obj = { first: 'hello', last: 'world' };

let { first: f, last: l } = obj;

[[1, 2], [3, 4]].map(([a, b]) => a + b);

function move({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}


var map = new Map();
map.set('first', 'hello');
map.set('second', 'world');

for (let [key, value] of map) {
  console.log(key + " is " + value);
}


var s = '𠮷a';
for (let ch of s) {
  console.log(ch.codePointAt(0).toString(16));
}

//apply() call() bind()
//相同：
//1、都是用来改变函数的this对象的指向的。
//2、第一个参数都是this要指向的对象。
//3、都可以利用后续参数传参。
//
//区别：当你希望改变上下文环境之后并非立即执行，
//而是回调执行的时候，使用 bind() 方法。
//而 apply/call 则会立即执行函数。
//
//再总结一下：
//apply 、 call 、bind 三者都是用来改变函数的this对象的指向的；
//apply 、 call 、bind 三者第一个参数都是this要指向的对象，也就是想指定的上下文；
//apply 、 call 、bind 三者都可以利用后续参数传参；
//bind 是返回对应函数，便于稍后调用；apply 、call 则是立即调用 。

function functionisArray(obj){
    return Object.prototype.toString.call(obj) === '[object Array]' ;
}


function log(){
  var args = Array.prototype.slice.call(arguments);
  args.unshift('(app)');

  console.log.apply(console, args);
};


let foo = (x) => x + 1;

//扩展运算符（ spread ）是三个点（...）
var parts = ['shoulder', 'knees'];
var lyrics = ['head', ...parts, 'and', 'toes'];
// ["head", "shoulders", "knees", "and", "toes"]



//Proxy Reflect 观察者模式
const queuedObservers = new Set();

const observe = fn => queuedObservers.add(fn);
const observable = obj => new Proxy(obj, {set});

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queuedObservers.forEach(observer => observer());
  return result;
}


//遍历器
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
    } else {
      return {done: true, value: undefined};
    }
  }
}

function range(start, stop) {
  return new RangeIterator(start, stop);
}

for (var value of range(0, 3)) {
  console.log(value);
}

//遍历器指针
function Obj(value) {
  this.value = value;
  this.next = null;
}

Obj.prototype[Symbol.iterator] = function() {
  var iterator = {
    next: next
  };

  var current = this;

  function next() {
    if (current) {
      var value = current.value;
      current = current.next;
      return {
        done: false,
        value: value
      };
    } else {
      return {
        done: true
      };
    }
  }
  return iterator;
}

var one = new Obj(1);
var two = new Obj(2);
var three = new Obj(3);

one.next = two;
two.next = three;

for (var i of one){
  console.log(i);
}


let iterable = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
  [Symbol.iterator]: Array.prototype[Symbol.iterator]
};
for (let item of iterable) {
  console.log(item); // 'a', 'b', 'c'
}

//异步遍历器
const asyncIterable = createAsyncIterable(['a', 'b']);
const asyncIterator = asyncIterable[Symbol.asyncIterator]();

asyncIterator
.next()
.then(iterResult1 => {
  console.log(iterResult1); // { value: 'a', done: false }
  return asyncIterator.next();
})
.then(iterResult2 => {
  console.log(iterResult2); // { value: 'b', done: false }
  return asyncIterator.next();
})
.then(iterResult3 => {
  console.log(iterResult3); // { value: undefined, done: true }
});

//混入模式
let Mixin1 = (superclass) => class extends superclass {
  foo() {
    console.log('foo from Mixin1');
    if (super.foo) super.foo();
  }
};

let Mixin2 = (superclass) => class extends superclass {
  foo() {
    console.log('foo from Mixin2');
    if (super.foo) super.foo();
  }
};

class S {
  foo() {
    console.log('foo from S');
  }
}

class C extends Mixin1(Mixin2(S)) {
  foo() {
    console.log('foo from C');
    super.foo();
  }
}

//js基础 变量 运算符 流程语句 字符串 数组 函数(arguments) DOM作对象  BOM对象 正则


//四种表示集合的数据类型 Array Object Map Set
