1.class 一个类必须有constructor方法，如果没有显式定义，一个空的constructor方法会被默认添加
(1).类的数据类型就是函数，类本身就指向构造函数
class Point {
  // ...
}

typeof Point // "function"
Point === Point.prototype.constructor // true

(2).类的所有方法都定义在类的prototype属性上面
class Point {
  constructor(){
    // ...
  }

  toString(){
    // ...
  }

  toValue(){
    // ...
  }
}

// 等同于

Point.prototype = {
  toString(){},
  toValue(){}
};

(3).Object.assign方法可以很方便地一次向类添加多个方法 基于类的方法都定义在prototype上
class Point {
  constructor(){
    // ...
  }
}

Object.assign(Point.prototype, {
  toString(){},
  toValue(){}
});

(4).类中定义的方法不可枚举 prototype上定义的犯法可以枚举

2.constructor方法 通过new命令生成对象实例时，自动调用该方法 类的构造函数，不使用new是没法调用的，会报错
//constructor方法默认返回实例对象（即this），完全可以指定返回另外一个对象
class Foo {
  constructor() {
    return Object.create(null);
  }
}

new Foo() instanceof Foo
// false

3.类的实例对象
(1).类的所有实例共享一个原型对象
var p1 = new Point(2,3);
var p2 = new Point(3,2);

p1.__proto__ === p2.__proto__
//true

(2).实例的属性除非显式定义在其本身（即定义在this对象上），否则都是定义在原型上（即定义在class上）
//定义类
class Point {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }

}

var point = new Point(2, 3);

point.toString() // (2, 3)

point.hasOwnProperty('x') // true
point.hasOwnProperty('y') // true
point.hasOwnProperty('toString') // false
point.__proto__.hasOwnProperty('toString') // tru

(3).通过实例的__proto__属性为Class添加方 __proto__属性会改变Class的原始定义，影响到所有实例
var p1 = new Point(2,3);
var p2 = new Point(3,2);

p1.__proto__.printName = function () { return 'Oops' };

p1.printName() // "Oops"
p2.printName() // "Oops"

var p3 = new Point(4,2);
p3.printName() // "Oops"

4.不存在变量提升 Class不存在变量提升（hoist） 因为继承，必须保证子类在父类之后定义
new Foo(); // ReferenceError
class Foo {}

5.Class表达式
(1).与函数一样，类也可以使用表达式的形式定义
const MyClass = class Me {
  getClassName() {
    return Me.name;
  }
};

//简写 me在内部用不到
const MyClass = class { /* ... */ };

(2).立即执行的Class
let person = new class {
  constructor(name) {
    this.name = name;
  }

  sayName() {
    console.log(this.name);
  }
}('张三');

person.sayName(); // "张三"

6.私有方法
(1).索性将私有方法移出模块
class Widget {
  foo (baz) {
    bar.call(this, baz);
  }

  // ...
}

function bar(baz) {
  return this.snaf = baz;
}
(2).将私有方法的名字命名为一个Symbol值
const bar = Symbol('bar');
const snaf = Symbol('snaf');

export default class myClass{

  // 公有方法
  foo(baz) {
    this[bar](baz);
  }

  // 私有方法
  [bar](baz) {
    return this[snaf] = baz;
  }

  // ...
};

7.this的指向 类的方法内部如果含有this，它默认指向类的实例
(1).单独使用报错
class Logger {
  printName(name = 'there') {
    this.print(`Hello ${name}`);
  }

  print(text) {
    console.log(text);
  }
}

const logger = new Logger();
const { printName } = logger;
printName(); // TypeError: Cannot read property 'print' of undefined

解决方法一： 在构造方法中绑定this
class Logger {
  constructor() {
    this.printName = this.printName.bind(this);
  }
}

解决方法二：使用箭头函数
class Logger {
  constructor() {
    this.printName = (name = 'there') => {
      this.print(`Hello ${name}`);
    };
  }
}

解决方法三：使用Proxy，获取方法的时候，自动绑定this
function selfish (target) {
  const cache = new WeakMap();
  const handler = {
    get (target, key) {
      const value = Reflect.get(target, key);
      if (typeof value !== 'function') {
        return value;
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target));
      }
      return cache.get(value);
    }
  };
  const proxy = new Proxy(target, handler);
  return proxy;
}

const logger = selfish(new Logger());

8.严格模式 ES6实际上把整个语言升级到了严格模式

9.继承 Class之间可以通过extends关键字实现继承 extends super
子类没有自己的this对象，而是继承父类的this对象，如果不调用super方法，子类就得不到this对象
class ColorPoint extends Point {
  constructor(x, y, color) {
    super(x, y); // 调用父类的constructor(x, y)
    this.color = color;
  }

  toString() {
    return this.color + ' ' + super.toString(); // 调用父类的toString()
  }
}

如果子类没有定义constructor方法，这个方法会被默认添加
constructor(...args) {
  super(...args);
}

只有super方法才能返回父类实例
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class ColorPoint extends Point {
  constructor(x, y, color) {
    this.color = color; // ReferenceError
    super(x, y);
    this.color = color; // 正确
  }
}

10.类的prototype属性和__proto__属性 Class作为构造函数的语法糖，同时有prototype属性和__proto__属性

(1).子类的__proto__属性，表示构造函数的继承，总是指向父类 表示父类的实例

