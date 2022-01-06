"use strict";

// 定义基础

// 获取排盘基本信息

import {EColor, Element, Gan, Opposite, SolarIterm, Spirits10, Spirits5, Zhi, ZwG} from "./definition.js";
import {g2e, nextG, nextZ, spirit, year2month, z2e} from "./algorithm.js";
import {
    datetime2string,
    gzi,
    julian2solar,
    solar2julian,
    solarMonthHasDays, spring,
    yearJieQi
} from "shiren-calendar";

// 索引转文字
export class Str {
    /**
     * @returns string
     * @param arg 阴阳索引
     */
    static o(...arg) {
        return this.stringify(arg, Opposite)
    }

    /**
     * @returns string
     * @param arg 五行索引
     */
    static e(...arg) {
        return this.stringify(arg, Element)
    }

    /**
     * @returns string
     * @param arg 天干索引
     */
    static g(...arg) {
        return this.stringify(arg, Gan)
    }

    /**
     * @returns string
     * @param arg 地址索引
     */
    static z(...arg) {
        return this.stringify(arg, Zhi)
    }

    /**
     * @returns string
     * @param arg 五神索引
     */
    static spirits(...arg) {
        return this.stringify(arg, Spirits5)
    }

    /**
     * @returns string
     * @param arg 十神索引
     */
    static spirits10(...arg) {
        return this.stringify(arg, Spirits10)
    }

    /**
     * 把参数列表通过map转化成对应的字，并用分界符连接起来
     * @param ps 参数列表
     * @param map
     * @param delimiter 分界符
     * @returns {*}
     */
    static stringify(ps = [], map = [], delimiter = '') {
        ps[0] = map[ps[0]]
        return ps.reduce((p, c) => {
            return `${p}${delimiter}${map[c]}`
        })
    }
}

/**
 * 比较其他天干与日干的关系，得出其他天干的中文名称，颜色，五行，十神
 * @param v 当前天干的索引
 * @param dg 日干的索引索引
 * @param dge 日干五行的索引
 * @returns {{color: string, name: string, spirit: [{color: string, name: string}], element: [{color: string, name: string}]}}
 */
function tranG(v, dg, dge) {
    let e = g2e(v)
    let color = EColor[e]
    return {
        name: Str.g(v),
        color: color,
        element: [{name: Str.e(e), color: color}],
        spirit: [{name: Str.spirits10(2 * spirit(dge, e) + (v % 2 === dg % 2)), color: color}]
    }
}

/**
 * 比较其他地支与日干的关系，得出其他地支的中文名称，颜色，五行，十神、藏干
 * @param v
 * @param dg
 * @param dge
 * @returns {{color: string, g: *[], name: string, spirit: *[], element: *[]}}
 */
function tranZ(v, dg, dge) {
    let e = z2e(v)
    let color = EColor[e]
    const config = {
        name: Str.z(v),
        color: color,
        g: [],
        element: [],
        spirit: []
    }
    ZwG[v].map((i) => {
        let e = g2e(i)
        let color = EColor[e]
        config.g.push({name: Str.g(i), color: color})
        config.element.push({name: Str.e(e), color: color})
        config.spirit.push({name: Str.spirits10(2 * spirit(dge, e) + (i % 2 === dg % 2)), color: color})
    })
    return config;
}

// 普通构造器
export class Builder {
    /**
     * 构造天干信息
     * @param dg 日干索引
     * @param is 天干索引列表
     * @returns {*}
     */
    static g(dg, is) {
        const dge = g2e(dg)
        return is.map((v) => {
            return tranG(v, dg, dge)
        })
    }

    /**
     * 构造地址信息
     * @param dg 日干索引
     * @param is 天干索引列表
     * @returns {*}
     */
    static z(dg, is) {
        const dge = g2e(dg)
        return is.map((v) => {
            return tranZ(v, dg, dge)
        })
    }

    /**
     * 构造天干和地址(一柱)
     * @param dg 日干索引
     * @param gz 干支
     * @returns {*&{g: {color: string, name: string, spirit: [{color: string, name: string}], element: [{color: string, name: string}]}, z: {color: string, g: *[], name: string, spirit: *[], element: *[]}}}
     */
    static gz(dg, gz) {
        const dge = g2e(dg)
        return {
            ...gz,
            g: tranG(gz.g, dg, dge),
            z: tranZ(gz.z, dg, dge)
        }
    }

