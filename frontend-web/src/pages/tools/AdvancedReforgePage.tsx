import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

// 상급 재련용 재료 타입
interface AdvMaterial {
    id: string;
    name: string;
    icon: string;
    amount: number;
    price: number;
}

export default function AdvancedReforgePage() {
    const navigate = useNavigate();

    // --- [상태 관리] ---
    const [stageRange, setStageRange] = useState("0-10"); // 0-10, 10-20 ...
    const [equipType, setEquipType] = useState<'armor' | 'weapon'>('armor');

    // 재료 데이터 (스크린샷 기반)
    const [materials, setMaterials] = useState<AdvMaterial[]>([
        { id: 'stone', name: '수호석', icon: '💎', amount: 150, price: 5 },
        { id: 'leap', name: '돌파석', icon: '🔮', amount: 4, price: 9 },
        { id: 'fusion', name: '아비도스 융화', icon: '🟤', amount: 5, price: 85 },
        { id: 'shard', name: '파편', icon: '🧩', amount: 300, price: 0.07 },
        { id: 'gold', name: '골드', icon: '💰', amount: 475, price: 1 },
        { id: 'breath', name: '빙하의 숨결', icon: '❄️', amount: 4, price: 248 },
        { id: 'book', name: '재봉술 1단계', icon: '📜', amount: 1, price: 768 },
    ]);

    // 재료 가격 변경 핸들러
    const handlePriceChange = (id: string, newPrice: number) => {
        setMaterials(materials.map(mat => mat.id === id ? { ...mat, price: newPrice } : mat));
    };

    // --- [더미 결과 데이터] ---
    const bestComboName = "14번 조합";
    const bestCost = 51921;
    const avgTry = 50.60;

    // 조합 리스트 더미 데이터 (녹색/빨간색 강조용)
    const comboList = [
        { id: 14, name: "14번 조합", normal: "-", ancestor: "재", cost: 51921, isBest: true },
        { id: 13, name: "13번 조합", normal: "-", ancestor: "숨재", cost: 53603, isBest: false },
        { id: 16, name: "16번 조합", normal: "-", ancestor: "-", cost: 54709, isBest: false },
        { id: 15, name: "15번 조합", normal: "-", ancestor: "숨", cost: 56397, isBest: false },
        { id: 6, name: "6번 조합", normal: "재", ancestor: "재", cost: 62154, isBest: false },
        { id: 4, name: "4번 조합", normal: "숨재", ancestor: "-", cost: 83419, isWorst: true },
    ];

    return (
        <div className="container">
            {/* 1. 상단 탭 메뉴 (도구 네비게이션) */}
            <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '0' }}>
        <span
            onClick={() => navigate('/tools/general')}
            style={{ color: 'var(--text-secondary)', fontSize: '15px', marginRight: '20px', cursor:'pointer' }}
        >일반 재련</span>

                <span style={{
                    color: '#fff', fontWeight: 'bold', fontSize: '15px',
                    borderBottom: '2px solid var(--text-accent)', paddingBottom: '19px', marginRight: '20px', cursor:'pointer'
                }}>상급 재련</span>

                <span style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor:'pointer' }}>아비도스</span>
            </div>

            <div className="reforge-container">

                {/* ================= [좌측] 설정 사이드바 ================= */}
                <aside className="sidebar-card">

                    {/* 단계 선택 탭 (보라색 버튼 스타일) */}
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                        {["0-10", "10-20", "20-30", "30-40"].map(range => (
                            <button
                                key={range}
                                onClick={() => setStageRange(range)}
                                style={{
                                    flex: 1,
                                    padding: '10px 0',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: stageRange === range ? 'var(--text-accent)' : 'var(--bg-input)',
                                    color: stageRange === range ? '#fff' : 'var(--text-secondary)',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px' }}>
                        <div className="sidebar-title" style={{fontSize:'18px'}}>0~10단계 ({equipType === 'armor' ? '방어구' : '무기'})</div>

                        {/* 무기/방어구 아이콘 토글 */}
                        <div style={{ display:'flex', gap:'5px' }}>
                            <button
                                onClick={() => setEquipType('armor')}
                                style={{
                                    padding:'8px', borderRadius:'6px', border:'1px solid var(--border-color)',
                                    background: equipType === 'armor' ? 'var(--text-accent)' : 'var(--bg-input)',
                                    cursor:'pointer'
                                }}
                            >🛡️</button>
                            <button
                                onClick={() => setEquipType('weapon')}
                                style={{
                                    padding:'8px', borderRadius:'6px', border:'1px solid var(--border-color)',
                                    background: equipType === 'weapon' ? 'var(--text-accent)' : 'var(--bg-input)',
                                    cursor:'pointer'
                                }}
                            >⚔️</button>
                        </div>
                    </div>

                    {/* 1회 재련 재료 리스트 */}
                    <div className="sidebar-title" style={{fontSize:'13px', marginTop:'20px', marginBottom:'10px'}}>1회 재련 재료</div>
                    <div className="material-list">
                        {materials.map(mat => (
                            <div key={mat.id} className="material-item">
                                <span className="mat-name" style={{fontSize:'14px'}}>{mat.icon} {mat.name}</span>

                                {/* 수량 입력칸처럼 보이게 스타일링 */}
                                <div style={{
                                    background: 'var(--bg-app)', border:'1px solid var(--border-color)',
                                    padding:'4px 10px', borderRadius:'4px', minWidth:'60px', textAlign:'right', color:'#fff', fontSize:'13px'
                                }}>
                                    {mat.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 재료 시세 입력 */}
                    <div className="sidebar-title" style={{fontSize:'13px', marginTop:'25px', marginBottom:'10px'}}>재료 시세 (골드)</div>
                    <div>
                        {materials.map(mat => (
                            mat.id !== 'gold' && (
                                <div key={mat.id} className="price-input-row">
                  <span className="mat-name" style={{fontSize:'13px', color:'var(--text-secondary)'}}>
                    {mat.icon} {mat.name}
                  </span>
                                    <input
                                        type="number"
                                        className="price-input"
                                        value={mat.price}
                                        onChange={(e) => handlePriceChange(mat.id, parseFloat(e.target.value))}
                                    />
                                </div>
                            )
                        ))}
                    </div>

                    {/* 비용 포함/제외 체크박스 영역 (하단) */}
                    <div style={{ marginTop:'20px', paddingTop:'15px', borderTop:'1px solid var(--border-color)' }}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                            <span style={{fontSize:'14px', fontWeight:'bold', color:'#fff'}}>비용 포함/제외</span>
                            <button style={{
                                background:'var(--text-accent)', border:'none', borderRadius:'4px',
                                padding:'4px 8px', fontSize:'11px', color:'#fff', cursor:'pointer'
                            }}>모두 해제</button>
                        </div>
                        <p style={{fontSize:'11px', color:'var(--text-gold)', marginBottom:'10px'}}>💡 골드는 항상 비용에 포함됩니다.</p>

                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                            {materials.map(mat => mat.id !== 'gold' && (
                                <div key={mat.id} style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'#fff'}}>
                                    <input type="checkbox" defaultChecked style={{accentColor:'var(--text-accent)'}} />
                                    {mat.name}
                                </div>
                            ))}
                        </div>
                    </div>

                </aside>


                {/* ================= [우측] 결과 컨텐츠 ================= */}
                <main>

                    {/* 1. 최적 결과 카드 (보라색 강조) */}
                    <section className="content-card" style={{ padding:'0' }}>
                        <div style={{ padding:'25px', borderBottom:'1px solid var(--border-color)' }}>
                            <div style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'5px' }}>{bestComboName}</div>
                            <div style={{ fontSize:'36px', fontWeight:'800', color:'var(--text-accent)', marginBottom:'10px' }}>
                                {bestCost.toLocaleString()} G
                            </div>
                            <div style={{ fontSize:'13px', color:'var(--text-secondary)' }}>
                                평균 시도: <span style={{color:'#fff'}}>{avgTry}회</span><br/>
                                일반단 숨결: X / 재봉술 1단계: X<br/>
                                선조단 숨결: X / 재봉술 1단계: O
                            </div>
                        </div>

                        {/* 3등분 통계 박스 */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'20px', gap:'15px' }}>
                            <div style={{ background:'var(--bg-input)', padding:'15px', borderRadius:'8px', border:'1px solid var(--border-color)' }}>
                                <div style={{fontSize:'12px', color:'var(--text-secondary)', marginBottom:'5px'}}>일반단</div>
                                <div style={{fontSize:'16px', fontWeight:'bold', color:'#fff'}}>40.84회</div>
                                <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>964 G</div>
                            </div>
                            <div style={{ background:'var(--bg-input)', padding:'15px', borderRadius:'8px', border:'1px solid var(--border-color)' }}>
                                <div style={{fontSize:'12px', color:'var(--text-secondary)', marginBottom:'5px'}}>무료단</div>
                                <div style={{fontSize:'16px', fontWeight:'bold', color:'#fff'}}>2.53회</div>
                                <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>0 G</div>
                            </div>
                            <div style={{ background:'var(--bg-input)', padding:'15px', borderRadius:'8px', border:'1px solid var(--border-color)' }}>
                                <div style={{fontSize:'12px', color:'var(--text-secondary)', marginBottom:'5px'}}>선조단</div>
                                <div style={{fontSize:'16px', fontWeight:'bold', color:'#fff'}}>7.23회</div>
                                <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>1,732 G</div>
                            </div>
                        </div>
                    </section>

                    {/* 2. 예상 재료 소모량 */}
                    <section className="content-card">
                        <div className="card-header">
                            <span className="card-title">예상 재료 소모량</span>
                        </div>
                        <div className="cumul-grid">
                            {materials.map(mat => (
                                <div key={mat.id} className="cumul-item">
                                    <span className="mat-name">{mat.icon} {mat.name}</span>
                                    <span style={{fontWeight:'bold', color:'#fff'}}>{(mat.amount * 50).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3. 전체 조합 리스트 (비용순) */}
                    <section className="content-card">
                        <div className="card-header">
                            <span className="card-title">전체 조합 (비용순)</span>
                        </div>

                        <table className="prob-table">
                            <thead>
                            <tr>
                                <th>조합</th>
                                <th>일반</th>
                                <th>선조</th>
                                <th>평균 비용</th>
                            </tr>
                            </thead>
                            <tbody>
                            {comboList.map(combo => (
                                <tr
                                    key={combo.id}
                                    // 최적(녹색 배경), 최악(빨간 배경) 스타일 적용
                                    style={{
                                        backgroundColor: combo.isBest ? 'rgba(76, 175, 80, 0.1)' :
                                            combo.isWorst ? 'rgba(244, 67, 54, 0.1)' : 'transparent'
                                    }}
                                >
                                    <td style={{
                                        color: combo.isBest ? '#66bb6a' : combo.isWorst ? '#ef5350' : 'var(--text-blue)',
                                        fontWeight:'bold'
                                    }}>
                                        {combo.name}
                                    </td>
                                    <td>{combo.normal}</td>
                                    <td>{combo.ancestor}</td>
                                    <td style={{ fontWeight:'bold', color:'#fff' }}>{combo.cost.toLocaleString()} G</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={4} style={{ color:'var(--text-secondary)', fontSize:'12px', padding:'10px' }}>... 10개 더보기 ...</td>
                            </tr>
                            </tbody>
                        </table>

                        <div style={{ marginTop:'15px', fontSize:'12px', color:'var(--text-secondary)' }}>
                            <span style={{color:'#66bb6a'}}>●</span> 녹색 행은 최적 조합, <span style={{color:'#ef5350'}}>●</span> 빨간색 행은 최악 조합입니다.<br/>
                            숨 = 숨결, 재 = 재봉술 1단계
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
}