import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

// 시세 관련 페이지
import MarketPage from './pages/markets/MarketPage';
import ItemDetailPage from './pages/markets/ItemDetailPage';

// 캐릭터 검색 페이지
import CharacterSearchPage from './pages/CharacterSearchPage';

// 게임 일정 페이지
import CalendarPage from './pages/CalendarPage';

// 도구 관련 페이지
import GeneralReforgePage from './pages/tools/GeneralReforgePage';
import AdvancedReforgePage from './pages/tools/AdvancedReforgePage';
import AbydosPage from './pages/tools/AbydosPage';
import AbydosCraftPage from './pages/tools/AbydosCraftPage';
import AuctionPage from './pages/tools/AuctionPage';
// 🌟 1. 새로 만든 페이지 import 추가
import StatCalculatorPage from './pages/tools/StatCalculatorPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    {/* 메인 홈 */}
                    <Route path="/" element={<Home />} />

                    {/* 캐릭터 검색 */}
                    <Route path="/character" element={<CharacterSearchPage />} />

                    {/* 게임 일정 */}
                    <Route path="/calendar" element={<CalendarPage />} />

                    {/* 시세 정보 라우팅 */}
                    <Route path="/market/:categoryId" element={<MarketPage />} />
                    <Route path="/market/detail/:itemName" element={<ItemDetailPage />} />
                    <Route path="/market" element={<Navigate to="/market/reforge" replace />} />

                    {/* 도구 라우팅 */}
                    <Route path="/tools" element={<Navigate to="/tools/general" replace />} />

                    <Route path="/tools/general" element={<GeneralReforgePage />} />
                    <Route path="/tools/advanced" element={<AdvancedReforgePage />} />
                    <Route path="/tools/abydos" element={<AbydosPage />} />
                    <Route path="/tools/craft" element={<AbydosCraftPage />} />
                    <Route path="/tools/auction" element={<AuctionPage />} />
                    {/* 🌟 2. 라우터 경로 추가! */}
                    <Route path="/tools/stat-calc" element={<StatCalculatorPage />} />

                    {/* 잘못된 도구 경로는 일반 재련으로 */}
                    <Route path="/tools/*" element={<Navigate to="/tools/general" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;