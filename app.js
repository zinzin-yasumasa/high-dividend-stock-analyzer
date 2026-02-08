/**
 * =============================================
 * 高配当株分析システム — メインアプリケーション
 * Dividend Stock Analyzer
 * 
 * 公認会計士の専門知識に基づく投資適格性判定
 * =============================================
 */

'use strict';

/* =============================================
   セクション1: サンプル財務データ
   複数銘柄の年度別財務データ（最低5年分）
   ============================================= */

const stocksData = {
    "9843": {
        name: "ニトリホールディングス",
        sector: "小売業",
        yearlyData: [
            {
                fiscalYear: "2017年02月",
                sales: 512958,
                operatingMargin: 16.72,
                eps: 540.9,
                operatingCF: 77930,
                dividend: 82,
                payoutRatio: 15.2,
                equityRatio: 80.7,
                cash: 66035
            },
            {
                fiscalYear: "2018年02月",
                sales: 572060,
                operatingMargin: 16.32,
                eps: 574.5,
                operatingCF: 76840,
                dividend: 92,
                payoutRatio: 16.0,
                equityRatio: 80.1,
                cash: 60923
            },
            {
                fiscalYear: "2019年02月",
                sales: 608131,
                operatingMargin: 16.58,
                eps: 626.4,
                operatingCF: 81280,
                dividend: 108,
                payoutRatio: 17.2,
                equityRatio: 80.5,
                cash: 56182
            },
            {
                fiscalYear: "2020年02月",
                sales: 642273,
                operatingMargin: 16.43,
                eps: 653.1,
                operatingCF: 95110,
                dividend: 117,
                payoutRatio: 17.9,
                equityRatio: 79.8,
                cash: 71025
            },
            {
                fiscalYear: "2021年02月",
                sales: 716900,
                operatingMargin: 17.42,
                eps: 790.2,
                operatingCF: 130450,
                dividend: 140,
                payoutRatio: 17.7,
                equityRatio: 78.3,
                cash: 138400
            },
            {
                fiscalYear: "2022年02月",
                sales: 811581,
                operatingMargin: 16.64,
                eps: 838.5,
                operatingCF: 98750,
                dividend: 147,
                payoutRatio: 17.5,
                equityRatio: 53.2,
                cash: 79500
            },
            {
                fiscalYear: "2023年02月",
                sales: 895263,
                operatingMargin: 12.88,
                eps: 605.3,
                operatingCF: 88120,
                dividend: 152,
                payoutRatio: 25.1,
                equityRatio: 49.8,
                cash: 64230
            },
            {
                fiscalYear: "2024年02月",
                sales: 936310,
                operatingMargin: 13.12,
                eps: 644.8,
                operatingCF: 102300,
                dividend: 157,
                payoutRatio: 24.3,
                equityRatio: 51.4,
                cash: 72450
            },
            {
                fiscalYear: "2025年02月",
                sales: 980150,
                operatingMargin: 14.05,
                eps: 698.2,
                operatingCF: 112800,
                dividend: 165,
                payoutRatio: 23.6,
                equityRatio: 52.8,
                cash: 85300
            }
        ]
    },
    "8591": {
        name: "オリックス",
        sector: "その他金融業",
        yearlyData: [
            {
                fiscalYear: "2017年03月",
                sales: 2862771,
                operatingMargin: 10.2,
                eps: 209.8,
                operatingCF: 432100,
                dividend: 52.25,
                payoutRatio: 24.9,
                equityRatio: 23.1,
                cash: 1021500
            },
            {
                fiscalYear: "2018年03月",
                sales: 2862762,
                operatingMargin: 11.1,
                eps: 237.2,
                operatingCF: 385400,
                dividend: 66,
                payoutRatio: 27.8,
                equityRatio: 23.5,
                cash: 985200
            },
            {
                fiscalYear: "2019年03月",
                sales: 2434864,
                operatingMargin: 10.5,
                eps: 222.6,
                operatingCF: 398200,
                dividend: 76,
                payoutRatio: 34.1,
                equityRatio: 24.2,
                cash: 1052000
            },
            {
                fiscalYear: "2020年03月",
                sales: 2280329,
                operatingMargin: 9.8,
                eps: 164.3,
                operatingCF: 312500,
                dividend: 76,
                payoutRatio: 46.3,
                equityRatio: 24.8,
                cash: 1125000
            },
            {
                fiscalYear: "2021年03月",
                sales: 2292708,
                operatingMargin: 8.6,
                eps: 156.7,
                operatingCF: 425800,
                dividend: 78,
                payoutRatio: 49.8,
                equityRatio: 25.1,
                cash: 1205000
            },
            {
                fiscalYear: "2022年03月",
                sales: 2520067,
                operatingMargin: 12.3,
                eps: 252.4,
                operatingCF: 510300,
                dividend: 85.6,
                payoutRatio: 33.9,
                equityRatio: 26.4,
                cash: 1340000
            },
            {
                fiscalYear: "2023年03月",
                sales: 2562527,
                operatingMargin: 11.8,
                eps: 266.3,
                operatingCF: 487200,
                dividend: 94,
                payoutRatio: 35.3,
                equityRatio: 27.2,
                cash: 1285000
            },
            {
                fiscalYear: "2024年03月",
                sales: 2705318,
                operatingMargin: 12.1,
                eps: 285.5,
                operatingCF: 523400,
                dividend: 98.6,
                payoutRatio: 34.5,
                equityRatio: 28.1,
                cash: 1410000
            },
            {
                fiscalYear: "2025年03月",
                sales: 2850200,
                operatingMargin: 12.5,
                eps: 302.1,
                operatingCF: 548000,
                dividend: 104,
                payoutRatio: 34.4,
                equityRatio: 28.9,
                cash: 1520000
            }
        ]
    },
    "8766": {
        name: "東京海上ホールディングス",
        sector: "保険業",
        yearlyData: [
            {
                fiscalYear: "2017年03月",
                sales: 5325600,
                operatingMargin: 6.2,
                eps: 324.5,
                operatingCF: 498200,
                dividend: 140,
                payoutRatio: 43.1,
                equityRatio: 15.8,
                cash: 1120000
            },
            {
                fiscalYear: "2018年03月",
                sales: 5399512,
                operatingMargin: 6.8,
                eps: 361.2,
                operatingCF: 522100,
                dividend: 160,
                payoutRatio: 44.3,
                equityRatio: 16.2,
                cash: 1085000
            },
            {
                fiscalYear: "2019年03月",
                sales: 5447288,
                operatingMargin: 5.9,
                eps: 305.4,
                operatingCF: 478300,
                dividend: 180,
                payoutRatio: 58.9,
                equityRatio: 15.9,
                cash: 1043000
            },
            {
                fiscalYear: "2020年03月",
                sales: 5465432,
                operatingMargin: 5.1,
                eps: 258.7,
                operatingCF: 510200,
                dividend: 200,
                payoutRatio: 77.3,
                equityRatio: 15.4,
                cash: 1210000
            },
            {
                fiscalYear: "2021年03月",
                sales: 5461200,
                operatingMargin: 5.8,
                eps: 295.3,
                operatingCF: 545000,
                dividend: 215,
                payoutRatio: 72.8,
                equityRatio: 16.1,
                cash: 1352000
            },
            {
                fiscalYear: "2022年03月",
                sales: 5863460,
                operatingMargin: 7.2,
                eps: 428.6,
                operatingCF: 612500,
                dividend: 250,
                payoutRatio: 58.3,
                equityRatio: 17.5,
                cash: 1428000
            },
            {
                fiscalYear: "2023年03月",
                sales: 6558420,
                operatingMargin: 7.8,
                eps: 482.1,
                operatingCF: 685200,
                dividend: 300,
                payoutRatio: 62.2,
                equityRatio: 18.2,
                cash: 1502000
            },
            {
                fiscalYear: "2024年03月",
                sales: 6950800,
                operatingMargin: 8.5,
                eps: 545.8,
                operatingCF: 725000,
                dividend: 360,
                payoutRatio: 65.9,
                equityRatio: 19.1,
                cash: 1580000
            },
            {
                fiscalYear: "2025年03月",
                sales: 7280000,
                operatingMargin: 9.1,
                eps: 598.3,
                operatingCF: 768000,
                dividend: 420,
                payoutRatio: 70.2,
                equityRatio: 19.8,
                cash: 1650000
            }
        ]
    },
    "2914": {
        name: "日本たばこ産業",
        sector: "食料品",
        yearlyData: [
            {
                fiscalYear: "2017年12月",
                sales: 2139653,
                operatingMargin: 24.1,
                eps: 195.3,
                operatingCF: 478000,
                dividend: 140,
                payoutRatio: 71.7,
                equityRatio: 48.5,
                cash: 352000
            },
            {
                fiscalYear: "2018年12月",
                sales: 2215962,
                operatingMargin: 25.3,
                eps: 215.8,
                operatingCF: 510200,
                dividend: 150,
                payoutRatio: 69.5,
                equityRatio: 47.2,
                cash: 328000
            },
            {
                fiscalYear: "2019年12月",
                sales: 2175626,
                operatingMargin: 23.8,
                eps: 185.2,
                operatingCF: 465300,
                dividend: 154,
                payoutRatio: 83.2,
                equityRatio: 46.8,
                cash: 298000
            },
            {
                fiscalYear: "2020年12月",
                sales: 2092561,
                operatingMargin: 24.5,
                eps: 173.6,
                operatingCF: 498500,
                dividend: 154,
                payoutRatio: 88.7,
                equityRatio: 46.2,
                cash: 412000
            },
            {
                fiscalYear: "2021年12月",
                sales: 2324838,
                operatingMargin: 25.2,
                eps: 182.1,
                operatingCF: 512300,
                dividend: 140,
                payoutRatio: 76.9,
                equityRatio: 45.8,
                cash: 385000
            },
            {
                fiscalYear: "2022年12月",
                sales: 2657832,
                operatingMargin: 24.8,
                eps: 215.4,
                operatingCF: 532100,
                dividend: 188,
                payoutRatio: 87.3,
                equityRatio: 47.5,
                cash: 358000
            },
            {
                fiscalYear: "2023年12月",
                sales: 2843910,
                operatingMargin: 25.5,
                eps: 242.8,
                operatingCF: 568400,
                dividend: 194,
                payoutRatio: 79.9,
                equityRatio: 48.8,
                cash: 392000
            },
            {
                fiscalYear: "2024年12月",
                sales: 2985200,
                operatingMargin: 26.1,
                eps: 265.3,
                operatingCF: 595000,
                dividend: 206,
                payoutRatio: 77.6,
                equityRatio: 49.5,
                cash: 425000
            },
            {
                fiscalYear: "2025年12月",
                sales: 3102000,
                operatingMargin: 26.8,
                eps: 285.1,
                operatingCF: 622000,
                dividend: 220,
                payoutRatio: 77.2,
                equityRatio: 50.2,
                cash: 458000
            }
        ]
    },
    "9433": {
        name: "KDDI",
        sector: "情報・通信業",
        yearlyData: [
            {
                fiscalYear: "2017年03月",
                sales: 4748259,
                operatingMargin: 19.6,
                eps: 262.5,
                operatingCF: 968400,
                dividend: 85,
                payoutRatio: 32.4,
                equityRatio: 58.2,
                cash: 215800
            },
            {
                fiscalYear: "2018年03月",
                sales: 5041978,
                operatingMargin: 19.8,
                eps: 283.1,
                operatingCF: 1025000,
                dividend: 90,
                payoutRatio: 31.8,
                equityRatio: 57.5,
                cash: 198500
            },
            {
                fiscalYear: "2019年03月",
                sales: 5080353,
                operatingMargin: 19.9,
                eps: 298.5,
                operatingCF: 1045000,
                dividend: 105,
                payoutRatio: 35.2,
                equityRatio: 59.1,
                cash: 225000
            },
            {
                fiscalYear: "2020年03月",
                sales: 5237221,
                operatingMargin: 19.5,
                eps: 295.8,
                operatingCF: 1078000,
                dividend: 115,
                payoutRatio: 38.9,
                equityRatio: 58.8,
                cash: 312000
            },
            {
                fiscalYear: "2021年03月",
                sales: 5312599,
                operatingMargin: 19.4,
                eps: 288.6,
                operatingCF: 1120000,
                dividend: 120,
                payoutRatio: 41.6,
                equityRatio: 60.2,
                cash: 345000
            },
            {
                fiscalYear: "2022年03月",
                sales: 5446708,
                operatingMargin: 19.2,
                eps: 305.2,
                operatingCF: 1085000,
                dividend: 125,
                payoutRatio: 40.9,
                equityRatio: 45.6,
                cash: 328000
            },
            {
                fiscalYear: "2023年03月",
                sales: 5671762,
                operatingMargin: 18.8,
                eps: 312.5,
                operatingCF: 1105000,
                dividend: 135,
                payoutRatio: 43.2,
                equityRatio: 46.2,
                cash: 352000
            },
            {
                fiscalYear: "2024年03月",
                sales: 5892100,
                operatingMargin: 19.1,
                eps: 328.4,
                operatingCF: 1152000,
                dividend: 140,
                payoutRatio: 42.6,
                equityRatio: 47.5,
                cash: 382000
            },
            {
                fiscalYear: "2025年03月",
                sales: 6105000,
                operatingMargin: 19.5,
                eps: 345.2,
                operatingCF: 1195000,
                dividend: 145,
                payoutRatio: 42.0,
                equityRatio: 48.2,
                cash: 410000
            }
        ]
    },
    "4502": {
        name: "武田薬品工業",
        sector: "医薬品",
        yearlyData: [
            {
                fiscalYear: "2017年03月",
                sales: 1732051,
                operatingMargin: 12.5,
                eps: 68.2,
                operatingCF: 285000,
                dividend: 180,
                payoutRatio: 263.9,
                equityRatio: 42.5,
                cash: 382000
            },
            {
                fiscalYear: "2018年03月",
                sales: 1770531,
                operatingMargin: 11.8,
                eps: 102.5,
                operatingCF: 312000,
                dividend: 180,
                payoutRatio: 175.6,
                equityRatio: 41.8,
                cash: 358000
            },
            {
                fiscalYear: "2019年03月",
                sales: 2097224,
                operatingMargin: 4.2,
                eps: -52.3,
                operatingCF: 198000,
                dividend: 180,
                payoutRatio: -344.2,
                equityRatio: 34.2,
                cash: 685000
            },
            {
                fiscalYear: "2020年03月",
                sales: 3291188,
                operatingMargin: 6.8,
                eps: 45.8,
                operatingCF: 812000,
                dividend: 180,
                payoutRatio: 393.0,
                equityRatio: 32.5,
                cash: 625000
            },
            {
                fiscalYear: "2021年03月",
                sales: 3197812,
                operatingMargin: 8.5,
                eps: 85.2,
                operatingCF: 915000,
                dividend: 180,
                payoutRatio: 211.3,
                equityRatio: 35.8,
                cash: 542000
            },
            {
                fiscalYear: "2022年03月",
                sales: 3569006,
                operatingMargin: 10.2,
                eps: 142.3,
                operatingCF: 985000,
                dividend: 180,
                payoutRatio: 126.5,
                equityRatio: 38.2,
                cash: 498000
            },
            {
                fiscalYear: "2023年03月",
                sales: 4027478,
                operatingMargin: 7.5,
                eps: 95.8,
                operatingCF: 1052000,
                dividend: 180,
                payoutRatio: 187.9,
                equityRatio: 36.5,
                cash: 452000
            },
            {
                fiscalYear: "2024年03月",
                sales: 4263762,
                operatingMargin: 8.1,
                eps: 112.5,
                operatingCF: 1105000,
                dividend: 188,
                payoutRatio: 167.1,
                equityRatio: 37.8,
                cash: 485000
            },
            {
                fiscalYear: "2025年03月",
                sales: 4480000,
                operatingMargin: 8.8,
                eps: 128.5,
                operatingCF: 1150000,
                dividend: 196,
                payoutRatio: 152.5,
                equityRatio: 39.1,
                cash: 520000
            }
        ]
    }
};


