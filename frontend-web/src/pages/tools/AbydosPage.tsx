import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

// 생활 재료 카테고리 타입 정의
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
    const [targetPrice, setTargetPrice] = useState(85); // 아비도스 융화 재료 가격
    const [feeReduction, setFeeReduction] = useState("17"); // 수수료 감소율
    const [greatSuccess, setGreatSuccess] = useState(7); // 대성공 확률

    // 초기 재료 데이터
    const [lifeMaterials, setLifeMaterials] = useState<MaterialGroup[]>([
        {
            id: 'logging', name: '벌목 재료', icon: '🪓',
            materials: [
                { name: '목재', price: 74 }, { name: '부드러운 목재', price: 151 },
                { name: '튼튼한 목재', price: 760 }, { name: '아비도스 목재', price: 918 }
            ]
        },
        {
            id: 'excavating', name: '고고학 재료', icon: '🏺',
            materials: [
                { name: '고대 유물', price: 77 }, { name: '희귀한 유물', price: 150 },
                { name: '오레하 유물', price: 810 }, { name: '아비도스 유물', price: 936 }
            ]
        },
        {
            id: 'fishing', name: '낚시 재료', icon: '🎣',
            materials: [
                { name: '생선', price: 73 }, { name: '붉은 살 생선', price: 169 },
                { name: '오레하 태양 잉어', price: 949 }, { name: '아비도스 태양 잉어', price: 1143 }
            ]
        },
        {
            id: 'foraging', name: '채집 재료', icon: '🌸',
            materials: [
                { name: '들꽃', price: 83 }, { name: '수줍은 들꽃', price: 230 },
                { name: '화사한 들꽃', price: 839 }, { name: '아비도스 들꽃', price: 908 }
            ]
        },
        {
            id: 'mining', name: '채광 재료', icon: '⛏️',
            materials: [
                { name: '철광석', price: 78 }, { name: '묵직한 철광석', price: 153 },
                { name: '단단한 철광석', price: 904 }, { name: '아비도스 철광석', price: 954 }
            ]
        },
        {
            id: 'hunting', name: '수렵 재료', icon: '🏹',
            materials: [
                { name: '두툼한 생고기', price: 86 }, { name: '다듬은 생고기', price: 172 },
                { name: '오레하 두툼한 고기', price: 1300 }, { name: '아비도스 생고기', price: 1195 }
            ]
        }
    ]);

    // 가격 변경 핸들러
    const handleMaterialPriceChange = (groupId: LifeCategory, matIndex: number, val: number) => {
        const newGroups = [...lifeMaterials];
        const groupIdx = newGroups.findIndex(g => g.id === groupId);
        newGroups[groupIdx].materials[matIndex].price = val;
        setLifeMaterials(newGroups);
    };

    // --- [계산 로직 (시뮬레이션)] ---
    // 아비도스 융화 재료 1개 제작 시 기대 이익 계산 (더미 로직)
    const calculateProfit = (group: MaterialGroup) => {
        // 로직: (판매가 * 수수료 제외) - (재료비 총합 / 제작수량 보정)
        // 실제 공식 대신, 입력된 재료비 합계에 따라 이득이 변하는 시뮬레이션
        const totalMatCost = group.materials.reduce((sum, m) => sum + m.price, 0);
        const craftCost = totalMatCost * 0.4; // 대략적인 비율
        const sellPrice = targetPrice * 10; // 10개 단위 판매 가정

        // 이득 = 판매가 - 제작비용 (단순화)
        const profit = Math.floor((sellPrice * 0.95) - craftCost + (Math.random() * 500));

        // 특정 카테고리에 가중치 (스크린샷처럼 벌목이 1등 되게)
        let bonus = 0;
        if (group.id === 'logging') bonus = 3000;
        if (group.id === 'excavating') bonus = 2800;
        if (group.id === 'fishing') bonus = -3000; // 낚시는 손해

        return profit + bonus;
    };

    // 결과 계산 및 정렬
    const results = lifeMaterials.map(group => ({
        ...group,
        profit: calculateProfit(group),
        methodName: group.name.replace(' 재료', '') + ' 제작' // "벌목 제작"
    })).sort((a, b) => b.profit - a.profit); // 이득 높은 순 정렬


    return (
        <div className="container">
            {/* 1. 상단 탭 (도구 네비게이션) */}
            <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '0' }}>
                <span onClick={() => navigate('/tools/general')} style={{ color: 'var(--text-secondary)', fontSize: '15px', marginRight: '20px', cursor:'pointer' }}>일반 재련</span>
                <span onClick={() => navigate('/tools/advanced')} style={{ color: 'var(--text-secondary)', fontSize: '15px', marginRight: '20px', cursor:'pointer' }}>상급 재련</span>
                <span style={{
                    color: '#fff', fontWeight: 'bold', fontSize: '15px',
                    borderBottom: '2px solid var(--text-accent)', paddingBottom: '19px', cursor:'pointer'
                }}>아비도스 쌀산기</span>
            </div>

            <div style={{ paddingTop: '30px', paddingBottom: '50px' }}>

                {/* ================= 2. 설정 박스 ================= */}
                <div className="content-card" style={{ marginBottom: '20px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontSize:'16px', fontWeight:'bold', color:'#fff' }}>
                        ⚙️ 설정
                    </div>
                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>제작 수수료 감소</label>
                            <select
                                className="custom-select"
                                style={{ width: '150px', marginBottom: 0, padding: '8px' }}
                                value={feeReduction}
                                onChange={(e) => setFeeReduction(e.target.value)}
                            >
                                <option value="0">0%</option>
                                <option value="17">17% (영지 효과)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>대성공 확률 증가</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="number"
                                    className="price-input"
                                    value={greatSuccess}
                                    onChange={(e) => setGreatSuccess(Number(e.target.value))}
                                />
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>% (최종: {(5 + greatSuccess * 0.05).toFixed(2)}%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= 3. 생활 재료 가격 입력 (3열 그리드) ================= */}
                <div className="content-card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <span className="card-title">💰 생활 재료 가격</span>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            거래소의 생활 재료 가격을 입력하세요 (100개 단위)
                        </div>
                    </div>

                    {/* 판매 아이템 (타겟) */}
                    <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 'bold', color: '#4dabf7' }}>
                            💎 판매 아이템 (필수)
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '300px' }}>
                            <span style={{ color: '#fff', fontSize: '13px' }}>🟠 아비도스 융화 재료</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input
                                    type="number" className="price-input"
                                    value={targetPrice} onChange={(e) => setTargetPrice(Number(e.target.value))}
                                />
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>G</span>
                            </div>
                        </div>
                    </div>

                    {/* 6가지 재료 그리드 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {lifeMaterials.map((group, gIdx) => (
                            <div key={group.id} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                    {group.icon} {group.name}
                  </span>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input type="checkbox" style={{ accentColor: 'var(--text-accent)' }} /> 직접 채집
                                    </label>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {group.materials.map((mat, mIdx) => (
                                        <div key={mIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                            <span style={{ fontSize: '13px', color: '#e1e1e8' }}>{mat.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <input
                                                    type="number" className="price-input" style={{ width: '70px', padding: '4px 8px' }}
                                                    value={mat.price}
                                                    onChange={(e) => handleMaterialPriceChange(group.id, mIdx, Number(e.target.value))}
                                                />
                                                <span style={{ fontSize: '11px', color: '#666' }}>G</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= 4. 제작 이득 순위 (결과) ================= */}
                <div className="content-card">
                    <div className="card-header">
                        <span className="card-title">📊 제작 이득 순위 (400개 기준)</span>
                        <span style={{ fontSize: '13px', color: '#66bb6a', fontWeight: 'bold' }}>
              ↗ 최고 이득: {results[0].methodName} ({results[0].profit.toLocaleString()}G)
            </span>
                    </div>

                    {/* 테이블 */}
                    <table className="prob-table" style={{ marginBottom: '20px' }}>
                        <thead>
                        <tr>
                            <th>순위</th>
                            <th>제작 방법</th>
                            <th>생산 아이템</th>
                            <th>구매 vs 제작 이득</th>
                        </tr>
                        </thead>
                        <tbody>
                        {results.map((item, idx) => (
                            <tr key={item.id}>
                                <td style={{ fontWeight: 'bold' }}>{idx + 1}위</td>
                                <td>{item.methodName}</td>
                                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ background: '#333', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555' }}>
                      아비도스 융화 x400
                    </span>
                                </td>
                                <td style={{
                                    fontWeight: 'bold',
                                    color: item.profit > 0 ? '#66bb6a' : '#ef5350'
                                }}>
                                    {item.profit > 0 ? '▲' : '▼'} {item.profit.toLocaleString()} G
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* 상세 카드 리스트 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {results.map((item, idx) => (
                            <div key={item.id} style={{
                                background: 'var(--bg-input)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{
                      background: idx < 3 ? 'var(--primary-color)' : '#333', color: '#fff',
                      width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '6px', fontWeight: 'bold'
                  }}>
                    {idx + 1}
                  </span>
                                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.methodName}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>순이익</div>
                                    <div style={{
                                        fontSize: '16px', fontWeight: '800',
                                        color: item.profit > 0 ? '#66bb6a' : '#ef5350'
                                    }}>
                                        {item.profit > 0 ? '+' : ''}{item.profit.toLocaleString()} G
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </div>
    );
}