import { useParams, useNavigate } from 'react-router-dom';
import PriceChart from "../../components/PriceChart";
import '../App.css';

export default function ItemDetailPage() {
    const { itemName } = useParams(); // URL에서 아이템 이름 가져오기
    const navigate = useNavigate();

    return (
        <div className="container" style={{ marginTop: '30px' }}>
            {/* 뒤로가기 버튼 */}
            <button onClick={() => navigate(-1)} className="back-btn">
                ← 목록으로
            </button>

            {/* 상세 컨텐츠 카드 */}
            <section className="content-card">
                <div className="card-header">
                    <span className="card-title">📈 {itemName} 시세 분석</span>
                    <span style={{ fontSize:'13px', color:'var(--text-secondary)' }}>실시간 데이터 및 AI 예측</span>
                </div>

                <div style={{ padding: '10px 0' }}>
                    {/* 차트 컴포넌트 호출 */}
                    <PriceChart itemName={itemName || ""} />
                </div>
            </section>
        </div>
    );
}