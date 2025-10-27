/**
 * Statistics and reporting utilities
 */

import  { add } from './mathUtils.js';
import { formatResult } from './stringUtils.js';
import { processTemplate } from './templateUtils';
import { calculateAverage } from './arrayUtils.js';

/**
 * Generate comprehensive report
 */
export const generateReport = (numbers: number[]): string => {
  const sum = numbers.reduce((acc, num) => add(acc, num), 0);
  const avg = calculateAverage(numbers);
  const formatted = formatResult(sum);
  
  return processTemplate(`Sum: ${sum}, Average: ${avg}, Formatted: ${formatted}`, 'report');
};

/**
 * Calculate statistics
 */
export const calculateStats = (data: number[]): {
  sum: number;
  average: number;
  count: number;
} => {
  const sum = data.reduce((acc, num) => add(acc, num), 0);
  const average = calculateAverage(data);
  
  return {
    sum,
    average,
    count: data.length
  };
};

export default generateReport;