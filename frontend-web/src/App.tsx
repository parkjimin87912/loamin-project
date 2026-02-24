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
                    {/* /market 접근 시 재련 재료 탭으로 리다이렉트 */}
                    <Route path="/market" element={<Navigate to="/market/reforge" replace />} />

                    {/* 도구 라우팅 */}
                    {/* /tools 접근 시 일반 재련으로 리다이렉트 */}
                    <Route path="/tools" element={<Navigate to="/tools/general" replace />} />

                    <Route path="/tools/general" element={<GeneralReforgePage />} />      {/* 일반 재련 */}
                    <Route path="/tools/advanced" element={<AdvancedReforgePage />} />    {/* 상급 재련 */}
                    <Route path="/tools/abydos" element={<AbydosPage />} />               {/* 아비도스 쌀산기 */}
                    <Route path="/tools/craft" element={<AbydosCraftPage />} />           {/* 아비도스 제작 계산기 */}
                    <Route path="/tools/auction" element={<AuctionPage />} />             {/* 경매 계산기 */}

                    {/* 잘못된 도구 경로는 일반 재련으로 */}
                    <Route path="/tools/*" element={<Navigate to="/tools/general" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;