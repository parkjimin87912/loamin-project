import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../App.css';

export default function Layout() {
    const navigate = useNavigate();
    const [characterName, setCharacterName] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!characterName.trim()) return;
        // [수정] 캐릭터 검색 페이지로 이동 (쿼리 파라미터나 상태 전달 방식이 아니라, 검색 페이지에서 직접 입력하도록 유도하거나 추후 연동)
        // 여기서는 일단 검색 페이지로 이동만 시키고, 검색어 전달은 추후 구현 (또는 검색 페이지에서 다시 입력)
        navigate('/character'); 
    };

    return (
        <div className="app-container">
            {/* 1. 상단 헤더 */}
            <header className="header">
                <div className="container header-inner">
                    <div className="logo" onClick={() => navigate('/')}>⚔️ LOAMIN</div>
                    {/* [수정] 상단 검색바 제거 또는 캐릭터 검색 페이지로 이동하는 버튼으로 변경 */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <button 
                            onClick={() => navigate('/character')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '20px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-input)',
                                color: '#aaa',
                                cursor: 'pointer',
                                width: '300px',
                                textAlign: 'left'
                            }}
                        >
                            🔍 캐릭터 검색하러 가기...
                        </button>
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
                            <NavLink to="/character" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                캐릭터 검색
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
                    </ul>
                </div>
            </nav>

            {/* 3. 실제 페이지 내용이 들어갈 자리 */}
            <Outlet />
        </div>
    );
}