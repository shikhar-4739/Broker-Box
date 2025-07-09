"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AddDealForm from '../../components/AddDealForm'


export interface Deal {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  loanAmount: number;
  loanType: string;
  status: string;
  submittedDate: string; 
  purpose: string;
  lender: string;
}
type SortField = keyof Deal;
type SortDirection = 'asc' | 'desc';

const DealsPage = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('submittedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedDeals, setSelectedDeals] = useState<number[]>([]);
  const [showAddDealForm, setShowAddDealForm] = useState(false);
  
  const loadDealsFromLocalStorage = useCallback(() => {
    try {
      const storedDeals = localStorage.getItem('brokerBoxDeals');
      if (storedDeals) {
        const parsedDeals = JSON.parse(storedDeals);
        if (Array.isArray(parsedDeals) && parsedDeals.length > 0) {
          setDeals(parsedDeals);
          console.log('Loaded deals from localStorage:', parsedDeals);
        }
      }
    } catch (error) {
      console.error('Error loading deals from localStorage:', error);
    }
  }, []);
  
  useEffect(() => {
    loadDealsFromLocalStorage();
  }, [loadDealsFromLocalStorage]);

  const filteredAndSortedDeals = useMemo(() => {
    const filtered = deals.filter(deal =>
      deal.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [deals, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleBulkDelete = () => {
    setDeals(deals.filter(deal => !selectedDeals.includes(deal.id)));
    setSelectedDeals([]);
  };

  const toggleSelectAll = () => {
    if (selectedDeals.length === filteredAndSortedDeals.length) {
      setSelectedDeals([]);
    } else {
      setSelectedDeals(filteredAndSortedDeals.map(deal => deal.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Under Review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const tableScrollRef = React.useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const handleTableScroll = () => {
    if (tableScrollRef.current) {
      setIsScrolled(tableScrollRef.current.scrollTop > 10);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 mt-12">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f1f5f9;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Deals Management
            </h1>
            <p className="text-gray-600">
              Manage and track all your submitted funding deals
            </p>
          </motion.div>
        
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col lg:flex-row items-center gap-4 mt-4 lg:mt-0"
          >
   
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>


            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddDealForm(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              + Add New Deal
            </motion.button>
          </motion.div>
        </div>

        {/* Bulk Delete Action (shown when items are selected) */}
        {selectedDeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-end mb-4"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected ({selectedDeals.length})
            </motion.button>
          </motion.div>
        )}
        
        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{deals.length}</div>
              <div className="text-sm text-blue-600">Total Deals</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">
                {deals.filter(d => d.status === 'Approved').length}
              </div>
              <div className="text-sm text-green-600">Approved</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {deals.filter(d => d.status === 'Pending').length}
              </div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(deals.reduce((sum, deal) => sum + deal.loanAmount, 0))}
              </div>
              <div className="text-sm text-purple-600">Total Value</div>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div 
            ref={tableScrollRef}
            onScroll={handleTableScroll}
            className={`overflow-x-auto overflow-y-auto custom-scrollbar ${filteredAndSortedDeals.length > 5 ? 'shadow-inner' : ''}`}
            style={{ 
              maxHeight: filteredAndSortedDeals.length > 5 ? '500px' : 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#3B82F6 #F1F5F9'
            }}>
            <table className="w-full">
              <thead className={`bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 transition-all duration-200 ${isScrolled ? 'shadow-md bg-opacity-95 backdrop-blur-sm' : 'shadow-sm'}`}>
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDeals.length === filteredAndSortedDeals.length && filteredAndSortedDeals.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {[
                    { key: 'companyName', label: 'Company' },
                    { key: 'contactPerson', label: 'Contact' },
                    { key: 'loanAmount', label: 'Amount' },
                    { key: 'loanType', label: 'Type' },
                    { key: 'status', label: 'Status' },
                    { key: 'submittedDate', label: 'Date' },
                    { key: 'purpose', label: 'Purpose' }
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort(column.key as SortField)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        <div className="flex flex-col">
                          <svg className={`w-3 h-3 ${sortField === column.key && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
                          </svg>
                          <svg className={`w-3 h-3 ${sortField === column.key && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredAndSortedDeals.map((deal, index) => (
                    <motion.tr
                      key={deal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedDeals.includes(deal.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDeals([...selectedDeals, deal.id]);
                            } else {
                              setSelectedDeals(selectedDeals.filter(id => id !== deal.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{deal.companyName}</div>
                        <div className="text-sm text-gray-500">{deal.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{deal.contactPerson}</div>
                        <div className="text-sm text-gray-500">{deal.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{formatCurrency(deal.loanAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{deal.loanType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deal.status)}`}>
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(deal.submittedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.lender}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredAndSortedDeals.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No deals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search term.' : 'Get started by adding your first deal.'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <AddDealForm
        isOpen={showAddDealForm}
        onClose={() => setShowAddDealForm(false)}
        onDealAdded={() => {
          loadDealsFromLocalStorage();
        }}
      />
    </div>
  )
}

export default DealsPage
