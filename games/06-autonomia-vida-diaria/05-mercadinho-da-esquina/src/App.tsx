import React, { useState, useEffect, useCallback } from 'react';
import { useGameClient } from '@aprumo/game-sdk';
import { manifest } from './manifest';
import type {
  GameModule,
  CurrencyItem,
  GroceryProduct,
  PaymentStrategy,
  SocialScriptRecord,
  AbaMoneyTrial,
} from './types/money';
import {
  DENOMINATIONS,
  GROCERY_CATALOG,
  formatBRL,
  classifyPaymentStrategy,
  calculateChange,
  generatePaymentProblem,
} from './utils/money';
import { sound } from './utils/sound';

import { CurrencyDisplay } from './components/CurrencyDisplay';
import { Shelf } from './components/Shelf';
import { ShoppingList } from './components/ShoppingList';
import { CashierCounter } from './components/CashierCounter';
import { Wallet } from './components/Wallet';
import { SocialScriptRecorder } from './components/SocialScriptRecorder';
import { RealWorldPurchaseModal } from './components/RealWorldPurchaseModal';

import confetti from 'canvas-confetti';
import {
  Store,
  FileText,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const App: React.FC = () => {
  const { client, config, paused: hostPaused, ended } = useGameClient(manifest.appId, manifest.version);
  const [activeModule, setActiveModule] = useState<GameModule>('M3');
  const [level, setLevel] = useState<number>(3);

  useEffect(() => {
    client.gameStarted(manifest.version);
  }, [client]);

  useEffect(() => {
    const soundPref = config?.adaptation?.sound;
    if (soundPref === 'off') {
      sound.setVolume(0);
    } else if (soundPref === 'low') {
      sound.setVolume(0.35);
    } else {
      sound.setVolume(1.0);
    }
  }, [config]);

  // Active Problem state
  const [targetProduct, setTargetProduct] = useState<GroceryProduct>(GROCERY_CATALOG[0]);
  const [targetPriceCents, setTargetPriceCents] = useState<number>(350);
  const [walletItems, setWalletItems] = useState<CurrencyItem[]>([]);
  const [paidItems, setPaidItems] = useState<CurrencyItem[]>([]);

  // Shopping List (for M4 and M5)
  const [shoppingTargetList, setShoppingTargetList] = useState<GroceryProduct[]>([]);
  const [basketItems, setBasketItems] = useState<GroceryProduct[]>([]);

  // Social script state (recorded by therapist during role-play)
  const [socialScript, setSocialScript] = useState<SocialScriptRecord>({
    greetedCashier: false,
    answeredBagQuestion: false,
    thankedCashier: false,
  });

  // Cashier speech
  const [cashierSpeech, setCashierSpeech] = useState<string>('Bom dia! Vai querer sacola plástica?');

  // M2 "Dá ou Não Dá?" feedback state
  const [m2Feedback, setM2Feedback] = useState<string | null>(null);

  // Modals & Audio
  const [isRealPurchaseModalOpen, setIsRealPurchaseModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Telemetry
  const [trials, setTrials] = useState<AbaMoneyTrial[]>([]);

  // Initialize or reset problem
  const initProblem = useCallback(() => {
    const prob = generatePaymentProblem(level);
    setTargetProduct(prob.product);
    setTargetPriceCents(prob.priceCents);
    setWalletItems(prob.wallet);
    setPaidItems([]);
    setM2Feedback(null);

    // M4/M5 Shopping list setup (3 random items)
    const shuffled = [...GROCERY_CATALOG].sort(() => Math.random() - 0.5);
    const list = shuffled.slice(0, 3);
    setShoppingTargetList(list);
    setBasketItems([]);

    setSocialScript({
      greetedCashier: false,
      answeredBagQuestion: false,
      thankedCashier: false,
    });

    const greeting = `Bom dia! Seu total deu ${formatBRL(prob.priceCents)}. Vai querer sacola?`;
    setCashierSpeech(greeting);
    sound.speakCashier(greeting);

    client.levelStarted({
      levelId: `modulo-${activeModule}-nivel-${level}`,
      levelIndex: level - 1,
      trialsPlanned: 5,
    });
    client.trialStarted({
      targetId: prob.product.id,
      trialIndex: trials.length,
      presented: [prob.product.id],
    });
    client.stimulusPresented({
      targetId: prob.product.id,
      trialIndex: trials.length,
      presented: [prob.product.id],
      positionOfTarget: 0,
      modality: 'visual_auditory',
    });
  }, [level, client, activeModule, trials.length]);

  useEffect(() => {
    initProblem();
  }, [initProblem, activeModule]);

  // Handle transferring cash from wallet to cashier tray
  const handleSelectFromWallet = (item: CurrencyItem) => {
    sound.playCoinClink();
    // Remove one instance from wallet
    const idx = walletItems.findIndex((w) => w.id === item.id);
    if (idx !== -1) {
      const nextWallet = [...walletItems];
      nextWallet.splice(idx, 1);
      setWalletItems(nextWallet);
      setPaidItems((prev) => [...prev, item]);
    }
  };

  // Handle returning cash from cashier tray back to wallet
  const handleRemoveFromPaid = (index: number) => {
    sound.playCoinClink();
    const item = paidItems[index];
    const nextPaid = [...paidItems];
    nextPaid.splice(index, 1);
    setPaidItems(nextPaid);
    setWalletItems((prev) => [...prev, item]);
  };

  const handleClearTray = () => {
    setWalletItems((prev) => [...prev, ...paidItems]);
    setPaidItems([]);
  };

  // Current payment strategy calculation
  const totalPaidCents = paidItems.reduce((acc, c) => acc + c.cents, 0);
  const currentStrategy: PaymentStrategy = classifyPaymentStrategy(
    targetPriceCents,
    totalPaidCents,
    paidItems.length === 1 ? paidItems[0].cents : undefined
  );

  // Handle Confirm Payment at Cashier
  const handleConfirmPayment = () => {
    const isSuccess = currentStrategy === 'exato' || currentStrategy === 'um-real-a-mais';
    const change = calculateChange(targetPriceCents, totalPaidCents);

    client.responseRecorded({
      targetId: targetProduct.id,
      stimulusId: targetProduct.id,
      trialIndex: trials.length,
      presented: [targetProduct.id],
      positionOfTarget: 0,
      selected: targetProduct.id,
      selectedPosition: 0,
      response: isSuccess ? 'correct' : 'incorrect',
      latencyMs: 2500,
      promptLevel: 'none',
      promptSource: 'none',
      detail: {
        priceCents: targetPriceCents,
        paidCents: totalPaidCents,
        strategy: currentStrategy,
        change,
      },
    });

    if (isSuccess) {
      sound.playCashRegister();
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#2D6A4F', '#0E8388', '#F4A261'],
      });

      client.reinforcerPresented({
        kind: 'visual',
        reinforcerId: 'pagamento-aprovado',
        contingentOn: 'compra-sucesso',
        intensity: 'festive',
      });
      client.levelCompleted({
        levelId: `modulo-${activeModule}-nivel-${level}`,
        levelIndex: level - 1,
        trialsCompleted: trials.length + 1,
        correct: trials.length + 1,
        outcome: 'completed',
      });

      const speech = `Pagamento aprovado! Seu troco é ${formatBRL(change)}. Muito obrigado, volte sempre!`;
      setCashierSpeech(speech);
      sound.speakCashier(speech);

      // Record trial
      const trial: AbaMoneyTrial = {
        trialId: `trial-money-${Date.now()}`,
        timestamp: Date.now(),
        module: activeModule,
        level,
        priceCents: targetPriceCents,
        paidCents: totalPaidCents,
        strategy: currentStrategy,
        changeExpectedCents: change,
        socialScript,
        isSuccess: true,
      };
      setTrials((prev) => [...prev, trial]);

      setTimeout(() => {
        initProblem();
      }, 3500);
    } else {
      // Insufficient or excess
      const msg = totalPaidCents < targetPriceCents ? 'Faltou um pouquinho de dinheiro. Confira o total!' : 'O valor foi muito acima da estratégia recomendada.';
      setCashierSpeech(msg);
      sound.speakCashier(msg);
    }
  };

  // M2 "Dá ou Não Dá?" answer
  const handleAnswerM2 = (userSaidYes: boolean) => {
    const totalWallet = walletItems.reduce((acc, c) => acc + c.cents, 0);
    const actuallyHasEnough = totalWallet >= targetPriceCents;
    const isCorrect = userSaidYes === actuallyHasEnough;

    if (isCorrect) {
      sound.playCashRegister();
      setM2Feedback('Correto! Você avaliou o saldo da carteira com precisão!');
    } else {
      setM2Feedback(actuallyHasEnough ? 'Na verdade dá sim! O saldo da carteira é suficiente.' : 'Não dá! O saldo é menor que o preço do produto.');
    }

    setTimeout(() => {
      initProblem();
    }, 2500);
  };

  // Basket handlers for M4 / M5
  const handleSelectProductForBasket = (product: GroceryProduct) => {
    sound.playCoinClink();
    setBasketItems((prev) => [...prev, product]);
  };

  const handleGoToCheckoutWithBasket = () => {
    const sum = basketItems.reduce((acc, b) => acc + b.priceCents, 0);
    setTargetPriceCents(sum);
    setActiveModule('M3'); // Switch to payment counter with basket total
  };

  const toggleMute = () => {
    sound.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (ended) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', backgroundColor: '#F4F1DE', color: '#2B2D42', fontFamily: 'system-ui' }}>
        <h2>Mercadinho da Esquina Concluído!</h2>
        <p>Parabéns por completar as compras e transações com sucesso!</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--fundo)',
        position: 'relative',
      }}
    >
      {hostPaused && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'system-ui' }}>
          <h2>Atividade pausada pelo mediador</h2>
        </div>
      )}
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '2px solid var(--tinta-15)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--buriti), var(--vitoria-regia))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(244, 162, 97, 0.3)',
            }}
          >
            <Store size={24} />
          </div>

          <div>
            <h1
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--tinta)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              ABA-06 · Mercadinho da Esquina
              <span className="badge" style={{ backgroundColor: 'rgba(14, 131, 136, 0.12)', color: 'var(--igarape)' }}>
                Módulo {activeModule}
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-teen)' }}>
              Uso de Dinheiro, Estratégia "Um Real a Mais" & Compras Funcionais (AFLS)
            </p>
          </div>
        </div>

        {/* Level and Trials Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
              Nível:
            </span>
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`btn-tab ${level === lvl ? 'active' : ''}`}
                style={{ padding: '4px 8px', minWidth: '28px', justifyContent: 'center', fontSize: '0.78rem' }}
              >
                {lvl}
              </button>
            ))}
          </div>

          {trials.length > 0 && (
            <span className="badge" style={{ backgroundColor: 'rgba(45, 106, 79, 0.15)', color: 'var(--vitoria-regia)' }}>
              {trials.length} compras concluídas
            </span>
          )}

          <div style={{ display: 'flex', border: '1.5px solid var(--tinta-15)', borderRadius: '10px', overflow: 'hidden' }}>
            <button
              onClick={() => setActiveModule('M1')}
              style={{
                padding: '6px 10px',
                border: 'none',
                background: activeModule === 'M1' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: activeModule === 'M1' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
              title="M1: Conhecer o Dinheiro"
            >
              M1 Cédulas
            </button>
            <button
              onClick={() => setActiveModule('M2')}
              style={{
                padding: '6px 10px',
                border: 'none',
                background: activeModule === 'M2' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: activeModule === 'M2' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
              title="M2: Dá ou Não Dá?"
            >
              M2 Dá ou Não?
            </button>
            <button
              onClick={() => setActiveModule('M3')}
              style={{
                padding: '6px 10px',
                border: 'none',
                background: activeModule === 'M3' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: activeModule === 'M3' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
              title="M3: Um Real a Mais"
            >
              M3 Um Real a Mais
            </button>
            <button
              onClick={() => setActiveModule('M4')}
              style={{
                padding: '6px 10px',
                border: 'none',
                background: activeModule === 'M4' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: activeModule === 'M4' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
              title="M4: Lista de Compras"
            >
              M4 Lista
            </button>
          </div>

          <button
            onClick={() => setIsRealPurchaseModalOpen(true)}
            className="btn-tab"
            style={{ padding: '6px 12px', background: 'rgba(45, 106, 79, 0.12)', color: 'var(--vitoria-regia)' }}
            id="btn-real-purchase"
          >
            <FileText size={16} /> Compra Real (Seção 10)
          </button>

          <button onClick={toggleMute} className="btn-tab" style={{ padding: '6px 10px' }}>
            {isMuted ? <VolumeX size={16} color="#E63946" /> : <Volume2 size={16} color="var(--vitoria-regia)" />}
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '20px',
        }}
      >
        {/* Module M1: Conhecer o Dinheiro */}
        {activeModule === 'M1' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 8px 24px rgba(30, 37, 43, 0.08)',
              border: '2px solid var(--tinta-15)',
              maxWidth: '820px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontFamily: 'var(--font-hud)', fontSize: '1.3rem' }}>
                Módulo M1: Identificação de Cédulas e Moedas de Treino
              </h3>
              <p style={{ margin: 0, color: 'var(--tinta-60)', fontSize: '0.9rem' }}>
                Toque em qualquer cédula ou moeda para ouvir o valor falado e praticar a discriminação de valores.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              {DENOMINATIONS.map((item) => (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <CurrencyDisplay
                    item={item}
                    scale={1.1}
                    onClick={() => sound.speakCashier(`${item.label} reais`)}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--tinta)' }}>
                    {formatBRL(item.cents)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module M2: Dá ou Não Dá? */}
        {activeModule === 'M2' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 8px 24px rgba(30, 37, 43, 0.08)',
              border: '2px solid var(--tinta-15)',
              maxWidth: '680px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              textAlign: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--buriti)', textTransform: 'uppercase' }}>
                Módulo M2 · Comparação de Valores
              </span>
              <h3 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-hud)', fontSize: '1.4rem' }}>
                O dinheiro da carteira dá para comprar este produto?
              </h3>
            </div>

            {/* Target Product Card */}
            <div
              style={{
                backgroundColor: 'var(--fundo)',
                padding: '20px',
                borderRadius: '18px',
                border: '2px solid var(--tinta-15)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '48px' }}>{targetProduct.iconEmoji}</div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{targetProduct.name}</h4>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--vitoria-regia)', marginTop: '4px' }}>
                  Preço: {formatBRL(targetPriceCents)}
                </div>
              </div>
            </div>

            {/* Wallet contents */}
            <Wallet items={walletItems} onSelectItem={() => {}} />

            {m2Feedback ? (
              <div
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(45, 106, 79, 0.12)',
                  color: 'var(--vitoria-regia)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                {m2Feedback}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '380px' }}>
                <button
                  onClick={() => handleAnswerM2(true)}
                  className="btn-primary"
                  style={{ flex: 1, height: '52px', justifyContent: 'center', fontSize: '1.05rem' }}
                >
                  Sim, Dá!
                </button>
                <button
                  onClick={() => handleAnswerM2(false)}
                  style={{
                    flex: 1,
                    height: '52px',
                    borderRadius: '12px',
                    border: '2px solid var(--tinta-15)',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--tinta)',
                    fontFamily: 'var(--font-hud)',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                  }}
                >
                  Não Dá!
                </button>
              </div>
            )}
          </div>
        )}

        {/* Module M3: Um Real a Mais (Next-Dollar Payment) */}
        {activeModule === 'M3' && (
          <div
            style={{
              display: 'flex',
              gap: '24px',
              maxWidth: '1040px',
              width: '100%',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {/* Cashier Counter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minWidth: '340px' }}>
              <CashierCounter
                totalPriceCents={targetPriceCents}
                paidItems={paidItems}
                strategy={currentStrategy}
                onRemovePaidItem={handleRemoveFromPaid}
                onClearTray={handleClearTray}
                onConfirmPayment={handleConfirmPayment}
                cashierSpeech={cashierSpeech}
              />

              {/* Social script role-play recorder */}
              <SocialScriptRecorder
                script={socialScript}
                onChange={setSocialScript}
              />
            </div>

            {/* Wallet with denominations to choose from */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minWidth: '340px' }}>
              <Wallet
                items={walletItems}
                onSelectItem={handleSelectFromWallet}
              />

              {/* Clinical Strategy Tip */}
              <div
                style={{
                  backgroundColor: 'rgba(14, 131, 136, 0.08)',
                  borderLeft: '4px solid var(--igarape)',
                  padding: '14px 18px',
                  borderRadius: '0 14px 14px 0',
                  fontSize: '0.85rem',
                  color: 'var(--tinta)',
                  lineHeight: '1.4',
                }}
              >
                <strong>Estratégia "Um Real a Mais" (Next-Dollar):</strong> Se o produto custa R$ 3,50,
                você pode pagar R$ 4,00 (ou uma cédula de R$ 5,00 se não tiver moedas) e receber o troco.
                Essa técnica reduz a sobrecarga de cálculo e desenvolve independência imediata!
              </div>
            </div>
          </div>
        )}

        {/* Module M4: Lista de Compras */}
        {activeModule === 'M4' && (
          <div
            style={{
              display: 'flex',
              gap: '24px',
              maxWidth: '1040px',
              width: '100%',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {/* Shelf */}
            <div style={{ flex: 1.5, minWidth: '360px' }}>
              <Shelf
                products={GROCERY_CATALOG}
                onSelectProduct={handleSelectProductForBasket}
              />
            </div>

            {/* Shopping List */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <ShoppingList
                basketItems={basketItems}
                targetItems={shoppingTargetList}
                onRemoveFromBasket={(idx) => {
                  const next = [...basketItems];
                  next.splice(idx, 1);
                  setBasketItems(next);
                }}
                onClearBasket={() => setBasketItems([])}
                onGoToCheckout={handleGoToCheckoutWithBasket}
              />
            </div>
          </div>
        )}
      </main>

      {/* Real Purchase Modal (Section 10) */}
      <RealWorldPurchaseModal
        isOpen={isRealPurchaseModalOpen}
        onClose={() => setIsRealPurchaseModalOpen(false)}
      />
    </div>
  );
};

export default App;
