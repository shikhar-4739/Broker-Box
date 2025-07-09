"use client";
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from "sonner"
import { useDebounce } from 'use-debounce';
import { searchCompanies } from '@/lib/api';

interface CompanyItem {
  title: string;
}

interface AddDealFormProps {
  isOpen: boolean;
  onClose: () => void;
  onDealAdded?: () => void;
}

const AddDealForm: React.FC<AddDealFormProps> = ({ isOpen, onClose, onDealAdded }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    businessTornOver: '',
    email: '',
    phone: '', 
    loanAmount: '',
    loanType: 'Loans',
    lender: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [debouncedCompanyName] = useDebounce(formData.companyName, 500);


  const purpose = [
    'Cash Flow Boost',
    'New Equipment',
    'Expansion',
    'Refinance',
    'Other'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.businessTornOver.trim()) {
      newErrors.businessTornOver = 'Business turnover is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    

    if (!formData.loanAmount.trim()) {
      newErrors.loanAmount = 'Loan amount is required';
    } else if (isNaN(Number(formData.loanAmount)) || Number(formData.loanAmount) <= 0) {
      newErrors.loanAmount = 'Please enter a valid loan amount';
    }

    if (!formData.lender) {
      newErrors.lender = 'Purpose is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    
    if (!validateForm()) {
      console.log("Validation failed", errors);
      return;
    }

    setIsSubmitting(true);

    const dealData = {
      ...formData,
      loanAmount: Number(formData.loanAmount),
      id: Date.now(),
      status: 'Pending',
      submittedDate: new Date().toISOString()
    };
    
    try {
      const existingDeals = JSON.parse(localStorage.getItem('brokerBoxDeals') || '[]');
      
      const updatedDeals = [...existingDeals, dealData];
      
      localStorage.setItem('brokerBoxDeals', JSON.stringify(updatedDeals));
      
      if (onDealAdded) {
        onDealAdded();
      }
      toast("Deal successfully saved to localStorage!");
    } catch (error) {
        console.error("Error saving deal to localStorage", error);
        toast("Error saving deal to localStorage. Please try again.");
    }
    
    setFormData({
      companyName: '',
      businessTornOver: '',
      email: '', 
      phone: '', 
      loanAmount: '',
      loanType: 'Loans',
      lender: '',
      notes: ''
    });
    
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Show suggestions only when typing in company name
    if (field === 'companyName') {
      setShowSuggestions(value.trim().length >= 3);
    }
  };
  
  const handleSelectCompany = (companyName: string) => {
    setFormData(prev => ({ ...prev, companyName }));
    setShowSuggestions(false);
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!debouncedCompanyName.trim() || debouncedCompanyName.length < 3) {
        setCompanySuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      setShowSuggestions(true);

      try {
        const data = await searchCompanies(debouncedCompanyName);
        
        if (data && data.items && Array.isArray(data.items)) {
          const names = data.items.map((item: CompanyItem) => item.title).filter(Boolean);
          setCompanySuggestions(names);
          console.log("Fetched company suggestions:", names);
          
          if (names.length === 0) {
            console.log("No company suggestions found for query:", debouncedCompanyName);
          }
        } else {
          console.warn("Unexpected API response format:", data);
          setCompanySuggestions([]);
          
          if (data && data.error) {
            console.error("API error:", data.error);
            if (!data.items) {
              toast("Unable to fetch company data. Using company name as entered.");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching suggestions", err);
        toast("Error fetching company suggestions. Please try typing the company name manually.");
        setCompanySuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchCompanies();
  }, [debouncedCompanyName]);
  

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-transparent backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Add New Deal</h2>
              <p className="text-gray-600 mt-1">Submit a new funding deal to our platform</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6"> 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name * <span className="text-xs text-blue-600 ml-1">(Type to search Companies House)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      onFocus={() => setShowSuggestions(formData.companyName.length >= 3)}
                      onBlur={() => {
                        // Delay hiding suggestions to allow clicking on them
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      className={`w-full px-4 py-3 border rounded-xl text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter company name"
                    />
                    {isLoadingSuggestions && (
                      <div className="absolute right-3 top-3">
                        <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Company suggestions dropdown */}
                  {showSuggestions && companySuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      <ul>
                        {companySuggestions.map((company, index) => (
                          <li 
                            key={index}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150 text-gray-800"
                            onClick={() => handleSelectCompany(company)}
                          >
                            {company}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                  
                  {showSuggestions && !isLoadingSuggestions && companySuggestions.length === 0 && formData.companyName.length >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4"
                    >
                      <p className="text-gray-500 text-sm">No companies found with that name</p>
                    </motion.div>
                  )}
                  
                  {errors.companyName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.companyName}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Turnover (£) *
                  </label>
                  <input
                    type="number"
                    value={formData.businessTornOver}
                    onChange={(e) => handleInputChange('businessTornOver', e.target.value)}
                    className={`w-full px-4 py-3 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.businessTornOver ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter amount"
                    min="1"
                  />
                  {errors.businessTornOver && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.businessTornOver}
                    </motion.p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="+44 20 1234 5678"
                  />
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </div>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount (£) *
                  </label>
                  <input
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    className={`w-full px-4 py-3 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.loanAmount ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="250000"
                    min="1"
                  />
                  {errors.loanAmount && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.loanAmount}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Type
                  </label>
                  <input
                    type="text"
                    value="Loans"
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose *
                  </label>
                  <select
                    value={formData.lender}
                    onChange={(e) => handleInputChange('lender', e.target.value)}
                    className={`w-full px-4 py-3 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.lender ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="">Select Purpose</option>
                    {purpose.map((lender) => (
                      <option key={lender} value={lender}>
                        {lender}
                      </option>
                    ))}
                  </select>
                  {errors.lender && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.lender}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Notes section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Any additional information, special requirements, or comments about this deal..."
                />
              </div>
            
            <div className="flex gap-4 pt-6">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Submit Deal
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddDealForm;

