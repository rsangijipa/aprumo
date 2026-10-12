import React, { useState } from 'react';
import type { BookConfig } from '../types/book';
import { BookConfigSchema } from '../schemas/bookSchema';
import { PRESET_BOOKS } from '../data/presetBooks';
import { X, CheckCircle, AlertTriangle, FileCode, Printer, Plus } from 'lucide-react';

interface BookBuilderModalProps {
  currentBook: BookConfig;
  onSelectBook: (book: BookConfig) => void;
  onClose: () => void;
}

export const BookBuilderModal: React.FC<BookBuilderModalProps> = ({
  currentBook,
  onSelectBook,
  onClose,
}) => {
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(currentBook, null, 2)
  );
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);

  const handleValidateAndApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const result = BookConfigSchema.safeParse(parsed);
      if (result.success) {
        setValidationResult({ valid: true });
        onSelectBook(result.data as BookConfig);
      } else {
        const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        setValidationResult({ valid: false, error: issues });
      }
    } catch (e: unknown) {
      setValidationResult({ valid: false, error: (e as Error).message });
    }
  };

  const handleLoadPreset = (book: BookConfig) => {
    setJsonText(JSON.stringify(book, null, 2));
    setValidationResult({ valid: true });
    onSelectBook(book);
  };

  const handleCreateFamilyBook = () => {
    const familyBook: BookConfig = {
      id: 'livro-familia',
      title: 'O Livro da Minha Família e Bichinhos',
      theme: 'familia',
      pages: [
        {
          pageNumber: 1,
          title: 'Quem está na sala?',
          scenery: 'fazenda',
          promptText: 'Cadê o cachorrinho Totó descansando no tapete?',
          flaps: [
            {
              id: 'flap-fam-1',
              coverLabel: 'Almofada Fofa',
              coverColor: '#f59e0b',
              xPct: 25,
              yPct: 30,
              widthPct: 34,
              heightPct: 45,
              animalId: 'cachorro',
              animalName: 'Totó de Estimação',
              onomatopoeia: 'Au-au! O Totó!',
              animalEmoji: '🐕',
              isOpen: false,
              isShaking: false,
            },
            {
              id: 'flap-fam-2',
              coverLabel: 'Cortina da Janela',
              coverColor: '#06b6d4',
              xPct: 65,
              yPct: 25,
              widthPct: 28,
              heightPct: 50,
              animalId: 'gato',
              animalName: 'Gatinho Mingau',
              onomatopoeia: 'Miau! O gatinho!',
              animalEmoji: '🐈',
              isOpen: false,
              isShaking: false,
            },
          ],
        },
      ],
    };

    setJsonText(JSON.stringify(familyBook, null, 2));
    setValidationResult({ valid: true });
    onSelectBook(familyBook);
  };

  const handlePrintCardSheet = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-window max-w-3xl">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <FileCode className="w-6 h-6 text-indigo-600" />
            <h3 className="modal-title">BookBuilder Clínico • Validador Zod</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <p className="text-sm text-slate-600">
            Monte ou personalize livros cartonados digitais. Todos os livros passam por validação rigorosa de esquema Zod para garantir parâmetros clínicos e acessibilidade de toque.
          </p>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-700">Modelos Prontos:</span>
            {PRESET_BOOKS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                  currentBook.id === b.id ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                onClick={() => handleLoadPreset(b)}
              >
                {b.title}
              </button>
            ))}

            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium flex items-center gap-1"
              onClick={handleCreateFamilyBook}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Livro da Família</span>
            </button>
          </div>

          {/* JSON Textarea */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Estrutura JSON do Livro:
            </label>
            <textarea
              className="w-full h-64 font-mono text-xs p-3 rounded-lg border border-slate-300 bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setValidationResult(null);
              }}
            />
          </div>

          {/* Validation Feedback */}
          {validationResult && (
            <div
              className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                validationResult.valid
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}
            >
              {validationResult.valid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <strong>Esquema Zod Válido!</strong> O livro está pronto e carregado no carrossel.
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <div>
                    <strong>Erro de Validação:</strong> {validationResult.error}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-sm font-medium"
            onClick={handlePrintCardSheet}
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Exportar PDF</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium"
              onClick={onClose}
            >
              Fechar
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow"
              onClick={handleValidateAndApply}
            >
              Validar e Aplicar ao Livro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
