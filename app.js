/**
 * =============================================
 * 高配当株分析システム v2.1 — メインアプリケーション
 * Dividend Stock Analyzer
 *
 * v2.1 変更点:
 *   - データソースを株探(kabutan.jp)に変更
 *   - alloriginsプロキシ経由HTML取得＋DOMParserで実テーブル解析
 *   - 業績テーブル・CFテーブル・財務テーブルの3テーブル統合
 *   - 3段階フォールバック（株探 → Cache → Local）
 *   - LocalStorageキャッシュ（24h有効）
 *
 * 公認会計士の専門知識に基づく投資適格性判定
 * =============================================
 */

'use strict';

/* =============================================
   セクション0: 定数・設定
   ============================================= */

/** データソース識別子 */
const DATA_SOURCE = {
    ONLINE: 'online',   // 株探（kabutan.jp）からリアルタイム取得
    CACHE: 'cache',     // LocalStorageキャッシュ
    LOCAL: 'local'      // 内蔵サンプルデータ
};

/** CORSプロキシ設定（フォールバック順序付き） */
const PROXY_LIST = [
    {
        name: 'codetabs',
        buildUrl: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        parseResponse: async (resp) => await resp.text()
    },
    {
        name: 'allorigins-raw',
        buildUrl: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        parseResponse: async (resp) => await resp.text()
    },
    {
        name: 'allorigins-json',
        buildUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        parseResponse: async (resp) => {
            const json = await resp.json();
            return json.contents || '';
        }
    }
];

/** 株探URLテンプレート */
const KABUTAN_URLS = {
    finance: (code) => `https://kabutan.jp/stock/finance?code=${code}`,
};

/** キャッシュ設定 */
const CACHE_CONFIG = {
    prefix: 'stock_data_',
    expiration: 24 * 60 * 60 * 1000,   // 24時間
    maxEntries: 30
};

/** 現在の動作状態 */
let appState = {
    isLoading: false,
    currentSource: DATA_SOURCE.ONLINE,
    lastCode: null
};


/* =============================================
   セクション1: サンプル財務データ（内蔵フォールバック用）
   複数銘柄の年度別財務データ（最低5年分）
   ============================================= */

