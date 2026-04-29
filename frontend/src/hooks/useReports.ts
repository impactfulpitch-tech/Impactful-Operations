import { useState, useEffect } from 'react';
import { reportSheets as defaultReportSheets, ReportSheet } from '@/data/reportsData';

export const useReports = () => {
  const [reports, setReports] = useState<ReportSheet[]>(defaultReportSheets);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API first
        const response = await fetch('/api/reports');
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        } else {
          // Fall back to default data if API fails
          setReports(defaultReportSheets);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        // Use default data on error
        setReports(defaultReportSheets);
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    setReports
  };
};

export const useReportById = (reportId: string) => {
  const [report, setReport] = useState<ReportSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API first
        const response = await fetch(`/api/reports/${reportId}`);
        if (response.ok) {
          const data = await response.json();
          setReport(data);
        } else {
          // Fall back to default data if API fails
          const defaultReport = defaultReportSheets.find(r => r.id === reportId);
          setReport(defaultReport || null);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        // Use default data on error
        const defaultReport = defaultReportSheets.find(r => r.id === reportId);
        setReport(defaultReport || null);
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  return {
    report,
    loading,
    error,
    setReport
  };
};
