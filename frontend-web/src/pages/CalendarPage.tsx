import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

interface CalendarItem {
    categoryName: string;
    showName: string;
    rewardItems: string[];
    location: string;
    startTimes: string[];
    image: string;
    minItemLevel: number;
}

export default function CalendarPage() {
    const [groupedData, setGroupedData] = useState<{ [key: string]: CalendarItem[] }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchCalendar();
        
        // 1초마다 현재 시간 갱신
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchCalendar = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/calendar');
            if (response.data) {
                const now = new Date();
                const kstOffset = 9 * 60 * 60 * 1000;
                const kstDate = new Date(now.getTime() + kstOffset);
                const kstTodayStr = kstDate.toISOString().split('T')[0];

                let filteredData = response.data
                    .map((item: CalendarItem) => {
                        const validTimes = item.startTimes?.filter(time => {
                            if (!time.startsWith(kstTodayStr)) return false;
                            const timeDate = new Date(time);
                            return timeDate > now;
                        });
                        validTimes?.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                        return { ...item, startTimes: validTimes };
                    })
                    .filter((item: CalendarItem) => item.startTimes && item.startTimes.length > 0);

                const chaosGates = filteredData.filter((item: CalendarItem) => item.categoryName === "카오스게이트");
                const others = filteredData.filter((item: CalendarItem) => item.categoryName !== "카오스게이트");

                if (chaosGates.length > 0) {
                    const representative = chaosGates[0];
                    const mergedLocation = "전 지역 (베른 남부, 볼다이크, 쿠르잔 등)";

                    const mergedChaosGate: CalendarItem = {
                        ...representative,
                        showName: "카오스게이트",
                        location: mergedLocation,
                        startTimes: representative.startTimes 
                    };
                    
                    others.push(mergedChaosGate);
                }

                const groups: { [key: string]: CalendarItem[] } = {};
                others.forEach((item: CalendarItem) => {
                    if (!groups[item.categoryName]) {
                        groups[item.categoryName] = [];
                    }
                    groups[item.categoryName].push(item);
                });

                Object.keys(groups).forEach(key => {
                    groups[key].sort((a, b) => {
                        const timeA = new Date(a.startTimes[0]).getTime();
                        const timeB = new Date(b.startTimes[0]).getTime();
                        return timeA - timeB;
                    });
                });

                setGroupedData(groups);
            }
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const getTimeLeft = (targetTimeStr: string) => {
        const target = new Date(targetTimeStr).getTime();
        const now = currentTime.getTime();
        const diff = target - now;

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) return `${hours}시간 ${minutes}분 전`;
        return `${minutes}분 ${seconds}초 전`;
    };

    const categoryOrder = ["필드보스", "모험 섬", "카오스게이트", "태초의 섬", "유령선"]; 
    const sortedCategories = [
        ...categoryOrder.filter(c => groupedData[c]),
        ...Object.keys(groupedData).filter(c => !categoryOrder.includes(c))
    ];

    return (
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#fff' }}>📅 오늘의 남은 일정</h1>
            <div style={{ textAlign: 'center', marginBottom: '40px', color: '#aaa', fontSize: '14px' }}>
                {currentTime.toLocaleTimeString()} 기준
            </div>

            {loading && <div style={{ textAlign: 'center', color: '#aaa' }}>일정을 불러오는 중...</div>}
            {error && <div style={{ textAlign: 'center', color: '#ef5350' }}>일정을 불러오지 못했습니다.</div>}

            {!loading && !error && Object.keys(groupedData).length === 0 && (
                <div style={{ textAlign: 'center', color: '#aaa' }}>오늘 남은 일정이 없습니다.</div>
            )}

            {sortedCategories.map(category => (
                <div key={category} style={{ marginBottom: '50px' }}>
                    <h2 style={{ 
                        color: '#ffb74d', 
                        borderBottom: '1px solid rgba(255, 183, 77, 0.3)', 
                        paddingBottom: '10px', 
                        marginBottom: '20px', 
                        fontSize: '22px'
                    }}>
                        {category}
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {groupedData[category].map((item, index) => {
                            const nextTimeStr = item.startTimes[0];
                            const timeLeft = nextTimeStr ? getTimeLeft(nextTimeStr) : null;

                            return (
                                <div key={index} style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    padding: '15px',
                                    gap: '15px',
                                    alignItems: 'flex-start'
                                }}>
                                    <div style={{ 
                                        width: '80px', 
                                        height: '80px', 
                                        flexShrink: 0,
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '1px solid #333',
                                        background: '#000',
                                        position: 'relative'
                                    }}>
                                        <img 
                                            src={item.image || 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/default.png'} 
                                            alt={item.showName}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.currentTarget.src = 'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/default.png'; }}
                                        />
                                    </div>
                                    
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>{item.showName}</h3>
                                            
                                            {timeLeft && (
                                                <span style={{
                                                    fontSize: '12px',
                                                    color: '#ff5252',
                                                    fontWeight: 'bold',
                                                    background: 'rgba(255, 82, 82, 0.1)',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    whiteSpace: 'nowrap',
                                                    marginLeft: '8px'
                                                }}>
                                                    ⏳ {timeLeft}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px' }}>📍 {item.location}</div>
                                        
                                        {item.minItemLevel > 0 && (
                                            <div style={{ fontSize: '12px', color: '#ffb74d', marginBottom: '8px', fontWeight: 'bold' }}>
                                                ⚡ 권장 Lv.{item.minItemLevel}
                                            </div>
                                        )}

                                        <div style={{ marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {item.startTimes.slice(0, 4).map((time, i) => {
                                                    const date = new Date(time);
                                                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                    
                                                    const isNext = i === 0;
                                                    
                                                    return (
                                                        <span key={i} style={{
                                                            background: isNext ? '#ef5350' : 'var(--primary-color)',
                                                            color: '#fff',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            boxShadow: isNext ? '0 0 8px rgba(239, 83, 80, 0.4)' : 'none'
                                                        }}>
                                                            {isNext && "🔥 "} {timeStr}
                                                        </span>
                                                    );
                                                })}
                                                {item.startTimes.length > 4 && (
                                                    <span style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        color: '#aaa',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        +{item.startTimes.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {item.rewardItems && item.rewardItems.length > 0 && (
                                            <div style={{ marginTop: 'auto' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {item.rewardItems.slice(0, 3).map((reward, i) => (
                                                        <span key={i} style={{
                                                            background: 'rgba(255,255,255,0.05)',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            color: '#888'
                                                        }}>{reward}</span>
                                                    ))}
                                                    {item.rewardItems.length > 3 && <span style={{ fontSize: '11px', color: '#666' }}>...</span>}
                                                </div>
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
    );
}