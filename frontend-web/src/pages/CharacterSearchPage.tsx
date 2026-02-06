import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

interface Stat {
    type: string;
    value: string;
    tooltip: string;
}

interface Equipment {
    type: string;
    name: string;
    icon: string;
    grade: string;
    tooltip: string;
}

interface Gem {
    slot: number;
    name: string;
    icon: string;
    level: number;
    grade: string;
    tooltip: string;
}

interface Card {
    slot: number;
    name: string;
    icon: string;
    awakeCount: number;
    grade: string;
}

interface CardEffect {
    index: number;
    cardSlots: number[];
    items: { name: string; description: string }[];
}

interface Skill {
    name: string;
    icon: string;
    level: number;
    type: string;
    isAwakening: boolean;
    tripods: {
        tier: number;
        slot: number;
        name: string;
        icon: string;
        level: number;
        isSelected: boolean;
    }[];
    runeName: string;
    runeIcon: string;
    runeGrade: string;
}

interface ArkPassiveEffect {
    name: string;
    description: string;
    icon: string;
    grade: string;
}

interface ArkPassive {
    isArkPassive: boolean;
    effects: ArkPassiveEffect[];
}

interface CharacterInfo {
    serverName: string;
    characterName: string;
    characterLevel: number;
    characterClassName: string;
    itemAvgLevel: string;
    itemMaxLevel: string;
    characterImage: string;
    guildName: string;
    title: string;
    stats: Stat[];
    equipment: Equipment[];
    gems: Gem[];
    cards: Card[];
    cardEffects: CardEffect[];
    skills: Skill[];
    arkPassive: ArkPassive;
}

