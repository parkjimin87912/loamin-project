import { useState, useMemo } from 'react';
import ToolsHeader from '../../components/ToolsHeader';
import '../../App.css';

export default function AbydosCraftPage() {
    const [owned, setOwned] = useState({
        timber: 0, softTimber: 0, sturdyTimber: 0, abydosTimber: 0, powder: 0
    });

    const result = useMemo(() => {
        if (Object.values(owned).every(v => v === 0)) return null;

        const checkFeasibility = (n: number) => {
            const TARGET = { abydos: 43 * n, soft: 59 * n, normal: 112 * n };
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
    }, [owned]);

    return (
        <div className="container">
            {/* 상단 탭 (통일됨) */}
            <ToolsHeader />

            <div className="reforge-container">
                <aside className="sidebar-card" style={{ height: 'fit-content' }}>
                    <div className="sidebar-title" style={{ fontSize: '18px', marginBottom: '20px' }}>🎒 보유 재료 입력</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="price-input-row"><span style={{color:'var(--text-secondary)'}}>일반 목재</span><input type="number" className="price-input" style={{width:'100px'}} placeholder="0" value={owned.timber || ''} onChange={(e) => setOwned({...owned, timber: Number(e.target.value)})} /></div>
                        <div className="price-input-row"><span style={{color:'var(--text-secondary)'}}>부드러운 목재</span><input type="number" className="price-input" style={{width:'100px'}} placeholder="0" value={owned.softTimber || ''} onChange={(e) => setOwned({...owned, softTimber: Number(e.target.value)})} /></div>
                        <div className="price-input-row"><span style={{color:'var(--text-secondary)'}}>튼튼한 목재</span><input type="number" className="price-input" style={{width:'100px'}} placeholder="0" value={owned.sturdyTimber || ''} onChange={(e) => setOwned({...owned, sturdyTimber: Number(e.target.value)})} /></div>
                        <div className="price-input-row"><span style={{color:'var(--text-accent)'}}>아비도스 목재</span><input type="number" className="price-input" style={{width:'100px'}} placeholder="0" value={owned.abydosTimber || ''} onChange={(e) => setOwned({...owned, abydosTimber: Number(e.target.value)})} /></div>
                        <div className="price-input-row" style={{opacity:0.8}}><span style={{color:'#aaa'}}>벌목의 가루</span><input type="number" className="price-input" style={{width:'100px'}} placeholder="0" value={owned.powder || ''} onChange={(e) => setOwned({...owned, powder: Number(e.target.value)})} /></div>
                    </div>
                </aside>

                <main className="content-card" style={{ padding: '0' }}>
                    <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}><span className="card-title">⚡ 교환 횟수 요약</span></div>
                    {result ? (
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom:'30px', textAlign:'center' }}>
                                <div style={{ fontSize:'14px', color:'var(--text-secondary)' }}>최대 제작 가능</div>
                                <div style={{ fontSize:'48px', fontWeight:'bold', color:'var(--text-accent)' }}>{result.maxCrafts} <span style={{fontSize:'18px'}}>회</span></div>
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