const stocksData = {
    "9843": {
        name: "ニトリホールディングス",
        sector: "小売業",
        yearlyData: [
            { fiscalYear: "2017年02月", sales: 512958, operatingMargin: 16.72, eps: 540.9, operatingCF: 77930, dividend: 82, payoutRatio: 15.2, equityRatio: 80.7, cash: 66035 },
            { fiscalYear: "2018年02月", sales: 572060, operatingMargin: 16.32, eps: 574.5, operatingCF: 76840, dividend: 92, payoutRatio: 16.0, equityRatio: 80.1, cash: 60923 },
            { fiscalYear: "2019年02月", sales: 608131, operatingMargin: 16.58, eps: 626.4, operatingCF: 81280, dividend: 108, payoutRatio: 17.2, equityRatio: 80.5, cash: 56182 },
            { fiscalYear: "2020年02月", sales: 642273, operatingMargin: 16.43, eps: 653.1, operatingCF: 95110, dividend: 117, payoutRatio: 17.9, equityRatio: 79.8, cash: 71025 },
            { fiscalYear: "2021年02月", sales: 716900, operatingMargin: 17.42, eps: 790.2, operatingCF: 130450, dividend: 140, payoutRatio: 17.7, equityRatio: 78.3, cash: 138400 },
            { fiscalYear: "2022年02月", sales: 811581, operatingMargin: 16.64, eps: 838.5, operatingCF: 98750, dividend: 147, payoutRatio: 17.5, equityRatio: 53.2, cash: 79500 },
            { fiscalYear: "2023年02月", sales: 895263, operatingMargin: 12.88, eps: 605.3, operatingCF: 88120, dividend: 152, payoutRatio: 25.1, equityRatio: 49.8, cash: 64230 },
            { fiscalYear: "2024年02月", sales: 936310, operatingMargin: 13.12, eps: 644.8, operatingCF: 102300, dividend: 157, payoutRatio: 24.3, equityRatio: 51.4, cash: 72450 },
            { fiscalYear: "2025年02月", sales: 980150, operatingMargin: 14.05, eps: 698.2, operatingCF: 112800, dividend: 165, payoutRatio: 23.6, equityRatio: 52.8, cash: 85300 }
        ]
    },
    "8591": {
        name: "オリックス",
        sector: "その他金融業",
        yearlyData: [
            { fiscalYear: "2017年03月", sales: 2862771, operatingMargin: 10.2, eps: 209.8, operatingCF: 432100, dividend: 52.25, payoutRatio: 24.9, equityRatio: 23.1, cash: 1021500 },
            { fiscalYear: "2018年03月", sales: 2862762, operatingMargin: 11.1, eps: 237.2, operatingCF: 385400, dividend: 66, payoutRatio: 27.8, equityRatio: 23.5, cash: 985200 },
            { fiscalYear: "2019年03月", sales: 2434864, operatingMargin: 10.5, eps: 222.6, operatingCF: 398200, dividend: 76, payoutRatio: 34.1, equityRatio: 24.2, cash: 1052000 },
            { fiscalYear: "2020年03月", sales: 2280329, operatingMargin: 9.8, eps: 164.3, operatingCF: 312500, dividend: 76, payoutRatio: 46.3, equityRatio: 24.8, cash: 1125000 },
            { fiscalYear: "2021年03月", sales: 2292708, operatingMargin: 8.6, eps: 156.7, operatingCF: 425800, dividend: 78, payoutRatio: 49.8, equityRatio: 25.1, cash: 1205000 },
            { fiscalYear: "2022年03月", sales: 2520067, operatingMargin: 12.3, eps: 252.4, operatingCF: 510300, dividend: 85.6, payoutRatio: 33.9, equityRatio: 26.4, cash: 1340000 },
            { fiscalYear: "2023年03月", sales: 2562527, operatingMargin: 11.8, eps: 266.3, operatingCF: 487200, dividend: 94, payoutRatio: 35.3, equityRatio: 27.2, cash: 1285000 },
            { fiscalYear: "2024年03月", sales: 2705318, operatingMargin: 12.1, eps: 285.5, operatingCF: 523400, dividend: 98.6, payoutRatio: 34.5, equityRatio: 28.1, cash: 1410000 },
            { fiscalYear: "2025年03月", sales: 2850200, operatingMargin: 12.5, eps: 302.1, operatingCF: 548000, dividend: 104, payoutRatio: 34.4, equityRatio: 28.9, cash: 1520000 }
        ]
    },
    "8766": {
        name: "東京海上ホールディングス",
        sector: "保険業",
        yearlyData: [
            { fiscalYear: "2017年03月", sales: 5325600, operatingMargin: 6.2, eps: 324.5, operatingCF: 498200, dividend: 140, payoutRatio: 43.1, equityRatio: 15.8, cash: 1120000 },
            { fiscalYear: "2018年03月", sales: 5399512, operatingMargin: 6.8, eps: 361.2, operatingCF: 522100, dividend: 160, payoutRatio: 44.3, equityRatio: 16.2, cash: 1085000 },
            { fiscalYear: "2019年03月", sales: 5447288, operatingMargin: 5.9, eps: 305.4, operatingCF: 478300, dividend: 180, payoutRatio: 58.9, equityRatio: 15.9, cash: 1043000 },
            { fiscalYear: "2020年03月", sales: 5465432, operatingMargin: 5.1, eps: 258.7, operatingCF: 510200, dividend: 200, payoutRatio: 77.3, equityRatio: 15.4, cash: 1210000 },
            { fiscalYear: "2021年03月", sales: 5461200, operatingMargin: 5.8, eps: 295.3, operatingCF: 545000, dividend: 215, payoutRatio: 72.8, equityRatio: 16.1, cash: 1352000 },
            { fiscalYear: "2022年03月", sales: 5863460, operatingMargin: 7.2, eps: 428.6, operatingCF: 612500, dividend: 250, payoutRatio: 58.3, equityRatio: 17.5, cash: 1428000 },
            { fiscalYear: "2023年03月", sales: 6558420, operatingMargin: 7.8, eps: 482.1, operatingCF: 685200, dividend: 300, payoutRatio: 62.2, equityRatio: 18.2, cash: 1502000 },
            { fiscalYear: "2024年03月", sales: 6950800, operatingMargin: 8.5, eps: 545.8, operatingCF: 725000, dividend: 360, payoutRatio: 65.9, equityRatio: 19.1, cash: 1580000 },
            { fiscalYear: "2025年03月", sales: 7280000, operatingMargin: 9.1, eps: 598.3, operatingCF: 768000, dividend: 420, payoutRatio: 70.2, equityRatio: 19.8, cash: 1650000 }
        ]
    },
    "2914": {
        name: "日本たばこ産業",
        sector: "食料品",
        yearlyData: [
            { fiscalYear: "2017年12月", sales: 2139653, operatingMargin: 24.1, eps: 195.3, operatingCF: 478000, dividend: 140, payoutRatio: 71.7, equityRatio: 48.5, cash: 352000 },
            { fiscalYear: "2018年12月", sales: 2215962, operatingMargin: 25.3, eps: 215.8, operatingCF: 510200, dividend: 150, payoutRatio: 69.5, equityRatio: 47.2, cash: 328000 },
            { fiscalYear: "2019年12月", sales: 2175626, operatingMargin: 23.8, eps: 185.2, operatingCF: 465300, dividend: 154, payoutRatio: 83.2, equityRatio: 46.8, cash: 298000 },
            { fiscalYear: "2020年12月", sales: 2092561, operatingMargin: 24.5, eps: 173.6, operatingCF: 498500, dividend: 154, payoutRatio: 88.7, equityRatio: 46.2, cash: 412000 },
            { fiscalYear: "2021年12月", sales: 2324838, operatingMargin: 25.2, eps: 182.1, operatingCF: 512300, dividend: 140, payoutRatio: 76.9, equityRatio: 45.8, cash: 385000 },
            { fiscalYear: "2022年12月", sales: 2657832, operatingMargin: 24.8, eps: 215.4, operatingCF: 532100, dividend: 188, payoutRatio: 87.3, equityRatio: 47.5, cash: 358000 },
            { fiscalYear: "2023年12月", sales: 2843910, operatingMargin: 25.5, eps: 242.8, operatingCF: 568400, dividend: 194, payoutRatio: 79.9, equityRatio: 48.8, cash: 392000 },
            { fiscalYear: "2024年12月", sales: 2985200, operatingMargin: 26.1, eps: 265.3, operatingCF: 595000, dividend: 206, payoutRatio: 77.6, equityRatio: 49.5, cash: 425000 },
            { fiscalYear: "2025年12月", sales: 3102000, operatingMargin: 26.8, eps: 285.1, operatingCF: 622000, dividend: 220, payoutRatio: 77.2, equityRatio: 50.2, cash: 458000 }
        ]
    },
    "9433": {
        name: "KDDI",
        sector: "情報・通信業",
        yearlyData: [
            { fiscalYear: "2017年03月", sales: 4748259, operatingMargin: 19.6, eps: 262.5, operatingCF: 968400, dividend: 85, payoutRatio: 32.4, equityRatio: 58.2, cash: 215800 },
            { fiscalYear: "2018年03月", sales: 5041978, operatingMargin: 19.8, eps: 283.1, operatingCF: 1025000, dividend: 90, payoutRatio: 31.8, equityRatio: 57.5, cash: 198500 },
            { fiscalYear: "2019年03月", sales: 5080353, operatingMargin: 19.9, eps: 298.5, operatingCF: 1045000, dividend: 105, payoutRatio: 35.2, equityRatio: 59.1, cash: 225000 },
            { fiscalYear: "2020年03月", sales: 5237221, operatingMargin: 19.5, eps: 295.8, operatingCF: 1078000, dividend: 115, payoutRatio: 38.9, equityRatio: 58.8, cash: 312000 },
            { fiscalYear: "2021年03月", sales: 5312599, operatingMargin: 19.4, eps: 288.6, operatingCF: 1120000, dividend: 120, payoutRatio: 41.6, equityRatio: 60.2, cash: 345000 },
            { fiscalYear: "2022年03月", sales: 5446708, operatingMargin: 19.2, eps: 305.2, operatingCF: 1085000, dividend: 125, payoutRatio: 40.9, equityRatio: 45.6, cash: 328000 },
            { fiscalYear: "2023年03月", sales: 5671762, operatingMargin: 18.8, eps: 312.5, operatingCF: 1105000, dividend: 135, payoutRatio: 43.2, equityRatio: 46.2, cash: 352000 },
            { fiscalYear: "2024年03月", sales: 5892100, operatingMargin: 19.1, eps: 328.4, operatingCF: 1152000, dividend: 140, payoutRatio: 42.6, equityRatio: 47.5, cash: 382000 },
            { fiscalYear: "2025年03月", sales: 6105000, operatingMargin: 19.5, eps: 345.2, operatingCF: 1195000, dividend: 145, payoutRatio: 42.0, equityRatio: 48.2, cash: 410000 }
        ]
    },
    "4502": {
        name: "武田薬品工業",
        sector: "医薬品",
        yearlyData: [
            { fiscalYear: "2017年03月", sales: 1732051, operatingMargin: 12.5, eps: 68.2, operatingCF: 285000, dividend: 180, payoutRatio: 263.9, equityRatio: 42.5, cash: 382000 },
            { fiscalYear: "2018年03月", sales: 1770531, operatingMargin: 11.8, eps: 102.5, operatingCF: 312000, dividend: 180, payoutRatio: 175.6, equityRatio: 41.8, cash: 358000 },
            { fiscalYear: "2019年03月", sales: 2097224, operatingMargin: 4.2, eps: -52.3, operatingCF: 198000, dividend: 180, payoutRatio: -344.2, equityRatio: 34.2, cash: 685000 },
            { fiscalYear: "2020年03月", sales: 3291188, operatingMargin: 6.8, eps: 45.8, operatingCF: 812000, dividend: 180, payoutRatio: 393.0, equityRatio: 32.5, cash: 625000 },
            { fiscalYear: "2021年03月", sales: 3197812, operatingMargin: 8.5, eps: 85.2, operatingCF: 915000, dividend: 180, payoutRatio: 211.3, equityRatio: 35.8, cash: 542000 },
            { fiscalYear: "2022年03月", sales: 3569006, operatingMargin: 10.2, eps: 142.3, operatingCF: 985000, dividend: 180, payoutRatio: 126.5, equityRatio: 38.2, cash: 498000 },
            { fiscalYear: "2023年03月", sales: 4027478, operatingMargin: 7.5, eps: 95.8, operatingCF: 1052000, dividend: 180, payoutRatio: 187.9, equityRatio: 36.5, cash: 452000 },
            { fiscalYear: "2024年03月", sales: 4263762, operatingMargin: 8.1, eps: 112.5, operatingCF: 1105000, dividend: 188, payoutRatio: 167.1, equityRatio: 37.8, cash: 485000 },
            { fiscalYear: "2025年03月", sales: 4480000, operatingMargin: 8.8, eps: 128.5, operatingCF: 1150000, dividend: 196, payoutRatio: 152.5, equityRatio: 39.1, cash: 520000 }
        ]
    }
};


/* =============================================
   セクション2: 純粋関数 — 計算・判定ロジック
   （副作用なし、テスト可能な純粋関数群）
   ============================================= */

/** 前年比増加判定 */
function isIncreasing(current, previous) {
    if (typeof current !== 'number' || typeof previous !== 'number') return false;
    return current > previous;
}

/** 配列の特定キーの平均値計算 */
function calculateAverage(dataArray, key) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return 0;
    const validValues = dataArray.filter(d => typeof d[key] === 'number');
    if (validValues.length === 0) return 0;
    const sum = validValues.reduce((acc, d) => acc + d[key], 0);
    return sum / validValues.length;
}

