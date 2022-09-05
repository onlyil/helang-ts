# helang-ts

A parody of [helang](https://github.com/kifuan/helang) with deno typescript

## 使用方法

以 `shell` 的方式启动 `helang.ts`

```bash
> deno run helang.ts shell
```

也可以用 `great` 的方式启动，这会执行标志性的代码向你问候
```bash
> deno run helang.ts great
```

注：Deno 会向你申请文件权限，因为它 Secure by default 。你可以使用参数给予权限

```
deno run --allow-env helang.ts shell
```

## 基本语法

一切类型均为 `u8`，使用 `|` 声明数组

```
u8 a = 1 | 2 | 3
```

我们的数组下标从 `1` 开始

```
u8 a = 1 | 2 | 3;
print a[1];
// 1
```

但是，当你设置一个 `u8` 的元素时，你可以用 `0` 作为下标：这意味着所有元素都将被赋值

```
a[0] = 10;
print a;
// 10 | 10 | 10
```

支持多下标操作

```
u8 a = 1 | 2 | 3;
a[1 | 2] = 0;
print a;
// 0 | 0 | 3
```

可以根据长度的初始化数组，可惜这还是传统写法

```
u8 b = [5];
print b;
// 0 | 0 | 0 | 0 | 0
```

最后，可以写出下列代码

```
u8 forceCon = [68];

forceCon[1 | 2 | 6 | 7 | 11 | 52 | 57 | 58 | 65] = 10;

print forceCon;
```

## "切片"

我们支持高级的索引方法

```
u8 a = 1 | 2 | 3;
u8 b = a[1 | 3];
print b;
// 1 | 3
```

## 自增运算

```
u8 a = 1 | 2 | 3;
a++;
print a;
// 2 | 3 | 4
```

## Hello, world!

由于对效率的极端苛刻要求，我们使用字符在 Unicode 中对应的数字来表示这个字符。
[Unicode Chart](https://www.ssec.wisc.edu/~tomw/java/unicode.html#x0000)

```
sprint 72 | 101 | 108 | 108 | 111 | 44 | 32 | 119 | 111 | 114 | 108 | 100 | 33;
// Hello, world!
```
