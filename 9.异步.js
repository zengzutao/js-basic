js异步实现方式：1).回调函数 2).事件监听 3).发布/订阅 4).Promise 对象 5).Generator 对象

1.回调函数 缺点：函数嵌套 回调地域
//就是把任务的第二段单独写在一个函数里面，等到重新执行这个任务的时候，就直接调用这个函数
fs.readFile('/etc/passwd', 'utf-8', function (err, data) {
  if (err) throw err;
  console.log(data);
});

2.事件监听

3.Promise 最大问题是代码冗余，语义变得不清楚
var readFile = require('fs-readfile-promise');

readFile(fileA)
.then(function (data) {
  console.log(data.toString());
})
.then(function () {
  return readFile(fileB);
})
.then(function (data) {
  console.log(data.toString());
})
.catch(function (err) {
  console.log(err);
});

4.Generator函数 代码的写法非常像同步操作
1).协程 执行流程如下：
第一步，协程A开始执行
第二步，协程A执行到一半，进入暂停，执行权转移到协程B
第三步，（一段时间后）协程B交还执行权
第四步，协程A恢复执

2).协程的 Generator 函数实现 调用 Generator 函数，会返回一个内部指针（即遍历器）g，而不是结果

3).Generator 函数体内外的数据交换和错误处理机制  Generator 函数可以暂停执行和恢复执行，这是它能封装异步任务的根本原因

//Generator 函数体外，使用指针对象的throw方法抛出的错误，可以被函数体内的try...catch代码块捕获
function* gen(x){
  try {
    var y = yield x + 2;
  } catch (e){
    console.log(e);//打印错误信息
  }
  return y;
}

var g = gen(1);
g.next();
g.throw('出错了');//抛出错误 gen函数会捕获此错误

4).异步任务的封装
var fetch = require('node-fetch');

function* gen(){
  var url = 'https://api.github.com/users/github';
  var result = yield fetch(url);
  console.log(result.bio);
}

var g = gen();
var result = g.next();

result.value.then(function(data){
  return data.json();
}).then(function(data){
  g.next(data);
});

5).Thunk 编译器的“传名调用”实现，往往是将参数放到一个临时函数之中，再将这个临时函数传入函数体。这个临时函数就叫做 Thunk 函数
//函数 Thunk 函数是自动执行 Generator 函数的一种方法
// ES5版本
var Thunk = function(fn){
  return function (){
    var args = Array.prototype.slice.call(arguments);
    return function (callback){
      args.push(callback);
      return fn.apply(this, args);
    }
  };
};

// ES6版本
var Thunk = function(fn) {
  return function (...args) {
    return function (callback) {
      return fn.call(this, ...args, callback);
    }
  };
};

6).Thunkify 模块  安装：$ npm install thunkify
var thunkify = require('thunkify');
var fs = require('fs');

var read = thunkify(fs.readFile);
read('package.json')(function(err, str){
  // ...
});

7).Generator 函数的流程管理 Thunk 函数现在可以用于 Generator 函数的自动流程管理
// yield命令用于将程序的执行权移出 Generator 函数
// Thunk函数再将 执行权再交还给 Generator 函数
var g = gen();

var r1 = g.next();
r1.value(function (err, data) {
  if (err) throw err;
  var r2 = g.next(data);
  r2.value(function (err, data) {
    if (err) throw err;
    g.next(data);
  });
});

8).Thunk 函数的自动流程管理 Thunk 函数真正的威力，在于可以自动执行 Generator 函数
条件：前提是每一个异步操作，都要是 Thunk 函数，也就是说yield命令后面的必须是 Thunk 函数

function run(fn) {
  var gen = fn();

  function next(err, data) {
    var result = gen.next(data);
    if (result.done) return;
    result.value(next);
  }

  next();
}

function* g() {
  // ...
}

run(g);

//使用部分
var g = function* (){
  var f1 = yield readFile('fileA');
  var f2 = yield readFile('fileB');
  // ...
  var fn = yield readFile('fileN');
};

run(g);

9).co 模块  原理：co 模块其实就是将两种自动执行器（Thunk 函数和 Promise 对象），包装成一个模块
var gen = function* () {
  var f1 = yield readFile('/etc/fstab');
  var f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};

var co = require('co');
co(gen);

// co函数返回一个Promise对象，因此可以用then方法添加回调函数
co(gen).then(function (){
  console.log('Generator 函数执行完成');
});

自动交回执行权的两种方法：
(1).回调函数:将异步操作包装成 Thunk 函数，在回调函数里面交回执行权