/** N年連続増加判定 */
function isConsecutiveIncrease(yearlyData, key, years) {
    if (!Array.isArray(yearlyData) || yearlyData.length < years + 1) return false;
    const recent = yearlyData.slice(-(years + 1));
    for (let i = 1; i < recent.length; i++) {
        if (recent[i][key] <= recent[i - 1][key]) return false;
    }
    return true;
}

/** N年連続黒字判定 */
function isConsecutivePositive(yearlyData, key, years) {
    if (!Array.isArray(yearlyData) || yearlyData.length < years) return false;
    const recent = yearlyData.slice(-years);
    return recent.every(d => typeof d[key] === 'number' && d[key] > 0);
}

/** N年連続維持or増加判定（配当用） */
function isConsecutiveMaintainedOrIncreased(yearlyData, key, years) {
    if (!Array.isArray(yearlyData) || yearlyData.length < years + 1) return false;
    const recent = yearlyData.slice(-(years + 1));
    for (let i = 1; i < recent.length; i++) {
        if (recent[i][key] < recent[i - 1][key]) return false;
    }
    return true;
}

/** 売上高判定 */
function assessSales(current, previous) {
    if (previous === null || previous === undefined) return 'neutral';
    return isIncreasing(current, previous) ? 'good' : 'danger';
}

/** 営業利益率判定 */
function assessOperatingMargin(margin) {
    if (typeof margin !== 'number') return 'neutral';
    if (margin >= 10) return 'good';
    if (margin < 0) return 'danger';
    return 'neutral';
}

/** EPS判定 */
function assessEPS(current, previous) {
    if (previous === null || previous === undefined) return 'neutral';
    return isIncreasing(current, previous) ? 'good' : 'danger';
}

/** 営業CF判定 */
function assessOperatingCF(cf) {
    return cf > 0 ? 'good' : 'danger';
}

/** 1株配当判定 */
function assessDividend(current, previous) {
    if (previous === null || previous === undefined) return 'neutral';
    return current >= previous ? 'good' : 'danger';
}

/** 配当性向判定 */
function assessPayoutRatio(ratio) {
    if (typeof ratio !== 'number') return 'neutral';
    if (ratio >= 30 && ratio <= 50) return 'good';
    if (ratio < 0 || ratio > 80) return 'danger';
    return 'neutral';
}

/** 自己資本比率判定 */
function assessEquityRatio(ratio) {
    return ratio >= 40 ? 'good' : 'neutral';
}

/** 現金等判定 */
function assessCash(current, previous) {
    if (previous === null || previous === undefined) return 'neutral';
    return isIncreasing(current, previous) ? 'good' : 'danger';
}


/* =============================================
   セクション3: 投資適格性スコアリング（100点満点）
   ============================================= */

/**
 * 投資適格性スコア計算
 * @param {Object} stock - 銘柄データ { yearlyData: [...] }
 * @returns {Object} { total, breakdown }
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
    const salesGrowth = isConsecutiveIncrease(yearlyData, 'sales', 3);
    breakdown.growth.score += salesGrowth ? 10 : 0;
    breakdown.growth.details.push({ text: '売上高3年連続増加', achieved: salesGrowth });

    const epsGrowth = isConsecutiveIncrease(yearlyData, 'eps', 3);
    breakdown.growth.score += epsGrowth ? 10 : 0;
    breakdown.growth.details.push({ text: 'EPS3年連続増加', achieved: epsGrowth });

    const cfPositive = isConsecutivePositive(yearlyData, 'operatingCF', 3);
    breakdown.growth.score += cfPositive ? 10 : 0;
    breakdown.growth.details.push({ text: '営業CF3年連続黒字', achieved: cfPositive });

    // ---- 収益性評価（20点） ----
    const recentThreeYears = yearlyData.slice(-3);
    const avgMargin = calculateAverage(recentThreeYears, 'operatingMargin');
    const marginPass = avgMargin >= 10;
    breakdown.profitability.score += marginPass ? 20 : 0;
    breakdown.profitability.details.push({
        text: `直近3年平均営業利益率 ${avgMargin.toFixed(1)}% (${marginPass ? '≥10%' : '≥10%未達'})`,
        achieved: marginPass
    });

    // ---- 配当安定性評価（30点） ----
    const dividendStable = isConsecutiveMaintainedOrIncreased(yearlyData, 'dividend', 3);
    breakdown.dividend.score += dividendStable ? 15 : 0;
    breakdown.dividend.details.push({ text: '1株配当3年連続維持or増加', achieved: dividendStable });

    const latestPayout = yearlyData[yearlyData.length - 1].payoutRatio;
    const payoutPass = latestPayout >= 30 && latestPayout <= 50;
    breakdown.dividend.score += payoutPass ? 15 : 0;
    breakdown.dividend.details.push({
        text: `配当性向 ${latestPayout.toFixed(1)}% (${payoutPass ? '30-50%範囲内' : '30-50%範囲外'})`,
        achieved: payoutPass
    });

    // ---- 財務健全性評価（20点） ----
    const latestEquity = yearlyData[yearlyData.length - 1].equityRatio;
    const equityPass = latestEquity >= 40;
    breakdown.financial.score += equityPass ? 10 : 0;
    breakdown.financial.details.push({
        text: `自己資本比率 ${latestEquity.toFixed(1)}% (${equityPass ? '≥40%' : '≥40%未達'})`,
        achieved: equityPass
    });

    const latestCash = yearlyData[yearlyData.length - 1].cash;
    const prevCash = yearlyData.length >= 2 ? yearlyData[yearlyData.length - 2].cash : 0;
    const cashPass = isIncreasing(latestCash, prevCash);
    breakdown.financial.score += cashPass ? 10 : 0;
    breakdown.financial.details.push({ text: '現金等前年比増加', achieved: cashPass });

    const total = breakdown.growth.score + breakdown.profitability.score
        + breakdown.dividend.score + breakdown.financial.score;

    return { total, breakdown };
}

/** スコアランク判定 */
function getScoreRank(score) {
    if (score >= 90) return { rank: 'A+', label: '優良', cssClass: 'status-excellent', color: 'var(--rank-excellent)' };
    if (score >= 70) return { rank: 'A', label: '良好', cssClass: 'status-good', color: 'var(--rank-good)' };
    if (score >= 50) return { rank: 'B', label: '要注意', cssClass: 'status-warning', color: 'var(--rank-caution)' };
    return { rank: 'C', label: '投資非推奨', cssClass: 'status-danger', color: 'var(--rank-poor)' };
}


/* =============================================
   セクション4: リスク警告システム
   ============================================= */

/** リスク警告判定 */
function detectRisks(stock) {
    const risks = [];
    const yearlyData = stock.yearlyData;
    const latest = yearlyData[yearlyData.length - 1];

    if (latest.payoutRatio > 80) {
        risks.push({
            icon: 'fas fa-scissors', title: '減配リスクあり',
            description: `配当性向が ${latest.payoutRatio.toFixed(1)}% と高水準です（80%超）。利益の大部分を配当に充てており、業績悪化時に減配の可能性があります。`,
            severity: 'high'
        });
    }

    if (latest.operatingMargin < 0) {
        risks.push({
            icon: 'fas fa-chart-line', title: '本業赤字',
            description: `営業利益率が ${latest.operatingMargin.toFixed(2)}% でマイナスです。本業での収益獲得に課題があり、構造的な問題の可能性があります。`,
            severity: 'critical'
        });
    }

    if (latest.equityRatio < 30) {
        risks.push({
            icon: 'fas fa-building-shield', title: '財務脆弱',
            description: `自己資本比率が ${latest.equityRatio.toFixed(1)}% と低水準です（30%未満）。負債依存度が高く、金利上昇局面でのリスクがあります。`,
            severity: 'high'
        });
    }

    const recentThree = yearlyData.slice(-3);
    if (recentThree.every(d => d.operatingCF < 0)) {
        risks.push({
            icon: 'fas fa-money-bill-transfer', title: '資金繰り悪化',
            description: '営業キャッシュフローが3年連続で赤字です。事業運営からの現金創出力に深刻な問題があります。',
            severity: 'critical'
        });
    }

    if (latest.payoutRatio < 0) {
        risks.push({
            icon: 'fas fa-circle-exclamation', title: '利益超過配当',
            description: 'EPSがマイナスにもかかわらず配当を実施しています。持続不可能な配当政策の可能性があります。',
            severity: 'critical'
        });
    }

    if (latest.payoutRatio > 100 && latest.payoutRatio > 0) {
        risks.push({
            icon: 'fas fa-piggy-bank', title: '利益超過配当',
            description: `配当性向が ${latest.payoutRatio.toFixed(1)}% と100%を超えています。利益以上の配当を行っており、内部留保の取り崩しまたは借入による配当の可能性があります。`,
            severity: 'critical'
        });
    }

    return risks;
}