    /**
     * 流年(点击大运需要展开的数据)
     * @param year 年 (特别注意，公元前的年计算会偏差一年，因为没有公元0年)
     * @param size 获取的条目书，如1990年开始往后十年(1990～1999),就是10
     * @returns {*[]}
     */
    static year(year, size = 10) {
        const yearGZ = ((year + 4712 + 24) % 60 + 60) % 60;
        const columns = []
        let g = yearGZ % 10
        let z = yearGZ % 12

        let i = 0
        do {
            columns.push({g, z})
            g = nextG(g)
            z = nextZ(z)
            i++
        } while (i < size)
        return columns
    }

    /**
     * 流月(点击流年时需要展开的数据)
     * @param year 年
     * @returns {{g: *, z: *, tip: string}[]}
     */
    static month(year) {
        const si = yearJieQi(year)
        // 优化为年上起月法
        let g = year2month(((year + 4712 + 24) % 60 + 60) % 60 % 10)
        let z = 2
        return si.map((v, index) => {
            let d = {
                start: v.jd,
                end: v.nextjd - 1,
                // range: datetime2string(julian2solar(v.jd)) + "~" + datetime2string(julian2solar(v.nextjd - 1)),
                g: g,
                z: z,
                tip: v.month + '月' + SolarIterm[index],
                month: v.month,
            }
            g = nextG(g)
            z = nextZ(z)
            return d
        })
    }

    /**
     * 流日(点击流月需要展开的数据)
     * @param month 月份信息
     * @returns {*[]}
     */
    static day(month) {
        let startJD = Math.floor(month.start) - 0.5
        const columns = []

        const firstDay = julian2solar(startJD)
        const gzd = gzi(firstDay[0], firstDay[1], firstDay[2], 0)
        let dayG = gzd.g[2]
        let dayZ = gzd.z[2]
        let hourG = gzd.g[3]

        while (startJD < month.end) {
            columns.push({date: julian2solar(startJD).slice(0, 3), g: dayG, z: dayZ, hourG: hourG})
            dayG = nextG(dayG)
            dayZ = nextZ(dayZ)
            hourG = (hourG + 12) % 10
            startJD += 1
        }

        return columns
    }


    /**
     * 起始的子时对应的时干
     * @param hourG
     * @returns {*[]}
     */
    static hour(hourG) {
        let start = -1;
        let z = 0
        const columns = []
        while (start < 12) {
            columns.push({
                g: hourG,
                z: z,
                tips: 2 * start + 1 + '-' + (2 * (start + 1) + 1) + '时',
            })
            hourG = nextG(hourG)
            z = nextZ(z)
            start += 1
        }
        columns[0].tips = '0-1时'
        columns[12].tips = '23-24时'
        return columns
    }
}

// 实仁排盘所需的切割器
export class Cutter {
    /**
     * 流年(点击大运需要展开的数据)
     * @param start 开始的年份数组
     * @param end 结束的年份数组
     * @returns {(*|number)[]} 第一个为开始年份，第二个参数为计算尺度
     */
    static yearRange(start, end) {
        let sy = start[0]
        let ey = end[0]
        const spr = spring(start[0])
        if (solar2julian(...start) < spr) { // 当前开始时间在当年春分点之前，需要往前多显示一年
            const s = julian2solar(spr)
            if (!(s[0] === start[0] && s[1] === start[1] && s[2] === start[2])) { // 和立春不是同一天
                sy -= 1
                if (sy === 0) { // 公元0年不存在，向前偏移到公元前1年
                    sy = -1
                }
            }
        }
        const endJd = solar2julian(...end)

        if (endJd < spring(end[0])) { // 结束时间在今年春分点之前，则今年无需显示
            ey -= 1
        } else { // 如果在今年春分点以后，也有可能到下年
            if (spring(ey + 1) < endJd) { // 结束时间 在下一年的春分点之后，需要往后多显示一年
                ey += 1
            }
        }
        return [sy, ey - sy + 1]
    }

    /**
     * 使用时间范围对months进行切割
     * @param months 月份配置
     * @param start 开始日期
     * @param end 结束日期
     * @returns {*}
     */
    static month(months, start, end) {
        const startJD = solar2julian(...start)
        const endJD = solar2julian(...end)
        const interval = [months[0].start, months[months.length - 1].end]

        if (interval[0] < startJD && startJD < interval[1]) { // 开始时间在今年
            months = months.filter((v) => {
                if (v.end < startJD) {
                    return false
                }
                if (v.start < startJD) {
                    v.start = startJD
                    return true
                }
                return true
            })
        }

        if (interval[0] < endJD && endJD < interval[1]) { // 结束时间在今年
            months = months.filter((v) => {
                if (v.end < endJD) {
                    return true
                }
                if (v.start < endJD) {
                    v.end = endJD
                    return true
                }
                return false
            })
        }
        return months
    }
}
