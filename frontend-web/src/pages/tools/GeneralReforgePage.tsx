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

interface HoningStep {
    step: number;
    baseProb: number; // 기본 + 실패 보정
    bookProb: number;
    breathProb: number;
    totalProb: number;
    cumulativeProb: number; // 누적 성공 확률
    artisanEnergy: number;
    stepCost: number;
    cumulativeCost: number;
}

interface HoningResult {
    expectedCost: number;
    expectedTries: number;
    maxCost: number;
    maxTries: number;
    steps: HoningStep[];
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
    const [gearType, setGearType] = useState<'t4_1590' | 't4_1730'>('t4_1590'); // 🌟 장비 등급 (에기르/세르카)
    const [targetLevel, setTargetLevel] = useState<number>(11);
    
    // UI 상태 관리
    const [selectedComboName, setSelectedComboName] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);

    // 🌟 선택된 장비 등급에 따라 데이터 가져오기
    const currentData = refineData[equipType][gearType]?.[targetLevel];

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
        // 세르카(1730) 재료 추가
        '운명의수호석결정': 0.1,
        '운명의파괴석결정': 0.3,
        '위운돌': 50,
        '상급아비도스': 150,
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
                        // 세르카 재료 매핑
                        '운명의 수호석 결정': '운명의수호석결정',
                        '운명의 파괴석 결정': '운명의파괴석결정',
                        '위대한 운명의 돌파석': '위운돌',
                        '아비도스 융화 재료(상급)': '상급아비도스', // API 명칭 확인 필요 (임시)
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
    const calculateHoningExpectation = (
        baseRate: number, 
        tryCost: number, 
        bookProb: number = 0, 
        bookCost: number = 0,
        breathProb: number = 0, 
        breathCost: number = 0
    ): HoningResult => {
        let expectedCost = 0;
        let expectedTries = 0;
        let currentArtisanEnergy = 0;
        let probReachingThisStep = 1.0;
        let step = 0;
        const rate = Number(baseRate);
        const steps: HoningStep[] = [];
        let cumulativeCost = 0;
        let cumulativeFailProb = 1.0;

        while (probReachingThisStep > 0.0000001) {
            step++;
            let actualRate = 0;
            let stepCost = Number(tryCost);
            let currentBaseProb = rate;

            if (currentArtisanEnergy >= 1.0) {
                actualRate = 1.0;
                currentBaseProb = 1.0; // 장기백 시 기본확률 100% 취급
            } else {
                let failureBonus = Math.min((step - 1) * 0.1 * rate, rate);
                currentBaseProb = rate + failureBonus;
                actualRate = currentBaseProb + Number(bookProb) + Number(breathProb);
                if (actualRate > 1.0) actualRate = 1.0;

                stepCost += Number(bookCost) + Number(breathCost);
            }

            cumulativeCost += stepCost;
            cumulativeFailProb *= (1 - actualRate);
            const cumulativeSuccessProb = 1 - cumulativeFailProb;

            steps.push({
                step,
                baseProb: currentBaseProb,
                bookProb: currentArtisanEnergy >= 1.0 ? 0 : bookProb,
                breathProb: currentArtisanEnergy >= 1.0 ? 0 : breathProb,
                totalProb: actualRate,
                cumulativeProb: cumulativeSuccessProb,
                artisanEnergy: currentArtisanEnergy,
                stepCost: stepCost,
                cumulativeCost: cumulativeCost
            });

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
            expectedTries: Math.round(expectedTries),
            maxCost: Math.round(cumulativeCost),
            maxTries: step,
            steps
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
            ...calculateHoningExpectation(currentData.baseProb, baseTryCost, 0, 0, 0, 0) 
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
                ...calculateHoningExpectation(currentData.baseProb, baseTryCost, bookProb, bookCost, 0, 0) 
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
                ...calculateHoningExpectation(currentData.baseProb, baseTryCost, 0, 0, breathProb, breathCost) 
            });
        }

        // 4. 풀숨 (책+숨결)
        if (books.length > 0 && breaths.length > 0) {
            let totalProb = books[0].addedProb || 0; let totalCost = books[0].price;
            let breathProb = 0; let breathCost = 0;
            const fullUsage = [...baseUsage];
            // 책 추가
            fullUsage.push({ name: books[0].name, icon: books[0].icon, amount: 1 });
            // 숨결 추가
            breaths.forEach(b => { 
                const amount = b.maxUse || 0;
                breathProb += amount * (b.addedProb || 0); 
                breathCost += amount * b.price; 
                fullUsage.push({ name: b.name, icon: b.icon, amount: amount });
            });
            results.push({ 
                name: "풀숨 (책+숨결)", 
                tryCost: Math.round(baseTryCost + totalCost + breathCost), 
                isBreath: true, 
                isBook: true, 
                usedMaterials: fullUsage,
                ...calculateHoningExpectation(currentData.baseProb, baseTryCost, totalProb, totalCost, breathProb, breathCost) 
            });
        }

        return results.sort((a, b) => a.expectedCost - b.expectedCost);
    }, [materials, currentData]);

    const optimal = combinations[0];
    
    // 최적 조합이 변경되면 선택된 콤보 이름도 업데이트
    useEffect(() => {
        if (optimal) {
            setSelectedComboName(optimal.name);
            setIsTableExpanded(false); // 콤보 변경 시 테이블 접기
        }
    }, [optimal]);

    const currentCombo = combinations.find(c => c.name === selectedComboName) || optimal;

    if (!currentData) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>데이터를 불러올 수 없습니다.</div>;

    return (
        <div className="container">
            <ToolsHeader />
            <div className="reforge-container">
                <aside className="sidebar-card">
                    <div className="sidebar-title">재련 설정</div>
                    <p className="sidebar-desc">
                        {gearType === 't4_1590' ? 'T4 에기르 (1590)' : 'T4 세르카 (1730)'} 장비 기준 데이터입니다.
                    </p>

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
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span className="card-title">상세 확률표</span>
                                    
                                    <div className="dropdown-container" style={{ position: 'relative', zIndex: 10 }}>
                                        <button 
                                            className="type-btn" 
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            style={{ minWidth: '160px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', fontSize: '13px' }}
                                        >
                                            <span>{selectedComboName}</span>
                                            <span style={{fontSize: '10px', marginLeft: '8px'}}>▼</span>
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="dropdown-list" style={{ 
                                                position: 'absolute', 
                                                top: '100%', 
                                                right: 0, 
                                                width: '200px',
                                                background: '#2a2a2a', 
                                                border: '1px solid #444', 
                                                borderRadius: '8px', 
                                                marginTop: '4px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                                overflow: 'hidden'
                                            }}>
                                                {combinations.map(combo => (
                                                    <div 
                                                        key={combo.name} 
                                                        className="dropdown-item" 
                                                        onClick={() => {
                                                            setSelectedComboName(combo.name);
                                                            setIsDropdownOpen(false);
                                                            setIsTableExpanded(false);
                                                        }}
                                                        style={{ 
                                                            padding: '12px 16px', 
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #333',
                                                            backgroundColor: selectedComboName === combo.name ? '#3a3a3a' : 'transparent',
                                                            color: selectedComboName === combo.name ? '#a970ff' : '#fff',
                                                            fontSize: '13px'
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
                                        <div className="optimal-grid" style={{marginBottom: '20px', gridTemplateColumns: 'repeat(4, 1fr)'}}>
                                            <div className="stat-box">
                                                <div className="stat-label">평균 시도</div>
                                                <div className="stat-value">{currentCombo.expectedTries}회</div>
                                            </div>
                                            <div className="stat-box">
                                                <div className="stat-label">장기백 (100%)</div>
                                                <div className="stat-value">{currentCombo.maxTries}회</div>
                                            </div>
                                            <div className="stat-box">
                                                <div className="stat-label">평균 비용</div>
                                                <div className="stat-value">{currentCombo.expectedCost.toLocaleString()} G</div>
                                            </div>
                                            <div className="stat-box">
                                                <div className="stat-label">추가 재료</div>
                                                <div className="stat-value" style={{fontSize: '12px'}}>
                                                    {currentCombo.isBook ? '책 O' : '책 X'} / {currentCombo.isBreath ? '숨결 O' : '숨결 X'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{overflowX: 'auto'}}>
                                            <table className="prob-table" style={{fontSize: '13px'}}>
                                                <thead>
                                                <tr>
                                                    <th>시도</th>
                                                    <th>기본 확률</th>
                                                    <th>책 보너스</th>
                                                    <th>숨결 보너스</th>
                                                    <th>시도 확률</th>
                                                    <th>누적 성공</th>
                                                    <th>장기</th>
                                                    <th>예상 비용 (누적)</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {(() => {
                                                    const steps = currentCombo.steps;
                                                    const totalSteps = steps.length;
                                                    
                                                    // 펼쳐졌거나 전체 스텝이 6개 이하라면 모두 보여줌
                                                    if (isTableExpanded || totalSteps <= 6) {
                                                        return steps.map(step => (
                                                            <tr key={step.step} style={{ backgroundColor: step.totalProb >= 1.0 ? 'rgba(255, 204, 0, 0.1)' : 'transparent' }}>
                                                                <td>{step.step}</td>
                                                                <td>{(step.baseProb * 100).toFixed(2)}%</td>
                                                                <td style={{color: step.bookProb > 0 ? '#a970ff' : 'inherit'}}>{(step.bookProb * 100).toFixed(2)}%</td>
                                                                <td style={{color: step.breathProb > 0 ? '#a970ff' : 'inherit'}}>{(step.breathProb * 100).toFixed(2)}%</td>
                                                                <td style={{fontWeight: 'bold'}}>{(step.totalProb * 100).toFixed(2)}%</td>
                                                                <td>{(step.cumulativeProb * 100).toFixed(2)}%</td>
                                                                <td>{(step.artisanEnergy * 100).toFixed(2)}%</td>
                                                                <td>{Math.round(step.cumulativeCost).toLocaleString()} G</td>
                                                            </tr>
                                                        ));
                                                    }
                                                    
                                                    // 접혀있고 7개 이상인 경우: 1~5, 더보기, 마지막
                                                    const firstFive = steps.slice(0, 5);
                                                    const lastStep = steps[totalSteps - 1];
                                                    const hiddenCount = totalSteps - 6; // 5개 + 1개 제외한 나머지
                                                    
                                                    return (
                                                        <>
                                                            {firstFive.map(step => (
                                                                <tr key={step.step} style={{ backgroundColor: step.totalProb >= 1.0 ? 'rgba(255, 204, 0, 0.1)' : 'transparent' }}>
                                                                    <td>{step.step}</td>
                                                                    <td>{(step.baseProb * 100).toFixed(2)}%</td>
                                                                    <td style={{color: step.bookProb > 0 ? '#a970ff' : 'inherit'}}>{(step.bookProb * 100).toFixed(2)}%</td>
                                                                    <td style={{color: step.breathProb > 0 ? '#a970ff' : 'inherit'}}>{(step.breathProb * 100).toFixed(2)}%</td>
                                                                    <td style={{fontWeight: 'bold'}}>{(step.totalProb * 100).toFixed(2)}%</td>
                                                                    <td>{(step.cumulativeProb * 100).toFixed(2)}%</td>
                                                                    <td>{(step.artisanEnergy * 100).toFixed(2)}%</td>
                                                                    <td>{Math.round(step.cumulativeCost).toLocaleString()} G</td>
                                                                </tr>
                                                            ))}
                                                            
                                                            <tr>
                                                                <td colSpan={8} 
                                                                    onClick={() => setIsTableExpanded(true)}
                                                                    style={{ textAlign: 'center', padding: '12px', color: '#a970ff', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', borderTop: '1px solid #333', borderBottom: '1px solid #333' }}
                                                                >
                                                                    ... {hiddenCount}개 구간 더보기 (클릭) ...
                                                                </td>
                                                            </tr>
                                                            
                                                            <tr key={lastStep.step} style={{ backgroundColor: lastStep.totalProb >= 1.0 ? 'rgba(255, 204, 0, 0.1)' : 'transparent' }}>
                                                                <td>{lastStep.step}</td>
                                                                <td>{(lastStep.baseProb * 100).toFixed(2)}%</td>
                                                                <td style={{color: lastStep.bookProb > 0 ? '#a970ff' : 'inherit'}}>{(lastStep.bookProb * 100).toFixed(2)}%</td>
                                                                <td style={{color: lastStep.breathProb > 0 ? '#a970ff' : 'inherit'}}>{(lastStep.breathProb * 100).toFixed(2)}%</td>
                                                                <td style={{fontWeight: 'bold'}}>{(lastStep.totalProb * 100).toFixed(2)}%</td>
                                                                <td>{(lastStep.cumulativeProb * 100).toFixed(2)}%</td>
                                                                <td>{(lastStep.artisanEnergy * 100).toFixed(2)}%</td>
                                                                <td>{Math.round(lastStep.cumulativeCost).toLocaleString()} G</td>
                                                            </tr>
                                                        </>
                                                    );
                                                })()}
                                                </tbody>
                                            </table>
                                            
                                            {isTableExpanded && (
                                                <div 
                                                    onClick={() => setIsTableExpanded(false)}
                                                    style={{
                                                        textAlign: 'center',
                                                        padding: '12px',
                                                        color: '#aaa',
                                                        cursor: 'pointer',
                                                        borderTop: '1px solid #333',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    접기 ▲
                                                </div>
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