/* =============================================
   セクション5: 数値フォーマット
   ============================================= */

function formatMillions(value) {
    if (typeof value !== 'number') return '--';
    return value.toLocaleString('ja-JP');
}

function formatPercent(value, decimals = 1) {
    if (typeof value !== 'number') return '--';
    return value.toFixed(decimals) + '%';
}

function formatYen(value, decimals = 1) {
    if (typeof value !== 'number') return '--';
    return value.toFixed(decimals) + '円';
}

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
   セクション6: キャッシュシステム（LocalStorage）
   ============================================= */

/**
 * キャッシュにデータを保存
 * @param {string} stockCode
 * @param {Object} data - 銘柄データオブジェクト
 */
function saveToCache(stockCode, data) {
    try {
        const cacheKey = CACHE_CONFIG.prefix + stockCode;
        const cacheData = {
            data: data,
            timestamp: Date.now(),
            version: '2.1'
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        cleanOldCache();
    } catch (error) {
        console.warn('Cache save failed:', error);
    }
}

/**
 * キャッシュからデータを取得
 * @param {string} stockCode
 * @returns {Object|null}
 */
function getFromCache(stockCode) {
    try {
        const cacheKey = CACHE_CONFIG.prefix + stockCode;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const cacheData = JSON.parse(cached);
        const isExpired = (Date.now() - cacheData.timestamp) > CACHE_CONFIG.expiration;

        if (isExpired) {
            localStorage.removeItem(cacheKey);
            return null;
        }
        return cacheData.data;
    } catch (error) {
        console.warn('Cache read failed:', error);
        return null;
    }
}

/**
 * キャッシュのタイムスタンプを取得
 * @param {string} stockCode
 * @returns {number|null} タイムスタンプ（ミリ秒）
 */
function getCacheTimestamp(stockCode) {
    try {
        const cacheKey = CACHE_CONFIG.prefix + stockCode;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;
        return JSON.parse(cached).timestamp;
    } catch {
        return null;
    }
}

/** 古いキャッシュを削除（maxEntries超過時） */
function cleanOldCache() {
    try {
        const cacheEntries = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_CONFIG.prefix)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    cacheEntries.push({ key, timestamp: data.timestamp || 0 });
                } catch {
                    localStorage.removeItem(key);
                }
            }
        }

        if (cacheEntries.length > CACHE_CONFIG.maxEntries) {
            cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
            const toRemove = cacheEntries.length - CACHE_CONFIG.maxEntries;
            for (let i = 0; i < toRemove; i++) {
                localStorage.removeItem(cacheEntries[i].key);
            }
        }
    } catch (error) {
        console.warn('Cache cleanup failed:', error);
    }
}

/** 全キャッシュを削除 */
function clearAllCache() {
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_CONFIG.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (error) {
        console.warn('Cache clear failed:', error);
    }
}


/* =============================================
   セクション7: 株探(kabutan.jp) スクレイピング
   alloriginsプロキシ経由でHTMLを取得しDOMParserで解析
   ============================================= */

/**
 * CORSプロキシ経由でHTMLを取得（複数プロキシをフォールバック）
 * @param {string} targetUrl - 取得対象のURL
 * @returns {string} HTML文字列
 */
