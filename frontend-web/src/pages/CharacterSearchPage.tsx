import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

// ▼▼▼ [추가됨] 아이덴티티 및 특수 스킬 아이콘 매핑 ▼▼▼
// 툴팁 텍스트에 해당 키워드가 있으면 이 아이콘을 사용합니다.
const IDENTITY_ICONS: { [key: string]: string } = {
    // [바드]
    "세레나데 스킬": "https://cdn-lostark.game.onstove.com/efui_iconatlas/bd_skill/bd_skill_01_19.png", // 유저 제보 URL
    "용맹의 세레나데": "https://cdn-lostark.game.onstove.com/efui_iconatlas/bard_skill/bard_skill_23.png",
    "구원의 세레나데": "https://cdn-lostark.game.onstove.com/efui_iconatlas/bard_skill/bard_skill_22.png",
}

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
    skillIcon?: string;
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
    titleIcon?: string;
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

    const saveSearchTerm = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const removeSearchTerm = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s !== name);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

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

    const getQualityGrade = (quality: number) => {
        if (quality === 100) return { text: '최상', color: '#fdd835' };
        if (quality >= 90) return { text: '특급', color: '#ab47bc' };
        if (quality >= 70) return { text: '상급', color: '#42a5f5' };
        if (quality >= 50) return { text: '중급', color: '#66bb6a' };
        if (quality >= 20) return { text: '하급', color: '#fff59d' };
        return { text: '최하', color: '#ef5350' };
    };

    const getRuneColor = (grade: string) => {
        switch (grade) {
            case '유물': return '#ff8a65';
            case '전설': return '#ffb74d';
            case '영웅': return '#ba68c8';
            case '희귀': return '#4fc3f7';
            case '고급': return '#81c784';
            default: return '#aaa';
        }
    };

    const renderBadge = (grade: string, text: string) => {
        let bgColor = '#444';
        let textColor = '#fff';

        if (grade === '상') {
            bgColor = '#fdd835';
            textColor = '#000';
        } else if (grade === '중') {
            bgColor = '#ab47bc';
            textColor = '#fff';
        } else if (grade === '하') {
            bgColor = '#42a5f5';
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

    const renderOption = (option: string, equipType: string) => {
        const gradeMatch = option.match(/^(상|중|하)\s/);
        if (gradeMatch) {
            const grade = gradeMatch[1];
            return renderBadge(grade, option.substring(1).trim());
        }

        const numberMatch = option.match(/([\d,]+(?:\.\d+)?)/);
        if (numberMatch) {
            const value = parseFloat(numberMatch[1].replace(/,/g, ''));
            const isPercent = option.includes('%');
            let grade = '';

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
                    } else if (option.includes("획득량") || option.includes("아덴")) {
                        if (value >= 6.00) grade = '상';
                        else if (value >= 3.60) grade = '중';
                        else if (value >= 1.60) grade = '하';
                    } else if (option.includes("무기 공격력") || option.includes("무기공격력")) {
                        if (value >= 960) grade = '상';
                        else if (value >= 480) grade = '중';
                        else if (value >= 195) grade = '하';
                    } else if (option.includes("공격력")) {
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

    const parseTooltip = (tooltip: string) => {
        try {
            const json = JSON.parse(tooltip);
            let quality = -1;
            let options: string[] = [];
            let mainStat = "";

            const stripHtml = (html: string) => {
                return html.replace(/<BR>|<br>/gi, '\n').replace(/<[^>]*>/g, '').trim();
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const traverse = (obj: any) => {
                if (!obj) return;

                if (typeof obj === 'object' && obj.type === "ItemTitle" && obj.value?.qualityValue !== undefined) {
                    quality = obj.value.qualityValue;
                }

                if (typeof obj === 'object' && obj.type === "ItemPartBox") {
                    const titleObj = obj.value?.Element_000;
                    const contentObj = obj.value?.Element_001;
                    const titleText = typeof titleObj === 'string' ? stripHtml(titleObj) : "";
                    const contentLines = extractText(contentObj);

                    if (titleText.includes("연마")) {
                        contentLines.forEach(line => {
                            if (line && !line.includes("연마")) {
                                options.push(line);
                            }
                        });
                    }
                    if (titleText.includes("팔찌 효과")) {
                        contentLines.forEach(line => {
                            if (!line.includes("팔찌 효과") && !line.includes("부여 효과")) {
                                options.push(line.replace(/[\[\]]/g, ''));
                            }
                        });
                    }
                    if (titleText.includes("각인 효과")) {
                        contentLines.forEach(line => {
                            const match = line.match(/\[([^\]]+)\]\s*(?:활성도)?\s*\+?\s*(\d+)/);
                            if (match) {
                                options.push(`${match[1]} +${match[2]}`);
                            }
                        });
                    }
                }

                if (typeof obj === 'object' && obj.type === "IndentStringGroup") {
                    const lines = extractText(obj);
                    lines.forEach(line => {
                        const match = line.match(/\[([^\]]+)\]\s*(?:활성도)?\s*\+?\s*(\d+)/);
                        if (match) {
                            options.push(`${match[1]} +${match[2]}`);
                        }
                    });
                }

                if (typeof obj === 'string') {
                    const cleanText = stripHtml(obj);
                    const stats = ["치명", "특화", "신속", "제압", "인내", "숙련"];
                    stats.forEach(stat => {
                        const regex = new RegExp(`${stat}\\s*\\+\\s*(\\d+)`);
                        const match = cleanText.match(regex);
                        if (match) {
                            options.push(`${stat} +${match[1]}`);
                        }
                    });
                    const mainStats = ["힘", "민첩", "지능"];
                    mainStats.forEach(stat => {
                        const regex = new RegExp(`${stat}\\s*\\+\\s*(\\d+)`);
                        const match = cleanText.match(regex);
                        if (match) {
                            if (!mainStat) {
                                mainStat = `${stat} +${match[1]}`;
                            }
                        }
                    });
                    const engravingRegex1 = /\[([^\]]+)\]\s*활성도\s*\+?\s*(\d+)/g;
                    let match1;
                    while ((match1 = engravingRegex1.exec(cleanText)) !== null) {
                        options.push(`${match1[1]} +${match1[2]}`);
                    }
                    const engravingRegex2 = /\[([^\]]+)\]\s*Lv\.(\d+)/g;
                    let match2;
                    while ((match2 = engravingRegex2.exec(cleanText)) !== null) {
                        options.push(`${match2[1]} +${match2[2]}`);
                    }
                }

                if (typeof obj === 'object' && obj.type === "ItemPartBox") {
                    Object.keys(obj.value).forEach(key => {
                        if (key.startsWith("Element_")) {
                            const element = obj.value[key];
                            if (element && typeof element.contentStr === 'string') {
                                const cleanContent = stripHtml(element.contentStr);
                                const match = cleanContent.match(/\[([^\]]+)\]\s*Lv\.(\d+)/);
                                if (match) {
                                    options.push(`${match[1]} +${match[2]}`);
                                }
                            }
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

                if (typeof obj === 'object') {
                    Object.values(obj).forEach(child => traverse(child));
                }
            };

            traverse(json);

            options = options.filter(opt =>
                !opt.includes("체력") &&
                !opt.includes("이동 속도 감소") &&
                !opt.includes("공격 속도 감소") &&
                !opt.includes("방어력 감소")
            );
            options = [...new Set(options)];

            return { quality, options, mainStat };
        } catch {
            return { quality: -1, options: [], mainStat: "" };
        }
    };

    // 보석 딜/쿨 구분 로직 (지원 효과 증가 포함)
    const isDamageGem = (gem: Gem) => {
        return gem.name.includes("겁화") ||
            gem.name.includes("멸화") ||
            (gem.name.includes("광휘") && (
                gem.tooltip.includes("피해") ||
                gem.tooltip.includes("지원") ||
                gem.tooltip.includes("회복")
            ));
    };

    const isCooldownGem = (gem: Gem) => {
        return gem.name.includes("작열") ||
            gem.name.includes("홍염") ||
            (gem.name.includes("광휘") && gem.tooltip.includes("재사용 대기시간"));
    };

    const getGemSummary = () => {
        if (!character?.gems) return null;

        let dmgCount = 0;
        let cdCount = 0;
        let hasGeop = false;
        let hasJak = false;

        character.gems.forEach(gem => {
            if (isDamageGem(gem)) {
                dmgCount++;
                if (gem.name.includes("겁화") || gem.name.includes("광휘")) hasGeop = true;
            } else if (isCooldownGem(gem)) {
                cdCount++;
                if (gem.name.includes("작열") || gem.name.includes("광휘")) hasJak = true;
            }
        });

        const parts = [];
        if (dmgCount > 0) parts.push(`${dmgCount}${hasGeop ? '겁' : '멸'}`);
        if (cdCount > 0) parts.push(`${cdCount}${hasJak ? '작' : '홍'}`);

        if (parts.length === 0) return null;

        return parts.join(' ');
    };

    // [수정] 1레벨 스킬 및 아이덴티티 스킬 매칭 로직 개선 (바드 등 아이덴티티 지원)
    const findSkillIconFallback = (gemTooltip: string, skills: Skill[]): string | null => {
        if (!gemTooltip || !skills) return null;

        let textToSearch = gemTooltip;

        try {
            const json = JSON.parse(gemTooltip);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const extractAllText = (obj: any): string => {
                if (typeof obj === 'string') return obj;
                if (typeof obj === 'object' && obj !== null) {
                    return Object.values(obj).map(extractAllText).join(' ');
                }
                return '';
            };
            textToSearch = extractAllText(json);
        } catch {
            // ignore
        }

        // HTML 태그 제거
        const cleanText = textToSearch.replace(/<[^>]*>/g, '');

        // 1. [우선순위 1] 아이덴티티 스킬 키워드 검색 (세레나데 등)
        for (const [key, url] of Object.entries(IDENTITY_ICONS)) {
            // cleanText에 '세레나데 스킬' 등이 포함되어 있으면 해당 아이콘 반환
            if (cleanText.includes(key)) return url;
        }

        // 2. [우선순위 2] [스킬명] 패턴 추출 (4티어 보석 등)
        const fontMatch = textToSearch.match(/<FONT COLOR='#FFD200'>([^<]+)<\/FONT>/);
        if (fontMatch) {
            const skillName = fontMatch[1].trim();

            // 아이덴티티 체크 한 번 더 (혹시 스킬명에 세레나데가 잡혔을 경우)
            if (IDENTITY_ICONS[skillName]) return IDENTITY_ICONS[skillName];

            const skill = skills.find(s => s.name === skillName);
            if (skill) return skill.icon;
        }

        // 3. [우선순위 3] 일반 스킬 이름 직접 검색 (이름 긴 순서대로)
        const sortedSkills = [...skills].sort((a, b) => b.name.length - a.name.length);
        for (const skill of sortedSkills) {
            if (cleanText.includes(skill.name)) {
                return skill.icon;
            }
        }

        return null;
    };

    const leftEquipOrder = ["투구", "어깨", "상의", "하의", "장갑", "무기"];
    const rightEquipTypes = ["목걸이", "귀걸이", "반지", "어빌리티 스톤", "팔찌"];

    const leftEquipments = character?.equipment
        .filter(eq => leftEquipOrder.includes(eq.type))
        .sort((a, b) => leftEquipOrder.indexOf(a.type) - leftEquipOrder.indexOf(b.type)) || [];

    const rightEquipments = character?.equipment.filter(eq => rightEquipTypes.includes(eq.type)) || [];

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

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>아이템 레벨</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffb74d' }}>{character.itemMaxLevel || character.itemAvgLevel}</div>
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
                        <div style={{ width: '350px', flexShrink: 0 }}>
                            <div style={{ position: 'relative', height: '500px', background: 'url(' + character.characterImage + ') no-repeat center top / cover', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        {character.titleIcon && <img src={character.titleIcon} alt="title icon" style={{ width: '24px', height: '24px' }} />}
                                        <div style={{ color: '#aaa', fontSize: '14px' }}>{character.title}</div>
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '28px', color: '#fff' }}>{character.characterName}</h2>
                                    <div style={{ marginTop: '8px', display: 'inline-block', background: 'var(--primary-color)', padding: '4px 10px', borderRadius: '4px', fontSize: '14px', color: '#fff' }}>{character.characterClassName}</div>
                                </div>
                            </div>

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

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                {/* 왼쪽 컬럼: 장비 (무기, 방어구) + 스킬 */}
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

                                    {/* 장착 스킬 목록 (2열 배치) - [수정] 2레벨 이상 or 룬/각성기만 필터링하여 표시 */}
                                    <h3 style={{ margin: '20px 0 15px 0', fontSize: '18px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>스킬</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                        {character.skills
                                            // 화면에 표시할 때는 2레벨 이상 스킬만 보여줌 (깔끔하게)
                                            .filter(skill => skill.level >= 2 || skill.runeName || skill.isAwakening)
                                            .sort((a, b) => b.level - a.level)
                                            .map((skill, index) => (
                                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                                                    <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                                        <img src={skill.icon} alt={skill.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '9px', padding: '0 2px', borderRadius: '2px' }}>
                                                            {skill.level}
                                                        </div>
                                                    </div>
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {skill.name}
                                                        </div>
                                                        {skill.runeName && (
                                                            <div style={{ fontSize: '11px', color: getRuneColor(skill.runeGrade), display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                <img src={skill.runeIcon} alt="" style={{ width: '12px', height: '12px' }} />
                                                                {skill.runeName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* 오른쪽 컬럼: 악세서리, 팔찌, 돌 */}
                                <div style={{ flex: 1.2, background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>악세서리 & 특수장비</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {rightEquipments.map((eq, index) => {
                                            const { quality, options, mainStat } = parseTooltip(eq.tooltip);
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

                            {/* 보석 섹션 (11열 그리드 + 스킬 아이콘 2중 매칭 + 정렬 개선) */}
                            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    보석
                                    <span style={{ fontSize: '13px', color: '#aaa', fontWeight: 'normal' }}>{getGemSummary()}</span>
                                </h3>
                                {character.gems.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: '5px' }}>
                                        {character.gems
                                            .sort((a, b) => {
                                                // [수정] 정렬 로직: 1. 딜(붉은색) 우선  2. 레벨 높은 순  3. 이름 순 (묶기 위해)
                                                const isDmgA = isDamageGem(a);
                                                const isDmgB = isDamageGem(b);
                                                if (isDmgA && !isDmgB) return -1;
                                                if (!isDmgA && isDmgB) return 1;
                                                if (b.level !== a.level) return b.level - a.level;
                                                return a.name.localeCompare(b.name);
                                            })
                                            .map((gem, index) => {
                                                const isDmg = isDamageGem(gem);
                                                const bgColor = isDmg ? 'rgba(255, 87, 34, 0.15)' : 'rgba(33, 150, 243, 0.15)';

                                                // [수정] 2중 매칭 로직: 백엔드 아이콘 우선 -> 없으면 프론트엔드 폴백
                                                let skillIcon = gem.skillIcon;
                                                if (!skillIcon) {
                                                    skillIcon = findSkillIconFallback(gem.tooltip, character.skills) || undefined;
                                                }

                                                return (
                                                    <div key={index} style={{
                                                        position: 'relative',
                                                        width: '100%',
                                                        aspectRatio: '1/1',
                                                        borderRadius: '6px',
                                                        overflow: 'hidden',
                                                        background: bgColor,
                                                        border: `1px solid ${getGradeColor(gem.grade)}`,
                                                        padding: '2px'
                                                    }} title={gem.name}>
                                                        {/* 메인 보석 아이콘 */}
                                                        <img src={gem.icon} alt={gem.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />

                                                        {/* 보석 레벨 (우측 하단) */}
                                                        <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '11px', padding: '1px 4px', borderRadius: '4px 0 0 0' }}>{gem.level}</div>

                                                        {/* 스킬 아이콘 오버레이 (좌측 하단) */}
                                                        {skillIcon && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: '2px',
                                                                left: '2px',
                                                                width: '18px',
                                                                height: '18px',
                                                                borderRadius: '3px',
                                                                overflow: 'hidden',
                                                                border: '1px solid rgba(0,0,0,0.6)',
                                                                zIndex: 2
                                                            }}>
                                                                <img src={skillIcon} alt="skill" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <div style={{ color: '#aaa', fontSize: '14px' }}>장착된 보석이 없습니다.</div>
                                )}
                            </div>

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