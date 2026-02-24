import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const IDENTITY_ICONS: { [key: string]: string } = {
    "세레나데 스킬": "https://cdn-lostark.game.onstove.com/efui_iconatlas/bd_skill/bd_skill_01_19.png",
    "용맹의 세레나데": "https://cdn-lostark.game.onstove.com/efui_iconatlas/bard_skill/bard_skill_23.png",
    "구원의 세레나데": "https://cdn-lostark.game.onstove.com/efui_iconatlas/bard_skill/bard_skill_22.png",
}

const CLASS_IMAGE_MAP: { [key: string]: string } = {
    "버서커": "berserker",
    "디스트로이어": "destroyer",
    "워로드": "warlord",
    "홀리나이트": "holyknight",
    "슬레이어": "slayer",
    "아르카나": "arcana",
    "서머너": "summoner",
    "바드": "bard",
    "소서리스": "sorceress",
    "배틀마스터": "battlemaster",
    "인파이터": "infighter",
    "기공사": "soulmaster",
    "창술사": "lancemaster",
    "스트라이커": "striker",
    "브레이커": "breaker",
    "블레이드": "blade",
    "데모닉": "demonic",
    "리퍼": "reaper",
    "소울이터": "souleater",
    "호크아이": "hawkeye",
    "데빌헌터": "devilhunter",
    "블래스터": "blaster",
    "스카우터": "scouter",
    "건슬링어": "gunslinger",
    "도화가": "artist",
    "기상술사": "aeromancer"
};

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

interface Tripod {
    tier: number;
    slot: number;
    name: string;
    icon: string;
    level: number;
    isSelected: boolean;
}

interface Skill {
    name: string;
    icon: string;
    level: number;
    type: string;
    isAwakening: boolean;
    tripods: Tripod[];
    runeName: string;
    runeIcon: string;
    runeGrade: string;
    tooltip: string; // 🌟 툴팁 필드 추가
}

interface ArkPassivePoint {
    name: string;
    value: number;
    rank: number;
    level: number;
    tooltip: string; // 🌟 툴팁 필드 추가
}

interface ArkPassive {
    isArkPassive: boolean;
    points: ArkPassivePoint[];
    title?: string;
    effects?: { name: string; icon: string; description: string; tooltip: string }[];
}

interface T4Engraving {
    name: string;
    description: string;
    level: number;
    grade: string;
}

interface ArkGrid {
    coreType: string;
    effectName: string;
    point: number;
    icon: string;
    tooltip: string; // 🌟 툴팁 필드 추가
    gems?: { // 🌟 gems 필드 추가
        index: number;
        icon: string;
        isActive: boolean;
        grade: string;
        tooltip: string;
    }[];
}

interface ArkGridEffect { // 🌟 아크 그리드 효과 인터페이스 추가
    name: string;
    level: number;
    tooltip: string;
}

interface CharacterSummary { // 🌟 원정대 캐릭터 요약 정보 인터페이스 추가
    serverName: string;
    characterName: string;
    characterLevel: number;
    characterClassName: string;
    itemAvgLevel: string;
    itemMaxLevel: string;
    characterImage?: string; // 🌟 캐릭터 이미지 추가
}

interface CharacterInfo {
    serverName: string;
    characterName: string;
    characterLevel: number;
    characterClassName: string;
    itemAvgLevel: string;
    itemMaxLevel: string;
    combatPower?: string;
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
    arkPassive?: ArkPassive;
    t4Engravings?: T4Engraving[];
    arkGrids?: ArkGrid[];
    arkGridEffects?: ArkGridEffect[]; // 🌟 아크 그리드 효과 리스트 추가
    siblings?: CharacterSummary[]; // 🌟 원정대 캐릭터 목록 추가
}

// 🌟 직업 이미지 URL 가져오는 함수 (외부로 이동)
const getClassImage = (className: string) => {
    const engName = CLASS_IMAGE_MAP[className];
    if (!engName) return '';
    return `https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/${engName}.png`;
};

