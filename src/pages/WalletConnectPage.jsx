import React, { useEffect, useState } from 'react';
    import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
    import { motion } from 'framer-motion';
    import { Wallet, Link, Zap, LogOut, AlertTriangle, UserCircle2 } from 'lucide-react';
    import { useTranslation } from 'react-i18next';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';

    const TWA_RETURN_URL_BASE = 'https://t.me/BoltCoinDev_Bot/BoltCoinDevApp';

    const WalletConnectPage = () => {
        const { t } = useTranslation(['wallet', 'common']);
        const wallet = useTonWallet();
        const [tonConnectUI, setOptions] = useTonConnectUI();
        const { toast } = useToast();
        const [isClient, setIsClient] = useState(false);
        const [userProfile, setUserProfile] = useState(null);
        const [storedWalletAddress, setStoredWalletAddress] = useState(null);

        useEffect(() => {
            setIsClient(true);
            const fetchUserProfileAndWallet = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.id) {
                    const { data, error } = await supabase
                        .from('users')
                        .select('id, telegram_id, username, first_name, last_name, ton_wallet_address')
                        .eq('id', session.user.id)
                        .single();
                    if (error) {
                        console.error("Error fetching user profile:", error);
                    } else if (data) {
                        setUserProfile(data);
                        setStoredWalletAddress(data.ton_wallet_address);
                    }
                }
            };
            fetchUserProfileAndWallet();
        }, []);

        useEffect(() => {
             if (wallet && userProfile && wallet.account.address !== storedWalletAddress) {
                const updateWalletAddress = async () => {
                    const { error } = await supabase
                        .from('users')
                        .update({ ton_wallet_address: wallet.account.address })
                        .eq('id', userProfile.id);
                    if (error) {
                        console.error("Error updating wallet address:", error);
                        toast({ title: t('updateWalletError.title'), description: t('updateWalletError.description', {error: error.message}), variant: "destructive"});
                    } else {
                        setStoredWalletAddress(wallet.account.address);
                        toast({ title: t('walletUpdated.title'), description: t('walletUpdated.description') });
                    }
                };
                updateWalletAddress();
            }
        }, [wallet, userProfile, storedWalletAddress, t, toast]);
        
        useEffect(() => {
          if (tonConnectUI) {
            const fromParam = `from=wallet_connect_page`;
            setOptions({
              actionsConfiguration: {
                twaReturnUrl: `${TWA_RETURN_URL_BASE}?${fromParam}`
              }
            });
          }
        }, [tonConnectUI, setOptions]);


        const handleDisconnect = async () => {
            if (!tonConnectUI) return;
            try {
                await tonConnectUI.disconnect();
                if (userProfile) {
                    const { error } = await supabase
                        .from('users')
                        .update({ ton_wallet_address: null })
                        .eq('id', userProfile.id);
                     if (error) {
                        console.error("Error clearing wallet address:", error);
                     } else {
                        setStoredWalletAddress(null);
                     }
                }
                toast({ title: t('disconnected.title'), description: t('disconnected.description') });
            } catch (e) {
                console.error('Disconnect error:', e);
                toast({ title: t('disconnectError.title'), description: t('disconnectError.description'), variant: 'destructive' });
            }
        };

        const formatAddress = (address) => {
            if (!address) return 'N/A';
            return `${address.slice(0, 6)}...${address.slice(-4)}`;
        };
        
        const formatBalance = (balance) => {
            if (!balance) return '0.00';
            return (parseInt(balance) / 1_000_000_000).toFixed(4);
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-start min-h-[calc(100vh-120px)] py-6 sm:py-8 px-3"
            >
                <Card className="w-full max-w-md bg-gray-800/60 border-purple-600/70 shadow-xl">
                    <CardHeader className="text-center pb-3 sm:pb-4">
                        <Wallet className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mb-2" />
                        <CardTitle className="text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500">
                            {t('title')}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-purple-300">
                            {t('description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-5">
                        {isClient && (
                            <div className="flex justify-center">
                                <TonConnectButton />
                            </div>
                        )}

                        {wallet ? (
                            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-700/50 rounded-md">
                                    <span className="text-gray-400 flex items-center"><UserCircle2 className="w-4 h-4 mr-1.5 sm:mr-2" />{t('connectedWallet')}:</span>
                                    <span className="text-purple-300 font-medium">{wallet.device.appName}</span>
                                
                                </div>
                                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-700/50 rounded-md">
                                    <span className="text-gray-400 flex items-center"><Link className="w-4 h-4 mr-1.5 sm:mr-2" />{t('address')}:</span>
                                    <span className="text-green-400 font-mono text-xs sm:text-sm">{formatAddress(wallet.account.address)}</span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-700/50 rounded-md">
                                    <span className="text-gray-400 flex items-center"><Zap className="w-4 h-4 mr-1.5 sm:mr-2" />{t('balance')}:</span>
                                    <span className="text-yellow-400 font-semibold">{formatBalance(wallet.account.balance)} TON</span>
                                </div>
                                 <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-700/50 rounded-md">
                                    <span className="text-gray-400 flex items-center"><Link className="w-4 h-4 mr-1.5 sm:mr-2" />{t('network')}:</span>
                                    <span className="text-cyan-400">{wallet.account.chain === '-239' ? 'Mainnet' : 'Testnet'}</span>
                                </div>
                                <Button
                                    onClick={handleDisconnect}
                                    variant="destructive"
                                    className="w-full bg-red-600/80 hover:bg-red-700/90 text-white text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
                                >
                                    <LogOut className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t('disconnectButton')}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center p-3 sm:p-4 bg-yellow-500/10 border border-yellow-600/30 rounded-md">
                                <AlertTriangle className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mb-1.5 sm:mb-2" />
                                <p className="text-sm sm:text-base text-yellow-300">{t('notConnectedMessage')}</p>
                            </div>
                        )}
                         {isClient && !wallet && storedWalletAddress && (
                            <div className="mt-3 sm:mt-4 text-center p-2.5 sm:p-3 bg-blue-500/10 border border-blue-600/30 rounded-md">
                                <p className="text-xs sm:text-sm text-blue-300">{t('previouslyConnected')}: <span className="font-mono text-cyan-400">{formatAddress(storedWalletAddress)}</span></p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    export default WalletConnectPage;