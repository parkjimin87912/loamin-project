import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../App.css';

export default function Layout() {
    const navigate = useNavigate();
    const [characterName, setCharacterName] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!characterName.trim()) return;
        alert(`🔍 '${characterName}' 검색 (기능 준비 중)`);
    };

    return (
        <div className="app-container">
            {/* 1. 상단 헤더 */}
            <header className="header">
                <div className="container header-inner">
                    <div className="logo" onClick={() => navigate('/')}>⚔️ LOAMIN</div>
                    <form className="search-area" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="캐릭터명을 입력해 주세요"
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                        />
                    </form>
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
                    </ul>
                </div>
            </nav>

            {/* 3. 실제 페이지 내용이 들어갈 자리 */}
            <Outlet />
        </div>
    );
}