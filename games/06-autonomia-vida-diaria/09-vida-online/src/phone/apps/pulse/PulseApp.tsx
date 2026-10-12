import React, { useEffect, useRef } from 'react';
import { Brain, BookOpen, Volume2, Search, ArrowLeft, MoreVertical, Eye, ShieldCheck } from 'lucide-react';
import { useNarrativeStore } from '../../../narrative/engine/narrativeStore';
import { EPISODES } from '../../../narrative/content/episodes';
import { CHARACTERS } from '../../../narrative/content/characters';
import { CharacterAvatar } from '../../../assets/svg/Avatars';
import { speechReader } from '../../../ui/accessibility/SpeechReader';

export const PulseApp: React.FC = () => {
  const {
    currentEpisodeId,
    currentNodeId,
    currentPerspective,
    isTyping,
    makeChoice,
    setModal,
    closeApp,
    switchPerspective,
    resetPerspective,
    settings
  } = useNarrativeStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentEp = EPISODES.find((e) => e.id === currentEpisodeId);
  const currentNode = currentEp?.nodes[currentNodeId];
  const partner = currentEp ? CHARACTERS[currentEp.chatPartnerId] : null;

  // Rolar para a mensagem mais recente suavemente
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentNode?.messages, isTyping]);

  // Se TTS estiver ativado, ler última mensagem de contato
  useEffect(() => {
    if (settings.speechEnabled && currentNode?.messages.length) {
      const lastMsg = currentNode.messages[currentNode.messages.length - 1];
      if (lastMsg && lastMsg.senderType === 'contact') {
        speechReader.speak(lastMsg.text);
      }
    }
  }, [currentNodeId, settings.speechEnabled]);

  const handleSpeak = (text: string) => {
    speechReader.speak(text);
  };

  const isPerspectiveSwitched = currentPerspective !== 'player';

  return (
    <div className="flex flex-col h-full bg-[var(--bg-nexo-screen)] text-[var(--text-primary)] relative select-none">
      {/* Barra Superior / Header do Pulse */}
      <header className="px-4 py-3 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <button
            onClick={closeApp}
            aria-label="Voltar para a tela inicial"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          {partner && (
            <button
              onClick={() => setModal('profile', partner.id)}
              className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity"
            >
              <div className="relative">
                <CharacterAvatar id={partner.avatarId} size={38} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--primitive-color-turquesa-500)] ring-2 ring-[var(--bg-surface-elevated)]" />
              </div>
              <div className="leading-tight">
                <span className="text-xs font-bold block text-[var(--text-primary)] truncate max-w-[130px] sm:max-w-[180px]">
                  {partner.name}
                </span>
                <span className="text-[10px] text-[var(--primitive-color-turquesa-400)] block truncate max-w-[130px]">
                  {isTyping ? 'digitando...' : partner.status}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModal('pensar_antes')}
            title="Checklist Pensar Antes"
            className="p-2 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-[var(--primitive-color-azul-glow)] text-[var(--primitive-color-azul-400)] border border-[var(--border-subtle)] transition-colors flex items-center gap-1 text-[11px] font-semibold"
          >
            <Brain size={15} />
            <span className="hidden sm:inline">Pensar Antes</span>
          </button>

          <button
            onClick={() => setModal('context_drawer')}
            title="Ver Contexto & Fatos"
            className="p-2 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] transition-colors"
          >
            <BookOpen size={16} />
          </button>

          <button
            onClick={() => setModal('minigame_url')}
            title="Detetive Digital"
            className="p-2 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-[var(--primitive-color-turquesa-glow)] text-[var(--primitive-color-turquesa-400)] border border-[var(--border-subtle)] transition-colors"
          >
            <Search size={16} />
          </button>
        </div>
      </header>

      {/* Banner de Alternância de Perspectiva (ex: Episódio 6) */}
      {currentNode?.perspectiveSwitch && (
        <div className="bg-[var(--primitive-color-lilas-glow)] border-b border-[var(--primitive-color-lilas-500)]/40 px-4 py-2 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-[var(--primitive-color-lilas-400)]">
            <Eye size={16} />
            <span className="font-semibold">Contexto Revelado: Tela de {currentNode.perspectiveSwitch.characterName}</span>
          </div>
          <button
            onClick={resetPerspective}
            className="px-2.5 py-1 rounded-lg bg-[var(--primitive-color-lilas-500)] text-white text-[11px] font-medium"
          >
            Voltar ao Meu Chat
          </button>
        </div>
      )}

      {/* Área da Conversa / Thread */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Carimbo de Início de Episódio */}
        <div className="text-center my-2">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
            {currentEp?.title} • {currentEp?.theme}
          </span>
        </div>

        {/* Mensagens do Nó Atual */}
        {currentNode?.messages.map((msg) => {
          const isPlayer = msg.senderType === 'player';
          const isSystem = msg.senderType === 'system';
          const senderChar = CHARACTERS[msg.senderId];

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2 animate-fade-in">
                <div className="max-w-[85%] px-3.5 py-2 rounded-xl bg-[var(--chat-bubble-system-bg)] border border-[var(--border-subtle)] text-[11px] text-[var(--chat-bubble-system-text)] flex items-start gap-2 leading-relaxed">
                  <ShieldCheck size={14} className="text-[var(--primitive-color-turquesa-400)] shrink-0 mt-0.5" />
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 animate-slide-up ${isPlayer ? 'justify-end' : 'justify-start'}`}
            >
              {!isPlayer && senderChar && (
                <button
                  onClick={() => setModal('profile', senderChar.id)}
                  aria-label={`Perfil de ${senderChar.name}`}
                  className="shrink-0 mb-1 hover:opacity-80 transition-opacity"
                >
                  <CharacterAvatar id={senderChar.avatarId} size={30} />
                </button>
              )}

              <div className="max-w-[80%] sm:max-w-[70%] group relative">
                {!isPlayer && (
                  <span className="text-[10px] text-[var(--text-muted)] ml-1 mb-0.5 block font-medium">
                    {senderChar?.name || msg.senderId}
                  </span>
                )}

                <div
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative ${
                    isPlayer
                      ? 'bg-[var(--chat-bubble-sent-bg)] text-[var(--chat-bubble-sent-text)] rounded-br-xs'
                      : 'bg-[var(--chat-bubble-received-bg)] text-[var(--chat-bubble-received-text)] rounded-bl-xs border border-[var(--border-subtle)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] opacity-70">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      title="Ouvir em voz alta"
                      className="hover:opacity-100 transition-opacity p-0.5"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicador de Digitação (Typing Indicator) */}
        {isTyping && partner && (
          <div className="flex items-end gap-2 animate-fade-in">
            <CharacterAvatar id={partner.avatarId} size={30} />
            <div className="px-4 py-3 rounded-2xl rounded-bl-xs bg-[var(--chat-bubble-received-bg)] border border-[var(--border-subtle)] flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* ChoiceTray: Bandeja de Escolhas do Jogador */}
      <footer className="p-3 sm:p-4 bg-[var(--bg-surface-elevated)] border-t border-[var(--border-subtle)] space-y-2 z-10">
        {currentNode?.choices && currentNode.choices.length > 0 ? (
          <>
            <span className="block text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">
              Sua Resposta:
            </span>
            <div className="space-y-2">
              {currentNode.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => makeChoice(choice)}
                  disabled={isTyping}
                  className="w-full text-left p-3 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-[var(--primitive-color-azul-glow)] border border-[var(--border-subtle)] hover:border-[var(--primitive-color-azul-500)] text-xs text-[var(--text-primary)] transition-all flex flex-col justify-center gap-1 group active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] disabled:opacity-50"
                >
                  <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primitive-color-azul-400)] transition-colors">
                    {choice.label}
                  </span>
                  {choice.description && (
                    <span className="text-[11px] text-[var(--text-muted)] leading-tight">
                      {choice.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="py-2 text-center text-xs text-[var(--text-muted)]">
            Aguardando novas mensagens...
          </div>
        )}
      </footer>
    </div>
  );
};
