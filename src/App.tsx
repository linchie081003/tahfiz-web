import { Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./lib/api";
import { ChooseProfilePage } from "./pages/ChooseProfilePage";
import { HomePage } from "./pages/HomePage";
import { LencanaPage } from "./pages/LencanaPage";
import { JoinFamilyPage } from "./pages/JoinFamilyPage";
import { LoginPage } from "./pages/LoginPage";
import { MurojaahPage } from "./pages/MurojaahPage";
import { ParentDashboardPage } from "./pages/ParentDashboardPage";
import { ParentQueuePage } from "./pages/ParentQueuePage";
import { WeeklyReportPage } from "./pages/WeeklyReportPage";
import { PetaPage } from "./pages/PetaPage";
import { SetorPage } from "./pages/SetorPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TahsinPage } from "./pages/TahsinPage";
import { QuranPage } from "./pages/QuranPage";
import { QuranSurahPage } from "./pages/QuranSurahPage";
import { OrtuHubPage } from "./pages/parent/OrtuHubPage";
import { HubungkanGuruPage } from "./pages/parent/HubungkanGuruPage";
import { PrivasiSuaraPage } from "./pages/parent/PrivasiSuaraPage";
import { PesanGuruPage } from "./pages/parent/PesanGuruPage";
import { PindahInstansiPage } from "./pages/parent/PindahInstansiPage";
import { GuruShell } from "./pages/guru/GuruShell";
import { GuruMasukPage } from "./pages/guru/GuruMasukPage";
import { GuruAntreanPage, GuruBerandaPage, GuruEvaluasiPage, GuruMuridDetailPage, GuruMuridPage, GuruPengaturanPage } from "./pages/guru/GuruPages";
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

function tokenRole(): string | null {
  try {
    return JSON.parse(atob((getToken() ?? "").split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role ?? null;
  } catch {
    return null;
  }
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  if (tokenRole() === "teacher") return <Navigate to="/guru" replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/guru/masuk" element={<GuruMasukPage mode="masuk" />} />
      <Route path="/guru/daftar" element={<GuruMasukPage mode="daftar" />} />
      <Route path="/guru" element={<GuruShell />}>
        <Route index element={<GuruBerandaPage />} />
        <Route path="setoran" element={<GuruAntreanPage />} />
        <Route path="setoran/:id" element={<GuruEvaluasiPage />} />
        <Route path="murid" element={<GuruMuridPage />} />
        <Route path="murid/:id" element={<GuruMuridDetailPage />} />
        <Route path="pengaturan" element={<GuruPengaturanPage />} />
      </Route>
      <Route path="/gabung" element={<JoinFamilyPage />} />
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
      <Route path="/parent/keluarga" element={<RequireAuth><OrtuHubPage /></RequireAuth>} />
      <Route path="/parent/guru" element={<RequireAuth><HubungkanGuruPage /></RequireAuth>} />
      <Route path="/parent/privasi" element={<RequireAuth><PrivasiSuaraPage /></RequireAuth>} />
      <Route path="/parent/pesan" element={<RequireAuth><PesanGuruPage /></RequireAuth>} />
      <Route path="/parent/instansi" element={<RequireAuth><PindahInstansiPage /></RequireAuth>} />
      <Route path="/parent/laporan" element={<RequireAuth><WeeklyReportPage /></RequireAuth>} />
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
      <Route path="/laporan" element={<RequireAuth><Navigate to="/parent/laporan" replace /></RequireAuth>} />
    </Routes>
  );
}
