import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

export default function MarketCategoryHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const tabs = [
        { name: '재련 재료', path: '/market/reforge' },
        { name: '생활 재료', path: '/market/life' },
        { name: '유물 각인서', path: '/market/engraving' },
        { name: '보석', path: '/market/gem' },
        { name: '배틀 아이템', path: '/market/battle' },
    ];

    return (
        <div className="tools-header-container">
            {tabs.map(tab => {
                const isActive = currentPath.includes(tab.path);
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