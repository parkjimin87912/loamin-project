import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../App.css';

interface PriceHistory {
    price: number;
    tradeCount: number | null;
    collectedAt: string;
    displayTime: string;
}

interface Prediction {
    currentPrice: number;
    predictedPrice: number;
    trend: "UP" | "DOWN" | "HOLD";
}

interface Props {
    itemName: string;
}

export default function PriceChart({ itemName }: Props) {
    const [data, setData] = useState<PriceHistory[]>([]);
    const [prediction, setPrediction] = useState<Prediction | null>(null);

    const darkTheme = {
        textMain: '#e0e0e0',
        textMuted: '#a0a0a0',
        gridLine: '#333333',
        chartLine: '#bb86fc',
        tooltipBg: '#2c2c2c',
        cardBg: '#1e1e1e'
    };

    useEffect(() => {
        axios.get(`/api/v1/market/history?itemName=${itemName}`)
            .then((response) => {
                const formattedData = response.data.map((item: any) => ({
                    ...item,
                    displayTime: item.collectedAt.substring(11, 16)
                }));
                setData(formattedData);
            })
            .catch(err => console.error("히스토리 로딩 실패:", err));

        axios.get(`/api/v1/market/predict?itemName=${itemName}`)
            .then((response) => {
                setPrediction(response.data);
            })
            .catch(err => console.error("예측 로딩 실패:", err));

    }, [itemName]);

    const getTrendUI = () => {
        if (!prediction) return { color: darkTheme.textMuted, icon: '-', text: '분석 중...', bg: '#2c2c2c' };

        if (prediction.trend === 'UP') {
            return { color: '#ff6b6b', icon: '▲', text: '상승 예상', bg: 'rgba(255, 107, 107, 0.1)' };
        } else if (prediction.trend === 'DOWN') {
            return { color: '#4dabf7', icon: '▼', text: '하락 예상', bg: 'rgba(77, 171, 247, 0.1)' };
        } else {
            return { color: darkTheme.textMuted, icon: '-', text: '보합세', bg: '#2c2c2c' };
        }
    };

    const ui = getTrendUI();

    return (
        // 🌟 수정 1: 인라인 스타일을 지우고 className="price-chart-container" 적용
        <div className="price-chart-container" style={{ background: darkTheme.cardBg }}>

            {/* 🌟 수정 2: 클래스 price-chart-header 적용 */}
            <div className="price-chart-header">
                <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', fontWeight: 700, color: darkTheme.textMain }}>📊 {itemName}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: darkTheme.textMuted }}>실시간 시세 및 AI 예측 분석</p>
                </div>

                {prediction && (
                    <div className="prediction-card" style={{
                    background: ui.bg, border: `1px solid ${ui.color}50`
                }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: darkTheme.textMuted }}>내일 예상가</div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: darkTheme.textMain }}>
                        {prediction.predictedPrice.toLocaleString()} <span style={{fontSize: '0.8rem'}}>G</span>
                    </div>
                </div>

                <div style={{
                    fontWeight: 'bold', color: ui.color, background: darkTheme.cardBg,
                    border: `1px solid ${ui.color}`, padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem',
                }}>
                    {ui.icon} {ui.text}
                </div>
            </div>
            )}
        </div>

    <div className="price-chart-wrapper">
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkTheme.gridLine} />
                    <XAxis dataKey="displayTime" tick={{fontSize: 12, fill: darkTheme.textMuted}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: darkTheme.textMuted}} axisLine={false} tickLine={false} width={50} tickFormatter={(value) => `${value.toLocaleString()}`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #444', background: darkTheme.tooltipBg, color: darkTheme.textMain, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} itemStyle={{ color: darkTheme.chartLine, fontWeight: 'bold' }} formatter={(value: number) => [`${value.toLocaleString()} G`, '가격']} labelStyle={{ color: darkTheme.textMuted, marginBottom: '5px' }} />
                    <Line type="monotone" dataKey="price" stroke={darkTheme.chartLine} strokeWidth={3} dot={{ r: 4, fill: darkTheme.cardBg, stroke: darkTheme.chartLine, strokeWidth: 2 }} activeDot={{ r: 7, fill: darkTheme.chartLine }} animationDuration={1500} />
                </LineChart>
            </ResponsiveContainer>
        ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: darkTheme.textMuted }}>
                시세 기록을 수집 중입니다.
            </div>
        )}
    </div>
</div>
);
}
