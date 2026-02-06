import { useState } from 'react';
import axios from 'axios';
import '../App.css';

interface Equipment {
    type: string;
    name: string;
    icon: string;
    grade: string;
}

interface CharacterInfo {
    serverName: string;
    characterName: string;
    characterLevel: number;
    characterClassName: string;
    itemAvgLevel: string;
    itemMaxLevel: string;
    equipment: Equipment[];
}

export default function CharacterSearchPage() {
    const [searchName, setSearchName] = useState('');
    const [character, setCharacter] = useState<CharacterInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchName.trim()) return;

        setLoading(true);
        setError(false);
        setCharacter(null);

        try {
            const response = await axios.get(`http://localhost:8080/api/v1/characters/${searchName}`);
            if (response.data) {
                setCharacter(response.data);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error("캐릭터 검색 실패:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case '고대': return '#e7b9ff';
            case '유물': return '#ff8a65';
            case '전설': return '#ffb74d';
            case '영웅': return '#ba68c8';
            case '희귀': return '#4fc3f7';
            case '고급': return '#81c784';
            default: return '#e0e0e0';
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#fff' }}>🔍 캐릭터 검색</h1>
            
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
                <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="캐릭터명을 입력하세요"
                    style={{
                        flex: 1,
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-input)',
                        color: '#fff',
                        fontSize: '16px'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '0 30px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--primary-color)',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    검색
                </button>
            </form>

            {loading && <div style={{ textAlign: 'center', color: '#aaa' }}>검색 중...</div>}
            
            {error && <div style={{ textAlign: 'center', color: '#ef5350' }}>캐릭터를 찾을 수 없습니다.</div>}

            {character && (
                <div className="content-card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
                            👤
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>{character.serverName}</div>
                            <h2 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>{character.characterName}</h2>
                            <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                                <span style={{ background: 'var(--bg-input)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>Lv.{character.characterLevel}</span>
                                <span style={{ background: 'var(--primary-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: '#fff' }}>{character.characterClassName}</span>
                            </div>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', color: '#aaa' }}>아이템 레벨</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffb74d' }}>{character.itemMaxLevel}</div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff' }}>착용 장비</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                        {character.equipment.map((eq, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#000' }}>
                                    <img src={eq.icon} alt={eq.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#aaa' }}>{eq.type}</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: getGradeColor(eq.grade) }}>{eq.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}