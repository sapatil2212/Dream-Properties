'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar, DollarSign, FileText, User, ArrowLeft, Briefcase, Mail, Phone, Building2, Pencil, Eye, Download, Plus, Trash2, Send } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Alert } from '@/components/UIComponents';

interface EmployeeDetail {
    id: number;
    name: string;
    email: string;
    mobile: string;
    role: string;
    status: string;
    employeeProfile: {
        designation: string;
        department: string;
        joiningDate: string;
        basicSalary: number;
        hra: number;
        specialAllowance: number;
        medicalAllowance: number;
        pf: number;
        healthInsurance: number;
        professionalTax: number;
        leavesAllotted: number;
        leavesTaken: number;
        accountNumber: string;
        bankName: string;
        ifscCode: string;
    } | null;
    attendance: any[];
    salarySlips: any[];
    leaveRequests: any[];
    salesExecLeads: { id: number; createdAt: string; status: string }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function EmployeeDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [generatingSlip, setGeneratingSlip] = useState(false);
    
    // Edit Form State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSalaryStructureOpen, setIsSalaryStructureOpen] = useState(false);
    const [isManualLeaveOpen, setIsManualLeaveOpen] = useState(false);
    const [viewSlip, setViewSlip] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Custom Components State
    const [customEarnings, setCustomEarnings] = useState<{name: string, amount: number}[]>([]);
    const [customDeductions, setCustomDeductions] = useState<{name: string, amount: number}[]>([]);
    
