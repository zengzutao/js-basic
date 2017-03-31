本扩展主要针对ES6:

1.字符串扩展：
(1)字符的 Unicode 表示法
(2)codePointAt方法 能够正确处理4个字节储存的字符，返回一个字符的码点,十进制
(3)String.fromCodePoint() 用于从码点返回对应字符，但是这个方法不能识别32位的 UTF-16 字符（Unicode编号大于0xFFFF）
(4)字符串的遍历器接口 实现了遍历器借口,可以识别大于0xFFFF的码点，传统的for循环无法识别这样的码点
(5)charat() 返回字符串给定位置的字符,但是不能识别码点大于0xFFFF的字符,at() 可以识别Unicode编号大于0xFFFF的字符，返回正确的字符
(6)normalize() 字符合成
(7)ndexOf(),includes(), startsWith(), endsWith() 返回bool值，可以用来确定一个字符串是否包含在另一个字符串中
(8)repeat() repeat方法返回一个新字符串，表示将原字符串重复n次 'hello'.repeat(2) // "hellohello"
(9)padStart()用于头部补全，padEnd()用于尾部补全
(10)模板字符串 模板字符串（template string）是增强版的字符串，用反引号（``）标识  `User ${user.name} is not authorized to do ${action}.`
(11)标签模板 以紧跟在一个函数名后面，该函数将被调用来处理这个模板字符串  例如：alert`123` 等同于 alert(123)
(12)String.raw() 用来充当模板字符串的处理函数，返回一个斜杠都被转义（即斜杠前面再加一个斜杠）的字符串，对应于替换变量后的模板字符串 String.raw`Hi\u000A!`; // 'Hi\\u000A!'
(13)模板字符串的限制

2.正则扩展:
(1)RegExp构造函数  如果RegExp构造函数第一个参数是一个正则对象，那么可以使用第二个参数指定修饰符 new RegExp(/abc/ig, 'i').flags // "i"
(2)字符串的正则方法 match()、replace()、search() 、split() 从 String -> RegExp 中
(3)u(. i)修饰符 含义为“Unicode模式”，用来正确处理大于\uFFFF的Unicode字符
(4)y 修饰符：“粘连”（sticky）修饰符；y修饰符确保匹配必须从剩余的第一个位置开始，这也就是“粘连”的涵义
(5)sticky属性,会返回正则表达式的修饰符
(6)RegExp.escape() 方法被放弃了
(7)s 修饰符：dotAll 模式 dotAll模式，即点（dot）代表一切字符
(8)后行断言
(9)Unicode属性类 \p{...}和 \P{...} 允许正则表达式匹配符合Unicode某种属性的所有字符

3.数值扩展
(1)二进制和八进制表示法 ES6 提供了二进制和八进制数值的新的写法，分别用前缀0b（或0B）和0o（或0O）表示
(2)Number.isFinite() 用来检查一个数值是否为有限的（finite）, Number.isNaN()
(3)Number.parseInt(), Number.parseFloat()
(4)Number.isInteger() 用来判断一个值是否为整数
(5)Number.EPSILON 为浮点数计算，设置一个误差范围
(6)安全整数和Number.isSafeInteger() ES6引入了Number.MAX_SAFE_INTEGER和Number.MIN_SAFE_INTEGER这两个常量，用来表示这个范围的上下限
(7)Math对象的扩展
Math.trunc() 方法用于去除一个数的小数部分，返回整数部分;
Math.sign() 方法用来判断一个数到底是正数、负数、还是零
Math.cbrt() 用于计算一个数的立方根
Math.clz32() 返回一个数的32位无符号整数形式有多少个前导0
Math.imul() 返回两个数以32位带符号整数形式相乘的结果，返回的也是一个32位的带符号整数
Math.fround() 返回一个数的单精度浮点数形式
Math.hypot 返回所有参数的平方和的平方根
(8)对数方法
Math.expm1() 返回ex - 1，即Math.exp(x) - 1
Math.log1p() 返回1 + x的自然对数，即Math.log(1 + x)
Math.log10(x) 返回以10为底的x的对数
Math.log2(x) 返回以2为底的x的对数
(9)三角函数方法 ES6新增6个三角函数
(10)Math.signbit() 用来判断一个值的正负，但是如果参数是-0，它会返回-0
(11)指数运算符（ ** ） 示例：2 ** 2 // 4
(12)赋值运算符（**=） b **= 3; // 等同于 b = b * b * b;

