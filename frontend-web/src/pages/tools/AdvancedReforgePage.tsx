import { useState } from 'react';
import ToolsHeader from '../../components/ToolsHeader';
import '../../App.css';

interface AdvMaterial {
    id: string;
    name: string;
    icon: string;
    amount: number;
    price: number;
}

export default function AdvancedReforgePage() {
    // --- [상태 관리] ---
    const [stageRange, setStageRange] = useState("0-10");
    const [equipType, setEquipType] = useState<'armor' | 'weapon'>('armor');

    const [materials, setMaterials] = useState<AdvMaterial[]>([
        { id: 'stone', name: '수호석', icon: '💎', amount: 150, price: 5 },
        { id: 'leap', name: '돌파석', icon: '🔮', amount: 4, price: 9 },
        { id: 'fusion', name: '아비도스 융화', icon: '🟤', amount: 5, price: 85 },
        { id: 'shard', name: '파편', icon: '🧩', amount: 300, price: 0.07 },
        { id: 'gold', name: '골드', icon: '💰', amount: 475, price: 1 },
        { id: 'breath', name: '빙하의 숨결', icon: '❄️', amount: 4, price: 248 },
        { id: 'book', name: '재봉술 1단계', icon: '📜', amount: 1, price: 768 },
    ]);

    const handlePriceChange = (id: string, newPrice: number) => {
        setMaterials(materials.map(mat => mat.id === id ? { ...mat, price: newPrice } : mat));
    };

    const bestComboName = "14번 조합";
    const bestCost = 51921;
    const avgTry = 50.60;
    const comboList = [
        { id: 14, name: "14번 조합", normal: "-", ancestor: "재", cost: 51921, isBest: true },
        { id: 13, name: "13번 조합", normal: "-", ancestor: "숨재", cost: 53603, isBest: false },
        { id: 16, name: "16번 조합", normal: "-", ancestor: "-", cost: 54709, isBest: false },
        { id: 6, name: "6번 조합", normal: "재", ancestor: "재", cost: 62154, isBest: false },
        { id: 4, name: "4번 조합", normal: "숨재", ancestor: "-", cost: 83419, isWorst: true },
    ];

    return (
        <div className="container">
            {/* 상단 탭 (통일됨) */}
            <ToolsHeader />

            <div className="reforge-container">
                {/* 좌측 사이드바 */}
                <aside className="sidebar-card">
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                        {["0-10", "10-20", "20-30", "30-40"].map(range => (
                            <button key={range} onClick={() => setStageRange(range)} style={{ flex: 1, padding: '10px 0', borderRadius: '6px', border: 'none', background: stageRange === range ? 'var(--text-accent)' : 'var(--bg-input)', color: stageRange === range ? '#fff' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{range}</button>
                        ))}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px' }}>
                        <div className="sidebar-title" style={{fontSize:'18px'}}>0~10단계 ({equipType === 'armor' ? '방어구' : '무기'})</div>
                        <div style={{ display:'flex', gap:'5px' }}>
                            <button onClick={() => setEquipType('armor')} style={{ padding:'8px', borderRadius:'6px', border:'1px solid var(--border-color)', background: equipType === 'armor' ? 'var(--text-accent)' : 'var(--bg-input)', cursor:'pointer' }}>🛡️</button>
                            <button onClick={() => setEquipType('weapon')} style={{ padding:'8px', borderRadius:'6px', border:'1px solid var(--border-color)', background: equipType === 'weapon' ? 'var(--text-accent)' : 'var(--bg-input)', cursor:'pointer' }}>⚔️</button>
                        </div>
                    </div>
                    {/* 재료 리스트 및 시세 입력 생략 (위와 동일한 패턴) */}
                    <div className="sidebar-title" style={{fontSize:'13px', marginTop:'20px', marginBottom:'10px'}}>재료 시세 (골드)</div>
                    <div>
                        {materials.map(mat => mat.id !== 'gold' && (
                            <div key={mat.id} className="price-input-row">
                                <span className="mat-name" style={{fontSize:'13px', color:'var(--text-secondary)'}}>{mat.icon} {mat.name}</span>
                                <input type="number" className="price-input" value={mat.price} onChange={(e) => handlePriceChange(mat.id, parseFloat(e.target.value))} />
                            </div>
                        ))}
                    </div>
                </aside>

                {/* 우측 결과 */}
                <main>
                    <section className="content-card" style={{ padding:'0' }}>
                        <div style={{ padding:'25px', borderBottom:'1px solid var(--border-color)' }}>
                            <div style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'5px' }}>{bestComboName}</div>
                            <div style={{ fontSize:'36px', fontWeight:'800', color:'var(--text-accent)', marginBottom:'10px' }}>{bestCost.toLocaleString()} G</div>
                            <div style={{ fontSize:'13px', color:'var(--text-secondary)' }}>평균 시도: <span style={{color:'#fff'}}>{avgTry}회</span></div>
                        </div>
                        {/* 3등분 통계 생략 */}
                    </section>

                    <section className="content-card">
                        <div className="card-header"><span className="card-title">전체 조합 (비용순)</span></div>
                        <table className="prob-table">
                            <thead><tr><th>조합</th><th>일반</th><th>선조</th><th>평균 비용</th></tr></thead>
                            <tbody>
                            {comboList.map(combo => (
                                <tr key={combo.id} style={{ backgroundColor: combo.isBest ? 'rgba(76, 175, 80, 0.1)' : combo.isWorst ? 'rgba(244, 67, 54, 0.1)' : 'transparent' }}>
                                    <td style={{ color: combo.isBest ? '#66bb6a' : 'var(--text-blue)', fontWeight:'bold' }}>{combo.name}</td>
                                    <td>{combo.normal}</td><td>{combo.ancestor}</td>
                                    <td style={{ fontWeight:'bold', color:'#fff' }}>{combo.cost.toLocaleString()} G</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </div>
    );
}