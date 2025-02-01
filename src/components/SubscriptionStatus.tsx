import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

interface SubscriptionStatusProps {
  status: 'expired' | 'inactive';
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ status }) => {
  const navigate = useNavigate();

  return (
    <Alert variant="destructive" className="mb-4 mx-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {status === 'expired' 
            ? 'Your premium subscription has expired. Renew now to continue accessing buy signals.'
            : 'Subscribe to premium to access buy signals and advanced features.'}
        </span>
        <button
          onClick={() => navigate('/payment?plan=premium')}
          className="ml-4 px-4 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
        >
          {status === 'expired' ? 'Renew Now' : 'Upgrade'}
        </button>
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionStatus;