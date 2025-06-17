import React from 'react';
import { Building, Globe, Users, Briefcase } from 'lucide-react';

interface OrganizationData {
  organizationName: string;
  organizationType: string;
  organizationIndustry: string;
  organizationSize: string;
  userRoleInOrg: string;
  organizationWebsite: string;
  organizationDescription: string;
}

interface OrganizationDetailsFormProps {
  data: OrganizationData;
  onChange: (updates: Partial<OrganizationData>) => void;
}

const OrganizationDetailsForm: React.FC<OrganizationDetailsFormProps> = ({ data, onChange }) => {
  const organizationTypes = [
    { value: 'startup', label: 'Startup' },
    { value: 'sme', label: 'Small/Medium Enterprise' },
    { value: 'enterprise', label: 'Large Enterprise' },
    { value: 'non-profit', label: 'Non-Profit' },
    { value: 'government', label: 'Government' },
    { value: 'other', label: 'Other' }
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Marketing',
    'Real Estate',
    'Construction',
    'Transportation',
    'Entertainment',
    'Food & Beverage',
    'Energy',
    'Agriculture',
    'Other'
  ];

  const companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];

  return (
    <div className="space-y-6">
      {/* Organization Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Organization Name *
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            required
            value={data.organizationName}
            onChange={(e) => onChange({ organizationName: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
            placeholder="Enter your organization name"
          />
        </div>
      </div>

      {/* Organization Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Organization Type *
        </label>
        <select
          required
          value={data.organizationType}
          onChange={(e) => onChange({ organizationType: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
        >
          <option value="">Select organization type</option>
          {organizationTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Industry *
        </label>
        <select
          required
          value={data.organizationIndustry}
          onChange={(e) => onChange({ organizationIndustry: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
        >
          <option value="">Select industry</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      {/* Organization Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Organization Size *
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            required
            value={data.organizationSize}
            onChange={(e) => onChange({ organizationSize: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
          >
            <option value="">Select organization size</option>
            {companySizes.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* User Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Role in Organization *
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            required
            value={data.userRoleInOrg}
            onChange={(e) => onChange({ userRoleInOrg: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
            placeholder="e.g., CEO, Manager, Developer, etc."
          />
        </div>
      </div>

      {/* Website (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Organization Website <span className="text-gray-500">(Optional)</span>
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="url"
            value={data.organizationWebsite}
            onChange={(e) => onChange({ organizationWebsite: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
            placeholder="https://www.example.com"
          />
        </div>
      </div>

      {/* Description (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Organization Description <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          value={data.organizationDescription}
          onChange={(e) => onChange({ organizationDescription: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 resize-none"
          rows={3}
          placeholder="Brief description of your organization"
        />
      </div>
    </div>
  );
};

export default OrganizationDetailsForm;