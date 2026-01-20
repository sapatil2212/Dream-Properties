import React from 'react';
import { AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { Button, Modal } from '@/components/UIComponents';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  type?: 'error' | 'warning' | 'info';
}

export const AlertModal: React.FC<AlertModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Alert", 
  message = "Something went wrong.",
  isLoading = false,
  isSuccess = false,
  type = 'error'
}) => {
  const isDeleteMode = !!onConfirm && !isSuccess;

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : () => {}}
      title=""
      className="max-w-md relative"
    >
      <div className="flex flex-col items-center text-center pt-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          isSuccess ? 'bg-emerald-50 text-emerald-600' : 
          type === 'warning' ? 'bg-amber-50 text-amber-600' :
          'bg-rose-50 text-rose-600'
        }`}>
          {isSuccess ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
        </div>
        
        <h3 className="text-xl font-black text-slate-900 mb-2">{isSuccess ? "Success" : title}</h3>
        <p className="text-slate-500 mb-6">
          {isSuccess ? "The item has been successfully deleted." : message}
        </p>
        
        <div className="flex gap-3 w-full">
            {isDeleteMode && (
                <Button 
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            )}
            
            <Button 
                onClick={isSuccess ? onClose : (onConfirm || onClose)}
                className={`flex-1 text-white py-3 rounded-xl flex items-center justify-center gap-2 ${
                  isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 
                  type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-rose-600 hover:bg-rose-700'
                }`}
                disabled={isLoading && !isSuccess}
            >
                {isSuccess ? (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        <span>Delete successfully</span>
                    </div>
                ) : isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    onConfirm ? 'Delete' : 'OK'
                )}
            </Button>
        </div>
      </div>
    </Modal>
  );
};
