import { Link, isRouteErrorResponse, useLocation, useNavigate, useRouteError } from 'react-router';
import { Logo } from '@aprumo/ui';

/** Destino de "início" conforme a área em que o erro aconteceu (evita mandar a família ou o público para o painel). */
function homeFor(pathname: string): { to: string; label: string } {
  if (pathname.startsWith('/app')) return { to: '/app', label: 'Ir para o painel' };
  if (pathname.startsWith('/familia')) return { to: '/familia', label: 'Ir para o portal da família' };
  const space = pathname.match(/^\/espaco\/([^/]+)/);
  if (space) return { to: `/espaco/${space[1]}`, label: 'Voltar ao espaço' };
  if (pathname.startsWith('/crianca')) return { to: '/app', label: 'Voltar ao painel do adulto' };
  return { to: '/', label: 'Ir para a página inicial' };
}

/** Erro de rota: mensagem clara, sem expor detalhes técnicos ao usuário. */
export default function RouteError() {
  const error = useRouteError();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const notFound = error == null || (isRouteErrorResponse(error) && error.status === 404);
  if (!notFound) console.error(error);
  const home = homeFor(pathname);
  const canGoBack = typeof window !== 'undefined' && window.history.length > 1;
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div className="ap-stack" style={{ maxWidth: 440, textAlign: 'center', justifyItems: 'center' }}>
        <Logo href={home.to} />
        <h1 style={{ fontSize: 'var(--ap-text-2xl)' }}>{notFound ? 'Página não encontrada' : 'Algo deu errado nesta tela'}</h1>
        <p className="ap-muted">
          {notFound ? 'O endereço não existe ou foi movido.' : 'Os registros já salvos continuam guardados no aparelho e serão sincronizados. Tente voltar e abrir a tela de novo.'}
        </p>
        <div className="ap-row" style={{ gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {canGoBack && (
            <button type="button" className="ap-btn" onClick={() => navigate(-1)}>
              Voltar
            </button>
          )}
          <Link className="ap-btn ap-btn--primary" to={home.to}>{home.label}</Link>
        </div>
      </div>
    </main>
  );
}
