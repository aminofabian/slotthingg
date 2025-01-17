'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaBitcoin, FaEthereum, FaMoneyBillWave } from 'react-icons/fa';
import { SiLitecoin } from 'react-icons/si';
import { BsCashStack, BsShieldCheck, BsArrowRight, BsInfoCircle, BsExclamationTriangle, BsArrowLeft, BsCheckLg } from 'react-icons/bs';
import Image from 'next/image';

interface CashoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

const paymentMethods = [
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    icon: FaBitcoin, 
    color: 'text-[#f7931a]',
    image: '/crypto/bitcoin.png',
    description: 'Fast & secure cryptocurrency payments'
  },
  { 
    id: 'ach', 
    name: 'ACH Transfer', 
    icon: BsCashStack, 
    color: 'text-green-500',
    image: '/crypto/bank.png',
    description: 'Direct bank transfer (US only)'
  },
  { 
    id: 'litecoin', 
    name: 'Litecoin', 
    icon: SiLitecoin, 
    color: 'text-[#345d9d]',
    image: '/crypto/litecoin.png',
    description: 'Lower fees, faster transactions'
  },
];

export default function CashoutModal({ isOpen, onClose, currentBalance }: CashoutModalProps) {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [publicKey, setPublicKey] = useState('');

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Handle cashout submission
    console.log({ selectedMethod, amount, publicKey });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl 
                bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 shadow-xl 
                transition-all border border-[#00ffff]/20">
                {/* Header with glowing effect */}
                <div className="relative mb-8">
                  <div className="absolute -top-6 -left-6 -right-6 h-24 bg-[#00ffff]/5 blur-2xl" />
                  <Dialog.Title className="relative flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Cashout</h2>
                      <p className="text-[#00ffff]/60 text-sm mt-1">Request your withdrawal</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-[#00ffff]/60 hover:text-[#00ffff] transition-colors p-2
                        hover:bg-[#00ffff]/10 rounded-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Dialog.Title>
                </div>

                {/* Steps indicator with animations */}
                <div className="flex justify-between mb-8 relative">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-700 -translate-y-1/2" />
                  <div className="absolute top-1/2 left-0 h-0.5 bg-[#00ffff] -translate-y-1/2 transition-all duration-500"
                    style={{ width: `${((step - 1) / 2) * 100}%` }} />
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="relative z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                        transition-all duration-300 ${
                        step >= num 
                          ? 'bg-[#00ffff] text-black ring-4 ring-[#00ffff]/20' 
                          : 'bg-gray-700 text-gray-300'
                        }`}>
                        {num}
                      </div>
                      <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                        step >= num ? 'text-[#00ffff]' : 'text-gray-500'
                      }`}>
                        {num === 1 ? 'Method' : num === 2 ? 'Details' : 'Confirm'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Balance Display */}
                <div className="bg-gradient-to-r from-[#00ffff]/10 to-transparent p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#00ffff]/70 text-sm">Available Balance</p>
                      <p className="text-2xl font-bold text-white">${currentBalance.toFixed(2)}</p>
                    </div>
                    <FaMoneyBillWave className="text-4xl text-[#00ffff]/40" />
                  </div>
                </div>

                {/* Step Content */}
                <div className="min-h-[300px]">
                  {/* Step 1: Payment Method Selection */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="grid gap-3">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`flex items-center gap-4 p-4 rounded-lg border 
                              transition-all duration-300 group ${
                              selectedMethod === method.id
                                ? 'border-[#00ffff] bg-[#00ffff]/10'
                                : 'border-gray-700 hover:border-[#00ffff]/50'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                              ${selectedMethod === method.id ? 'bg-[#00ffff]/20' : 'bg-black/40'}`}>
                              <method.icon className={`text-2xl ${method.color}`} />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-white font-medium group-hover:text-[#00ffff] transition-colors">
                                {method.name}
                              </p>
                              <p className="text-gray-400 text-sm">{method.description}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                              transition-all duration-300 ${
                              selectedMethod === method.id 
                                ? 'border-[#00ffff] bg-[#00ffff]' 
                                : 'border-gray-600'
                              }`}
                            >
                              {selectedMethod === method.id && (
                                <BsCheckLg className="text-black text-sm" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Amount and Key */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-white mb-2 font-medium">Amount in USD</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff]">$</span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-black/40 border border-[#00ffff]/20 rounded-lg px-4 py-3
                              text-white placeholder-gray-400 focus:outline-none focus:border-[#00ffff]
                              pl-8 text-lg"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[#00ffff]/60 text-sm">
                          <BsShieldCheck className="text-lg" />
                          <span>Min $50 - Max $600 - Every 24 hours</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-white mb-2 font-medium">Public Key (BTC)</label>
                        <input
                          type="text"
                          value={publicKey}
                          onChange={(e) => setPublicKey(e.target.value)}
                          placeholder="Enter your public key"
                          className="w-full bg-black/40 border border-[#00ffff]/20 rounded-lg px-4 py-3
                            text-white placeholder-gray-400 focus:outline-none focus:border-[#00ffff]
                            font-mono text-sm"
                        />
                      </div>

                      <div className="bg-[#00ffff]/5 rounded-lg p-4">
                        <p className="text-[#00ffff]/80 text-sm flex items-center gap-2">
                          <BsInfoCircle className="text-lg" />
                          Cashouts use the same currency as your purchase and are limited to once every 24 hours.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirmation */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-[#00ffff]/10 to-transparent rounded-lg p-6 border border-[#00ffff]/20">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                          <BsShieldCheck className="text-[#00ffff] text-xl" />
                          Confirm Your Cashout
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-[#00ffff]/10">
                            <span className="text-gray-400">Amount</span>
                            <span className="text-white font-medium">${amount}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-[#00ffff]/10">
                            <span className="text-gray-400">Method</span>
                            <div className="flex items-center gap-2">
                              {paymentMethods.find(m => m.id === selectedMethod)?.icon({ 
                                className: `text-lg ${paymentMethods.find(m => m.id === selectedMethod)?.color}` 
                              })}
                              <span className="text-white font-medium">
                                {paymentMethods.find(m => m.id === selectedMethod)?.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400">Public Key</span>
                            <span className="text-white font-mono text-sm truncate max-w-[200px]">
                              {publicKey}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                        <p className="text-yellow-500/80 text-sm flex items-center gap-2">
                          <BsExclamationTriangle className="text-lg flex-shrink-0" />
                          Please verify all details carefully. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-[#00ffff]/10">
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 text-[#00ffff]/70 hover:text-[#00ffff] 
                        font-medium rounded-lg transition-colors duration-300
                        hover:bg-[#00ffff]/10 flex items-center gap-2"
                    >
                      <BsArrowLeft className="text-lg" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={step === 3 ? handleSubmit : handleNext}
                    disabled={
                      (step === 1 && !selectedMethod) ||
                      (step === 2 && (!amount || !publicKey))
                    }
                    className="px-6 py-2 bg-[#00ffff] text-[#003333] font-bold 
                      rounded-lg transition-all duration-300 flex items-center gap-2
                      hover:bg-[#7ffdfd] shadow-lg hover:shadow-[#00ffff]/20
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {step === 3 ? (
                      <>
                        Confirm Cashout
                        <BsShieldCheck className="text-lg" />
                      </>
                    ) : (
                      <>
                        Next
                        <BsArrowRight className="text-lg" />
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 