/* =============================================
   セクション2: 純粋関数 — 計算・判定ロジック
   （副作用なし、テスト可能な純粋関数群）
   ============================================= */

/**
 * 前年比増加判定
 * @param {number} current - 当年の値
 * @param {number} previous - 前年の値
 * @returns {boolean} 増加していればtrue
 */
function isIncreasing(current, previous) {
    if (typeof current !== 'number' || typeof previous !== 'number') return false;
    return current > previous;
}

/**
 * 配列の特定キーの平均値計算
 * @param {Array<Object>} dataArray - データ配列
 * @param {string} key - 平均計算するフィールド名
 * @returns {number} 平均値
 */
function calculateAverage(dataArray, key) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return 0;
    const validValues = dataArray.filter(d => typeof d[key] === 'number');
    if (validValues.length === 0) return 0;
    const sum = validValues.reduce((acc, d) => acc + d[key], 0);
    return sum / validValues.length;
}

/**
 * N年連続増加判定
 * @param {Array<Object>} yearlyData - 年度別データ（時系列順）
 * @param {string} key - 判定するフィールド名
 * @param {number} years - 連続年数
 * @returns {boolean} N年連続増加していればtrue
 */
function isConsecutiveIncrease(yearlyData, key, years) {
    if (!Array.isArray(yearlyData) || yearlyData.length < years + 1) return false;
    const recent = yearlyData.slice(-(years + 1));
    for (let i = 1; i < recent.length; i++) {
        if (recent[i][key] <= recent[i - 1][key]) return false;
    }
    return true;
}