(2).Promise 对象:将异步操作包装成 Promise 对象，用then方法交回执行权

10).基于 Promise 对象的自动执行 co 函数接受 Generator 函数作为参数，返回一个 Promise 对象

var fs = require('fs');

var readFile = function (fileName){
  return new Promise(function (resolve, reject){
    fs.readFile(fileName, function(error, data){
      if (error) return reject(error);
      resolve(data);
    });
  });
};

var gen = function* (){
  var f1 = yield readFile('/etc/fstab');
  var f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};

//普通实现：
function run(gen){
  var g = gen();

  function next(data){
    var result = g.next(data);
    if (result.done) return result.value;
    result.value.then(function(data){
      next(data);
    });
  }

  next();
}

run(gen);

//co实现
function co(gen) {
  var ctx = this;

  return new Promise(function(resolve, reject) {
    if (typeof gen === 'function') gen = gen.call(ctx);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    onFulfilled();
    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }
  });
}

function next(ret) {
  if (ret.done) return resolve(ret.value);
  var value = toPromise.call(ctx, ret.value);
  if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
  return onRejected(
    new TypeError(
      'You may only yield a function, promise, generator, array, or object, '
      + 'but the following object was passed: "'
      + String(ret.value)
      + '"'
    )
  );
}

11).处理并发的异步操作
// 数组的写法
co(function* () {
  var res = yield [
    Promise.resolve(1),
    Promise.resolve(2)
  ];
  console.log(res);
}).catch(onerror);

// 对象的写法
co(function* () {
  var res = yield {
    1: Promise.resolve(1),
    2: Promise.resolve(2),
  };
  console.log(res);
}).catch(onerror);

//允许并发三个somethingAsync异步操作
co(function* () {
  var values = [n1, n2, n3];
  yield values.map(somethingAsync);
});

function* somethingAsync(x) {
  // do something async
  return y
}

12).综合示例：
const co = require('co');
const fs = require('fs');

const stream = fs.createReadStream('./les_miserables.txt');
let valjeanCount = 0;

co(function*() {
  while(true) {
    const res = yield Promise.race([
      new Promise(resolve => stream.once('data', resolve)),
      new Promise(resolve => stream.once('end', resolve)),
      new Promise((resolve, reject) => stream.once('error', reject))
    ]);
    if (!res) {
      break;
    }
    stream.removeAllListeners('data');
    stream.removeAllListeners('end');
    stream.removeAllListeners('error');
    valjeanCount += (res.toString().match(/valjean/ig) || []).length;
  }
  console.log('count:', valjeanCount); // count: 1120
});

5.async和await async函数自带执行器 async函数的返回值是 Promise 对象
//指定多少毫秒后输出一个值
async function timeout(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}

asyncPrint('hello world', 50);

1).async 函数有多种使用形式
// 函数声明
async function foo() {}

// 函数表达式
const foo = async function () {};

// 对象的方法
let obj = { async foo() {} };
obj.foo().then(...)

// Class 的方法
class Storage {
  constructor() {
    this.cachePromise = caches.open('avatars');
  }

  async getAvatar(name) {
    const cache = await this.cachePromise;
    return cache.match(`/avatars/${name}.jpg`);
  }
}

const storage = new Storage();
storage.getAvatar('jake').then(…);

// 箭头函数
const foo = async () => {};

2).语法 async函数返回一个 Promise 对象  难点是错误处理机制
(1). async 函数内部抛出错误，会导致返回的 Promise 对象变为reject状态
async function f() {
  throw new Error('出错了');
}

f().then(
  v => console.log(v),
  e => console.log(e)
)
// Error: 出错了

(2).Promise 对象的状态变化 只有async函数内部的异步操作执行完，才会执行then方法指定的回调函数

async function getTitle(url) {
  let response = await fetch(url);
  let html = await response.text();
  return html.match(/<title>([\s\S]+)<\/title>/i)[1];
}
getTitle('https://tc39.github.io/ecma262/').then(console.log)
// "ECMAScript 2017 Language Specification"

(3).await 命令
//示例一：
async function f() {
  await Promise.reject('出错了');
}

f()
.then(v => console.log(v))
.catch(e => console.log(e))
// 出错了

//实例二：
async function f() {
  await Promise.reject('出错了')
    .catch(e => console.log(e));
  return await Promise.resolve('hello world');
}

f()
.then(v => console.log(v))
// 出错了
// hello world

