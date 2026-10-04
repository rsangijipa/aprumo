import { StrictMode, lazy, Suspense, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/fraunces';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@aprumo/ui/tokens.css';
import '@aprumo/ui/base.css';
import '@aprumo/ui/components.css';
import './styles/app.css';
import { Landing } from './routes/public/Landing';
import RouteError from './routes/RouteError';

// Cada superfície carrega só o próprio código: a área infantil não baixa a profissional e vice-versa.
const Login = lazy(() => import('./routes/public/Login'));
const ProdutoPage = lazy(() => import('./routes/public/pages/ProdutoPage'));
const ProfissionaisPage = lazy(() => import('./routes/public/pages/ProfissionaisPage'));
const FamiliasPage = lazy(() => import('./routes/public/pages/FamiliasPage'));
const CriancasPage = lazy(() => import('./routes/public/pages/CriancasPage'));
const AdolescentesPage = lazy(() => import('./routes/public/pages/AdolescentesPage'));
const RecursosPage = lazy(() => import('./routes/public/pages/RecursosPage'));
const GamesPage = lazy(() => import('./routes/public/pages/GamesPage'));
const ComoFuncionaPage = lazy(() => import('./routes/public/pages/ComoFuncionaPage'));
const SupervisaoPage = lazy(() => import('./routes/public/pages/SupervisaoPage'));
const DadosMetricasPage = lazy(() => import('./routes/public/pages/DadosMetricasPage'));
const SegurancaPage = lazy(() => import('./routes/public/pages/SegurancaPage'));
const SobrePage = lazy(() => import('./routes/public/pages/SobrePage'));
const AjudaPage = lazy(() => import('./routes/public/pages/AjudaPage'));
const ContatoPage = lazy(() => import('./routes/public/pages/ContatoPage'));

const ProLayout = lazy(() => import('./routes/pro/ProLayout'));
const Home = lazy(() => import('./routes/pro/Home'));
const Cases = lazy(() => import('./routes/pro/Cases'));
const CaseLayout = lazy(() => import('./routes/pro/CaseLayout'));
const CaseOverview = lazy(() => import('./routes/pro/CaseOverview'));
const CasePlan = lazy(() => import('./routes/pro/CasePlan'));
const CaseData = lazy(() => import('./routes/pro/CaseData'));
const CaseSessions = lazy(() => import('./routes/pro/CaseSessions'));
const CaseFamily = lazy(() => import('./routes/pro/CaseFamily'));
const CaseDocuments = lazy(() => import('./routes/pro/CaseDocuments'));
const CaseReinforcers = lazy(() => import('./routes/pro/CaseReinforcers'));
const CaseBehavior = lazy(() => import('./routes/pro/CaseBehavior'));
const CaseProfile = lazy(() => import('./routes/pro/CaseProfile'));
const NewCase = lazy(() => import('./routes/pro/NewCase'));
const Supervision = lazy(() => import('./routes/pro/Supervision'));
const Team = lazy(() => import('./routes/pro/Team'));
const Settings = lazy(() => import('./routes/pro/Settings'));
const Alerts = lazy(() => import('./routes/pro/Alerts'));
const Library = lazy(() => import('./routes/pro/Library'));
const SessionRunner = lazy(() => import('./routes/pro/SessionRunner'));
const ChildShell = lazy(() => import('./routes/child/ChildShell'));
const FamilyPortal = lazy(() => import('./routes/family/FamilyPortal'));
const ChildSpace = lazy(() => import('./routes/space/ChildSpace'));
const PlayShell = lazy(() => import('./routes/space/PlayShell'));
const PlanBuilder = lazy(() => import('./routes/pro/PlanBuilder'));

const Loading = () => (
  <div className="ap-loading" role="status" aria-live="polite">
    <span className="ap-visually-hidden">Carregando…</span>
  </div>
);
const s = (el: ReactNode) => <Suspense fallback={<Loading />}>{el}</Suspense>;

const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/entrar', element: s(<Login />) },
      { path: '/produto', element: s(<ProdutoPage />) },
      { path: '/profissionais', element: s(<ProfissionaisPage />) },
      { path: '/familias', element: s(<FamiliasPage />) },
      { path: '/criancas', element: s(<CriancasPage />) },
      { path: '/adolescentes', element: s(<AdolescentesPage />) },
      { path: '/recursos-terapeuticos', element: s(<RecursosPage />) },
      { path: '/games', element: s(<GamesPage />) },
      { path: '/como-funciona', element: s(<ComoFuncionaPage />) },
      { path: '/supervisao-clinica', element: s(<SupervisaoPage />) },
      { path: '/dados-metricas', element: s(<DadosMetricasPage />) },
      { path: '/seguranca-privacidade', element: s(<SegurancaPage />) },
      { path: '/sobre', element: s(<SobrePage />) },
      { path: '/ajuda', element: s(<AjudaPage />) },
      { path: '/contato', element: s(<ContatoPage />) },
      // Aliases curtos citados na documentação e em materiais impressos.
      { path: '/recursos', element: <Navigate to="/recursos-terapeuticos" replace /> },
      { path: '/supervisao', element: <Navigate to="/supervisao-clinica" replace /> },
      { path: '/seguranca', element: <Navigate to="/seguranca-privacidade" replace /> },
      {
        path: '/app',
        element: s(<ProLayout />),
        children: [
          { index: true, element: s(<Home />) },
          { path: 'casos', element: s(<Cases />) },
          { path: 'casos/novo', element: s(<NewCase />) },
          {
            path: 'casos/:caseId',
            element: s(<CaseLayout />),
            children: [
              { index: true, element: s(<CaseOverview />) },
              { path: 'plano', element: s(<CasePlan />) },
              { path: 'dados', element: s(<CaseData />) },
              { path: 'sessoes', element: s(<CaseSessions />) },
              { path: 'comportamento', element: s(<CaseBehavior />) },
              { path: 'reforcadores', element: s(<CaseReinforcers />) },
              { path: 'perfil', element: s(<CaseProfile />) },
              { path: 'familia', element: s(<CaseFamily />) },
              { path: 'documentos', element: s(<CaseDocuments />) },
            ],
          },
          { path: 'alertas', element: s(<Alerts />) },
          { path: 'recursos', element: s(<Library />) },
          { path: 'ferramentas/plano-individual', element: s(<PlanBuilder />) },
          { path: 'supervisao', element: s(<Supervision />) },
          { path: 'equipe', element: s(<Team />) },
          { path: 'configuracoes', element: s(<Settings />) },
        ],
      },
      { path: '/app/sessao/:sessionId', element: s(<SessionRunner />) },
      { path: '/crianca/:sessionId', element: s(<ChildShell />) },
      { path: '/familia', element: s(<FamilyPortal />) },
      { path: '/espaco/:childId', element: s(<ChildSpace />) },
      { path: '/espaco/:childId/jogar/:appId', element: s(<PlayShell />) },
      { path: '*', element: <RouteError /> },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
