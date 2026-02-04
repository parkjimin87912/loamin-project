import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MarketCategoryHeader from '../../components/MarketCategoryHeader';
import '../../App.css';

interface MarketItem {
    id: string;
    name: string;
    grade: string;
    bundle: number;
    minPrice: number;
    recentPrice: number;
    avgPrice: number;
    changeRate: number;
    icon: string;
}

export default function MarketPage() {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    // --- [상태 관리] ---
    const [items, setItems] = useState<MarketItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // 티어 상태 (기본값 4)
    const [tier, setTier] = useState<number>(4);

    // 서브 탭 정의
    const subTabsMap: { [key: string]: string[] } = {
        reforge: ["재련 재료", "재련 보조 재료"],
        life: ["전체", "고고학", "낚시", "채광", "벌목", "채집", "수렵", "기타"],
        engraving: [], // 각인서는 서브 탭 없음
        gem: ["전체", "7레벨", "8레벨", "9레벨", "10레벨"], // [수정] 보석 탭 구성 변경
        battle: ["회복형", "공격형", "기능성", "버프형"],
    };

    const currentTabs = subTabsMap[categoryId || "reforge"] || [];
    const [activeSubTab, setActiveSubTab] = useState(currentTabs.length > 0 ? currentTabs[0] : "");

    // 카테고리 변경 시 첫 번째 탭으로 초기화
    useEffect(() => {
        if (categoryId && subTabsMap[categoryId]) {
            const tabs = subTabsMap[categoryId];
            setActiveSubTab(tabs.length > 0 ? tabs[0] : "");
        }
    }, [categoryId]);

    const titles: { [key: string]: string } = {
        reforge: "🔥 재련 재료 시세",
        life: "🌿 생활 재료 시세",
        engraving: "📖 유물 각인서 시세",
        gem: "💎 보석 시세",
        battle: "💣 배틀 아이템 시세",
    };
    const title = titles[categoryId || ""] || "시세 정보";

    // --- [API 호출] ---
    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            setError(false);
            setItems([]);

            try {
                const params: any = {
                    category: categoryId,
                    tier: tier
                };

                if (categoryId === 'life' && activeSubTab === '전체') {
                    // 생활 재료의 '전체' 탭인 경우 subCategory 파라미터 제외
                } else if (categoryId === 'gem' && activeSubTab === '전체') {
                    // [추가] 보석의 '전체' 탭인 경우 subCategory 파라미터 제외
                } else if (categoryId === 'engraving') {
                    // 각인서는 서브 카테고리 없음
                } else {
                    params.subCategory = activeSubTab;
                }

                const response = await axios.get(`http://localhost:8080/api/v1/market/items`, { params });

                if (Array.isArray(response.data)) {
                    setItems(response.data);
                } else {
                    setItems([]);
                }
            } catch (err) {
                console.error("시세 불러오기 실패:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchItems();
        }
    }, [categoryId, activeSubTab, tier]);

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case '고급': return '#81c784';
            case '희귀': return '#4fc3f7';
            case '영웅': return '#ba68c8';
            case '전설': return '#ffb74d';
            case '유물': return '#ff8a65';
            case '고대': return '#e7b9ff';
            default: return '#e0e0e0';
        }
    };

    const getGradeBackgroundColor = (grade: string) => {
        switch (grade) {
            case '고대': return 'rgba(231, 185, 255, 0.15)';
            case '유물': return 'rgba(255, 138, 101, 0.15)';
            case '전설': return 'rgba(255, 183, 77, 0.15)';
            case '영웅': return 'rgba(186, 104, 200, 0.15)';
            case '희귀': return 'rgba(79, 195, 247, 0.15)';
            case '고급': return 'rgba(129, 199, 132, 0.15)';
            default: return 'transparent';
        }
    };

    return (
        <div className="container">
            <MarketCategoryHeader />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {currentTabs.length > 0 && currentTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveSubTab(tab)}
                            style={{
                                padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                                background: activeSubTab === tab ? 'var(--primary-color)' : 'var(--bg-input)',
                                color: activeSubTab === tab ? '#fff' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* [수정] 생활 재료, 각인서 탭일 때는 티어 선택 박스 숨김 */}
                {categoryId !== 'life' && categoryId !== 'engraving' && (
                    <select
                        className="custom-select"
                        style={{ width: '100px', marginBottom: 0, padding:'8px' }}
                        value={tier}
                        onChange={(e) => setTier(Number(e.target.value))}
                    >
                        <option value={4}>티어 4</option>
                        <option value={3}>티어 3</option>
                    </select>
                )}
            </div>

            <section className="content-card" style={{ padding: '0', overflow: 'hidden', minHeight: '400px' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span className="card-title">{title}</span>
                    {loading && <span style={{ fontSize:'13px', color:'var(--text-accent)' }}>🔄 데이터 불러오는 중...</span>}
                </div>

                <table className="prob-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ background: 'var(--bg-header)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <th style={{ textAlign: 'left', paddingLeft: '30px' }}>아이템</th>
                        <th>등급</th>
                        <th>묶음</th>
                        <th>최저가</th>
                        <th>최근 거래가</th>
                        <th>전일 평균가</th>
                        <th>등락률</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#aaa' }}><div className="loading-spinner" style={{ margin: '0 auto 15px' }}></div>로스트아크 거래소 시세를 가져오고 있습니다...</td></tr>
                    ) : error ? (
                        <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#ef5350' }}>데이터를 불러오지 못했습니다.</td></tr>
                    ) : items.length === 0 ? (
                        <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#666' }}>표시할 아이템이 없습니다.</td></tr>
                    ) : (
                        items.map((item) => {
                            const bgColor = getGradeBackgroundColor(item.grade);
                            return (
                                <tr
                                    key={item.id}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        background: bgColor,
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                    className="market-row"
                                    onClick={() => navigate(`/market/detail/${item.name}`)}
                                >
                                    <td style={{ textAlign: 'left', padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width:'40px', height:'40px', borderRadius:'8px', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                                            {item.icon && item.icon.startsWith('http') ? <img src={item.icon} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:'20px' }}>{item.icon}</span>}
                                        </div>
                                        <span style={{ fontWeight: 'bold', color: getGradeColor(item.grade) }}>{item.name}</span>
                                    </td>
                                    <td style={{ color: getGradeColor(item.grade), fontSize:'13px' }}>{item.grade}</td>
                                    <td style={{ color: '#aaa', fontSize:'13px' }}>{item.bundle}개</td>
                                    <td style={{ fontWeight: 'bold', color: '#fff' }}>{item.minPrice.toLocaleString()} <span style={{fontSize:'11px', color:'#aaa'}}>G</span></td>
                                    <td style={{ fontWeight: 'bold', color: '#e0e0e0' }}>{item.recentPrice.toLocaleString()} <span style={{fontSize:'11px', color:'#aaa'}}>G</span></td>
                                    <td style={{ color: '#aaa' }}>{item.avgPrice.toLocaleString()} <span style={{fontSize:'11px'}}>G</span></td>
                                    <td style={{ fontWeight: 'bold', color: item.changeRate > 0 ? '#ef5350' : item.changeRate < 0 ? '#42a5f5' : '#aaa' }}>{item.changeRate > 0 ? '+' : ''}{item.changeRate}%</td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </section>
        </div>
    );
}