(4).使用await需要注意的地方
<1<2>try...catch 处理
//示例一：
async function main() {
  try {
    var val1 = await firstStep();
    var val2 = await secondStep(val1);
    var val3 = await thirdStep(val1, val2);

    console.log('Final: ', val3);
  }
  catch (err) {
    console.error(err);
  }
}

//示例二；
const superagent = require('superagent');
const NUM_RETRIES = 3;

async function test() {
  let i;
  for (i = 0; i < NUM_RETRIES; ++i) {
    try {
      await superagent.get('http://google.com/this-throws-an-error');
      break;
    } catch(err) {}
  }
  console.log(i); // 3
}

test();

<2>.多个await命令后面的异步操作，如果不存在继发关系，最好让它们同时触发
let foo = await getFoo();
let bar = await getBar();

// 写法一
let [foo, bar] = await Promise.all([getFoo(), getBar()]);

// 写法二
let fooPromise = getFoo();
let barPromise = getBar();
let foo = await fooPromise;
let bar = await barPromise;

<3>.await命令只能用在async函数之中
//错误写法
function dbFuc(db) { //这里不需要 async
  let docs = [{}, {}, {}];

  // 可能得到错误结果
  docs.forEach(async function (doc) {
    await db.post(doc);
  });
}

//正确写法
async function dbFuc(db) {
  let docs = [{}, {}, {}];

  for (let doc of docs) {
    await db.post(doc);
  }
}

//处理多个请求
async function dbFuc(db) {
  let docs = [{}, {}, {}];
  let promises = docs.map((doc) => db.post(doc));

  let results = await Promise.all(promises);
  console.log(results);
}

// 或者使用下面的写法

async function dbFuc(db) {
  let docs = [{}, {}, {}];
  let promises = docs.map((doc) => db.post(doc));

  let results = [];
  for (let promise of promises) {
    results.push(await promise);
  }
  console.log(results);
}

3).async 函数的实现原理
function spawn(genF) {
  return new Promise(function(resolve, reject) {
    var gen = genF();
    function step(nextF) {
      try {
        var next = nextF();
      } catch(e) {
        return reject(e);
      }
      if(next.done) {
        return resolve(next.value);
      }
      Promise.resolve(next.value).then(function(v) {
        step(function() { return gen.next(v); });
      }, function(e) {
        step(function() { return gen.throw(e); });
      });
    }
    step(function() { return gen.next(undefined); });
  });
}

//优秀示例
async function chainAnimationsAsync(elem, animations) {
  var ret = null;
  try {
    for(var anim of animations) {
      ret = await anim(elem);
    }
  } catch(e) {
    /* 忽略错误，继续执行 */
  }
  return ret;
}

4).实例：按顺序完成异步操作
async function logInOrder(urls) {
  // 并发读取远程URL
  const textPromises = urls.map(async url => {
    const response = await fetch(url);
    return response.text();
  });

  // 按次序输出
  for (const textPromise of textPromises) {
    console.log(await textPromise);
  }
}

5).异步遍历器
(1).异步遍历的接口 异步遍历器的最大的语法特点，就是调用遍历器的next方法，返回的是一个 Promise 对象
async function f() {
  const asyncIterable = createAsyncIterable(['a', 'b']);
  const asyncIterator = asyncIterable[Symbol.asyncIterator]();
  console.log(await asyncIterator.next());
  // { value: 'a', done: false }
  console.log(await asyncIterator.next());
  // { value: 'b', done: false }
  console.log(await asyncIterator.next());
  // { value: undefined, done: true }
}


(2).for await...of 也可以用于同步操作
async function () {
  try {
    for await (const x of createRejectingIterable()) {
      console.log(x);
    }
  } catch (e) {
    console.error(e);
  }
}

(3).异步Generator函数 异步 Generator 函数就是async函数与 Generator 函数的结合 异步 Generator 函数返回的是一个异步Iterator对象
async function takeAsync(asyncIterable, count=Infinity) {
  const result = [];
  const iterator = asyncIterable[Symbol.asyncIterator]();
  while (result.length < count) {
    const {value,done} = await iterator.next();
    if (done) break;
    result.push(value);
  }
  return result;
}

(4).yield* 语句  yield*语句也可以跟一个异步遍历器
async function* gen1() {
  yield 'a';
  yield 'b';
  return 2;
}

async function* gen2() {
  const result = yield* gen1();
}

//同步Generator函数一样，for await...of循环会展开yield*
(async function () {
  for await (const x of gen2()) {
    console.log(x);
  }
})();
// a
// b


JavaScript就有了四种函数形式：普通函数、async 函数、Generator 函数和异步 Generator 函数
