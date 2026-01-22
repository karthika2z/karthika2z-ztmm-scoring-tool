import { jsPDF } from 'jspdf';
import type { AssessmentData } from '../types';
import { format } from 'date-fns';

export function generatePDF(assessment: AssessmentData): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Helper to add text with word wrap
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    const lines = doc.splitTextToSize(text, 170);
    lines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 20, yPos);
      yPos += fontSize * 0.5;
    });
    yPos += 5;
  };

  const addSection = (title: string) => {
    yPos += 10;
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPos);
    yPos += 10;
  };

  // Cover Page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Zero Trust Maturity Assessment', 20, 40);

  doc.setFontSize(20);
  doc.text(assessment.metadata.customerName, 20, 60);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Assessment Date: ${format(new Date(assessment.metadata.assessmentDate), 'MMMM dd, yyyy')}`, 20, 80);

  if (assessment.metadata.salesEngineer) {
    doc.text(`Prepared by: ${assessment.metadata.salesEngineer}`, 20, 90);
  }

  doc.text('Powered by Aviatrix', 20, 280);

  // Executive Summary
  doc.addPage();
  yPos = 20;

  addSection('Executive Summary');

  // Networks Pillar
  assessment.metadata.cloudProviders.forEach(cloud => {
    const cloudData = assessment.pillars.networks.cloudSpecific[cloud];
    const maturity = cloudData?.pillarMaturity.final || 'Not Assessed';
    addText(`Networks (${cloud}): ${maturity}`, 12, true);
  });

  // Other Pillars
  const pillars = [
    { key: 'applicationsWorkloads', name: 'Applications & Workloads' },
    { key: 'data', name: 'Data' },
    { key: 'crossCutting', name: 'Cross-Cutting Capabilities' },
  ];

  pillars.forEach(pillar => {
    const pillarData = assessment.pillars[pillar.key as keyof typeof assessment.pillars];
    if (pillarData && 'pillarMaturity' in pillarData) {
      const maturity = pillarData.pillarMaturity.final || 'Not Assessed';
      addText(`${pillar.name}: ${maturity}`, 12, true);
    }
  });

  // Overall Assessment
  if (assessment.overallAssessment.narrative) {
    addSection('Overall Assessment');
    addText(assessment.overallAssessment.narrative);
  }

  // Key Strengths
  if (assessment.overallAssessment.keyStrengths.length > 0) {
    addSection('Key Strengths');
    assessment.overallAssessment.keyStrengths.forEach(strength => {
      addText(`• ${strength}`);
    });
  }

  // Key Gaps
  if (assessment.overallAssessment.keyGaps.length > 0) {
    addSection('Key Gaps & Opportunities');
    assessment.overallAssessment.keyGaps.forEach(gap => {
      addText(`• ${gap}`);
    });
  }

  // Dimension Details
  doc.addPage();
  yPos = 20;
  addSection('Detailed Assessment');

  // Networks
  assessment.metadata.cloudProviders.forEach(cloud => {
    const cloudData = assessment.pillars.networks.cloudSpecific[cloud];
    if (cloudData) {
      addText(`Networks - ${cloud}`, 14, true);
      Object.entries(cloudData.dimensions).forEach(([dimId, dim]) => {
        if (dim.maturityLevel) {
          addText(`  ${dimId}: ${dim.maturityLevel}`, 11);
          if (dim.notes) {
            addText(`    Notes: ${dim.notes}`, 10);
          }
        }
      });
      yPos += 5;
    }
  });

  // Other pillars
  pillars.forEach(pillar => {
    const pillarData = assessment.pillars[pillar.key as keyof typeof assessment.pillars];
    if (pillarData && 'dimensions' in pillarData) {
      addText(pillar.name, 14, true);
      Object.entries(pillarData.dimensions).forEach(([dimId, dim]) => {
        if (dim.maturityLevel) {
          addText(`  ${dimId}: ${dim.maturityLevel}`, 11);
          if (dim.notes) {
            addText(`    Notes: ${dim.notes}`, 10);
          }
        }
      });
      yPos += 5;
    }
  });

  // Save PDF
  const filename = `${assessment.metadata.customerName.replace(/\s+/g, '_')}_ZTMM_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}
