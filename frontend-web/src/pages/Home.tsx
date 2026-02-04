import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Home() {
    const navigate = useNavigate();

    // [왼쪽] 편의 도구 데이터
    const utilityTools = [
        { name: "일반 재련", icon: "🔨", path: "/tools/general", desc: "기본 재련 확률/비용 계산", color: "#ffb74d" },
        { name: "상급 재련", icon: "✨", path: "/tools/advanced", desc: "상급 재련 최적화 계산", color: "#ffd54f" },
        { name: "아비도스 쌀산기", icon: "🎲", path: "/tools/abydos", desc: "제작 이득/손해 자동 분석", color: "#e0e0e0" },
        { name: "아비도스 제작 계산기", icon: "🏭", path: "/tools/craft", desc: "보유 재료 기반 최적 교환", color: "#90caf9" },
        { name: "경매 계산기", icon: "💰", path: "/tools/auction", desc: "경매 입찰 적정가 가이드", color: "#ffcc80" },
    ];

    // [오른쪽] 시세 정보 데이터
    const marketShortcuts = [
        { name: "재련 재료 시세", id: "reforge", icon: "💎", desc: "파괴석, 수호석, 돌파석, 융화 재료", color: "#42a5f5" },
        { name: "생활 재료 시세", id: "life", icon: "🌿", desc: "고고학, 낚시, 채광, 벌목 등", color: "#66bb6a" },
        { name: "유물 각인서 시세", id: "engraving", icon: "📖", desc: "전설 및 유물 각인서 실시간 시세", color: "#ab47bc" },
        { name: "보석 시세", id: "gem", icon: "🔮", desc: "멸화, 홍염, 겁화, 작열 보석", color: "#ef5350" },
        { name: "배틀 아이템 시세", id: "battle", icon: "💣", desc: "회복약, 폭탄, 수류탄, 기능성 아이템", color: "#8d6e63" },
    ];

    // 공통 카드 컴포넌트 (스타일 통일)
    const MenuCard = ({ title, icon, desc, color, onClick }: any) => (
        <div
            onClick={onClick}
            className="tool-card"
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px', borderRadius: '12px', background: 'var(--bg-input)',
                cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s ease',
                minHeight: '84px' // 높이 강제 통일
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = `${color}10`; // 투명도 10%
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.background = 'var(--bg-input)';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: `${color}15`, // 아이콘 배경 (투명도 15%)
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', color: color
                }}>
                    {icon}
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', color: '#e0e0e0', fontSize:'16px', marginBottom:'4px' }}>{title}</div>
                    <div style={{ fontSize: '13px', color: '#888' }}>{desc}</div>
                </div>
            </div>
            <span style={{ color: '#444', fontSize:'18px' }}>➜</span>
        </div>
    );

    return (
        <div className="container">
            {/* 1. 상단 배너 (검색창 제거) */}
            <section className="banner-area" style={{ marginBottom: '40px', padding: '50px 20px', height: 'auto', minHeight:'160px' }}>
                <div className="banner-title" style={{ fontSize: '3rem', letterSpacing: '2px', marginBottom:'10px' }}>LOAMIN</div>
                <div className="banner-desc" style={{ opacity: 0.8, fontSize: '1.1rem' }}>로스트아크의 모든 정보를 한눈에, 더 스마트하게</div>
            </section>

            {/* 2. 메인 콘텐츠 (1:1 비율 그리드) */}
            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr', // 정확히 1:1 비율 강제
                gap: '30px',
                alignItems: 'start'
            }}>

                {/* [왼쪽] 편의성 도구 */}
                <section className="content-card" style={{ padding: '30px', height: '100%', minHeight:'500px' }}>
                    <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom:'1px solid #333', paddingBottom:'15px' }}>
                        <span style={{ fontSize: '22px' }}>🛠️</span>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color:'#fff' }}>편의성 도구</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {utilityTools.map((tool) => (
                            <MenuCard
                                key={tool.name}
                                title={tool.name}
                                icon={tool.icon}
                                desc={tool.desc}
                                color={tool.color} // 개별 포인트 컬러 적용
                                onClick={() => navigate(tool.path)}
                            />
                        ))}
                    </div>
                </section>

                {/* [오른쪽] 시세 정보 바로가기 */}
                <section className="content-card" style={{ padding: '30px', height: '100%', minHeight:'500px' }}>
                    <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom:'1px solid #333', paddingBottom:'15px' }}>
                        <span style={{ fontSize: '22px' }}>📊</span>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color:'#fff' }}>시세 정보 바로가기</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {marketShortcuts.map((item) => (
                            <MenuCard
                                key={item.id}
                                title={item.name}
                                icon={item.icon}
                                desc={item.desc}
                                color={item.color}
                                onClick={() => navigate(`/market/${item.id}`)}
                            />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}