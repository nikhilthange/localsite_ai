import cron from 'node-cron';
import { GrowthService } from '../services/GrowthService';

const growthService = new GrowthService();

export function startWeeklyReportCron(): void {
  cron.schedule('0 8 * * 1', async () => {
    console.log('[GrowthCron] Starting weekly report generation...');
    try {
      await growthService.runWeeklyAnalysis();
      console.log('[GrowthCron] Weekly reports generated successfully');
    } catch (err) {
      console.error('[GrowthCron] Weekly report generation failed:', (err as Error).message);
    }
  });
  console.log('[GrowthCron] Weekly report cron scheduled (Monday 8:00 AM)');
}

export function startDailyInsightCron(): void {
  cron.schedule('0 6 * * *', async () => {
    console.log('[GrowthCron] Starting daily insight generation...');
    try {
      await growthService.runDailyInsights();
      console.log('[GrowthCron] Daily insights generated successfully');
    } catch (err) {
      console.error('[GrowthCron] Daily insight generation failed:', (err as Error).message);
    }
  });
  console.log('[GrowthCron] Daily insight cron scheduled (6:00 AM)');
}