async function fetchViaProxy(targetUrl) {
    let lastError = null;

    for (const proxy of PROXY_LIST) {
        try {
            const proxyUrl = proxy.buildUrl(targetUrl);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // 20秒タイムアウト

            console.log(`[Proxy] Trying ${proxy.name}: ${proxyUrl.substring(0, 80)}...`);

            const response = await fetch(proxyUrl, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} from ${proxy.name}`);
            }

            const htmlContent = await proxy.parseResponse(response);

            if (!htmlContent || htmlContent.length < 1000) {
                throw new Error(`Response too short (${htmlContent?.length || 0} chars) from ${proxy.name}`);
            }

            console.log(`[Proxy] Successfully fetched via ${proxy.name} (${htmlContent.length} chars)`);
            return htmlContent;

        } catch (error) {
            console.warn(`[Proxy] ${proxy.name} failed:`, error.message);
            lastError = error;
        }
    }

    throw new Error(`全てのプロキシからの取得に失敗しました: ${lastError?.message || 'Unknown error'}`);
}

/**
 * 財務数値の文字列を数値に変換（カンマ、全角数字、△マイナス記号対応）
 * @param {string} text - テキスト
 * @returns {number|null} パース結果
 */
function parseFinancialValue(text) {
    if (!text) return null;
    let str = text.trim();
    if (str === '' || str === '-' || str === '---' || str === '－' || str === '―') return null;

    // △ をマイナスに変換
    str = str.replace(/△/g, '-');
    // 全角数字→半角
    str = str.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    // 全角記号
    str = str.replace(/，/g, ',').replace(/－/g, '-').replace(/．/g, '.');
    // カンマ除去
    str = str.replace(/,/g, '');
    // 数値以外の末尾文字を除去（*や#等）
    str = str.replace(/[*#%円百万億]+$/g, '');

    // 数値抽出
    const match = str.match(/^([-]?\d+(?:\.\d+)?)$/);
    if (match) {
        const val = parseFloat(match[1]);
        return isNaN(val) ? null : val;
    }

    // より柔軟に数値を検出
    const cleaned = str.replace(/[^\d.\-]/g, '');
    if (cleaned === '' || cleaned === '-') return null;
    const val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
}

/**
 * 営業利益率を計算
 * @param {number|null} operatingProfit - 営業利益（百万円）
 * @param {number|null} sales - 売上高（百万円）
 * @returns {number} 営業利益率(%)
 */
function calculateOperatingMargin(operatingProfit, sales) {
    if (!operatingProfit || !sales || sales === 0) return 0;
    return (operatingProfit / sales) * 100;
}

/**
 * 配当性向を計算
 * @param {number|null} dividend - 1株配当（円）
 * @param {number|null} eps - 1株利益（円）
 * @returns {number} 配当性向(%)
 */
function calculatePayoutRatio(dividend, eps) {
    if (!dividend || !eps || eps === 0) return 0;
    return (dividend / eps) * 100;
}

/**
 * 株探HTMLから企業名を抽出
 * <title> タグから企業名を取得する
 * 例: "ニトリホールディングス（ニトリＨＤ）【9843】の業績・財務" → "ニトリホールディングス"
 * @param {Document} doc - パース済みHTMLドキュメント
 * @returns {string|null}
 */
function extractCompanyName(doc) {
    // 方法1: <title>タグから抽出
    const titleEl = doc.querySelector('title');
    if (titleEl) {
        const titleText = titleEl.textContent.trim();
        // 「ニトリホールディングス（ニトリＨＤ）【9843】の...」形式
        const match = titleText.match(/^(.+?)(?:\s*[（(【])/);
        if (match && match[1].length > 0 && match[1].length < 50) {
            return match[1].trim();
        }
    }

    // 方法2: <h2> 等のヘッダーから銘柄名を探す
    const headerSelectors = ['h2', 'h1', '.company_name', '.stockName'];
    for (const sel of headerSelectors) {
        const el = doc.querySelector(sel);
        if (el) {
            const text = el.textContent.trim();
            if (text.length > 0 && text.length < 50 && /[\u3000-\u9FFFa-zA-Z]/.test(text)) {
                return text.replace(/\s*[（(【].*/g, '').trim();
            }
        }
    }

    return null;
}

/**
 * 株探テーブル行の <th> セルから決算期(YYYY.MM)を抽出するヘルパー
 * 
 * 株探の行構造:
 *   <tr>
 *     <th scope="row"><span class="kubun1">I　　 </span>2022.03  </th>
 *     <td>7,388,791</td> ...
 *   </tr>
 * 
 * 予想行は <span> 内に「予」を含む（例: "I　予 "）→ 除外する
 * 四半期行は "24.10-03" のようなハイフン付き → 除外する
 *
 * @param {Element} thElement - <th> 要素
 * @returns {{ fiscalYear: string, period: string } | null} 通期実績ならオブジェクト、それ以外はnull
 */
function parseFiscalPeriodFromTh(thElement) {
    if (!thElement) return null;

    // 予想行を除外（<span class="kubun1"> 内に「予」が含まれる場合）
    const kubunSpan = thElement.querySelector('.kubun1');
    if (kubunSpan && kubunSpan.textContent.includes('予')) return null;

    // <th> 全体のテキストから YYYY.MM パターンを抽出
    const fullText = thElement.textContent.trim();
    const periodMatch = fullText.match(/(\d{4})\.(\d{2})/);
    if (!periodMatch) return null;

    // 四半期期間（"24.10-03" 等）を除外
    if (fullText.includes('-')) return null;

    return {
        fiscalYear: `${periodMatch[1]}年${periodMatch[2]}月`,
        period: `${periodMatch[1]}.${periodMatch[2]}`
    };
}

/**
 * 株探の業績テーブルを特定して取得する
 *
 * HTML構造（実テーブル確認済み）:
 *   <div class="fin_year_t0_d fin_year_result_d">
 *     <table>
 *       <thead>...<th>決算期</th><th>売上高</th><th>営業益</th>...</thead>
 *       <tbody>
 *         <tr><td colspan="8" class="oc_btn1">...</td></tr>  ← 折り畳みボタン行
 *         <tr>
 *           <th scope="row"><span class="kubun1">I　　 </span>2022.03  </th>
 *           <td>7,388,791</td><td>357,526</td><td>360,395</td>
 *           <td>255,334</td><td>109.4</td><td>30</td>
 *           <td class="fb_pdf1">...</td>
 *         </tr>
 *         ...
 *       </tbody>
 *     </table>
 *   </div>
 *
 * @param {Document} doc
 * @returns {Array} 業績データ配列
 */
function extractPerformanceTable(doc) {
    // 方法1: クラス指定で通期業績実績テーブルを検索
    let table = doc.querySelector('.fin_year_t0_d.fin_year_result_d table');

    // 方法2: テーブルヘッダー内容から業績テーブルを特定
    if (!table) {
        const allTables = doc.querySelectorAll('table');
        for (const t of allTables) {
            const thead = t.querySelector('thead');
            if (!thead) continue;
            const headerText = thead.textContent;
            if ((headerText.includes('売上高') || headerText.includes('売上収益') || headerText.includes('営業収益')) &&
                headerText.includes('営業益') &&
                headerText.includes('修正') && headerText.includes('1株益')) {
                table = t;
                break;
            }
        }
    }

    if (!table) {
        console.warn('[Kabutan] Performance table not found');
        return [];
    }

    const rows = [];
    const trs = table.querySelectorAll('tbody tr, tr');

    for (const tr of trs) {
        // 決算期は <th> セル、データは <td> セル
        const th = tr.querySelector('th[scope="row"]');
        const tds = tr.querySelectorAll('td');
        if (!th || tds.length < 6) continue;

        const period = parseFiscalPeriodFromTh(th);
        if (!period) continue;

        // <td> カラム順: 売上高(0), 営業益(1), 経常益(2), 最終益(3), 修正1株益(4), 修正1株配(5), 発表日(6)
        rows.push({
            fiscalYear: period.fiscalYear,
            period: period.period,
            sales: parseFinancialValue(tds[0].textContent),
            operatingProfit: parseFinancialValue(tds[1].textContent),
            ordinaryProfit: parseFinancialValue(tds[2].textContent),
            netProfit: parseFinancialValue(tds[3].textContent),
            eps: parseFinancialValue(tds[4].textContent),
            dividend: parseFinancialValue(tds[5].textContent)
        });
    }

    console.log(`[Kabutan] Performance table: ${rows.length} rows extracted`);
    return rows;
}

/**
 * 株探のキャッシュフローテーブルを抽出
 *
 * HTML構造（実テーブル確認済み）:
 *   <a name="cashflow_name" id="cashflow_name"></a>
 *   <div class="cashflow_title"><h2>キャッシュフロー推移</h2></div>
 *   ...
 *   <table>
 *     <thead>...<th>決算期</th><th>営業益</th><th>フリーCF</th><th>営業CF</th>...</thead>
 *     <tbody>
 *       <tr>
 *         <th scope="row"><span class="kubun1">I　　 </span>2023.03  </th>
 *         <td>288,570</td><td class="mizu2">176,709</td>
 *         <td class="mizu2">520,742</td><td class="mizu2">-344,033</td>
 *         <td class="mizu2">-607,013</td><td class="mizu2">819,499</td>
 *         <td>10.17</td>
 *       </tr>
 *     </tbody>
 *   </table>
 *
 * @param {Document} doc
 * @returns {Map<string, {operatingCF: number, cash: number}>} 決算期→CFデータ
 */
function extractCashFlowTable(doc) {
    const cfMap = new Map();

    // 方法1: #cashflow_name アンカーから後方検索でテーブルを特定
    let table = null;
    const cfAnchor = doc.getElementById('cashflow_name');
    if (cfAnchor) {
        let el = cfAnchor.nextElementSibling;
        let searchDepth = 0;
        while (el && searchDepth < 10) {
            if (el.tagName === 'TABLE') { table = el; break; }
            const innerTable = el.querySelector('table');
            if (innerTable) { table = innerTable; break; }
            el = el.nextElementSibling;
            searchDepth++;
        }
    }

    // 方法2: .cashflow_title の次のテーブル
    if (!table) {
        const cfTitleDiv = doc.querySelector('.cashflow_title');
        if (cfTitleDiv) {
            let el = cfTitleDiv.nextElementSibling;
            let searchDepth = 0;
            while (el && searchDepth < 10) {
                if (el.tagName === 'TABLE') { table = el; break; }
                const innerTable = el.querySelector('table');
                if (innerTable) { table = innerTable; break; }
                el = el.nextElementSibling;
                searchDepth++;
            }
        }
    }

    // 方法3: テーブルヘッダー内容から特定
    if (!table) {
        const allTables = doc.querySelectorAll('table');
        for (const t of allTables) {
            const thead = t.querySelector('thead');
            if (!thead) continue;
            const text = thead.textContent;
            if (text.includes('営業CF') && (text.includes('現金等') || text.includes('フリーCF'))) {
                table = t;
                break;
            }
        }
    }

    if (!table) {
        console.warn('[Kabutan] Cash flow table not found');
        return cfMap;
    }

    const trs = table.querySelectorAll('tbody tr, tr');
    for (const tr of trs) {
        const th = tr.querySelector('th[scope="row"]');
        const tds = tr.querySelectorAll('td');
        if (!th || tds.length < 6) continue;

        const period = parseFiscalPeriodFromTh(th);
        if (!period) continue;

        // <td> カラム順: 営業益(0), フリーCF(1), 営業CF(2), 投資CF(3), 財務CF(4), 現金等残高(5), 現金比率(6)
        cfMap.set(period.fiscalYear, {
            operatingCF: parseFinancialValue(tds[2].textContent),
            cash: parseFinancialValue(tds[5].textContent)
        });
    }

    console.log(`[Kabutan] Cash flow table: ${cfMap.size} periods extracted`);
    return cfMap;
}

/**
 * 株探の財務テーブルを抽出
 *
 * HTML構造（実テーブル確認済み）:
 *   <a name="zaimu_name" id="zaimu_name"></a>
 *   <div class="cap1"><h3>財務 【実績】</h3></div>
 *   ...
 *   <table>
 *     <thead>...<th>決算期</th><th>１株純資産</th><th>自己資本比率</th>...</thead>
 *     <tbody>
 *       <tr>
 *         <th scope="row"><span class="kubun1">I　　 </span>2023.03  </th>
 *         <td>1,550.23</td><td>44.9</td>
 *         <td>8,059,527</td><td>3,618,402</td>
 *         <td>2,588,800</td><td>0.40</td>
 *         <td>23/05/10</td>
 *       </tr>
 *     </tbody>
 *   </table>
 *
 * @param {Document} doc
 * @returns {Map<string, {equityRatio: number}>} 決算期→財務データ
 */
function extractFinancialTable(doc) {
    const finMap = new Map();

    // 方法1: #zaimu_name アンカーから後方検索でテーブルを特定
    let table = null;
    const zaimuAnchor = doc.getElementById('zaimu_name');
    if (zaimuAnchor) {
        let el = zaimuAnchor.nextElementSibling;
        let searchDepth = 0;
        while (el && searchDepth < 10) {
            if (el.tagName === 'TABLE') { table = el; break; }
            const innerTable = el.querySelector('table');
            if (innerTable) { table = innerTable; break; }
            el = el.nextElementSibling;
            searchDepth++;
        }
    }

    // 方法2: テーブルヘッダー内容から特定
    if (!table) {
        const allTables = doc.querySelectorAll('table');
        for (const t of allTables) {
            const thead = t.querySelector('thead');
            if (!thead) continue;
            const text = thead.textContent;
            if (text.includes('自己資本') && text.includes('比率') && text.includes('純資産')) {
                table = t;
                break;
            }
        }
    }

    if (!table) {
        console.warn('[Kabutan] Financial table not found');
        return finMap;
    }

    const trs = table.querySelectorAll('tbody tr, tr');
    for (const tr of trs) {
        const th = tr.querySelector('th[scope="row"]');
        const tds = tr.querySelectorAll('td');
        if (!th || tds.length < 6) continue;

        const period = parseFiscalPeriodFromTh(th);
        if (!period) continue;

        // <td> カラム順: 1株純資産(0), 自己資本比率(1), 総資産(2), 自己資本(3), 剰余金(4), 有利子負債倍率(5), 発表日(6)
        finMap.set(period.fiscalYear, {
            equityRatio: parseFinancialValue(tds[1].textContent)
        });
    }

    console.log(`[Kabutan] Financial table: ${finMap.size} periods extracted`);
    return finMap;
}

/**
 * 株探HTMLを統合解析して銘柄データオブジェクトを生成
 * 3つのテーブル（業績・CF・財務）を決算期キーで結合
 * @param {string} htmlString - 株探の業績ページHTML
 * @param {string} stockCode - 銘柄コード
 * @returns {Object} 銘柄データオブジェクト
 */
function parseKabutanHTML(htmlString, stockCode) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // 企業名を抽出
    const companyName = extractCompanyName(doc) || `銘柄 ${stockCode}`;
    console.log(`[Kabutan] Company name: ${companyName}`);

    // 3つのテーブルデータを抽出
    const performanceRows = extractPerformanceTable(doc);
    const cfMap = extractCashFlowTable(doc);
    const finMap = extractFinancialTable(doc);

    if (performanceRows.length < 2) {
        throw new Error(
            `業績データが不十分です（${performanceRows.length}期分のみ）。` +
            `株探のHTML構造が変更されている可能性があります。`
        );
    }

    // 3テーブルを統合して年度別データを構築
    const yearlyData = performanceRows.map(row => {
        const cfData = cfMap.get(row.fiscalYear) || {};
        const finData = finMap.get(row.fiscalYear) || {};

        const sales = row.sales || 0;
        const operatingProfit = row.operatingProfit || 0;
        const eps = row.eps || 0;
        const dividend = row.dividend || 0;
        const operatingCF = cfData.operatingCF || 0;
        const cash = cfData.cash || 0;
        const equityRatio = finData.equityRatio || 0;

        // 営業利益率を計算（業績テーブルの売上高と営業益から）
        const operatingMargin = sales > 0 ? calculateOperatingMargin(operatingProfit, sales) : 0;

        // 配当性向を計算
        const payoutRatio = eps !== 0 ? calculatePayoutRatio(dividend, eps) : 0;

        return {
            fiscalYear: row.fiscalYear,
            sales: Math.round(sales),
            operatingMargin: Math.round(operatingMargin * 100) / 100,
            eps: Math.round(eps * 10) / 10,
            operatingCF: Math.round(operatingCF),
            dividend: Math.round(dividend * 10) / 10,
            payoutRatio: Math.round(payoutRatio * 10) / 10,
            equityRatio: Math.round(equityRatio * 10) / 10,
            cash: Math.round(cash)
        };
    });

    // 時系列順にソート（古い→新しい）
    yearlyData.sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear));

    console.log(`[Kabutan] Parsed ${yearlyData.length} fiscal years for ${companyName}`);

    return {
        code: stockCode,
        name: companyName,
        sector: '株探データ',
        yearlyData: yearlyData
    };
}

/**
 * 株探からデータ取得メインエントリー
 * @param {string} stockCode - 4桁銘柄コード
 * @returns {Object} 銘柄データ
 */
async function fetchFromKabutan(stockCode) {
    const targetUrl = KABUTAN_URLS.finance(stockCode);
    console.log(`[Kabutan] Fetching: ${targetUrl}`);

    const htmlContent = await fetchViaProxy(targetUrl);
    const result = parseKabutanHTML(htmlContent, stockCode);

    // 成功したらキャッシュに保存
    saveToCache(stockCode, result);
    return result;
}

/**
 * ローカル静的データから取得
 * @param {string} stockCode
 * @returns {Object|null}
 */
function fetchFromLocalData(stockCode) {
    const data = stocksData[stockCode];
    if (!data) return null;
    return {
        code: stockCode,
        name: data.name,
        sector: data.sector,
        yearlyData: data.yearlyData
    };
}


/* =============================================
   セクション8: データソース抽象化レイヤー
   統合エントリーポイント + フォールバック戦略
   ============================================= */

/**
 * 統合データ取得エントリーポイント
 * @param {string} stockCode - 4桁銘柄コード
 * @param {string} source - DATA_SOURCE値
 * @returns {Object} { data, actualSource, message }
 */
async function fetchFinancialData(stockCode, source = DATA_SOURCE.ONLINE) {
    try {
        showLoading(true);

        switch (source) {
            case DATA_SOURCE.ONLINE: {
                const data = await fetchFromKabutan(stockCode);
                return { data, actualSource: DATA_SOURCE.ONLINE, message: null };
            }
            case DATA_SOURCE.CACHE: {
                const cached = getFromCache(stockCode);
                if (cached) {
                    const ts = getCacheTimestamp(stockCode);
                    const timeStr = ts ? new Date(ts).toLocaleString('ja-JP') : '不明';
                    return { data: cached, actualSource: DATA_SOURCE.CACHE, message: `キャッシュデータを表示（${timeStr}保存分）` };
                }
                throw new Error('キャッシュにデータがありません');
            }
            case DATA_SOURCE.LOCAL: {
                const local = fetchFromLocalData(stockCode);
                if (local) {
                    return { data: local, actualSource: DATA_SOURCE.LOCAL, message: 'サンプルデータを表示しています' };
                }
                throw new Error(`銘柄コード「${stockCode}」のサンプルデータがありません`);
            }
            default:
                throw new Error('不明なデータソースです');
        }
    } catch (error) {
        console.warn(`[${source}] failed:`, error.message);
        return await handleFallback(stockCode, source, error);
    } finally {
        showLoading(false);
    }
}

/**
 * 段階的フォールバック処理
 * Online → Cache → Local の順序で試行
 * @param {string} stockCode
 * @param {string} failedSource
 * @param {Error} originalError
 * @returns {Object} { data, actualSource, message }
 */
async function handleFallback(stockCode, failedSource, originalError) {
    console.log(`[Fallback] ${failedSource} failed. Trying alternatives...`);

    // 優先度1: キャッシュから取得
    if (failedSource !== DATA_SOURCE.CACHE) {
        const cached = getFromCache(stockCode);
        if (cached) {
            const ts = getCacheTimestamp(stockCode);
            const timeStr = ts ? new Date(ts).toLocaleString('ja-JP') : '不明';
            return {
                data: cached,
                actualSource: DATA_SOURCE.CACHE,
                message: `⚠ オンライン取得に失敗。キャッシュデータ（${timeStr}保存分）を表示しています`
            };
        }
    }

    // 優先度2: ローカル静的データ
    if (failedSource !== DATA_SOURCE.LOCAL) {
        const local = fetchFromLocalData(stockCode);
        if (local) {
            return {
                data: local,
                actualSource: DATA_SOURCE.LOCAL,
                message: `⚠ オンライン取得に失敗。内蔵サンプルデータを表示しています`
            };
        }
    }

    // 全て失敗
    throw new Error(
        `全てのデータソースからの取得に失敗しました。\n` +
        `元のエラー: ${originalError.message}\n` +
        `銘柄コード「${stockCode}」のデータが見つかりません。`
    );
}


/* =============================================
   セクション9: UI描画 — DOM操作
   ============================================= */

/** 銘柄情報セクションの描画 */
function renderStockInfo(code, stock) {
    document.getElementById('stock-code-badge').textContent = code;
    document.getElementById('stock-name').textContent = stock.name;
    document.getElementById('stock-sector').textContent = stock.sector;

    const years = stock.yearlyData;
    const firstYear = years[0].fiscalYear;
    const lastYear = years[years.length - 1].fiscalYear;
    document.getElementById('data-period').textContent = `データ期間: ${firstYear} 〜 ${lastYear}（${years.length}期分）`;
}

/** サマリーカード描画 */
function renderSummaryCards(stock, scoreResult) {
    const yearlyData = stock.yearlyData;
    const latest = yearlyData[yearlyData.length - 1];
    const previous = yearlyData.length >= 2 ? yearlyData[yearlyData.length - 2] : latest;
    const rank = getScoreRank(scoreResult.total);

    // スコアカード
    const scoreValue = document.getElementById('score-value');
    scoreValue.textContent = scoreResult.total;
    scoreValue.style.color = rank.color;

    const scoreRank = document.getElementById('score-rank');
    scoreRank.textContent = `${rank.rank} — ${rank.label}`;
    scoreRank.className = `score-rank ${rank.cssClass}`;

    const bd = scoreResult.breakdown;
    document.getElementById('score-breakdown').innerHTML = `
        <span style="font-size:0.72rem; color:#64748b;">
            成長 ${bd.growth.score}/${bd.growth.max} ｜ 
            収益 ${bd.profitability.score}/${bd.profitability.max} ｜ 
            配当 ${bd.dividend.score}/${bd.dividend.max} ｜ 
            財務 ${bd.financial.score}/${bd.financial.max}
        </span>
    `;
    document.getElementById('card-score').style.borderTopColor = rank.color;

    // 売上高カード
    document.getElementById('sales-value').textContent = formatMillions(latest.sales) + ' 百万円';
    const salesChange = calculateChange(latest.sales, previous.sales);
    const salesChangeEl = document.getElementById('sales-change');
    salesChangeEl.textContent = `前年比 ${salesChange.formatted}`;
    salesChangeEl.className = `card-sub-value ${salesChange.isPositive === null ? '' : salesChange.isPositive ? 'change-positive' : 'change-negative'}`;
    const salesTrend = isConsecutiveIncrease(yearlyData, 'sales', 3);
    document.getElementById('sales-trend').textContent = salesTrend ? '✅ 3年連続増収' : '📊 増収基調ではありません';

    // EPSカード
    document.getElementById('eps-value').textContent = formatYen(latest.eps);
    const epsChange = calculateChange(latest.eps, previous.eps);
    const epsChangeEl = document.getElementById('eps-change');
    epsChangeEl.textContent = `前年比 ${epsChange.formatted}`;
    epsChangeEl.className = `card-sub-value ${epsChange.isPositive === null ? '' : epsChange.isPositive ? 'change-positive' : 'change-negative'}`;
    const epsTrend = isConsecutiveIncrease(yearlyData, 'eps', 3);
    document.getElementById('eps-trend').textContent = epsTrend ? '✅ 3年連続増益（EPS）' : '📊 EPS連続増加ではありません';

    // 配当カード
    document.getElementById('dividend-value').textContent = formatYen(latest.dividend);
    document.getElementById('dividend-payout').textContent = `配当性向 ${formatPercent(latest.payoutRatio)}`;
    const divTrend = isConsecutiveMaintainedOrIncreased(yearlyData, 'dividend', 3);
    document.getElementById('dividend-trend').textContent = divTrend ? '✅ 3年連続増配/維持' : '📊 減配履歴あり';
}

/** リスク警告セクション描画 */
function renderRiskWarnings(risks) {
    const section = document.getElementById('risk-section');
    const list = document.getElementById('risk-list');
    if (risks.length === 0) { section.style.display = 'none'; return; }
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

/** スコア詳細セクション描画 */
function renderScoreDetails(scoreResult) {
    const bd = scoreResult.breakdown;
    const grid = document.getElementById('score-detail-grid');
    const categories = [
        { name: '成長性評価', icon: 'fas fa-arrow-up-right-dots', bgColor: '#eff6ff', iconColor: '#3b82f6', data: bd.growth },
        { name: '収益性評価', icon: 'fas fa-sack-dollar', bgColor: '#fef3c7', iconColor: '#d97706', data: bd.profitability },
        { name: '配当安定性評価', icon: 'fas fa-hand-holding-dollar', bgColor: '#d1fae5', iconColor: '#059669', data: bd.dividend },
        { name: '財務健全性評価', icon: 'fas fa-shield-halved', bgColor: '#fce7f3', iconColor: '#db2777', data: bd.financial }
    ];

    grid.innerHTML = categories.map(cat => {
        const detailsHtml = cat.data.details.map(d =>
            `<span style="font-size:0.7rem; color:${d.achieved ? 'var(--excellent-text)' : '#94a3b8'};">
                ${d.achieved ? '✓' : '✗'} ${d.text}
            </span>`
        ).join('<br>');
        const pointColor = cat.data.score === cat.data.max ? 'var(--rank-excellent)'
            : cat.data.score > 0 ? 'var(--rank-good)' : 'var(--rank-poor)';
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
            </div>`;
    }).join('');
}

