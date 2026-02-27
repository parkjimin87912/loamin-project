import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    // 검색 관련 상태
    const [characterName, setCharacterName] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecent, setShowRecent] = useState(false);

    // 드롭다운 상태
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [isMarketOpen, setIsMarketOpen] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);

    // 도구 메뉴 목록 (순서 수정됨)
    const toolsMenu = [
        { name: "일반 재련", path: "/tools/general" },
        { name: "상급 재련", path: "/tools/advanced" },
        { name: "아비도스 쌀산기", path: "/tools/abydos" },
        { name: "아비도스 제작", path: "/tools/craft" },
        { name: "경매 계산기", path: "/tools/auction" },
        { name: "스탯 계산기", path: "/tools/stat-calc" },
    ];

    // 시세 정보 메뉴 목록
    const marketMenu = [
        { name: "재련 재료", path: "/market/reforge" },
        { name: "생활 재료", path: "/market/life" },
        { name: "유물 각인서", path: "/market/engraving" },
        { name: "보석", path: "/market/gem" },
        { name: "배틀 아이템", path: "/market/battle" },
    ];

    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.error(e);
            }
        }

        const handleClickOutside = (event: MouseEvent) => {
            // 검색바 외부 클릭 시 닫기
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowRecent(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!characterName.trim()) return;

        const trimmed = characterName.trim();
        const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));

        setShowRecent(false);
        navigate(`/character?name=${trimmed}`);
    };

    const handleRecentClick = (name: string) => {
        setCharacterName(name);
        setShowRecent(false);
        navigate(`/character?name=${name}`);
    };

    const removeSearchTerm = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s !== name);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    return (
        <div className="app-container">
            {/* 1. 상단 헤더 */}
            <header className="header">
                <div className="container header-inner" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', height: '100%' }}>
                    {/* 로고 (왼쪽 정렬) */}
                    <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', color: '#fff', justifySelf: 'start' }}>⚔️ LOAMIN</div>

                    {/* 검색바 영역 (중앙 정렬) */}
                    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', width: '100%' }} ref={searchRef}>
                        <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="캐릭터 검색..."
                                value={characterName}
                                onChange={(e) => setCharacterName(e.target.value)}
                                onFocus={() => setShowRecent(true)}
                                style={{
                                    width: '100%',
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-input)',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                            />
                            <button type="submit" style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: '#aaa',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}>
                                🔍
                            </button>

                            {/* 최근 검색어 드롭다운 */}
                            {showRecent && recentSearches.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '5px',
                                    background: '#2a2a2a',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    zIndex: 1000,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '8px 12px', fontSize: '12px', color: '#888', borderBottom: '1px solid #333' }}>
                                        최근 검색어
                                    </div>
                                    {recentSearches.map((name, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleRecentClick(name)}
                                            style={{
                                                padding: '10px 12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                color: '#ddd',
                                                fontSize: '14px',
                                                borderBottom: index < recentSearches.length - 1 ? '1px solid #333' : 'none'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span>{name}</span>
                                            <span
                                                onClick={(e) => removeSearchTerm(name, e)}
                                                style={{ color: '#666', fontSize: '16px', padding: '0 4px' }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#ef5350'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                            >
                                                ×
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* 오른쪽 여백 (균형 맞추기용) */}
                    <div style={{ justifySelf: 'end' }}></div>
                </div>
            </header>

            {/* 2. 메인 네비게이션 (활성 상태 표시) */}
            <nav className="nav-bar">
                <div className="container">
                    <ul className="nav-list" style={{ display: 'flex', justifyContent: 'center', gap: '0' }}>
                        <li style={{ flex: 1, textAlign: 'center' }}>
                            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'center' }}>
                                메인
                            </NavLink>
                        </li>
                        
                        {/* 도구 메뉴 (드롭다운) */}
                        <li 
                            onMouseEnter={() => setIsToolsOpen(true)}
                            onMouseLeave={() => setIsToolsOpen(false)}
                            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}
                        >
                            <div 
                                className={`nav-item ${location.pathname.startsWith('/tools') ? 'active' : ''}`}
                                style={{ cursor: 'default', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}
                            >
                                도구 <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
                            </div>

                            {isToolsOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    width: '100%',
                                    background: '#1e1e1e',
                                    border: '1px solid #333',
                                    borderRadius: '0 0 8px 8px',
                                    padding: '8px 0',
                                    zIndex: 1000,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px'
                                }}>
                                    {toolsMenu.map((tool) => (
                                        <div 
                                            key={tool.path}
                                            onClick={() => {
                                                navigate(tool.path);
                                                setIsToolsOpen(false);
                                            }}
                                            style={{
                                                padding: '10px 0',
                                                color: location.pathname === tool.path ? '#a970ff' : '#ccc',
                                                fontSize: '14px',
                                                fontWeight: location.pathname === tool.path ? 'bold' : 'normal',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = location.pathname === tool.path ? '#a970ff' : '#ccc';
                                            }}
                                        >
                                            {tool.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </li>

                        {/* 시세 정보 메뉴 (드롭다운) */}
                        <li 
                            onMouseEnter={() => setIsMarketOpen(true)}
                            onMouseLeave={() => setIsMarketOpen(false)}
                            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}
                        >
                            <div 
                                className={`nav-item ${location.pathname.startsWith('/market') ? 'active' : ''}`}
                                style={{ cursor: 'default', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}
                            >
                                시세 정보 <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
                            </div>

                            {isMarketOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    width: '100%',
                                    background: '#1e1e1e',
                                    border: '1px solid #333',
                                    borderRadius: '0 0 8px 8px',
                                    padding: '8px 0',
                                    zIndex: 1000,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px'
                                }}>
                                    {marketMenu.map((item) => (
                                        <div 
                                            key={item.path}
                                            onClick={() => {
                                                navigate(item.path);
                                                setIsMarketOpen(false);
                                            }}
                                            style={{
                                                padding: '10px 0',
                                                color: location.pathname === item.path ? '#a970ff' : '#ccc',
                                                fontSize: '14px',
                                                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = location.pathname === item.path ? '#a970ff' : '#ccc';
                                            }}
                                        >
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </li>

                        <li style={{ flex: 1, textAlign: 'center' }}>
                            <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'center' }}>
                                게임 일정
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* 3. 실제 페이지 내용이 들어갈 자리 */}
            <Outlet />
        </div>
    );
}