(2).子类prototype属性的__proto__属性，表示方法的继承，总是指向父类的prototype属性  表示子类的原型是父类

(3).实现原理：
Object.setPrototypeOf(B.prototype, A.prototype);
// 等同于
B.prototype.__proto__ = A.prototype;

Object.setPrototypeOf(B, A);
// 等同于
B.__proto__ = A;

Object.create(A.prototype);
// 等同于
B.prototype.__proto__ = A.prototype;

11.Extends 的继承目标
(1).情况一：子类继承Object类
class A extends Object {
}

A.__proto__ === Object // true
A.prototype.__proto__ === Object.prototype // true

(2).情况二：不存在任何继承
class A {
}

A.__proto__ === Function.prototype // true
A.prototype.__proto__ === Object.prototype // true

(3).情况三：子类继承null
class A extends null {
}

A.__proto__ === Function.prototype // true
A.prototype.__proto__ === undefined // true

(4).Object.getPrototypeOf() 用来从子类上获取父类
Object.getPrototypeOf(ColorPoint) === Point
// true

12.super 关键字 super这个关键字，既可以当作函数使用，也可以当作对象使用
(1).super作为函数调用时，代表父类的构造函数
//ES6 要求，子类的构造函数必须执行一次super函数 super内部的this指的是B A.prototype.constructor.call(this)
//super虽然代表了父类A的构造函数，但是返回的是子类B的实例
//ES6 规定，通过super调用父类的方法时，super会绑定子类的this

class A {}

class B extends A {
  constructor() {
    super();
  }
}

(2).super作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类
//super在静态方法之中指向父类，在普通方法之中指向父类的原型对象
//使用super的时候，必须显式指定是作为函数、还是作为对象使用，否则会报错

(3).原生构造函数的继承 原生构造函数是指语言内置的构造函数，通常用来生成数据结构
1).ES5 原生构造函数的this无法绑定，导致拿不到内部属性 ES5是先新建子类的实例对象this，再将父类的属性添加到子类上，由于父类的内部属性无法获取，导致无法继承原生的构造函数
2).ES6 允许继承原生构造函数定义子类 ES6是先新建父类的实例对象this，然后再用子类的构造函数修饰this，使得父类的所有行为都可以继承

12.Class的取值函数（getter）和存值函数（setter）
(1).存值函数和取值函数是设置在属性的descriptor对象上的
class CustomHTMLElement {
  constructor(element) {
    this.element = element;
  }

  get html() {
    return this.element.innerHTML;
  }

  set html(value) {
    this.element.innerHTML = value;
  }
}

var descriptor = Object.getOwnPropertyDescriptor(
  CustomHTMLElement.prototype, "html");
"get" in descriptor  // true
"set" in descriptor  // true

13.Class Generator 方法,方法前有一个星号，表示该方法是一个 Generator 函数
class Foo {
  constructor(...args) {
    this.args = args;
  }
  * [Symbol.iterator]() {
    for (let arg of this.args) {
      yield arg;
    }
  }
}

for (let x of new Foo('hello', 'world')) {
  console.log(x);
}
// hello
// world

14.Class 静态方法不会被实例继承，而是直接通过类来调用 静态方法也是可以从super对象上调用,但是不能通过实例调用

15.Class的静态属性和实例属性
//静态属性指的是Class本身的属性 ES6明确规定，Class内部只有静态方法，没有静态属性
// 以下两种写法都无效
class Foo {
  // 写法一
  prop: 2

  // 写法二
  static prop: 2
}

Foo.prop // undefined

(1).类的实例属性
class ReactCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }
  state;
}

(2).类的静态属性
// 老写法
class Foo {
}
Foo.prop = 1;

// 新写法
class Foo {
  static prop = 1;
}

16.类的私有属性 方法是在属性名之前，使用#表示
class Foo {
  #a;
  #b;
  #sum() { return #a + #b; }
  printSum() { console.log(#sum()); }
  constructor(a, b) { #a = a; #b = b; }
}

17.new.target属性
//用来确定构造函数是怎么调用的
function Person(name) {
  if (new.target !== undefined) {
    this.name = name;
  } else {
    throw new Error('必须使用new生成实例');
  }
}

// 另一种写法
function Person(name) {
  if (new.target === Person) {
    this.name = name;
  } else {
    throw new Error('必须使用new生成实例');
  }
}

var person = new Person('张三'); // 正确
var notAPerson = Person.call(person, '张三');  // 报错

(1).Class内部调用new.target，返回当前Class
class Rectangle {
  constructor(length, width) {
    console.log(new.target === Rectangle);
    this.length = length;
    this.width = width;
  }
}

var obj = new Rectangle(3, 4); // 输出 true

(2).子类继承父类时，new.target会返回子类
class Rectangle {
  constructor(length, width) {
    console.log(new.target === Rectangle);
    // ...
  }
}

class Square extends Rectangle {
  constructor(length) {
    super(length, length);
  }
}

var obj = new Square(3); // 输出 false

18.Mixin模式的实现 Mixin模式指的是，将多个类的接口“混入”（mix in）另一个类
function mix(...mixins) {
  class Mix {}

  for (let mixin of mixins) {
    copyProperties(Mix, mixin);
    copyProperties(Mix.prototype, mixin.prototype);
  }

  return Mix;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if ( key !== "constructor"
      && key !== "prototype"
      && key !== "name"
    ) {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}
