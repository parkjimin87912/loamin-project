import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

// [수정됨] markets -> market (오타 수정)
import MarketPage from './pages/markets/MarketPage';
import ItemDetailPage from './pages/markets/ItemDetailPage';

// 도구 관련 페이지
import GeneralReforgePage from './pages/tools/GeneralReforgePage';
import AdvancedReforgePage from './pages/tools/AdvancedReforgePage';
import AbydosPage from './pages/tools/AbydosPage';
import AuctionPage from './pages/tools/AuctionPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />

                    {/* 시세 정보: 리스트 */}
                    <Route path="/market/:categoryId" element={<MarketPage />} />

                    {/* 시세 정보: 상세 (그래프/예측) */}
                    <Route path="/market/detail/:itemName" element={<ItemDetailPage />} />

                    {/* /market 접속 시 홈(/)이 아니라 '재련 재료'(/market/reforge) 탭으로 이동 */}
                    <Route path="/market" element={<Navigate to="/market/reforge" replace />} />

                    {/* 도구 라우팅 */}
                    <Route path="/tools" element={<Navigate to="/tools/general" replace />} />
                    <Route path="/tools/general" element={<GeneralReforgePage />} />
                    <Route path="/tools/advanced" element={<AdvancedReforgePage />} />
                    <Route path="/tools/abydos" element={<AbydosPage />} />
                    <Route path="/tools/auction" element={<AuctionPage />} />

                    <Route path="/tools/*" element={<Navigate to="/tools/general" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;