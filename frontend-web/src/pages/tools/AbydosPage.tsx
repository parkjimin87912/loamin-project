import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

type LifeCategory = 'logging' | 'excavating' | 'fishing' | 'foraging' | 'mining' | 'hunting';

interface MaterialGroup {
    id: LifeCategory;
    name: string;
    icon: string;
    materials: { name: string; price: number }[];
}

export default function AbydosPage() {
    const navigate = useNavigate();

    // --- [상태 관리] ---
    const [targetPrice, setTargetPrice] = useState(85);
    const [feeReduction, setFeeReduction] = useState("0"); // 수수료 감소율 (기본 0%)
    const [greatSuccess, setGreatSuccess] = useState(5); // 대성공 확률 (기본 5%)

    // 초기 재료 데이터
    const [lifeMaterials, setLifeMaterials] = useState<MaterialGroup[]>([
        { id: 'logging', name: '벌목 재료', icon: '🪓', materials: [{ name: '목재', price: 74 }, { name: '부드러운 목재', price: 151 }, { name: '튼튼한 목재', price: 760 }, { name: '아비도스 목재', price: 918 }] },
        { id: 'excavating', name: '고고학 재료', icon: '🏺', materials: [{ name: '고대 유물', price: 77 }, { name: '희귀한 유물', price: 150 }, { name: '오레하 유물', price: 810 }, { name: '아비도스 유물', price: 936 }] },
        { id: 'fishing', name: '낚시 재료', icon: '🎣', materials: [{ name: '생선', price: 73 }, { name: '붉은 살 생선', price: 169 }, { name: '오레하 태양 잉어', price: 949 }, { name: '아비도스 태양 잉어', price: 1143 }] },
        { id: 'foraging', name: '채집 재료', icon: '🌸', materials: [{ name: '들꽃', price: 83 }, { name: '수줍은 들꽃', price: 230 }, { name: '화사한 들꽃', price: 839 }, { name: '아비도스 들꽃', price: 908 }] },
        { id: 'mining', name: '채광 재료', icon: '⛏️', materials: [{ name: '철광석', price: 78 }, { name: '묵직한 철광석', price: 153 }, { name: '단단한 철광석', price: 904 }, { name: '아비도스 철광석', price: 954 }] },
        { id: 'hunting', name: '수렵 재료', icon: '🏹', materials: [{ name: '두툼한 생고기', price: 86 }, { name: '다듬은 생고기', price: 172 }, { name: '오레하 두툼한 고기', price: 1300 }, { name: '아비도스 생고기', price: 1195 }] }
    ]);

    const handleMaterialPriceChange = (groupId: LifeCategory, matIndex: number, val: number) => {
        const newGroups = [...lifeMaterials];
        const groupIdx = newGroups.findIndex(g => g.id === groupId);
        newGroups[groupIdx].materials[matIndex].price = val;
        setLifeMaterials(newGroups);
    };

    // --- [이득 계산 로직] ---
    const calculateProfit = (group: MaterialGroup) => {
        // 1. 재료비 총합
        const totalMatCost = group.materials.reduce((sum, m) => sum + m.price, 0);

        // 2. 제작 비용 (수수료 감소 적용)
        // 가정: 기본 제작비가 재료비의 약 5%라고 가정 시뮬레이션
        const baseCraftFee = totalMatCost * 0.05;
        const reductionRate = Number(feeReduction) / 100;
        const finalCraftFee = baseCraftFee * (1 - reductionRate);

        const totalCost = totalMatCost + finalCraftFee;

        // 3. 기대 매출 (대성공 확률 적용)
        // 기본 10개 생산 + 대성공 시 추가 생산(확률적 기대값)
        const baseOutput = 10;
        const greatSuccessChance = greatSuccess / 100;
        // 대성공 시 2배(20개) 획득이라고 가정하면, 기대값은 10 * (1 + 확률)
        const expectedOutput = baseOutput * (1 + greatSuccessChance);

        const grossIncome = targetPrice * expectedOutput;
        const netIncome = grossIncome * 0.95; // 거래소 수수료 5%

        // 4. 최종 이익
        const profit = Math.floor(netIncome - totalCost);
        return profit;
    };

    const results = lifeMaterials.map(group => ({
        ...group,
        profit: calculateProfit(group),
        methodName: group.name.replace(' 재료', '') + ' 제작'
    })).sort((a, b) => b.profit - a.profit);

    return (
        <div className="container">
            {/* 상단 탭 */}
            <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', display: 'flex', gap: '20px', overflowX: 'auto' }}>
                <span onClick={() => navigate('/tools/general')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>일반 재련</span>
                <span onClick={() => navigate('/tools/advanced')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>상급 재련</span>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', borderBottom: '2px solid var(--text-accent)', paddingBottom: '19px', cursor: 'pointer' }}>아비도스 쌀산기</span>
                <span onClick={() => navigate('/tools/craft')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>아비도스 제작</span>
                <span onClick={() => navigate('/tools/auction')} style={{ color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer' }}>경매 계산기</span>
            </div>

            <div style={{ paddingBottom: '50px' }}>
                {/* 설정 박스 */}
                <div className="content-card" style={{ marginBottom: '20px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontSize:'16px', fontWeight:'bold', color:'#fff' }}>⚙️ 설정</div>
                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

                        {/* 수수료 감소 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>제작 수수료 감소</label>
                            <select className="custom-select" style={{ width: '150px', marginBottom: 0, padding: '8px' }} value={feeReduction} onChange={(e) => setFeeReduction(e.target.value)}>
                                <option value="0">0%</option>
                                <option value="4">4% (설치물)</option>
                                <option value="17">17% (영지 효과)</option>
                            </select>
                        </div>

                        {/* 대성공 확률 (UI 복구됨) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>대성공 확률</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="number"
                                    className="price-input"
                                    style={{ width:'80px' }}
                                    value={greatSuccess}
                                    onChange={(e) => setGreatSuccess(Number(e.target.value))}
                                />
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 재료 가격 입력 */}
                <div className="content-card" style={{ marginBottom: '20px' }}>
                    <div className="card-header"><span className="card-title">💰 생활 재료 가격</span></div>
                    {/* 판매 아이템 */}
                    <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 'bold', color: '#4dabf7' }}>💎 판매 아이템 (필수)</div>
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: '#fff', fontSize: '13px' }}>🟠 아비도스 융화 재료</span>
                            <input type="number" className="price-input" value={targetPrice} onChange={(e) => setTargetPrice(Number(e.target.value))} />
                        </div>
                    </div>
                    {/* 재료 그리드 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {lifeMaterials.map((group) => (
                            <div key={group.id} style={{ marginBottom: '10px' }}>
                                <div style={{ marginBottom: '10px' }}><span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{group.icon} {group.name}</span></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {group.materials.map((mat, mIdx) => (
                                        <div key={mIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                            <span style={{ fontSize: '13px', color: '#e1e1e8' }}>{mat.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <input type="number" className="price-input" style={{ width: '70px', padding: '4px 8px' }} value={mat.price} onChange={(e) => handleMaterialPriceChange(group.id, mIdx, Number(e.target.value))} />
                                                <span style={{ fontSize: '11px', color: '#666' }}>G</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 결과 테이블 */}
                <div className="content-card">
                    <div className="card-header"><span className="card-title">📊 제작 이득 순위</span></div>
                    <table className="prob-table">
                        <thead><tr><th>순위</th><th>제작 방법</th><th>1회 기대 이익</th></tr></thead>
                        <tbody>
                        {results.map((item, idx) => (
                            <tr key={item.id}>
                                <td style={{ fontWeight: 'bold' }}>{idx + 1}위</td>
                                <td>{item.methodName}</td>
                                <td style={{ fontWeight: 'bold', color: item.profit > 0 ? '#66bb6a' : '#ef5350' }}>{item.profit > 0 ? '▲' : '▼'} {item.profit.toLocaleString()} G</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}