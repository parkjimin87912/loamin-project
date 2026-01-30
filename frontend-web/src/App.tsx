import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MarketPage from './pages/MarketPage';
import GeneralReforgePage from './pages/tools/GeneralReforgePage';
import AdvancedReforgePage from './pages/tools/AdvancedReforgePage';
import AbydosPage from './pages/tools/AbydosPage'; // [추가]

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/market/:categoryId" element={<MarketPage />} />
                    <Route path="/market" element={<Navigate to="/" replace />} />

                    {/* 도구 라우팅 */}
                    <Route path="/tools" element={<Navigate to="/tools/general" replace />} />
                    <Route path="/tools/general" element={<GeneralReforgePage />} />
                    <Route path="/tools/advanced" element={<AdvancedReforgePage />} />
                    <Route path="/tools/abydos" element={<AbydosPage />} /> {/* [추가] 아비도스 연결 */}

                    <Route path="/tools/*" element={<Navigate to="/tools/general" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;