/** 年度別財務データテーブル描画 */
function renderDataTable(yearlyData) {
    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');

    thead.innerHTML = `<tr>
        <th>決算期</th>
        <th>売上高<br><small>(百万円)</small></th>
        <th>営業利益率<br><small>(%)</small></th>
        <th>EPS<br><small>(円)</small></th>
        <th>営業CF<br><small>(百万円)</small></th>
        <th>1株配当<br><small>(円)</small></th>
        <th>配当性向<br><small>(%)</small></th>
        <th>自己資本比率<br><small>(%)</small></th>
        <th>現金等<br><small>(百万円)</small></th>
    </tr>`;

    const reversed = [...yearlyData].reverse();
    tbody.innerHTML = reversed.map((row, idx) => {
        const prev = idx < reversed.length - 1 ? reversed[idx + 1] : {};
        return `<tr>
            <td>${row.fiscalYear}</td>
            <td class="cell-${assessSales(row.sales, prev.sales)}">${formatMillions(row.sales)}</td>
            <td class="cell-${assessOperatingMargin(row.operatingMargin)}">${formatPercent(row.operatingMargin, 2)}</td>
            <td class="cell-${assessEPS(row.eps, prev.eps)}">${formatYen(row.eps)}</td>
            <td class="cell-${assessOperatingCF(row.operatingCF)}">${formatMillions(row.operatingCF)}</td>
            <td class="cell-${assessDividend(row.dividend, prev.dividend)}">${formatYen(row.dividend)}</td>
            <td class="cell-${assessPayoutRatio(row.payoutRatio)}">${formatPercent(row.payoutRatio)}</td>
            <td class="cell-${assessEquityRatio(row.equityRatio)}">${formatPercent(row.equityRatio)}</td>
            <td class="cell-${assessCash(row.cash, prev.cash)}">${formatMillions(row.cash)}</td>
        </tr>`;
    }).join('');
}


