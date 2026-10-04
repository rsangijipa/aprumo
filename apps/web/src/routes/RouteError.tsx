import { Link, isRouteErrorResponse, useRouteError } from 'react-router';
import { Logo } from '@aprumo/ui';

/** Erro de rota: mensagem clara, sem expor detalhes técnicos ao usuário. */
export default function RouteError() {
  const error = useRouteError();
  const notFound = error == null || (isRouteErrorResponse(error) && error.status === 404);
  if (!notFound) console.error(error);
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div className="ap-stack" style={{ maxWidth: 440, textAlign: 'center', justifyItems: 'center' }}>
        <Logo />
        <h1 style={{ fontSize: 'var(--ap-text-2xl)' }}>{notFound ? 'Página não encontrada' : 'Algo deu errado nesta tela'}</h1>
        <p className="ap-muted">
          {notFound ? 'O endereço não existe ou foi movido.' : 'Os registros já salvos continuam guardados no aparelho e serão sincronizados. Tente voltar e abrir a tela de novo.'}
        </p>
        <Link className="ap-btn ap-btn--primary" to="/app">Voltar ao início</Link>
      </div>
    </main>
  );
}
