import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { PaymentDetails, PaymentState } from '../types';
import { paymentService } from '../services/payment';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';

export function usePayment() {
  const { address } = useAccount();
  const [paymentState, setPaymentState] = useState<PaymentState>({ 
    status: 'idle' 
  });
  
  const { updateSubscriptionStatus } = useAuthStore();

  const processPayment = useCallback(async (details: PaymentDetails) => {
    if (!address) {
      setPaymentState({ 
        status: 'error', 
        error: 'Please connect your wallet first' 
      });
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setPaymentState({ 
        status: 'loading' 
      });

      // Create payment session
      const { sessionId, url } = await paymentService.createPaymentSession({
        ...details,
        walletAddress: address
      });

      setPaymentState(prev => ({
        ...prev,
        sessionId
      }));

      // Open 3oomFi payment modal
      const popup = window.open(url, '3oomFi Payment', 'width=500,height=800');

      // Monitor for payment completion
      const checkPayment = setInterval(async () => {
        try {
          const transaction = await paymentService.verifyPayment(sessionId);
          if (transaction) {
            clearInterval(checkPayment);
            if (popup) popup.close();

            // Create subscription after successful payment
            const { status } = await paymentService.createSubscription(sessionId);
            
            // Update subscription status in store
            updateSubscriptionStatus(status);
            
            setPaymentState({ status: 'success' });
            toast.success('Payment successful! Welcome to Premium!');
          }
        } catch (error) {
          // Ignore verification errors while waiting
          console.log('Verification check:', error);
        }
      }, 2000);

      // Set timeout for payment window (5 minutes)
      setTimeout(() => {
        clearInterval(checkPayment);
        if (paymentState.status === 'loading') {
          setPaymentState({
            status: 'error',
            error: 'Payment session expired. Please try again.'
          });
          toast.error('Payment session expired. Please try again.');
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentState({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Payment failed. Please try again.' 
      });
      toast.error('Payment failed. Please try again.');
    }
  }, [address, updateSubscriptionStatus]);

  const resetPaymentState = useCallback(() => {
    setPaymentState({ status: 'idle' });
  }, []);

  return {
    processPayment,
    paymentState,
    resetPaymentState
  };
}