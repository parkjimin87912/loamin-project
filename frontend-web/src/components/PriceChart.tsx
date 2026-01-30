import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 1. 데이터 타입 정의
interface PriceHistory {
    price: number;
    tradeCount: number | null;
    collectedAt: string;
    displayTime: string;
}

interface Prediction {
    current_price: number;
    predicted_price: number;
    trend: "UP" | "DOWN" | "HOLD";
}

interface Props {
    itemName: string;
}

export default function PriceChart({ itemName }: Props) {
    const [data, setData] = useState<PriceHistory[]>([]);
    const [prediction, setPrediction] = useState<Prediction | null>(null);

    // 다크 테마용 색상 변수
    const darkTheme = {
        textMain: '#e0e0e0',
        textMuted: '#a0a0a0',
        gridLine: '#333333',
        chartLine: '#bb86fc', // 보라색 계열 강조색
        tooltipBg: '#2c2c2c',
        cardBg: '#1e1e1e'
    };

    useEffect(() => {
        // API 호출 1: 시세 기록 가져오기
        axios.get(`http://localhost:8080/api/v1/market/history/${itemName}`)
            .then((response) => {
                const formattedData = response.data.map((item: any) => ({
                    ...item,
                    displayTime: item.collectedAt.substring(11, 16)
                }));
                setData(formattedData);
            })
            .catch(err => console.error("히스토리 로딩 실패:", err));

        // API 호출 2: AI 예측 데이터 가져오기
        axios.get(`http://localhost:8080/api/v1/market/predict/${itemName}`)
            .then((response) => {
                setPrediction(response.data);
            })
            .catch(err => console.error("예측 로딩 실패:", err));

    }, [itemName]);

    // 트렌드 UI 결정 (다크 모드 색상 적용)
    const getTrendUI = () => {
        if (!prediction) return { color: darkTheme.textMuted, icon: '-', text: '분석 중...', bg: '#2c2c2c' };

        if (prediction.trend === 'UP') {
            return { color: '#ff6b6b', icon: '▲', text: '상승 예상', bg: 'rgba(255, 107, 107, 0.1)' }; // 밝은 빨강
        } else if (prediction.trend === 'DOWN') {
            return { color: '#4dabf7', icon: '▼', text: '하락 예상', bg: 'rgba(77, 171, 247, 0.1)' }; // 밝은 파랑
        } else {
            return { color: darkTheme.textMuted, icon: '-', text: '보합세', bg: '#2c2c2c' };
        }
    };

    const ui = getTrendUI();

    return (
        <div style={{
            width: '100%',
            height: 500,
            padding: '25px',
            background: darkTheme.cardBg, // 배경색 변경
            borderRadius: '16px',
            border: '1px solid #333',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            marginBottom: '30px'
        }}>

            {/* 1. 상단 헤더 영역 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', fontWeight: 700, color: darkTheme.textMain }}>📊 {itemName}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: darkTheme.textMuted }}>실시간 시세 및 AI 예측 분석</p>
                </div>

                {/* 2. 예측 정보 카드 */}
                {prediction && (
                    <div style={{
                        background: ui.bg,
                        padding: '12px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        border: `1px solid ${ui.color}50`
                    }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', color: darkTheme.textMuted }}>내일 예상가</div>
                            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: darkTheme.textMain }}>
                                {prediction.predicted_price.toLocaleString()} <span style={{fontSize: '0.8rem'}}>G</span>
                            </div>
                        </div>

                        <div style={{
                            fontWeight: 'bold',
                            color: ui.color,
                            background: darkTheme.cardBg,
                            border: `1px solid ${ui.color}`,
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                        }}>
                            {ui.icon} {ui.text}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. 차트 영역 (다크 모드 스타일 적용) */}
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        {/* 그리드 선 색상 변경 */}
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkTheme.gridLine} />
                        {/* X축 글씨 색상 변경 */}
                        <XAxis
                            dataKey="displayTime"
                            tick={{fontSize: 12, fill: darkTheme.textMuted}}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        {/* Y축 글씨 색상 변경 */}
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{fontSize: 12, fill: darkTheme.textMuted}}
                            axisLine={false}
                            tickLine={false}
                            width={60}
                            tickFormatter={(value) => `${value.toLocaleString()}`}
                        />
                        {/* 툴팁 스타일 변경 */}
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid #444',
                                background: darkTheme.tooltipBg,
                                color: darkTheme.textMain,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}
                            itemStyle={{ color: darkTheme.chartLine, fontWeight: 'bold' }}
                            formatter={(value: number) => [`${value.toLocaleString()} G`, '가격']}
                            labelStyle={{ color: darkTheme.textMuted, marginBottom: '5px' }}
                        />
                        {/* 선 색상 변경 */}
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke={darkTheme.chartLine}
                            strokeWidth={3}
                            dot={{ r: 4, fill: darkTheme.cardBg, stroke: darkTheme.chartLine, strokeWidth: 2 }}
                            activeDot={{ r: 7, fill: darkTheme.chartLine }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}