1.Generator 函数是一个状态机，封装了多个内部状态；Generator 函数除了状态机，还是一个遍历器对象生成函数
特征：
1).function 关键字与函数名之间有一个星号
2).函数体内部使用yield语句
3).调用Generator函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的指针对象(即遍历器对象)

function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

var hw = helloWorldGenerator();

2.yield语句 yield句本身没有返回值，或者说总是返回undefined
只有调用next方法才会遍历下一个内部状态，所以其实提供了一种可以暂停执行的函数 yield语句就是暂停标志
function* gen() {
  yield  123 + 456; //调用时，不会立即执行 当指针指向时才会计算
}

yield 与 return 的区别：
相同点：都能返回紧跟在语句后面的那个表达式的值
不同点：每次遇到 yield，函数暂停执行，下一次再从该位置继续向后执行;而 return 语句不具备位置记忆的功能

3.与 Iterator 接口的关系 Generator函数执行后，返回一个遍历器对象

4.next的参数 V8引擎直接忽略第一次使用next方法时的参数，只有从第二次使用next方法开始，参数才是有效的
Generator 函数从暂停状态到恢复运行，它的上下文状态（context）是不变的
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var a = foo(5);
a.next() // Object{value:6, done:false}
a.next() // Object{value:NaN, done:false}
a.next() // Object{value:NaN, done:true}

var b = foo(5);
b.next() // { value:6, done:false }
b.next(12) // { value:8, done:false }
b.next(13) // { value:42, done:true }

5.for...of循环 自动遍历Generator函数时生成的Iterator对象，且此时不再需要调用next方法
//示例一：
function *foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (let v of foo()) {
  console.log(v);
}
// 1 2 3 4 5

//示例二：
function* fibonacci() {
  let [prev, curr] = [0, 1];
  for (;;) {
    [prev, curr] = [curr, prev + curr];
    yield curr;
  }
}

for (let n of fibonacci()) {
  if (n > 1000) break;
  console.log(n);
}

//遍历任意对象（object）的方法
function* objectEntries(obj) {
  let propKeys = Reflect.ownKeys(obj);

  for (let propKey of propKeys) {
    yield [propKey, obj[propKey]];
  }
}

let jane = { first: 'Jane', last: 'Doe' };

for (let [key, value] of objectEntries(jane)) {
  console.log(`${key}: ${value}`);
}
// first: Jane
// last: Doe

//其他示例：
function* numbers () {
  yield 1
  yield 2
  return 3
  yield 4
}

// 扩展运算符
[...numbers()] // [1, 2]

// Array.from 方法
Array.from(numbers()) // [1, 2]

// 解构赋值
let [x, y] = numbers();
x // 1
y // 2

// for...of 循环
for (let n of numbers()) {
  console.log(n)
}
// 1
// 2

6.Generator.prototype.throw() throw方法可以接受一个参数，该参数会被catch语句接收，建议抛出Error对象的实例
//一旦Generator执行过程中抛出错误，且没有被内部捕获，就不会再执行下去了
//可以在函数体外抛出错误，然后在Generator函数体内捕获
var g = function* () {
  try {
    yield;
  } catch (e) {
    console.log('内部捕获', e);
  }
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('外部捕获', e);
}
// 内部捕获 a
// 外部捕获 b

//多个yield语句，可以只用一个try...catch代码块来捕获错误
var gen = function* gen(){
  yield console.log('hello');
  yield console.log('world');
}

var g = gen();
g.next();

try {
  throw new Error();
} catch (e) {
  g.next();
}
// hello
// world

//Generator函数体内抛出的错误，也可以被函数体外的catch捕获
function* foo() {
  var x = yield 3;
  var y = x.toUpperCase();
  yield y;
}

var it = foo();

it.next(); // { value:3, done:false }

try {
  it.next(42);
} catch (err) {
  console.log(err);
}

7.Generator.prototype.return() 可以返回给定的值，并且终结遍历Generator函数
//示例一：
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

var g = gen();

g.next()        // { value: 1, done: false }
g.return() // { value: undefined, done: true }

//如果return方法调用时，不提供参数，则返回值的value属性为undefined
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

var g = gen();

g.next()        // { value: 1, done: false }
g.return() // { value: undefined, done: true }

//如果Generator函数内部有try...finally代码块，那么return方法会推迟到finally代码块执行完再执行
function* numbers () {
  yield 1;
  try {
    yield 2;
    yield 3;
  } finally {
    yield 4;
    yield 5;
  }
  yield 6;
}
var g = numbers()
g.next() // { done: false, value: 1 }
g.next() // { done: false, value: 2 }
g.return(7) // { done: false, value: 4 }
g.next() // { done: false, value: 5 }
g.next() // { done: true, value: 7 }

8.yield* 语句
//在Generator中执行一个Generator函数 yield*语句
function* bar() {
  yield 'x';
  yield* foo();
  yield 'y';
}

// 等同于
function* bar() {
  yield 'x';
  yield 'a';
  yield 'b';
  yield 'y';
}

