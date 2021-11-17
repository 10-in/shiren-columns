# 实仁·排盘

## 安装
```bash
yarn add shiren-columns
npm i shiren-columns
```

## 索引转文字
```js
console.log(Str.o(1)) // 阳
console.log(Str.g(1)) // 乙
console.log(Str.g(0, 1, 2)) // 甲乙丙
console.log(Str.z(1)) // 丑
console.log(Str.e(1)) // 木
console.log(Str.spirits(1)) // 比肩
console.log(Str.spirits10(0, 1)) // 印卩
```

## 八字排盘数据

```js
"use strict";

import {Builder} from "./index.js";
import {plate} from "shiren-calendar";

// 获取基础的排盘信息
const info = plate(false, 1989, 11, 6, 18)

// 获取日干
const dg = info.basic.g[2]

// 把四柱天干｜地址索引转换为对应的天干颜色
info.basic.g = Builder.g(dg, info.basic.g)
info.basic.z = Builder.z(dg, info.basic.z)

// 把大运的天干｜地址索引转换为对应的天干颜色
info.lucky.g = Builder.g(dg, info.lucky.g)
info.lucky.z = Builder.z(dg, info.lucky.z)

// 获取流年
const years = Builder.year(1990).map((item) => { return Builder.gz(dg, item) })
console.log(years)

// 获取流月
const months = Builder.month(1990).map((item) => { return Builder.gz(dg, item) })
console.log(months)

// 获取流日 2月对应的索引为0，3-1..
const days = Builder.day(1990, 2, months[0].day,months[0].dd).map((item) => { return Builder.gz(dg, item) })
console.log(days)

// 获取流时
const hours = Builder.hour(days[0].hourG).map((item) => { return Builder.gz(dg, item) })
console.log(hours)


```
