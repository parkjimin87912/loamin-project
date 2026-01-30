import { useParams, useNavigate } from 'react-router-dom';
import PriceChart from "../components/PriceChart";
import '../App.css';

export default function MarketPage() {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const titles: { [key: string]: string } = {
        reforge: "🔥 재련 재료 시세",
        life: "🌿 생활 재료 시세",
        engraving: "📖 유물 각인서 시세",
        gem: "💎 보석 시세",
        battle: "💣 배틀 아이템 시세",
    };

    const title = titles[categoryId || ""] || "시세 정보";

    return (
        <div className="container" style={{ marginTop: '30px' }}>
            {/* 뒤로가기 버튼 */}
            <button onClick={() => navigate(-1)} className="back-btn">
                ← 뒤로 가기
            </button>

            {/* 컨텐츠 영역 (스타일 통일) */}
            <section className="content-card">
                <div className="card-header">
                    <span className="card-title">{title}</span>
                </div>

                <div style={{ padding: '10px 0' }}>
                    {categoryId === 'engraving' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <PriceChart itemName="유물 원한 각인서" />
                            <PriceChart itemName="유물 예리한 둔기 각인서" />
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚧</div>
                            <div>현재 <strong>{title}</strong> 데이터 수집 모듈을 개발 중입니다.</div>
                            <div style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                                ( '유물 각인서' 메뉴를 눌러 AI 예측 기능을 확인해보세요! )
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}