/**
 * N年連続黒字判定
 * @param {Array<Object>} yearlyData - 年度別データ
 * @param {string} key - 判定するフィールド名
 * @param {number} years - 連続年数
 * @returns {boolean} N年連続黒字ならtrue
 */
function isConsecutivePositive(yearlyData, key, years) {
    if (!Array.isArray(yearlyData) || yearlyData.length < years) return false;
    const recent = yearlyData.slice(-years);
    return recent.every(d => typeof d[key] === 'number' && d[key] > 0);
}

/**
 * N年連続維持or増加判定（配当用）
 * @param {Array<Object>} yearlyData - 年度別データ
 * @param {string} key - 判定するフィールド名
 * @param {number} years - 連続年数
 * @returns {boolean}
 */
function isConsecutiveMaintainedOrIncreased(yearlyData, key, years) {
    if (!Array.isArray(yearlyData) || yearlyData.length < years + 1) return false;
    const recent = yearlyData.slice(-(years + 1));
    for (let i = 1; i < recent.length; i++) {
        if (recent[i][key] < recent[i - 1][key]) return false;
    }
    return true;
}

/**
 * 売上高判定
 * @param {number} current - 当年売上
 * @param {number} previous - 前年売上（null可）
 * @returns {string} 'good' | 'danger' | 'neutral'
 */
