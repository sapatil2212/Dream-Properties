'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, Select, Input, Modal, Button } from '@/components/UIComponents';
import { AlertModal } from '@/components/ui/alert-modal';
import { Plus, Search, User, Phone, Mail, Briefcase, Loader2, ArrowRight, Building2, Send, Lock, Check, Power, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { OnboardingModal } from '@/components/dashboard/OnboardingModal';

interface Employee {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  address?: string;
  occupation?: string;
  experienceYears?: number;
  experienceMonths?: number;
  isFresher?: boolean;
  status?: string;
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
  const [sortBy, setSortBy] = useState('Newest');
  const [filterRole, setFilterRole] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [enableLogin, setEnableLogin] = useState(false);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [credentialStates, setCredentialStates] = useState<Record<number, 'idle' | 'loading' | 'success' | 'error'>>({});
  const [statusLoadingState, setStatusLoadingState] = useState<Record<number, boolean>>({});
  const [statusSuccessState, setStatusSuccessState] = useState<Record<number, boolean>>({});
  
  // Onboarding State
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Alert Modal State
  const [alertModalState, setAlertModalState] = useState({
    isOpen: false,
    employeeId: null as number | null,
    type: 'warning' as 'error' | 'warning' | 'info',
    title: '',
    message: '',
    isLoading: false,
    isSuccess: false
  });

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
    ifscCode: '',
    shiftStartTime: '09:00',
    workingHours: '9',
    lateMarkDeduction: '0'
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
        setEmailError(null);
    }
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
            ifscCode: '',
            shiftStartTime: '09:00',
            workingHours: '9',
            lateMarkDeduction: '0'
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

  const handleSendCredentials = async (id: number, email: string) => {
    setCredentialStates(prev => ({ ...prev, [id]: 'loading' }));
    try {
      const response = await fetch('/api/superadmin/send-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        setCredentialStates(prev => ({ ...prev, [id]: 'success' }));
        setTimeout(() => {
             setCredentialStates(prev => ({ ...prev, [id]: 'idle' }));
        }, 3000);
      } else {
        setCredentialStates(prev => ({ ...prev, [id]: 'error' }));
        showAlert('error', 'Error', 'Failed to send credentials');
        setTimeout(() => {
             setCredentialStates(prev => ({ ...prev, [id]: 'idle' }));
        }, 3000);
      }
    } catch (err) {
      setCredentialStates(prev => ({ ...prev, [id]: 'error' }));
      showAlert('error', 'Error', 'Network error');
      setTimeout(() => {
             setCredentialStates(prev => ({ ...prev, [id]: 'idle' }));
        }, 3000);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string | undefined) => {
    const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    setStatusLoadingState(prev => ({ ...prev, [id]: true }));
    try {
        const res = await fetch(`/api/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (res.ok) {
            // showAlert('success', 'Status Updated', `Employee ${newStatus === 'Active' ? 'activated' : 'disabled'} successfully`);
            setStatusSuccessState(prev => ({ ...prev, [id]: true }));
            fetchEmployees();
            setTimeout(() => {
                setStatusSuccessState(prev => ({ ...prev, [id]: false }));
            }, 2000);
        } else {
            showAlert('error', 'Error', 'Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showAlert('error', 'Error', 'Something went wrong');
    } finally {
        setStatusLoadingState(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: number) => {
    // Open confirmation modal instead of using browser confirm
    setAlertModalState({
      isOpen: true,
      employeeId: id,
      type: 'warning',
      title: 'Delete Employee',
      message: 'Are you sure you want to delete this employee? This will remove them completely from the database.',
      isLoading: false,
      isSuccess: false
    });
  };

  const confirmDelete = async () => {
    if (!alertModalState.employeeId) return;
    
    // Show loading state
    setAlertModalState(prev => ({
      ...prev,
      isLoading: true
    }));
    
    try {
        const res = await fetch(`/api/employees/${alertModalState.employeeId}`, {
            method: 'DELETE'
        });
        
        const result = await res.json();
        
        if (res.ok) {
            // Show success state in the same modal
            setAlertModalState(prev => ({
              ...prev,
              isLoading: false,
              isSuccess: true,
              title: 'Employee Deleted',
              message: 'Employee has been successfully removed from the database.'
            }));
            
            // Refresh the employee list to show updated data
            await fetchEmployees();
            
            // Close modal after delay
            setTimeout(() => {
              setAlertModalState({
                isOpen: false,
                employeeId: null,
                type: 'warning',
                title: '',
                message: '',
                isLoading: false,
                isSuccess: false
              });
            }, 2000);
        } else {
            // Show error state
            setAlertModalState(prev => ({
              ...prev,
              isLoading: false,
              isSuccess: false,
              type: 'error',
              title: 'Deletion Failed',
              message: result.message || 'Failed to delete employee. Please try again.'
            }));
            
            // Reset to normal state after delay
            setTimeout(() => {
              setAlertModalState(prev => ({
                ...prev,
                type: 'warning',
                title: 'Delete Employee',
                message: 'Are you sure you want to delete this employee? This will remove them completely.',
                isSuccess: false
              }));
            }, 2000);
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        // Show error state
        setAlertModalState(prev => ({
          ...prev,
          isLoading: false,
          isSuccess: false,
          type: 'error',
          title: 'Deletion Failed',
          message: 'Something went wrong. Please try again.'
        }));
        
        // Reset to normal state after delay
        setTimeout(() => {
          setAlertModalState(prev => ({
            ...prev,
            type: 'warning',
            title: 'Delete Employee',
            message: 'Are you sure you want to delete this employee? This will remove them completely.',
            isSuccess: false
          }));
        }, 2000);
    }
  };

  const filteredEmployees = employees
    .filter(emp => {
      if (filterRole === 'All') return true;
      if (filterRole === 'Sales Executive') return emp.role === 'SALES_EXECUTIVE';
      if (filterRole === 'Telecaller') return emp.role === 'TELECALLER';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') return b.id - a.id;
      if (sortBy === 'Oldest') return a.id - b.id;
      if (sortBy === 'Name') return a.name.localeCompare(b.name);
      return 0;
    });

  const activeList = filteredEmployees.filter(e => e.status !== 'Disabled' && e.status !== 'Deleted');
  const inactiveList = filteredEmployees.filter(e => e.status === 'Disabled' || e.status === 'Deleted');

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <Card key={employee.id} className="hover:shadow-md transition-shadow relative group">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 pr-12">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
            {employee.name.charAt(0)}
        </div>
        <div>
            <CardTitle className="text-lg">{employee.name}</CardTitle>
            <p className="text-sm text-slate-500">{employee.employeeProfile?.designation || employee.role}</p>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
            <button 
                onClick={() => handleToggleStatus(employee.id, employee.status)}
                disabled={statusLoadingState[employee.id]}
                className={`p-1.5 rounded-full transition-colors ${
                    employee.status === 'Disabled' 
                    ? 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600' 
                    : 'bg-emerald-50 text-emerald-600 hover:bg-slate-100 hover:text-slate-400'
                }`}
                title={employee.status === 'Disabled' ? "Activate Employee" : "Disable Employee"}
            >
                {statusLoadingState[employee.id] ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : statusSuccessState[employee.id] ? (
                    <Check size={16} />
                ) : (
                    <Power size={16} />
                )}
            </button>
            <button 
                onClick={() => handleDelete(employee.id)}
                className="p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                title="Delete Employee"
            >
                <Trash2 size={16} />
            </button>
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
      <CardFooter className="grid grid-cols-2 gap-3 pt-2 border-t bg-slate-50/50">
        {!employee.employeeProfile ? (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white col-span-1 text-[10px] px-2"
            onClick={() => {
              setSelectedEmployee(employee);
              setIsOnboardingOpen(true);
            }}
          >
            Start Onboarding
          </Button>
        ) : (
          <Link href={`/dashboard/employees/${employee.id}`} className="w-full col-span-1">
            <Button variant="ghost" className="w-full justify-between hover:bg-white hover:text-blue-600 group text-[10px] px-2">
                View Profile & Reports
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        )}
        
        <Button 
            variant="outline" 
            className={`w-full justify-center transition-all duration-300 col-span-1 text-[10px] px-2 ${
                credentialStates[employee.id] === 'success' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' 
                : credentialStates[employee.id] === 'error'
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                : 'text-slate-600 hover:text-blue-600 hover:border-blue-200'
            }`}
            onClick={() => handleSendCredentials(employee.id, employee.email)}
            disabled={credentialStates[employee.id] === 'loading' || credentialStates[employee.id] === 'success'}
        >
            {credentialStates[employee.id] === 'loading' ? (
                <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Sending
                </>
            ) : credentialStates[employee.id] === 'success' ? (
                <>
                    <Check className="w-3 h-3 mr-1" />
                    Sent
                </>
            ) : (
                <>
                    <Send className="w-3 h-3 mr-1" />
                    Log in details
                </>
            )}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-slate-500 mt-1">Manage your team, attendance, and payroll</p>
        </div>
        
        <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddOpen(true)}
        >
            <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-end gap-3">
        <div className="w-64">
          <Input 
            placeholder="Search employees..." 
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            icon={<Search size={14} />}
            inputSize="sm"
          />
        </div>
        <div className="w-32">
          <Select
            options={[
              { label: 'Newest First', value: 'Newest' },
              { label: 'Oldest First', value: 'Oldest' },
              { label: 'Name (A-Z)', value: 'Name' }
            ]}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort Order"
            size="sm"
          />
        </div>
        <div className="w-40">
          <Select
            options={[
              { label: 'All Roles', value: 'All' },
              { label: 'Sales Executive', value: 'Sales Executive' },
              { label: 'Telecaller', value: 'Telecaller' }
            ]}
            value={filterRole}
            onChange={setFilterRole}
            placeholder="Filter Role"
            size="sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
            {activeList.length === 0 && inactiveList.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed">
                    <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No employees found</h3>
                    <p className="text-slate-500">Get started by adding a new employee to your team.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeList.map(employee => <EmployeeCard key={employee.id} employee={employee} />)}
                </div>
            )}

            {inactiveList.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center">
                        <Trash2 className="w-5 h-5 mr-2 text-slate-400" />
                        Deactivated / Removed Employees
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
                        {inactiveList.map(employee => <EmployeeCard key={employee.id} employee={employee} />)}
                    </div>
                </div>
            )}
        </>
      )}

      <Alert 
        isOpen={alertState.isOpen} 
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
      />

      <AlertModal
        isOpen={alertModalState.isOpen}
        onClose={() => setAlertModalState(prev => ({ ...prev, isOpen: false, employeeId: null, isLoading: false, isSuccess: false }))}
        onConfirm={confirmDelete}
        title={alertModalState.title}
        message={alertModalState.message}
        type={alertModalState.type}
        isLoading={alertModalState.isLoading}
        isSuccess={alertModalState.isSuccess}
      />

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Personal Information */}
                <div className="space-y-5">
                    <div className="border-b pb-2 mb-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Personal Information</h3>
                    </div>
                    
                    <Input 
                        label="Full Name" 
                        name="name" 
                        required 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        icon={<User size={18} className="text-slate-400" />} 
                    />
                    <Input 
                        label="Email" 
                        name="email" 
                        type="email" 
                        required 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        error={emailError || undefined} 
                        icon={<Mail size={18} className="text-slate-400" />} 
                    />
                    <Input 
                        label="Mobile Number" 
                        name="mobile" 
                        required 
                        value={formData.mobile} 
                        onChange={handleInputChange} 
                        icon={<Phone size={18} className="text-slate-400" />} 
                    />
                    
                    {/* Role Selection */}
                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Role</label>
                        <Select 
                            options={[
                                { label: 'Sales Executive', value: 'SALES_EXECUTIVE' },
                                { label: 'Telecaller', value: 'TELECALLER' },
                                { label: 'Admin', value: 'ADMIN' },
                                { label: 'Custom Role', value: 'OTHER' }
                            ]}
                            value={isCustomRole ? 'OTHER' : formData.role}
                            onChange={(val) => {
                                if (val === 'OTHER') {
                                    setIsCustomRole(true);
                                    setFormData(prev => ({ ...prev, role: '' }));
                                } else {
                                    setIsCustomRole(false);
                                    setFormData(prev => ({ ...prev, role: val }));
                                }
                            }}
                            placeholder="Select Role"
                        />
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

                    {/* Login Access */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                        <div className="flex items-center space-x-3 mb-3">
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
                                <label htmlFor="enableLogin" className="text-sm font-medium cursor-pointer text-slate-900">Enable Login Access</label>
                                <span className="text-xs text-slate-500">Required for dashboard access</span>
                            </div>
                        </div>

                        {enableLogin && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <Input 
                                    label="Password" 
                                    name="password" 
                                    type="password" 
                                    required={enableLogin} 
                                    value={formData.password} 
                                    onChange={handleInputChange} 
                                    placeholder="Create a strong password" 
                                    icon={<Lock size={18} className="text-slate-400" />} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Professional & Work Details */}
                <div className="space-y-5">
                    <div className="border-b pb-2 mb-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Work Details</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Designation" 
                            name="designation" 
                            value={formData.designation} 
                            onChange={handleInputChange} 
                            icon={<Briefcase size={18} className="text-slate-400" />} 
                        />
                        <Input 
                            label="Department" 
                            name="department" 
                            value={formData.department} 
                            onChange={handleInputChange} 
                            icon={<Building2 size={18} className="text-slate-400" />} 
                        />
                    </div>
                    
                    <Input 
                        label="Joining Date" 
                        name="joiningDate" 
                        type="date" 
                        value={formData.joiningDate} 
                        onChange={handleInputChange} 
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Basic Salary" 
                            name="basicSalary" 
                            type="number" 
                            value={formData.basicSalary} 
                            onChange={handleInputChange} 
                        />
                        <Input 
                            label="Leaves (Yearly)" 
                            name="leavesAllotted" 
                            type="number" 
                            value={formData.leavesAllotted} 
                            onChange={handleInputChange} 
                        />
                    </div>

                    {/* Working Rules */}
                    <div className="pt-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Shift & Attendance Rules</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="Shift Start" 
                                name="shiftStartTime" 
                                type="time" 
                                value={formData.shiftStartTime} 
                                onChange={handleInputChange} 
                            />
                            <Input 
                                label="Work Hours" 
                                name="workingHours" 
                                type="number" 
                                step="0.5" 
                                value={formData.workingHours} 
                                onChange={handleInputChange} 
                            />
                            <div className="col-span-2">
                                <Input 
                                    label="Late Deduction (₹/hr)" 
                                    name="lateMarkDeduction" 
                                    type="number" 
                                    value={formData.lateMarkDeduction} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bank Details - Full Width */}
            <div className="border-t pt-6 mt-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Bank Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input 
                        label="Account Number" 
                        name="accountNumber" 
                        value={formData.accountNumber} 
                        onChange={handleInputChange} 
                    />
                    <Input 
                        label="Bank Name" 
                        name="bankName" 
                        value={formData.bankName} 
                        onChange={handleInputChange} 
                    />
                    <Input 
                        label="IFSC Code" 
                        name="ifscCode" 
                        value={formData.ifscCode} 
                        onChange={handleInputChange} 
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-lg">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Employee
                </Button>
            </div>
        </form>
      </Modal>

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        employee={selectedEmployee}
        onSuccess={() => {
          setIsOnboardingOpen(false);
          fetchEmployees();
          showAlert('success', 'Onboarding Complete', 'Employee profile has been successfully updated.');
        }}
      />
    </div>
  );
}
