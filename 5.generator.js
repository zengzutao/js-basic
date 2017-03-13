//generator（生成器）是ES6标准引入的新的数据类型。
//一个generator看上去像一个函数，但可以返回多次
//generator就可以实现需要用面向对象才能实现的功能 保存对象状态
//generator还有另一个巨大的好处，就是把异步回调代码变成“同步”代码

//斐波那契数
function* fib(max) {
    var
        t,
        a = 0,
        b = 1,
        n = 1;
    while (n < max) {
        yield a;
        t = a + b;
        a = b;
        b = t;
        n ++;
    }
    return a;
}
//(1)调用方法一
var f = fib(5);
f.next(); // {value: 0, done: false}
f.next(); // {value: 1, done: false}
f.next(); // {value: 1, done: false}
f.next(); // {value: 2, done: false}
f.next(); // {value: 3, done: true}

//(2)调用方法二
for (var x of fib(5)) {
    console.log(x); // 依次输出0, 1, 1, 2, 3
}

//next()  
//for...of循环迭代generator对象



//generator将异步回调代码变成“同步”代码
//(1)传统方法
ajax('http://url-1', data1, function (err, result) {
    if (err) {
        return handle(err);
    }
    ajax('http://url-2', data2, function (err, result) {
        if (err) {
            return handle(err);
        }
        ajax('http://url-3', data3, function (err, result) {
            if (err) {
                return handle(err);
            }
            return success(result);
        });
    });
});

//(2)generator方式
try {
    r1 = yield ajax('http://url-1', data1);
    r2 = yield ajax('http://url-2', data2);
    r3 = yield ajax('http://url-3', data3);
    success(r3);
}
catch (err) {
    handle(err);
}