// 🌟 캐릭터 카드 컴포넌트 분리
const CharacterCard = ({ sibling, onClick }: { sibling: CharacterSummary, onClick: (name: string) => void }) => {
    const [imageError, setImageError] = useState(false);
    const hasImage = !!sibling.characterImage;

    return (
        <div 
             onClick={() => onClick(sibling.characterName)}
             style={{
                position: 'relative',
                height: '400px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                background: 'var(--bg-card)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
             }}
             onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'translateY(-5px)';
                 e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.5)';
                 e.currentTarget.style.borderColor = 'var(--primary-color)';
             }}
             onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'none';
                 e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
                 e.currentTarget.style.borderColor = 'var(--border-color)';
             }}
        >
            {hasImage && !imageError ? (
                <img 
                    src={sibling.characterImage}
                    alt={sibling.characterName}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        transition: 'transform 0.3s'
                    }}
                    onError={() => setImageError(true)}
                />
            ) : (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1a1a1a',
                    color: '#888',
                    fontSize: '14px',
                    flexDirection: 'column'
                }}>
                    <span>이미지를 불러올 수 없습니다</span>
                </div>
            )}

            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{
                        fontSize: '11px', 
                        background: 'var(--primary-color)', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        color: '#fff',
                        fontWeight: 'bold'
                    }}>{sibling.serverName}</span>
                    <span style={{fontSize: '12px', color: '#ccc'}}>Lv.{sibling.characterLevel}</span>
                </div>
                
                <div style={{
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#fff', 
                    margin: '4px 0',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}>
                    {sibling.characterName}
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px'}}>
                    <span style={{fontSize: '13px', color: '#ddd'}}>{sibling.characterClassName}</span>
                    <span style={{fontSize: '15px', fontWeight: 'bold', color: '#ffb74d'}}>
                        {sibling.itemAvgLevel}
                    </span>
                </div>
            </div>
        </div>
    );
};

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
                console.error(e)
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
        setActiveTab('전체'); // 🌟 검색 시 전체 탭으로 이동

        try {
            const response = await axios.get(`http://localhost:8080/api/v1/characters/${name}`);
            if (response.data) {
                setCharacter(response.data);
                saveSearchTerm(name);
            } else {
                setError(true);
            }
        } catch (err) {
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
            case '고대':
                return '#e7b9ff';
            case '유물':
                return '#ff8a65';
            case '전설':
                return '#ffb74d';
            case '영웅':
                return '#ba68c8';
            case '희귀':
                return '#4fc3f7';
            case '고급':
                return '#81c784';
            default:
                return '#e0e0e0';
        }
    };

    const getQualityGrade = (quality: number) => {
        if (quality === 100) return {text: '최상', color: '#fdd835'};
        if (quality >= 90) return {text: '특급', color: '#ab47bc'};
        if (quality >= 70) return {text: '상급', color: '#42a5f5'};
        if (quality >= 50) return {text: '중급', color: '#66bb6a'};
        if (quality >= 20) return {text: '하급', color: '#fff59d'};
        return {text: '최하', color: '#ef5350'};
    };

    const getRuneColor = (grade: string) => {
        switch (grade) {
            case '유물':
                return '#ff8a65';
            case '전설':
                return '#ffb74d';
            case '영웅':
                return '#ba68c8';
            case '희귀':
                return '#4fc3f7';
            case '고급':
                return '#81c784';
            default:
                return '#aaa';
        }
    };

    const renderBadge = (grade: string, text: string) => {
        let bgColor = '#444';
        let textColor = '#fff';

        if (grade === '최상') {
            bgColor = '#FA5D00';
            textColor = '#fff';
        } else if (grade === '상') {
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
            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span style={{
                    background: bgColor,
                    color: textColor,
                    padding: '1px 4px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    flexShrink: 0
                }}>{grade}</span>
                <span>{text}</span>
            </div>
        );
    };

    const renderOption = (option: string, equipType: string) => {
        const gradeMatch = option.match(/^(최상|상|중|하)\s(.*)/);

        if (gradeMatch) {
            const grade = gradeMatch[1];
            const text = gradeMatch[2].trim();

            const basicStatMatch = text.match(/^(치명|특화|신속|제압|인내|숙련)\s*\+?\s*(\d+)/);
            if (basicStatMatch) {
                let valColor = '#fff';
                if (grade === '최상') valColor = '#FA5D00';
                else if (grade === '상') valColor = '#FE9600';
                else if (grade === '중') valColor = '#CE43FC';
                else if (grade === '하') valColor = '#00B5FF';

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{basicStatMatch[1]}</span>
                        <span style={{ color: valColor, fontWeight: 'bold' }}>+{basicStatMatch[2]}</span>
                    </div>
                );
            }

            return renderBadge(grade, text);
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
            let abilityEngravings: { name: string, level: number, isPenalty: boolean }[] = [];

            const stripHtml = (html: string) => html.replace(/<BR>|<br>/gi, '\n').replace(/<[^>]*>/g, '').trim();

            const extractText = (obj: any): string[] => {
                if (typeof obj === 'string') return stripHtml(obj).split('\n').map(s => s.trim()).filter(s => s);
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
                if (typeof obj === 'object' && obj.type === "ItemTitle" && obj.value?.qualityValue !== undefined) quality = obj.value.qualityValue;

                if (typeof obj === 'object' && obj.type === "ItemPartBox") {
                    const titleObj = obj.value?.Element_000;
                    const contentObj = obj.value?.Element_001;
                    const titleText = typeof titleObj === 'string' ? stripHtml(titleObj) : "";
                    const contentLines = extractText(contentObj);

                    if (titleText.includes("팔찌 효과")) {
                        const rawStr = typeof contentObj === 'string' ? contentObj : "";
                        const lines = rawStr.split(/<BR>|<br>/gi).map(s => s.trim()).filter(s => s);

                        let currentOpt = "";
                        let currentGrade = "";

                        lines.forEach(line => {
                            if (line.includes("<img")) {
                                if (currentOpt) {
                                    options.push(currentGrade ? `${currentGrade} ${currentOpt}` : currentOpt);
                                }
                                currentOpt = stripHtml(line);
                                currentGrade = "";

                                if (line.includes('#FA5D00')) currentGrade = "최상";
                                else if (line.includes('#FE9600')) currentGrade = "상";
                                else if (line.includes('#CE43FC')) currentGrade = "중";
                                else if (line.includes('#00B5FF')) currentGrade = "하";
                            } else {
                                currentOpt += (currentOpt ? " " : "") + stripHtml(line);
                            }
                        });
                        if (currentOpt) {
                            options.push(currentGrade ? `${currentGrade} ${currentOpt}` : currentOpt);
                        }
                    }
                    else if (titleText.includes("연마") || titleText.includes("각인 효과")) {
                        contentLines.forEach(line => {
                            if (!line.includes("연마") && !line.includes("부여 효과")) {
                                const cleanLine = line.replace(/[\[\]]/g, '');
                                const match = cleanLine.match(/(.+?)\s*(?:활성도)?\s*\+?\s*(\d+)/);
                                if (match && titleText.includes("각인")) options.push(`${match[1]} +${match[2]}`);
                                else options.push(cleanLine);
                            }
                        });
                    }
                }

                if (typeof obj === 'object' && obj.type === "IndentStringGroup") {
                    const topStr = obj.value?.Element_000?.topStr || "";
                    if (topStr.includes("무작위 각인 효과")) {
                        const contentStrs = obj.value?.Element_000?.contentStr || {};
                        Object.values(contentStrs).forEach((item: any) => {
                            const str = item.contentStr;
                            if (str) {
                                const nameMatch = str.match(/\[<FONT COLOR='#[^>]+'>([^<]+)<\/FONT>\]/);
                                const levelMatch = str.match(/Lv\.(\d+)/);
                                const isPenalty = str.includes("FE2E2E");

                                if (nameMatch && levelMatch) {
                                    abilityEngravings.push({
                                        name: nameMatch[1],
                                        level: parseInt(levelMatch[1], 10),
                                        isPenalty: isPenalty
                                    });
                                }
                            }
                        });
                    }
                }

                if (typeof obj === 'string') {
                    const cleanText = stripHtml(obj);
                    const mainStats = ["힘", "민첩", "지능"];
                    mainStats.forEach(stat => {
                        const regex = new RegExp(`${stat}\\s*\\+\\s*(\\d+)`);
                        const match = cleanText.match(regex);
                        if (match && !mainStat) mainStat = `${stat} +${match[1]}`;
                    });
                }
                if (typeof obj === 'object') Object.values(obj).forEach(child => traverse(child));
            };
            traverse(json);

            options = options.filter(opt =>
                !opt.includes("체력") &&
                !opt.includes("이동 속도 감소") &&
                !opt.includes("공격 속도 감소") &&
                !opt.includes("방어력 감소")
            );
            options = [...new Set(options)];

            return {quality, options, mainStat, abilityEngravings};
        } catch {
            return {quality: -1, options: [], mainStat: "", abilityEngravings: []};
        }
    };

    const parseSkillTooltip = (tooltip: string) => {
        try {
            const json = JSON.parse(tooltip);
            const attributes: { [key: string]: string } = {};

            const traverse = (obj: any) => {
                if (!obj) return;

                if (obj.type === "SingleTextBox" && obj.value) {
                    // 🌟 텍스트 정제 로직 개선
                    let text = obj.value.replace(/<BR>|<br>/gi, ' | ');
                    text = text.replace(/<[^>]*>/g, ' '); // 태그를 공백으로 치환하여 단어 붙음 방지
                    text = text.replace(/\s+/g, ' ').trim(); // 연속된 공백 제거

                    // 정규식으로 각 속성 추출
                    const staggerMatch = text.match(/무력화\s*:\s*(최상|상|중|하)/);
                    if (staggerMatch) attributes['Stagger'] = staggerMatch[1];

                    const destMatch = text.match(/(?:부위\s*)?파괴\s*:\s*(?:레벨\s*)?(\d+)/);
                    if (destMatch) attributes['Destruction'] = `Lv.${destMatch[1]}`;

                    if (text.includes("슈퍼아머")) {
                        const saMatch = text.match(/슈퍼아머\s*:\s*([^|]+)/);
                        if (saMatch) {
                            let saValue = saMatch[1].trim();
                            // 다음 속성이 시작되기 전까지만 자르기 (예: "경직 면역 | 공격 타입...")
                            const nextAttrIndex = saValue.search(/(?:무력화|파괴|공격\s*타입|카운터)\s*:/);
                            if (nextAttrIndex > 0) {
                                saValue = saValue.substring(0, nextAttrIndex).trim();
                            }
                            // 파이프(|)가 포함되어 있다면 그 전까지만
                            if (saValue.includes('|')) {
                                saValue = saValue.split('|')[0].trim();
                            }
                            attributes['SuperArmor'] = saValue;
                        }
                    }

                    if (text.includes("헤드 어택")) attributes['HeadAttack'] = "가능";
                    if (text.includes("백 어택")) attributes['BackAttack'] = "가능";
                    if (text.includes("카운터")) attributes['Counter'] = "가능";
                }

                if (typeof obj === 'object') {
                    Object.values(obj).forEach(child => traverse(child));
                }
            };

            traverse(json);
            return attributes;
        } catch {
            return {};
        }
    };

    const isCooldownGem = (gem: Gem) => {
        if (!gem.tooltip) return false;
        return gem.tooltip.includes("재사용 대기시간");
    };

    const isDamageGem = (gem: Gem) => {
        return !isCooldownGem(gem);
    };

    const getGemSummary = () => {
        if (!character?.gems) return null;

        let dmgCount = 0;
        let cdCount = 0;
        let hasGeop = false;
        let hasJak = false;

        character.gems.forEach(gem => {
            if (isCooldownGem(gem)) {
                cdCount++;
                if (gem.name.includes("작열") || gem.name.includes("광휘")) hasJak = true;
            } else {
                dmgCount++;
                if (gem.name.includes("겁화") || gem.name.includes("광휘")) hasGeop = true;
            }
        });

        const parts = [];
        if (dmgCount > 0) parts.push(`${dmgCount}${hasGeop ? '겁' : '멸'}`);
        if (cdCount > 0) parts.push(`${cdCount}${hasJak ? '작' : '홍'}`);

        return parts.length === 0 ? null : parts.join(' ');
    };

    const findSkillIconFallback = (gemTooltip: string, skills: Skill[]): string | null => {
        if (!gemTooltip || !skills) return null;
        let textToSearch = gemTooltip;
        try {
            const json = JSON.parse(gemTooltip);
            const extractAllText = (obj: any): string => {
                if (typeof obj === 'string') return obj;
                if (typeof obj === 'object' && obj !== null) return Object.values(obj).map(extractAllText).join(' ');
                return '';
            };
            textToSearch = extractAllText(json);
        } catch {
        }

        const cleanText = textToSearch.replace(/<[^>]*>/g, '');
        for (const [key, url] of Object.entries(IDENTITY_ICONS)) {
            if (cleanText.includes(key)) return url;
        }

        const fontMatch = textToSearch.match(/<FONT COLOR='#FFD200'>([^<]+)<\/FONT>/);
        if (fontMatch) {
            const skillName = fontMatch[1].trim();
            if (IDENTITY_ICONS[skillName]) return IDENTITY_ICONS[skillName];
            const skill = skills.find(s => s.name === skillName);
            if (skill) return skill.icon;
        }

        const sortedSkills = [...skills].sort((a, b) => b.name.length - a.name.length);
        for (const skill of sortedSkills) {
            if (cleanText.includes(skill.name)) return skill.icon;
        }

        return null;
    };

    const renderArkPassivePoints = () => {
        if (!character?.arkPassive?.points || character.arkPassive.points.length === 0) return null;

        const getTypeStyle = (name: string) => {
            if (name === '진화') return {color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', border: '#eab308'};
            if (name === '깨달음') return {color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6'};
            if (name === '도약') return {color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e'};
            return {color: '#aaa', bg: '#333', border: '#555'};
        };

        const getIconUrl = (name: string) => {
            if (name === '진화') return 'https://static.lo4.app/icons/arkpassive_evolution.png';
            if (name === '깨달음') return 'https://static.lo4.app/icons/arkpassive_enlightenment.png';
            if (name === '도약') return 'https://static.lo4.app/icons/arkpassive_leap.png';
            return '';
        };

        return (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px'}}>
                {character.arkPassive.points.map((point, idx) => {
                    const style = getTypeStyle(point.name);
                    const iconUrl = getIconUrl(point.name);

                    return (
                        <div key={idx} style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 6px',
                                borderRadius: '8px',
                                border: `1px solid ${style.border}`,
                                background: 'var(--bg-card)',
                                color: style.color,
                                whiteSpace: 'nowrap'
                            }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        flexShrink: 0,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <img src={iconUrl} alt={point.name}
                                             style={{width: '100%', height: '100%', objectFit: 'contain'}}/>
                                    </div>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        letterSpacing: '-0.5px'
                                    }}>{point.name}</span>
                                </div>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    background: style.bg,
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    color: style.color
                                }}>
                                    {point.value}
                                </span>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                fontSize: '11px',
                                color: '#888',
                                whiteSpace: 'nowrap',
                                letterSpacing: '-0.5px'
                            }}>
                                {point.rank}랭크 {point.level}레벨
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderArkPassiveTab = () => {
        if (!character?.arkPassive) return <div style={{textAlign: 'center', color: '#aaa', padding: '20px'}}>아크패시브 정보가 없습니다.</div>;

        const { points, effects } = character.arkPassive;

        // 🌟 아크패시브 포인트 요약 (진화, 깨달음, 도약)
        const pointSummary = points.reduce((acc, p) => {
            acc[p.name] = p.value;
            return acc;
        }, {} as Record<string, number>);

        // 🌟 효과 그룹화 (타입 -> 티어)
        const effectsByTypeAndTier: Record<string, Record<number, typeof effects>> = {
            '진화': {},
            '깨달음': {},
            '도약': {}
        };

        if (effects) {
            effects.forEach(effect => {
                let type = '';
                if (effect.description.includes('진화')) type = '진화';
                else if (effect.description.includes('깨달음')) type = '깨달음';
                else if (effect.description.includes('도약')) type = '도약';

                if (type) {
                    const tierMatch = effect.description.match(/(\d+)티어/);
                    const tier = tierMatch ? parseInt(tierMatch[1], 10) : 99; // 99 for unknown/other

                    if (!effectsByTypeAndTier[type][tier]) {
                        effectsByTypeAndTier[type][tier] = [];
                    }
                    effectsByTypeAndTier[type][tier].push(effect);
                }
            });
        }

        const getTypeColor = (type: string) => {
            if (type === '진화') return '#eab308';
            if (type === '깨달음') return '#3b82f6';
            if (type === '도약') return '#22c55e';
            return '#aaa';
        };

        const getTypeBg = (type: string) => {
            if (type === '진화') return 'rgba(234, 179, 8, 0.1)';
            if (type === '깨달음') return 'rgba(59, 130, 246, 0.1)';
            if (type === '도약') return 'rgba(34, 197, 94, 0.1)';
            return 'rgba(255, 255, 255, 0.05)';
        };

        return (
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                {/* 포인트 요약 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {['진화', '깨달음', '도약'].map(type => (
                        <div key={type} style={{
                            background: 'var(--bg-card)',
                            border: `1px solid ${getTypeColor(type)}`,
                            borderRadius: '12px',
                            padding: '15px 25px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: `0 0 10px ${getTypeBg(type)}`
                        }}>
                            <img 
                                src={type === '진화' ? 'https://static.lo4.app/icons/arkpassive_evolution.png' : 
                                     type === '깨달음' ? 'https://static.lo4.app/icons/arkpassive_enlightenment.png' : 
                                     'https://static.lo4.app/icons/arkpassive_leap.png'} 
                                alt={type}
                                style={{ width: '24px', height: '24px' }}
                            />
                            <span style={{ fontWeight: 'bold', color: getTypeColor(type), fontSize: '18px' }}>{type}</span>
                            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{pointSummary[type] || 0}</span>
                        </div>
                    ))}
                </div>

                {/* 효과 목록 (3열 레이아웃) */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', // 3열 고정
                    gap: '20px',
                    alignItems: 'start' // 상단 정렬
                }}>
                    {['진화', '깨달음', '도약'].map(type => {
                        const tiers = Object.keys(effectsByTypeAndTier[type]).map(Number).sort((a, b) => a - b);
                        
                        return (
                            <div key={type} style={{
                                background: 'var(--bg-card)',
                                borderRadius: '12px',
                                padding: '20px',
                                border: `1px solid ${getTypeColor(type)}`,
                                minHeight: '200px'
                            }}>
                                <h3 style={{ 
                                    color: getTypeColor(type), 
                                    borderBottom: `1px solid ${getTypeColor(type)}`, 
                                    paddingBottom: '10px', 
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '20px'
                                }}>
                                    <img 
                                        src={type === '진화' ? 'https://static.lo4.app/icons/arkpassive_evolution.png' : 
                                             type === '깨달음' ? 'https://static.lo4.app/icons/arkpassive_enlightenment.png' : 
                                             'https://static.lo4.app/icons/arkpassive_leap.png'} 
                                        alt={type}
                                        style={{ width: '24px', height: '24px' }}
                                    />
                                    {type}
                                </h3>
                                
                                {tiers.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {tiers.map(tier => (
                                            <div key={tier}>
                                                {tier !== 99 && (
                                                    <div style={{ 
                                                        fontSize: '14px', 
                                                        color: '#aaa', 
                                                        marginBottom: '8px', 
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <span style={{ 
                                                            display: 'inline-block', 
                                                            width: '4px', 
                                                            height: '12px', 
                                                            background: getTypeColor(type),
                                                            borderRadius: '2px'
                                                        }}></span>
                                                        Tier {tier}
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {effectsByTypeAndTier[type][tier].map((effect, idx) => {
                                                        const cleanDesc = effect.description.replace(/<[^>]*>/g, '');
                                                        const nameMatch = cleanDesc.match(/\d+티어\s+(.+)/);
                                                        const displayName = nameMatch ? nameMatch[1] : cleanDesc;

                                                        // 레벨 추출 (예: "중력 충격 Lv.1" -> "Lv.1")
                                                        const levelMatch = displayName.match(/Lv\.(\d+)/);
                                                        const level = levelMatch ? levelMatch[1] : "";
                                                        const nameOnly = displayName.replace(/Lv\.\d+/, '').trim();

                                                        return (
                                                            <div key={idx} style={{
                                                                background: getTypeBg(type),
                                                                border: `1px solid ${getTypeColor(type)}`,
                                                                borderRadius: '8px',
                                                                padding: '10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px'
                                                            }}>
                                                                <div style={{
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    borderRadius: '6px',
                                                                    overflow: 'hidden',
                                                                    border: '1px solid #000',
                                                                    flexShrink: 0
                                                                }}>
                                                                    <img src={effect.icon} alt={effect.name} style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />
                                                                </div>
                                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                        {nameOnly}
                                                                    </div>
                                                                    {level && (
                                                                        <div style={{ fontSize: '12px', color: getTypeColor(type), fontWeight: 'bold' }}>
                                                                            Lv.{level}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>활성화된 효과 없음</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // 🌟 젬 툴팁 파싱 함수 추가
    const parseArkGridGemTooltip = (tooltip: string) => {
        try {
            const json = JSON.parse(tooltip);
            let description = "";
            const traverse = (obj: any) => {
                if (!obj) return;
                if (obj.type === "ItemPartBox" && obj.value) {
                    const title = obj.value.Element_000;
                    if (typeof title === 'string' && title.replace(/<[^>]*>/g, '').trim() === "젬 효과") {
                        description = obj.value.Element_001;
                    }
                }
                if (typeof obj === 'object') {
                    Object.values(obj).forEach(child => traverse(child));
                }
            };
            traverse(json);
            return description;
        } catch {
            return "";
        }
    };

    const parseArkGridTooltip = (tooltip: string) => {
        try {
            const json = JSON.parse(tooltip);
            let description = "";
            
            const traverse = (obj: any) => {
                if (!obj) return;
                if (obj.type === "ItemPartBox" && obj.value) {
                    const title = obj.value.Element_000;
                    if (typeof title === 'string' && title.replace(/<[^>]*>/g, '').trim() === "코어 옵션") {
                        description = obj.value.Element_001;
                    }
                }
                if (typeof obj === 'object') {
                    Object.values(obj).forEach(child => traverse(child));
                }
            };
            
            traverse(json);
            return description;
        } catch {
            return "";
        }
    };

    const parseArkGridEffectsWithPoints = (html: string) => {
        if (!html) return [];
        const lines = html.split(/<br\s*\/?>/gi);
        
        return lines.map(line => {
            const cleanText = line.replace(/<[^>]+>/g, '').trim();
            if (!cleanText) return null;

            const match = cleanText.match(/^\[(\d+)P\]/);
            let requiredPoint = 0;
            
            if (match) {
                requiredPoint = parseInt(match[1], 10);
            }

            return {
                requiredPoint,
                text: cleanText
            };
        }).filter((item): item is { requiredPoint: number, text: string } => item !== null);
    };

    const formatArkGridEffects = (html: string) => {
        if (!html) return [];
        let text = html.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<[^>]+>/g, '');
        return text.split('\n').map(line => line.trim()).filter(line => line);
    };

    const renderArkGridTab = () => {
        if (!character?.arkGrids || character.arkGrids.length === 0) {
            return <div style={{textAlign: 'center', color: '#aaa', padding: '20px'}}>아크 그리드 정보가 없습니다.</div>;
        }

        const leftOrder = ["공격력", "보스 피해", "추가 피해"];
        const rightOrder = ["아군 공격 강화", "아군 피해 강화", "낙인력"];

        const effects = character.arkGridEffects || [];
        
        const leftEffects = effects
            .filter(e => leftOrder.includes(e.name))
            .sort((a, b) => leftOrder.indexOf(a.name) - leftOrder.indexOf(b.name));
        
        const rightEffects = effects
            .filter(e => rightOrder.includes(e.name))
            .sort((a, b) => rightOrder.indexOf(a.name) - rightOrder.indexOf(b.name));

        const otherEffects = effects.filter(e => !leftOrder.includes(e.name) && !rightOrder.includes(e.name));

        const getEffectValue = (tooltip: string) => {
            const match = tooltip.match(/<font color='#ffd200'>(.*?)<\/font>/);
            return match ? match[1] : '';
        };

        const renderEffectItem = (effect: ArkGridEffect, idx: number) => (
            <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '10px 15px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: '#ddd', fontSize: '14px', fontWeight: 'bold' }}>{effect.name}</span>
                    <span style={{ color: '#666', fontSize: '12px' }}>Lv.{effect.level}</span>
                </div>
                <span style={{ color: '#FFD200', fontWeight: 'bold', fontSize: '16px' }}>{getEffectValue(effect.tooltip)}</span>
            </div>
        );

        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                {/* 🌟 아크 그리드 효과 요약 */}
                {effects.length > 0 && (
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                            아크 그리드 효과 합계
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {leftEffects.map((e, i) => renderEffectItem(e, i))}
                                {otherEffects.map((e, i) => renderEffectItem(e, i + leftEffects.length))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {rightEffects.map((e, i) => renderEffectItem(e, i))}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '20px'
                }}>
                    {character.arkGrids.map((grid, idx) => {
                        const tooltipText = parseArkGridTooltip(grid.tooltip);
                        const effects = parseArkGridEffectsWithPoints(tooltipText);

                        return (
                            <div key={idx} style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '15px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '1px solid #333',
                                        flexShrink: 0
                                    }}>
                                        <img src={grid.icon} alt={grid.effectName} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    </div>
                                    <div style={{flex: 1, overflow: 'hidden'}}>
                                        <div style={{fontSize: '12px', color: '#aaa', marginBottom: '2px'}}>{grid.coreType}</div>
                                        <div style={{fontSize: '16px', fontWeight: 'bold', color: '#f97316', marginBottom: '4px'}}>{grid.effectName}</div>
                                        <div style={{
                                            display: 'inline-block',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            color: '#fff'
                                        }}>
                                            {grid.point}P
                                        </div>
                                    </div>
                                </div>
                                
                                {effects.length > 0 && (
                                    <div style={{
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        fontSize: '13px',
                                        lineHeight: '1.5'
                                    }}>
                                        {effects.map((effect, i) => {
                                            const isActive = grid.point >= effect.requiredPoint;
                                            const pointMatch = effect.text.match(/^\[\d+P\]/);
                                            const pointText = pointMatch ? pointMatch[0] : '';
                                            const descText = pointMatch ? effect.text.substring(pointText.length) : effect.text;

                                            return (
                                                <div key={i} style={{
                                                    marginBottom: '4px',
                                                    color: isActive ? '#ddd' : 'rgba(255, 255, 255, 0.3)',
                                                }}>
                                                    {isActive && pointText ? (
                                                        <span style={{color: '#FFD200', fontWeight: 'bold'}}>{pointText}</span>
                                                    ) : (
                                                        <span>{pointText}</span>
                                                    )}
                                                    <span>{descText}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* 🌟 보석 렌더링 추가 */}
                                {grid.gems && grid.gems.length > 0 && (
                                    <div style={{
                                        marginTop: '5px',
                                        paddingTop: '10px',
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}>
                                        <div style={{fontSize: '12px', fontWeight: 'bold', color: '#aaa'}}>장착된 젬</div>
                                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px'}}>
                                            {grid.gems.map((gem, gIdx) => {
                                                const gemEffect = parseArkGridGemTooltip(gem.tooltip);
                                                const gemEffects = formatArkGridEffects(gemEffect);
                                                
                                                return (
                                                    <div key={gIdx} style={{
                                                        display: 'flex',
                                                        gap: '10px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border: `1px solid ${getGradeColor(gem.grade)}`,
                                                        alignItems: 'center'
                                                    }}>
                                                        <div style={{
                                                            width: '32px', 
                                                            height: '32px', 
                                                            flexShrink: 0,
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                            border: '1px solid #333'
                                                        }}>
                                                            <img src={gem.icon} alt="gem" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                        </div>
                                                        <div style={{fontSize: '12px', color: '#ddd', lineHeight: '1.3'}}>
                                                            {gemEffects.map((line, i) => (
                                                                <div key={i}>{line}</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderSiblingsTab = () => {
        if (!character?.siblings || character.siblings.length === 0) {
            return <div style={{textAlign: 'center', color: '#aaa', padding: '20px'}}>원정대 캐릭터 정보가 없습니다.</div>;
        }

        // 레벨 높은 순으로 정렬
        const sortedSiblings = [...character.siblings].sort((a, b) => {
            const getLevel = (val: string) => {
                if (!val) return 0;
                return parseFloat(val.replace(/,/g, '')) || 0;
            };
            const levelA = getLevel(a.itemAvgLevel);
            const levelB = getLevel(b.itemAvgLevel);
            return levelB - levelA;
        });

        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)', // 🌟 4열 고정
                gap: '15px',
                padding: '20px',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {sortedSiblings.map((sibling, idx) => (
                    <CharacterCard key={idx} sibling={sibling} onClick={handleRecentClick} />
                ))}
            </div>
        );
    };

    const getAggregatedCardEffects = () => {
        if (!character?.cardEffects) return { stats: [], specials: [] };

        const statsMap: Record<string, { statName: string, value: number, unit: string }> = {};
        const specials = new Set<string>();

        character.cardEffects.forEach(effect => {
            effect.items.forEach(item => {
                const desc = item.description.replace(/<[^>]*>?/gm, '').trim();
                const lines = desc.split(/<br>|\n/i);

                lines.forEach(line => {
                    const cl = line.trim();
                    if (!cl) return;

                    const match = cl.match(/^(.*?)\s*([+-])\s*(\d+(?:\.\d+)?)(%?)$/);

                    if (match) {
                        const statName = match[1].trim();
                        const sign = match[2];
                        const val = parseFloat(match[3]);
                        const unit = match[4];

                        const key = `${statName}|${unit}`;
                        if (!statsMap[key]) {
                            statsMap[key] = { statName, value: 0, unit };
                        }

                        statsMap[key].value += (sign === '-' ? -val : val);
                    } else {
                        specials.add(cl);
                    }
                });
            });
        });

        const stats = Object.values(statsMap).map(s => {
            const sign = s.value > 0 ? '+' : '';
            const valStr = s.value % 1 === 0 ? s.value.toString() : s.value.toFixed(2);
            return `${s.statName} ${sign}${valStr}${s.unit}`;
        });

        return {
            stats,
            specials: Array.from(specials)
        };
    };

    const renderSkillTab = () => {
        if (!character) return null;

        // 🌟 스킬 정렬 로직 변경: 레벨순 -> 장착순 (API에서 오는 순서 그대로 사용)
        // 단, 필터링(레벨 2 이상, 룬 장착, 각성기)은 유지
        const sortedSkills = character.skills
            .filter(skill => skill.level >= 2 || skill.runeName || skill.isAwakening);
            // .sort((a, b) => b.level - a.level); // 🌟 정렬 제거

        // 🌟 스킬 요약 정보 계산
        let headAttackCount = 0;
        let backAttackCount = 0;
        let pushImmuneCount = 0; // 경직 면역
        let destrLv2Count = 0;
        let destrLv1Count = 0;
        let counterCount = 0;
        const staggerCounts: { [key: string]: number } = { '최상': 0, '상': 0, '중상': 0, '중': 0, '하': 0 };

        sortedSkills.forEach(skill => {
            const attrs = parseSkillTooltip(skill.tooltip);
            if (attrs['HeadAttack']) headAttackCount++;
            if (attrs['BackAttack']) backAttackCount++;
            if (attrs['SuperArmor'] && attrs['SuperArmor'].includes("경직 면역")) pushImmuneCount++;
            if (attrs['Destruction']) {
                if (attrs['Destruction'].includes("Lv.2") || attrs['Destruction'].includes("2")) destrLv2Count++;
                else if (attrs['Destruction'].includes("Lv.1") || attrs['Destruction'].includes("1")) destrLv1Count++;
            }
            if (attrs['Counter']) counterCount++;
            if (attrs['Stagger']) {
                const val = attrs['Stagger'];
                if (staggerCounts[val] !== undefined) staggerCounts[val]++;
            }
        });

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '20px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* 🌟 스킬 요약 섹션 */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '15px',
                    marginBottom: '10px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '15px',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: '#ddd'
                }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#64b5f6', fontWeight: 'bold' }}>헤드어택</span>
                        <span style={{ background: 'rgba(33, 150, 243, 0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#fff' }}>{headAttackCount}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#e57373', fontWeight: 'bold' }}>백어택</span>
                        <span style={{ background: 'rgba(244, 67, 54, 0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#fff' }}>{backAttackCount}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#ba68c8', fontWeight: 'bold' }}>경직면역</span>
                        <span style={{ background: 'rgba(156, 39, 176, 0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#fff' }}>{pushImmuneCount}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#ffc107', fontWeight: 'bold' }}>카운터</span>
                        <span style={{ background: 'rgba(255, 193, 7, 0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#fff' }}>{counterCount}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>파괴</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Lv.2 <span style={{ color: '#fff', fontWeight: 'bold' }}>{destrLv2Count}</span></span>
                            <span style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Lv.1 <span style={{ color: '#fff', fontWeight: 'bold' }}>{destrLv1Count}</span></span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>무력화</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {['최상', '상', '중상', '중', '하'].map(rank => (
                                staggerCounts[rank] > 0 && (
                                    <span key={rank} style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                                        {rank} <span style={{ color: '#fff', fontWeight: 'bold' }}>{staggerCounts[rank]}</span>
                                    </span>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {sortedSkills.map((skill, idx) => {
                    // Find gems for this skill
                    const skillGems = character.gems.filter(gem => {
                        let gemSkillIcon = gem.skillIcon;
                        if (!gemSkillIcon) {
                            gemSkillIcon = findSkillIconFallback(gem.tooltip, character.skills) || undefined;
                        }
                        return gemSkillIcon === skill.icon;
                    });
                    
                    // Sort gems: Damage (멸화/겁화) first, then Cooldown (홍염/작열)
                    skillGems.sort((a, b) => {
                         const isDmgA = isDamageGem(a);
                         const isDmgB = isDamageGem(b);
                         if (isDmgA && !isDmgB) return -1;
                         if (!isDmgA && isDmgB) return 1;
                         return b.level - a.level;
                    });

                    const attributes = parseSkillTooltip(skill.tooltip);

                    return (
                        <div key={idx} style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                <div style={{position: 'relative', width: '48px', height: '48px'}}>
                                    <img src={skill.icon} alt={skill.name} style={{width: '100%', height: '100%', borderRadius: '8px'}} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: -5,
                                        right: -5,
                                        background: '#000',
                                        color: '#fff',
                                        fontSize: '12px',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        border: '1px solid #333'
                                    }}>{skill.level}</div>
                                </div>
                                <div>
                                    <div style={{fontWeight: 'bold', color: '#fff', fontSize: '16px'}}>{skill.name}</div>
                                    <div style={{fontSize: '12px', color: '#aaa'}}>{skill.type} {skill.isAwakening ? '[각성기]' : ''}</div>
                                </div>
                                
                                {skill.runeName && (
                                    <div style={{marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                                        <img src={skill.runeIcon} alt={skill.runeName} style={{width: '24px', height: '24px'}} />
                                        <div style={{fontSize: '12px', color: getRuneColor(skill.runeGrade)}}>{skill.runeName}</div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '6px', marginLeft: '20px', flexWrap: 'wrap' }}>
                                    {attributes['Stagger'] && (
                                        <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', color: '#ddd' }}>
                                            무력화: <span style={{ color: '#fff', fontWeight: 'bold' }}>{attributes['Stagger']}</span>
                                        </span>
                                    )}
                                    {attributes['Destruction'] && (
                                        <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', color: '#ddd' }}>
                                            파괴: <span style={{ color: '#fff', fontWeight: 'bold' }}>{attributes['Destruction']}</span>
                                        </span>
                                    )}
                                    {attributes['Counter'] && (
                                        <span style={{ fontSize: '11px', background: 'rgba(255, 193, 7, 0.2)', padding: '2px 6px', borderRadius: '4px', color: '#ffc107', fontWeight: 'bold' }}>
                                            카운터
                                        </span>
                                    )}
                                    {attributes['HeadAttack'] && (
                                        <span style={{ fontSize: '11px', background: 'rgba(33, 150, 243, 0.2)', padding: '2px 6px', borderRadius: '4px', color: '#64b5f6', fontWeight: 'bold' }}>
                                            헤드어택
                                        </span>
                                    )}
                                    {attributes['BackAttack'] && (
                                        <span style={{ fontSize: '11px', background: 'rgba(244, 67, 54, 0.2)', padding: '2px 6px', borderRadius: '4px', color: '#e57373', fontWeight: 'bold' }}>
                                            백어택
                                        </span>
                                    )}
                                    {attributes['SuperArmor'] && (
                                        <span style={{ fontSize: '11px', background: 'rgba(156, 39, 176, 0.2)', padding: '2px 6px', borderRadius: '4px', color: '#ba68c8', fontWeight: 'bold' }}>
                                            {attributes['SuperArmor']}
                                        </span>
                                    )}
                                </div>

                                {skillGems.length > 0 && (
                                    <div style={{marginLeft: 'auto', display: 'flex', gap: '8px'}}>
                                        {skillGems.map((gem, gIdx) => (
                                            <div key={gIdx} style={{
                                                position: 'relative',
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                border: `1px solid ${getGradeColor(gem.grade)}`,
                                                background: isDamageGem(gem) ? 'rgba(255, 87, 34, 0.15)' : 'rgba(33, 150, 243, 0.15)'
                                            }} title={gem.name}>
                                                <img src={gem.icon} alt={gem.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    background: 'rgba(0,0,0,0.7)',
                                                    color: '#fff',
                                                    fontSize: '10px',
                                                    padding: '0 3px',
                                                    borderRadius: '3px 0 0 0'
                                                }}>{gem.level}</div>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    background: isDamageGem(gem) ? '#ff5722' : '#2196f3',
                                                    color: '#fff',
                                                    fontSize: '9px',
                                                    padding: '0 2px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {isDamageGem(gem) ? (gem.name.includes("겁화") ? "겁" : "멸") : (gem.name.includes("작열") ? "작" : "홍")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {!skill.isAwakening && skill.tripods && skill.tripods.length > 0 && (
                                <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                                    {skill.tripods.sort((a, b) => a.tier - b.tier).map((tripod, tIdx) => (
                                        <div key={tIdx} style={{
                                            flex: 1,
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '6px',
                                            padding: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <img src={tripod.icon} alt={tripod.name} style={{width: '24px', height: '24px', borderRadius: '4px'}} />
                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                    <span style={{
                                                        fontSize: '10px',
                                                        fontWeight: 'bold',
                                                        color: '#fff',
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        borderRadius: '50%',
                                                        width: '14px',
                                                        height: '14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        paddingBottom: '1px'
                                                    }}>{tripod.slot}</span>
                                                    <span style={{fontSize: '12px', color: '#ddd'}}>{tripod.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const tabs = ["전체", "스킬", "아크패시브", "아크 그리드", "원정대"]; // 🌟 "각인" -> "아크 그리드"로 수정
    const leftEquipOrder = ["투구", "어깨", "상의", "하의", "장갑", "무기"];
    const rightEquipTypes = ["목걸이", "귀걸이", "반지", "어빌리티 스톤", "팔찌"];

    const leftEquipments = character?.equipment
        .filter(eq => leftEquipOrder.includes(eq.type))
        .sort((a, b) => leftEquipOrder.indexOf(a.type) - leftEquipOrder.indexOf(b.type)) || [];

    const rightEquipments = character?.equipment.filter(eq => rightEquipTypes.includes(eq.type)) || [];

    const abilityStoneEq = character?.equipment.find(eq => eq.type === "어빌리티 스톤");
    const globalStoneEngravings = abilityStoneEq ? parseTooltip(abilityStoneEq.tooltip).abilityEngravings : [];

    const activeEngravings = character?.t4Engravings
        ?.filter(e => !e.name.includes("감소"))
        .slice(0, 5) || [];

    const arkPassiveTitleIcon = character?.arkPassive?.effects?.find(e => e.name === '깨달음')?.icon;

    return (
        <div className="container" style={{maxWidth: '1400px', margin: '0 auto', padding: '40px 20px'}}>
            <h1 style={{textAlign: 'center', marginBottom: '30px', color: '#fff'}}>🔍 캐릭터 검색</h1>

            <form onSubmit={handleSearch} style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '10px',
                maxWidth: '600px',
                margin: '0 auto 10px'
            }}>
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
                <button type="submit" style={{
                    padding: '0 30px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary-color)',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}>검색
                </button>
            </form>

            {recentSearches.length > 0 && (
                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto 40px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {recentSearches.map(name => (
                        <div key={name} onClick={() => handleRecentClick(name)} style={{
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
                        }}>
                            {name}
                            <span onClick={(e) => removeSearchTerm(name, e)}
                                  style={{color: '#aaa', fontWeight: 'bold', fontSize: '14px'}}>×</span>
                        </div>
                    ))}
                </div>
            )}

            {loading && <div style={{textAlign: 'center', color: '#aaa'}}>검색 중...</div>}
            {error && <div style={{textAlign: 'center', color: '#ef5350'}}>캐릭터를 찾을 수 없습니다.</div>}

            {character && (
                <div className="content-card"
                     style={{padding: '0', overflow: 'hidden', background: 'transparent', border: 'none'}}>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '20px',
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: '10px'
                    }}>
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

                    {activeTab === '전체' && (
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'center'
                        }}>
                            <div style={{textAlign: 'center'}}>
                                <div style={{fontSize: '14px', color: '#aaa', marginBottom: '5px'}}>아이템 레벨</div>
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#ffb74d'
                                }}>{character.itemMaxLevel || character.itemAvgLevel}</div>
                            </div>
                            {character.combatPower && (
                                <div style={{textAlign: 'center'}}>
                                    <div style={{fontSize: '14px', color: '#aaa', marginBottom: '5px'}}>전투력</div>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#ba94ff'
                                    }}>{character.combatPower}</div>
                                </div>
                            )}
                            <div style={{textAlign: 'center'}}>
                                <div style={{fontSize: '14px', color: '#aaa', marginBottom: '5px'}}>전투 레벨</div>
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#fff'
                                }}>{character.characterLevel}</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <div style={{fontSize: '14px', color: '#aaa', marginBottom: '5px'}}>서버</div>
                                <div style={{fontSize: '18px', color: '#fff'}}>{character.serverName}</div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <div style={{fontSize: '14px', color: '#aaa', marginBottom: '5px'}}>길드</div>
                                <div style={{fontSize: '18px', color: '#fff'}}>{character.guildName || '-'}</div>
                            </div>
                        </div>
                    )}

                    {activeTab === '전체' && (
                        <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
                            <div style={{width: '390px', flexShrink: 0}}>
                                <div style={{
                                    position: 'relative',
                                    height: '500px',
                                    background: 'url(' + character.characterImage + ') no-repeat center top / cover',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    marginBottom: '20px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: '20px',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '4px'
                                        }}>
                                            {character.titleIcon && <img src={character.titleIcon} alt="title icon"
                                                                         style={{width: '24px', height: '24px'}}/>}
                                            <div style={{color: '#aaa', fontSize: '14px'}}>{character.title}</div>
                                        </div>
                                        <h2 style={{
                                            margin: 0,
                                            fontSize: '28px',
                                            color: '#fff'
                                        }}>{character.characterName}</h2>
                                        <div style={{
                                            marginTop: '8px',
                                            display: 'inline-block',
                                            background: 'var(--primary-color)',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            color: '#fff'
                                        }}>{character.characterClassName}</div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'var(--bg-card)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 15px 0',
                                        fontSize: '18px',
                                        color: '#fff',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        paddingBottom: '10px'
                                    }}>기본 특성</h3>
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                                        {character.stats.map((stat, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: '14px'
                                            }}>
                                                <span style={{color: '#aaa'}}>{stat.type}</span>
                                                <span style={{color: '#fff', fontWeight: 'bold'}}>{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '20px',
                                    background: 'var(--bg-card)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 15px 0',
                                        fontSize: '18px',
                                        color: '#fff',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        paddingBottom: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>아크패시브</span>
                                            {character.arkPassive?.title && (
                                                <span style={{ fontSize: '14px', color: '#ffb74d', fontWeight: 'bold' }}>
                                                    [{character.arkPassive.title}]
                                                </span>
                                            )}
                                        </div>
                                        {character.arkPassive?.isArkPassive && <span style={{
                                            fontSize: '12px',
                                            background: '#ba94ff',
                                            color: '#000',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontWeight: 'bold'
                                        }}>Active</span>}
                                    </h3>
                                    {character.arkPassive && character.arkPassive.points && character.arkPassive.points.length > 0 ? (
                                        renderArkPassivePoints()
                                    ) : (
                                        <div style={{
                                            color: '#aaa',
                                            fontSize: '14px',
                                            textAlign: 'center',
                                            padding: '10px 0'
                                        }}>활성화된 아크패시브 포인트가 없습니다.</div>
                                    )}
                                </div>

                                <div style={{
                                    marginTop: '20px',
                                    background: 'var(--bg-card)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 15px 0',
                                        fontSize: '18px',
                                        color: '#fff',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        paddingBottom: '10px'
                                    }}>
                                        아크 그리드
                                    </h3>
                                    {character.arkGrids && character.arkGrids.length > 0 ? (
                                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px'}}>
                                            {character.arkGrids.map((grid, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    padding: '8px 2px',
                                                    borderRadius: '8px',
                                                    alignItems: 'center',
                                                    height: '100%'
                                                }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '6px',
                                                        overflow: 'hidden',
                                                        border: 'none',
                                                        flexShrink: 0
                                                    }}>
                                                        <img src={grid.icon} alt={grid.effectName}
                                                             style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '3px',
                                                        width: '100%',
                                                        flex: 1
                                                    }}>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            color: '#f97316',
                                                            textAlign: 'center',
                                                            lineHeight: '1.2',
                                                            width: '100%',
                                                            wordBreak: 'keep-all',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            flex: 1
                                                        }}>
                                                            {grid.effectName}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '10px',
                                                            fontWeight: 'bold',
                                                            color: '#fff',
                                                            background: 'rgba(0,0,0,0.5)',
                                                            padding: '2px 6px',
                                                            borderRadius: '8px',
                                                            marginTop: 'auto'
                                                        }}>
                                                            {grid.point}P
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{
                                            color: '#aaa',
                                            fontSize: '14px',
                                            textAlign: 'center',
                                            padding: '10px 0'
                                        }}>
                                            장착된 아크 그리드가 없습니다.
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    marginTop: '20px',
                                    background: 'var(--bg-card)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        paddingBottom: '12px'
                                    }}>
                                        <h3 style={{margin: 0, fontSize: '16px', color: '#fff', fontWeight: 'bold'}}>각인</h3>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontSize: '12px',
                                            color: '#aaa'
                                        }}>
                                            <span>총 {activeEngravings.length}개</span>
                                        </div>
                                    </div>

                                    {activeEngravings.length > 0 ? (
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                            {activeEngravings.map((effect, idx) => {
                                                let bgPos = '-116px';
                                                if (effect.grade === '전설') bgPos = '-58px';
                                                else if (effect.grade === '영웅') bgPos = '-174px';
                                                else if (effect.grade === '희귀') bgPos = '-232px';
                                                else if (effect.grade === '고급') bgPos = '0px';

                                                const matchedStoneEng = globalStoneEngravings.find(se => se.name === effect.name);

                                                return (
                                                    <div key={idx} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        padding: '6px 12px',
                                                        borderRadius: '9999px',
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                         onMouseEnter={(e) => {
                                                             e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                             e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
                                                         }}
                                                         onMouseLeave={(e) => {
                                                             e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                             e.currentTarget.style.boxShadow = 'none';
                                                         }}
                                                         title={effect.description.replace(/<[^>]*>?/gm, '')}
                                                    >
                                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                            <i style={{
                                                                display: 'inline-block',
                                                                width: '24px',
                                                                height: '24px',
                                                                transform: 'scale(0.75)',
                                                                transformOrigin: 'center',
                                                                background: `url("https://pica.korlark.com/2018/obt/assets/images/pc/profile/img_engrave_icon.png") ${bgPos} center`,
                                                            }}/>
                                                            <span style={{
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                color: '#fff'
                                                            }}>{effect.name}</span>
                                                            <span style={{
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                color: getGradeColor(effect.grade)
                                                            }}>
                                                                +{effect.level}
                                                            </span>
                                                        </div>

                                                        {matchedStoneEng && matchedStoneEng.level > 0 && !matchedStoneEng.isPenalty && (
                                                            <div style={{
                                                                marginLeft: 'auto',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '2px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                <i style={{
                                                                    display: 'inline-block',
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    transform: 'scale(0.75)',
                                                                    transformOrigin: 'center',
                                                                    background: `url("https://pica.korlark.com/2018/obt/assets/images/pc/profile/img_engrave_icon.png") 0px center`,
                                                                }}/>
                                                                <span style={{
                                                                    fontSize: '14px',
                                                                    color: '#fff'
                                                                }}>+{matchedStoneEng.level}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{
                                            color: '#aaa',
                                            fontSize: '14px',
                                            textAlign: 'center',
                                            padding: '10px 0'
                                        }}>
                                            장착된 각인이 없습니다.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '20px'}}>
                                <div style={{display: 'flex', gap: '20px'}}>
                                    <div style={{
                                        flex: 1,
                                        background: 'var(--bg-card)',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <h3 style={{
                                            margin: '0 0 15px 0',
                                            fontSize: '18px',
                                            color: '#fff',
                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                            paddingBottom: '10px'
                                        }}>장비</h3>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                            {leftEquipments.map((eq, index) => {
                                                const {quality} = parseTooltip(eq.tooltip);
                                                const qualityInfo = getQualityGrade(quality);
                                                return (
                                                    <div key={index} style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '10px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        padding: '8px',
                                                        borderRadius: '6px'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            width: '40px',
                                                            flexShrink: 0
                                                        }}>
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '4px',
                                                                overflow: 'hidden',
                                                                background: '#000',
                                                                border: `1px solid ${getGradeColor(eq.grade)}`,
                                                                marginBottom: '4px'
                                                            }}>
                                                                <img src={eq.icon} alt={eq.name} style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}/>
                                                            </div>
                                                            {quality >= 0 && <div style={{
                                                                fontSize: '11px',
                                                                fontWeight: 'bold',
                                                                color: qualityInfo.color,
                                                                textAlign: 'center',
                                                                whiteSpace: 'nowrap'
                                                            }}>품질 {quality}</div>}
                                                        </div>
                                                        <div style={{
                                                            flex: 1,
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center',
                                                            minHeight: '40px'
                                                        }}>
                                                            <div style={{fontSize: '11px', color: '#aaa'}}>{eq.type}</div>
                                                            <div style={{
                                                                fontSize: '13px',
                                                                fontWeight: 'bold',
                                                                color: getGradeColor(eq.grade),
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}>{eq.name}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <h3 style={{
                                            margin: '20px 0 15px 0',
                                            fontSize: '18px',
                                            color: '#fff',
                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                            paddingBottom: '10px'
                                        }}>스킬</h3>
                                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px'}}>
                                            {character.skills
                                                .filter(skill => skill.level >= 2 || skill.runeName || skill.isAwakening)
                                                // .sort((a, b) => b.level - a.level) // 🌟 정렬 제거
                                                .map((skill, index) => (
                                                    <div key={index} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        padding: '6px',
                                                        borderRadius: '6px'
                                                    }}>
                                                        <div style={{
                                                            position: 'relative',
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                            flexShrink: 0
                                                        }}>
                                                            <img src={skill.icon} alt={skill.name} style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}/>
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: 0,
                                                                right: 0,
                                                                background: 'rgba(0,0,0,0.8)',
                                                                color: '#fff',
                                                                fontSize: '9px',
                                                                padding: '0 2px',
                                                                borderRadius: '2px'
                                                            }}>{skill.level}</div>
                                                        </div>
                                                        <div style={{overflow: 'hidden'}}>
                                                            <div style={{
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                color: '#ddd',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}>{skill.name}</div>
                                                            {skill.runeName && (
                                                                <div style={{
                                                                    fontSize: '11px',
                                                                    color: getRuneColor(skill.runeGrade),
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '3px'
                                                                }}>
                                                                    <img src={skill.runeIcon} alt="" style={{
                                                                        width: '12px',
                                                                        height: '12px'
                                                                    }}/>{skill.runeName}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    <div style={{
                                        flex: 1.2,
                                        background: 'var(--bg-card)',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <h3 style={{
                                            margin: '0 0 15px 0',
                                            fontSize: '18px',
                                            color: '#fff',
                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                            paddingBottom: '10px'
                                        }}>악세서리 & 특수장비</h3>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                            {rightEquipments.map((eq, index) => {
                                                const {
                                                    quality,
                                                    options,
                                                    mainStat,
                                                    abilityEngravings
                                                } = parseTooltip(eq.tooltip);
                                                const qualityInfo = getQualityGrade(quality);

                                                return (
                                                    <div key={index} style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '10px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        padding: '10px',
                                                        borderRadius: '6px'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            width: '40px',
                                                            flexShrink: 0
                                                        }}>
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '4px',
                                                                overflow: 'hidden',
                                                                background: '#000',
                                                                border: `1px solid ${getGradeColor(eq.grade)}`,
                                                                marginBottom: '4px'
                                                            }}>
                                                                <img src={eq.icon} alt={eq.name} style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}/>
                                                            </div>
                                                            {quality >= 0 && <div style={{
                                                                fontSize: '11px',
                                                                fontWeight: 'bold',
                                                                color: qualityInfo.color,
                                                                textAlign: 'center',
                                                                whiteSpace: 'nowrap'
                                                            }}>품질 {quality}</div>}
                                                            {mainStat && <div style={{
                                                                fontSize: '10px',
                                                                color: '#aaa',
                                                                marginTop: '2px',
                                                                textAlign: 'center',
                                                                whiteSpace: 'nowrap'
                                                            }}>{mainStat}</div>}
                                                        </div>
                                                        <div style={{flex: 1, overflow: 'hidden'}}>
                                                            <div style={{
                                                                fontSize: '13px',
                                                                fontWeight: 'bold',
                                                                color: getGradeColor(eq.grade),
                                                                marginBottom: '4px'
                                                            }}>{eq.name}</div>
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: '#ddd',
                                                                lineHeight: '1.4'
                                                            }}>

                                                                {eq.type === "어빌리티 스톤" && abilityEngravings.length > 0 ? (
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: '3px',
                                                                        marginTop: '4px'
                                                                    }}>
                                                                        {abilityEngravings.map((eng, i) => (
                                                                            <div key={i} style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '6px'
                                                                            }}>
                                                                                <span style={{
                                                                                    color: eng.isPenalty ? '#ef5350' : '#81c784',
                                                                                    fontWeight: 'bold'
                                                                                }}>[{eng.name}]</span>
                                                                                <span style={{
                                                                                    color: '#fff',
                                                                                    fontWeight: 'bold'
                                                                                }}>Lv.{eng.level}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : options.length > 0 ? (
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: '2px'
                                                                    }}>
                                                                        {options.map((opt, i) => <div
                                                                            key={i}>{renderOption(opt, eq.type)}</div>)}
                                                                    </div>
                                                                ) : <span style={{color: '#666'}}>옵션 정보 없음</span>}

                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'var(--bg-card)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 15px 0',
                                        fontSize: '18px',
                                        color: '#fff',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        paddingBottom: '10px'
                                    }}>
                                        보석
                                        <span style={{
                                            fontSize: '13px',
                                            color: '#aaa',
                                            fontWeight: 'normal'
                                        }}>{getGemSummary()}</span>
                                    </h3>
                                    {character.gems.length > 0 ? (
                                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: '5px'}}>
                                            {character.gems
                                                .sort((a, b) => {
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
                                                            <img src={gem.icon} alt={gem.name} style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px'
                                                            }}/>
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: 0,
                                                                right: 0,
                                                                background: 'rgba(0,0,0,0.7)',
                                                                color: '#fff',
                                                                fontSize: '11px',
                                                                padding: '1px 4px',
                                                                borderRadius: '4px 0 0 0'
                                                            }}>{gem.level}</div>
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
                                                                    <img src={skillIcon} alt="skill" style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover'
                                                                    }}/>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <div style={{color: '#aaa', fontSize: '14px'}}>장착된 보석이 없습니다.</div>
                                    )}
                                </div>

                                <div style={{
                                    background: 'var(--bg-card)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 15px 0',
                                        fontSize: '18px',
                                        color: '#fff',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        paddingBottom: '10px'
                                    }}>카드</h3>

                                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {character.cards.map((card, index) => (
                                                <div key={index} style={{ width: '80px', flexShrink: 0, textAlign: 'center' }}>
                                                    <div style={{ width: '80px', height: '110px', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${getGradeColor(card.grade)}` }}>
                                                        <img src={card.icon} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{
                                            flex: 1,
                                            minWidth: '250px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                                            paddingLeft: '24px'
                                        }}>
                                            {(() => {
                                                const { stats, specials } = getAggregatedCardEffects();

                                                if (stats.length === 0 && specials.length === 0) {
                                                    return character.cardEffects.map((effect, idx) => {
                                                        const lastItem = effect.items[effect.items.length - 1];
                                                        return lastItem ? (
                                                            <div key={idx} style={{ fontSize: '15px', color: '#81c784', fontWeight: 'bold', marginBottom: '4px' }}>
                                                                {lastItem.name}
                                                            </div>
                                                        ) : null;
                                                    });
                                                }

                                                return (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ fontSize: '15px', color: '#81c784', fontWeight: 'bold' }}>
                                                            {character.cardEffects.map(e => e.items[e.items.length - 1]?.name).filter(Boolean).join(' / ')}
                                                        </div>

                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            {stats.map((stat, idx) => (
                                                                <div key={`stat-${idx}`} style={{ fontSize: '14px', color: '#ddd' }}>
                                                                    • {stat}
                                                                </div>
                                                            ))}
                                                            {specials.map((sp, idx) => (
                                                                <div key={`sp-${idx}`} style={{ fontSize: '14px', color: '#ddd' }}>
                                                                    • {sp}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {activeTab === '스킬' && renderSkillTab()}
                    {activeTab === '아크패시브' && renderArkPassiveTab()}
                    {activeTab === '아크 그리드' && renderArkGridTab()}
                    {activeTab === '원정대' && renderSiblingsTab()}
                </div>
            )}
        </div>
    );
}