function assessSales(current, previous) {
    if (previous === null || previous === undefined) return 'neutral';
    return isIncreasing(current, previous) ? 'good' : 'danger';
}

/**
 * 営業利益率判定
 * @param {number} margin - 営業利益率(%)
 * @returns {string} 'good' | 'danger' | 'neutral'
 */
function assessOperatingMargin(margin) {
    if (typeof margin !== 'number') return 'neutral';
    if (margin >= 10) return 'good';
    if (margin < 0) return 'danger';
    return 'neutral';
}

/**
 * EPS判定
 * @param {number} current - 当年EPS
 * @param {number} previous - 前年EPS（null可）
 * @returns {string} 'good' | 'danger' | 'neutral'
 */
function assessEPS(current, previous) {
    if (previous === null || previous === undefined) return 'neutral';
    return isIncreasing(current, previous) ? 'good' : 'danger';
}

/**
 * 営業CF判定
 * @param {number} cf - 営業キャッシュフロー
 * @returns {string} 'good' | 'danger'
 */
function assessOperatingCF(cf) {
    return cf > 0 ? 'good' : 'danger';
}

/**
 * 1株配当判定
 * @param {number} current - 当年配当
 * @param {number} previous - 前年配当（null可）
 * @returns {string} 'good' | 'danger' | 'neutral'
 */
function assessDividend(current, previous) {
    if (previous === null || previous === undefined) return 'neutral';
    return current >= previous ? 'good' : 'danger';
}

/**
 * 配当性向判定
 * @param {number} ratio - 配当性向(%)
 * @returns {string} 'good' | 'danger' | 'neutral'
 */
function assessPayoutRatio(ratio) {
    if (typeof ratio !== 'number') return 'neutral';
    if (ratio >= 30 && ratio <= 50) return 'good';
    if (ratio < 0 || ratio > 80) return 'danger';
    return 'neutral';
}

/**
 * 自己資本比率判定
 * @param {number} ratio - 自己資本比率(%)
 * @returns {string} 'good' | 'neutral'
 */
function assessEquityRatio(ratio) {
    return ratio >= 40 ? 'good' : 'neutral';
}

/**
 * 現金等判定
 * @param {number} current - 当年現金等
 * @param {number} previous - 前年現金等（null可）
 * @returns {string} 'good' | 'danger' | 'neutral'
 */
function assessCash(current, previous) {
    if (previous === null || previous === undefined) return 'neutral';
    return isIncreasing(current, previous) ? 'good' : 'danger';
}


/* =============================================
   セクション3: 投資適格性スコアリング（100点満点）
   
   公認会計士の専門知識に基づく4カテゴリ評価:
   - 成長性評価（30点）
   - 収益性評価（20点）
   - 配当安定性評価（30点）
   - 財務健全性評価（20点）
   ============================================= */

/**
 * 投資適格性スコア計算（メインロジック）
 * @param {Object} stock - 銘柄データ
 * @returns {Object} { total, breakdown: { growth, profitability, dividend, financial } }
 */
