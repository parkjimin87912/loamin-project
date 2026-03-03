import { useState } from 'react';
import ToolsHeader from '../../components/ToolsHeader';
import '../../App.css';

// 로스트아크 스탯 변환 계수 (T4 기준)
const CRIT_MULTIPLIER = 0.03578; // 치명 1당 치적 약 0.03578%
const SWIFT_MULTIPLIER = 0.01717; // 신속 1당 공이속 약 0.01717%

export default function StatCalculatorPage() {
    // ==========================================
    // 1. 치명 스탯 계산기 (뭉가, 입타) 상태
    // ==========================================
    const [critValues, setCritValues] = useState({
        classBuff: 0,
        skillTripod: 0,
        synergy: 0,
        bracelet: 0,
        ring1: 0,
        ring2: 0,
        weakness: 0,
        etherBoy: 0,
        adrenaline: 0,
        preciseDagger: 0,
        elixir: 0,
        t2Node: 0,
        t3Node: 0,
    });
    const [isBackAttack, setIsBackAttack] = useState(false);

    const handleCritChange = (key: keyof typeof critValues, value: number) => {
        setCritValues(prev => ({ ...prev, [key]: value }));
    };

    // 치적 합산 로직
    const totalCritBuff = Object.values(critValues).reduce((a, b) => a + Number(b), 0) + (isBackAttack ? 10 : 0);

    // 목표별 필요 치명 스탯 (0 이하일 경우 0으로 처리)
    const reqCritMoong1 = Math.ceil(Math.max(0, 115.42 - totalCritBuff) / CRIT_MULTIPLIER);
    const reqCritMoong2 = Math.ceil(Math.max(0, 119.28 - totalCritBuff) / CRIT_MULTIPLIER);
    const reqCritIpta = Math.ceil(Math.max(0, 100.00 - totalCritBuff) / CRIT_MULTIPLIER);

    // ==========================================
    // 2. 신속 스탯 계산기 (음돌) 상태
    // ==========================================
    const [swiftValues, setSwiftValues] = useState({
        classAtk: 0,
        classMv: 0,
        skillAtk: 0,
        skillMv: 0,
        bracelet: 0,
        currentSwiftStat: 0,
    });
    const [swiftToggles, setSwiftToggles] = useState({
        yearning: false, // 갈망 9%
        feast: false,    // 만찬 5%
        food: false,     // 음식 3%
        massIncrease: false, // 질량 증가 -10%
        isIpta21: false // 입타 21% 기준 변경 여부
    });

    const handleSwiftChange = (key: keyof typeof swiftValues, value: number) => {
        setSwiftValues(prev => ({ ...prev, [key]: value }));
    };

    const handleToggleChange = (key: keyof typeof swiftToggles) => {
        setSwiftToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // 공이속 합산 로직
    const totalAtkBuff = Number(swiftValues.classAtk) + Number(swiftValues.skillAtk) + Number(swiftValues.bracelet) +
        (swiftToggles.yearning ? 9 : 0) + (swiftToggles.feast ? 5 : 0) + (swiftToggles.food ? 3 : 0) - (swiftToggles.massIncrease ? 10 : 0);

    const totalMvBuff = Number(swiftValues.classMv) + Number(swiftValues.skillMv) + Number(swiftValues.bracelet) +
        (swiftToggles.yearning ? 9 : 0) + (swiftToggles.feast ? 5 : 0);

    // 내 현재 스탯 기준 최종 공이속
    const currentAtkSpd = totalAtkBuff + (Number(swiftValues.currentSwiftStat) * SWIFT_MULTIPLIER);
    const currentMvSpd = totalMvBuff + (Number(swiftValues.currentSwiftStat) * SWIFT_MULTIPLIER);

    // 목표 달성을 위한 최소 신속 스탯 계산
    const targetSpd = swiftToggles.isIpta21 ? 21 : 40; // 입타 21% 체크 시 21%, 기본 음돌은 40%
    const reqSwiftForAtk = Math.ceil(Math.max(0, targetSpd - totalAtkBuff) / SWIFT_MULTIPLIER);
    const reqSwiftForMv = Math.ceil(Math.max(0, targetSpd - totalMvBuff) / SWIFT_MULTIPLIER);
    const minReqSwift = Math.max(reqSwiftForAtk, reqSwiftForMv);

    return (
        <div className="container">
            <ToolsHeader />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px', paddingBottom: '50px' }}>

                {/* 🌟 좌측: 치명 스탯 계산기 (뭉가 / 입타) */}
                <section className="content-card">
                    <div className="card-header"><span className="card-title">적정 치명 스탯 계산기</span></div>
                    <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '15px' }}>
                        P 정보창 표기 기준입니다. (뭉가, 입타 목표 수치 계산)
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                        {[
                            { label: '직업 각인 치적%', key: 'classBuff' },
                            { label: '스킬 치적% 트포', key: 'skillTripod' },
                            { label: '치적% 시너지', key: 'synergy' },
                            { label: '팔찌 치적%', key: 'bracelet' },
                            { label: '반지 연마 1', key: 'ring1' },
                            { label: '반지 연마 2', key: 'ring2' },
                            { label: '약점 노출% (서폿)', key: 'weakness' },
                            { label: '구슬 동자 어빌돌', key: 'etherBoy' },
                            { label: '아드레날린', key: 'adrenaline' },
                            { label: '정밀 단도', key: 'preciseDagger' },
                            { label: '달인 엘릭서', key: 'elixir' },
                            { label: '2티어 진화 노드', key: 't2Node' },
                            { label: '3티어 진화 노드', key: 't3Node' },
                        ].map(item => (
                            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '6px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="price-input" 
                                    style={{ width: '60px', background: 'transparent', border: 'none', color: '#fff', textAlign: 'right', fontWeight: 'bold' }}
                                    value={critValues[item.key as keyof typeof critValues] || ''} 
                                    placeholder="0" 
                                    onChange={(e) => handleCritChange(item.key as keyof typeof critValues, Number(e.target.value))} 
                                />
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '6px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>백어택 (+10%)</span>
                            <input type="checkbox" className="custom-checkbox" checked={isBackAttack} onChange={(e) => setIsBackAttack(e.target.checked)} />
                        </div>
                    </div>

                    <div style={{ padding: '15px', background: 'rgba(169, 112, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(169, 112, 255, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold', color: '#a970ff' }}>합산 치명타 확률</span>
                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{totalCritBuff.toFixed(2)}%</span>
                        </div>
                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span>입타 (100.00%) 적정 치명 스탯:</span>
                                <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>{reqCritIpta}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span>뭉가 1Lv (115.42%) 적정 치명 스탯:</span>
                                <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>{reqCritMoong1}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span>뭉가 2Lv (119.28%) 적정 치명 스탯:</span>
                                <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>{reqCritMoong2}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 🌟 우측: 신속 스탯 계산기 (음돌) */}
                <section className="content-card">
                    <div className="card-header"><span className="card-title">음속 돌파 적정 신속 계산기</span></div>
                    <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '15px' }}>
                        상시 공속 & 이속이 목표치(기본 40%)를 초과해야 합니다.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                        {[
                            { label: '직각 공속 버프', key: 'classAtk' },
                            { label: '직각 이속 버프', key: 'classMv' },
                            { label: '스킬 공속 버프', key: 'skillAtk' },
                            { label: '스킬 이속 버프', key: 'skillMv' },
                            { label: '팔찌 공이속 버프', key: 'bracelet' },
                            { label: '내 현재 신속 스탯', key: 'currentSwiftStat' },
                        ].map(item => (
                            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '6px' }}>
                                <span style={{ fontSize: '13px', color: item.key === 'currentSwiftStat' ? '#4caf50' : 'var(--text-secondary)', fontWeight: item.key === 'currentSwiftStat' ? 'bold' : 'normal' }}>{item.label}</span>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="price-input" 
                                    style={{ width: '60px', background: 'transparent', border: 'none', color: '#fff', textAlign: 'right', fontWeight: 'bold' }}
                                    value={swiftValues[item.key as keyof typeof swiftValues] || ''} 
                                    placeholder="0" 
                                    onChange={(e) => handleSwiftChange(item.key as keyof typeof swiftValues, Number(e.target.value))} 
                                />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                        {[
                            { label: '갈망 9%', key: 'yearning' },
                            { label: '공이속 만찬 5%', key: 'feast' },
                            { label: '공속 음식 3%', key: 'food' },
                            { label: '질량 증가 -10%', key: 'massIncrease' },
                            { label: '입타 21% 기준으로 변경', key: 'isIpta21' },
                        ].map(item => (
                            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '6px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                                <input type="checkbox" className="custom-checkbox" checked={swiftToggles[item.key as keyof typeof swiftToggles]} onChange={() => handleToggleChange(item.key as keyof typeof swiftToggles)} />
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '15px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px' }}>상시 공격속도:</span>
                            <span style={{ fontWeight: 'bold', color: currentAtkSpd >= targetSpd ? '#4caf50' : '#f44336' }}>{currentAtkSpd.toFixed(2)}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '14px' }}>상시 이동속도:</span>
                            <span style={{ fontWeight: 'bold', color: currentMvSpd >= targetSpd ? '#4caf50' : '#f44336' }}>{currentMvSpd.toFixed(2)}%</span>
                        </div>
                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#4caf50' }}>음돌 ({targetSpd}%) 적정 최소 신속 스탯:</span>
                            <span style={{ fontSize: '20px', color: '#ffcc00', fontWeight: '900' }}>{minReqSwift}</span>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}