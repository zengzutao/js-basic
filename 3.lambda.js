//箭头函数完全修复了this的指向
//this总是指向词法作用域，也就是外层调用者obj
// 两个参数:
(x, y) => x * x + y * y

// 无参数:
() => 3.14

// 可变参数:
(x, y, ...rest) => {
    var i, sum = x + y;
    for (i=0; i<rest.length; i++) {
        sum += rest[i];
    }
    return sum;
}

//函数式编程：underscore.js