import React from 'react';
import { 
  Eye, 
  Volume2, 
  Hand, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  BookOpen, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

interface AdultControlStripProps {
  canReveal: boolean;
  isFlapOpen: boolean;
  showAdultPointer: boolean;
  isExpectantPause: boolean;
  currentPage: number;
  totalPages: number;
  onRevealFlap: () => void;
  onRepeatSound: () => void;
  onTogglePointer: () => void;
  onTriggerExpectantPause: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPlayfulVariation: () => void;
  onOpenBookBuilder: () => void;
  onOpenDashboard: () => void;
  onCloseSession: () => void;
}

export const AdultControlStrip: React.FC<AdultControlStripProps> = ({
  canReveal,
  isFlapOpen,
  showAdultPointer,
  isExpectantPause,
  currentPage,
  totalPages,
  onRevealFlap,
  onRepeatSound,
  onTogglePointer,
  onTriggerExpectantPause,
  onPrevPage,
  onNextPage,
  onPlayfulVariation,
  onOpenBookBuilder,
  onOpenDashboard,
  onCloseSession,
}) => {
  return (
    <aside className="adult-control-strip" aria-label="Controles do Mediador Adulto">
      <div className="adult-strip-header">
        <span className="adult-strip-tag">Controles do Adulto (ESDM)</span>
        <span className="adult-strip-tip">Tablet compartilhado • Você guia a atenção</span>
      </div>

      <div className="adult-controls-grid">
        {/* Revelar Aba */}
        <button
          type="button"
          className={`adult-action-btn ${isFlapOpen ? 'btn-opened' : 'btn-reveal'} ${!canReveal ? 'opacity-50' : ''}`}
          onClick={onRevealFlap}
          disabled={!canReveal}
          title="Levantar a aba selecionada devagar e tocar o som"
        >
          <Eye className="w-5 h-5 text-amber-500" />
          <span>{isFlapOpen ? 'Aba Aberta' : 'Revelar Aba'}</span>
        </button>

        {/* Repetir Som */}
        <button
          type="button"
          className="adult-action-btn btn-sound"
          onClick={onRepeatSound}
          title="Repetir som do animal e onomatopeia"
        >
          <Volume2 className="w-5 h-5 text-emerald-500" />
          <span>Repetir Som</span>
        </button>

        {/* Modo Ponteiro do Adulto */}
        <button
          type="button"
          className={`adult-action-btn ${showAdultPointer ? 'btn-active-pointer' : 'btn-pointer'}`}
          onClick={onTogglePointer}
          title="Exibir mão desenhada apontando para ensinar a seguir o apontar"
        >
          <Hand className="w-5 h-5 text-indigo-500" />
          <span>{showAdultPointer ? 'Ocultar Mão' : 'Mão Apontando'}</span>
        </button>

        {/* Pausa Expectante */}
        <button
          type="button"
          className={`adult-action-btn ${isExpectantPause ? 'btn-pause-active' : 'btn-pause'}`}
          onClick={onTriggerExpectantPause}
          title="Pausa de 4s com olhar expressivo esperando a iniciativa da criança"
        >
          <Clock className="w-5 h-5 text-orange-500" />
          <span>{isExpectantPause ? 'Pausa Ativa...' : 'Pausa Expectante'}</span>
        </button>

        {/* Variação Lúdica */}
        <button
          type="button"
          className="adult-action-btn btn-variation"
          onClick={onPlayfulVariation}
          title="Introduzir variação cômica ou pergunta diferente"
        >
          <Shuffle className="w-5 h-5 text-purple-500" />
          <span>Variação Lúdica</span>
        </button>

        {/* Navegação de Página */}
        <div className="page-nav-group">
          <button
            type="button"
            className="adult-nav-btn"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            title="Página Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="page-nav-indicator">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="adult-nav-btn"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            title="Próxima Página"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Editor de Livros JSON */}
        <button
          type="button"
          className="adult-action-btn btn-secondary"
          onClick={onOpenBookBuilder}
          title="Criar ou editar livros em formato JSON"
        >
          <BookOpen className="w-5 h-5 text-blue-500" />
          <span>Livros & JSON</span>
        </button>

        {/* Dashboard Clínico */}
        <button
          type="button"
          className="adult-action-btn btn-secondary"
          onClick={onOpenDashboard}
          title="Ver métricas de atenção conjunta e episódios"
        >
          <BarChart3 className="w-5 h-5 text-teal-500" />
          <span>Métricas</span>
        </button>

        {/* Encerrar Sessão */}
        <button
          type="button"
          className="adult-action-btn btn-close"
          onClick={onCloseSession}
          title="Encerrar leitura e transicionar para o livro físico real"
        >
          <LogOut className="w-5 h-5 text-rose-500" />
          <span>Fechar Livro</span>
        </button>
      </div>
    </aside>
  );
};
