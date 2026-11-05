import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DateRange {
  id: string;     // 'hoy' | 'finde' | '7d' | 'mes' | 'custom'
  from: string;   // 'YYYY-MM-DD'
  to: string;
}

interface Preset {
  id: string;
  label: string;
  icon: string;
  range: (today: Date) => [Date, Date];
}

// --- utilidades de fechas ---
const toIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './date-filter.html',
  styleUrl: './date-filter.css',
})
export class DateFilterComponent {
  private host = inject(ElementRef);

  /** Emite el rango cuando el usuario toca "Aplicar fecha" */
  @Output() applied = new EventEmitter<DateRange>();

  readonly presets: Preset[] = [
    { id: 'hoy', label: 'Hoy', icon: '📌', range: t => [t, t] },
    {
      id: 'finde', label: 'Este finde', icon: '📅',
      range: t => {
        const dow = t.getDay(); // 0 = domingo ... 6 = sábado
        if (dow === 0) return [addDays(t, -1), t];
        const sat = addDays(t, 6 - dow);
        return [sat, addDays(sat, 1)];
      },
    },
    { id: '7d', label: 'Próximos 7 días', icon: '🔁', range: t => [t, addDays(t, 6)] },
    {
      id: 'mes', label: 'Este mes', icon: '🗓️',
      range: t => [
        new Date(t.getFullYear(), t.getMonth(), 1),
        new Date(t.getFullYear(), t.getMonth() + 1, 0),
      ],
    },
  ];

  // --- estado ---
  open = signal(false);
  current = signal<DateRange>(this.buildFromPreset('hoy')); // lo ya aplicado
  draft = signal<DateRange>(this.current());                // lo que se edita en el menú

  // etiqueta del botón
  label = () => {
    const c = this.current();
    return this.presets.find(p => p.id === c.id)?.label ?? `${c.from} → ${c.to}`;
  };

  // --- acciones ---
  toggle() {
    if (this.open()) { this.close(); return; }
    this.draft.set({ ...this.current() }); // al abrir, partimos de lo aplicado
    this.open.set(true);
  }

  close() {
    this.open.set(false);
  }

  selectPreset(id: string) {
    this.draft.set(this.buildFromPreset(id));
  }

  // Si el usuario cambia un input a mano, ya no es un preset
  onManualChange(from: string, to: string) {
    this.draft.set({ id: 'custom', from, to });
  }

  apply() {
    const d = this.draft();
    if (d.from > d.to) return; // el formato ISO se compara bien como string
    this.current.set(d);
    this.applied.emit(d);
    this.close();
  }

  // --- cerrar al hacer click afuera / con Escape ---
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(e.target)) this.close();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.close();
  }

  // --- helper ---
  private buildFromPreset(id: string): DateRange {
    const preset = this.presets.find(p => p.id === id)!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [from, to] = preset.range(today);
    return { id, from: toIso(from), to: toIso(to) };
  }

  @Input() set initialPreset(id: string) {
  const range = this.buildFromPreset(id);
  this.current.set(range);
  this.draft.set(range);
  }
}