function calculateInvestmentScore(stock) {
    const yearlyData = stock.yearlyData;
    const breakdown = {
        growth: { score: 0, max: 30, details: [] },
        profitability: { score: 0, max: 20, details: [] },
        dividend: { score: 0, max: 30, details: [] },
        financial: { score: 0, max: 20, details: [] }
    };

    // ---- 成長性評価（30点） ----

    // 売上高3年連続増加（10点）
    const salesGrowth = isConsecutiveIncrease(yearlyData, 'sales', 3);
    if (salesGrowth) {
        breakdown.growth.score += 10;
        breakdown.growth.details.push({ text: '売上高3年連続増加', achieved: true });
    } else {
        breakdown.growth.details.push({ text: '売上高3年連続増加', achieved: false });
    }

    // EPS3年連続増加（10点）
    const epsGrowth = isConsecutiveIncrease(yearlyData, 'eps', 3);
    if (epsGrowth) {
        breakdown.growth.score += 10;
        breakdown.growth.details.push({ text: 'EPS3年連続増加', achieved: true });
    } else {
        breakdown.growth.details.push({ text: 'EPS3年連続増加', achieved: false });
    }

    // 営業CF3年連続黒字（10点）
    const cfPositive = isConsecutivePositive(yearlyData, 'operatingCF', 3);
    if (cfPositive) {
        breakdown.growth.score += 10;
        breakdown.growth.details.push({ text: '営業CF3年連続黒字', achieved: true });
    } else {
        breakdown.growth.details.push({ text: '営業CF3年連続黒字', achieved: false });
    }

    // ---- 収益性評価（20点） ----

    // 直近3年平均営業利益率 >= 10%（20点）
    const recentThreeYears = yearlyData.slice(-3);
    const avgMargin = calculateAverage(recentThreeYears, 'operatingMargin');
    if (avgMargin >= 10) {
        breakdown.profitability.score += 20;
        breakdown.profitability.details.push({
            text: `直近3年平均営業利益率 ${avgMargin.toFixed(1)}% (≥10%)`,
            achieved: true
        });
    } else {
        breakdown.profitability.details.push({
            text: `直近3年平均営業利益率 ${avgMargin.toFixed(1)}% (≥10%未達)`,
            achieved: false
        });
    }

    // ---- 配当安定性評価（30点） ----

    // 1株配当3年連続維持or増加（15点）
    const dividendStable = isConsecutiveMaintainedOrIncreased(yearlyData, 'dividend', 3);
    if (dividendStable) {
        breakdown.dividend.score += 15;
        breakdown.dividend.details.push({ text: '1株配当3年連続維持or増加', achieved: true });
    } else {
        breakdown.dividend.details.push({ text: '1株配当3年連続維持or増加', achieved: false });
    }

    // 配当性向30-50%範囲内（直近年度）（15点）
    const latestPayout = yearlyData[yearlyData.length - 1].payoutRatio;
    if (latestPayout >= 30 && latestPayout <= 50) {
        breakdown.dividend.score += 15;
        breakdown.dividend.details.push({
            text: `配当性向 ${latestPayout.toFixed(1)}% (30-50%範囲内)`,
            achieved: true
        });
    } else {
        breakdown.dividend.details.push({
            text: `配当性向 ${latestPayout.toFixed(1)}% (30-50%範囲外)`,
            achieved: false
        });
    }

    // ---- 財務健全性評価（20点） ----

    // 自己資本比率 >= 40%（10点）
    const latestEquity = yearlyData[yearlyData.length - 1].equityRatio;
    if (latestEquity >= 40) {
        breakdown.financial.score += 10;
        breakdown.financial.details.push({
            text: `自己資本比率 ${latestEquity.toFixed(1)}% (≥40%)`,
            achieved: true
        });
    } else {
        breakdown.financial.details.push({
            text: `自己資本比率 ${latestEquity.toFixed(1)}% (≥40%未達)`,
            achieved: false
        });
    }

    // 現金等前年比増加（10点）
    const latestCash = yearlyData[yearlyData.length - 1].cash;
    const prevCash = yearlyData[yearlyData.length - 2].cash;
    if (isIncreasing(latestCash, prevCash)) {
        breakdown.financial.score += 10;
        breakdown.financial.details.push({ text: '現金等前年比増加', achieved: true });
    } else {
        breakdown.financial.details.push({ text: '現金等前年比増加', achieved: false });
    }

    const total = breakdown.growth.score
        + breakdown.profitability.score
        + breakdown.dividend.score
        + breakdown.financial.score;

    return { total, breakdown };
}

/**
 * スコアランク判定
 * @param {number} score - 投資適格性スコア
 * @returns {Object} { rank, label, cssClass, color }
 */
function getScoreRank(score) {
    if (score >= 90) return { rank: 'A+', label: '優良', cssClass: 'status-excellent', color: 'var(--rank-excellent)' };
    if (score >= 70) return { rank: 'A', label: '良好', cssClass: 'status-good', color: 'var(--rank-good)' };
    if (score >= 50) return { rank: 'B', label: '要注意', cssClass: 'status-warning', color: 'var(--rank-caution)' };
    return { rank: 'C', label: '投資非推奨', cssClass: 'status-danger', color: 'var(--rank-poor)' };
}


/* =============================================
   セクション4: リスク警告システム
   ============================================= */

/**
 * リスク警告判定
 * @param {Object} stock - 銘柄データ
 * @returns {Array<Object>} リスク警告リスト
 */
