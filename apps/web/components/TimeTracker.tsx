"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Clock, Play, Pause, X, Plus } from 'lucide-react';

interface TimeEntry {
  id: string;
  description: string;
  hours: string | number;
  rate_per_hour?: number | null;
  billable: boolean;
  activity_date: string;
}

interface TimeTrackerProps {
  matterId: string;
  totalHours?: number;
  entries?: TimeEntry[];
  onEntriesChange?: (entries: TimeEntry[]) => void;
}

export default function TimeTracker({ matterId, totalHours = 0, entries = [], onEntriesChange }: TimeTrackerProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState('');
  const [ratePerHour, setRatePerHour] = useState<number>(150);
  const [isBillable, setIsBillable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [allEntries, setAllEntries] = useState<TimeEntry[]>(entries);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  function formatTime(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function getHours(sec: number) {
    return (sec / 3600).toFixed(2);
  }

  async function saveTimeEntry() {
    if (!description.trim()) {
      toast.error('Descreva a atividade');
      return;
    }

    if (seconds === 0) {
      toast.error('Cronômetro parado - nenhum tempo registado');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const hours = parseFloat(getHours(seconds));

      const res = await fetch(`${API_URL}/time-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          matter_id: matterId,
          description: description.trim(),
          hours,
          rate_per_hour: ratePerHour,
          billable: isBillable,
          activity_date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!res.ok) throw new Error('Falha ao gravar tempo');

      const newEntry = await res.json();
      setAllEntries([newEntry, ...allEntries]);
      onEntriesChange?.([newEntry, ...allEntries]);

      // Reset
      setSeconds(0);
      setDescription('');
      setIsTimerRunning(false);
      toast.success(`${hours}h registado com sucesso`);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao gravar');
    } finally {
      setLoading(false);
    }
  }

  async function deleteEntry(id: string) {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/time-entries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      if (!res.ok) throw new Error('Falha ao eliminar');

      const updatedEntries = allEntries.filter((e) => e.id !== id);
      setAllEntries(updatedEntries);
      onEntriesChange?.(updatedEntries);
      toast.success('Registo eliminado');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao eliminar');
    } finally {
      setLoading(false);
    }
  }

  const totalEntryHours = allEntries.reduce((sum, e) => sum + parseFloat(String(e.hours || 0)), 0);

  return (
    <div className="space-y-4">
      {/* Timer Display */}
      <div className="bg-gradient-to-br from-navy to-slate-800 text-white p-6 rounded border-2 border-amber-500">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold mb-4">{formatTime(seconds)}</div>
          <p className="text-amber-300 text-sm mb-4">{getHours(seconds)} horas</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-4 py-2 bg-amber-500 text-navy font-bold rounded hover:bg-amber-600 flex items-center gap-2"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isTimerRunning ? 'Parar' : 'Iniciar'}
            </button>
            <button
              onClick={() => {
                setSeconds(0);
                setIsTimerRunning(false);
              }}
              className="px-4 py-2 bg-slate-600 text-white font-bold rounded hover:bg-slate-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Entry Form */}
      <div className="bg-white border-2 border-navy p-4 space-y-3">
        <div>
          <label className="block text-xs font-bold uppercase text-navy mb-2">Descrição da atividade</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Análise de documentação, redação de petição..."
            className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-navy"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-navy mb-2">Valor/hora (€)</label>
            <input
              type="number"
              value={ratePerHour}
              onChange={(e) => setRatePerHour(parseInt(e.target.value) || 0)}
              min={0}
              className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-navy"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-xs font-bold uppercase text-navy">Faturável</span>
            </label>
          </div>
        </div>

        <button
          onClick={saveTimeEntry}
          disabled={loading || seconds === 0}
          className="w-full px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Registar tempo
        </button>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 border-2 border-slate-300 p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold uppercase text-navy">Total de tempo registado</h3>
          <span className="text-2xl font-bold text-navy">{totalEntryHours.toFixed(2)}h</span>
        </div>
        <p className="text-xs text-slate-500">{allEntries.length} registos</p>
      </div>

      {/* Entries List */}
      {allEntries.length > 0 && (
        <div className="bg-white border-2 border-navy p-4">
          <h3 className="text-sm font-bold uppercase text-navy mb-3">Histórico</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded text-sm"
              >
                <div className="flex-1">
                  <p className="font-bold text-navy">{entry.description}</p>
                  <p className="text-xs text-slate-500">
                    {entry.hours}h {entry.rate_per_hour ? `@ €${entry.rate_per_hour}/h` : ''} • {new Date(entry.activity_date).toLocaleDateString('pt-PT')}
                  </p>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
