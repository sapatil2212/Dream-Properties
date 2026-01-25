'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/UIComponents';
import { Sparkles, Upload, FileText, X, AlertCircle, CheckCircle2, Copy, ChevronRight, Download, FileSpreadsheet, FileIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun } from 'docx';

interface AIPropertyAutoFillProps {
  onDataExtracted: (data: any) => void;
}

const SUPPORTED_FIELDS = [
  'Property Type',
  'Property Sub-Type',
  'Listing Type (Sell/Rent/Lease)',
  'Property Title',
  'Description',
  'Price',
  'Area',
  'Location',
  'Address',
  'Map Link',
  'Video URL',
  'Bedrooms',
  'Bathrooms',
  'Furnishing',
  'Possession Date',
  'RERA ID',
  'Amenities',
  'Highlights',
  'Specifications',
  'Project Units',
  'Project Area',
  'Configurations',
  'Avg Price',
  'Launch Date',
  'Sizes',
  'Project Size',
  'Bachelors Allowed',
  'Maintenance',
  'Total Floors',
  'Car Parking'
];

export function AIPropertyAutoFill({ onDataExtracted }: AIPropertyAutoFillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyField = (field: string) => {
    navigator.clipboard.writeText(field);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAllFields = () => {
    const allFields = SUPPORTED_FIELDS.map(f => `${f}: `).join('\n');
    navigator.clipboard.writeText(allFields);
    setCopiedField('ALL');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      SUPPORTED_FIELDS, 
      ['Residential', 'Flats/Apartments', 'Sell', 'Luxury 3BHK Apartment in Whitefield', 'Spacious apartment with modern amenities...', '1.5 Cr', '1500 sqft', 'Whitefield, Bangalore', '#123, Palm Grove, Whitefield Main Rd', 'https://maps.google.com/...', 'https://youtube.com/...', '3', '3', 'Semi-Furnished', '2025-12-01', 'PRM/KA/RERA/...', 'Swimming Pool, Gym, Club House', 'Near Metro Station, Vastu Compliant', 'Flooring: Italian Marble, Windows: UPVC', '200', '5 Acres', '2BHK, 3BHK', '8000/sqft', '2023-01-01', '1200-1800 sqft', 'Large', 'Yes', '5000/month', '15', '2 Covered']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wscols = SUPPORTED_FIELDS.map(f => ({ wch: Math.max(f.length + 5, 15) }));
    ws['!cols'] = wscols;
    XLSX.utils.book_append_sheet(wb, ws, "Property Template");
    XLSX.writeFile(wb, "DreamProperties_Template.xlsx");
    setShowDownloadOptions(false);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Dream Properties - Property Details Template', 14, 20);
    doc.setFontSize(10);
    doc.text('Please fill in the details below and upload this PDF.', 14, 28);

    const tableData = SUPPORTED_FIELDS.map(field => [field, '']);

    autoTable(doc, {
      startY: 35,
      head: [['Field Name', 'Value (Please Fill)']],
      body: tableData,
      theme: 'grid',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 'auto' }
      }
    });

    doc.save('DreamProperties_Template.pdf');
    setShowDownloadOptions(false);
  };

  const handleDownloadWord = async () => {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Field Name", bold: true })] })], width: { size: 40, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Value (Please Fill)", bold: true })] })], width: { size: 60, type: WidthType.PERCENTAGE } }),
        ],
      }),
      ...SUPPORTED_FIELDS.map(field => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(field)] }),
            new TableCell({ children: [new Paragraph("")] }),
          ],
        })
      )
    ];

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "Dream Properties - Property Details Template", heading: "Heading1" }),
          new Paragraph({ text: "Please fill in the details below and upload this document." }),
          new Paragraph({ text: "" }), // Spacer
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DreamProperties_Template.docx';
    a.click();
    window.URL.revokeObjectURL(url);
    setShowDownloadOptions(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleProcess = async () => {
    if (!file && !text.trim()) {
      setError('Please upload a file or enter text description.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    if (file) formData.append('file', file);
    if (text) formData.append('text', text);

    try {
      const response = await fetch('/api/ai/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process');
      }

      onDataExtracted(data);
      setSuccess('Form auto-filled successfully! Please review the details.');
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mb-6 w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 group"
      >
        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
        Use AI Assistant to Auto-Fill Form
      </button>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start">
      <Card className="flex-1 border-indigo-100 shadow-xl shadow-indigo-100/50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={20} />
                AI Property Assistant
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Upload a brochure (PDF/Image) or paste details to auto-fill the form.
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Upload Brochure / Image
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors h-[200px] ${file ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="ai-file-upload"
                />
                <label htmlFor="ai-file-upload" className="cursor-pointer w-full flex flex-col items-center h-full justify-center">
                  {file ? (
                    <>
                      <FileText className="text-indigo-600 mb-2" size={32} />
                      <span className="text-sm font-bold text-slate-700 break-all">{file.name}</span>
                      <span className="text-xs text-indigo-600 mt-1">Click to change</span>
                    </>
                  ) : (
                    <>
                      <Upload className="text-slate-400 mb-2" size={32} />
                      <span className="text-sm font-bold text-slate-700">Click to Upload</span>
                      <span className="text-xs text-slate-400 mt-1">PDF, Word, Excel, Images</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Or Paste Details
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste property description, amenities, price details here..."
                className="w-full h-[200px] p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium flex items-center gap-2">
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleProcess}
              disabled={isLoading || (!file && !text.trim())}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Auto-Fill Form
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Side Container: Field Reference */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-lg shadow-indigo-100/50 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ChevronRight size={14} />
              Supported Fields
            </h4>
            <button
              onClick={handleCopyAllFields}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
            >
              {copiedField === 'ALL' ? (
                <>
                  <CheckCircle2 size={12} /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy All
                </>
              )}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 space-y-2 custom-scrollbar">
            {SUPPORTED_FIELDS.map((field) => (
              <div
                key={field}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-left group hover:border-indigo-200 transition-colors"
              >
                <span className="text-xs font-medium text-slate-600">{field}</span>
                <button
                  onClick={() => handleCopyField(field)}
                  className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                  title="Copy field name"
                >
                  {copiedField === field ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            {!showDownloadOptions ? (
              <button
                onClick={() => setShowDownloadOptions(true)}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Download size={14} />
                Download Template
              </button>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Select Format</span>
                  <button 
                    onClick={() => setShowDownloadOptions(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                <button
                  onClick={handleDownloadExcel}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-emerald-100"
                >
                  <FileSpreadsheet size={14} />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={handleDownloadWord}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-blue-100"
                >
                  <FileIcon size={14} />
                  Word (.docx)
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-red-100"
                >
                  <FileText size={14} />
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400 mt-2 text-center">
            These fields are automatically detected by AI
          </p>
        </div>
      </div>
    </div>
  );
}
