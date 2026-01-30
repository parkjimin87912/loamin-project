import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

// [변경] 시세 관련 페이지들을 'market' 폴더에서 불러옵니다.
import MarketPage from './pages/markets/MarketPage';
import ItemDetailPage from './pages/markets/ItemDetailPage';

import GeneralReforgePage from './pages/tools/GeneralReforgePage';
import AdvancedReforgePage from './pages/tools/AdvancedReforgePage';
import AbydosPage from './pages/tools/AbydosPage';

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

                    <Route path="/market" element={<Navigate to="/" replace />} />

                    {/* 도구 라우팅 */}
                    <Route path="/tools" element={<Navigate to="/tools/general" replace />} />
                    <Route path="/tools/general" element={<GeneralReforgePage />} />
                    <Route path="/tools/advanced" element={<AdvancedReforgePage />} />
                    <Route path="/tools/abydos" element={<AbydosPage />} />

                    <Route path="/tools/*" element={<Navigate to="/tools/general" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;