export default function CharacterSearchPage() {
    const [searchName, setSearchName] = useState('');
    const [character, setCharacter] = useState<CharacterInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState('전체');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // 로컬 스토리지에서 검색 기록 불러오기
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.error("검색 기록 파싱 오류", e);
            }
        }
    }, []);

    // 검색어 저장
    const saveSearchTerm = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        // 중복 제거 및 최신순 정렬, 최대 10개 유지
        const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    // 검색어 삭제
    const removeSearchTerm = (name: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
        const updated = recentSearches.filter(s => s !== name);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    // 캐릭터 정보 가져오기
    const fetchCharacter = async (name: string) => {
        setLoading(true);
        setError(false);
        setCharacter(null);

        try {
            const response = await axios.get(`http://localhost:8080/api/v1/characters/${name}`);
            if (response.data) {
                setCharacter(response.data);
                saveSearchTerm(name);
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchName.trim()) return;
        fetchCharacter(searchName.trim());
    };

    const handleRecentClick = (name: string) => {
        setSearchName(name);
        fetchCharacter(name);
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

    // 툴팁 파싱 함수 (전체 텍스트 탐색 방식 - 강력함)
    const parseTooltip = (tooltip: string, itemType?: string) => {
        try {
            const json = JSON.parse(tooltip);
            let quality = -1;
            let options: string[] = [];
            let mainStat = ""; // 힘, 민첩, 지능 중 하나

            // 텍스트 추출 헬퍼 (HTML 태그 제거)
            const stripHtml = (html: string) => {
                return html.replace(/<BR>|<br>/gi, '\n').replace(/<[^>]*>/g, '').trim();
            };

            // 재귀적으로 텍스트 추출
            const extractText = (obj: any): string[] => {
                if (typeof obj === 'string') {
                    return stripHtml(obj).split('\n').map(s => s.trim()).filter(s => s);
                }
                if (typeof obj === 'object' && obj !== null) {
                    let results: string[] = [];
                    Object.values(obj).forEach(val => {
                        results = [...results, ...extractText(val)];
                    });
                    return results;
                }
                return [];
            };

            const traverse = (obj: any) => {
                if (!obj) return;

                // 1. 품질 (ItemTitle)
                if (typeof obj === 'object' && obj.type === "ItemTitle" && obj.value?.qualityValue !== undefined) {
                    quality = obj.value.qualityValue;
                }

                // 2. ItemPartBox (주요 옵션 섹션)
                if (typeof obj === 'object' && obj.type === "ItemPartBox") {
                    const titleObj = obj.value?.Element_000;
                    const contentObj = obj.value?.Element_001;
                    
                    const titleText = typeof titleObj === 'string' ? stripHtml(titleObj) : "";
                    const contentLines = extractText(contentObj);

                    // 2-1. 연마 효과 (제목에 '연마'가 포함된 경우)
                    if (titleText.includes("연마")) {
                        contentLines.forEach(line => {
                            if (line && !line.includes("연마")) {
                                options.push(line);
                            }
                        });
                    }

                    // 2-2. 팔찌 효과
                    if (titleText.includes("팔찌 효과")) {
                        contentLines.forEach(line => {
                            if (!line.includes("팔찌 효과") && !line.includes("부여 효과")) {
                                options.push(line.replace(/[\[\]]/g, ''));
                            }
                        });
                    }
                    
                    // 2-3. 각인 효과 (어빌리티 스톤 등)
                    if (titleText.includes("각인 효과")) {
                         contentLines.forEach(line => {
                            // [원한] 활성도 +9 또는 [원한] +9
                            const match = line.match(/\[([^\]]+)\]\s*(?:활성도)?\s*\+?\s*(\d+)/);
                            if (match) {
                                options.push(`${match[1]} +${match[2]}`);
                            }
                        });
                    }
                }
                
                // 3. IndentStringGroup (어빌리티 스톤 세공 결과 등)
                if (typeof obj === 'object' && obj.type === "IndentStringGroup") {
                    const lines = extractText(obj);
                    lines.forEach(line => {
                        const match = line.match(/\[([^\]]+)\]\s*(?:활성도)?\s*\+?\s*(\d+)/);
                        if (match) {
                            options.push(`${match[1]} +${match[2]}`);
                        }
                    });
                }

                // 4. 일반 문자열 스캔 (기본 특성 및 놓친 각인)
                if (typeof obj === 'string') {
                    const cleanText = stripHtml(obj);
                    
                    // 기본 특성 (치명, 특화, 신속 등)
                    const stats = ["치명", "특화", "신속", "제압", "인내", "숙련"];
                    stats.forEach(stat => {
                        const regex = new RegExp(`${stat}\\s*\\+\\s*(\\d+)`);
                        const match = cleanText.match(regex);
                        if (match) {
                            options.push(`${stat} +${match[1]}`);
                        }
                    });

                    // 주 스탯 (힘, 민첩, 지능) 찾기
                    const mainStats = ["힘", "민첩", "지능"];
                    mainStats.forEach(stat => {
                        const regex = new RegExp(`${stat}\\s*\\+\\s*(\\d+)`);
                        const match = cleanText.match(regex);
                        if (match) {
                            // 가장 먼저 발견된 주 스탯 하나만 저장 (보통 직업에 맞는 스탯이 뜸)
                            if (!mainStat) {
                                mainStat = `${stat} +${match[1]}`;
                            }
                        }
                    });

                    // 각인 (활성도 패턴) - 전역 검색
                    // 패턴 1: [각인명] 활성도 +3
                    const engravingRegex1 = /\[([^\]]+)\]\s*활성도\s*\+?\s*(\d+)/g;
                    let match1;
                    while ((match1 = engravingRegex1.exec(cleanText)) !== null) {
                        options.push(`${match1[1]} +${match1[2]}`);
                    }

                    // 패턴 2: [각인명] Lv.3 (어빌리티 스톤 등)
                    const engravingRegex2 = /\[([^\]]+)\]\s*Lv\.(\d+)/g;
                    let match2;
                    while ((match2 = engravingRegex2.exec(cleanText)) !== null) {
                        options.push(`${match2[1]} +${match2[2]}`);
                    }
                }
                
                // 5. ItemPartBox에서 각인 효과가 Element_000에 바로 들어있는 경우 (어빌리티 스톤의 경우)
                if (typeof obj === 'object' && obj.type === "ItemPartBox") {
                     // Element_000, Element_001, Element_002 등을 모두 확인
                     Object.keys(obj.value).forEach(key => {
                         if (key.startsWith("Element_")) {
                             const element = obj.value[key];
                             // contentStr 필드가 있는 경우 (어빌리티 스톤)
                             if (element && typeof element.contentStr === 'string') {
                                 const cleanContent = stripHtml(element.contentStr);
                                 const match = cleanContent.match(/\[([^\]]+)\]\s*Lv\.(\d+)/);
                                 if (match) {
                                     options.push(`${match[1]} +${match[2]}`);
                                 }
                             }
                             // 그냥 문자열인 경우
                             else if (typeof element === 'string') {
                                 const cleanTitle = stripHtml(element);
                                 const match = cleanTitle.match(/\[([^\]]+)\]\s*(?:활성도)?\s*\+?\s*(\d+)/);
                                 if (match) {
                                     options.push(`${match[1]} +${match[2]}`);
                                 }
                             }
                         }
                     });
                }

                // 재귀 탐색
                if (typeof obj === 'object') {
                    Object.values(obj).forEach(child => traverse(child));
                }
            };

            traverse(json);

            // 필터링 및 중복 제거
            // 체력, 이동 속도 감소 등 부정적인 옵션이나 기본 스탯 중복 제거
            options = options.filter(opt => 
                !opt.includes("체력") && 
                !opt.includes("이동 속도 감소") && 
                !opt.includes("공격 속도 감소") && 
                !opt.includes("방어력 감소")
            );
            options = [...new Set(options)];
            
            return { quality, options, mainStat };
        } catch (e) {
            return { quality: -1, options: [], mainStat: "" };
        }
    };

    const getQualityGrade = (quality: number) => {
        if (quality === 100) return { text: '최상', color: '#fdd835' }; // 노랑 (100)
        if (quality >= 90) return { text: '특급', color: '#ab47bc' }; // 보라 (90~99)
        if (quality >= 70) return { text: '상급', color: '#42a5f5' }; // 파랑 (70~89)
        if (quality >= 50) return { text: '중급', color: '#66bb6a' }; // 초록 (50~69)
        if (quality >= 20) return { text: '하급', color: '#fff59d' }; // 연노랑 (20~49)
        return { text: '최하', color: '#ef5350' }; // 빨강 (0~19)
    };

    // 연마 효과 등급 파싱 및 스타일링
    const renderOption = (option: string, equipType: string) => {
        // 1. 이미 텍스트에 상/중/하가 포함된 경우
        const gradeMatch = option.match(/^(상|중|하)\s/);
        if (gradeMatch) {
            const grade = gradeMatch[1];
            return renderBadge(grade, option.substring(1).trim());
        }

        // 2. 숫자를 기반으로 등급 추론 (연마 효과)
        const numberMatch = option.match(/([\d,]+(?:\.\d+)?)/);
        if (numberMatch) {
            const value = parseFloat(numberMatch[1].replace(/,/g, ''));
            const isPercent = option.includes('%');
            let grade = '';

            // 공통 옵션 (모든 부위)
            if (option.includes("최대 생명력")) {
                if (value >= 6500) grade = '상';
                else if (value >= 3250) grade = '중';
                else if (value >= 1300) grade = '하';
            } else if (option.includes("최대 마나")) {
                if (value >= 30) grade = '상';
                else if (value >= 15) grade = '중';
                else if (value >= 6) grade = '하';
            } else if (option.includes("상태이상")) {
                if (value >= 1.00) grade = '상';
                else if (value >= 0.50) grade = '중';
                else if (value >= 0.20) grade = '하';
            } else if (option.includes("생명력 회복")) {
                if (value >= 50) grade = '상';
                else if (value >= 25) grade = '중';
                else if (value >= 10) grade = '하';
            }

            // 부위별 옵션
            if (!grade) {
                if (equipType === "목걸이") {
                    if (option.includes("추가 피해")) {
                        if (value >= 2.60) grade = '상';
                        else if (value >= 1.60) grade = '중';
                        else if (value >= 0.70) grade = '하';
                    } else if (option.includes("적에게 주는 피해")) {
                        if (value >= 2.00) grade = '상';
                        else if (value >= 1.20) grade = '중';
                        else if (value >= 0.55) grade = '하';
                    } else if (option.includes("낙인력")) {
                        if (value >= 8.00) grade = '상';
                        else if (value >= 4.80) grade = '중';
                        else if (value >= 2.15) grade = '하';
                    } else if (option.includes("획득량") || option.includes("아덴")) { // 서포트 아덴 획득량
                        if (value >= 6.00) grade = '상';
                        else if (value >= 3.60) grade = '중';
                        else if (value >= 1.60) grade = '하';
                    } else if (option.includes("무기 공격력") || option.includes("무기공격력")) { // % 없음
                        if (value >= 960) grade = '상';
                        else if (value >= 480) grade = '중';
                        else if (value >= 195) grade = '하';
                    } else if (option.includes("공격력")) { // % 없음
                        if (value >= 390) grade = '상';
                        else if (value >= 195) grade = '중';
                        else if (value >= 80) grade = '하';
                    }
                } else if (equipType === "귀걸이") {
                    if (option.includes("회복 효과")) {
                        if (value >= 3.50) grade = '상';
                        else if (value >= 2.10) grade = '중';
                        else if (value >= 0.95) grade = '하';
                    } else if (option.includes("보호막")) {
                        if (value >= 3.50) grade = '상';
                        else if (value >= 2.10) grade = '중';
                        else if (value >= 0.95) grade = '하';
                    } else if (option.includes("무기 공격력") || option.includes("무기공격력")) {
                        if (isPercent) {
                            if (value >= 3.00) grade = '상';
                            else if (value >= 1.80) grade = '중';
                            else if (value >= 0.80) grade = '하';
                        } else {
                            if (value >= 960) grade = '상';
                            else if (value >= 480) grade = '중';
                            else if (value >= 195) grade = '하';
                        }
                    } else if (option.includes("공격력")) {
                        if (isPercent) {
                            if (value >= 1.55) grade = '상';
                            else if (value >= 0.95) grade = '중';
                            else if (value >= 0.40) grade = '하';
                        } else {
                            if (value >= 390) grade = '상';
                            else if (value >= 195) grade = '중';
                            else if (value >= 80) grade = '하';
                        }
                    }
                } else if (equipType === "반지") {
                    if (option.includes("치명타 적중률")) {
                        if (value >= 1.55) grade = '상';
                        else if (value >= 0.95) grade = '중';
                        else if (value >= 0.40) grade = '하';
                    } else if (option.includes("치명타 피해")) {
                        if (value >= 4.00) grade = '상';
                        else if (value >= 2.40) grade = '중';
                        else if (value >= 1.10) grade = '하';
                    } else if (option.includes("아군 공격력")) {
                        if (value >= 5.00) grade = '상';
                        else if (value >= 3.00) grade = '중';
                        else if (value >= 1.35) grade = '하';
                    } else if (option.includes("아군 피해량")) {
                        if (value >= 7.50) grade = '상';
                        else if (value >= 4.50) grade = '중';
                        else if (value >= 2.00) grade = '하';
                    } else if (option.includes("무기 공격력") || option.includes("무기공격력")) {
                        if (value >= 960) grade = '상';
                        else if (value >= 480) grade = '중';
                        else if (value >= 195) grade = '하';
                    } else if (option.includes("공격력")) {
                        if (value >= 390) grade = '상';
                        else if (value >= 195) grade = '중';
                        else if (value >= 80) grade = '하';
                    }
                }
            }

            if (grade) {
                return renderBadge(grade, option);
            }
        }

        return <div>{option}</div>;
    };

    const renderBadge = (grade: string, text: string) => {
        let bgColor = '#444';
        let textColor = '#fff';

        if (grade === '상') {
            bgColor = '#fdd835'; // 노랑
            textColor = '#000';
        } else if (grade === '중') {
            bgColor = '#ab47bc'; // 보라
            textColor = '#fff';
        } else if (grade === '하') {
            bgColor = '#42a5f5'; // 파랑
            textColor = '#fff';
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                    background: bgColor, 
                    color: textColor, 
                    padding: '1px 4px', 
                    borderRadius: '3px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    flexShrink: 0
                }}>
                    {grade}
                </span>
                <span>{text}</span>
            </div>
        );
    };

    // 장비 분류 및 정렬
    const leftEquipOrder = ["투구", "어깨", "상의", "하의", "장갑", "무기"];
    const rightEquipTypes = ["목걸이", "귀걸이", "반지", "어빌리티 스톤", "팔찌"];

    const leftEquipments = character?.equipment
        .filter(eq => leftEquipOrder.includes(eq.type))
        .sort((a, b) => leftEquipOrder.indexOf(a.type) - leftEquipOrder.indexOf(b.type)) || [];
        
    const rightEquipments = character?.equipment.filter(eq => rightEquipTypes.includes(eq.type)) || [];

    // 탭 메뉴 정의
    const tabs = ["전체", "스킬", "아크패시브", "아크그리드", "원정대"];

    return (
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#fff' }}>🔍 캐릭터 검색</h1>
            
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '10px', maxWidth: '600px', margin: '0 auto 10px' }}>
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

            {/* 최근 검색어 */}
            {recentSearches.length > 0 && (
                <div style={{ maxWidth: '600px', margin: '0 auto 40px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {recentSearches.map(name => (
                        <div 
                            key={name} 
                            onClick={() => handleRecentClick(name)}
                            style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                padding: '5px 12px', 
                                borderRadius: '15px', 
                                fontSize: '13px', 
                                color: '#ddd', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            {name}
                            <span 
                                onClick={(e) => removeSearchTerm(name, e)}
                                style={{ color: '#aaa', fontWeight: 'bold', fontSize: '14px' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ef5350'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}
                            >
                                ×
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {loading && <div style={{ textAlign: 'center', color: '#aaa' }}>검색 중...</div>}
            
            {error && <div style={{ textAlign: 'center', color: '#ef5350' }}>캐릭터를 찾을 수 없습니다.</div>}

            {character && (
                <div className="content-card" style={{ padding: '0', overflow: 'hidden', background: 'transparent', border: 'none' }}>
                    
                    {/* 1. 탭 메뉴 */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '10px 20px',
                                    background: activeTab === tab ? 'var(--primary-color)' : 'transparent',
                                    color: activeTab === tab ? '#fff' : '#aaa',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '16px'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* 2. 메인 정보 (아이템 레벨, 전투력 등) - 상단 배치 */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>아이템 레벨</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffb74d' }}>{character.itemMaxLevel}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>전투 레벨</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{character.characterLevel}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>서버</div>
                            <div style={{ fontSize: '18px', color: '#fff' }}>{character.serverName}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>길드</div>
                            <div style={{ fontSize: '18px', color: '#fff' }}>{character.guildName || '-'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        {/* 3. 왼쪽: 캐릭터 이미지 및 스펙 */}
                        <div style={{ width: '350px', flexShrink: 0 }}>
                            <div style={{ position: 'relative', height: '500px', background: 'url(' + character.characterImage + ') no-repeat center top / cover', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                                    <div style={{ color: '#aaa', fontSize: '14px', marginBottom: '4px' }}>{character.title}</div>
                                    <h2 style={{ margin: 0, fontSize: '28px', color: '#fff' }}>{character.characterName}</h2>
                                    <div style={{ marginTop: '8px', display: 'inline-block', background: 'var(--primary-color)', padding: '4px 10px', borderRadius: '4px', fontSize: '14px', color: '#fff' }}>{character.characterClassName}</div>
                                </div>
                            </div>

                            {/* 기본 스탯 표시 */}
                            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>기본 특성</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {character.stats.map((stat, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                            <span style={{ color: '#aaa' }}>{stat.type}</span>
                                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 4. 오른쪽: 장비, 악세서리, 보석 등 */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            <div style={{ display: 'flex', gap: '20px' }}>
                                {/* 왼쪽 컬럼: 장비 (무기, 방어구) */}
                                <div style={{ flex: 1, background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>장비</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {leftEquipments.map((eq, index) => {
                                            const { quality } = parseTooltip(eq.tooltip);
                                            const qualityInfo = getQualityGrade(quality);
                                            return (
                                                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', flexShrink: 0 }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#000', border: `1px solid ${getGradeColor(eq.grade)}`, marginBottom: '4px' }}>
                                                            <img src={eq.icon} alt={eq.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                        {quality >= 0 && (
                                                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: qualityInfo.color, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                                품질 {quality}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '40px' }}>
                                                        <div style={{ fontSize: '11px', color: '#aaa' }}>{eq.type}</div>
                                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: getGradeColor(eq.grade), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eq.name}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 오른쪽 컬럼: 악세서리, 팔찌, 돌 */}
                                <div style={{ flex: 1.2, background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>악세서리 & 특수장비</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {rightEquipments.map((eq, index) => {
                                            const { quality, options, mainStat } = parseTooltip(eq.tooltip, eq.type);
                                            const qualityInfo = getQualityGrade(quality);
                                            const isAbilityStone = eq.type === "어빌리티 스톤";
                                            
                                            return (
                                                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', flexShrink: 0 }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#000', border: `1px solid ${getGradeColor(eq.grade)}`, marginBottom: '4px' }}>
                                                            <img src={eq.icon} alt={eq.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                        {quality >= 0 && (
                                                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: qualityInfo.color, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                                품질 {quality}
                                                            </div>
                                                        )}
                                                        {mainStat && (
                                                            <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                                {mainStat}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: getGradeColor(eq.grade), marginBottom: '4px' }}>{eq.name}</div>
                                                        <div style={{ fontSize: '12px', color: '#ddd', lineHeight: '1.4' }}>
                                                            {options.length > 0 ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                    {options.map((opt, i) => (
                                                                        <div key={i}>{renderOption(opt, eq.type)}</div>
                                                                    ))}
                                                                </div>
                                                            ) : <span style={{ color: '#666' }}>옵션 정보 없음</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 보석 */}
                            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>보석</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {character.gems.length > 0 ? character.gems.map((gem, index) => (
                                        <div key={index} style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', background: '#000', border: `1px solid ${getGradeColor(gem.grade)}` }} title={gem.name}>
                                            <img src={gem.icon} alt={gem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', padding: '1px 3px', borderRadius: '2px 0 0 0' }}>{gem.level}</div>
                                        </div>
                                    )) : <div style={{ color: '#aaa', fontSize: '14px' }}>장착된 보석이 없습니다.</div>}
                                </div>
                            </div>

                            {/* 카드 */}
                            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>카드</h3>
                                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                                    {character.cards.map((card, index) => (
                                        <div key={index} style={{ width: '80px', flexShrink: 0, textAlign: 'center' }}>
                                            <div style={{ width: '80px', height: '110px', borderRadius: '6px', overflow: 'hidden', marginBottom: '5px', border: `1px solid ${getGradeColor(card.grade)}` }}>
                                                <img src={card.icon} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.name}</div>
                                            <div style={{ fontSize: '10px', color: '#ffb74d' }}>{card.awakeCount}각</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    {character.cardEffects.map((effect, idx) => (
                                        <div key={idx} style={{ marginBottom: '5px' }}>
                                            {effect.items.map((item, i) => (
                                                <div key={i} style={{ fontSize: '13px', color: '#81c784' }}>• {item.name}</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}