4.数组扩展
(1)Array.from() 将两类对象转为真正的数组:类似数组的对象（array-like object）和可遍历（iterable）的对象（包括ES6新增的数据结构Set和Map）
(2)Array.of() 用于将一组值，转换为数组
(3)数组实例的copyWithin() 在当前数组内部，将指定位置的成员复制到其他位置（会覆盖原有成员），然后返回当前数组
Array.prototype.copyWithin(target, start = 0, end = this.length)
(4)数组实例的find() 用于找出第一个符合条件的数组成员 ,findIndex() 返回第一个符合条件的数组成员的位置，如果所有成员都不符合条件，则返回-1
(5)数组实例的fill() fill方法使用给定值，填充一个数组
(6)数组实例的entries()、keys()和values() 用于遍历数组 都返回遍历器对象
(7)数组实例的includes() 返回一个布尔值，表示某个数组是否包含给定的值
(8)数组的空位:数组的某一个位置没有任何值  in运算符 ES6则是明确将空位转为undefined

5.函数扩展
(1)rest参数 rest 参数（形式为“...变量名”），用于获取函数的多余参数 合并数组 与解构赋值结合 函数的返回值 字符串
(2)箭头函数 var f = v => v; 不可以使用yield命令，因此箭头函数不能用作Generator函数
(3)嵌套的箭头函数 var fix = f => (x => f(v => x(x)(v))) (x => f(v => x(x)(v)));
(4)=> 绑定 this 大大减少了显式绑定this对象的写法
两个双冒号（::），双冒号左边是一个对象，右边是一个函数
//示例
let log = ::console.log;
//等同于
var log = console.log.bind(console);

链式写法：
// 示例
let { find, html } = jake;
document.querySelectorAll("div.myClass")
::find("p")
::html("hahaha");

(5)尾调用优化 某个函数的最后一步是调用另一个函数 只保留内层函数的调用帧
(6)尾递归 函数调用自身，称为递归。如果尾调用自身，就称为尾递归

function factorial(n, total = 1) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5) // 120

(7)尾递归优化的实现 采用“循环”换掉“递归” 蹦床函数（trampoline）可以将递归执行转为循环执行
(8)函数参数的尾逗号 新的语法允许定义和调用时，尾部直接有一个逗号

6.对象扩展
(1)属性的简洁表示法:ES6允许直接写入变量和函数，作为对象的属性和方法 f(1, 2) // Object {x: 1, y: 2}
(2)属性名表达式  方法一 obj.foo = true; 方法二 obj['a' + 'bc'] = 123; 函数制定默认值后,函数的length属性将失真
(3)方法的 name 属性 返回函数名
(4)Object.is() 它用来比较两个值是否严格相等,与 ==== 类似
(5)Object.assign() 用于对象的合并，将源对象（source）的所有可枚举属性，复制到目标对象（target）
数值和布尔值都会被忽略,因为只有字符串的包装对象，会产生可枚举属性
Object.assign 方法实行的是浅拷贝，而不是深拷贝
作用：1).为对象添加属性 2).为对象添加方法 3).克隆对象 4).合并多个对象 5).为属性指定默认值
(6)属性的可枚举性 Object.getOwnPropertyDescriptor 方法可以获取该属性的描述对象
ES6规定，所有Class的原型的方法都是不可枚举的
(7)属性的遍历
1).for...in
2).Object.keys(obj)
3).Object.getOwnPropertyNames(obj)
4).Object.getOwnPropertySymbols(obj)
5).Reflect.ownKeys(obj)

(8)__proto__属性，Object.setPrototypeOf()，Object.getPrototypeOf()
1)__proto__属性（前后各两个下划线），用来读取或设置当前对象的prototype对象 浏览器支持
2)Object.setPrototypeOf 用来设置一个对象的prototype对象，返回参数对象本身
3)Object.getPrototypeOf 用于读取一个对象的原型对象

(9)Object.keys()，Object.values()，Object.entries()

(10)对象的扩展运算符 ...
1).解构赋值 2).扩展运算符

(11)Object.getOwnPropertyDescriptors() 返回某个对象属性的描述对象（descriptor）
(12)Null 传导运算符(?.) const firstName = message?.body?.user?.firstName || 'default';
1)读取对象属性: obj?.prop || obj?.[expr]
2)函数或对象方法的调用: func?.(...args)
3)构造函数的调用: new C?.(...args)
