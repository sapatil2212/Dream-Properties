'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/components/UIComponents';
import { Plus, Search, User, Phone, Mail, Briefcase, Loader2, ArrowRight, Building2, Wallet } from 'lucide-react';
import Link from 'next/link';

interface Employee {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  employeeProfile: {
    designation: string;
    department: string;
    joiningDate: string;
    basicSalary: number;
  } | null;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [enableLogin, setEnableLogin] = useState(false);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertState({ isOpen: true, type, title, message });
  };

  // New Employee Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'SALES_EXECUTIVE',
    designation: '',
    department: '',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: '',
    leavesAllotted: '12',
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/employees?search=${search}`);
      if (res.ok) {
        const data = await res.json();
        // Filter out ADMIN role users
        const nonAdminEmployees = data.filter((emp: Employee) => emp.role !== 'ADMIN');
        setEmployees(nonAdminEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
        setEmailError(null);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsAddOpen(false);
        fetchEmployees();
        setFormData({
            name: '',
            email: '',
            mobile: '',
            password: '',
            role: 'SALES_EXECUTIVE',
            designation: '',
            department: '',
            joiningDate: new Date().toISOString().split('T')[0],
            basicSalary: '',
            leavesAllotted: '12',
            accountNumber: '',
            bankName: '',
            ifscCode: ''
        });
        setEnableLogin(false);
        setIsCustomRole(false);
        showAlert('success', 'Success', 'Employee added successfully!');
      } else {
        const data = await res.json();
        if (data.message && data.message.toLowerCase().includes('email')) {
            setEmailError('This email is already registered.');
        } else {
            showAlert('error', 'Error', data.message || 'Failed to add employee');
        }
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      showAlert('error', 'Error', 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-slate-500 mt-1">Manage your team, attendance, and payroll</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} className={emailError ? 'border-red-500 focus:ring-red-500' : ''} />
                  {emailError && <p className="text-xs text-red-500 font-medium">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" name="mobile" required value={formData.mobile} onChange={handleInputChange} />
                </div>
                
                <div className="md:col-span-2 flex items-center space-x-2 border p-3 rounded-md bg-slate-50">
                    <input
                        type="checkbox"
                        id="enableLogin"
                        checked={enableLogin}
                        onChange={(e) => {
                            setEnableLogin(e.target.checked);
                            if (!e.target.checked) {
                                setFormData(prev => ({ ...prev, password: '' }));
                            }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                        <Label htmlFor="enableLogin" className="font-medium cursor-pointer">Enable Login Access</Label>
                        <span className="text-xs text-slate-500">Check this if the employee needs to log in to the system</span>
                    </div>
                </div>

                {enableLogin && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required={enableLogin} value={formData.password} onChange={handleInputChange} placeholder="Create a strong password" />
                    </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    onValueChange={(val) => {
                        if (val === 'OTHER') {
                            setIsCustomRole(true);
                            setFormData(prev => ({ ...prev, role: '' }));
                        } else {
                            setIsCustomRole(false);
                            setFormData(prev => ({ ...prev, role: val }));
                        }
                    }} 
                    value={isCustomRole ? 'OTHER' : formData.role}
                  >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="SALES_EXECUTIVE">Sales Executive</SelectItem>
                        <SelectItem value="TELECALLER">Telecaller</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="OTHER">Custom Role</SelectItem>
                    </SelectContent>
                  </Select>
                  {isCustomRole && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                        <Input 
                            placeholder="Enter custom role" 
                            value={formData.role} 
                            onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))} 
                            required 
                        />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" name="designation" value={formData.designation} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input id="joiningDate" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="basicSalary">Basic Salary</Label>
                    <Input id="basicSalary" name="basicSalary" type="number" value={formData.basicSalary} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="leavesAllotted">Leaves Allotted (Yearly)</Label>
                    <Input id="leavesAllotted" name="leavesAllotted" type="number" value={formData.leavesAllotted} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-3">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" name="bankName" value={formData.bankName} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input id="ifscCode" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} />
                    </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Employee
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search employees..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed">
            <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No employees found</h3>
            <p className="text-slate-500">Get started by adding a new employee to your team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {employee.name.charAt(0)}
                </div>
                <div>
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <p className="text-sm text-slate-500">{employee.employeeProfile?.designation || employee.role}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-4 h-4 mr-2 text-slate-400" />
                    {employee.email}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                    {employee.mobile}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                    <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                    {employee.employeeProfile?.department || 'General'}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                    <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                    Joined: {employee.employeeProfile?.joiningDate ? new Date(employee.employeeProfile.joiningDate).toLocaleDateString() : 'N/A'}
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t bg-slate-50/50">
                <Link href={`/dashboard/employees/${employee.id}`} className="w-full">
                    <Button variant="ghost" className="w-full justify-between hover:bg-white hover:text-blue-600 group">
                        View Profile & Reports
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Alert 
        isOpen={alertState.isOpen} 
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
      />
    </div>
  );
}
