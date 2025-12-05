import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FileUpload } from '@/components/FileUpload';
import { ExportButtons } from '@/components/ExportButtons';
import { DataSummary } from '@/components/DataSummary';
import { DataTypesTable } from '@/components/DataTypesTable';
import { NumericStatsTable } from '@/components/NumericStatsTable';
import { CorrelationHeatmap } from '@/components/CorrelationHeatmap';
import { DistributionCharts } from '@/components/DistributionCharts';
import { CategoricalStats } from '@/components/CategoricalStats';
import { OutliersTable } from '@/components/OutliersTable';
import { AIRecommendations } from '@/components/AIRecommendations';
import { analyzeData, DataProfile } from '@/lib/dataAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Sparkles } from 'lucide-react';

interface AIRecommendations {
  dataCleaning: string[];
  restructuring: string[];
  featureEngineering: string[];
  qualityImprovements: string[];
  additionalData: string[];
  summary: string;
}

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { toast } = useToast();

  const parseFile = useCallback(async (file: File): Promise<Record<string, unknown>[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data as Record<string, unknown>[]);
          },
          error: (error) => {
            reject(error);
          },
        });
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(firstSheet);
    }

    throw new Error('Unsupported file format');
  }, []);

  const fetchAIRecommendations = useCallback(async (profile: DataProfile) => {
    setAiLoading(true);
    setAiError(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-data', {
        body: { dataProfile: profile },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setAiRecommendations(data.recommendations);
    } catch (error) {
      console.error('AI analysis error:', error);
      setAiError(error instanceof Error ? error.message : 'Failed to get AI recommendations');
      toast({
        title: 'AI Analysis Failed',
        description: error instanceof Error ? error.message : 'Unable to generate recommendations',
        variant: 'destructive',
      });
    } finally {
      setAiLoading(false);
    }
  }, [toast]);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setDataProfile(null);
    setAiRecommendations(null);
    setAiError(null);

    try {
      toast({
        title: 'Processing file...',
        description: `Analyzing ${file.name}`,
      });

      const data = await parseFile(file);
      
      if (data.length === 0) {
        throw new Error('The file appears to be empty');
      }

      const profile = analyzeData(data);
      setDataProfile(profile);

      toast({
        title: 'Analysis complete!',
        description: `Processed ${profile.shape.rows.toLocaleString()} rows and ${profile.shape.columns} columns`,
      });

      // Fetch AI recommendations
      await fetchAIRecommendations(profile);

    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Error processing file',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [parseFile, fetchAIRecommendations, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 glow-primary">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">DataLens</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Exploratory Data Analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!dataProfile ? (
          /* Upload Section */
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Analysis
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Analyze Your Data in <span className="gradient-text">Seconds</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Upload your CSV or Excel file and get comprehensive exploratory data analysis 
                with AI-powered recommendations for data improvement.
              </p>
            </div>

            <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-xl bg-muted/30">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Full EDA</h3>
                <p className="text-sm text-muted-foreground">Statistics, distributions, correlations, and outliers</p>
              </div>
              <div className="p-6 rounded-xl bg-muted/30">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI Insights</h3>
                <p className="text-sm text-muted-foreground">Smart recommendations to improve your data quality</p>
              </div>
              <div className="p-6 rounded-xl bg-muted/30">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-chart-3/10 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
                <p className="text-sm text-muted-foreground">Your data is processed in-memory and never stored</p>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-8 animate-fade-in">
            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
                <p className="text-muted-foreground">
                  {dataProfile.shape.rows.toLocaleString()} rows × {dataProfile.shape.columns} columns
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ExportButtons dataProfile={dataProfile} aiRecommendations={aiRecommendations} />
                <button
                  onClick={() => {
                    setDataProfile(null);
                    setAiRecommendations(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
                >
                  Analyze New File
                </button>
              </div>
            </div>

            {/* Overview Stats */}
            <DataSummary profile={dataProfile} />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataTypesTable profile={dataProfile} />
              <NumericStatsTable profile={dataProfile} />
            </div>

            {/* Distributions */}
            <DistributionCharts profile={dataProfile} />

            {/* Categorical Stats */}
            <CategoricalStats profile={dataProfile} />

            {/* Full Width Sections */}
            <OutliersTable profile={dataProfile} />
            <CorrelationHeatmap profile={dataProfile} />

            {/* AI Recommendations */}
            <div className="pt-4 border-t border-border">
              <AIRecommendations 
                recommendations={aiRecommendations}
                isLoading={aiLoading}
                error={aiError}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>DataLens — Your data stays in your browser. No files are permanently stored.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
