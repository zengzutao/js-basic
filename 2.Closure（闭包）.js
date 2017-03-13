//闭包（Closure）
//函数作为返回值
//高阶函数除了可以接受函数作为参数外，还可以把函数作为结果值返回。
//相关参数和变量都保存在返回的函数中，这种称为“闭包（Closure）”的程序结构拥有极大的威力

//返回闭包时牢记的一点就是：返回函数不要引用任何循环变量，或者后续会发生变化的变量
//在没有class机制，只有函数的语言里，借助闭包，同样可以封装一个私有变量
//换句话说，闭包就是携带状态的函数，并且它的状态可以完全对外隐藏起来。



//(1)
//返回一个函数
function lazy_sum(arr) {
    var sum = function () {
        return arr.reduce(function (x, y) {
            return x + y;
        });
    }
    return sum;
}

//调用时返回新的函数对象
var f = lazy_sum([1, 2, 3, 4, 5]);

//调用函数f时，才真正计算求和的结果
f(); // 15

//(2) 函数立即执行
(function (x) {
    return x * x;
})(3);

//(3) 闭包实现计数器
function create_counter(initial) {
    var x = initial || 0;
    return {
        inc: function () {
            x += 1;
            return x;
        }
    }
}

var c1 = create_counter();
c1.inc(); // 1
c1.inc(); // 2
c1.inc(); // 3

var c2 = create_counter(10);
c2.inc(); // 11
c2.inc(); // 12
c2.inc(); // 13