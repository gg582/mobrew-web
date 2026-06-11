import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { TeaType } from '@/domain/enums';
import { i18n } from '@/core/i18n/TranslationManager';
import type { BrewLogEntry } from '@/domain/appTypes';
import { calculate } from './calculationMachine';

interface CsvColumn {
  key: string;
  label: string;
  getValue: (log: BrewLogEntry) => string | number | undefined;
}

const CSV_COLUMNS: CsvColumn[] = [
  { key: 'id', label: 'ID', getValue: (l) => l.id },
  { key: 'timestamp', label: 'Timestamp', getValue: (l) => new Date(l.timestamp).toISOString() },
  { key: 'teaName', label: 'Tea Name', getValue: (l) => l.teaName },
  { key: 'teaType', label: 'Tea Type', getValue: (l) => TeaType[l.teaType] ?? l.teaType },
  { key: 'temperature', label: 'Temperature (°C)', getValue: (l) => l.parameters.temperature },
  { key: 'leafMass', label: 'Leaf Mass (g)', getValue: (l) => l.parameters.leafMass },
  { key: 'waterVolume', label: 'Water Volume (ml)', getValue: (l) => l.parameters.waterVolume },
  { key: 'steepTimeSec', label: 'Steep Time (s)', getValue: (l) => l.parameters.steepTimeSec ?? '' },
  { key: 'steepCount', label: 'Steep Count', getValue: (l) => l.parameters.steepCount },
  { key: 'tds', label: 'TDS (ppm)', getValue: (l) => l.parameters.tds },
  { key: 'altitude', label: 'Altitude (m)', getValue: (l) => l.parameters.altitude },
  { key: 'leafSize', label: 'Leaf Size (mm)', getValue: (l) => l.parameters.leafSize },
  { key: 'rating', label: 'Rating', getValue: (l) => l.rating },
  { key: 'notes', label: 'Notes', getValue: (l) => l.notes },
  { key: 'catechin', label: 'Catechin (mg)', getValue: (l) => l.composition.catechin },
  { key: 'theanine', label: 'Theanine (mg)', getValue: (l) => l.composition.theanine },
  { key: 'caffeine', label: 'Caffeine (mg)', getValue: (l) => l.composition.caffeine },
  { key: 'pectin', label: 'Pectin (mg)', getValue: (l) => l.composition.pectin },
  { key: 'polysaccharide', label: 'Polysaccharide (mg)', getValue: (l) => l.composition.polysaccharide },
  { key: 'aroma', label: 'Aroma (mg)', getValue: (l) => l.composition.aroma },
  { key: 'balanceScore', label: 'Balance Score', getValue: (l) => l.balanceScore },
  { key: 'extractionYield', label: 'Extraction Yield (%)', getValue: (l) => l.extractionYield },
  { key: 'strength', label: 'Strength', getValue: (l) => l.strength },
  { key: 'clarityIndex', label: 'Clarity Index', getValue: (l) => l.clarityIndex },
];

function csvEscape(value: string): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportBrewLogsToCsv(logs: BrewLogEntry[]): Blob {
  const header = CSV_COLUMNS.map((col) => csvEscape(col.label)).join(',');
  const rows = logs.map((log) =>
    CSV_COLUMNS.map((col) => csvEscape(String(col.getValue(log) ?? ''))).join(',')
  );
  const csv = [header, ...rows].join('\n');
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

export function generateBrewReportPdf(log: BrewLogEntry): jsPDF {
  const doc = new jsPDF();
  const teaTypeName = TeaType[log.teaType] ?? String(log.teaType);
  const calc = calculate(log);

  doc.setFontSize(18);
  doc.text('Brew Report', 14, 20);
  doc.setFontSize(11);
  doc.text(`${log.teaName}  •  ${teaTypeName}`, 14, 28);
  doc.text(`Brewed at ${new Date(log.timestamp).toLocaleString()}`, 14, 34);

  autoTable(doc, {
    startY: 40,
    head: [['Parameter', 'Value']],
    body: [
      ['Tea Type', teaTypeName],
      ['Temperature', `${log.parameters.temperature} °C`],
      ['Leaf Mass', `${log.parameters.leafMass} g`],
      ['Water Volume', `${log.parameters.waterVolume} ml`],
      [
        'Steep Time',
        log.parameters.steepTimeSec != null ? `${log.parameters.steepTimeSec} s` : '-',
      ],
      ['Steep Count', String(log.parameters.steepCount)],
      ['TDS', `${log.parameters.tds} ppm`],
      ['Altitude', `${log.parameters.altitude} m`],
      ['Leaf Size', `${log.parameters.leafSize} mm`],
      ['Rating', `${log.rating} / 5`],
    ],
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  const compositionY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 100;

  autoTable(doc, {
    startY: compositionY + 10,
    head: [['Component', 'Amount (mg)']],
    body: [
      ['Catechin', log.composition.catechin.toFixed(2)],
      ['Theanine', log.composition.theanine.toFixed(2)],
      ['Caffeine', log.composition.caffeine.toFixed(2)],
      ['Pectin', log.composition.pectin.toFixed(2)],
      ['Polysaccharide', log.composition.polysaccharide.toFixed(2)],
      ['Aroma', log.composition.aroma.toFixed(2)],
    ],
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  const metricsY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 160;

  autoTable(doc, {
    startY: metricsY + 10,
    head: [['Metric', 'Value']],
    body: [
      ['Extraction Yield', `${calc.extractionYieldPercent.toFixed(2)} %`],
      [
        'Ideal Yield Range',
        `${calc.idealYieldRange[0]} % – ${calc.idealYieldRange[1]} %`,
      ],
      ['TDS Estimate', `${calc.tdsMgMl.toFixed(2)} mg/ml`],
      ['Balance Score', calc.balanceScore.toFixed(1)],
      ['Strength', calc.strength],
      [
        'Suggestion',
        calc.suggestionKey ? i18n.t(calc.suggestionKey) : '-',
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  return doc;
}
export default { exportBrewLogsToCsv, generateBrewReportPdf };
