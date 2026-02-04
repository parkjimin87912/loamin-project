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
    ];

    return (
        <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', display: 'flex', gap: '20px', overflowX: 'auto' }}>
            {tabs.map(tab => {
                const isActive = currentPath.startsWith(tab.path);
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