    // Email State
    const [emailTrigger, setEmailTrigger] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailingSlipId, setEmailingSlipId] = useState<number | null>(null);
    const [downloadingSlipId, setDownloadingSlipId] = useState<number | null>(null);
    const [downloadTrigger, setDownloadTrigger] = useState(false);
    
    // Modal State
    const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
    
    // Alert State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setAlertState({
            isOpen: true,
            type,
            title,
            message
        });
    };

    // Ref for viewSlip to avoid stale closure in timeouts
    const viewSlipRef = React.useRef(viewSlip);
    useEffect(() => {
        viewSlipRef.current = viewSlip;
    }, [viewSlip]);

    useEffect(() => {
        if (viewSlip && emailTrigger) {
            const timer = setTimeout(() => {
                processEmailSlip();
                setEmailTrigger(false);
            }, 500); // Wait for hidden render
            return () => clearTimeout(timer);
        }
    }, [viewSlip, emailTrigger]);

    useEffect(() => {
        if (viewSlip && downloadTrigger) {
            const timer = setTimeout(() => {
                handleDownloadPDF();
                setDownloadTrigger(false);
            }, 500); // Wait for hidden render
            return () => clearTimeout(timer);
        }
    }, [viewSlip, downloadTrigger]);

    // Salary Structure State
    const [salaryStructure, setSalaryStructure] = useState({
        basicSalary: 0,
        hra: 0,
        specialAllowance: 0,
        medicalAllowance: 0,
        pf: 0,
        healthInsurance: 0,
        professionalTax: 0
    });
    
    const [leaveFormData, setLeaveFormData] = useState({
        startDate: '',
        endDate: '',
        days: '',
        reason: '',
        type: 'Paid'
    });

    const [editFormData, setEditFormData] = useState({
        name: '',
        mobile: '',
        role: '',
        status: '',
        designation: '',
        department: '',
        joiningDate: '',
        basicSalary: '',
        leavesAllotted: '',
        accountNumber: '',
        bankName: '',
        ifscCode: ''
    });

    useEffect(() => {
        if (id) {
            fetchEmployeeDetails();
        }
    }, [id]);

    useEffect(() => {
        if (employee) {
            setEditFormData({
                name: employee.name,
                mobile: employee.mobile,
                role: employee.role,
                status: employee.status || 'Active',
                designation: employee.employeeProfile?.designation || '',
                department: employee.employeeProfile?.department || '',
                joiningDate: employee.employeeProfile?.joiningDate ? new Date(employee.employeeProfile.joiningDate).toISOString().split('T')[0] : '',
                basicSalary: employee.employeeProfile?.basicSalary?.toString() || '',
                leavesAllotted: employee.employeeProfile?.leavesAllotted?.toString() || '12',
                accountNumber: employee.employeeProfile?.accountNumber || '',
                bankName: employee.employeeProfile?.bankName || '',
                ifscCode: employee.employeeProfile?.ifscCode || ''
            });
            
            setSalaryStructure({
                basicSalary: employee.employeeProfile?.basicSalary || 0,
                hra: employee.employeeProfile?.hra || 0,
                specialAllowance: employee.employeeProfile?.specialAllowance || 0,
                medicalAllowance: employee.employeeProfile?.medicalAllowance || 0,
                pf: employee.employeeProfile?.pf || 0,
                healthInsurance: employee.employeeProfile?.healthInsurance || 0,
                professionalTax: employee.employeeProfile?.professionalTax || 0
            });

            // Parse custom components if available
            if (employee.employeeProfile) {
                // @ts-ignore - customEarnings might be JSON
                const cEarnings = employee.employeeProfile.customEarnings;
                // @ts-ignore
                const cDeductions = employee.employeeProfile.customDeductions;
                
                if (Array.isArray(cEarnings)) setCustomEarnings(cEarnings);
                if (Array.isArray(cDeductions)) setCustomDeductions(cDeductions);
            }
        }
    }, [employee]);

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSelectChange = (name: string, value: string) => {
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`/api/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });

            if (res.ok) {
                setIsEditOpen(false);
                fetchEmployeeDetails();
                alert('Employee updated successfully');
            } else {
                alert('Failed to update employee');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Error updating employee');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSalaryStructureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSalaryStructure({ ...salaryStructure, [e.target.name]: parseFloat(e.target.value) || 0 });
    };

    const handleSalaryStructureSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Merge with existing edit form data to keep other fields intact, but override salary fields
            const payload = {
                ...editFormData,
                ...salaryStructure,
                customEarnings,
                customDeductions
            };
            
            const res = await fetch(`/api/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsSalaryStructureOpen(false);
                fetchEmployeeDetails();
                alert('Salary structure updated successfully');
            } else {
                alert('Failed to update salary structure');
            }
        } catch (error) {
            console.error('Error updating salary structure:', error);
            alert('Error updating salary structure');
        } finally {
            setIsSaving(false);
        }
    };

    const addCustomComponent = (type: 'earnings' | 'deductions') => {
        if (type === 'earnings') {
            setCustomEarnings([...customEarnings, { name: '', amount: 0 }]);
        } else {
            setCustomDeductions([...customDeductions, { name: '', amount: 0 }]);
        }
    };

    const removeCustomComponent = (type: 'earnings' | 'deductions', index: number) => {
        if (type === 'earnings') {
            const newEarnings = [...customEarnings];
            newEarnings.splice(index, 1);
            setCustomEarnings(newEarnings);
        } else {
            const newDeductions = [...customDeductions];
            newDeductions.splice(index, 1);
            setCustomDeductions(newDeductions);
        }
    };

    const handleCustomComponentChange = (type: 'earnings' | 'deductions', index: number, field: 'name' | 'amount', value: string | number) => {
        if (type === 'earnings') {
            const newEarnings = [...customEarnings];
            // @ts-ignore
            newEarnings[index][field] = value;
            setCustomEarnings(newEarnings);
        } else {
            const newDeductions = [...customDeductions];
            // @ts-ignore
            newDeductions[index][field] = value;
            setCustomDeductions(newDeductions);
        }
    };

    const handleLeaveInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLeaveFormData({ ...leaveFormData, [e.target.name]: e.target.value });
    };

    const handleManualLeaveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/leaves/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: id,
                    ...leaveFormData
                })
            });

            if (res.ok) {
                setIsManualLeaveOpen(false);
                fetchEmployeeDetails();
                alert('Leave added successfully');
                setLeaveFormData({ startDate: '', endDate: '', days: '', reason: '', type: 'Paid' });
            } else {
                alert('Failed to add leave');
            }
        } catch (error) {
            console.error('Error adding leave:', error);
            alert('Error adding leave');
        } finally {
            setIsSaving(false);
        }
    };
    
    // Simple Number to Words (Indian Format approximation for demo)
    const numberToWords = (num: number) => {
        const a = ['','one ','two ','three ','four ','five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
        const b = ['', '', 'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
        
        if ((num = num.toString().length > 9 ? parseFloat(num.toString().substring(0, 9)) : num) === 0) return 'zero';
        
        const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';
        
        let str = '';
        str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
        str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
        str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
        str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
        str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        
        return str.trim() + ' Only';
    };

    const handlePrintSlip = () => {
        const printContent = document.getElementById('salary-slip-print');
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
        
        if (printWindow && printContent) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Salary Slip</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                            .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
                            .title { font-size: 18px; margin-top: 5px; font-weight: bold; }
                            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                            .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                            .total-row { display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #333; margin-top: 10px; padding-top: 5px; }
                            .net-salary { text-align: center; margin-top: 20px; padding: 10px; background: #f0f9ff; border: 1px solid #bae6fd; }
                            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                        </style>
                    </head>
                    <body>
                        ${printContent.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    const generatePDF = async () => {
        const input = document.getElementById('salary-slip-print');
        if (!input) return null;
        
        try {
            const canvas = await html2canvas(input, { 
                scale: 2,
                useCORS: true, 
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            return pdf;
        } catch (error) {
            console.error('Error generating PDF:', error);
            return null;
        }
    };

    const handleDownloadPDF = async () => {
        const currentSlip = viewSlipRef.current;
        if (!currentSlip) {
             console.error("No slip data available for PDF generation");
             setDownloadingSlipId(null);
             return;
        }

        const pdf = await generatePDF();
        if (pdf) {
            pdf.save(`Salary_Slip_${currentSlip.month}_${currentSlip.year}.pdf`);
        } else {
            alert('Failed to generate PDF');
        }
        setDownloadingSlipId(null);
    };

    const processEmailSlip = async () => {
        const currentSlip = viewSlipRef.current;
        if (!employee || !currentSlip) {
            setEmailingSlipId(null);
            return;
        }
        setIsSendingEmail(true);
        
        const pdf = await generatePDF();
        if (!pdf) {
            alert('Failed to generate PDF for email');
            setIsSendingEmail(false);
            setEmailingSlipId(null);
            return;
        }

        const blob = pdf.output('blob');
        const formData = new FormData();
        formData.append('pdf', blob, `Salary_Slip_${currentSlip.month}_${currentSlip.year}.pdf`);
        formData.append('email', employee.email);
        formData.append('name', employee.name);
        formData.append('month', currentSlip.month.toString());
        formData.append('year', currentSlip.year.toString());

        try {
            const res = await fetch('/api/employees/salary/email', {
                method: 'POST',
                body: formData
            });
            
            if (res.ok) {
                showAlert('success', 'Email Sent', 'Salary slip sent successfully via email!');
            } else {
                const d = await res.json();
                showAlert('error', 'Sending Failed', d.message || 'Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            showAlert('error', 'Error', 'An unexpected error occurred while sending the email.');
        } finally {
            setIsSendingEmail(false);
            setEmailingSlipId(null);
        }
    };

    const fetchEmployeeDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/employees/${id}`);
            if (res.ok) {
                const data = await res.json();
                setEmployee(data);
            }
        } catch (error) {
            console.error('Error fetching employee:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSlip = async () => {
        if (!employee) return;
        setGeneratingSlip(true);
        const date = new Date();
        // Generate for current month
        try {
            const res = await fetch('/api/employees/salary/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: employee.id,
                    month: date.getMonth() + 1,
                    year: date.getFullYear()
                })
            });
            if (res.ok) {
                alert('Salary slip generated successfully!');
                fetchEmployeeDetails();
            } else {
                const d = await res.json();
                alert(d.message || 'Failed to generate slip');
            }
        } catch (e) {
            console.error(e);
            alert('Error generating slip');
        } finally {
            setGeneratingSlip(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">Employee not found</h2>
                <Link href="/dashboard/employees">
                    <Button variant="outline" className="mt-4">Back to Employees</Button>
                </Link>
            </div>
        );
    }

    const attendanceData = [
        { name: 'Present', value: employee.attendance.filter(a => a.status === 'Present').length },
        { name: 'Absent', value: 30 - employee.attendance.length }, // Placeholder logic
        { name: 'Late', value: employee.attendance.filter(a => a.status === 'Late').length },
    ];

    const salaryData = employee.salarySlips.map(slip => ({
        name: `${slip.month}/${slip.year}`,
        salary: slip.netSalary
    }));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/employees">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">{employee.name}</h1>
                    <div className="flex items-center gap-2 text-slate-500">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-medium">
                            {employee.employeeProfile?.designation || employee.role}
                        </span>
                        <span>•</span>
                        <span>{employee.employeeProfile?.department || 'General'}</span>
                    </div>
                </div>

                <div className="ml-auto flex gap-2">
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="w-4 h-4" /> Edit Profile
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Employee Profile</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                
                                {/* Personal Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" name="name" value={editFormData.name} onChange={handleEditInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mobile">Mobile</Label>
                                            <Input id="mobile" name="mobile" value={editFormData.mobile} onChange={handleEditInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select onValueChange={(val) => handleEditSelectChange('role', val)} value={editFormData.role}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SALES_EXECUTIVE">Sales Executive</SelectItem>
                                                    <SelectItem value="TELECALLER">Telecaller</SelectItem>
                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select onValueChange={(val) => handleEditSelectChange('status', val)} value={editFormData.status}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Disabled">Disabled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="designation">Designation</Label>
                                            <Input id="designation" name="designation" value={editFormData.designation} onChange={handleEditInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input id="department" name="department" value={editFormData.department} onChange={handleEditInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="joiningDate">Joining Date</Label>
                                            <Input id="joiningDate" name="joiningDate" type="date" value={editFormData.joiningDate} onChange={handleEditInputChange} />
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Financial & Payroll</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="basicSalary">Basic Salary (₹)</Label>
                                            <Input id="basicSalary" name="basicSalary" type="number" value={editFormData.basicSalary} onChange={handleEditInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="leavesAllotted">Yearly Leaves Allotted</Label>
                                            <Input id="leavesAllotted" name="leavesAllotted" type="number" value={editFormData.leavesAllotted} onChange={handleEditInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bankName">Bank Name</Label>
                                            <Input id="bankName" name="bankName" value={editFormData.bankName} onChange={handleEditInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="accountNumber">Account Number</Label>
                                            <Input id="accountNumber" name="accountNumber" value={editFormData.accountNumber} onChange={handleEditInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ifscCode">IFSC Code</Label>
                                            <Input id="ifscCode" name="ifscCode" value={editFormData.ifscCode} onChange={handleEditInputChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Button variant={activeTab === 'overview' ? 'default' : 'outline'} onClick={() => setActiveTab('overview')}>
                        Overview
                    </Button>
                    <Button variant={activeTab === 'attendance' ? 'default' : 'outline'} onClick={() => setActiveTab('attendance')}>
                        Attendance
                    </Button>
                    <Button variant={activeTab === 'leaves' ? 'default' : 'outline'} onClick={() => setActiveTab('leaves')}>
                        Leaves
                    </Button>
                    <Button variant={activeTab === 'payroll' ? 'default' : 'outline'} onClick={() => setActiveTab('payroll')}>
                        Payroll
                    </Button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">{employee.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">{employee.mobile}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">{employee.role}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">Joined: {employee.employeeProfile?.joiningDate ? new Date(employee.employeeProfile.joiningDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <h4 className="font-medium mb-2 text-sm">Bank Details</h4>
                                <p className="text-sm text-slate-600">Bank: {employee.employeeProfile?.bankName}</p>
                                <p className="text-sm text-slate-600">Acc: {employee.employeeProfile?.accountNumber}</p>
                                <p className="text-sm text-slate-600">IFSC: {employee.employeeProfile?.ifscCode}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Performance & Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
                                <div className="h-full">
                                    <h4 className="text-sm font-medium mb-2 text-center">Attendance Overview</h4>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <PieChart>
                                            <Pie
                                                data={attendanceData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {attendanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="h-full">
                                    <h4 className="text-sm font-medium mb-2 text-center">Salary History</h4>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <BarChart data={salaryData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="salary" fill="#82ca9d" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leads Performance Section */}
                    <Card className="md:col-span-3">
                         <CardHeader><CardTitle>Leads Performance (Recent)</CardTitle></CardHeader>
                         <CardContent>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 <div className="bg-blue-50 p-4 rounded-lg text-center">
                                     <p className="text-3xl font-bold text-blue-700">{employee.salesExecLeads.length}</p>
                                     <p className="text-sm text-slate-600">Total Assigned</p>
                                 </div>
                                 <div className="bg-green-50 p-4 rounded-lg text-center">
                                     <p className="text-3xl font-bold text-green-700">{employee.salesExecLeads.filter(l => l.status === 'deal_closed').length}</p>
                                     <p className="text-sm text-slate-600">Deals Closed</p>
                                 </div>
                                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                     <p className="text-3xl font-bold text-yellow-700">{employee.salesExecLeads.filter(l => l.status === 'meeting_scheduled').length}</p>
                                     <p className="text-sm text-slate-600">Meetings</p>
                                 </div>
                                 <div className="bg-purple-50 p-4 rounded-lg text-center">
                                     <p className="text-3xl font-bold text-purple-700">{employee.salesExecLeads.filter(l => l.status === 'follow_up').length}</p>
                                     <p className="text-sm text-slate-600">Follow Ups</p>
                                 </div>
                             </div>
                         </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'attendance' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Log In</TableHead>
                                    <TableHead>Log Out</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employee.attendance.length > 0 ? (
                                    employee.attendance.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    record.status === 'Present' ? 'bg-green-100 text-green-700' : 
                                                    record.status === 'Late' ? 'bg-yellow-100 text-yellow-700' : 
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</TableCell>
                                            <TableCell>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">No attendance records found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
            
            {activeTab === 'leaves' && (
                <div className="space-y-6">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Leave Management</CardTitle>
                            <Dialog open={isManualLeaveOpen} onOpenChange={setIsManualLeaveOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" /> Manual Entry
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Leave Record</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleManualLeaveSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="startDate">Start Date</Label>
                                                <Input id="startDate" name="startDate" type="date" value={leaveFormData.startDate} onChange={handleLeaveInputChange} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="endDate">End Date</Label>
                                                <Input id="endDate" name="endDate" type="date" value={leaveFormData.endDate} onChange={handleLeaveInputChange} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="days">Number of Days</Label>
                                            <Input id="days" name="days" type="number" step="0.5" value={leaveFormData.days} onChange={handleLeaveInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Leave Type</Label>
                                            <Select onValueChange={(val) => setLeaveFormData({...leaveFormData, type: val})} value={leaveFormData.type}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Paid">Paid</SelectItem>
                                                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                                                    <SelectItem value="Sick">Sick</SelectItem>
                                                    <SelectItem value="Casual">Casual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Reason / Remarks</Label>
                                            <Input id="reason" name="reason" value={leaveFormData.reason} onChange={handleLeaveInputChange} />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button type="button" variant="outline" onClick={() => setIsManualLeaveOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                Add Leave
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employee.leaveRequests.length > 0 ? (
                                        employee.leaveRequests.map((leave) => (
                                            <TableRow key={leave.id}>
                                                <TableCell>{leave.type}</TableCell>
                                                <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{leave.reason}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                                        leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {leave.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">No leave records found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'payroll' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Salary Configuration</CardTitle>
                            <div className="flex gap-2">
                                <Dialog open={isSalaryStructureOpen} onOpenChange={setIsSalaryStructureOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            Configure Structure
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Salary Structure Configuration</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleSalaryStructureSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Earnings */}
                                                <div className="space-y-4 border p-4 rounded-lg bg-green-50/50">
                                                    <h3 className="font-semibold text-green-800 border-b pb-2">Earnings</h3>
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 items-center gap-2">
                                                            <Label htmlFor="basicSalary">Basic Pay</Label>
                                                            <Input id="basicSalary" name="basicSalary" type="number" value={salaryStructure.basicSalary} onChange={handleSalaryStructureChange} />
                                                        </div>
                                                        <div className="grid grid-cols-2 items-center gap-2">
                                                            <Label htmlFor="hra">HRA</Label>
                                                            <Input id="hra" name="hra" type="number" value={salaryStructure.hra} onChange={handleSalaryStructureChange} />
                                                        </div>
                                                        <div className="grid grid-cols-2 items-center gap-2">
                                                            <Label htmlFor="specialAllowance">Special Allowance</Label>
                                                            <Input id="specialAllowance" name="specialAllowance" type="number" value={salaryStructure.specialAllowance} onChange={handleSalaryStructureChange} />
                                                        </div>
                                                        <div className="grid grid-cols-2 items-center gap-2">
                                                            <Label htmlFor="medicalAllowance">Medical Allowance</Label>
                                                            <Input id="medicalAllowance" name="medicalAllowance" type="number" value={salaryStructure.medicalAllowance} onChange={handleSalaryStructureChange} />
                                                        </div>
                                                        
                                                        {/* Custom Earnings */}
                                                        {customEarnings.map((item, index) => (
                                                            <div key={`earning-${index}`} className="grid grid-cols-12 gap-2 items-center">
                                                                <div className="col-span-6">
                                                                    <Input 
                                                                        placeholder="Name" 
                                                                        value={item.name} 
                                                                        onChange={(e) => handleCustomComponentChange('earnings', index, 'name', e.target.value)} 
                                                                    />
                                                                </div>
                                                                <div className="col-span-5">
                                                                    <Input 
                                                                        type="number" 
                                                                        placeholder="Amount" 
                                                                        value={item.amount} 
                                                                        onChange={(e) => handleCustomComponentChange('earnings', index, 'amount', parseFloat(e.target.value) || 0)} 
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomComponent('earnings', index)} className="text-red-500 hover:text-red-700 hover:bg-red-100">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                        <Button type="button" variant="outline" size="sm" onClick={() => addCustomComponent('earnings')} className="w-full border-dashed text-green-700 border-green-200 hover:bg-green-100">
                                                            <Plus className="w-4 h-4 mr-2" /> Add Custom Earning
                                                        </Button>
                                                    </div>
                                                    <div className="pt-2 border-t flex justify-between font-bold text-green-900">
                                                        <span>Gross Earnings:</span>
                                                        <span>₹{(salaryStructure.basicSalary + salaryStructure.hra + salaryStructure.specialAllowance + salaryStructure.medicalAllowance).toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                {/* Deductions */}
                                                <div className="space-y-4 border p-4 rounded-lg bg-red-50/50">
                                                    <h3 className="font-semibold text-red-800 border-b pb-2">Deductions</h3>
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 items-center gap-2">
                                                            <Label htmlFor="pf">Provident Fund (PF)</Label>
                                                            <Input id="pf" name="pf" type="number" value={salaryStructure.pf} onChange={handleSalaryStructureChange} />
                                                        </div>
                                                        <div className="grid grid-cols-2 items-center gap-2">
                                                            <Label htmlFor="healthInsurance">Health Insurance</Label>
                                                            <Input id="healthInsurance" name="healthInsurance" type="number" value={salaryStructure.healthInsurance} onChange={handleSalaryStructureChange} />
                                                        </div>
                                                        <div className="grid grid-cols-2 items-center gap-2">
                                                            <Label htmlFor="professionalTax">Professional Tax</Label>
                                                            <Input id="professionalTax" name="professionalTax" type="number" value={salaryStructure.professionalTax} onChange={handleSalaryStructureChange} />
                                                        </div>
                                                        
                                                        {/* Custom Deductions */}
                                                        {customDeductions.map((item, index) => (
                                                            <div key={`deduction-${index}`} className="grid grid-cols-12 gap-2 items-center">
                                                                <div className="col-span-6">
                                                                    <Input 
                                                                        placeholder="Name" 
                                                                        value={item.name} 
                                                                        onChange={(e) => handleCustomComponentChange('deductions', index, 'name', e.target.value)} 
                                                                    />
                                                                </div>
                                                                <div className="col-span-5">
                                                                    <Input 
                                                                        type="number" 
                                                                        placeholder="Amount" 
                                                                        value={item.amount} 
                                                                        onChange={(e) => handleCustomComponentChange('deductions', index, 'amount', parseFloat(e.target.value) || 0)} 
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomComponent('deductions', index)} className="text-red-500 hover:text-red-700 hover:bg-red-100">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                        <Button type="button" variant="outline" size="sm" onClick={() => addCustomComponent('deductions')} className="w-full border-dashed text-red-700 border-red-200 hover:bg-red-100">
                                                            <Plus className="w-4 h-4 mr-2" /> Add Custom Deduction
                                                        </Button>
                                                    </div>
                                                    <div className="pt-2 border-t flex justify-between font-bold text-red-900">
                                                        <span>Total Deductions:</span>
                                                        <span>₹{(salaryStructure.pf + salaryStructure.healthInsurance + salaryStructure.professionalTax).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Net Summary */}
                                            <div className="bg-slate-100 p-4 rounded-lg space-y-2">
                                                <div className="flex justify-between items-center text-lg font-bold">
                                                    <span>Net Salary:</span>
                                                    <span>₹{(
                                                        (salaryStructure.basicSalary + salaryStructure.hra + salaryStructure.specialAllowance + salaryStructure.medicalAllowance + customEarnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)) - 
                                                        (salaryStructure.pf + salaryStructure.healthInsurance + salaryStructure.professionalTax + customDeductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0))
                                                    ).toFixed(2)}</span>
                                                </div>
                                                <div className="text-sm text-slate-500 text-right capitalize">
                                                    {numberToWords(
                                                        (salaryStructure.basicSalary + salaryStructure.hra + salaryStructure.specialAllowance + salaryStructure.medicalAllowance + customEarnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)) - 
                                                        (salaryStructure.pf + salaryStructure.healthInsurance + salaryStructure.professionalTax + customDeductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0))
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button type="button" variant="outline" onClick={() => setIsSalaryStructureOpen(false)}>Cancel</Button>
                                                <Button type="submit" disabled={isSaving}>
                                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                    Save Structure
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Button onClick={handleGenerateSlip} disabled={generatingSlip} size="sm">
                                    {generatingSlip ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Generate Slip
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-600 mb-1">Gross Earnings</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        ₹{((employee.employeeProfile?.basicSalary || 0) + (employee.employeeProfile?.hra || 0) + (employee.employeeProfile?.specialAllowance || 0) + (employee.employeeProfile?.medicalAllowance || 0) + (customEarnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0))).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm text-red-600 mb-1">Total Deductions</p>
                                    <p className="text-2xl font-bold text-red-900">
                                        ₹{((employee.employeeProfile?.pf || 0) + (employee.employeeProfile?.healthInsurance || 0) + (employee.employeeProfile?.professionalTax || 0) + (customDeductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0))).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-600 mb-1">Net Salary</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        ₹{(((
                                            (employee.employeeProfile?.basicSalary || 0) + (employee.employeeProfile?.hra || 0) + (employee.employeeProfile?.specialAllowance || 0) + (employee.employeeProfile?.medicalAllowance || 0) + (customEarnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0))
                                        ) - (
                                            (employee.employeeProfile?.pf || 0) + (employee.employeeProfile?.healthInsurance || 0) + (employee.employeeProfile?.professionalTax || 0) + (customDeductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0))
                                        )).toLocaleString())}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Salary Slips</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month/Year</TableHead>
                                        <TableHead>Basic</TableHead>
                                        <TableHead>Allowances</TableHead>
                                        <TableHead>Deductions</TableHead>
                                        <TableHead>Net Salary</TableHead>
                                        <TableHead>Generated On</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employee.salarySlips.map((slip) => (
                                        <TableRow key={slip.id}>
                                            <TableCell>{slip.month}/{slip.year}</TableCell>
                                            <TableCell>₹{slip.basicSalary}</TableCell>
                                            <TableCell>₹{slip.allowances}</TableCell>
                                            <TableCell>₹{slip.deductions}</TableCell>
                                            <TableCell className="font-bold">₹{slip.netSalary}</TableCell>
                                            <TableCell>{new Date(slip.generatedDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" title="View Slip" onClick={() => { setViewSlip(slip); setIsSlipModalOpen(true); }}>
                                                        <Eye className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Download Slip" onClick={() => { setViewSlip(slip); setDownloadingSlipId(slip.id); setDownloadTrigger(true); }} disabled={!!downloadingSlipId}>
                                                        {downloadingSlipId === slip.id ? <Loader2 className="w-4 h-4 animate-spin text-green-600" /> : <Download className="w-4 h-4 text-green-600" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Email Slip" onClick={() => { setViewSlip(slip); setEmailingSlipId(slip.id); setEmailTrigger(true); }} disabled={!!emailingSlipId}>
                                                        {emailingSlipId === slip.id ? <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> : <Send className="w-4 h-4 text-purple-600" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Hidden Salary Slip for PDF Generation */}
            <div style={{ position: 'absolute', left: '-10000px', top: 0 }}>
                {viewSlip && (
                    <div id="salary-slip-print" className="border p-6 rounded-lg bg-white text-slate-900 font-sans relative" style={{ width: '210mm', minHeight: '297mm' }}>
                        <div className="absolute top-4 right-4 text-[10px] text-slate-400 font-mono">
                            SLIP-{viewSlip.year}{viewSlip.month.toString().padStart(2, '0')}-{employee.id.toString().padStart(4, '0')}
                        </div>
                        <div className="text-center border-b-2 border-slate-800 pb-2 mb-4">
                            <img 
                                src="/assets/dp-logo.png" 
                                alt="Dream Properties Logo" 
                                className="h-16 w-auto object-contain mx-auto mb-2"
                            />
                            <h2 className="text-lg font-bold mt-1 underline uppercase tracking-wide">Salary Slip</h2>
                            <p className="font-medium text-slate-600 text-xs">For the month of {new Date(0, viewSlip.month - 1).toLocaleString('default', { month: 'long' })} {viewSlip.year}</p>
                        </div>

                        {/* Employee Details Table */}
                        <table className="w-full mb-4 border-collapse border border-slate-300 text-xs">
                            <tbody>
                                <tr>
                                    <td className="p-1 border border-slate-300 font-semibold bg-slate-50 w-1/4">Employee Name</td>
                                    <td className="p-1 border border-slate-300 w-1/4">{employee.name}</td>
                                    <td className="p-1 border border-slate-300 font-semibold bg-slate-50 w-1/4">Designation</td>
                                    <td className="p-1 border border-slate-300 w-1/4">{employee.employeeProfile?.designation || employee.role}</td>
                                </tr>
                                <tr>
                                    <td className="p-1 border border-slate-300 font-semibold bg-slate-50">Employee ID</td>
                                    <td className="p-1 border border-slate-300">EMP-{employee.id.toString().padStart(3, '0')}</td>
                                    <td className="p-1 border border-slate-300 font-semibold bg-slate-50">Department</td>
                                    <td className="p-1 border border-slate-300">{employee.employeeProfile?.department || 'General'}</td>
                                </tr>
                                <tr>
                                    <td className="p-1 border border-slate-300 font-semibold bg-slate-50">Bank Name</td>
                                    <td className="p-1 border border-slate-300">{employee.employeeProfile?.bankName || '-'}</td>
                                    <td className="p-1 border border-slate-300 font-semibold bg-slate-50">Account No</td>
                                    <td className="p-1 border border-slate-300">{employee.employeeProfile?.accountNumber || '-'}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Salary Details Table */}
                        <div className="flex gap-0 border border-slate-300 mb-4 text-xs">
                            {/* Earnings Table */}
                            <div className="w-1/2 border-r border-slate-300">
                                    <div className="bg-slate-100 font-bold p-1 border-b border-slate-300 text-center text-green-800">Earnings</div>
                                    <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="p-1 border-b border-slate-100">Basic Salary</td>
                                            <td className="p-1 border-b border-slate-100 text-right">{viewSlip.basicSalary.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-1 border-b border-slate-100">HRA</td>
                                            <td className="p-1 border-b border-slate-100 text-right">{viewSlip.hra.toFixed(2)}</td>
                                        </tr>
                                        {viewSlip.details?.specialAllowance > 0 && (
                                            <tr>
                                                <td className="p-1 border-b border-slate-100">Special Allowance</td>
                                                <td className="p-1 border-b border-slate-100 text-right">{viewSlip.details.specialAllowance.toFixed(2)}</td>
                                            </tr>
                                        )}
                                            {viewSlip.details?.medicalAllowance > 0 && (
                                            <tr>
                                                <td className="p-1 border-b border-slate-100">Medical Allowance</td>
                                                <td className="p-1 border-b border-slate-100 text-right">{viewSlip.details.medicalAllowance.toFixed(2)}</td>
                                            </tr>
                                        )}
                                        {viewSlip.details?.customEarnings?.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="p-1 border-b border-slate-100">{item.name}</td>
                                                <td className="p-1 border-b border-slate-100 text-right">{(Number(item.amount) || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-green-50 font-bold">
                                            <td className="p-1 border-t border-slate-300">Gross Earnings</td>
                                            <td className="p-1 border-t border-slate-300 text-right">{(viewSlip.basicSalary + viewSlip.hra + (viewSlip.allowances || 0)).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                    </table>
                            </div>

                            {/* Deductions Table */}
                            <div className="w-1/2">
                                    <div className="bg-slate-100 font-bold p-1 border-b border-slate-300 text-center text-red-800">Deductions</div>
                                    <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="p-1 border-b border-slate-100">Provident Fund (PF)</td>
                                            <td className="p-1 border-b border-slate-100 text-right">{(viewSlip.details?.pf || 0).toFixed(2)}</td>
                                        </tr>
                                            <tr>
                                            <td className="p-1 border-b border-slate-100">Professional Tax</td>
                                            <td className="p-1 border-b border-slate-100 text-right">{(viewSlip.details?.professionalTax || 0).toFixed(2)}</td>
                                        </tr>
                                            <tr>
                                            <td className="p-1 border-b border-slate-100">Health Insurance</td>
                                            <td className="p-1 border-b border-slate-100 text-right">{(viewSlip.details?.healthInsurance || 0).toFixed(2)}</td>
                                        </tr>
                                        {viewSlip.details?.customDeductions?.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="p-1 border-b border-slate-100">{item.name}</td>
                                                <td className="p-1 border-b border-slate-100 text-right">{(Number(item.amount) || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-red-50 font-bold">
                                            <td className="p-1 border-t border-slate-300">Total Deductions</td>
                                            <td className="p-1 border-t border-slate-300 text-right">{viewSlip.deductions.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                    </table>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-3 text-center rounded-lg mb-6">
                            <p className="text-xs text-blue-600 mb-1 font-semibold uppercase tracking-wider">Net Salary Payable</p>
                            <p className="text-2xl font-bold text-blue-900">₹{viewSlip.netSalary.toFixed(2)}</p>
                            <p className="text-[10px] text-slate-500 mt-1 capitalize">({numberToWords(viewSlip.netSalary)})</p>
                        </div>

                        <div className="text-center text-[10px] text-slate-400 mt-6 pt-3 border-t border-slate-200">
                            <p>This is a computer generated slip and does not require signature.</p>
                            <p>Dream Properties • 123 Real Estate Avenue, City • contact@dreamproperties.com</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Alert Component */}
            <Alert
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                type={alertState.type}
                title={alertState.title}
                message={alertState.message}
            />

            {/* Salary Slip View Dialog */}
            <Dialog open={isSlipModalOpen} onOpenChange={setIsSlipModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Salary Slip Preview</DialogTitle>
                    </DialogHeader>
                    
                    {viewSlip && (
                        <div className="space-y-4">
                            <div id="salary-slip-print" className="border p-8 rounded-lg bg-white text-slate-900 font-sans relative">
                                <div className="absolute top-4 right-4 text-xs text-slate-400 font-mono">
                                    SLIP-{viewSlip.year}{viewSlip.month.toString().padStart(2, '0')}-{employee.id.toString().padStart(4, '0')}
                                </div>
                                <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                                    <img 
                                        src="/assets/dp-logo.png" 
                                        alt="Dream Properties Logo" 
                                        className="h-24 w-auto object-contain mx-auto mb-4"
                                    />
                                    <h2 className="text-xl font-bold mt-2 underline uppercase tracking-wide">Salary Slip</h2>
                                    <p className="font-medium text-slate-600">For the month of {new Date(0, viewSlip.month - 1).toLocaleString('default', { month: 'long' })} {viewSlip.year}</p>
                                </div>

                                {/* Employee Details Table */}
                                <table className="w-full mb-6 border-collapse border border-slate-300 text-sm">
                                    <tbody>
                                        <tr>
                                            <td className="p-2 border border-slate-300 font-semibold bg-slate-50 w-1/4">Employee Name</td>
                                            <td className="p-2 border border-slate-300 w-1/4">{employee.name}</td>
                                            <td className="p-2 border border-slate-300 font-semibold bg-slate-50 w-1/4">Designation</td>
                                            <td className="p-2 border border-slate-300 w-1/4">{employee.employeeProfile?.designation || employee.role}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Employee ID</td>
                                            <td className="p-2 border border-slate-300">EMP-{employee.id.toString().padStart(3, '0')}</td>
                                            <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Department</td>
                                            <td className="p-2 border border-slate-300">{employee.employeeProfile?.department || 'General'}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Bank Name</td>
                                            <td className="p-2 border border-slate-300">{employee.employeeProfile?.bankName || '-'}</td>
                                            <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Account No</td>
                                            <td className="p-2 border border-slate-300">{employee.employeeProfile?.accountNumber || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Salary Details Table */}
                                <div className="flex gap-0 border border-slate-300 mb-6 text-sm">
                                    {/* Earnings Table */}
                                    <div className="w-1/2 border-r border-slate-300">
                                         <div className="bg-slate-100 font-bold p-2 border-b border-slate-300 text-center text-green-800">Earnings</div>
                                         <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="p-2 border-b border-slate-100">Basic Salary</td>
                                                    <td className="p-2 border-b border-slate-100 text-right">{viewSlip.basicSalary.toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2 border-b border-slate-100">HRA</td>
                                                    <td className="p-2 border-b border-slate-100 text-right">{viewSlip.hra.toFixed(2)}</td>
                                                </tr>
                                                {viewSlip.details?.specialAllowance > 0 && (
                                                    <tr>
                                                        <td className="p-2 border-b border-slate-100">Special Allowance</td>
                                                        <td className="p-2 border-b border-slate-100 text-right">{viewSlip.details.specialAllowance.toFixed(2)}</td>
                                                    </tr>
                                                )}
                                                 {viewSlip.details?.medicalAllowance > 0 && (
                                                    <tr>
                                                        <td className="p-2 border-b border-slate-100">Medical Allowance</td>
                                                        <td className="p-2 border-b border-slate-100 text-right">{viewSlip.details.medicalAllowance.toFixed(2)}</td>
                                                    </tr>
                                                )}
                                                {viewSlip.details?.customEarnings?.map((item: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="p-2 border-b border-slate-100">{item.name}</td>
                                                        <td className="p-2 border-b border-slate-100 text-right">{(Number(item.amount) || 0).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-green-50 font-bold">
                                                    <td className="p-2 border-t border-slate-300">Gross Earnings</td>
                                                    <td className="p-2 border-t border-slate-300 text-right">{(viewSlip.basicSalary + viewSlip.hra + (viewSlip.allowances || 0)).toFixed(2)}</td>
                                                </tr>
                                            </tbody>
                                         </table>
                                    </div>

                                    {/* Deductions Table */}
                                    <div className="w-1/2">
                                         <div className="bg-slate-100 font-bold p-2 border-b border-slate-300 text-center text-red-800">Deductions</div>
                                         <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="p-2 border-b border-slate-100">Provident Fund (PF)</td>
                                                    <td className="p-2 border-b border-slate-100 text-right">{(viewSlip.details?.pf || 0).toFixed(2)}</td>
                                                </tr>
                                                 <tr>
                                                    <td className="p-2 border-b border-slate-100">Professional Tax</td>
                                                    <td className="p-2 border-b border-slate-100 text-right">{(viewSlip.details?.professionalTax || 0).toFixed(2)}</td>
                                                </tr>
                                                 <tr>
                                                    <td className="p-2 border-b border-slate-100">Health Insurance</td>
                                                    <td className="p-2 border-b border-slate-100 text-right">{(viewSlip.details?.healthInsurance || 0).toFixed(2)}</td>
                                                </tr>
                                                {viewSlip.details?.customDeductions?.map((item: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="p-2 border-b border-slate-100">{item.name}</td>
                                                        <td className="p-2 border-b border-slate-100 text-right">{(Number(item.amount) || 0).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-red-50 font-bold">
                                                    <td className="p-2 border-t border-slate-300">Total Deductions</td>
                                                    <td className="p-2 border-t border-slate-300 text-right">{viewSlip.deductions.toFixed(2)}</td>
                                                </tr>
                                            </tbody>
                                         </table>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 p-4 text-center rounded-lg mb-8">
                                    <p className="text-sm text-blue-600 mb-1 font-semibold uppercase tracking-wider">Net Salary Payable</p>
                                    <p className="text-3xl font-bold text-blue-900">₹{viewSlip.netSalary.toFixed(2)}</p>
                                    <p className="text-xs text-slate-500 mt-1 capitalize">({numberToWords(viewSlip.netSalary)})</p>
                                </div>

                                <div className="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-200">
                                    <p>This is a computer generated slip and does not require signature.</p>
                                    <p>Dream Properties • 123 Real Estate Avenue, City • contact@dreamproperties.com</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsSlipModalOpen(false)}>Close</Button>
                                <Button onClick={processEmailSlip} disabled={isSendingEmail} className="gap-2 bg-purple-600 hover:bg-purple-700">
                                    {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Email Slip
                                </Button>
                                <Button onClick={handleDownloadPDF} className="gap-2">
                                    <Download className="w-4 h-4" /> Download PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