function detectRisks(stock) {
    const risks = [];
    const yearlyData = stock.yearlyData;
    const latest = yearlyData[yearlyData.length - 1];

    // 配当性向80%超 → "減配リスクあり"
    if (latest.payoutRatio > 80) {
        risks.push({
            icon: 'fas fa-scissors',
            title: '減配リスクあり',
            description: `配当性向が ${latest.payoutRatio.toFixed(1)}% と高水準です（80%超）。利益の大部分を配当に充てており、業績悪化時に減配の可能性があります。`,
            severity: 'high'
        });
    }

    // 営業利益率マイナス → "本業赤字"
    if (latest.operatingMargin < 0) {
        risks.push({
            icon: 'fas fa-chart-line',
            title: '本業赤字',
            description: `営業利益率が ${latest.operatingMargin.toFixed(2)}% でマイナスです。本業での収益獲得に課題があり、構造的な問題の可能性があります。`,
            severity: 'critical'
        });
    }

    // 自己資本比率30%未満 → "財務脆弱"
    if (latest.equityRatio < 30) {
        risks.push({
            icon: 'fas fa-building-shield',
            title: '財務脆弱',
            description: `自己資本比率が ${latest.equityRatio.toFixed(1)}% と低水準です（30%未満）。負債依存度が高く、金利上昇局面でのリスクがあります。`,
            severity: 'high'
        });
    }

    // 営業CF3年連続赤字 → "資金繰り悪化"
    const recentThree = yearlyData.slice(-3);
    const cfAllNegative = recentThree.every(d => d.operatingCF < 0);
    if (cfAllNegative) {
        risks.push({
            icon: 'fas fa-money-bill-transfer',
            title: '資金繰り悪化',
            description: '営業キャッシュフローが3年連続で赤字です。事業運営からの現金創出力に深刻な問題があります。',
            severity: 'critical'
        });
    }

    // 追加リスク: 配当性向がマイナス（EPSがマイナス時）
    if (latest.payoutRatio < 0) {
        risks.push({
            icon: 'fas fa-circle-exclamation',
            title: '利益超過配当',
            description: 'EPSがマイナスにもかかわらず配当を実施しています。持続不可能な配当政策の可能性があります。',
            severity: 'critical'
        });
    }

    // 追加リスク: 配当性向100%超（正の場合）
    if (latest.payoutRatio > 100 && latest.payoutRatio > 0) {
        risks.push({
            icon: 'fas fa-piggy-bank',
            title: '利益超過配当',
            description: `配当性向が ${latest.payoutRatio.toFixed(1)}% と100%を超えています。利益以上の配当を行っており、内部留保の取り崩しまたは借入による配当の可能性があります。`,
            severity: 'critical'
        });
    }

    return risks;
}


/* =============================================
   セクション5: 数値フォーマット
   ============================================= */

/**
 * 百万円単位の数値をカンマ区切りで表示
 * @param {number} value - 数値（百万円単位）
 * @returns {string} フォーマット文字列
 */
function formatMillions(value) {
    if (typeof value !== 'number') return '--';
    return value.toLocaleString('ja-JP');
}

/**
 * パーセント表示
 * @param {number} value - 数値
 * @param {number} decimals - 小数点以下桁数
 * @returns {string}
 */
function formatPercent(value, decimals = 1) {
    if (typeof value !== 'number') return '--';
    return value.toFixed(decimals) + '%';
}

/**
 * 円表示
 * @param {number} value - 数値
 * @param {number} decimals - 小数点以下桁数
 * @returns {string}
 */
function formatYen(value, decimals = 1) {
    if (typeof value !== 'number') return '--';
    return value.toFixed(decimals) + '円';
}

/**
 * 前年比変化率の計算・フォーマット
 * @param {number} current
 * @param {number} previous
 * @returns {Object} { value, formatted, isPositive }
 */
function calculateChange(current, previous) {
    if (typeof current !== 'number' || typeof previous !== 'number' || previous === 0) {
        return { value: 0, formatted: '--', isPositive: null };
    }
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return {
        value: change,
        formatted: (change >= 0 ? '+' : '') + change.toFixed(1) + '%',
        isPositive: change >= 0
    };
}


/* =============================================
   セクション6: UI描画 — DOM操作
   ============================================= */

/**
 * 銘柄情報セクションの描画
 * @param {string} code - 銘柄コード
 * @param {Object} stock - 銘柄データ
 */
function renderStockInfo(code, stock) {
    document.getElementById('stock-code-badge').textContent = code;
    document.getElementById('stock-name').textContent = stock.name;
    document.getElementById('stock-sector').textContent = stock.sector;

    const years = stock.yearlyData;
    const firstYear = years[0].fiscalYear;
    const lastYear = years[years.length - 1].fiscalYear;
    document.getElementById('data-period').textContent = `データ期間: ${firstYear} 〜 ${lastYear}（${years.length}期分）`;
}

/**
 * サマリーカード描画
 * @param {Object} stock - 銘柄データ
 * @param {Object} scoreResult - スコア計算結果
 */
