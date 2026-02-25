import { useState, useMemo, useEffect } from 'react'; // 🌟 useEffect 추가
import axios from 'axios'; // 🌟 axios 추가 (API 요청용)
import ToolsHeader from '../../components/ToolsHeader';
// 파일명이 다르면 맞춰주세요!
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

interface MaterialUsage {
    name: string;
    icon: string;
    amount: number;
}

interface Combination extends HoningResult {
    name: string;
    tryCost: number;
    isBreath: boolean;
    isBook: boolean;
    usedMaterials: MaterialUsage[];
}

export default function GeneralReforgePage() {
    const [equipType, setEquipType] = useState<'armor' | 'weapon'>('armor');
    const [targetLevel, setTargetLevel] = useState<number>(11);

    const currentData = refineData[equipType]['t4_1590'][targetLevel];

    // 1. 초기 기본값 설정 (API 호출 실패 시나 로딩 중에 보일 기본 시세)
    const [prices, setPrices] = useState<Record<string, number>>({
        '운명의수호석': 0.06,
        '운명의파괴석': 0.15,
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

    // 🌟 2. 페이지에 처음 들어왔을 때 백엔드에서 실시간 시세 불러오기
    useEffect(() => {
        const fetchMarketPrices = async () => {
            try {
                // 💡 중요: 컨트롤러 기본값이 tier 3이므로, T4 재료를 가져오기 위해 ?tier=4 추가!
                const response = await axios.get('http://localhost:8080/api/v1/market/items?tier=4');
                const apiData = response.data;

                setPrices(prevPrices => {
                    const newPrices = { ...prevPrices };
                    
                    // API 응답 이름 -> 내부 state key 매핑
                    const nameMapping: Record<string, string> = {
                        '운명의 수호석': '운명의수호석',
                        '운명의 파괴석': '운명의파괴석',
                        '운명의 돌파석': '운돌',
                        '아비도스 융화 재료': '아비도스',
                        // 파편 주머니는 별도 로직으로 처리하므로 매핑에서 제외하거나 무시됨
                        '빙하의 숨결': '빙하',
                        '용암의 숨결': '용암',
                        '재봉술 : 업화 (기본)': '재봉술업화A',
                        '재봉술 : 업화 (응용)': '재봉술업화B',
                        '재봉술 : 업화 (심화)': '재봉술업화C',
                        '야금술 : 업화 (기본)': '야금술업화A',
                        '야금술 : 업화 (응용)': '야금술업화B',
                        '야금술 : 업화 (심화)': '야금술업화C',
                    };

                    const shardPrices: number[] = [];

                    // 🌟 LostArkMarketItemDto 구조(name, recentPrice, minPrice)에 완벽하게 맞춤
                    apiData.forEach((item: any) => {
                        const priceToUse = item.recentPrice > 0 ? item.recentPrice : item.minPrice;

                        // 운명의 파편 주머니 (소/중/대) 처리 - 1000, 2000, 3000개 기준
                        // 소수점 3자리까지 계산하여 저장
                        if (item.name === '운명의 파편 주머니(소)') {
                            shardPrices.push(Number((priceToUse / 1000).toFixed(3)));
                        } else if (item.name === '운명의 파편 주머니(중)') {
                            shardPrices.push(Number((priceToUse / 2000).toFixed(3)));
                        } else if (item.name === '운명의 파편 주머니(대)') {
                            shardPrices.push(Number((priceToUse / 3000).toFixed(3)));
                        } else {
                            // 일반 재료 처리
                            const mappedName = nameMapping[item.name] || item.name;
                            if (newPrices[mappedName] !== undefined) {
                                // 묶음(bundle) 단위가 있는 경우 해당 단위로 나눔
                                const bundleUnit = item.bundle > 0 ? item.bundle : 1;
                                newPrices[mappedName] = Number((priceToUse / bundleUnit).toFixed(3));
                            }
                        }
                    });

                    // 파편 주머니 중 가장 저렴한 1개당 가격 적용
                    if (shardPrices.length > 0) {
                        newPrices['운명파편'] = Math.min(...shardPrices);
                    }

                    return newPrices;
                });
            } catch (error) {
                console.error("시세 API를 불러오지 못했습니다. 설정된 기본값을 유지합니다.", error);
            }
        };

        fetchMarketPrices();
    }, []);

    // 3. 사용자가 입력칸을 조작하면 수동으로 가격 변경
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
                actualRate = 1.0;
            } else {
                let failureBonus = Math.min((step - 1) * 0.1 * rate, rate);
                actualRate = rate + failureBonus + Number(addRate);
                if (actualRate > 1.0) actualRate = 1.0;

                stepCost += Number(addCost);
            }

            expectedCost += probReachingThisStep * stepCost;
            expectedTries += probReachingThisStep * 1;

            if (actualRate >= 1.0) break;

            let failRate = 1.0 - actualRate;
            let nextProb = probReachingThisStep * failRate;

            let aeGain = actualRate / 2.15;
            currentArtisanEnergy += aeGain;
            probReachingThisStep = nextProb;
        }

        return {
            expectedCost: Math.round(expectedCost),
            expectedTries: Math.round(expectedTries), // 🌟 평균 시도 횟수 반올림 처리
            maxCost: Math.round((step - 1) * (Number(tryCost) + Number(addCost)) + Number(tryCost)),
            maxTries: step
        };
    };

    const combinations = useMemo<Combination[]>(() => {
        if (!currentData || materials.length === 0) return [];

        const baseMaterials = materials.filter(m => !m.isBreath);
        const baseTryCost = baseMaterials.reduce((sum, mat) => sum + (mat.amount * mat.price), 0);
        
        const books = materials.filter(m => m.isBreath && m.maxUse === 1);
        const breaths = materials.filter(m => m.isBreath && (m.maxUse || 0) > 1);

        const results: Combination[] = [];

        // 1. 노숨
        const baseUsage = baseMaterials.map(m => ({ name: m.name, icon: m.icon, amount: m.amount }));
        results.push({ 
            name: "노숨 (기본)", 
            tryCost: Math.round(baseTryCost), 
            isBreath: false, 
            isBook: false, 
            usedMaterials: baseUsage,
            ...calculateHoningExpectation(currentData.baseProb, baseTryCost, 0, 0) 
        });

        // 2. 책만 사용
        if (books.length > 0) {
            const bookProb = books[0].addedProb || 0;
            const bookCost = books[0].price;
            const bookUsage = [
                ...baseUsage,
                { name: books[0].name, icon: books[0].icon, amount: 1 }
            ];
            results.push({ 
                name: "책만 사용", 
                tryCost: Math.round(baseTryCost + bookCost), 
                isBreath: false, 
                isBook: true, 
                usedMaterials: bookUsage,
                ...calculateHoningExpectation(currentData.baseProb, baseTryCost, bookProb, bookCost) 
            });
        }

        // 3. 숨결만 풀숨
        if (breaths.length > 0) {
            let breathProb = 0; let breathCost = 0;
            const breathUsage = [...baseUsage];
            breaths.forEach(b => { 
                const amount = b.maxUse || 0;
                breathProb += amount * (b.addedProb || 0); 
                breathCost += amount * b.price; 
                breathUsage.push({ name: b.name, icon: b.icon, amount: amount });
            });
            results.push({ 
                name: "숨결만 풀숨", 
                tryCost: Math.round(baseTryCost + breathCost), 
                isBreath: true, 
                isBook: false, 
                usedMaterials: breathUsage,
                ...calculateHoningExpectation(currentData.baseProb, baseTryCost, breathProb, breathCost) 
            });
        }

        // 4. 풀숨 (책+숨결)
        if (books.length > 0 && breaths.length > 0) {
            let totalProb = books[0].addedProb || 0; let totalCost = books[0].price;
            const fullUsage = [...baseUsage];
            // 책 추가
            fullUsage.push({ name: books[0].name, icon: books[0].icon, amount: 1 });
            // 숨결 추가
            breaths.forEach(b => { 
                const amount = b.maxUse || 0;
                totalProb += amount * (b.addedProb || 0); 
                totalCost += amount * b.price; 
                fullUsage.push({ name: b.name, icon: b.icon, amount: amount });
            });
            results.push({ 
                name: "풀숨 (책+숨결)", 
                tryCost: Math.round(baseTryCost + totalCost),
                isBreath: true, 
                isBook: true, 
                usedMaterials: fullUsage,
                ...calculateHoningExpectation(currentData.baseProb, baseTryCost, totalProb, totalCost) 
            });
        }

        return results.sort((a, b) => a.expectedCost - b.expectedCost);
    }, [materials, currentData]);

    const optimal = combinations[0];

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
                                <input type="number" className="price-input" step="0.001" value={mat.price} onChange={(e) => handlePriceChange(mat.id, parseFloat(e.target.value))} />
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

                            <section className="content-card">
                                <div className="card-header"><span className="card-title">누적 재료 소모량 (최적 조합 기준)</span></div>
                                <div className="material-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <div className="stat-label" style={{marginBottom: '10px', textAlign: 'center', color: '#a970ff'}}>평균 시도 ({optimal.expectedTries}회)</div>
                                        {optimal.usedMaterials.map(mat => (
                                            <div key={mat.name} className="material-item" style={{justifyContent: 'space-between'}}>
                                                <span>{mat.icon} {mat.name}</span>
                                                <span>{Math.round(mat.amount * optimal.expectedTries).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="stat-label" style={{marginBottom: '10px', textAlign: 'center', color: '#ffcc00'}}>장기백 ({optimal.maxTries}회)</div>
                                        {optimal.usedMaterials.map(mat => (
                                            <div key={mat.name} className="material-item" style={{justifyContent: 'space-between'}}>
                                                <span>{mat.icon} {mat.name}</span>
                                                <span>{(mat.amount * optimal.maxTries).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

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