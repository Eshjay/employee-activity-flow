
import { supabase } from '@/integrations/supabase/client';
import { generateCSVContent } from '../file/csvGenerator';
import {
  transformActivityToReportData,
  transformActivityToWeeklyReportData,
  createEmptyDailyReportData,
  createEmptyWeeklyReportData,
  createWeeklySummaryData
} from './reportHelpers';

export const generateDailyReport = async (): Promise<void> => {
  try {
    console.log('Generating daily report with real data...');
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch today's activities with profile information
    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles:user_id (
          name,
          department
        )
      `)
      .eq('date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }

    console.log('Fetched activities:', activities?.length || 0);

    // Transform data for CSV export
    const reportData = (activities || []).map(transformActivityToReportData);

    if (reportData.length === 0) {
      console.warn('No activities found for today');
      reportData.push(...createEmptyDailyReportData(today));
    }

    const filename = `daily-report-${today}.csv`;
    generateCSVContent(reportData, filename);
  } catch (error) {
    console.error('Error generating daily report:', error);
    throw error;
  }
};

export const generateWeeklyReport = async (): Promise<void> => {
  try {
    console.log('Generating weekly report with real data...');
    
    // Calculate date range for the past 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch activities from the past week
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        *,
        profiles:user_id (
          name,
          department
        )
      `)
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    if (activitiesError) {
      console.error('Error fetching weekly activities:', activitiesError);
      throw activitiesError;
    }

    // Fetch total employee count
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('role', 'employee');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log('Fetched weekly activities:', activities?.length || 0);
    console.log('Total employees:', profiles?.length || 0);

    // Transform data for CSV export (FIXED: was using JSON before)
    const reportData = (activities || []).map(activity => 
      transformActivityToWeeklyReportData(activity, startDate, endDate)
    );

    // Add summary statistics as additional rows
    const summaryData = createWeeklySummaryData(activities, profiles, startDate, endDate);
    reportData.push(summaryData);

    if (reportData.length === 1) { // Only summary row exists
      reportData.unshift(...createEmptyWeeklyReportData(startDate, endDate));
    }

    const filename = `weekly-report-${endDateStr}.csv`;
    generateCSVContent(reportData, filename);
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw error;
  }
};