function renderSummaryCards(stock, scoreResult) {
    const yearlyData = stock.yearlyData;
    const latest = yearlyData[yearlyData.length - 1];
    const previous = yearlyData[yearlyData.length - 2];
    const rank = getScoreRank(scoreResult.total);

    // --- スコアカード ---
    const scoreValue = document.getElementById('score-value');
    scoreValue.textContent = scoreResult.total;
    scoreValue.style.color = rank.color;

    const scoreRank = document.getElementById('score-rank');
    scoreRank.textContent = `${rank.rank} — ${rank.label}`;
    scoreRank.className = `score-rank ${rank.cssClass}`;

    // スコア内訳（フッター）
    const bd = scoreResult.breakdown;
    document.getElementById('score-breakdown').innerHTML = `
        <span style="font-size:0.72rem; color:#64748b;">
            成長 ${bd.growth.score}/${bd.growth.max} ｜ 
            収益 ${bd.profitability.score}/${bd.profitability.max} ｜ 
            配当 ${bd.dividend.score}/${bd.dividend.max} ｜ 
            財務 ${bd.financial.score}/${bd.financial.max}
        </span>
    `;

    // スコアカードのトップ線の色を変更
    document.getElementById('card-score').style.borderTopColor = rank.color;

    // --- 売上高カード ---
    document.getElementById('sales-value').textContent = formatMillions(latest.sales) + ' 百万円';
    const salesChange = calculateChange(latest.sales, previous.sales);
    const salesChangeEl = document.getElementById('sales-change');
    salesChangeEl.textContent = `前年比 ${salesChange.formatted}`;
    salesChangeEl.className = `card-sub-value ${salesChange.isPositive ? 'change-positive' : 'change-negative'}`;

    // 売上トレンド（直近3年）
    const salesTrend = isConsecutiveIncrease(yearlyData, 'sales', 3);
    document.getElementById('sales-trend').textContent = salesTrend
        ? '✅ 3年連続増収' : '📊 増収基調ではありません';

    // --- EPSカード ---
    document.getElementById('eps-value').textContent = formatYen(latest.eps);
    const epsChange = calculateChange(latest.eps, previous.eps);
    const epsChangeEl = document.getElementById('eps-change');
    epsChangeEl.textContent = `前年比 ${epsChange.formatted}`;
    epsChangeEl.className = `card-sub-value ${epsChange.isPositive ? 'change-positive' : 'change-negative'}`;

    const epsTrend = isConsecutiveIncrease(yearlyData, 'eps', 3);
    document.getElementById('eps-trend').textContent = epsTrend
        ? '✅ 3年連続増益（EPS）' : '📊 EPS連続増加ではありません';

    // --- 配当カード ---
    document.getElementById('dividend-value').textContent = formatYen(latest.dividend);
    document.getElementById('dividend-payout').textContent = `配当性向 ${formatPercent(latest.payoutRatio)}`;

    const divTrend = isConsecutiveMaintainedOrIncreased(yearlyData, 'dividend', 3);
    document.getElementById('dividend-trend').textContent = divTrend
        ? '✅ 3年連続増配/維持' : '📊 減配履歴あり';
}

/**
 * リスク警告セクション描画
 * @param {Array<Object>} risks - リスク警告リスト
 */
