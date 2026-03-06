import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ToolsHeader from '../../components/ToolsHeader';
import '../../App.css';

type LifeCategory = 'logging' | 'excavating' | 'fishing' | 'foraging' | 'mining' | 'hunting';

interface MaterialGroup {
    id: LifeCategory;
    name: string;
    icon: string;
    materials: { name: string; price: number }[];
}

export default function AbydosPage() {
    // const navigate = useNavigate();

    // --- [상태 관리] ---
    const [targetPriceNormal, setTargetPriceNormal] = useState(0); // 일반 아비도스 가격
    const [targetPriceAdvanced, setTargetPriceAdvanced] = useState(0); // 상급 아비도스 가격
    const [feeReduction, setFeeReduction] = useState("0"); // 수수료 감소율 (기본 0%)
    const [greatSuccess, setGreatSuccess] = useState(0); // 대성공 확률 증가량 (기본 0)
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null); // 선택된 제작 방법

    // 초기 재료 데이터
    const [lifeMaterials, setLifeMaterials] = useState<MaterialGroup[]>([
        { id: 'logging', name: '벌목 재료', icon: '🪓', materials: [{ name: '목재', price: 74 }, { name: '부드러운 목재', price: 151 }, { name: '튼튼한 목재', price: 760 }, { name: '아비도스 목재', price: 918 }] },
        { id: 'excavating', name: '고고학 재료', icon: '🏺', materials: [{ name: '고대 유물', price: 77 }, { name: '희귀한 유물', price: 150 }, { name: '오레하 유물', price: 810 }, { name: '아비도스 유물', price: 936 }] },
        { id: 'fishing', name: '낚시 재료', icon: '🎣', materials: [{ name: '생선', price: 73 }, { name: '붉은 살 생선', price: 169 }, { name: '오레하 태양 잉어', price: 949 }, { name: '아비도스 태양 잉어', price: 1143 }] },
        { id: 'foraging', name: '채집 재료', icon: '🌸', materials: [{ name: '들꽃', price: 83 }, { name: '수줍은 들꽃', price: 230 }, { name: '화사한 들꽃', price: 839 }, { name: '아비도스 들꽃', price: 908 }] },
        { id: 'mining', name: '채광 재료', icon: '⛏️', materials: [{ name: '철광석', price: 78 }, { name: '묵직한 철광석', price: 153 }, { name: '단단한 철광석', price: 904 }, { name: '아비도스 철광석', price: 954 }] },
        { id: 'hunting', name: '수렵 재료', icon: '🏹', materials: [{ name: '두툼한 생고기', price: 86 }, { name: '다듬은 생고기', price: 172 }, { name: '오레하 두툼한 고기', price: 1300 }, { name: '아비도스 생고기', price: 1195 }] }
    ]);

    // 🌟 API로 시세 불러오기
    useEffect(() => {
        const fetchMarketPrices = async () => {
            try {
                // 1. 융화 재료 가격 (일반/상급 모두 조회)
                const [matResponse, subMatResponse] = await Promise.all([
                    axios.get('/api/v1/market/items', {
                        params: { category: 'reforge', subCategory: '재련 재료', tier: 4 }
                    }),
                    axios.get('/api/v1/market/items', {
                        params: { category: 'reforge', subCategory: '재련 보조 재료', tier: 4 }
                    })
                ]);

                const allReforgeItems = [
                    ...(Array.isArray(matResponse.data) ? matResponse.data : []),
                    ...(Array.isArray(subMatResponse.data) ? subMatResponse.data : [])
                ];

                const normalItem = allReforgeItems.find((item: any) => item.name === '아비도스 융화 재료');
                const advancedItem = allReforgeItems.find((item: any) => item.name === '상급 아비도스 융화 재료');

                if (normalItem) setTargetPriceNormal(normalItem.recentPrice > 0 ? normalItem.recentPrice : normalItem.minPrice);
                if (advancedItem) setTargetPriceAdvanced(advancedItem.recentPrice > 0 ? advancedItem.recentPrice : advancedItem.minPrice);

                // 2. 생활 재료 가격 (전체 조회 후 필터링)
                const categories: { id: LifeCategory, sub: string }[] = [
                    { id: 'logging', sub: '벌목' },
                    { id: 'excavating', sub: '고고학' },
                    { id: 'fishing', sub: '낚시' },
                    { id: 'foraging', sub: '채집' },
                    { id: 'mining', sub: '채광' },
                    { id: 'hunting', sub: '수렵' }
                ];

                const newPricesMap: Record<string, number> = {};

                await Promise.all(categories.map(async (cat) => {
                    try {
                        const response = await axios.get('/api/v1/market/items', {
                            params: { category: 'life', subCategory: cat.sub }
                        });
                        if (Array.isArray(response.data)) {
                            response.data.forEach((item: any) => {
                                const price = item.recentPrice > 0 ? item.recentPrice : item.minPrice;
                                const bundle = item.bundle > 0 ? item.bundle : 1;
                                newPricesMap[item.name] = Math.round((price / bundle) * 100);
                            });
                        }
                    } catch (e) {
                        console.error(`Failed to fetch ${cat.sub}`, e);
                    }
                }));

                setLifeMaterials(prev => prev.map(group => ({
                    ...group,
                    materials: group.materials.map(mat => ({
                        ...mat,
                        price: newPricesMap[mat.name] !== undefined ? newPricesMap[mat.name] : mat.price
                    }))
                })));

            } catch (error) {
                console.error("시세 API 오류", error);
            }
        };
        fetchMarketPrices();
    }, []);

    const handleMaterialPriceChange = (groupId: LifeCategory, matIndex: number, val: number) => {
        setLifeMaterials(prev => {
            const newGroups = prev.map(g => ({
                ...g,
                materials: g.materials.map(m => ({ ...m }))
            }));
            const groupIdx = newGroups.findIndex(g => g.id === groupId);
            if (groupIdx !== -1) {
                newGroups[groupIdx].materials[matIndex].price = val;
            }
            return newGroups;
        });
    };

    // --- [이득 계산 로직] ---
    const calculateProfit = (group: MaterialGroup, type: 'normal' | 'advanced') => {
        const mat0 = group.materials[0]; // 일반
        const mat1 = group.materials[1]; // 고급 (2티어)
        const mat3 = group.materials[3]; // 4티어 (아비도스)

        // 🌟 400개 제작 기준 재료 소모량 (40회 제작)
        let count0, count1, count3;

        if (type === 'advanced') {
            // 상급 아비도스 (1회: 일반 112, 고급 59, 아비도스 43)
            // 40회: 일반 4480, 고급 2360, 아비도스 1720
            count0 = 4480;
            count1 = 2360;
            count3 = 1720;
        } else {
            // 일반 아비도스 (1회: 일반 86, 고급 45, 아비도스 33)
            // 40회: 일반 3440, 고급 1800, 아비도스 1320
            count0 = 3440;
            count1 = 1800;
            count3 = 1320;
        }

        // 가격은 100개 단위이므로 /100 처리
        const cost0 = (count0 / 100) * mat0.price;
        const cost1 = (count1 / 100) * mat1.price;
        const cost3 = (count3 / 100) * mat3.price;

        const totalMatCost = cost0 + cost1 + cost3;

        // 🌟 1. 재료 그대로 판매 시 수익 (A)
        const sellMaterialProfit = Math.floor(totalMatCost * 0.95);

        // 🌟 제작 비용 (16000골드) + 수수료 감소 적용
        const baseGoldCost = 16000;
        const reductionRate = Number(feeReduction) / 100;
        const finalGoldCost = baseGoldCost * (1 - reductionRate);

        const totalCost = totalMatCost + finalGoldCost;

        // 🌟 기대 매출 (대성공 확률 적용)
        const craftCount = 40;
        const baseOutputPerCraft = 10;
        const realGreatSuccessChancePercent = 5 * (1 + greatSuccess / 100);
        const p = realGreatSuccessChancePercent / 100;
        const expectedOutputPerCraft = baseOutputPerCraft * (1 + p);
        const totalExpectedOutput = expectedOutputPerCraft * craftCount;

        const targetPrice = type === 'advanced' ? targetPriceAdvanced : targetPriceNormal;
        const grossIncome = targetPrice * totalExpectedOutput;
        const netIncome = grossIncome * 0.95; // 거래소 수수료 5%

        // 최종 이익 (제작 판매 순이익)
        const profit = Math.floor(netIncome - totalCost);
        
        // 🌟 2. 제작 후 판매 시 수익 (B) - 재료 보유 가정
        const craftSellProfit = Math.floor(netIncome - finalGoldCost);

        // 🌟 3. 제작 vs 판매 차액 (B - A)
        const diff = craftSellProfit - sellMaterialProfit;

        // 4. (참고용) 재료를 사서 제작했을 때의 순수익 (기존 profit)
        const buyAndCraftProfit = Math.floor(netIncome - totalCost);

        return { 
            profit: buyAndCraftProfit, 
            totalExpectedOutput, 
            totalCost, 
            netIncome,
            sellMaterialProfit, 
            craftSellProfit,    
            diff,               
            details: {
                mat0: { name: mat0.name, count: count0, cost: cost0 },
                mat1: { name: mat1.name, count: count1, cost: cost1 },
                mat3: { name: mat3.name, count: count3, cost: cost3 },
                goldCost: finalGoldCost,
                baseGoldCost
            },
            type // 제작 타입 정보 추가
        };
    };

    // 🌟 모든 경우의 수 계산 (6개 생활 * 2가지 제작법 = 12개)
    const results = lifeMaterials.flatMap(group => {
        const normalCalc = calculateProfit(group, 'normal');
        const advancedCalc = calculateProfit(group, 'advanced');

        return [
            {
                ...group,
                ...normalCalc,
                methodName: `[일반] ${group.name.replace(' 재료', '')} 제작`,
                id: `${group.id}_normal`
            },
            {
                ...group,
                ...advancedCalc,
                methodName: `[상급] ${group.name.replace(' 재료', '')} 제작`,
                id: `${group.id}_advanced`
            }
        ];
    }).sort((a, b) => b.profit - a.profit);

    // 실제 대성공 확률 계산 (표시용)
    const displayRealChance = (5 * (1 + greatSuccess / 100)).toFixed(2);

    // 선택된 상세 내역 데이터
    const detailData = selectedMethod ? results.find(r => r.methodName === selectedMethod) : results[0];

    return (
        <div className="container">
            {/* 상단 탭 */}
            <ToolsHeader />

            <div style={{ paddingBottom: '50px', minWidth: 0 }}>
                {/* 설정 박스 */}
                <div className="content-card" style={{ marginBottom: '20px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontSize:'16px', fontWeight:'bold', color:'#fff' }}>⚙️ 설정</div>
                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

                        {/* 수수료 감소 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>제작 수수료 감소</label>
                            <select className="custom-select" style={{ width: '150px', marginBottom: 0, padding: '8px' }} value={feeReduction} onChange={(e) => setFeeReduction(e.target.value)}>
                                <option value="0">0%</option>
                                <option value="1">1%</option>
                                <option value="2">2%</option>
                                <option value="3">3%</option>
                                <option value="4">4%</option>
                                <option value="5">5%</option>
                                <option value="6">6%</option>
                                <option value="7">7%</option>
                                <option value="8">8%</option>
                                <option value="9">9%</option>
                                <option value="10">10%</option>
                                <option value="11">11%</option>
                                <option value="12">12%</option>
                                <option value="13">13%</option>
                                <option value="14">14%</option>
                                <option value="15">15%</option>
                                <option value="16">16%</option>
                                <option value="17">17%</option>
                            </select>
                        </div>

                        {/* 대성공 확률 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>대성공 확률 증가량</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="number"
                                    className="price-input"
                                    style={{ width:'80px' }}
                                    value={greatSuccess}
                                    onChange={(e) => setGreatSuccess(Number(e.target.value))}
                                    placeholder="0"
                                />
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>%</span>
                                <span style={{ fontSize: '13px', color: '#4dabf7', fontWeight: 'bold', marginLeft: '5px' }}>
                                    (실제 확률: {Number(displayRealChance) === 5 ? '5' : displayRealChance}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 재료 가격 입력 */}
                <div className="content-card" style={{ marginBottom: '20px' }}>
                    <div className="card-header"><span className="card-title">💰 생활 재료 가격 (100개 단위)</span></div>

                    {/* 🌟 판매 아이템 (일반/상급 동시 표시) - 반응형 클래스 적용 */}
                    <div className="sell-items-wrapper">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4dabf7' }}>💎 판매 아이템 (필수)</div>
                        </div>
                        <div className="sell-items-group">
                            <div className="sell-item-row">
                                <span style={{ color: '#fff', fontSize: '13px' }}>🟠 아비도스 융화 재료</span>
                                <input type="number" className="price-input" style={{ width: '70px', textAlign: 'right' }} value={targetPriceNormal} onChange={(e) => setTargetPriceNormal(Number(e.target.value))} />
                            </div>
                            <div className="sell-item-row">
                                <span style={{ color: '#a970ff', fontSize: '13px' }}>🟣 상급 아비도스 융화 재료</span>
                                <input type="number" className="price-input" style={{ width: '70px', textAlign: 'right' }} value={targetPriceAdvanced} onChange={(e) => setTargetPriceAdvanced(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    {/* 재료 그리드 */}
                    <div className="abydos-grid">
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
                {/* 결과 테이블 */}
                <div className="content-card" style={{ marginBottom: '20px' }}>
                    <div className="card-header">
                        <span className="card-title">📊 제작 이득 순위 (400개 제작 기준)</span>
                    </div>
                    <div className="table-container">
                        <table className="prob-table">
                            <thead>
                            <tr>
                                <th>순위</th>
                                <th>제작 방법</th>
                                <th>상세 내역</th>
                                <th>순이익</th>
                            </tr>
                            </thead>
                            <tbody>
                            {results.map((item, idx) => (
                                <tr
                                    key={item.id}
                                    onClick={() => setSelectedMethod(item.methodName)}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: selectedMethod === item.methodName || (!selectedMethod && idx === 0) ? 'rgba(77, 171, 247, 0.1)' : 'transparent'
                                    }}
                                >
                                    <td data-label="순위" style={{ fontWeight: 'bold' }}>{idx + 1}위</td>
                                    <td data-label="제작 방법">
                                        <div style={{fontWeight:'bold', color: item.type === 'advanced' ? '#a970ff' : '#fff'}}>{item.methodName}</div>
                                        <div style={{fontSize:'11px', color:'#aaa', marginTop:'4px'}}>예상 생산량: {item.totalExpectedOutput.toFixed(1)}개</div>
                                    </td>
                                    <td data-label="상세 내역" style={{ fontSize: '12px', color: '#ccc' }}>
                                        <div>총 매출: {Math.round(item.netIncome).toLocaleString()} G</div>
                                        <div style={{color:'#ef5350'}}>총 비용: -{Math.round(item.totalCost).toLocaleString()} G</div>
                                    </td>
                                    <td data-label="순이익" style={{ fontWeight: 'bold', color: item.profit > 0 ? '#66bb6a' : '#ef5350', fontSize:'15px' }}>
                                        {item.profit > 0 ? '▲' : '▼'} {item.profit.toLocaleString()} G
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 🌟 상세 내역 섹션 */}
                {detailData && (
                    <div className="content-card" style={{ border: '1px solid var(--text-accent)' }}>
                        <div className="card-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span className="card-title">📝 상세 내역 ({detailData.methodName})</span>
                            <span style={{ fontSize:'13px', color:'var(--text-secondary)' }}>400개 제작 기준</span>
                        </div>
                        
                        {/* 🌟 제작 vs 판매 비교 섹션 */}
                        <div style={{ margin: '20px', padding: '20px', background: 'rgba(30, 30, 30, 0.5)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>⚖️ 판매 전략 비교 (재료 보유 시)</div>
                            
                            <div className="abydos-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                                {/* Case 1: 재료 판매 */}
                                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '8px', border: detailData.diff < 0 ? '1px solid #66bb6a' : '1px solid transparent' }}>
                                    <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>📦 재료 그대로 판매</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{detailData.sellMaterialProfit.toLocaleString()} G</div>
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>수수료 5% 제외 후</div>
                                </div>

                                {/* Case 2: 제작 판매 */}
                                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '8px', border: detailData.diff > 0 ? '1px solid #66bb6a' : '1px solid transparent' }}>
                                    <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>🔨 제작 후 판매</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{detailData.craftSellProfit.toLocaleString()} G</div>
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>매출 - 제작비용</div>
                                </div>
                            </div>

                            {/* 결론 */}
                            <div style={{ marginTop: '15px', padding: '15px', background: detailData.diff > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                                <span style={{ fontSize: '15px', fontWeight: 'bold', color: detailData.diff > 0 ? '#66bb6a' : '#ef5350' }}>
                                    👉 {detailData.diff > 0 ? '제작해서 파는 것' : '재료를 그냥 파는 것'}이 {Math.abs(detailData.diff).toLocaleString()} G 더 이득입니다!
                                </span>
                            </div>
                        </div>

                        <div className="abydos-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', margin: '20px' }}>
                            {/* 비용 상세 */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef5350', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                                    💸 총 비용: {Math.round(detailData.totalCost).toLocaleString()} G
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{detailData.details.mat0.name} ({detailData.details.mat0.count}개)</span>
                                        <span>{Math.round(detailData.details.mat0.cost).toLocaleString()} G</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{detailData.details.mat1.name} ({detailData.details.mat1.count}개)</span>
                                        <span>{Math.round(detailData.details.mat1.cost).toLocaleString()} G</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{detailData.details.mat3.name} ({detailData.details.mat3.count}개)</span>
                                        <span>{Math.round(detailData.details.mat3.cost).toLocaleString()} G</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                                        <span>제작 비용 (수수료 {feeReduction}% 감소)</span>
                                        <span>{Math.round(detailData.details.goldCost).toLocaleString()} G</span>
                                    </div>
                                </div>
                            </div>

                            {/* 수익 상세 */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#66bb6a', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                                    💰 총 수익: {Math.round(detailData.netIncome).toLocaleString()} G
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>판매 단가</span>
                                        <span>{detailData.type === 'advanced' ? targetPriceAdvanced : targetPriceNormal} G</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>예상 생산량 (대성공 포함)</span>
                                        <span>{detailData.totalExpectedOutput.toFixed(1)} 개</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>총 매출액</span>
                                        <span>{Math.round((detailData.type === 'advanced' ? targetPriceAdvanced : targetPriceNormal) * detailData.totalExpectedOutput).toLocaleString()} G</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef5350' }}>
                                        <span>거래소 수수료 (5%)</span>
                                        <span>-{Math.round((detailData.type === 'advanced' ? targetPriceAdvanced : targetPriceNormal) * detailData.totalExpectedOutput * 0.05).toLocaleString()} G</span>
                                    </div>
                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', color: detailData.profit > 0 ? '#66bb6a' : '#ef5350' }}>
                                        <span>최종 순이익 (재료 구매 시)</span>
                                        <span>{detailData.profit > 0 ? '+' : ''}{detailData.profit.toLocaleString()} G</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}