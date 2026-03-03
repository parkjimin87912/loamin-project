import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import ToolsHeader from '../../components/ToolsHeader';
import { getAdvancedRefineTable } from '../../data/advanced/data'; // 🌟 1단계에서 만든 파일
import { getReport } from '../../data/advanced/logic';           // 🌟 1단계에서 만든 파일
import '../../App.css';

interface AdvMaterial {
    id: string; name: string; icon: string; amount: number; price: number;
}

export default function AdvancedReforgePage() {
    // --- [상태 관리] ---
    const [stageRange, setStageRange] = useState("0-10");
    const [equipType, setEquipType] = useState<'armor' | 'weapon'>('armor');
    const [isRankExpanded, setIsRankExpanded] = useState<boolean>(false);
    const [itemIcons, setItemIcons] = useState<Record<string, string>>({}); // 🌟 아이콘 상태 추가

    // 🌟 API 통신용 시세 상태
    const [prices, setPrices] = useState<Record<string, number>>({
        '운명의수호석': 0.1, '운명의파괴석': 0.3, '운돌': 25, '아비도스': 85,
        '운명파편': 0.1, '골드': 1, '빙하': 260, '용암': 300,
        // 아이스펭 내부 로직은 T4 책도 옛날 변수명(장인의재봉술...)을 그대로 사용합니다.
        '장인의재봉술1단계': 500, '장인의재봉술2단계': 800, '장인의재봉술3단계': 1200, '장인의재봉술4단계': 1500,
        '장인의야금술1단계': 600, '장인의야금술2단계': 1000, '장인의야금술3단계': 1500, '장인의야금술4단계': 2000,
    });

    // 🌟 백엔드 실시간 시세 연동 (일반 재련과 완벽히 동일한 로직)
    useEffect(() => {
        const fetchMarketPrices = async () => {
            try {
                const [matResponse, subMatResponse] = await Promise.all([
                    axios.get('http://localhost:8080/api/v1/market/items', {
                        params: { category: 'reforge', subCategory: '재련 재료', tier: 4 }
                    }),
                    axios.get('http://localhost:8080/api/v1/market/items', {
                        params: { category: 'reforge', subCategory: '재련 보조 재료', tier: 4 }
                    })
                ]);

                const apiData = [
                    ...(Array.isArray(matResponse.data) ? matResponse.data : []),
                    ...(Array.isArray(subMatResponse.data) ? subMatResponse.data : [])
                ];

                setPrices(prevPrices => {
                    const newPrices = { ...prevPrices };
                    const newIcons: Record<string, string> = {}; // 🌟 아이콘 매핑

                    // 💡 API 이름 -> 아이스펭 내부 변수명 매핑 (상급 재련 책 변수명 주의!)
                    const nameMapping: Record<string, string> = {
                        '운명의 수호석': '운명의수호석', '운명의 파괴석': '운명의파괴석',
                        '운명의 돌파석': '운돌', '아비도스 융화 재료': '아비도스',
                        '빙하의 숨결': '빙하', '용암의 숨결': '용암',

                        // 🌟 상급재련 내부 변수명과 T4 공식 이름 매핑!
                        '재봉술 : 업화 [11-14]': '장인의재봉술1단계',
                        '재봉술 : 업화 [15-18]': '장인의재봉술2단계',
                        '재봉술 : 업화 [19-20]': '장인의재봉술3단계',

                        '야금술 : 업화 [11-14]': '장인의야금술1단계',
                        '야금술 : 업화 [15-18]': '장인의야금술2단계',
                        '야금술 : 업화 [19-20]': '장인의야금술3단계',

                        // 세르카(1730) 상급 재련용 책 (쇠락) 추가
                        '재봉술 : 쇠락 [11-14]': '장인의재봉술1단계',
                        '재봉술 : 쇠락 [15-18]': '장인의재봉술2단계',
                        '재봉술 : 쇠락 [19-20]': '장인의재봉술3단계',

                        '야금술 : 쇠락 [11-14]': '장인의야금술1단계',
                        '야금술 : 쇠락 [15-18]': '장인의야금술2단계',
                        '야금술 : 쇠락 [19-20]': '장인의야금술3단계',
                        
                        // T4 Books (아비도스) - 추가됨
                        '재봉술 : 아비도스 (기본)': '장인의재봉술1단계', '재봉술 : 아비도스 (응용)': '장인의재봉술2단계',
                        '재봉술 : 아비도스 (심화)': '장인의재봉술3단계', '재봉술 : 아비도스 (전문)': '장인의재봉술4단계',
                        '야금술 : 아비도스 (기본)': '장인의야금술1단계', '야금술 : 아비도스 (응용)': '장인의야금술2단계',
                        '야금술 : 아비도스 (심화)': '장인의야금술3단계', '야금술 : 아비도스 (전문)': '장인의야금술4단계',
                        '장인의 재봉술 : 아비도스 (기본)': '장인의재봉술1단계', '장인의 재봉술 : 아비도스 (응용)': '장인의재봉술2단계',
                        '장인의 재봉술 : 아비도스 (심화)': '장인의재봉술3단계', '장인의 재봉술 : 아비도스 (전문)': '장인의재봉술4단계',
                        '장인의 야금술 : 아비도스 (기본)': '장인의야금술1단계', '장인의 야금술 : 아비도스 (응용)': '장인의야금술2단계',
                        '장인의 야금술 : 아비도스 (심화)': '장인의야금술3단계', '장인의 야금술 : 아비도스 (전문)': '장인의야금술4단계',
                        
                        // 🌟 JSON 데이터에 있는 이름 매핑 추가
                        '장인의 야금술 : 1단계': '장인의야금술1단계',
                        '장인의 야금술 : 2단계': '장인의야금술2단계',
                        '장인의 야금술 : 3단계': '장인의야금술3단계',
                        '장인의 야금술 : 4단계': '장인의야금술4단계',
                        '장인의 재봉술 : 1단계': '장인의재봉술1단계',
                        '장인의 재봉술 : 2단계': '장인의재봉술2단계',
                        '장인의 재봉술 : 3단계': '장인의재봉술3단계',
                        '장인의 재봉술 : 4단계': '장인의재봉술4단계',
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
                console.error("시세 API 오류", error);
            }
        };
        fetchMarketPrices();
    }, []);

    const handlePriceChange = (name: string, newPrice: number) => {
        setPrices(prev => ({ ...prev, [name]: newPrice }));
    };

    // --- [아이스펭 상급재련 로직 연결] ---
    const targetKey = stageRange === "0-10" ? "t4_0" : stageRange === "10-20" ? "t4_1" : stageRange === "20-30" ? "t4_2" : "t4_3";
    const refineTable = useMemo(() => getAdvancedRefineTable(equipType, targetKey as any), [equipType, targetKey]);

    // 좌측 사이드바에 보여줄 동적 재료 리스트
    const materialsList = useMemo<AdvMaterial[]>(() => {
        if (!refineTable) return [];
        const result: AdvMaterial[] = [];

        // 1. 기본 재료
        Object.entries(refineTable.amount).forEach(([name, amount]) => {
            let icon = itemIcons[name];
            if (!icon) {
                icon = '📦';
                if (name.includes('수호석')) icon = '💎';
                if (name.includes('파괴석')) icon = '🗡️';
                if (name.includes('돌')) icon = '🔮';
                if (name.includes('아비도스')) icon = '🟤';
                if (name.includes('파편')) icon = '🧩';
                if (name === '골드') icon = '💰';
            }
            result.push({ id: name, name, icon, amount: Number(amount), price: Number(prices[name]) || 0 });
        });

        // 2. 숨결
        Object.entries(refineTable.breath).forEach(([name, maxUse]) => {
            let icon = itemIcons[name];
            if (!icon) {
                icon = name.includes('빙하') ? '❄️' : '🔥';
            }
            result.push({ id: name, name, icon, amount: Number(maxUse), price: Number(prices[name]) || 0 });
        });

        // 3. 책
        if (refineTable.book) {
            // 🌟 책 이름 동적 변경 로직 추가
            let bookName = '적용가능 책(야금/재봉)';
            if (refineTable.book.includes('야금술')) {
                if (refineTable.book.includes('1단계')) bookName = '장인의 야금술 : 1단계';
                else if (refineTable.book.includes('2단계')) bookName = '장인의 야금술 : 2단계';
                else if (refineTable.book.includes('3단계')) bookName = '장인의 야금술 : 3단계';
                else if (refineTable.book.includes('4단계')) bookName = '장인의 야금술 : 4단계';
            } else if (refineTable.book.includes('재봉술')) {
                if (refineTable.book.includes('1단계')) bookName = '장인의 재봉술 : 1단계';
                else if (refineTable.book.includes('2단계')) bookName = '장인의 재봉술 : 2단계';
                else if (refineTable.book.includes('3단계')) bookName = '장인의 재봉술 : 3단계';
                else if (refineTable.book.includes('4단계')) bookName = '장인의 재봉술 : 4단계';
            }
            
            let icon = itemIcons[refineTable.book];
            if (!icon) icon = '📜';

            result.push({ id: refineTable.book, name: bookName, icon, amount: 1, price: Number(prices[refineTable.book]) || 0 });
        }
        return result;
    }, [refineTable, prices, itemIcons]);

    // 🌟 DP 시뮬레이션 엔진 가동 (모든 경우의 수 계산)
    const reports = useMemo(() => {
        try {
            // logic.ts의 getReport 함수가 1등부터 꼴등까지 정렬해서 반환해 줍니다!
            return getReport(refineTable, prices);
        } catch (e) {
            console.error("리포트 생성 실패", e);
            return [];
        }
    }, [refineTable, prices]);

    const bestCombo = reports.length > 0 ? reports[0] : null;

    // 표에 표시할 때 텍스트를 짧고 예쁘게 줄여주는 헬퍼 함수
    const formatStrategy = (names: string[]) => {
        if (!names || names.length === 0) return "-";
        const hasBreath = names.some(n => n.includes('빙하') || n.includes('용암') || n.includes('은총') || n.includes('축복') || n.includes('가호'));
        const hasBook = names.some(n => n.includes('재봉술') || n.includes('야금술'));
        if (hasBreath && hasBook) return "풀숨(책+숨결)";
        if (hasBreath) return "숨결만";
        if (hasBook) return "책만";
        return "-";
    };

    return (
        <div className="container">
            <ToolsHeader />
            <div className="reforge-container">
                {/* --- [좌측 사이드바] --- */}
                <aside className="sidebar-card">
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                        {["0-10", "10-20", "20-30", "30-40"].map(range => (
                            <button key={range} onClick={() => setStageRange(range)}
                                    style={{ flex: 1, padding: '10px 0', borderRadius: '6px', border: 'none', background: stageRange === range ? 'var(--text-accent)' : 'var(--bg-input)', color: stageRange === range ? '#fff' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                                {range}
                            </button>
                        ))}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px' }}>
                        <div className="sidebar-title" style={{fontSize:'18px'}}>{stageRange}단계 ({equipType === 'armor' ? '방어구' : '무기'})</div>
                        <div style={{ display:'flex', gap:'5px' }}>
                            <button onClick={() => setEquipType('armor')} style={{ padding:'8px', borderRadius:'6px', border:'1px solid var(--border-color)', background: equipType === 'armor' ? 'var(--text-accent)' : 'var(--bg-input)', cursor:'pointer' }}>🛡️</button>
                            <button onClick={() => setEquipType('weapon')} style={{ padding:'8px', borderRadius:'6px', border:'1px solid var(--border-color)', background: equipType === 'weapon' ? 'var(--text-accent)' : 'var(--bg-input)', cursor:'pointer' }}>⚔️</button>
                        </div>
                    </div>

                    <div className="sidebar-title" style={{fontSize:'13px', marginTop:'20px', marginBottom:'10px'}}>1회 소모 재료 (숨결 최대치)</div>
                    <div className="material-list">
                        {materialsList.map(mat => (
                            <div key={mat.id} className="material-item">
                                <div style={{display:'flex', alignItems:'center'}}>
                                    {mat.icon.startsWith('http') ? <img src={mat.icon} alt={mat.name} style={{width:'20px', height:'20px', marginRight:'6px', borderRadius:'4px', objectFit:'contain'}} /> : <span style={{marginRight:'6px'}}>{mat.icon}</span>}
                                    <span className="mat-name">{mat.name}</span>
                                </div>
                                <span className="mat-qty">{mat.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="sidebar-title" style={{fontSize:'13px', marginTop:'20px', marginBottom:'10px'}}>재료 시세 (골드) 직접 수정</div>
                    <div>
                        {materialsList.map(mat => mat.id !== '골드' && (
                            <div key={mat.id} className="price-input-row">
                                <div style={{display:'flex', alignItems:'center'}}>
                                    {mat.icon.startsWith('http') ? <img src={mat.icon} alt={mat.name} style={{width:'16px', height:'16px', marginRight:'6px', objectFit:'contain'}} /> : <span style={{marginRight:'6px', fontSize:'13px'}}>{mat.icon}</span>}
                                    <span className="mat-name" style={{fontSize:'13px', color:'var(--text-secondary)'}}>{mat.name}</span>
                                </div>
                                <input type="number" step="0.001" className="price-input" value={mat.price} onChange={(e) => handlePriceChange(mat.id, parseFloat(e.target.value))} />
                            </div>
                        ))}
                    </div>
                </aside>

                {/* --- [우측 메인 결과] --- */}
                <main style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
                    {bestCombo && (
                        <>
                            <section className="content-card" style={{ border: '2px solid #a970ff', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-12px', left: '20px', background: '#a970ff', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                                    가장 훌륭한 효율 조합 추천!
                                </div>
                                <div style={{ padding:'10px 0 20px 0', borderBottom:'1px solid #333' }}>
                                    <div style={{ fontSize:'13px', color:'#4caf50', marginBottom:'5px', fontWeight:'bold' }}>최적의 가성비 1순위 조합</div>
                                    <div style={{ fontSize:'36px', fontWeight:'800', color:'#fff', marginBottom:'10px' }}>
                                        {Math.round(bestCombo.expectedPrice).toLocaleString()} G
                                    </div>
                                    <div style={{ fontSize:'14px', color:'#aaa' }}>
                                        상급 재련 1회 완료까지 <span style={{color:'#fff', fontWeight:'bold'}}>{bestCombo.expectedTryCount.toFixed(2)}회</span> 누르시면 됩니다.
                                    </div>
                                </div>

                                <div className="optimal-grid" style={{marginTop: '20px', gridTemplateColumns: refineTable.hasEnhancedBonus ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))'}}>
                                    <div className="stat-box" style={{background: 'rgba(169, 112, 255, 0.1)', border: '1px solid rgba(169, 112, 255, 0.3)'}}>
                                        <div className="stat-label" style={{color: '#a970ff'}}>일반 재련 시</div>
                                        <div className="stat-value" style={{fontSize: '15px'}}>{formatStrategy(bestCombo.normalBreathNames)}</div>
                                    </div>
                                    <div className="stat-box" style={{background: 'rgba(255, 204, 0, 0.1)', border: '1px solid rgba(255, 204, 0, 0.3)'}}>
                                        <div className="stat-label" style={{color: '#ffcc00'}}>선조의 가호 발동 시</div>
                                        <div className="stat-value" style={{fontSize: '15px'}}>{formatStrategy(bestCombo.bonusBreathNames)}</div>
                                    </div>
                                    {refineTable.hasEnhancedBonus && (
                                        <div className="stat-box" style={{background: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.3)'}}>
                                            <div className="stat-label" style={{color: '#f44336'}}>강화 선조 발동 시</div>
                                            <div className="stat-value" style={{fontSize: '15px'}}>{formatStrategy(bestCombo.enhancedBonusBreathNames)}</div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="content-card">
                                <div className="card-header"><span className="card-title">예상 재료 소모량 (1위 전략 기준)</span></div>
                                <div className="material-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                    {bestCombo.expectedMaterials.map((mat, idx) => {
                                        // 아이콘 매핑
                                        let iconUrl = itemIcons[mat.name];
                                        
                                        // fallback (이미지 없을 경우)
                                        if (!iconUrl) {
                                            if (mat.name.includes('수호석')) iconUrl = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_7_55.png';
                                            else if (mat.name.includes('파괴석')) iconUrl = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_7_54.png';
                                            else if (mat.name.includes('돌')) iconUrl = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_11_101.png';
                                            else if (mat.name.includes('아비도스')) iconUrl = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_11_102.png';
                                            else if (mat.name.includes('파편')) iconUrl = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_6_109.png';
                                            else if (mat.name === '골드') iconUrl = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/money/money_4.png';
                                            else if (mat.name.includes('빙하')) iconUrl = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_3_232.png';
                                            else if (mat.name.includes('용암')) iconUrl = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_3_233.png';
                                            else if (mat.name.includes('재봉술')) iconUrl = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_44.png';
                                            else if (mat.name.includes('야금술')) iconUrl = 'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_34.png';
                                        }

                                        // 이름 매핑 (화면에 보여줄 때만)
                                        let displayName = mat.name;
                                        if (mat.name.includes('장인의재봉술')) displayName = mat.name.replace('장인의재봉술', '장인의 재봉술 : ');
                                        if (mat.name.includes('장인의야금술')) displayName = mat.name.replace('장인의야금술', '장인의 야금술 : ');

                                        return (
                                            <div key={idx} className="material-item" style={{justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    {iconUrl ? <img src={iconUrl} alt={mat.name} style={{width: '24px', height: '24px', objectFit: 'contain'}} /> : <span>📦</span>}
                                                    <span>{displayName}</span>
                                                </div>
                                                <span>{Math.round(mat.amount).toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="content-card">
                                <div className="card-header"><span className="card-title">모든 전략 순위표 (비용순)</span></div>
                                <div className="table-container" style={{ overflowX: 'auto' }}>
                                    <table className="prob-table" style={{ fontSize: '13px', minWidth: '600px' }}>
                                        <thead>
                                        <tr>
                                            <th>순위</th>
                                            <th>일반 턴</th>
                                            <th>선조 턴</th>
                                            {refineTable.hasEnhancedBonus && <th style={{color:'#f44336'}}>강화 선조 턴</th>}
                                            <th>평균 누르는 횟수</th>
                                            <th>기댓값 (골드)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {(() => {
                                            const totalReports = reports.length;
                                            const showAll = isRankExpanded || totalReports <= 6;
                                            
                                            const renderRow = (combo: any, idx: number) => (
                                                <tr key={idx} style={{ backgroundColor: idx === 0 ? 'rgba(169, 112, 255, 0.1)' : 'transparent' }}>
                                                    <td style={{ fontWeight:'bold', color: idx === 0 ? '#a970ff' : '#aaa' }}>{idx + 1}위</td>
                                                    <td style={{ fontWeight: idx === 0 ? 'bold' : 'normal', color: idx === 0 ? '#fff' : 'var(--text-secondary)' }}>{formatStrategy(combo.normalBreathNames)}</td>
                                                    <td style={{ fontWeight: idx === 0 ? 'bold' : 'normal', color: idx === 0 ? '#ffcc00' : 'var(--text-secondary)' }}>{formatStrategy(combo.bonusBreathNames)}</td>
                                                    {refineTable.hasEnhancedBonus && <td style={{ fontWeight: idx === 0 ? 'bold' : 'normal', color: idx === 0 ? '#f44336' : 'var(--text-secondary)' }}>{formatStrategy(combo.enhancedBonusBreathNames)}</td>}
                                                    <td>{combo.expectedTryCount.toFixed(2)}회</td>
                                                    <td style={{ fontWeight:'bold', color: idx === 0 ? '#fff' : '#ccc' }}>{Math.round(combo.expectedPrice).toLocaleString()} G</td>
                                                </tr>
                                            );

                                            if (showAll) {
                                                return reports.slice(0, 30).map(renderRow);
                                            }

                                            const firstFive = reports.slice(0, 5);
                                            const last = reports[totalReports - 1];
                                            const hiddenCount = totalReports - 6;

                                            return (
                                                <>
                                                    {firstFive.map(renderRow)}
                                                    <tr>
                                                        <td colSpan={refineTable.hasEnhancedBonus ? 6 : 5} 
                                                            onClick={() => setIsRankExpanded(true)} 
                                                            style={{ textAlign: 'center', padding: '12px', color: '#a970ff', cursor: 'pointer', fontWeight: 'bold' }}
                                                        >
                                                            ... {hiddenCount}개 전략 더보기 ...
                                                        </td>
                                                    </tr>
                                                    {renderRow(last, totalReports - 1)}
                                                </>
                                            );
                                        })()}
                                        </tbody>
                                    </table>
                                    {isRankExpanded && reports.length > 6 && (
                                        <div onClick={() => setIsRankExpanded(false)} style={{ textAlign: 'center', padding: '12px', color: '#aaa', cursor: 'pointer', borderTop: '1px solid #333', fontSize: '13px' }}>
                                            접기 ▲
                                        </div>
                                    )}
                                </div>
                                <div style={{textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#666'}}>
                                    * 상위 30개의 조합만 표시됩니다.
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}