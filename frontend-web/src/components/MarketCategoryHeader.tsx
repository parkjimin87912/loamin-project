import { useNavigate, useLocation } from 'react-router-dom';

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
        <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', display: 'flex', gap: '20px', overflowX: 'auto' }}>
            {tabs.map(tab => {
                const isActive = currentPath.includes(tab.path);
                return (
                    <span
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        style={{
                            color: isActive ? '#fff' : 'var(--text-secondary)',
                            fontWeight: isActive ? 'bold' : 'normal',
                            fontSize: '15px',
                            borderBottom: isActive ? '2px solid var(--text-accent)' : 'none',
                            paddingBottom: '19px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.name}
                    </span>
                );
            })}
        </div>
    );
}