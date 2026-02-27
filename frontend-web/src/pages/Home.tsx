import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Home() {
    const navigate = useNavigate();
    const [searchName, setSearchName] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchName.trim()) {
            navigate(`/character?name=${searchName.trim()}`);
        }
    };

    // [왼쪽] 편의 도구 데이터
    const utilityTools = [
        { name: "스탯 계산기", icon: "📊", path: "/tools/stat-calc", desc: "뭉가/음돌 최적 스탯 분배", color: "#81c784" },
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
                padding: '24px', borderRadius: '20px', background: 'var(--bg-input)',
                cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', 
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                position: 'relative', overflow: 'hidden', height: '100%'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 10px 20px -5px ${color}40`;
                e.currentTarget.style.borderColor = `${color}50`;
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
            }}
        >
            {/* 배경 장식 효과 */}
            <div style={{
                position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px',
                background: color, opacity: 0.05, borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', zIndex: 1 }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: `${color}15`, // 아이콘 배경 (투명도 15%)
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', color: color, flexShrink: 0
                }}>
                    {icon}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize:'18px', marginBottom:'6px' }}>{title}</div>
                    <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.4' }}>{desc}</div>
                </div>
                <div style={{ color: color, opacity: 0.5, fontSize: '20px' }}>➜</div>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* 1. 상단 배너 (검색창 추가) */}
            <section className="banner-area" style={{ 
                marginBottom: '60px', padding: '80px 20px', 
                height: 'auto', minHeight:'280px', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(169, 112, 255, 0.05) 100%)',
                borderRadius: '0 0 40px 40px'
            }}>
                <div className="banner-title" style={{ 
                    fontSize: '4rem', letterSpacing: '4px', marginBottom:'15px',
                    background: 'linear-gradient(45deg, #fff, #a970ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '900'
                }}>LOAMIN</div>
                <div className="banner-desc" style={{ opacity: 0.7, fontSize: '1.2rem', marginBottom: '50px', fontWeight:'300' }}>
                    로스트아크의 모든 정보를 한눈에, 더 스마트하게
                </div>
                
                <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="캐릭터명을 입력하세요" 
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '20px 30px',
                            borderRadius: '50px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(30, 30, 30, 0.8)',
                            color: '#fff',
                            fontSize: '16px',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                            e.target.style.background = 'rgba(40, 40, 40, 0.95)';
                            e.target.style.boxShadow = '0 8px 32px rgba(169, 112, 255, 0.2)';
                            e.target.style.borderColor = '#a970ff';
                        }}
                        onBlur={(e) => {
                            e.target.style.background = 'rgba(30, 30, 30, 0.8)';
                            e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                    />
                    <button type="submit" style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'linear-gradient(45deg, #a970ff, #7b1fa2)',
                        border: 'none',
                        borderRadius: '40px',
                        padding: '12px 28px',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '15px',
                        boxShadow: '0 4px 12px rgba(169, 112, 255, 0.4)',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                    >
                        검색
                    </button>
                </form>
            </section>

            {/* 2. 메인 콘텐츠 (상하 배치 그리드) */}
            <div style={{ padding: '0 20px 60px 20px' }}>

                {/* [섹션 1] 편의성 도구 */}
                <div style={{ marginBottom: '60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', paddingLeft: '10px' }}>
                        <span style={{ fontSize: '28px', filter: 'grayscale(0.2)' }}>🛠️</span>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color:'#fff' }}>편의성 도구</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#888' }}>로스트아크 플레이에 유용한 계산기 모음</p>
                        </div>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                        gap: '25px' 
                    }}>
                        {utilityTools.map((tool) => (
                            <MenuCard
                                key={tool.name}
                                title={tool.name}
                                icon={tool.icon}
                                desc={tool.desc}
                                color={tool.color}
                                onClick={() => navigate(tool.path)}
                            />
                        ))}
                    </div>
                </div>

                {/* [섹션 2] 시세 정보 바로가기 */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', paddingLeft: '10px' }}>
                        <span style={{ fontSize: '28px', filter: 'grayscale(0.2)' }}>📊</span>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color:'#fff' }}>시세 정보 바로가기</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#888' }}>실시간 거래소 및 경매장 시세 확인</p>
                        </div>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                        gap: '25px' 
                    }}>
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
                </div>

            </div>
        </div>
    );
}