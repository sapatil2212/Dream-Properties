'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '@/components/UIComponents';
import { Loader2, Briefcase, Building2, Calendar, Wallet, Clock, AlertTriangle } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  address?: string;
  occupation?: string;
  experienceYears?: number;
  experienceMonths?: number;
  isFresher?: boolean;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSuccess: () => void;
}

export function OnboardingModal({ isOpen, onClose, employee, onSuccess }: OnboardingModalProps) {
  const [activeTab, setActiveTab] = useState<'employment' | 'financial' | 'rules'>('employment');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Employment
    status: 'Active',
    designation: '',
    department: '',
    joiningDate: new Date().toISOString().split('T')[0],
    
    // Financial
    basicSalary: '',
    leavesAllotted: '12',
    bankName: '',
    accountNumber: '',
    ifscCode: '',

    // Rules
    workingHours: '9',
    shiftStartTime: '09:00',
    lateMarkDeduction: '0'
  });

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        status: employee.status || 'Active',
        designation: employee.role || '', // Default designation to role
        department: '',
        joiningDate: new Date().toISOString().split('T')[0],
        basicSalary: '',
        leavesAllotted: '12',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        workingHours: '9',
        shiftStartTime: '09:00',
        lateMarkDeduction: '0'
      });
      setActiveTab('employment');
      setError(null);
    }
  }, [employee, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/employees/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: employee.id,
          ...formData,
          basicSalary: parseFloat(formData.basicSalary) || 0,
          leavesAllotted: parseInt(formData.leavesAllotted) || 12,
          workingHours: parseFloat(formData.workingHours) || 9,
          shiftStartTime: formData.shiftStartTime || '09:00',
          lateMarkDeduction: parseFloat(formData.lateMarkDeduction) || 0
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to onboard employee');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Onboard Employee: ${employee.name}`}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-500 -mt-2">Complete the profile details to activate employee access.</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
            {error}
          </div>
        )}

        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('employment')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'employment' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            type="button"
          >
            Employment
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'financial' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            type="button"
          >
            Financial
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'rules' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            type="button"
          >
            Rules & Deductions
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'employment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Employee Status</label>
                <Select
                  options={[
                    { label: 'Active', value: 'Active' },
                    { label: 'Disabled', value: 'Disabled' }
                  ]}
                  value={formData.status}
                  onChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                  placeholder="Select Status"
                />
              </div>

              <Input 
                label="Designation"
                name="designation" 
                value={formData.designation} 
                onChange={handleInputChange} 
                required 
                icon={<Briefcase size={18} className="text-slate-400" />}
              />

              <Input 
                label="Department"
                name="department" 
                value={formData.department} 
                onChange={handleInputChange} 
                required 
                icon={<Building2 size={18} className="text-slate-400" />}
              />

              <Input 
                label="Joining Date"
                type="date" 
                name="joiningDate" 
                value={formData.joiningDate} 
                onChange={handleInputChange} 
                required 
                icon={<Calendar size={18} className="text-slate-400" />}
              />

              <div className="col-span-full mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Employee Details (Read Only)
                </h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium text-slate-900 truncate max-w-[150px]">{employee.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span className="text-slate-500">Mobile</span>
                      <span className="font-medium text-slate-900">{employee.mobile}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span className="text-slate-500">Role</span>
                      <span className="font-medium text-slate-900">{employee.role}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span className="text-slate-500">Gender</span>
                      <span className="font-medium text-slate-900">{employee.gender || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 flex justify-between border-b border-slate-200/50 pb-1">
                      <span className="text-slate-500">Address</span>
                      <span className="font-medium text-slate-900 truncate max-w-[300px]">{employee.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <Input 
                label="Basic Salary (₹)"
                type="number" 
                name="basicSalary" 
                value={formData.basicSalary} 
                onChange={handleInputChange} 
                required 
                min={0}
                icon={<Wallet size={18} className="text-slate-400" />}
              />

              <Input 
                label="Yearly Leaves Allotted"
                type="number" 
                name="leavesAllotted" 
                value={formData.leavesAllotted} 
                onChange={handleInputChange} 
                required 
                min={0}
              />

              <Input 
                label="Bank Name"
                name="bankName" 
                value={formData.bankName} 
                onChange={handleInputChange} 
                required 
                icon={<Building2 size={18} className="text-slate-400" />}
              />

              <Input 
                label="Account Number"
                name="accountNumber" 
                value={formData.accountNumber} 
                onChange={handleInputChange} 
                required 
              />

              <Input 
                label="IFSC Code"
                name="ifscCode" 
                value={formData.ifscCode} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Input 
                        label="Working Hours (per day)"
                        type="number" 
                        name="workingHours" 
                        value={formData.workingHours} 
                        onChange={handleInputChange} 
                        required 
                        step={0.5}
                        min={0}
                        icon={<Clock size={18} className="text-slate-400" />}
                    />
                    <p className="text-[10px] text-slate-500 pl-1">Required hours per day (e.g., 9)</p>
                </div>

                <div className="space-y-1">
                    <Input 
                        label="Shift Start Time"
                        type="time" 
                        name="shiftStartTime" 
                        value={formData.shiftStartTime} 
                        onChange={handleInputChange} 
                        required 
                        icon={<Clock size={18} className="text-slate-400" />}
                    />
                    <p className="text-[10px] text-slate-500 pl-1">Official login time (e.g., 09:00 AM)</p>
                </div>

                <div className="space-y-1">
                    <Input 
                        label="Late Mark Deduction (₹ per hour)"
                        type="number" 
                        name="lateMarkDeduction" 
                        value={formData.lateMarkDeduction} 
                        onChange={handleInputChange} 
                        required 
                        min={0}
                        icon={<AlertTriangle size={18} className="text-slate-400" />}
                    />
                    <p className="text-[10px] text-slate-500 pl-1">Amount to deduct for every late hour</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    How it works
                </h4>
                <p className="text-xs leading-relaxed text-blue-800">
                  If an employee's shift starts at <strong>{formData.shiftStartTime}</strong> and working hours are <strong>{formData.workingHours} hours</strong>, 
                  and they log in late, the system will calculate the delay. 
                  For every hour of delay, <strong>₹{formData.lateMarkDeduction}</strong> will be deducted from their salary automatically.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            {activeTab !== 'rules' ? (
              <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setActiveTab(activeTab === 'employment' ? 'financial' : 'rules')}>
                Next Step
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Complete Onboarding
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
