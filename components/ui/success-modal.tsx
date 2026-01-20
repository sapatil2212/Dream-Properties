import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button, Modal } from '@/components/UIComponents';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Thank You!", 
  message = "We have received your inquiry. Our property consultant will get back to you shortly." 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="max-w-md relative"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
      >
        <X size={20} />
      </button>
      <div className="flex flex-col items-center text-center pt-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6">
          {message}
        </p>
        <Button 
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};
