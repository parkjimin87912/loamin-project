import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import ToolsHeader from '../../components/ToolsHeader';
import '../../App.css';

export default function AbydosCraftPage() {
    const [owned, setOwned] = useState({
        timber: 0, softTimber: 0, sturdyTimber: 0, abydosTimber: 0, powder: 0
    });

    // 🌟 제작 타입 선택 (기본값: 일반 아비도스)
    const [craftType, setCraftType] = useState<'normal' | 'advanced'>('normal');

    // 🌟 시세 상태 추가 (화면 표시용은 아니지만 내부 로직 유지)
    const [prices, setPrices] = useState<Record<string, number>>({
        '일반 목재': 0, '부드러운 목재': 0, '튼튼한 목재': 0, '아비도스 목재': 0, '벌목의 가루': 0
    });

    // 🌟 API로 시세 불러오기 (가격 표시는 제거됨)
    useEffect(() => {
        const fetchMarketPrices = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/market/items', {
                    params: { category: 'life', subCategory: '벌목' }
                });

                if (Array.isArray(response.data)) {
                    const newPrices = { ...prices };
                    response.data.forEach((item: any) => {
                        const price = item.recentPrice > 0 ? item.recentPrice : item.minPrice;
                        const unitPrice = price / (item.bundle > 0 ? item.bundle : 1);

                        if (item.name === '목재') newPrices['일반 목재'] = unitPrice;
                        else if (item.name === '부드러운 목재') newPrices['부드러운 목재'] = unitPrice;
                        else if (item.name === '튼튼한 목재') newPrices['튼튼한 목재'] = unitPrice;
                        else if (item.name === '아비도스 목재') newPrices['아비도스 목재'] = unitPrice;
                    });
                    setPrices(newPrices);
                }
            } catch (error) {
                console.error("시세 API 오류", error);
            }
        };
        fetchMarketPrices();
    }, []);

    const result = useMemo(() => {
        if (Object.values(owned).every(v => v === 0)) return null;

        const checkFeasibility = (n: number) => {
            let TARGET;
            if (craftType === 'advanced') {
                // 상급 아비도스 융화 재료
                TARGET = { abydos: 43 * n, soft: 59 * n, normal: 112 * n };
            } else {
                // 일반 아비도스 융화 재료 (비율 수정됨: 33, 45, 86)
                TARGET = { abydos: 33 * n, soft: 45 * n, normal: 86 * n };
            }

            const inv = { sturdy: owned.sturdyTimber, soft: owned.softTimber, normal: owned.timber, powder: owned.powder, abydos: owned.abydosTimber };
            const ops = { sturdyToNormal: 0, normalToPowder: 0, softToPowder: 0, powderToAbydos: 0 };

            if (inv.sturdy >= 5) {
                const exchangeCount = Math.floor(inv.sturdy / 5);
                ops.sturdyToNormal = exchangeCount;
                inv.sturdy -= exchangeCount * 5; inv.normal += exchangeCount * 50;
            }
            const missingAbydos = Math.max(0, TARGET.abydos - inv.abydos);
            let requiredPowder = 0;
            if (missingAbydos > 0) {
                ops.powderToAbydos = Math.ceil(missingAbydos / 10);
                requiredPowder = ops.powderToAbydos * 100;
            }
            let currentPowder = inv.powder;
            let missingPowder = Math.max(0, requiredPowder - currentPowder);

            if (missingPowder > 0) {
                const surplusNormal = Math.max(0, inv.normal - TARGET.normal);
                if (surplusNormal >= 100) {
                    const needed = Math.ceil(missingPowder / 80);
                    const possible = Math.floor(surplusNormal / 100);
                    const actual = Math.min(needed, possible);
                    ops.normalToPowder = actual;
                    inv.normal -= actual * 100; currentPowder += actual * 80;
                    missingPowder = Math.max(0, requiredPowder - currentPowder);
                }
            }
            if (missingPowder > 0) {
                const surplusSoft = Math.max(0, inv.soft - TARGET.soft);
                if (surplusSoft >= 50) {
                    const needed = Math.ceil(missingPowder / 80);
                    const possible = Math.floor(surplusSoft / 50);
                    const actual = Math.min(needed, possible);
                    ops.softToPowder = actual;
                    inv.soft -= actual * 50; currentPowder += actual * 80;
                    missingPowder = Math.max(0, requiredPowder - currentPowder);
                }
            }
            const finalAbydos = inv.abydos + (ops.powderToAbydos * 10);
            const isPossible = (finalAbydos >= TARGET.abydos && inv.normal >= TARGET.normal && inv.soft >= TARGET.soft && missingPowder <= 0);
            return { possible: isPossible, ops };
        };

        let low = 0, high = 100000, maxN = 0, bestOps = null;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (mid === 0) { low = 1; continue; }
            const res = checkFeasibility(mid);
            if (res.possible) { maxN = mid; bestOps = res.ops; low = mid + 1; }
            else { high = mid - 1; }
        }

        if (maxN === 0 || !bestOps) return { maxCrafts: 0, actions: [], isValid: false };

        const actions = [];
        let step = 1;
        if (bestOps.sturdyToNormal > 0) actions.push({ step: step++, label: "튼튼한 목재 ➡ 일반 목재", count: bestOps.sturdyToNormal, desc: `(튼튼한 목재 ${bestOps.sturdyToNormal * 5}개 소모)` });
        if (bestOps.normalToPowder > 0) actions.push({ step: step++, label: "일반 목재 ➡ 벌목의 가루", count: bestOps.normalToPowder, desc: `(일반 목재 ${bestOps.normalToPowder * 100}개 소모)` });
        if (bestOps.softToPowder > 0) actions.push({ step: step++, label: "부드러운 목재 ➡ 벌목의 가루", count: bestOps.softToPowder, desc: `(부드러운 목재 ${bestOps.softToPowder * 50}개 소모)` });
        if (bestOps.powderToAbydos > 0) actions.push({ step: step++, label: "벌목의 가루 ➡ 아비도스 목재", count: bestOps.powderToAbydos, desc: `(가루 ${bestOps.powderToAbydos * 100}개 소모)` });

        return { maxCrafts: maxN, actions, isValid: true };
    }, [owned, craftType]);

    return (
        <div className="container">
            {/* 상단 탭 (통일됨) */}
            <ToolsHeader />

            <div className="reforge-container">
                <aside className="sidebar-card" style={{ height: 'fit-content' }}>
                    <div className="sidebar-title" style={{ fontSize: '18px', marginBottom: '20px' }}>🎒 보유 재료 입력</div>
                    
                    {/* 🌟 제작 타입 선택 탭 */}
                    <div className="type-selector" style={{ marginBottom: '20px' }}>
                        <button 
                            className={`type-btn ${craftType === 'normal' ? 'active' : ''}`} 
                            onClick={() => setCraftType('normal')}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            일반 아비도스
                        </button>
                        <button 
                            className={`type-btn ${craftType === 'advanced' ? 'active' : ''}`} 
                            onClick={() => setCraftType('advanced')}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            상급 아비도스
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="price-input-row">
                            <span style={{color:'var(--text-secondary)'}}>일반 목재</span>
                            <input type="number" className="price-input" style={{width:'100px'}} placeholder="0" value={owned.timber || ''} onChange={(e) => setOwned({...owned, timber: Number(e.target.value)})} />
                        </div>
                        <div className="price-input-row">
                            <span style={{color:'var(--text-secondary)'}}>부드러운 목재</span>
                            <input type="number" className="price-input" style={{width:'100px'}} placeholder="0" value={owned.softTimber || ''} onChange={(e) => setOwned({...owned, softTimber: Number(e.target.value)})} />
                        </div>
                        <div className="price-input-row">
                            <span style={{color:'var(--text-secondary)'}}>튼튼한 목재</span>
                            <input type="number" className="price-input" style={{width:'100px'}} placeholder="0" value={owned.sturdyTimber || ''} onChange={(e) => setOwned({...owned, sturdyTimber: Number(e.target.value)})} />
                        </div>
                        <div className="price-input-row">
                            <span style={{color:'var(--text-accent)'}}>아비도스 목재</span>
                            <input type="number" className="price-input" style={{width:'100px'}} placeholder="0" value={owned.abydosTimber || ''} onChange={(e) => setOwned({...owned, abydosTimber: Number(e.target.value)})} />
                        </div>
                        <div className="price-input-row" style={{opacity:0.8}}>
                            <span style={{color:'#aaa'}}>벌목의 가루</span>
                            <input type="number" className="price-input" style={{width:'100px'}} placeholder="0" value={owned.powder || ''} onChange={(e) => setOwned({...owned, powder: Number(e.target.value)})} />
                        </div>
                    </div>
                </aside>

                <main className="content-card" style={{ padding: '0' }}>
                    <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                        <span className="card-title">⚡ 교환 횟수 요약 ({craftType === 'advanced' ? '상급' : '일반'})</span>
                    </div>
                    {result ? (
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom:'30px', textAlign:'center' }}>
                                <div style={{ fontSize:'14px', color:'var(--text-secondary)' }}>최대 제작 가능</div>
                                <div style={{ fontSize:'48px', fontWeight:'bold', color:'var(--text-accent)' }}>
                                    {result.maxCrafts} <span style={{fontSize:'18px'}}>회</span>
                                    <span style={{fontSize:'20px', color:'#aaa', fontWeight:'normal', marginLeft:'8px'}}>
                                        (약 {result.maxCrafts * 10}개)
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {result.actions.map((act) => (
                                    <div key={act.step} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                                        <div style={{ display:'flex', flexDirection:'column' }}>
                                            <span style={{ fontSize:'15px', fontWeight:'bold', color:'#fff' }}>{act.label}</span>
                                            <span style={{ fontSize:'12px', color:'#aaa' }}>{act.desc}</span>
                                        </div>
                                        <div style={{ textAlign:'right' }}>
                                            <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>교환 횟수</span>
                                            <div style={{ fontSize:'24px', fontWeight:'bold', color:'#66bb6a' }}>{act.count} <span style={{fontSize:'14px'}}>회</span></div>
                                        </div>
                                    </div>
                                ))}
                                {result.actions.length === 0 && result.maxCrafts > 0 && <div style={{ textAlign:'center', color:'#aaa', padding:'20px' }}>추가 교환이 필요 없습니다. 바로 제작하세요!</div>}
                                {result.maxCrafts === 0 && <div style={{ textAlign:'center', color:'#ef5350', padding:'20px' }}>재료가 부족하여 1개도 제작할 수 없습니다.</div>}
                            </div>
                            {result.maxCrafts > 0 && <div style={{ marginTop:'20px', padding:'15px', background:'rgba(76, 175, 80, 0.1)', borderRadius:'8px', textAlign:'center', color:'#66bb6a', fontWeight:'bold' }}>🏁 위 교환을 마친 후 영지에서 {result.maxCrafts}회 제작</div>}
                        </div>
                    ) : (
                        <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>좌측에 보유 재료를 입력하면<br/>필요한 교환 횟수를 계산해드립니다.</div>
                    )}
                </main>
            </div>
        </div>
    );
}