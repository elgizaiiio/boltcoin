import React, { useEffect } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { Zap, CheckCircle, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast';
    import { useTranslation } from 'react-i18next';

    const AcceptReferralPage = () => {
      const location = useLocation();
      const navigate = useNavigate();
      const { toast } = useToast();
      const { t } = useTranslation();
      const [status, setStatus] = React.useState('processing'); 
      const [refId, setRefId] = React.useState(null);

      useEffect(() => {
        const params = new URLSearchParams(location.search);
        const referralId = params.get('ref');
        setRefId(referralId);

        if (referralId) {
          console.log(`Processing referral ID: ${referralId}`);
          setStatus('processing');
          
          setTimeout(() => {
            setStatus('success');
            toast({
              title: t('acceptReferralPage.successToast.title'),
              description: t('acceptReferralPage.successToast.description', { referralId }),
            });
            window.location.href = 'http://t.me/boltelbot/Bolt'; 
          }, 3000); 

        } else {
          setStatus('error');
          toast({
            title: t('acceptReferralPage.errorToast.title'),
            description: t('acceptReferralPage.errorToast.description'),
            variant: "destructive",
          });
          setTimeout(() => {
            navigate('/mining'); 
          }, 3000);
        }
      }, [location, navigate, toast, t]);

      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 sm:p-6 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="p-6 sm:p-8 rounded-xl shadow-2xl bg-black/40 backdrop-blur-md border border-purple-500/50 max-w-md w-full"
          >
            <Zap className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400 mx-auto mb-4 sm:mb-6 animate-pulse" />
            
            {status === 'processing' && (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-3 sm:mb-4">
                  {t('acceptReferralPage.processingTitle')}
                </h1>
                <p className="text-base sm:text-lg text-purple-300">
                  {t('acceptReferralPage.processingDescription')}
                </p>
                <div className="mt-5 sm:mt-6">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-yellow-400 mx-auto"></div>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-12 h-12 sm:w-16 sm:w-16 text-green-400 mx-auto mb-3 sm:mb-4" />
                <h1 className="text-2xl sm:text-3xl font-bold text-green-400 mb-3 sm:mb-4">
                  {t('acceptReferralPage.successTitle')}
                </h1>
                <p className="text-base sm:text-lg text-gray-300">
                  {t('acceptReferralPage.successDescription')}
                </p>
                 {refId && <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">{t('acceptReferralPage.referrerLabel')}: {refId}</p>}
              </>
            )}

            {status === 'error' && (
              <>
                <AlertTriangle className="w-12 h-12 sm:w-16 sm:w-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                <h1 className="text-2xl sm:text-3xl font-bold text-red-500 mb-3 sm:mb-4">
                  {t('acceptReferralPage.errorTitle')}
                </h1>
                <p className="text-base sm:text-lg text-gray-300">
                  {t('acceptReferralPage.errorDescription')}
                </p>
              </>
            )}
          </motion.div>
        </div>
      );
    };

    export default AcceptReferralPage;