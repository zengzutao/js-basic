1.Promise
Promise对象有以下两个特点:
(1).对象的状态不受外界影响 三种状态：Pending（进行中）、Resolved（已完成，又称 Fulfilled）和Rejected（已失败）
(2).一旦状态改变，就不会再变，任何时候都可以得到这个结果
缺点：
(1).无法取消Promise，一旦新建它就会立即执行，无法中途取消
(2).如果不设置回调函数，Promise内部抛出的错误，不会反应到外部
(3).当处于Pending状态时，无法得知目前进展到哪一个阶段

2.基本用法 接受一个函数作为参数，返回一个Promise对象 Promise对象是一个构造函数，用来生成Promise实例
resolve函数的作用是，将Promise对象的状态从“未完成”变为“成功”（即从Pending变为Resolved）
reject函数的作用是，将Promise对象的状态从“未完成”变为“失败”（即从Pending变为Rejected）

3.Promise.prototype.then() then方法的第一个参数是Resolved状态的回调函数，第二个参数（可选）是Rejected状态的回调函数
//示例一：
getJSON("/post/1.json").then(function(post) {
  return getJSON(post.commentURL);
}).then(function funcA(comments) {
  console.log("Resolved: ", comments);
}, function funcB(err){
  console.log("Rejected: ", err);
});

//示例二：
getJSON("/post/1.json").then(
  post => getJSON(post.commentURL)
).then(
  comments => console.log("Resolved: ", comments),
  err => console.log("Rejected: ", err)
);

4.Promise.prototype.catch() Promise.prototype.catch方法是.then(null, rejection)的别名，发生错误时的回调函数
//示例：
p.then((val) => console.log('fulfilled:', val))
  .catch((err) => console.log('rejected', err));

// 等同于
p.then((val) => console.log('fulfilled:', val))
  .then(null, (err) => console.log("rejected:", err));

//示例二：
getJSON('/post/1.json').then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // some code
}).catch(function(error) {
  // 处理前面三个Promise产生的错误
});

//示例三：
someAsyncThing().then(function() {
  return someOtherAsyncThing();
}).catch(function(error) {
  console.log('oh no', error);
  // 下面一行会报错，因为y没有声明
  y + 2;
}).catch(function(error) {
  console.log('carry on', error);
});
// oh no [ReferenceError: x is not defined]
// carry on [ReferenceError: y is not defined]

5.Promise.prototype.finally() 用于指定不管 Promise 对象最后状态如何，都会执行的操作；ES2018;
finally方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果
finally本质上是then方法的特例
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});

6.Promise.all() Promise.all 方法用于将多个Promise实例，包装成一个新的Promise实例 所有状态改变，才会触发回调
提醒：Promise.all 方法的参数可以不是数组，但必须具有Iterator接口，且返回的每个成员都是Promise实例
//示例一：
// 生成一个Promise对象的数组
var promises = [2, 3, 5, 7, 11, 13].map(function (id) {
  return getJSON("/post/" + id + ".json");
});

Promise.all(promises).then(function (posts) {
  // ...
}).catch(function(reason){
  // ...
});

//示例二：
const databasePromise = connectDatabase();

const booksPromise = databasePromise
  .then(findAllBooks);

const userPromise = databasePromise
  .then(getCurrentUser);

Promise.all([
  booksPromise,
  userPromise
])
.then(([books, user]) => pickTopRecommentations(books, user));

7.Promise.race() Promise.race方法同样是将多个Promise实例，包装成一个新的Promise实例 其中一个状态改变，才会触发回调
//示例一：
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);
p.then(response => console.log(response));
p.catch(error => console.log(error));

7.Promise.resolve() 将现有对象转为Promise对象

(1).参数是一个Promise实例 原路返回
(2).参数是一个thenable对象 Promise.resolve方法会将这个对象转为Promise对象，然后就立即执行thenable对象的then方法
let thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};

let p1 = Promise.resolve(thenable);
p1.then(function(value) {
  console.log(value);  // 42
});

(3).参数不是具有then方法的对象，或根本就不是对象 Promise.resolve方法返回一个新的Promise对象，状态为Resolved
var p = Promise.resolve('Hello');

p.then(function (s){
  console.log(s)
});
// Hello

(4).不带有任何参数 直接返回一个Resolved状态的Promise对象
//立即resolve的Promise对象，是在本轮“事件循环”（event loop）的结束时，而不是在下一轮“事件循环”的开始时。
setTimeout(function () {
  console.log('three');
}, 0);

Promise.resolve().then(function () {
  console.log('two');
});

console.log('one');

8.Promise.reject() Promise.reject(reason)方法也会返回一个新的 Promise 实例，该实例的状态为rejected

//示例一
//const thenable = {
  then(resolve, reject) {
    reject('出错了');
  }
};

Promise.reject(thenable)
.catch(e => {
  console.log(e === thenable)
})
// true

9.两个有用的附加方法

(1).done() done方法总是处于回调链的尾端，保证抛出任何可能出现的错误
asyncFunc()
  .then(f1)
  .catch(r1)
  .then(f2)
  .done();

//实现原理：
Promise.prototype.done = function (onFulfilled, onRejected) {
  this.then(onFulfilled, onRejected)
    .catch(function (reason) {
      // 抛出一个全局错误
      setTimeout(() => { throw reason }, 0);
    });
};

(2).finally() finally方法用于指定不管Promise对象最后状态如何，都会执行的操作
//接受一个普通的回调函数作为参数，该函数不管怎样都必须执行
server.listen(0)
  .then(function () {
    // run test
  })
  .finally(server.stop);

//实现原理：
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

10.应用场景：
(1).加载图片
const preloadImage = function (path) {
  return new Promise(function (resolve, reject) {
    var image = new Image();
    image.onload  = resolve;
    image.onerror = reject;
    image.src = path;
  });
};

(2).Generator函数与Promise的结合
function getFoo () {
  return new Promise(function (resolve, reject){
    resolve('foo');
  });
}

var g = function* () {
  try {
    var foo = yield getFoo();
    console.log(foo);
  } catch (e) {
    console.log(e);
  }
};

function run (generator) {
  var it = generator();

  function go(result) {
    if (result.done) return result.value;

    return result.value.then(function (value) {
      return go(it.next(value));
    }, function (error) {
      return go(it.throw(error));
    });
  }

  go(it.next());
}

run(g);

11.Promise.try() 同步函数同步执行，异步函数异步执行
//方法一： async函数
const f = () => console.log('now');
(async () => f())();
console.log('next');
// now
// next

//方法二：new Promise
const f = () => console.log('now');
(
  () => new Promise(
    resolve => resolve(f())
  )
)();
console.log('next');
// now
// next

//提案方法：
const f = () => console.log('now');
Promise.try(f);
console.log('next');
// now
// next
//

同时捕获同步和异步错误：需要用 Promise.try 包装
Promise.try(database.users.get({id: userId}))
  .then(...)
  .catch(...)