function renderRiskWarnings(risks) {
    const section = document.getElementById('risk-section');
    const list = document.getElementById('risk-list');

    if (risks.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = risks.map(risk => `
        <div class="risk-item">
            <i class="${risk.icon}"></i>
            <div class="risk-item-text">
                <p class="risk-item-title">${risk.title}</p>
                <p class="risk-item-desc">${risk.description}</p>
            </div>
        </div>
    `).join('');
}

/**
 * スコア詳細セクション描画
 * @param {Object} scoreResult - スコア計算結果
 */
function renderScoreDetails(scoreResult) {
    const bd = scoreResult.breakdown;
    const grid = document.getElementById('score-detail-grid');

    const categories = [
        {
            name: '成長性評価',
            icon: 'fas fa-arrow-up-right-dots',
            bgColor: '#eff6ff',
            iconColor: '#3b82f6',
            data: bd.growth
        },
        {
            name: '収益性評価',
            icon: 'fas fa-sack-dollar',
            bgColor: '#fef3c7',
            iconColor: '#d97706',
            data: bd.profitability
        },
        {
            name: '配当安定性評価',
            icon: 'fas fa-hand-holding-dollar',
            bgColor: '#d1fae5',
            iconColor: '#059669',
            data: bd.dividend
        },
        {
            name: '財務健全性評価',
            icon: 'fas fa-shield-halved',
            bgColor: '#fce7f3',
            iconColor: '#db2777',
            data: bd.financial
        }
    ];

    grid.innerHTML = categories.map(cat => {
        const detailsHtml = cat.data.details.map(d =>
            `<span style="font-size:0.7rem; color:${d.achieved ? 'var(--excellent-text)' : '#94a3b8'};">
                ${d.achieved ? '✓' : '✗'} ${d.text}
            </span>`
        ).join('<br>');

        const pointColor = cat.data.score === cat.data.max
            ? 'var(--rank-excellent)'
            : cat.data.score > 0
                ? 'var(--rank-good)'
                : 'var(--rank-poor)';

        return `
            <div class="score-detail-item">
                <div class="score-detail-label">
                    <i class="${cat.icon}" style="background:${cat.bgColor}; color:${cat.iconColor};"></i>
                    <div>
                        <p class="score-detail-name">${cat.name}</p>
                        <div class="score-detail-criteria">${detailsHtml}</div>
                    </div>
                </div>
                <div class="score-detail-points" style="color:${pointColor};">
                    ${cat.data.score}<span class="score-detail-max"> / ${cat.data.max}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 年度別財務データテーブル描画
 * @param {Array<Object>} yearlyData - 年度別データ（時系列順）
 */
function renderDataTable(yearlyData) {
    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');

    // テーブルヘッダー
    thead.innerHTML = `
        <tr>
            <th>決算期</th>
            <th>売上高<br><small>(百万円)</small></th>
            <th>営業利益率<br><small>(%)</small></th>
            <th>EPS<br><small>(円)</small></th>
            <th>営業CF<br><small>(百万円)</small></th>
            <th>1株配当<br><small>(円)</small></th>
            <th>配当性向<br><small>(%)</small></th>
            <th>自己資本比率<br><small>(%)</small></th>
            <th>現金等<br><small>(百万円)</small></th>
        </tr>
    `;

    // テーブルボディ（新しい年度が上）
    const reversed = [...yearlyData].reverse();

    tbody.innerHTML = reversed.map((row, idx) => {
        // 前年データ（reverseされているので idx+1 が前年）
        const prevRow = idx < reversed.length - 1 ? reversed[idx + 1] : null;
        const prev = prevRow || {};

        const salesStatus = assessSales(row.sales, prev.sales);
        const marginStatus = assessOperatingMargin(row.operatingMargin);
        const epsStatus = assessEPS(row.eps, prev.eps);
        const cfStatus = assessOperatingCF(row.operatingCF);
        const divStatus = assessDividend(row.dividend, prev.dividend);
        const payoutStatus = assessPayoutRatio(row.payoutRatio);
        const equityStatus = assessEquityRatio(row.equityRatio);
        const cashStatus = assessCash(row.cash, prev.cash);

        return `
            <tr>
                <td>${row.fiscalYear}</td>
                <td class="cell-${salesStatus}">${formatMillions(row.sales)}</td>
                <td class="cell-${marginStatus}">${formatPercent(row.operatingMargin, 2)}</td>
                <td class="cell-${epsStatus}">${formatYen(row.eps)}</td>
                <td class="cell-${cfStatus}">${formatMillions(row.operatingCF)}</td>
                <td class="cell-${divStatus}">${formatYen(row.dividend)}</td>
                <td class="cell-${payoutStatus}">${formatPercent(row.payoutRatio)}</td>
                <td class="cell-${equityStatus}">${formatPercent(row.equityRatio)}</td>
                <td class="cell-${cashStatus}">${formatMillions(row.cash)}</td>
            </tr>
        `;
    }).join('');
}


/* =============================================
   セクション7: メイン制御 — イベントハンドラ・初期化
   ============================================= */

/**
 * 銘柄コードバリデーション
 * @param {string} code - 入力された銘柄コード
 * @returns {Object} { valid: boolean, message: string }
 */
function validateStockCode(code) {
    if (!code || code.trim() === '') {
        return { valid: false, message: '銘柄コードを入力してください。' };
    }
    if (!/^\d{4}$/.test(code.trim())) {
        return { valid: false, message: '銘柄コードは4桁の数字で入力してください。' };
    }
    if (!stocksData[code.trim()]) {
        const availableCodes = Object.keys(stocksData).join('、');
        return { valid: false, message: `銘柄コード「${code}」のデータが見つかりません。\n登録済み: ${availableCodes}` };
    }
    return { valid: true, message: '' };
}

/**
 * エラーメッセージ表示
 * @param {string} message - エラーメッセージ（空文字でクリア）
 */
function showError(message) {
    const el = document.getElementById('error-message');
    el.textContent = message;
}

/**
 * 分析実行メイン関数
 * @param {string} code - 銘柄コード
 */
function analyzeStock(code) {
    // バリデーション
    const validation = validateStockCode(code);
    if (!validation.valid) {
        showError(validation.message);
        return;
    }

    showError('');
    const stock = stocksData[code.trim()];

    // スコア計算
    const scoreResult = calculateInvestmentScore(stock);

    // リスク検出
    const risks = detectRisks(stock);

    // UI切り替え
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('analysis-result').style.display = 'block';

    // アニメーションのためにリセット
    const resultEl = document.getElementById('analysis-result');
    resultEl.style.animation = 'none';
    // reflow
    void resultEl.offsetHeight;
    resultEl.style.animation = 'fadeIn 0.4s ease';

    // 各セクション描画
    renderStockInfo(code.trim(), stock);
    renderSummaryCards(stock, scoreResult);
    renderRiskWarnings(risks);
    renderScoreDetails(scoreResult);
    renderDataTable(stock.yearlyData);

    // 入力フィールドに値を反映
    document.getElementById('stock-code').value = code.trim();

    // LocalStorageに最後に分析した銘柄を保存
    try {
        localStorage.setItem('lastAnalyzedStock', code.trim());
    } catch (e) {
        // LocalStorage利用不可の場合は無視
    }

    // スムーズスクロール
    document.getElementById('stock-info-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * クイック選択ボタン生成
 */
function renderQuickButtons() {
    const container = document.getElementById('quick-buttons');
    const entries = Object.entries(stocksData);

    container.innerHTML = entries.map(([code, stock]) =>
        `<button class="quick-btn" data-code="${code}" title="${stock.name}（${stock.sector}）">
            ${code} ${stock.name}
        </button>`
    ).join('');

    // イベント委譲
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.quick-btn');
        if (btn) {
            const code = btn.dataset.code;
            analyzeStock(code);
        }
    });
}

/**
 * イベントリスナーの初期化
 */
function initEventListeners() {
    // 検索ボタンクリック
    document.getElementById('search-btn').addEventListener('click', () => {
        const code = document.getElementById('stock-code').value.trim();
        analyzeStock(code);
    });

    // Enterキーで検索
    document.getElementById('stock-code').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const code = document.getElementById('stock-code').value.trim();
            analyzeStock(code);
        }
    });

    // 入力時にエラーメッセージクリア
    document.getElementById('stock-code').addEventListener('input', () => {
        showError('');
    });
}

/**
 * アプリケーション初期化
 */
function init() {
    renderQuickButtons();
    initEventListeners();

    // LocalStorageから最後の銘柄を復元（オプション）
    try {
        const lastCode = localStorage.getItem('lastAnalyzedStock');
        if (lastCode && stocksData[lastCode]) {
            // 初期表示としてニトリHDを表示
            analyzeStock('9843');
        }
    } catch (e) {
        // LocalStorage利用不可の場合はデフォルト表示
    }
}

// DOMContentLoaded で初期化
document.addEventListener('DOMContentLoaded', init);
