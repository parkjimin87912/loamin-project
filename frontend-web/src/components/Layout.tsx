import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../App.css';

export default function Layout() {
    const navigate = useNavigate();
    const [characterName, setCharacterName] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecent, setShowRecent] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

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
        // 검색 후 입력창 초기화는 선택사항이지만, 보통 유지하거나 초기화함. 여기서는 유지.
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
                <div className="container header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>⚔️ LOAMIN</div>
                    
                    {/* 검색바 영역 */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }} ref={searchRef}>
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

                    <div style={{ width: '80px' }}></div>
                </div>
            </header>

            {/* 2. 메인 네비게이션 (활성 상태 표시) */}
            <nav className="nav-bar">
                <div className="container">
                    <ul className="nav-list">
                        <li>
                            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                메인
                            </NavLink>
                        </li>
                        <li>
                            {/* 도구 하위 페이지로 가도 '도구' 메뉴에 불이 들어오게 설정 */}
                            <NavLink to="/tools" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                도구
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/market" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                시세 정보
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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