/* =============================================
   セクション10: UI ステータス表示
   ローディング・メッセージ・データソースバッジ
   ============================================= */

/** ローディング表示の切り替え */
function showLoading(isLoading) {
    appState.isLoading = isLoading;
    const indicator = document.getElementById('loading-indicator');
    const searchBtn = document.getElementById('search-btn');
    const refreshBtn = document.getElementById('refresh-btn');

    if (isLoading) {
        indicator.classList.remove('hidden');
        searchBtn.disabled = true;
        searchBtn.querySelector('span').textContent = '取得中...';
        if (refreshBtn) refreshBtn.disabled = true;
    } else {
        indicator.classList.add('hidden');
        searchBtn.disabled = false;
        searchBtn.querySelector('span').textContent = '分析開始';
        if (refreshBtn) refreshBtn.disabled = false;
    }
}

/** メッセージバナー表示 */
function showMessage(message, type = 'info') {
    const area = document.getElementById('message-area');
    if (!area) return;
    area.innerHTML = `<i class="fas ${type === 'error' ? 'fa-circle-xmark' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i> ${message}`;
    area.className = `message-banner message-${type}`;
    area.classList.remove('hidden');

    // 自動非表示（エラー以外は5秒後）
    if (type !== 'error') {
        setTimeout(() => { area.classList.add('hidden'); }, 6000);
    }
}

