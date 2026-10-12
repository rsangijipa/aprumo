import React, { useState } from 'react';
import { X, FileText, Printer, CheckCircle } from 'lucide-react';

interface RealWorldPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealWorldPurchaseModal: React.FC<RealWorldPurchaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [storeName, setStoreName] = useState('Padaria da Esquina');
  const [itemsBought, setItemsBought] = useState('4 pães franceses e 1 leite');
  const [totalSpent, setTotalSpent] = useState('R$ 8,50');
  const [promptLevel, setPromptLevel] = useState('IND');
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 37, 43, 0.55)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
      id="real-world-purchase-modal"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '92%',
          maxWidth: '680px',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '28px',
          boxShadow: '0 24px 50px rgba(0,0,0,0.25)',
          border: '2px solid var(--tinta-15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vitoria-regia)' }}>
              <FileText size={20} />
              <span style={{ fontFamily: 'var(--font-hud)', fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase' }}>
                Seção 10 · Generalização na Comunidade
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--tinta)', margin: '4px 0 0 0' }}>
              Registro de Compra Real (Critério de Domínio AFLS)
            </h2>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={24} color="var(--tinta-60)" />
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--tinta-60)' }}>
          O domínio do módulo M5 exige ao menos 2 compras reais na comunidade com ajuda mínima (padaria, mercadinho, feira).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
              Local da Compra
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--tinta-15)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
              Valor Total Pago
            </label>
            <input
              type="text"
              value={totalSpent}
              onChange={(e) => setTotalSpent(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--tinta-15)' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
            Itens Comprados
          </label>
          <input
            type="text"
            value={itemsBought}
            onChange={(e) => setItemsBought(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--tinta-15)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
            Nível Geral de Ajuda Necessário
          </label>
          <select
            value={promptLevel}
            onChange={(e) => setPromptLevel(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--tinta-15)', backgroundColor: '#FFFFFF' }}
          >
            <option value="IND">Independente (100% autônomo)</option>
            <option value="VERBAL">Dica Verbal Suave ("Confira o troco")</option>
            <option value="GEST">Dica Gestual (Apontar para a carteira)</option>
            <option value="MOD">Modelação Prévia</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
            Observações Clínicas (Interação Social no Caixa)
          </label>
          <textarea
            rows={3}
            placeholder="Descreva se o jovem cumprimentou o atendente, guardou o troco com calma e pegou a sacola..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--tinta-15)', resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <button
            onClick={() => window.print()}
            className="btn-tab"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={16} /> Imprimir Registro
          </button>

          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ padding: '10px 22px' }}
          >
            {savedSuccess ? (
              <>
                <CheckCircle size={18} /> Salvo!
              </>
            ) : (
              'Salvar Compra Real'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
