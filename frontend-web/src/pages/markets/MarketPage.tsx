import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../App.css'; // 경로 수정 (상위 폴더로 두 번 이동)

// 아이템 데이터 타입
interface MarketItem {
    id: string;
    name: string;
    grade: '일반' | '고급' | '희귀' | '영웅' | '전설' | '유물';
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
    const [activeSubTab, setActiveSubTab] = useState("재련 재료");

    const titles: { [key: string]: string } = {
        reforge: "🔥 재련 재료 시세",
        life: "🌿 생활 재료 시세",
        engraving: "📖 유물 각인서 시세",
        gem: "💎 보석 시세",
        battle: "💣 배틀 아이템 시세",
    };
    const title = titles[categoryId || ""] || "시세 정보";

    // 더미 데이터
    const items: MarketItem[] = [
        { id: '1', name: '운명의 파괴석 결정', grade: '일반', bundle: 100, minPrice: 1550, recentPrice: 1550, avgPrice: 1590.6, changeRate: -2.55, icon: '💎' },
        { id: '2', name: '운명의 파괴석', grade: '일반', bundle: 100, minPrice: 250, recentPrice: 285, avgPrice: 302.9, changeRate: -17.46, icon: '💎' },
        { id: '3', name: '운명의 파편 주머니(대)', grade: '영웅', bundle: 1, minPrice: 210, recentPrice: 210, avgPrice: 222.4, changeRate: -5.58, icon: '💰' },
        { id: '4', name: '운명의 파편 주머니(중)', grade: '희귀', bundle: 1, minPrice: 142, recentPrice: 144, avgPrice: 149.9, changeRate: -5.27, icon: '💰' },
        { id: '5', name: '상급 아비도스 융화 재료', grade: '영웅', bundle: 1, minPrice: 104, recentPrice: 104, avgPrice: 103.7, changeRate: 0.29, icon: '🔸' },
        { id: '6', name: '아비도스 융화 재료', grade: '희귀', bundle: 1, minPrice: 85, recentPrice: 85, avgPrice: 82.8, changeRate: 2.66, icon: '🔸' },
        { id: '7', name: '운명의 파편 주머니(소)', grade: '고급', bundle: 1, minPrice: 70, recentPrice: 70, avgPrice: 80.5, changeRate: -13.04, icon: '💰' },
        { id: '8', name: '위대한 운명의 돌파석', grade: '희귀', bundle: 1, minPrice: 57, recentPrice: 60, avgPrice: 63.4, changeRate: -10.09, icon: '🔮' },
        { id: '9', name: '운명의 수호석 결정', grade: '일반', bundle: 100, minPrice: 55, recentPrice: 55, avgPrice: 65.1, changeRate: -15.51, icon: '🛡️' },
        { id: '10', name: '운명의 돌파석', grade: '희귀', bundle: 1, minPrice: 9, recentPrice: 9, avgPrice: 8.0, changeRate: 12.50, icon: '🔮' },
    ];

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case '고급': return '#81c784';
            case '희귀': return '#4fc3f7';
            case '영웅': return '#ba68c8';
            case '전설': return '#ffb74d';
            case '유물': return '#ff8a65';
            default: return '#e0e0e0';
        }
    };

    return (
        <div className="container" style={{ marginTop: '30px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {["재련 재료", "재련 보조 재료"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveSubTab(tab)}
                            style={{
                                padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                                background: activeSubTab === tab ? 'var(--primary-color)' : 'var(--bg-input)',
                                color: activeSubTab === tab ? '#fff' : 'var(--text-secondary)'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <select className="custom-select" style={{ width: '100px', marginBottom: 0, padding:'8px' }}>
                    <option>티어 4</option>
                    <option>티어 3</option>
                </select>
            </div>

            <section className="content-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <span className="card-title">{title}</span>
                </div>

                <table className="prob-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ background: 'var(--bg-header)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <th style={{ textAlign: 'left', paddingLeft: '30px' }}>아이템</th>
                        <th>등급</th>
                        <th>묶음 수량</th>
                        <th>최저가</th>
                        <th>최근 거래가</th>
                        <th>전일 평균가</th>
                        <th>등락률</th>
                    </tr>
                    </thead>
                    <tbody>
                    {categoryId === 'reforge' ? items.map((item) => (
                        <tr
                            key={item.id}
                            style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                            className="market-row"
                            onClick={() => navigate(`/market/detail/${item.name}`)}
                        >
                            <td style={{ textAlign: 'left', padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                                <span style={{ fontWeight: 'bold', color: getGradeColor(item.grade) }}>{item.name}</span>
                            </td>
                            <td style={{ color: getGradeColor(item.grade) }}>{item.grade}</td>
                            <td>{item.bundle}</td>
                            <td style={{ fontWeight: 'bold', color: '#fff' }}>{item.minPrice.toLocaleString()} <span style={{fontSize:'11px', color:'#aaa'}}>G</span></td>
                            <td style={{ fontWeight: 'bold', color: '#fff' }}>{item.recentPrice.toLocaleString()} <span style={{fontSize:'11px', color:'#aaa'}}>G</span></td>
                            <td style={{ color: '#aaa' }}>{item.avgPrice.toLocaleString()} <span style={{fontSize:'11px'}}>G</span></td>
                            <td style={{
                                fontWeight: 'bold',
                                color: item.changeRate > 0 ? '#ef5350' : item.changeRate < 0 ? '#42a5f5' : '#aaa'
                            }}>
                                {item.changeRate > 0 ? '+' : ''}{item.changeRate}%
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: '#666' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🚧</div>
                                현재 '{title}' 데이터는 준비 중입니다.<br/>
                                '재련 재료' 탭을 확인해보세요.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </section>
        </div>
    );
}