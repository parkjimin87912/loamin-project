import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../App.css';

// 아이템 데이터 타입
interface MarketItem {
    id: string;
    name: string;
    grade: '일반' | '고급' | '희귀' | '영웅' | '전설' | '유물' | '고대';
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

    // 카테고리별 서브 탭 정의
    const subTabsMap: { [key: string]: string[] } = {
        reforge: ["재련 재료", "재련 보조 재료", "기타 재료"],
        life: ["고고학", "낚시", "채광", "벌목", "채집", "수렵"],
        engraving: ["전설 각인서", "유물 각인서"],
        gem: ["3티어 보석", "4티어 보석"],
        battle: ["회복형", "공격형", "기능성", "버프형"],
    };

    // 현재 선택된 카테고리의 탭 목록 (기본값: 재련)
    const currentTabs = subTabsMap[categoryId || "reforge"] || ["전체"];
    const [activeSubTab, setActiveSubTab] = useState(currentTabs[0]);

    // 카테고리 변경 시 탭 초기화
    useEffect(() => {
        if (categoryId && subTabsMap[categoryId]) {
            setActiveSubTab(subTabsMap[categoryId][0]);
        }
    }, [categoryId]);

    // 페이지 타이틀 매핑
    const titles: { [key: string]: string } = {
        reforge: "🔥 재련 재료 시세",
        life: "🌿 생활 재료 시세",
        engraving: "📖 유물 각인서 시세",
        gem: "💎 보석 시세",
        battle: "💣 배틀 아이템 시세",
    };
    const title = titles[categoryId || ""] || "시세 정보";

    // --- [API 호출] 실시간 데이터 가져오기 ---
    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            setError(false);
            setItems([]); // 로딩 중 초기화

            try {
                // 백엔드 API 호출
                // GET http://localhost:8080/api/v1/market/items?category={id}&subCategory={tab}
                const response = await axios.get(`http://localhost:8080/api/v1/market/items`, {
                    params: {
                        category: categoryId,
                        subCategory: activeSubTab
                    }
                });

                // 데이터가 배열인지 확인 후 설정
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
    }, [categoryId, activeSubTab]);

    // 등급별 색상 함수
    const getGradeColor = (grade: string) => {
        switch (grade) {
            case '고급': return '#81c784';
            case '희귀': return '#4fc3f7';
            case '영웅': return '#ba68c8';
            case '전설': return '#ffb74d';
            case '유물': return '#ff8a65';
            case '고대': return '#e7b9ff'; // 고대 등급 추가
            default: return '#e0e0e0';
        }
    };

    return (
        <div className="container" style={{ marginTop: '30px' }}>

            {/* 1. 상단 서브 탭 & 티어 선택 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {currentTabs.map(tab => (
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

                {/* 티어 선택 (필요 시 API 연동) */}
                <select className="custom-select" style={{ width: '100px', marginBottom: 0, padding:'8px' }}>
                    <option>티어 4</option>
                    <option>티어 3</option>
                </select>
            </div>

            {/* 2. 시세 목록 테이블 */}
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
                        <tr>
                            <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#aaa' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 15px' }}></div>
                                로스트아크 거래소에서 시세를 가져오고 있습니다...
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#ef5350' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
                                데이터를 불러오지 못했습니다.<br/>
                                <span style={{ fontSize: '13px', color: '#888' }}>백엔드 서버(port:8080)가 실행 중인지 확인해주세요.</span>
                            </td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                                해당 카테고리에 표시할 아이템이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <tr
                                key={item.id}
                                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                className="market-row"
                                onClick={() => navigate(`/market/detail/${item.name}`)}
                            >
                                <td style={{ textAlign: 'left', padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width:'40px', height:'40px', borderRadius:'8px', background:'rgba(255,255,255,0.05)',
                                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <span style={{ fontWeight: 'bold', color: getGradeColor(item.grade) }}>{item.name}</span>
                                </td>
                                <td style={{ color: getGradeColor(item.grade), fontSize:'13px' }}>{item.grade}</td>
                                <td style={{ color: '#aaa', fontSize:'13px' }}>{item.bundle}개</td>
                                <td style={{ fontWeight: 'bold', color: '#fff' }}>
                                    {item.minPrice.toLocaleString()} <span style={{fontSize:'11px', color:'#aaa'}}>G</span>
                                </td>
                                <td style={{ fontWeight: 'bold', color: '#e0e0e0' }}>
                                    {item.recentPrice.toLocaleString()} <span style={{fontSize:'11px', color:'#aaa'}}>G</span>
                                </td>
                                <td style={{ color: '#aaa' }}>
                                    {item.avgPrice.toLocaleString()} <span style={{fontSize:'11px'}}>G</span>
                                </td>
                                <td style={{
                                    fontWeight: 'bold',
                                    color: item.changeRate > 0 ? '#ef5350' : item.changeRate < 0 ? '#42a5f5' : '#aaa'
                                }}>
                                    {item.changeRate > 0 ? '+' : ''}{item.changeRate}%
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </section>
        </div>
    );
}