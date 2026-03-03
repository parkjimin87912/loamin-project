import { useState } from 'react';
import ToolsHeader from '../../components/ToolsHeader';
import '../../App.css';

export default function AuctionPage() {
    const [marketPrice, setMarketPrice] = useState<number>(0);
    const [partySize, setPartySize] = useState<number>(4);

    // 🌟 계산 로직 수정 (손익분기점 = 시세 * 0.95 * (N-1)/N)
    const fee = Math.floor(marketPrice * 0.05);
    const netIncome = marketPrice - fee; // 수수료 뗀 실수령액
    
    // 손익분기점: 내가 입찰해서 가져가는 것과 분배금을 받는 것이 같아지는 지점
    // 입찰가 = 실수령액 * (N-1)/N
    const breakEven = Math.floor(netIncome * (partySize - 1) / partySize);
    
    // 추천 입찰가 (선점): 손익분기점의 약 91% (1.1로 나눔) -> 10% 정도 이득을 보는 선
    const recommend = Math.floor(breakEven / 1.1);
    
    // 예상 분배금 (1인): 손익분기점 / (N-1)
    const distribution = partySize > 1 ? Math.floor(breakEven / (partySize - 1)) : 0;
    
    // 입찰 시 이득: 실수령액 - 추천 입찰가
    const profit = netIncome - recommend;

    return (
        <div className="container">
            {/* 상단 탭 (통일됨) */}
            <ToolsHeader />

            <div className="reforge-container">
                <aside className="sidebar-card" style={{ height: 'fit-content' }}>
                    <div className="sidebar-title" style={{ fontSize: '18px', marginBottom: '20px' }}>⚙️ 경매 설정</div>
                    <div style={{ marginBottom: '25px' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>파티 규모</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setPartySize(4)} 
                                className={`type-btn ${partySize === 4 ? 'active' : ''}`} 
                                style={{ flex: 1, padding: '12px', justifyContent: 'center', fontSize:'14px' }}
                            >
                                4인 파티
                            </button>
                            <button 
                                onClick={() => setPartySize(8)} 
                                className={`type-btn ${partySize === 8 ? 'active' : ''}`} 
                                style={{ flex: 1, padding: '12px', justifyContent: 'center', fontSize:'14px' }}
                            >
                                8인 공격대
                            </button>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>거래소 시세 (최저가)</div>
                        <div className="price-input-row" style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <input 
                                type="number" 
                                className="price-input" 
                                style={{ flex: 1, height: '30px', fontSize: '22px', width: '100%', background: 'transparent', border: 'none', textAlign: 'right', fontWeight:'bold', color: '#fff' }} 
                                placeholder="0" 
                                value={marketPrice || ''} 
                                onChange={(e) => setMarketPrice(Number(e.target.value))} 
                                autoFocus 
                            />
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-gold)', marginLeft: '10px' }}>G</span>
                        </div>
                    </div>
                    <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px' }}>
                        <p style={{ fontSize: '13px', color: '#81c784', margin: 0, lineHeight: '1.5' }}>💡 <strong>TIP</strong><br/>수수료를 제외한 실수령액을 기준으로<br/>정확한 손익분기점을 계산합니다.</p>
                    </div>
                </aside>

                <main className="content-card">
                    <div className="card-header"><span className="card-title">📊 입찰 가이드</span></div>
                    
                    {/* 추천 입찰가 박스 */}
                    <div className="stat-box" style={{ border: '1px solid var(--text-accent)', background: 'rgba(169, 112, 255, 0.08)', marginBottom: '20px', padding: '25px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                            <div>
                                <div className="stat-label" style={{ color: 'var(--text-accent)', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>💰 추천 입찰가 (선점)</div>
                                <div className="stat-value" style={{ color: 'var(--text-accent)', fontSize: '48px', lineHeight: '1' }}>
                                    {recommend.toLocaleString()} <span className="stat-unit" style={{ fontSize: '24px' }}>G</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.2)', padding: '10px 15px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px' }}>입찰 성공 시 이득</div>
                                <div style={{ color: '#66bb6a', fontWeight: 'bold', fontSize: '20px' }}>+{profit.toLocaleString()} G</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(169, 112, 255, 0.2)' }}>
                            이 가격에 입찰하면 상회입찰 없이 안전하게 가져갈 수 있습니다.
                        </div>
                    </div>

                    {/* 손익분기점 박스 */}
                    <div className="stat-box" style={{ marginBottom: '25px', background: 'rgba(239, 83, 80, 0.05)', border: '1px solid rgba(239, 83, 80, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div className="stat-label" style={{ color: '#ef5350', fontWeight: 'bold' }}>📉 손익분기점 (마지노선)</div>
                                <div className="stat-value" style={{ fontSize: '32px', color: '#ef5350' }}>
                                    {breakEven.toLocaleString()} <span className="stat-unit" style={{ fontSize: '18px' }}>G</span>
                                </div>
                            </div>
                            <div style={{ maxWidth: '200px', fontSize: '13px', color: '#ef5350', textAlign: 'right', lineHeight: '1.4' }}>
                                이 금액을 넘어서 입찰하면<br/>분배금을 받는 것보다 손해입니다.
                            </div>
                        </div>
                    </div>

                    {/* 상세 정보 테이블 */}
                    <div style={{ background: 'var(--bg-input)', borderRadius: '8px', padding: '20px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>📋 상세 계산 내역</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>거래소 시세</span>
                                <span style={{ fontWeight: 'bold' }}>{marketPrice.toLocaleString()} G</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>판매 수수료 (5%)</span>
                                <span style={{ color: '#ef5350' }}>-{fee.toLocaleString()} G</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #444' }}>
                                <span style={{ color: '#fff' }}>실수령액 (가치 기준)</span>
                                <span style={{ fontWeight: 'bold', color: '#fff' }}>{netIncome.toLocaleString()} G</span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px' }}>
                                <span style={{ color: '#aaa' }}>예상 분배금 (1인당)</span>
                                <span style={{ fontWeight: 'bold', color: '#4dabf7' }}>{distribution.toLocaleString()} G</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}