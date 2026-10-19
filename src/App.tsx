import { Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./lib/api";
import { RequireMember } from "./components/RequireMember";
import { ChooseProfilePage } from "./pages/ChooseProfilePage";
import { HomePage } from "./pages/HomePage";
import { LencanaPage } from "./pages/LencanaPage";
import { LoginPage } from "./pages/LoginPage";
import { MurojaahPage } from "./pages/MurojaahPage";
import { ParentQueuePage } from "./pages/ParentQueuePage";
import { PetaPage } from "./pages/PetaPage";
import { SetorPage } from "./pages/SetorPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TahsinPage } from "./pages/TahsinPage";
import { QuranPage } from "./pages/QuranPage";
import { QuranSurahPage } from "./pages/QuranSurahPage";
import { ZiyadahPage } from "./pages/ZiyadahPage";

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell">{children}</div>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

function RequireAuthMember({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireMember>{children}</RequireMember>
    </RequireAuth>
  );
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
      <Route
        path="/"
        element={
          <RequireAuthMember>
            <HomePage />
          </RequireAuthMember>
        }
      />
      <Route path="/peta" element={<RequireAuthMember><PetaPage /></RequireAuthMember>} />
      <Route path="/tahsin" element={<RequireAuthMember><TahsinPage /></RequireAuthMember>} />
      <Route path="/ziyadah" element={<RequireAuthMember><ZiyadahPage /></RequireAuthMember>} />
      <Route path="/murojaah" element={<RequireAuthMember><MurojaahPage /></RequireAuthMember>} />
      <Route path="/setor" element={<RequireAuthMember><SetorPage /></RequireAuthMember>} />
      <Route path="/lencana" element={<RequireAuthMember><LencanaPage /></RequireAuthMember>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
      <Route path="/parent/queue" element={<RequireAuth><ParentQueuePage /></RequireAuth>} />
      <Route path="/ujian" element={<RequireAuthMember><div className="p-4">Ujian — Segera (Fase 2)</div></RequireAuthMember>} />
      <Route path="/quran" element={<RequireAuthMember><QuranPage /></RequireAuthMember>} />
      <Route path="/quran/:surahId" element={<RequireAuthMember><QuranSurahPage /></RequireAuthMember>} />
      <Route path="/referensi" element={<RequireAuthMember><Navigate to="/quran" replace /></RequireAuthMember>} />
      <Route path="/laporan" element={<RequireAuthMember><div className="p-4">Laporan — Segera (Fase 2)</div></RequireAuthMember>} />
    </Routes>
  );
}