function showInfo(msg) { showMessage(msg, 'info'); }
function showWarning(msg) { showMessage(msg, 'warning'); }

/** 検索バリデーション用エラー表示（ヘッダー内） */
function showHeaderError(message) {
    const el = document.getElementById('error-message');
    el.textContent = message;
}

/** 最終更新時刻表示 */
function updateLastRefreshTime(source) {
    const el = document.getElementById('last-updated');
    if (!el) return;
    const now = new Date().toLocaleString('ja-JP');
    const sourceLabel = source === DATA_SOURCE.ONLINE ? '株探 (kabutan.jp)'
        : source === DATA_SOURCE.CACHE ? 'キャッシュ'
        : 'サンプルデータ';
    el.innerHTML = `<i class="fas fa-clock"></i> 最終更新: ${now}　|　ソース: ${sourceLabel}`;
    el.classList.remove('hidden');
}

/** データソースバッジ更新 */
function updateSourceBadge(source) {
    const badge = document.getElementById('source-badge');
    if (!badge) return;

    const config = {
        [DATA_SOURCE.ONLINE]: { icon: 'fa-globe', text: '株探 (Live)', cls: 'source-badge-live' },
        [DATA_SOURCE.CACHE]: { icon: 'fa-database', text: 'キャッシュ', cls: 'source-badge-cache' },
        [DATA_SOURCE.LOCAL]: { icon: 'fa-hard-drive', text: 'サンプルデータ', cls: 'source-badge-local' }
    };
    const c = config[source] || config[DATA_SOURCE.LOCAL];
    badge.innerHTML = `<i class="fas ${c.icon}"></i> ${c.text}`;
    badge.className = `source-badge ${c.cls}`;
    badge.classList.remove('hidden');
}


/* =============================================
   セクション11: メイン制御 — 統合分析エンジン
   ============================================= */

/**
 * 分析実行メイン関数
 * @param {string} code - 銘柄コード
 * @param {string|null} sourceOverride - 強制データソース指定
 */
async function analyzeStock(code, sourceOverride = null) {
    // 二重実行防止
    if (appState.isLoading) return;

    // バリデーション（4桁数字のみ）
    const trimmed = (code || '').trim();
    if (!trimmed) {
        showHeaderError('銘柄コードを入力してください。');
        return;
    }
    if (!/^\d{4}$/.test(trimmed)) {
        showHeaderError('銘柄コードは4桁の数字で入力してください。');
        return;
    }

    showHeaderError('');
    const source = sourceOverride || document.getElementById('data-source').value;

    // データソースが「local」の場合、登録銘柄チェック
    if (source === DATA_SOURCE.LOCAL && !stocksData[trimmed]) {
        const availableCodes = Object.keys(stocksData).join('、');
        showHeaderError(`サンプルデータに銘柄「${trimmed}」がありません。\n登録済み: ${availableCodes}`);
        return;
    }

    try {
        const result = await fetchFinancialData(trimmed, source);
        const stock = result.data;

        // フォールバック時のメッセージ表示
        if (result.message) {
            if (result.message.includes('⚠')) {
                showWarning(result.message);
            } else {
                showInfo(result.message);
            }
        } else {
            showInfo(`「${stock.name}」の財務データを株探から正常に取得しました`);
        }

        // スコア計算
        const scoreResult = calculateInvestmentScore(stock);
        const risks = detectRisks(stock);

        // UI切り替え
        document.getElementById('welcome-screen').style.display = 'none';
        const resultEl = document.getElementById('analysis-result');
        resultEl.style.display = 'block';
        resultEl.style.animation = 'none';
        void resultEl.offsetHeight;
        resultEl.style.animation = 'fadeIn 0.4s ease';

        // 各セクション描画
        renderStockInfo(trimmed, stock);
        renderSummaryCards(stock, scoreResult);
        renderRiskWarnings(risks);
        renderScoreDetails(scoreResult);
        renderDataTable(stock.yearlyData);

        // ステータス更新
        updateSourceBadge(result.actualSource);
        updateLastRefreshTime(result.actualSource);

        // 入力フィールド更新
        document.getElementById('stock-code').value = trimmed;
        appState.lastCode = trimmed;

        // LocalStorageに最後に分析した銘柄を保存
        try { localStorage.setItem('lastAnalyzedStock', trimmed); } catch (e) { /* ignore */ }

        // スクロール
        document.getElementById('stock-info-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Analysis failed:', error);
        showMessage(error.message || 'データ取得に失敗しました', 'error');
    }
}


/* =============================================
   セクション12: イベントハンドラ・初期化
   ============================================= */

/** クイック選択ボタン生成 */
function renderQuickButtons() {
    const container = document.getElementById('quick-buttons');
    const entries = Object.entries(stocksData);

    container.innerHTML = entries.map(([code, stock]) =>
        `<button class="quick-btn" data-code="${code}" title="${stock.name}（${stock.sector}）">
            ${code} ${stock.name}
        </button>`
    ).join('');

    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.quick-btn');
        if (btn) analyzeStock(btn.dataset.code);
    });
}

/** イベントリスナーの初期化 */
function initEventListeners() {
    // 検索ボタン
    document.getElementById('search-btn').addEventListener('click', () => {
        const code = document.getElementById('stock-code').value.trim();
        analyzeStock(code);
    });

    // Enterキー
    document.getElementById('stock-code').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            analyzeStock(document.getElementById('stock-code').value.trim());
        }
    });

    // 入力時エラークリア
    document.getElementById('stock-code').addEventListener('input', () => {
        showHeaderError('');
    });

    // 強制更新ボタン
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const code = document.getElementById('stock-code').value.trim() || appState.lastCode;
            if (!code) {
                showWarning('銘柄コードを入力してから更新してください');
                return;
            }
            // キャッシュを無視して株探から強制取得
            analyzeStock(code, DATA_SOURCE.ONLINE);
        });
    }

    // データソース変更時
    const sourceSelect = document.getElementById('data-source');
    if (sourceSelect) {
        sourceSelect.addEventListener('change', () => {
            // データソースが変わったら、現在表示中の銘柄があれば再分析
            if (appState.lastCode) {
                analyzeStock(appState.lastCode);
            }
        });
    }

    // キャッシュクリアボタン
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            clearAllCache();
            showInfo('キャッシュを全て削除しました');
        });
    }
}

/** アプリケーション初期化 */
function init() {
    renderQuickButtons();
    initEventListeners();

    // 初回ロード: ニトリHD（ローカルデータで確実に表示）
    analyzeStock('9843', DATA_SOURCE.LOCAL);
}

// DOMContentLoaded で初期化
document.addEventListener('DOMContentLoaded', init);
