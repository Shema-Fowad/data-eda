import { useState } from 'react';
import { FileJson, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataProfile } from '@/lib/dataAnalysis';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AIRecommendations {
  dataCleaning: string[];
  restructuring: string[];
  featureEngineering: string[];
  qualityImprovements: string[];
  additionalData: string[];
  summary: string;
}

interface ExportButtonsProps {
  dataProfile: DataProfile;
  aiRecommendations: AIRecommendations | null;
}

export const ExportButtons = ({ dataProfile, aiRecommendations }: ExportButtonsProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportJSON = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      dataProfile: {
        shape: dataProfile.shape,
        columns: dataProfile.columns,
        dataTypes: dataProfile.dataTypes,
        missingValues: dataProfile.missingValues,
        duplicates: dataProfile.duplicates,
        numericStats: dataProfile.numericStats,
        categoricalStats: dataProfile.categoricalStats,
        correlations: dataProfile.correlations,
        outliers: dataProfile.outliers,
        distributions: dataProfile.distributions,
      },
      aiRecommendations: aiRecommendations || null,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eda-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Title
      doc.setFontSize(24);
      doc.setTextColor(99, 102, 241);
      doc.text('DataLens EDA Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Dataset Overview
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Dataset Overview', 14, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.text(`Rows: ${dataProfile.shape.rows.toLocaleString()}`, 14, yPos);
      yPos += 6;
      doc.text(`Columns: ${dataProfile.shape.columns}`, 14, yPos);
      yPos += 6;
      doc.text(`Duplicate Rows: ${dataProfile.duplicates}`, 14, yPos);
      yPos += 6;

      const totalMissing = Object.values(dataProfile.missingValues).reduce((sum, count) => sum + count, 0);
      doc.text(`Total Missing Values: ${totalMissing.toLocaleString()}`, 14, yPos);
      yPos += 6;

      const totalOutliers = Object.values(dataProfile.outliers).reduce((sum, o) => sum + o.count, 0);
      doc.text(`Total Outliers Detected: ${totalOutliers}`, 14, yPos);
      yPos += 15;

      // Column Info Table
      doc.setFontSize(16);
      doc.text('Column Information', 14, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [['Column', 'Type', 'Missing', 'Unique Values']],
        body: dataProfile.columns.map(col => [
          col,
          dataProfile.dataTypes[col] || 'unknown',
          (dataProfile.missingValues[col] || 0).toString(),
          '-',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Numeric Statistics
      if (Object.keys(dataProfile.numericStats).length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.text('Numeric Statistics', 14, yPos);
        yPos += 8;

        const numericData = Object.entries(dataProfile.numericStats).map(([col, stats]) => [
          col,
          stats.mean.toFixed(2),
          stats.std.toFixed(2),
          stats.min.toFixed(2),
          stats.max.toFixed(2),
          stats.median.toFixed(2),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Column', 'Mean', 'Std', 'Min', 'Max', 'Median']],
          body: numericData,
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241] },
          styles: { fontSize: 9 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Outliers
      if (Object.keys(dataProfile.outliers).length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.text('Outlier Detection (IQR Method)', 14, yPos);
        yPos += 8;

        const outlierData = Object.entries(dataProfile.outliers).map(([col, data]) => [
          col,
          data.count.toString(),
          `${data.percentage.toFixed(1)}%`,
          data.lowerBound.toFixed(2),
          data.upperBound.toFixed(2),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Column', 'Count', 'Percentage', 'Lower Bound', 'Upper Bound']],
          body: outlierData,
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241] },
          styles: { fontSize: 9 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // AI Recommendations
      if (aiRecommendations) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(18);
        doc.setTextColor(99, 102, 241);
        doc.text('AI Insights & Recommendations', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setTextColor(0, 0, 0);

        // Summary
        if (aiRecommendations.summary) {
          doc.setFontSize(12);
          doc.setFont(undefined as any, 'bold');
          doc.text('Summary', 14, yPos);
          yPos += 7;
          doc.setFont(undefined as any, 'normal');
          doc.setFontSize(10);
          const summaryLines = doc.splitTextToSize(aiRecommendations.summary, pageWidth - 28);
          doc.text(summaryLines, 14, yPos);
          yPos += summaryLines.length * 5 + 10;
        }

        const sections = [
          { title: 'Data Cleaning Suggestions', items: aiRecommendations.dataCleaning },
          { title: 'Restructuring Recommendations', items: aiRecommendations.restructuring },
          { title: 'Feature Engineering Ideas', items: aiRecommendations.featureEngineering },
          { title: 'Quality Improvements', items: aiRecommendations.qualityImprovements },
          { title: 'Additional Data Suggestions', items: aiRecommendations.additionalData },
        ];

        for (const section of sections) {
          if (section.items && section.items.length > 0) {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }

            doc.setFontSize(12);
            doc.setFont(undefined as any, 'bold');
            doc.text(section.title, 14, yPos);
            yPos += 7;
            doc.setFont(undefined as any, 'normal');
            doc.setFontSize(10);

            for (const item of section.items) {
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 30);
              doc.text(lines, 16, yPos);
              yPos += lines.length * 5 + 3;
            }
            yPos += 8;
          }
        }
      }

      doc.save(`eda-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportJSON}
        className="gap-2"
      >
        <FileJson className="w-4 h-4" />
        Export JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportPDF}
        disabled={isExporting}
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        {isExporting ? 'Generating...' : 'Export PDF'}
      </Button>
    </div>
  );
};
