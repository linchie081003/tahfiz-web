import { Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./lib/api";
import { ChooseProfilePage } from "./pages/ChooseProfilePage";
import { HomePage } from "./pages/HomePage";
import { LencanaPage } from "./pages/LencanaPage";
import { LoginPage } from "./pages/LoginPage";
import { MurojaahPage } from "./pages/MurojaahPage";
import { ParentDashboardPage } from "./pages/ParentDashboardPage";
import { ParentQueuePage } from "./pages/ParentQueuePage";
import { PetaPage } from "./pages/PetaPage";
import { SetorPage } from "./pages/SetorPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TahsinPage } from "./pages/TahsinPage";
import { QuranPage } from "./pages/QuranPage";
import { QuranSurahPage } from "./pages/QuranSurahPage";
import { ZiyadahPage } from "./pages/ZiyadahPage";

import { GameScene } from "./components/game/GameScene";
import { AppFooterMenu } from "./components/AppFooterMenu";
import { ParentDashboardOpenProvider } from "./context/ParentDashboardOpenContext";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ParentDashboardOpenProvider>
      <div className="app-shell">
        <GameScene className="pb-24 pt-3">{children}</GameScene>
        <AppFooterMenu />
      </div>
    </ParentDashboardOpenProvider>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/pilih-profil"
        element={
          <RequireAuth>
            <ChooseProfilePage />
          </RequireAuth>
        }
      />
      <Route path="/onboarding" element={<Navigate to="/pilih-profil" replace />} />
      <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
      <Route path="/peta" element={<RequireAuth><PetaPage /></RequireAuth>} />
      <Route path="/tahsin" element={<RequireAuth><TahsinPage /></RequireAuth>} />
      <Route path="/ziyadah" element={<RequireAuth><ZiyadahPage /></RequireAuth>} />
      <Route path="/murojaah" element={<RequireAuth><MurojaahPage /></RequireAuth>} />
      <Route path="/setor" element={<RequireAuth><SetorPage /></RequireAuth>} />
      <Route path="/lencana" element={<RequireAuth><LencanaPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
      <Route path="/parent" element={<RequireAuth><ParentDashboardPage /></RequireAuth>} />
      <Route path="/parent/queue" element={<RequireAuth><ParentQueuePage /></RequireAuth>} />
      <Route
        path="/ujian"
        element={
          <RequireAuth>
            <div className="app-page space-y-4 p-4 pb-24 pt-1">Ujian — Segera (Fase 2)</div>
          </RequireAuth>
        }
      />
      <Route path="/quran" element={<RequireAuth><QuranPage /></RequireAuth>} />
      <Route path="/quran/:surahId" element={<RequireAuth><QuranSurahPage /></RequireAuth>} />
      <Route path="/referensi" element={<RequireAuth><Navigate to="/quran" replace /></RequireAuth>} />
      <Route
        path="/laporan"
        element={
          <RequireAuth>
            <div className="app-page space-y-4 p-4 pb-24 pt-1">Laporan — Segera (Fase 2)</div>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
