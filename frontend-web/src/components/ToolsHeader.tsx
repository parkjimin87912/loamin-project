import { useNavigate, useLocation } from 'react-router-dom';

export default function ToolsHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const tabs = [
        { name: '일반 재련', path: '/tools/general' },
        { name: '상급 재련', path: '/tools/advanced' },
        { name: '아비도스 쌀산기', path: '/tools/abydos' },
        { name: '아비도스 제작', path: '/tools/craft' },
        { name: '경매 계산기', path: '/tools/auction' },
        // 🌟 여기에 새 메뉴 탭 추가!
        { name: '스탯 계산기', path: '/tools/stat-calc' },
    ];

    return (
        <div className="tools-header-container">
            {tabs.map(tab => {
                const isActive = currentPath.startsWith(tab.path);
                return (
                    <span
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        className={`tools-tab ${isActive ? 'active' : ''}`}
                    >
                        {tab.name}
                    </span>
                );
            })}
        </div>
    );
}