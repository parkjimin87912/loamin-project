import { useState, useMemo } from 'react';
import ToolsHeader from '../../components/ToolsHeader';
// 🌟 복사하신 아이스펭 데이터 파일의 경로입니다. 파일명(data.ts)이 다르면 맞춰주세요!
import { refineData } from '../../data/refineData.ts';
import '../../App.css';

interface Material {
    id: string;
    name: string;
    icon: string;
    amount: number;
    price: number;
    isBreath?: boolean;
    addedProb?: number;
    maxUse?: number;
}

interface HoningResult {
    expectedCost: number;
    expectedTries: number;
    maxCost: number;
    maxTries: number;
}

export default function GeneralReforgePage() {
    const [equipType, setEquipType] = useState<'armor' | 'weapon'>('armor');
    const [targetLevel, setTargetLevel] = useState<number>(11);

    const currentData = refineData[equipType]['t4_1590'][targetLevel];

    const [prices, setPrices] = useState<Record<string, number>>({
        '운명의수호석': 0.5,
        '운명의파괴석': 1.2,
        '운돌': 25,
        '아비도스': 85,
        '운명파편': 0.1,
        '골드': 1,
        '빙하': 260,
        '용암': 300,
        '재봉술업화A': 500,
        '재봉술업화B': 800,
        '재봉술업화C': 1200,
        '야금술업화A': 600,
        '야금술업화B': 1000,
        '야금술업화C': 1500,
    });

    const handlePriceChange = (name: string, newPrice: number) => {
        setPrices(prev => ({ ...prev, [name]: newPrice }));
    };

    const materials = useMemo<Material[]>(() => {
        if (!currentData) return [];
        const result: Material[] = [];

        Object.entries(currentData.amount).forEach(([name, amount]) => {
            let icon = '📦';
            if (name.includes('수호석')) icon = '💎';
            if (name.includes('파괴석')) icon = '🗡️';
            if (name.includes('돌')) icon = '🔮';
            if (name.includes('아비도스')) icon = '🟤';
            if (name.includes('파편')) icon = '🧩';
            if (name === '골드') icon = '💰';

            result.push({
                id: name, name, icon, amount: Number(amount), price: Number(prices[name]) || 0
            });
        });

        if (currentData.breath) {
            Object.entries(currentData.breath).forEach(([name, [maxUse, addedProb]]) => {
                let icon = '📜';
                if (name.includes('빙하') || name.includes('용암')) icon = '❄️';
                result.push({
                    id: name, name, icon, amount: 0, price: Number(prices[name]) || 0,
                    isBreath: true, maxUse: Number(maxUse), addedProb: Number(addedProb)
                });
            });
        }
        return result;
    }, [currentData, prices]);

    // ==========================================
    // 🧮 완벽하게 수정된 로스트아크 장기백 엔진
    // ==========================================
    const calculateHoningExpectation = (baseRate: number, tryCost: number, addRate: number = 0, addCost: number = 0): HoningResult => {
        let expectedCost = 0;
        let expectedTries = 0;
        let currentArtisanEnergy = 0;
        let probReachingThisStep = 1.0;
        let step = 0;
        const rate = Number(baseRate);

        while (probReachingThisStep > 0.0000001) {
            step++;
            let actualRate = 0;
            let stepCost = Number(tryCost);

            if (currentArtisanEnergy >= 1.0) {
                // 🌟 버그 수정: 장기백 100% 달성 시 숨결/책 비용(addCost)을 더하지 않음!
                actualRate = 1.0;
            } else {
                let failureBonus = Math.min((step - 1) * 0.1 * rate, rate);
                actualRate = rate + failureBonus + Number(addRate);
                if (actualRate > 1.0) actualRate = 1.0;

                stepCost += Number(addCost); // 🌟 장기백이 아닐 때만 추가 재료비 청구
            }

            expectedCost += probReachingThisStep * stepCost;
            expectedTries += probReachingThisStep * 1;

            if (actualRate >= 1.0) break;

            let failRate = 1.0 - actualRate;
            let nextProb = probReachingThisStep * failRate;

            // 장기백 누적 공식
            let aeGain = actualRate / 2.15;
            currentArtisanEnergy += aeGain;
            probReachingThisStep = nextProb;
        }

        return {
            expectedCost: Math.round(expectedCost),
            expectedTries: Number(expectedTries.toFixed(2)),
            maxCost: Math.round((step - 1) * (Number(tryCost) + Number(addCost)) + Number(tryCost)),
            maxTries: step
        };
    };

    // 🌟 4가지 모든 경우의 수(노숨, 책, 숨결, 풀숨)를 시뮬레이션하고 싼 순서대로 줄세우기
    const combinations = useMemo(() => {
        if (!currentData || materials.length === 0) return [];

        const baseTryCost = materials.filter(m => !m.isBreath).reduce((sum, mat) => sum + (mat.amount * mat.price), 0);
        // 책은 최대 사용량이 1개, 숨결은 여러 개로 구분
        const books = materials.filter(m => m.isBreath && m.maxUse === 1);
        const breaths = materials.filter(m => m.isBreath && (m.maxUse || 0) > 1);

        const results = [];

        // 1. 노숨 (기본)
        results.push({ name: "노숨 (기본)", tryCost: baseTryCost, isBreath: false, isBook: false, ...calculateHoningExpectation(currentData.baseProb, baseTryCost, 0, 0) });

        // 2. 책만 사용
        if (books.length > 0) {
            const bookProb = books[0].addedProb || 0;
            const bookCost = books[0].price;
            results.push({ name: "책만 사용", tryCost: baseTryCost + bookCost, isBreath: false, isBook: true, ...calculateHoningExpectation(currentData.baseProb, baseTryCost, bookProb, bookCost) });
        }

        // 3. 숨결만 사용
        if (breaths.length > 0) {
            let breathProb = 0; let breathCost = 0;
            breaths.forEach(b => { breathProb += (b.maxUse || 0) * (b.addedProb || 0); breathCost += (b.maxUse || 0) * b.price; });
            results.push({ name: "숨결만 풀숨", tryCost: baseTryCost + breathCost, isBreath: true, isBook: false, ...calculateHoningExpectation(currentData.baseProb, baseTryCost, breathProb, breathCost) });
        }

        // 4. 풀숨 (책 + 숨결)
        if (books.length > 0 && breaths.length > 0) {
            let totalProb = books[0].addedProb || 0; let totalCost = books[0].price;
            breaths.forEach(b => { totalProb += (b.maxUse || 0) * (b.addedProb || 0); totalCost += (b.maxUse || 0) * b.price; });
            results.push({ name: "풀숨 (책+숨결)", tryCost: baseTryCost + totalCost, isBreath: true, isBook: true, ...calculateHoningExpectation(currentData.baseProb, baseTryCost, totalProb, totalCost) });
        }

        // 기댓값(비용)이 제일 적은 순서대로 오름차순 정렬
        return results.sort((a, b) => a.expectedCost - b.expectedCost);
    }, [materials, currentData]);

    const optimal = combinations[0]; // 무조건 1등(가장 싼 조합)이 최적 조합

    if (!currentData) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>데이터를 불러올 수 없습니다.</div>;

    return (
        <div className="container">
            <ToolsHeader />
            <div className="reforge-container">
                <aside className="sidebar-card">
                    <div className="sidebar-title">재련 설정</div>
                    <p className="sidebar-desc">T4 1590 장비 기준 오피셜 데이터입니다.</p>

                    <div className="type-selector">
                        <button className={`type-btn ${equipType === 'armor' ? 'active' : ''}`} onClick={() => { setEquipType('armor'); setTargetLevel(11); }}>🛡️ 방어구</button>
                        <button className={`type-btn ${equipType === 'weapon' ? 'active' : ''}`} onClick={() => { setEquipType('weapon'); setTargetLevel(11); }}>⚔️ 무기</button>
                    </div>

                    <select className="custom-select" value={targetLevel} onChange={(e) => setTargetLevel(Number(e.target.value))}>
                        {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(level => (
                            <option key={level} value={level}>{level - 1} → {level}강 (기본 {Math.round(refineData[equipType]['t4_1590'][level].baseProb * 100)}%)</option>
                        ))}
                    </select>

                    <div className="sidebar-title" style={{fontSize:'13px', marginTop:'20px', marginBottom:'10px'}}>1회 기본 소모 재료</div>
                    <div className="material-list">
                        {materials.filter(m => !m.isBreath).map(mat => (
                            <div key={mat.id} className="material-item">
                                <span className="mat-name">{mat.icon} {mat.name}</span>
                                <span className="mat-qty">{mat.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="sidebar-title" style={{fontSize:'13px', marginTop:'20px', marginBottom:'10px'}}>재료 시세 (골드) 직접 입력</div>
                    <div>
                        {materials.map(mat => mat.id !== '골드' && (
                            <div key={mat.id} className="price-input-row">
                                <span className="mat-name" style={{fontSize:'13px', color:'var(--text-secondary)'}}>{mat.icon} {mat.name}</span>
                                <input type="number" className="price-input" value={mat.price} onChange={(e) => handlePriceChange(mat.id, parseFloat(e.target.value))} />
                            </div>
                        ))}
                    </div>
                </aside>

                <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {optimal && (
                        <>
                            <section className="content-card" style={{ border: '2px solid #a970ff', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-12px', left: '20px', background: '#a970ff', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                                    가장 훌륭한 효율 조합 추천!
                                </div>
                                <div className="card-header" style={{ marginTop: '10px' }}>
                                    <span className="card-title">{optimal.name}</span>
                                </div>
                                <div className="optimal-grid">
                                    <div className="stat-box">
                                        <div className="stat-label">평균 기댓값 (비용)</div>
                                        <div className="stat-gold" style={{ color: '#a970ff' }}>{optimal.expectedCost.toLocaleString()} G</div>
                                        <div className="stat-value" style={{ fontSize: '14px', marginTop: '5px' }}>평균 {optimal.expectedTries}회 시도</div>
                                    </div>
                                    <div className="stat-box">
                                        <div className="stat-label">장기백 시 (최악의 운)</div>
                                        <div className="stat-gold" style={{ color: '#ffcc00' }}>{optimal.maxCost.toLocaleString()} G</div>
                                        <div className="stat-value" style={{ fontSize: '14px', marginTop: '5px' }}>최대 {optimal.maxTries}회 시도</div>
                                    </div>
                                </div>
                            </section>

                            {/* 4가지 전략 순위 리스트 */}
                            <section className="content-card">
                                <div className="card-header"><span className="card-title">모든 조합 기댓값 순위</span></div>
                                <table className="prob-table">
                                    <thead>
                                    <tr>
                                        <th>순위</th>
                                        <th>조합 방식</th>
                                        <th>1회 시도 비용</th>
                                        <th>평균 시도</th>
                                        <th>평균 기댓값</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {combinations.map((combo, index) => (
                                        <tr key={combo.name} style={{ backgroundColor: index === 0 ? 'rgba(169, 112, 255, 0.1)' : 'transparent' }}>
                                            <td style={{ fontWeight: 'bold', color: index === 0 ? '#a970ff' : '#aaa' }}>{index + 1}위</td>
                                            <td style={{ color: index === 0 ? '#a970ff' : 'var(--text-secondary)', fontWeight: index === 0 ? 'bold' : 'normal' }}>{combo.name}</td>
                                            <td>{combo.tryCost.toLocaleString()} G</td>
                                            <td>{combo.expectedTries}회</td>
                                            <td style={{ fontWeight: 'bold', color: index === 0 ? '#fff' : '#ccc' }}>{combo.expectedCost.toLocaleString()} G</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}