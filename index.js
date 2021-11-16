"use strict";

// 定义基础

// 获取排盘基本信息

import {EColor, Element, Gan, Opposite, SolarIterm, Spirits10, Spirits5, Zhi, ZwG} from "./definition.js";
import {g2e, nextG, nextZ, spirit, z2e} from "./algorithm.js";
import {gzi, lunar2solar, solarMonthHasDays, yearJieQi} from "shiren-calendar";

// 索引转文字
export class Str {
    /**
     * @returns string
     * @param arg 阴阳
     */
    static o(...arg) {return this.stringify(arg, Opposite)}
    /**
     * @returns string
     * @param arg 五行
     */
    static e(...arg) {return this.stringify(arg, Element)}
    /**
     * @returns string
     * @param arg 天干
     */
    static g(...arg) {return this.stringify(arg, Gan)}
    /**
     * @returns string
     * @param arg 地址
     */
    static z(...arg) {return this.stringify(arg, Zhi)}
    /**
     * @returns string
     * @param arg 五神
     */
    static spirits(...arg) {return this.stringify(arg, Spirits5)}

    /**
     * @returns string
     * @param arg 十神
     */
    static spirits10(...arg) {return this.stringify(arg, Spirits10)}

    static stringify(ps = [], map = [], delimiter = '') {
        ps[0] = map[ps[0]]
        return ps.reduce((p, c) => {return `${p}${delimiter}${map[c]}`})
    }
}

// 构造器
export class Builder {
    // 构造天干信息
    static g(is)  {
        const dg = is[2]
        const dge = g2e(dg)
        return is.map((v) => {
            let e = g2e(v)
            let color = EColor[e]
            return {
                name: Str.g(v),
                color: color,
                element: [{name: Str.e(e), color: color}],
                spirit: [{name: Str.spirits10(2 * spirit(dge, e) + (v % 2 === dg % 2)), color: color}]
            }
        })
    }
    // 构造地址信息
    static z(is, dg)  {
        const dge = g2e(dg)
        return is.map((v) => {
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
                config.g.push({
                    name: Str.g(i),
                    color: color
                })
                config.element.push({
                    name: Str.e(e),
                    color: color
                })
                config.spirit.push({
                    name: Str.spirits10(2 * spirit(dge, e) + (i % 2 === dg % 2)),
                    color: color
                })
            })
            return config;
        })
    }

    /**
     * 流年
     * @param year
     * @param size
     * @returns {*[]}
     */
    static year(year, size=10) {
        const yearGZ = ((year + 4712 + 24) % 60 + 60) % 60;
        const columns = []
        let g = yearGZ % 10
        let z = yearGZ % 10

        let i = 0
        do {
            columns.push({g, z})
            g = nextG(g)
            z = nextZ(z)
            i++
        } while (i<size)

        return columns
    }

    /**
     * 流月
     * @param year
     * @returns {{g: *, z: *, tip: string}[]}
     */
    static month(year) {
        const si = yearJieQi(year)
        const gzd = gzi(si[0].year, si[0].month, si[0].day, 0)
        let g = gzd.g[1]
        let z = gzd.z[1]
        return si.map((v, index) => {
          let d = {g: g, z: z, tip: v.month + '月' + SolarIterm[index], dd: v.dd}
          g = nextG(g)
          z = nextZ(z)
          return d
        })
    }

    /**
     * 流日
     * @param year
     * @param month
     * @param startDay
     * @param delimiterDay
     * @returns {*[]}
     */
    static day(year, month, startDay, delimiterDay) {
        let dayN = solarMonthHasDays(year, month)

        const gzd = gzi(year, month, startDay, 0)
        let dayG = gzd.g[2]
        let dayZ = gzd.z[2]
        let hourG = gzd.g[3]

        const columns = []
        let nextStartDay = startDay - dayN;
        while (startDay < dayN || nextStartDay < delimiterDay) {
            let m, d
            if (nextStartDay > 0) {
                m = (month + 1) % 13
                d = nextStartDay
            } else {
                d = startDay
                m = month
            }
            columns.push({tips: m + '月' + d + '日', g: dayG, z: dayZ, hourG: hourG})
            dayG = nextG(dayG)
            dayZ = nextZ(dayZ)
            hourG = (hourG + 12) % 10
            startDay++
            nextStartDay++
        }
        return columns
    }
    static hour(hourG) {
        let start = -1;
        let z = 0
        const columns = []
        while (start < 12) {
            columns.push({
                g: hourG,
                z: z,
                tips:  2 * start + 1 + '-' + (2 * (start + 1) + 1) + '时' ,
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