//yield*命令可以很方便地取出嵌套数组的所有成员
function* iterTree(tree) {
  if (Array.isArray(tree)) {
    for(let i=0; i < tree.length; i++) {
      yield* iterTree(tree[i]);
    }
  } else {
    yield tree;
  }
}

const tree = [ 'a', ['b', 'c'], ['d', 'e'] ];

for(let x of iterTree(tree)) {
  console.log(x);
}
// a
// b
// c
// d
// e

//yield*后面的Generator函数（没有return语句时），等同于在Generator函数内部，部署一个for...of循环

function* concat(iter1, iter2) {
  yield* iter1;
  yield* iter2;
}

// 等同于
function* concat(iter1, iter2) {
  for (var value of iter1) {
    yield value;
  }
  for (var value of iter2) {
    yield value;
  }
}

使用yield*语句遍历完全二叉树
// 下面是二叉树的构造函数，
// 三个参数分别是左树、当前节点和右树
function Tree(left, label, right) {
  this.left = left;
  this.label = label;
  this.right = right;
}

// 下面是中序（inorder）遍历函数。
// 由于返回的是一个遍历器，所以要用generator函数。
// 函数体内采用递归算法，所以左树和右树要用yield*遍历
function* inorder(t) {
  if (t) {
    yield* inorder(t.left);
    yield t.label;
    yield* inorder(t.right);
  }
}

// 下面生成二叉树
function make(array) {
  // 判断是否为叶节点
  if (array.length == 1) return new Tree(null, array[0], null);
  return new Tree(make(array[0]), array[1], make(array[2]));
}
let tree = make([[['a'], 'b', ['c']], 'd', [['e'], 'f', ['g']]]);

// 遍历二叉树
var result = [];
for (let node of inorder(tree)) {
  result.push(node);
}

result
// ['a', 'b', 'c', 'd', 'e', 'f', 'g']

9.作为对象属性的Generator函数
//对象的属性是Generator函数，可以简写成下面的形式
let obj = {
  * myGeneratorMethod() {
    ···
  }
};

10.Generator函数的this ES6规定这个遍历器是Generator函数的实例,继承了Generator函数的prototype对象上的方法
1).Generator函数返回的总是遍历器对象，而不是this对象
function* g() {
  this.a = 11;
}

let obj = g();
obj.a // undefined

2).Generator函数也不能跟new命令一起用，会报错
function* F() {
  yield this.x = 2;
  yield this.y = 3;
}

new F()
// TypeError: F is not a constructor

3).解决办法
//方法一：生成空对象
function* F() {
  this.a = 1;
  yield this.b = 2;
  yield this.c = 3;
}
var obj = {};
var f = F.call(obj);

//方法二：你用 call
function* F() {
  this.a = 1;
  yield this.b = 2;
  yield this.c = 3;
}
var f = F.call(F.prototype);

10.其他
1).Generator是实现状态机的最佳结构
var clock = function*() {
  while (true) {
    console.log('Tick!');
    yield;
    console.log('Tock!');
    yield;
  }
};

2).Generator与协程
特点：协程（coroutine）是一种程序运行的方式，协程是以多占用内存为代价，实现多任务的并行，多个栈
定义：并行执行、交换执行权的线程（或函数），就称为协程
Generator函数是ECMAScript 6 对协程的实现，但属于不完全实现，被称为“半协程”

11.应用：
1).异步操作的同步化表达 Generator函数的一个重要实际意义就是用来处理异步操作，改写回调函数
function* loadUI() {
  showLoadingScreen();
  yield loadUIDataAsynchronously();
  hideLoadingScreen();
}
var loader = loadUI();
// 加载UI
loader.next()

// 卸载UI
loader.next()

2).控制流管理 (以下示例全都是同步执行)
(1)传统写法：
step1(function (value1) {
  step2(value1, function(value2) {
    step3(value2, function(value3) {
      step4(value3, function(value4) {
        // Do something with value4
      });
    });
  });
});

(2).promise写法：
Promise.resolve(step1)
  .then(step2)
  .then(step3)
  .then(step4)
  .then(function (value4) {
    // Do something with value4
  }, function (error) {
    // Handle any error from step1 through step4
  })
  .done();

(3).Generator写法：
function* longRunningTask(value1) {
  try {
    var value2 = yield step1(value1);
    var value3 = yield step2(value2);
    var value4 = yield step3(value3);
    var value5 = yield step4(value4);
    // Do something with value4
  } catch (e) {
    // Handle any error from step1 through step4
  }
}

3).利用Generator函数，可以在任意对象上部署Iterator接口
4).作为数据结构 可以看作是一个数组结构
function *doStuff() {
  yield fs.readFile.bind(null, 'hello.txt');
  yield fs.readFile.bind(null, 'world.txt');
  yield fs.readFile.bind(null, 'and-such.txt');
}

for (task of doStuff()) {
  // task是一个函数，可以像回调函数那样使用它
}
