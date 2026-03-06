import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import ToolsHeader from '../../components/ToolsHeader';
import { refineData } from '../../data/refineData.ts';
import '../../App.css';

interface Material {
    id: string; name: string; icon: string; amount: number; price: number;
    isBreath?: boolean; addedProb?: number; maxUse?: number;
}

interface HoningStep {
    step: number; baseProb: number; bookProb: number; breathProb: number;
    totalProb: number; cumulativeProb: number; artisanEnergy: number;
    stepCost: number; cumulativeCost: number; actionId: string; // 🌟 추가: 해당 스텝의 액션 이름
}

interface MaterialUsage {
    name: string; icon: string; expectedAmount: number; maxAmount: number; // 🌟 예상 소모량과 최대 소모량 분리
}

interface Combination {
    name: string; desc: string; tryCost: number;
    expectedCost: number; expectedTries: number;
    maxCost: number; maxTries: number;
    steps: HoningStep[];
    usedMaterials: MaterialUsage[];
}

export default function GeneralReforgePage() {
    const [equipType, setEquipType] = useState<'armor' | 'weapon'>('armor');
    const [gearType, setGearType] = useState<'t4_1590' | 't4_1730'>('t4_1590');
    const [targetLevel, setTargetLevel] = useState<number>(11);

    const [selectedComboName, setSelectedComboName] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);
    const [isRankExpanded, setIsRankExpanded] = useState<boolean>(false);
    const [itemIcons, setItemIcons] = useState<Record<string, string>>({}); // 🌟 아이콘 상태 추가

    const currentData = refineData[equipType][gearType]?.[targetLevel];

    const [prices, setPrices] = useState<Record<string, number>>({
        '운명의수호석': 0.06, '운명의파괴석': 0.15, '운돌': 25, '아비도스': 85,
        '운명파편': 0.1, '골드': 1, '빙하': 260, '용암': 300,
        '재봉술업화A': 500, '재봉술업화B': 800, '재봉술업화C': 1200,
        '야금술업화A': 600, '야금술업화B': 1000, '야금술업화C': 1500,
        '운명의수호석결정': 0.1, '운명의파괴석결정': 0.3, '위운돌': 50, '상급아비도스': 150,
    });

    // 🌟 2. 페이지에 처음 들어왔을 때 백엔드에서 실시간 시세 불러오기
    useEffect(() => {
        const fetchMarketPrices = async () => {
            try {
                // 💡 중요: 재련 재료(50010)와 보조 재료(50020)를 모두 가져오도록 Promise.all 사용!
                const [matResponse, subMatResponse] = await Promise.all([
                    axios.get('/api/v1/market/items', {
                        params: { category: 'reforge', subCategory: '재련 재료', tier: 4 }
                    }),
                    axios.get('/api/v1/market/items', {
                        params: { category: 'reforge', subCategory: '재련 보조 재료', tier: 4 }
                    })
                ]);

                // 두 API 결과를 하나로 합칩니다.
                const apiData = [
                    ...(Array.isArray(matResponse.data) ? matResponse.data : []),
                    ...(Array.isArray(subMatResponse.data) ? subMatResponse.data : [])
                ];

                setPrices(prevPrices => {
                    const newPrices = { ...prevPrices };
                    const newIcons: Record<string, string> = {}; // 🌟 아이콘 매핑

                    // 🌟 공식 이름 매핑으로 교체 완료!
                    const nameMapping: Record<string, string> = {
                        '운명의 수호석': '운명의수호석', '운명의 파괴석': '운명의파괴석', '운명의 돌파석': '운돌',
                        '아비도스 융화 재료': '아비도스', '빙하의 숨결': '빙하', '용암의 숨결': '용암',

                        '재봉술 : 업화 [11-14]': '재봉술업화A',
                        '재봉술 : 업화 [15-18]': '재봉술업화B',
                        '재봉술 : 업화 [19-20]': '재봉술업화C',

                        '야금술 : 업화 [11-14]': '야금술업화A',
                        '야금술 : 업화 [15-18]': '야금술업화B',
                        '야금술 : 업화 [19-20]': '야금술업화C',

                        '운명의 수호석 결정': '운명의수호석결정', '운명의 파괴석 결정': '운명의파괴석결정',
                        '위대한 운명의 돌파석': '위운돌', '아비도스 융화 재료(상급)': '상급아비도스',
                        '상급 아비도스 융화 재료': '상급아비도스', // 🌟 추가 매핑
                    };

                    const shardPrices: number[] = [];
                    apiData.forEach((item: any) => {
                        const priceToUse = item.recentPrice > 0 ? item.recentPrice : item.minPrice;
                        
                        // 🌟 아이콘 매핑
                        const mappedName = nameMapping[item.name] || item.name;
                        if (item.icon) newIcons[mappedName] = item.icon;
                        if (item.name.includes('운명의 파편 주머니')) {
                            if (!newIcons['운명파편']) newIcons['운명파편'] = item.icon;
                        }

                        if (item.name === '운명의 파편 주머니(소)') shardPrices.push(Number((priceToUse / 1000).toFixed(3)));
                        else if (item.name === '운명의 파편 주머니(중)') shardPrices.push(Number((priceToUse / 2000).toFixed(3)));
                        else if (item.name === '운명의 파편 주머니(대)') shardPrices.push(Number((priceToUse / 3000).toFixed(3)));
                        else {
                            if (newPrices[mappedName] !== undefined) {
                                const bundleUnit = item.bundle > 0 ? item.bundle : 1;
                                newPrices[mappedName] = Number((priceToUse / bundleUnit).toFixed(3));
                            }
                        }
                    });
                    if (shardPrices.length > 0) newPrices['운명파편'] = Math.min(...shardPrices);
                    
                    setItemIcons(prev => ({ ...prev, ...newIcons })); // 🌟 아이콘 상태 업데이트
                    return newPrices;
                });
            } catch (error) {
                console.error("시세 API를 불러오지 못했습니다.", error);
            }
        };
        fetchMarketPrices();
    }, []);

    const handlePriceChange = (name: string, newPrice: number) => {
        setPrices(prev => ({ ...prev, [name]: newPrice }));
    };

    const materials = useMemo<Material[]>(() => {
        if (!currentData) return [];
        const result: Material[] = [];
        Object.entries(currentData.amount).forEach(([name, amount]) => {
            let icon = itemIcons[name];
            if (!icon) {
                // 🌟 이미지 URL 하드코딩 (Fallback)
                if (name === '골드') icon = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/money/money_4.png';
                else if (name.includes('수호석')) icon = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_7_55.png';
                else if (name.includes('파괴석')) icon = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_7_54.png';
                else if (name.includes('돌')) icon = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_11_101.png';
                else if (name === '아비도스') icon = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_11_102.png';
                else if (name === '상급아비도스') icon = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_252.png'; // 🌟 상급 아비도스 URL 수정
                else if (name.includes('파편')) icon = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_6_109.png';
                else icon = '📦';
            }
            result.push({ id: name, name, icon, amount: Number(amount), price: Number(prices[name]) || 0 });
        });
        if (currentData.breath) {
            Object.entries(currentData.breath).forEach(([name, [maxUse, addedProb]]) => {
                let icon = itemIcons[name];
                if (!icon) {
                    if (name.includes('빙하')) icon = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_3_232.png';
                    else if (name.includes('용암')) icon = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_3_233.png';
                    else icon = '📜';
                }
                result.push({ id: name, name, icon, amount: 0, price: Number(prices[name]) || 0, isBreath: true, maxUse: Number(maxUse), addedProb: Number(addedProb) });
            });
        }
        return result;
    }, [currentData, prices, itemIcons]);

    // ==========================================
    // 🌟 DP(동적 계획법) 기반 시뮬레이터 엔진
    // ==========================================
    const combinations = useMemo<Combination[]>(() => {
        if (!currentData || materials.length === 0) return [];

        const baseMaterials = materials.filter(m => !m.isBreath);
        const baseTryCost = baseMaterials.reduce((sum, mat) => sum + (mat.amount * mat.price), 0);

        const books = materials.filter(m => m.isBreath && m.maxUse === 1);
        const breaths = materials.filter(m => m.isBreath && (m.maxUse || 0) > 1);

        let bookProb = 0; let bookCost = 0; let bookName = ""; let bookIcon = "";
        if (books.length > 0) { bookProb = books[0].addedProb || 0; bookCost = books[0].price; bookName = books[0].name; bookIcon = books[0].icon; }

        let breathProb = 0; let breathCost = 0; let breathMaxUse = 0; let breathName = ""; let breathIcon = "";
        if (breaths.length > 0) {
            breaths.forEach(b => { breathProb += (b.maxUse || 0) * (b.addedProb || 0); breathCost += (b.maxUse || 0) * b.price; breathMaxUse = b.maxUse || 0; breathName = b.name; breathIcon = b.icon; });
        }

        const dpActions = [
            { id: "노숨", book: 0, bookC: 0, breath: 0, breathC: 0 },
            { id: "책", book: bookProb, bookC: bookCost, breath: 0, breathC: 0 },
            { id: "숨결", book: 0, bookC: 0, breath: breathProb, breathC: breathCost },
            { id: "풀숨", book: bookProb, bookC: bookCost, breath: breathProb, breathC: breathCost }
        ].filter(a => !(a.book === 0 && a.breath === 0 && a.id !== "노숨" && (a.bookC > 0 || a.breathC > 0))); // 의미없는 액션 제거

        // 1. DP 최적화 배열 채우기
        const memo = new Map<string, any>();
        const dp = (step: number, artisan: number): any => {
            if (artisan >= 1.0) return { expectedCost: 0, expectedTries: 0, maxCost: 0 };
            const key = `${step}_${artisan.toFixed(6)}`;
            if (memo.has(key)) return memo.get(key);

            let rateBase = currentData.baseProb + Math.min(step * 0.1 * currentData.baseProb, currentData.baseProb);
            let minExpectedCost = Infinity; let bestExpectedTries = 0; let bestMaxCost = 0; let bestAction = dpActions[0];

            for (const action of dpActions) {
                let actualRate = Math.min(rateBase + action.book + action.breath, 1.0);
                let stepCost = baseTryCost + action.bookC + action.breathC;

                if (actualRate >= 1.0) {
                    if (stepCost < minExpectedCost) {
                        minExpectedCost = stepCost; bestExpectedTries = 1; bestMaxCost = stepCost; bestAction = action;
                    }
                    continue;
                }

                let failRate = 1.0 - actualRate;
                let nextArtisan = artisan + (actualRate / 2.15);
                let nextState = dp(step + 1, nextArtisan);
                let currentExpectedCost = stepCost + (failRate * nextState.expectedCost);

                if (currentExpectedCost < minExpectedCost) {
                    minExpectedCost = currentExpectedCost; bestExpectedTries = 1 + (failRate * nextState.expectedTries);
                    bestMaxCost = stepCost + nextState.maxCost; bestAction = action;
                }
            }
            const result = { expectedCost: minExpectedCost, expectedTries: bestExpectedTries, maxCost: bestMaxCost, bestAction };
            memo.set(key, result); return result;
        };
        dp(0, 0);

        // 2. 전략을 시뮬레이션하여 데이터 추출하는 함수 (DP 결과 또는 고정 매크로)
        const simulateStrategy = (name: string, isDynamic: boolean, fixedActionId: string = "노숨"): Combination => {
            let expectedCost = 0; let expectedTries = 0; let currentArtisanEnergy = 0;
            let probReachingThisStep = 1.0; let step = 0; let cumulativeCost = 0; let cumulativeFailProb = 1.0;
            const steps: HoningStep[] = [];

            // 재료 소모량 추적 (예상치, 최대치)
            const matUsage: Record<string, { expected: number, max: number }> = {};
            baseMaterials.forEach(m => matUsage[m.name] = { expected: 0, max: 0 });
            if (bookName) matUsage[bookName] = { expected: 0, max: 0 };
            if (breathName) matUsage[breathName] = { expected: 0, max: 0 };

            const path: string[] = [];

            while (probReachingThisStep > 0.0000001) {
                const action = isDynamic
                    ? (currentArtisanEnergy >= 1.0 ? dpActions[0] : memo.get(`${step}_${currentArtisanEnergy.toFixed(6)}`)?.bestAction || dpActions[0])
                    : dpActions.find(a => a.id === fixedActionId) || dpActions[0];

                path.push(action.id);
                step++;

                let currentBaseProb = currentData.baseProb + Math.min((step - 1) * 0.1 * currentData.baseProb, currentData.baseProb);
                let actualRate = 0; let stepCost = baseTryCost;

                if (currentArtisanEnergy >= 1.0) {
                    actualRate = 1.0; currentBaseProb = 1.0;
                } else {
                    actualRate = Math.min(currentBaseProb + action.book + action.breath, 1.0);
                    stepCost += action.bookC + action.breathC;
                }

                cumulativeCost += stepCost;
                cumulativeFailProb *= (1 - actualRate);
                const cumulativeSuccessProb = 1 - cumulativeFailProb;

                // 소모량 추적 (DP를 위해 각 스텝마다의 확률적 누적치 계산)
                baseMaterials.forEach(m => {
                    matUsage[m.name].expected += probReachingThisStep * m.amount;
                    matUsage[m.name].max += m.amount;
                });
                if (bookName && action.book > 0 && currentArtisanEnergy < 1.0) {
                    matUsage[bookName].expected += probReachingThisStep * 1;
                    matUsage[bookName].max += 1;
                }
                if (breathName && action.breath > 0 && currentArtisanEnergy < 1.0) {
                    matUsage[breathName].expected += probReachingThisStep * breathMaxUse;
                    matUsage[breathName].max += breathMaxUse;
                }

                steps.push({
                    step, baseProb: currentBaseProb, actionId: action.id,
                    bookProb: currentArtisanEnergy >= 1.0 ? 0 : action.book,
                    breathProb: currentArtisanEnergy >= 1.0 ? 0 : action.breath,
                    totalProb: actualRate, cumulativeProb: cumulativeSuccessProb,
                    artisanEnergy: currentArtisanEnergy, stepCost, cumulativeCost
                });

                expectedCost += probReachingThisStep * stepCost;
                expectedTries += probReachingThisStep * 1;

                if (actualRate >= 1.0) break;

                currentArtisanEnergy += actualRate / 2.15;
                probReachingThisStep *= (1.0 - actualRate);
            }

            // 전략 이름 압축 로직 (1~2회 풀숨 ➔ 이후 노숨)
            let desc = "전구간 " + fixedActionId;
            if (isDynamic) {
                const pathSegments = []; let currentAction = path[0]; let count = 0; let startIdx = 1;
                for (let i = 0; i < path.length; i++) {
                    if (path[i] === currentAction) count++;
                    else {
                        pathSegments.push(`${startIdx}~${startIdx + count - 1}회 ${currentAction}`);
                        currentAction = path[i]; startIdx = i + 1; count = 1;
                    }
                }
                if (count > 0) pathSegments.push(startIdx === 1 ? `전구간 ${currentAction}` : `이후 ${currentAction}`);
                desc = pathSegments.join(" ➔ ");
            }

            // MaterialUsage 배열화
            const usedMaterials: MaterialUsage[] = [];
            baseMaterials.forEach(m => usedMaterials.push({ name: m.name, icon: m.icon, expectedAmount: matUsage[m.name].expected, maxAmount: matUsage[m.name].max }));
            if (bookName && matUsage[bookName].max > 0) usedMaterials.push({ name: bookName, icon: bookIcon, expectedAmount: matUsage[bookName].expected, maxAmount: matUsage[bookName].max });
            if (breathName && matUsage[breathName].max > 0) usedMaterials.push({ name: breathName, icon: breathIcon, expectedAmount: matUsage[breathName].expected, maxAmount: matUsage[breathName].max });

            return {
                name, desc, tryCost: baseTryCost,
                expectedCost: Math.round(expectedCost), expectedTries: Math.round(expectedTries), // 🌟 반올림 적용
                maxCost: Math.round(cumulativeCost), maxTries: step,
                steps, usedMaterials
            };
        };

        const results: Combination[] = [];
        results.push(simulateStrategy("노숨 (기본)", false, "노숨"));
        if (books.length > 0) results.push(simulateStrategy("책만 사용", false, "책"));
        if (breaths.length > 0) results.push(simulateStrategy("숨결만 풀숨", false, "숨결"));
        if (books.length > 0 && breaths.length > 0) results.push(simulateStrategy("풀숨 (책+숨결)", false, "풀숨"));
        results.push(simulateStrategy("✨ 스마트 혼합 전략", true));

        return results.sort((a, b) => a.expectedCost - b.expectedCost);
    }, [materials, currentData]);

    const optimal = combinations[0];

    useEffect(() => {
        if (optimal) {
            setSelectedComboName(optimal.name);
            setIsTableExpanded(false);
        }
    }, [optimal]);

    const currentCombo = combinations.find(c => c.name === selectedComboName) || optimal;

    // 🌟 이름 변환 헬퍼 함수
    const getDisplayName = (name: string) => {
        const nameMap: Record<string, string> = {
            '재봉술업화A': '재봉술 : 업화 [11-14]',
            '재봉술업화B': '재봉술 : 업화 [15-18]',
            '재봉술업화C': '재봉술 : 업화 [19-20]',
            '야금술업화A': '야금술 : 업화 [11-14]',
            '야금술업화B': '야금술 : 업화 [15-18]',
            '야금술업화C': '야금술 : 업화 [19-20]',
            '운명의수호석': '운명의 수호석',
            '운명의파괴석': '운명의 파괴석',
            '운돌': '운명의 돌파석',
            '아비도스': '아비도스 융화 재료',
            '상급아비도스': '상급 아비도스 융화 재료',
            '운명파편': '운명의 파편',
            '빙하': '빙하의 숨결',
            '용암': '용암의 숨결',
            '운명의수호석결정': '운명의 수호석 결정',
            '운명의파괴석결정': '운명의 파괴석 결정',
            '위운돌': '위대한 운명의 돌파석',
            '골드': '골드'
        };
        return nameMap[name] || name;
    };

    if (!currentData) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>데이터를 불러올 수 없습니다.</div>;

    return (
        <div className="container">
            <ToolsHeader />
            <div className="reforge-container">
                <aside className="sidebar-card">
                    <div className="sidebar-title">재련 설정</div>
                    <p className="sidebar-desc">{gearType === 't4_1590' ? 'T4 에기르 (1590)' : 'T4 세르카 (1730)'} 장비 기준 오피셜 데이터입니다.</p>

                    <div className="type-selector">
                        <button className={`type-btn ${gearType === 't4_1590' ? 'active' : ''}`} onClick={() => { setGearType('t4_1590'); setTargetLevel(11); }}>에기르 (1590)</button>
                        <button className={`type-btn ${gearType === 't4_1730' ? 'active' : ''}`} onClick={() => { setGearType('t4_1730'); setTargetLevel(11); }}>세르카 (1730)</button>
                    </div>

                    <div className="type-selector" style={{ marginTop: '10px' }}>
                        <button className={`type-btn ${equipType === 'armor' ? 'active' : ''}`} onClick={() => { setEquipType('armor'); setTargetLevel(11); }}>🛡️ 방어구</button>
                        <button className={`type-btn ${equipType === 'weapon' ? 'active' : ''}`} onClick={() => { setEquipType('weapon'); setTargetLevel(11); }}>⚔️ 무기</button>
                    </div>

                    <select className="custom-select" value={targetLevel} onChange={(e) => setTargetLevel(Number(e.target.value))}>
                        {Array.from({ length: 15 }, (_, i) => i + 11).map(level => (
                            <option key={level} value={level}>
                                {level - 1} → {level}강
                                {refineData[equipType][gearType]?.[level] ? ` (기본 ${Math.round(refineData[equipType][gearType][level].baseProb * 100)}%)` : ''}
                            </option>
                        ))}
                    </select>

                    <div className="sidebar-title" style={{fontSize:'13px', marginTop:'20px', marginBottom:'10px'}}>1회 기본 소모 재료</div>
                    <div className="material-list">
                        {materials.filter(m => !m.isBreath).map(mat => (
                            <div key={mat.id} className="material-item">
                                <div style={{display:'flex', alignItems:'center'}}>
                                    {mat.icon.startsWith('http') ? <img src={mat.icon} alt={mat.name} style={{width:'20px', height:'20px', marginRight:'6px', borderRadius:'4px', objectFit:'contain'}} /> : <span style={{marginRight:'6px'}}>{mat.icon}</span>}
                                    <span className="mat-name">{getDisplayName(mat.name)}</span>
                                </div>
                                <span className="mat-qty">{mat.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="sidebar-title" style={{fontSize:'13px', marginTop:'20px', marginBottom:'10px'}}>재료 시세 (골드) 직접 입력</div>
                    <div>
                        {materials.map(mat => mat.id !== '골드' && (
                            <div key={mat.id} className="price-input-row">
                                <div style={{display:'flex', alignItems:'center'}}>
                                    {mat.icon.startsWith('http') ? <img src={mat.icon} alt={mat.name} style={{width:'16px', height:'16px', marginRight:'6px', objectFit:'contain'}} /> : <span style={{marginRight:'6px', fontSize:'13px'}}>{mat.icon}</span>}
                                    <span className="mat-name" style={{fontSize:'13px', color:'var(--text-secondary)'}}>{getDisplayName(mat.name)}</span>
                                </div>
                                <input type="number" className="price-input" step="0.001" value={mat.price} onChange={(e) => handlePriceChange(mat.id, parseFloat(e.target.value))} />
                            </div>
                        ))}
                    </div>
                </aside>

                <main style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
                    {optimal && (
                        <>
                            <section className="content-card" style={{ border: '2px solid #a970ff', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-12px', left: '20px', background: '#a970ff', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                                    가장 훌륭한 효율 조합 추천!
                                </div>
                                <div className="card-header" style={{ marginTop: '10px' }}>
                                    <span className="card-title">{optimal.name}</span>
                                    <span style={{ fontSize: '13px', color: '#4caf50', marginLeft: '10px', fontWeight: 'bold' }}>{optimal.desc}</span>
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
                                <div className="card-header"><span className="card-title">누적 재료 소모량 ({selectedComboName} 기준)</span></div>
                                <div className="material-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                    <div>
                                        <div className="stat-label" style={{marginBottom: '10px', textAlign: 'center', color: '#a970ff'}}>평균 시도 (약 {currentCombo.expectedTries}회)</div>
                                        {currentCombo.usedMaterials.map(mat => (
                                            <div key={mat.name} className="material-item" style={{justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    {mat.icon.startsWith('http') ? <img src={mat.icon} alt={mat.name} style={{width: '24px', height: '24px', objectFit: 'contain'}} /> : <span>{mat.icon}</span>}
                                                    <span>{getDisplayName(mat.name)}</span>
                                                </div>
                                                <span>{Math.round(mat.expectedAmount).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="stat-label" style={{marginBottom: '10px', textAlign: 'center', color: '#ffcc00'}}>장기백 ({currentCombo.maxTries}회)</div>
                                        {currentCombo.usedMaterials.map(mat => (
                                            <div key={mat.name} className="material-item" style={{justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    {mat.icon.startsWith('http') ? <img src={mat.icon} alt={mat.name} style={{width: '24px', height: '24px', objectFit: 'contain'}} /> : <span>{mat.icon}</span>}
                                                    <span>{getDisplayName(mat.name)}</span>
                                                </div>
                                                <span>{Math.round(mat.maxAmount).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="content-card">
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                                    <span className="card-title">상세 확률표</span>

                                    <div className="dropdown-container" style={{ position: 'relative', zIndex: 10 }}>
                                        <button
                                            className="type-btn"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            style={{ minWidth: '180px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', fontSize: '13px' }}
                                        >
                                            <span>{selectedComboName}</span>
                                            <span style={{fontSize: '10px', marginLeft: '8px'}}>▼</span>
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="dropdown-list" style={{
                                                position: 'absolute', top: '100%', right: 0, width: '220px',
                                                background: '#2a2a2a', border: '1px solid #444', borderRadius: '8px',
                                                marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', overflow: 'hidden'
                                            }}>
                                                {combinations.map(combo => (
                                                    <div
                                                        key={combo.name}
                                                        onClick={() => { setSelectedComboName(combo.name); setIsDropdownOpen(false); setIsTableExpanded(false); }}
                                                        style={{
                                                            padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #333',
                                                            backgroundColor: selectedComboName === combo.name ? '#3a3a3a' : 'transparent',
                                                            color: selectedComboName === combo.name ? '#a970ff' : '#fff', fontSize: '13px'
                                                        }}
                                                    >
                                                        {combo.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {currentCombo && (
                                    <>
                                        <div className="optimal-grid" style={{marginBottom: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px'}}>
                                            <div className="stat-box" style={{padding: '15px'}}>
                                                <div className="stat-label">평균 시도</div>
                                                <div className="stat-value" style={{fontSize: '20px'}}>{currentCombo.expectedTries}회</div>
                                            </div>
                                            <div className="stat-box" style={{padding: '15px'}}>
                                                <div className="stat-label">장기백 (100%)</div>
                                                <div className="stat-value" style={{fontSize: '20px'}}>{currentCombo.maxTries}회</div>
                                            </div>
                                            <div className="stat-box" style={{padding: '15px'}}>
                                                <div className="stat-label">평균 기댓값 비용</div>
                                                <div className="stat-value" style={{fontSize: '20px', wordBreak: 'break-all'}}>{currentCombo.expectedCost.toLocaleString()} G</div>
                                            </div>
                                            <div className="stat-box" style={{padding: '15px'}}>
                                                <div className="stat-label">적용된 전략 요약</div>
                                                <div className="stat-value" style={{fontSize: '13px', color: '#4caf50', lineHeight: '1.4'}}>{currentCombo.desc}</div>
                                            </div>
                                        </div>

                                        <div className="table-container" style={{overflowX: 'auto'}}>
                                            <table className="prob-table" style={{fontSize: '13px', minWidth: '600px'}}>
                                                <thead>
                                                <tr>
                                                    <th>시도</th>
                                                    <th>적용 방법</th>
                                                    <th>기본 확률</th>
                                                    <th>책 보너스</th>
                                                    <th>숨결 보너스</th>
                                                    <th>시도 확률</th>
                                                    <th>장기백 누적</th>
                                                    <th>누적 성공률</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {(() => {
                                                    const steps = currentCombo.steps;
                                                    const totalSteps = steps.length;

                                                    if (isTableExpanded || totalSteps <= 6) {
                                                        return steps.map(step => (
                                                            <tr key={step.step} style={{ backgroundColor: step.totalProb >= 1.0 ? 'rgba(255, 204, 0, 0.1)' : 'transparent' }}>
                                                                <td>{step.step}</td>
                                                                <td style={{fontWeight: 'bold', color: step.actionId !== '노숨' ? '#a970ff' : 'inherit'}}>{step.actionId}</td>
                                                                <td>{(step.baseProb * 100).toFixed(2)}%</td>
                                                                <td style={{color: step.bookProb > 0 ? '#a970ff' : '#555'}}>{(step.bookProb * 100).toFixed(2)}%</td>
                                                                <td style={{color: step.breathProb > 0 ? '#a970ff' : '#555'}}>{(step.breathProb * 100).toFixed(2)}%</td>
                                                                <td style={{fontWeight: 'bold', color: '#fff'}}>{(step.totalProb * 100).toFixed(2)}%</td>
                                                                <td>{(step.artisanEnergy * 100).toFixed(2)}%</td>
                                                                <td>{(step.cumulativeProb * 100).toFixed(2)}%</td>
                                                            </tr>
                                                        ));
                                                    }

                                                    const firstFive = steps.slice(0, 5);
                                                    const lastStep = steps[totalSteps - 1];
                                                    const hiddenCount = totalSteps - 6;

                                                    return (
                                                        <>
                                                            {firstFive.map(step => (
                                                                <tr key={step.step} style={{ backgroundColor: step.totalProb >= 1.0 ? 'rgba(255, 204, 0, 0.1)' : 'transparent' }}>
                                                                    <td>{step.step}</td>
                                                                    <td style={{fontWeight: 'bold', color: step.actionId !== '노숨' ? '#a970ff' : 'inherit'}}>{step.actionId}</td>
                                                                    <td>{(step.baseProb * 100).toFixed(2)}%</td>
                                                                    <td style={{color: step.bookProb > 0 ? '#a970ff' : '#555'}}>{(step.bookProb * 100).toFixed(2)}%</td>
                                                                    <td style={{color: step.breathProb > 0 ? '#a970ff' : '#555'}}>{(step.breathProb * 100).toFixed(2)}%</td>
                                                                    <td style={{fontWeight: 'bold', color: '#fff'}}>{(step.totalProb * 100).toFixed(2)}%</td>
                                                                    <td>{(step.artisanEnergy * 100).toFixed(2)}%</td>
                                                                    <td>{(step.cumulativeProb * 100).toFixed(2)}%</td>
                                                                </tr>
                                                            ))}
                                                            <tr>
                                                                <td colSpan={8} onClick={() => setIsTableExpanded(true)} style={{ textAlign: 'center', padding: '12px', color: '#a970ff', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
                                                                    ... {hiddenCount}개 구간 더보기 (클릭) ...
                                                                </td>
                                                            </tr>
                                                            <tr key={lastStep.step} style={{ backgroundColor: lastStep.totalProb >= 1.0 ? 'rgba(255, 204, 0, 0.1)' : 'transparent' }}>
                                                                <td>{lastStep.step}</td>
                                                                <td style={{fontWeight: 'bold', color: lastStep.actionId !== '노숨' ? '#a970ff' : 'inherit'}}>{lastStep.actionId}</td>
                                                                <td>{(lastStep.baseProb * 100).toFixed(2)}%</td>
                                                                <td style={{color: lastStep.bookProb > 0 ? '#a970ff' : '#555'}}>{(lastStep.bookProb * 100).toFixed(2)}%</td>
                                                                <td style={{color: lastStep.breathProb > 0 ? '#a970ff' : '#555'}}>{(lastStep.breathProb * 100).toFixed(2)}%</td>
                                                                <td style={{fontWeight: 'bold', color: '#fff'}}>{(lastStep.totalProb * 100).toFixed(2)}%</td>
                                                                <td>{(lastStep.artisanEnergy * 100).toFixed(2)}%</td>
                                                                <td>{(lastStep.cumulativeProb * 100).toFixed(2)}%</td>
                                                            </tr>
                                                        </>
                                                    );
                                                })()}
                                                </tbody>
                                            </table>
                                            {isTableExpanded && (
                                                <div onClick={() => setIsTableExpanded(false)} style={{textAlign: 'center', padding: '12px', color: '#aaa', cursor: 'pointer', borderTop: '1px solid #333', fontSize: '13px'}}>접기 ▲</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}