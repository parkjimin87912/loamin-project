import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

export default function AuctionPage() {
    const navigate = useNavigate();
    const [marketPrice, setMarketPrice] = useState<number>(0);
    const [partySize, setPartySize] = useState<number>(4);

    const fee = Math.floor(marketPrice * 0.05);
    const netIncome = marketPrice - fee;
    const breakEven = Math.floor(netIncome * (partySize - 1) / partySize);
    const recommend = Math.floor(breakEven / 1.1);
    const distribution = partySize > 1 ? Math.floor(breakEven / (partySize - 1)) : 0;
    const profit = netIncome - recommend;

    return (
        <div className="container">
            {/* 상단 탭 (통일됨) */}
            <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', display: 'flex', gap: '20px', overflowX: 'auto' }}>
                <span onClick={() => navigate('/tools/general')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>일반 재련</span>
                <span onClick={() => navigate('/tools/advanced')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>상급 재련</span>
                <span onClick={() => navigate('/tools/abydos')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>아비도스 쌀산기</span>
                <span onClick={() => navigate('/tools/craft')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>아비도스 제작</span>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', borderBottom: '2px solid var(--text-accent)', paddingBottom: '19px', cursor: 'pointer' }}>경매 계산기</span>
            </div>

            <div className="reforge-container">
                <aside className="sidebar-card" style={{ height: 'fit-content' }}>
                    <div className="sidebar-title" style={{ fontSize: '18px', marginBottom: '20px' }}>⚙️ 경매 설정</div>
                    <div style={{ marginBottom: '25px' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>파티 규모</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setPartySize(4)} className={`type-btn ${partySize === 4 ? 'active' : ''}`} style={{ padding: '12px', justifyContent: 'center', fontSize:'14px' }}>4인 파티</button>
                            <button onClick={() => setPartySize(8)} className={`type-btn ${partySize === 8 ? 'active' : ''}`} style={{ padding: '12px', justifyContent: 'center', fontSize:'14px' }}>8인 공격대</button>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>거래소 시세 (최저가)</div>
                        <div className="price-input-row" style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <input type="number" className="price-input" style={{ flex: 1, height: '30px', fontSize: '22px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', fontWeight:'bold' }} placeholder="0" value={marketPrice || ''} onChange={(e) => setMarketPrice(Number(e.target.value))} autoFocus />
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-gold)' }}>G</span>
                        </div>
                    </div>
                    <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px' }}>
                        <p style={{ fontSize: '13px', color: '#81c784', margin: 0, lineHeight: '1.5' }}>💡 <strong>TIP</strong><br/>수수료를 제외한 실수령액을 기준으로<br/>정확한 손익분기점을 계산합니다.</p>
                    </div>
                </aside>

                <main className="content-card">
                    <div className="card-header"><span className="card-title">📊 입찰 가이드</span></div>
                    <div className="stat-box" style={{ border: '1px solid var(--text-accent)', background: 'rgba(169, 112, 255, 0.08)', marginBottom: '20px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                            <div>
                                <div className="stat-label" style={{ color: 'var(--text-accent)', fontWeight: 'bold' }}>💰 추천 입찰가 (선점)</div>
                                <div className="stat-value" style={{ color: 'var(--text-accent)', fontSize: '42px' }}>{recommend.toLocaleString()} <span className="stat-unit">G</span></div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)' }}>입찰 시 이득<br/><span style={{ color: '#66bb6a', fontWeight: 'bold', fontSize: '16px' }}>+{profit.toLocaleString()} G</span></div>
                        </div>
                        <div className="stat-gold" style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'normal', marginTop: '8px' }}>이 가격에 입찰하면 상회입찰 없이 안전하게 가져갈 수 있습니다.</div>
                    </div>
                    <div className="optimal-grid" style={{ marginBottom: '25px', gridTemplateColumns: '1fr' }}>
                        <div className="stat-box">
                            <div className="stat-label">📉 손익분기점 (마지노선)</div>
                            <div className="stat-value" style={{ fontSize: '24px' }}>{breakEven.toLocaleString()} <span className="stat-unit" style={{ fontSize: '14px' }}>G</span></div>
                            <div className="stat-gold" style={{ fontSize: '12px', color: '#ef5350', fontWeight: 'normal', marginTop: '5px' }}>이 금액을 넘어서 입찰하면 분배금을 받는 것보다 손해입니다.</div>
                        </div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', borderRadius: '8px', padding: '20px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#fff' }}>📋 상세 정보</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>거래소 시세</span><span style={{ fontWeight: 'bold' }}>{marketPrice.toLocaleString()} G</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>판매 수수료 (5%)</span><span style={{ color: '#ef5350' }}>-{fee.toLocaleString()} G</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>실수령액 (가치 기준)</span><span style={{ fontWeight: 'bold' }}>{netIncome.toLocaleString()} G</span></div>
                            <div style={{ borderTop: '1px solid #333', margin: '5px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#aaa' }}>예상 분배금 (1인)</span>
                                <span style={{ fontWeight: 'bold', color: '#4dabf7' }}>{distribution.toLocaleString()} G</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}