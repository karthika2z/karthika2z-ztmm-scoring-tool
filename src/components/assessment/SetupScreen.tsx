import React, { useState } from 'react';
import { useAssessment } from '../../contexts/AssessmentContext';
import { Input, TextArea } from '../common/Input';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';
import { validateCustomerName, validateCloudProviders } from '../../utils/validation';
import type { CloudProvider } from '../../types';

interface ValidationErrors {
  customerName?: string;
  cloudProviders?: string;
}

export function SetupScreen() {
  const { state, dispatch } = useAssessment();
  const { metadata } = state.assessment;

  const [customerName, setCustomerName] = useState(metadata.customerName || '');
  const [industry, setIndustry] = useState(metadata.industry || '');
  const [assessmentDate, setAssessmentDate] = useState(metadata.assessmentDate || '');
  const [salesEngineer, setSalesEngineer] = useState(metadata.salesEngineer || '');
  const [additionalNotes, setAdditionalNotes] = useState(metadata.additionalNotes || '');
  const [selectedProviders, setSelectedProviders] = useState<CloudProvider[]>(metadata.cloudProviders || []);

  // Form validation state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Update form when metadata changes (e.g., after loading a file)
  React.useEffect(() => {
    setCustomerName(metadata.customerName || '');
    setIndustry(metadata.industry || '');
    setAssessmentDate(metadata.assessmentDate || '');
    setSalesEngineer(metadata.salesEngineer || '');
    setAdditionalNotes(metadata.additionalNotes || '');
    setSelectedProviders(metadata.cloudProviders || []);
  }, [metadata]);

  const validateField = (field: string, value?: any) => {
    const newErrors = { ...errors };

    if (field === 'customerName') {
      const error = validateCustomerName(value !== undefined ? value : customerName);
      if (error) {
        newErrors.customerName = error;
      } else {
        delete newErrors.customerName;
      }
    }

    if (field === 'cloudProviders') {
      const error = validateCloudProviders(value !== undefined ? value : selectedProviders);
      if (error) {
        newErrors.cloudProviders = error;
      } else {
        delete newErrors.cloudProviders;
      }
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
    validateField(field);
  };

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value);

    // Validate in real-time if field has been touched
    if (touched.has('customerName')) {
      validateField('customerName', e.target.value);
    }
  };

  const handleProviderToggle = (provider: CloudProvider) => {
    const newProviders = selectedProviders.includes(provider)
      ? selectedProviders.filter(p => p !== provider)
      : [...selectedProviders, provider];
    setSelectedProviders(newProviders);

    // Mark as touched and validate
    setTouched(prev => new Set(prev).add('cloudProviders'));
    setTimeout(() => validateField('cloudProviders', newProviders), 0);
  };

  const handleSave = () => {
    // Mark all fields as touched
    setTouched(new Set(['customerName', 'cloudProviders']));

    // Validate all fields
    const nameError = validateCustomerName(customerName);
    const providersError = validateCloudProviders(selectedProviders);

    if (nameError || providersError) {
      setErrors({
        customerName: nameError,
        cloudProviders: providersError
      });
      return;
    }

    // First update metadata with cloud providers
    dispatch({
      type: 'UPDATE_METADATA',
      payload: {
        customerName,
        industry: industry || undefined,
        assessmentDate,
        salesEngineer: salesEngineer || undefined,
        additionalNotes: additionalNotes || undefined,
        cloudProviders: selectedProviders,
      },
    });

    // Navigate to first pillar
    dispatch({
      type: 'NAVIGATE',
      payload: {
        currentPillar: 'networks',
        currentDimension: 'segmentationStrategy',
        currentCloud: selectedProviders[0],
      },
    });
  };

  const isValid = customerName.trim() !== '' && selectedProviders.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
          Zero Trust Maturity Assessment
        </h1>
        <p className="text-gray-600">
          Let's start by gathering some basic information about the customer and their cloud environment.
        </p>
      </div>

      <Card className="p-8">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-6">
          Customer Information
        </h2>

        <div className="space-y-4">
          <Input
            label="Customer Name"
            value={customerName}
            onChange={handleCustomerNameChange}
            onBlur={() => handleBlur('customerName')}
            error={touched.has('customerName') ? errors.customerName : undefined}
            success={touched.has('customerName') && !errors.customerName && customerName.length > 0}
            placeholder="Enter customer name"
            required
          />

          <Input
            label="Industry/Sector"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g., Financial Services, Healthcare, Technology"
          />

          <Input
            label="Assessment Date"
            type="date"
            value={assessmentDate}
            onChange={(e) => setAssessmentDate(e.target.value)}
            required
          />

          <Input
            label="Sales Engineer Name"
            value={salesEngineer}
            onChange={(e) => setSalesEngineer(e.target.value)}
            placeholder="Your name"
          />
        </div>
      </Card>

      <Card className="p-8">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
          Cloud Providers in Use
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Select all cloud providers the customer is currently using. This will determine which environments we assess for the Networks pillar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {(['AWS', 'Azure', 'GCP', 'OCI', 'Other'] as CloudProvider[]).map((provider) => (
            <button
              key={provider}
              onClick={() => handleProviderToggle(provider)}
              type="button"
              className={cn(
                'p-4 rounded-lg border-2 transition-all duration-200',
                selectedProviders.includes(provider)
                  ? 'border-aviatrix-orange bg-orange-50 scale-[1.02]'
                  : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'w-6 h-6 rounded border-2 flex items-center justify-center transition-all',
                  selectedProviders.includes(provider)
                    ? 'border-aviatrix-orange bg-aviatrix-orange'
                    : 'border-gray-300'
                )}>
                  {selectedProviders.includes(provider) && (
                    <span className="text-white text-sm animate-scale-in">✓</span>
                  )}
                </div>
                <span className="font-medium text-gray-900">{provider}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Validation feedback */}
        {touched.has('cloudProviders') && errors.cloudProviders && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {errors.cloudProviders}
          </p>
        )}

        {selectedProviders.length > 0 && !errors.cloudProviders && (
          <p className="mt-3 text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            The Networks pillar will be assessed separately for each selected provider.
          </p>
        )}
      </Card>

      <Card className="p-8">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
          Additional Context
        </h2>

        <TextArea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Add any relevant context about the customer's environment, business drivers, or assessment goals..."
          rows={4}
        />
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isValid}
          variant="primary"
        >
          Begin Assessment →
        </Button>
      </div>

      {!isValid && (
        <p className="text-sm text-gray-500 text-right">
          * Customer name and at least one cloud provider required
        </p>
      )}
    </div>
  );
}
