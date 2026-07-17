import React, { useState } from 'react';
import { Save, Check, ShieldAlert, Coins } from 'lucide-react';
import { BusinessSettings } from '../types';

interface BusinessSettingsFormProps {
  settings: BusinessSettings;
  onSave: (settings: BusinessSettings) => void;
}

export default function BusinessSettingsForm({ settings, onSave }: BusinessSettingsFormProps) {
  // Local states
  const [name, setName] = useState(settings.sender.name);
  const [email, setEmail] = useState(settings.sender.email);
  const [phone, setPhone] = useState(settings.sender.phone);
  const [address, setAddress] = useState(settings.sender.address);
  const [taxId, setTaxId] = useState(settings.sender.taxId);
  
  const [currency, setCurrency] = useState(settings.currency);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [terms, setTerms] = useState(settings.terms);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedSettings: BusinessSettings = {
      sender: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        taxId: taxId.trim(),
      },
      currency,
      taxRate: Number(taxRate),
      terms: terms.trim(),
    };

    onSave(updatedSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto overflow-hidden animate-fade-in" id="settings-panel">
      {/* Banner */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/40 flex items-center justify-between" id="settings-header">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Company Billing Profile</h3>
          <p className="text-xs text-slate-500 mt-1">Configure default values to automatically fill all new invoices you create.</p>
        </div>
        
        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1 animate-pulse">
            <Check className="w-3.5 h-3.5" />
            <span>Profile Saved!</span>
          </span>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6" id="settings-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="settings-form-sections">
          
          {/* Section 1: Contact Details */}
          <div className="space-y-4" id="settings-identity">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">Identity & Branding</h4>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company / Freelancer Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                placeholder="My Business LLC"
                required
                id="settings-sender-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  placeholder="billing@myco.com"
                  id="settings-sender-email"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  placeholder="+1 (555) 019-2834"
                  id="settings-sender-phone"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Business Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 resize-none bg-white"
                placeholder="123 Corporate Blvd, Suite 100&#10;San Francisco, CA 94107"
                id="settings-sender-address"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tax ID / VAT Registration</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                placeholder="VAT registration or Business Tax ID"
                id="settings-sender-taxid"
              />
            </div>
          </div>

          {/* Section 2: Standard Preferences */}
          <div className="space-y-4" id="settings-preferences">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">Standard Defaults</h4>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Default Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                id="settings-currency"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound Sterling</option>
                <option value="CAD">CAD (C$) - Canadian Dollar</option>
                <option value="AUD">AUD (A$) - Australian Dollar</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                placeholder="e.g. 15 for 15%"
                id="settings-taxrate"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Default Payment Terms</label>
              <input
                type="text"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                placeholder="e.g. Net 30, Due on Receipt"
                id="settings-terms"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start gap-2.5">
              <Coins className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Standard defaults automatically populate newly drafted invoices. You can still modify these fields on a case-by-case basis inside individual invoice forms.
              </p>
            </div>
          </div>
        </div>

        {/* Form Footer Action */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3 bg-white" id="settings-footer">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center gap-2 transition-all duration-150 cursor-pointer border border-blue-700/50 active:scale-98"
            id="save-settings-btn"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
