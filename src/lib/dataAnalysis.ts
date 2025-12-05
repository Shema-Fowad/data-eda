import * as ss from 'simple-statistics';

export interface DataProfile {
  shape: { rows: number; columns: number };
  columns: string[];
  dataTypes: Record<string, string>;
  missingValues: Record<string, number>;
  duplicates: number;
  numericStats: Record<string, NumericStats>;
  categoricalStats: Record<string, CategoryCount[]>;
  outliers: Record<string, OutlierInfo>;
  correlations: Record<string, Record<string, number>>;
  distributions: Record<string, DistributionBin[]>;
}

export interface NumericStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
}

export interface CategoryCount {
  value: string;
  count: number;
  percentage: number;
}

export interface OutlierInfo {
  count: number;
  percentage: number;
  lowerBound: number;
  upperBound: number;
}

export interface DistributionBin {
  bin: string;
  count: number;
}

function inferDataType(values: unknown[]): string {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return 'unknown';

  const sample = nonNullValues.slice(0, 100);
  let numericCount = 0;
  let dateCount = 0;
  let boolCount = 0;

  for (const val of sample) {
    const strVal = String(val).trim();
    
    // Check boolean
    if (['true', 'false', '0', '1', 'yes', 'no'].includes(strVal.toLowerCase())) {
      boolCount++;
      continue;
    }
    
    // Check numeric
    if (!isNaN(Number(strVal)) && strVal !== '') {
      numericCount++;
      continue;
    }
    
    // Check date
    const dateRegex = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}|^\d{2}-\d{2}-\d{4}/;
    if (dateRegex.test(strVal) || !isNaN(Date.parse(strVal))) {
      dateCount++;
    }
  }

  const total = sample.length;
  if (numericCount / total > 0.8) return 'numeric';
  if (dateCount / total > 0.8) return 'datetime';
  if (boolCount / total > 0.8) return 'boolean';
  return 'categorical';
}

function calculateNumericStats(values: number[]): NumericStats {
  const validValues = values.filter(v => !isNaN(v) && v !== null);
  if (validValues.length === 0) {
    return { count: 0, mean: 0, std: 0, min: 0, q25: 0, median: 0, q75: 0, max: 0 };
  }

  const sorted = [...validValues].sort((a, b) => a - b);
  
  return {
    count: validValues.length,
    mean: Number(ss.mean(validValues).toFixed(4)),
    std: Number(ss.standardDeviation(validValues).toFixed(4)),
    min: Number(ss.min(validValues).toFixed(4)),
    q25: Number(ss.quantile(sorted, 0.25).toFixed(4)),
    median: Number(ss.median(sorted).toFixed(4)),
    q75: Number(ss.quantile(sorted, 0.75).toFixed(4)),
    max: Number(ss.max(validValues).toFixed(4)),
  };
}

function calculateOutliers(values: number[]): OutlierInfo {
  const validValues = values.filter(v => !isNaN(v) && v !== null);
  if (validValues.length === 0) {
    return { count: 0, percentage: 0, lowerBound: 0, upperBound: 0 };
  }

  const sorted = [...validValues].sort((a, b) => a - b);
  const q1 = ss.quantile(sorted, 0.25);
  const q3 = ss.quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outlierCount = validValues.filter(v => v < lowerBound || v > upperBound).length;

  return {
    count: outlierCount,
    percentage: Number(((outlierCount / validValues.length) * 100).toFixed(2)),
    lowerBound: Number(lowerBound.toFixed(4)),
    upperBound: Number(upperBound.toFixed(4)),
  };
}

function calculateDistribution(values: number[], bins = 10): DistributionBin[] {
  const validValues = values.filter(v => !isNaN(v) && v !== null);
  if (validValues.length === 0) return [];

  const min = ss.min(validValues);
  const max = ss.max(validValues);
  const binWidth = (max - min) / bins;

  const distribution: DistributionBin[] = [];
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = min + (i + 1) * binWidth;
    const count = validValues.filter(v => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length;
    distribution.push({
      bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
      count,
    });
  }

  return distribution;
}

function calculateCategoricalStats(values: unknown[]): CategoryCount[] {
  const counts: Record<string, number> = {};
  const total = values.length;

  for (const val of values) {
    const strVal = val === null || val === undefined || val === '' ? '(empty)' : String(val);
    counts[strVal] = (counts[strVal] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([value, count]) => ({
      value,
      count,
      percentage: Number(((count / total) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateCorrelations(data: Record<string, unknown>[], numericColumns: string[]): Record<string, Record<string, number>> {
  const correlations: Record<string, Record<string, number>> = {};

  for (const col1 of numericColumns) {
    correlations[col1] = {};
    for (const col2 of numericColumns) {
      if (col1 === col2) {
        correlations[col1][col2] = 1;
      } else {
        const values1 = data.map(row => Number(row[col1])).filter(v => !isNaN(v));
        const values2 = data.map(row => Number(row[col2])).filter(v => !isNaN(v));
        
        // Need paired values
        const paired: [number, number][] = [];
        for (let i = 0; i < data.length; i++) {
          const v1 = Number(data[i][col1]);
          const v2 = Number(data[i][col2]);
          if (!isNaN(v1) && !isNaN(v2)) {
            paired.push([v1, v2]);
          }
        }

        if (paired.length > 2) {
          try {
            const corr = ss.sampleCorrelation(paired.map(p => p[0]), paired.map(p => p[1]));
            correlations[col1][col2] = Number(corr.toFixed(4));
          } catch {
            correlations[col1][col2] = 0;
          }
        } else {
          correlations[col1][col2] = 0;
        }
      }
    }
  }

  return correlations;
}

function countDuplicates(data: Record<string, unknown>[]): number {
  const seen = new Set<string>();
  let duplicates = 0;

  for (const row of data) {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      duplicates++;
    } else {
      seen.add(key);
    }
  }

  return duplicates;
}

export function analyzeData(data: Record<string, unknown>[]): DataProfile {
  if (!data || data.length === 0) {
    return {
      shape: { rows: 0, columns: 0 },
      columns: [],
      dataTypes: {},
      missingValues: {},
      duplicates: 0,
      numericStats: {},
      categoricalStats: {},
      outliers: {},
      correlations: {},
      distributions: {},
    };
  }

  const columns = Object.keys(data[0]);
  const dataTypes: Record<string, string> = {};
  const missingValues: Record<string, number> = {};
  const numericStats: Record<string, NumericStats> = {};
  const categoricalStats: Record<string, CategoryCount[]> = {};
  const outliers: Record<string, OutlierInfo> = {};
  const distributions: Record<string, DistributionBin[]> = {};
  const numericColumns: string[] = [];

  for (const col of columns) {
    const values = data.map(row => row[col]);
    
    // Infer data type
    dataTypes[col] = inferDataType(values);
    
    // Count missing values
    missingValues[col] = values.filter(v => v === null || v === undefined || v === '').length;

    if (dataTypes[col] === 'numeric') {
      const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
      numericStats[col] = calculateNumericStats(numericValues);
      outliers[col] = calculateOutliers(numericValues);
      distributions[col] = calculateDistribution(numericValues);
      numericColumns.push(col);
    } else {
      categoricalStats[col] = calculateCategoricalStats(values);
    }
  }

  const correlations = calculateCorrelations(data, numericColumns);
  const duplicates = countDuplicates(data);

  return {
    shape: { rows: data.length, columns: columns.length },
    columns,
    dataTypes,
    missingValues,
    duplicates,
    numericStats,
    categoricalStats,
    outliers,
    correlations,
    distributions,
  };
}
