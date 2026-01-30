import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Home() {
    const navigate = useNavigate();

    // 편의 도구 데이터
    const utilityTools = [
        { name: "일반 재련", icon: "🔨", path: "/tools/general" },
        { name: "상급 재련", icon: "✨", path: "/tools/advanced" },
        { name: "아비도스", icon: "🎲", path: "/tools/abydos" },
        { name: "쌀산기", icon: "🍚", path: "/tools/rice" },
        { name: "경매 계산기", icon: "💰", path: "/tools/auction" },
    ];

    // 시세 정보 데이터
    const marketMenus = [
        { id: "reforge", name: "재련 재료", icon: "🔥" },
        { id: "life", name: "생활 재료", icon: "🌿" },
        { id: "engraving", name: "유물 각인서", icon: "📖" },
        { id: "gem", name: "보석", icon: "💎" },
        { id: "battle", name: "배틀 아이템", icon: "💣" },
    ];

    return (
        <div className="container">
            {/* 이벤트 배너 */}
            <section className="banner-area">
                <div className="banner-title">🎉 Winter Festival</div>
                <div className="banner-desc">로스트아크 겨울방학 이벤트 총정리!</div>
            </section>

            {/* 메인 컨텐츠 그리드 (1:1 비율) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingBottom: '50px' }}>

                {/* [좌측] 편의 도구 */}
                <section className="content-card">
                    <div className="card-header">
                        <span className="card-title">🛠️ 편의 도구</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        {utilityTools.map((tool) => (
                            <div
                                key={tool.name}
                                className="tool-btn"
                                onClick={() => tool.path ? navigate(tool.path) : alert("준비 중")}
                            >
                                <span style={{ fontSize: '1.1rem', display:'flex', alignItems:'center', gap:'8px' }}>
                                    {tool.icon} {tool.name}
                                </span>
                                <span style={{color: 'var(--text-secondary)'}}>›</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* [우측] 시세 정보 */}
                <section className="content-card">
                    <div className="card-header">
                        <span className="card-title">📈 실시간 시세 정보</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        {marketMenus.map((menu) => (
                            <div
                                key={menu.id}
                                className="tool-btn"
                                onClick={() => navigate(`/market/${menu.id}`)}
                            >
                                <span style={{ fontSize: '1.1rem', display:'flex', alignItems:'center', gap:'8px' }}>
                                    {menu.icon} {menu.name}
                                </span>
                                <span style={{color: 'var(--text-secondary)'}}>›</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}