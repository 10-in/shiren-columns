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

import {Builder} from "shiren-columns";
import {plate} from "shiren-calendar";

// 获取基础的排盘信息
const info = plate(false, 1989, 11, 6, 18)

// 获取日干
const dg = info.basic.g[2]

// 把四柱天干｜地支索引转换为对应的天干颜色
info.basic.g = Builder.g(dg, info.basic.g)
info.basic.z = Builder.z(dg, info.basic.z)

// 把大运的天干｜地支索引转换为对应的天干颜色
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

## 八字排盘计算原理

- 四柱
 
- 大运
  - 根据四柱之一的月柱的干支为起点，以年干和命主的性别的关系进行排列
    1. 年干为'甲丙戊庚壬'则男顺女逆
    2. 年干为'乙丁己辛癸'则女顺男逆  

  - 如 男出生时间为2021-11-18 16:33:34, 则八字为：

    | 年柱 |       月柱       | 日柱 | 时柱 |
    | :--: | :--------------: | :--: | :--: |
    |  辛  | [戊<-] 己 [->庚] |  庚  |  甲  |
    |  丑  | [戌<-] 亥 [->子] |  午  |  申  |
    
    因为 年干为辛，且为男，则符合规则`b`得出需要逆排。顺排为`庚子`、`辛丑`...，逆排为`戊戌`、`丁酉`...，则此人大运如下:

    | 2025 | 2035 | 2045 | 2055 | ···  |
    | :--: | :--: | :--: | :--: | ---- |
    |  戊  |  丁  |  丙  |  乙  | ···  |
    |  戌  |  酉  |  申  |  未  | ···  |

- 流年
  - 流年当年对应的年份所对应的干支。如2021年对应辛丑年。
  - 因为干支纪年法只有60种，可以通过公式计算出是哪一种  
    公元1年对应的纪年法为57，57 % 10 = 7(辛)，57 % 12 = 9(酉)，即辛酉年。  
    则公元后的年份可总结公式为 `(year + 56) % 60` ，如 2021年代入得37，余数分别为7，1，即辛丑年  
    则公元后的年份可总结公式为 `(60 + (year - 3) % 60) % 60` ，如 -1年代入得56，余数分别为6，8，即庚申年  

- 流月
  
  每年有12个月，每个流月的开始以对应的节气为开始，到下一个节气结束。
  而每年的第一个节气为立春，通过计算立春后第一个节气的具体时间，进一步换算成四柱八字，其中的月柱则为第一个流月(即2月)的干支，其他11个流月则依次按干支计时法往下排即可

- 流日
  
  即当前月的节气到下一个月的节气对应的日子。
  如1990年的立春(2月4日)到惊蛰(3月6日)，则这段时间的日子即为某个月的流日。  
  通过计算1990年2月共有28天，则这段日子为 2月4日、2月5日、2月6日...2月28日、3月1日...3月5日。

- 流时
  
  某一天对应的24小时对应的干支。可以通过日上起时法，来确定对应的起始时干，时支的起始永远为子时。
  如1990年2月24日，为庚午年戊寅月[庚子]日，根据日上起时法，则起始时干为丙，则0～1点对应的干支为丙子时，1～3为丁丑时...


- 年上起月口诀

  甲己之年丙作首，乙庚之年戊为头  
  丙辛之岁寻庚上，丁壬壬寅顺水流  
  若问戊癸何处起，甲寅之上好追求  

- 日上起时法

  甲己还加甲，乙庚丙作初  
  丙辛从戊起，丁壬庚子居  
  戊癸何方发，壬子是真途  
