import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

// 타입 정의
interface Material {
    id: string;
    name: string;
    icon: string;
    amount: number;
    price: number;
}

export default function GeneralReforgePage() {
    const navigate = useNavigate();

    // --- [상태 관리] ---
    const [equipType, setEquipType] = useState<'armor' | 'weapon'>('armor');
    const [targetLevel, setTargetLevel] = useState("10 → 11강");
    const [includeGrowth, setIncludeGrowth] = useState(true);

    // 재료 데이터
    const [materials, setMaterials] = useState<Material[]>([
        { id: 'stone', name: '수호석', icon: '💎', amount: 750, price: 5 },
        { id: 'leap', name: '돌파석', icon: '🔮', amount: 11, price: 8 },
        { id: 'fusion', name: '아비도스 융화', icon: '🟤', amount: 7, price: 83 },
        { id: 'shard', name: '운명의 파편', icon: '🧩', amount: 3000, price: 0.07 },
        { id: 'gold', name: '골드', icon: '💰', amount: 970, price: 1 },
        { id: 'breath', name: '빙하의 숨결', icon: '❄️', amount: 20, price: 261 },
    ]);

    // 재료 가격 변경 핸들러
    const handlePriceChange = (id: string, newPrice: number) => {
        setMaterials(materials.map(mat => mat.id === id ? { ...mat, price: newPrice } : mat));
    };

    // --- [계산 로직] ---
    const costPerTry = materials.reduce((sum, mat) => sum + (mat.amount * mat.price), 0);
    const avgTry = 4;
    const maxTry = 10;
    const avgCost = costPerTry * avgTry;
    const maxCost = costPerTry * maxTry;

    return (
        <div className="container">
            {/* 상단 탭 (통일됨) */}
            <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', display: 'flex', gap: '20px', overflowX: 'auto' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', borderBottom: '2px solid var(--text-accent)', paddingBottom: '19px', cursor: 'pointer' }}>일반 재련</span>
                <span onClick={() => navigate('/tools/advanced')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>상급 재련</span>
                <span onClick={() => navigate('/tools/abydos')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>아비도스 쌀산기</span>
                <span onClick={() => navigate('/tools/craft')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>아비도스 제작</span>
                <span onClick={() => navigate('/tools/auction')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>경매 계산기</span>
            </div>

            <div className="reforge-container">
                {/* 좌측 설정 */}
                <aside className="sidebar-card">
                    <div className="sidebar-title">재련 설정</div>
                    <p className="sidebar-desc">재련 단계, 장비 타입, 재료 시세를 설정합니다.</p>

                    {/* 장비 타입 버튼 */}
                    <div className="type-selector">
                        <button className={`type-btn ${equipType === 'armor' ? 'active' : ''}`} onClick={() => setEquipType('armor')}>🛡️ 방어구</button>
                        <button className={`type-btn ${equipType === 'weapon' ? 'active' : ''}`} onClick={() => setEquipType('weapon')}>⚔️ 무기</button>
                    </div>

                    {/* 단계 선택 */}
                    <select className="custom-select" value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)}>
                        <option>10 → 11강</option>
                        <option>11 → 12강</option>
                        <option>12 → 13강</option>
                    </select>

                    {/* 1회 재련 재료 */}
                    <div className="sidebar-title" style={{fontSize:'13px', marginTop:'20px', marginBottom:'10px'}}>1회 재련 재료</div>
                    <div className="material-list">
                        {materials.map(mat => (
                            <div key={mat.id} className="material-item">
                                <span className="mat-name">{mat.icon} {mat.name}</span>
                                <span className="mat-qty">{mat.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    {/* 토글 */}
                    <div className="toggle-row">
                        <div>
                            <div style={{fontSize:'14px', fontWeight:'bold', color:'#fff', marginBottom:'4px'}}>성장 재료 포함</div>
                            <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>누적 재료에 파편/실링 합산</div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={includeGrowth} onChange={() => setIncludeGrowth(!includeGrowth)} />
                            <span className="slider"></span>
                        </label>
                    </div>

                    {/* 시세 입력 */}
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
                    {/* 최적 조합 */}
                    <section className="content-card">
                        <div className="card-header">
                            <span className="card-title">최적의 재련 조합</span>
                            <span style={{ background: '#2c2240', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', color: '#a970ff', fontWeight:'bold', border:'1px solid #a970ff' }}>책O / 숨결X</span>
                        </div>
                        <div className="optimal-grid">
                            <div className="stat-box">
                                <div className="stat-label">평균 시도 횟수</div>
                                <div className="stat-value">{avgTry}<span className="stat-unit">회</span></div>
                                <div className="stat-gold">{avgCost.toLocaleString()} G</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-label">장인의 기운 (최대)</div>
                                <div className="stat-value" style={{color:'#e1e1e8'}}>{maxTry}<span className="stat-unit">회</span></div>
                                <div className="stat-gold" style={{color:'#ffcc00'}}>{maxCost.toLocaleString()} G</div>
                            </div>
                        </div>
                    </section>

                    {/* 누적 소모량 */}
                    <section className="content-card">
                        <div className="card-header"><span className="card-title">누적 재료 소모량</span></div>
                        <div style={{ marginBottom: '30px' }}>
                            <h4 style={{ color: '#fff', fontSize:'15px', margin: '0 0 15px 0' }}>장인의 기운 100% 기준 (최대)</h4>
                            <div className="cumul-grid">
                                {materials.map(mat => (
                                    <div key={mat.id} className="cumul-item">
                                        <span className="mat-name">{mat.icon} {mat.name}</span>
                                        <span style={{fontWeight:'bold', color:'#fff'}}>{(mat.amount * maxTry).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ color: '#fff', fontSize:'15px', margin: '0 0 15px 0' }}>평균 시도 기준 (기댓값)</h4>
                            <div className="cumul-grid">
                                {materials.map(mat => (
                                    <div key={mat.id} className="cumul-item">
                                        <span className="mat-name">{mat.icon} {mat.name}</span>
                                        <span style={{fontWeight:'bold', color:'#e1e1e8'}}>{(mat.amount * avgTry).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}