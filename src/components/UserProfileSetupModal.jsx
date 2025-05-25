import React, { useState, useEffect, useCallback } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { UploadCloud, User, Languages, Check, Loader2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import { supabase } from '@/lib/supabaseClient';

    const appLanguages = [
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ];

    const UserProfileSetupModal = ({ isOpen, setIsOpen, onProfileSetupComplete, currentProfile }) => {
      const { t, i18n } = useTranslation(['modals', 'common']);
      const { toast } = useToast();
      const [name, setName] = useState('');
      const [avatarUrl, setAvatarUrl] = useState(null);
      const [localAvatarPreview, setLocalAvatarPreview] = useState(null);
      const [uploading, setUploading] = useState(false);
      const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
      const [userId, setUserId] = useState(null);

      useEffect(() => {
        if (currentProfile) {
          setName(currentProfile.first_name || '');
          setAvatarUrl(currentProfile.avatar_url || null);
          setLocalAvatarPreview(currentProfile.avatar_url || null);
          setSelectedLanguage(currentProfile.user_language_code || i18n.language);
          setUserId(currentProfile.id || null);
        } else {
          setSelectedLanguage(i18n.language);
           const fetchUserId = async () => {
            const {data: {session}} = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
            }
           };
           fetchUserId();
        }
      }, [currentProfile, i18n.language]);

      const handleAvatarUpload = async (event) => {
        try {
          setUploading(true);
          if (!event.target.files || event.target.files.length === 0) {
            throw new Error(t('userProfileSetupModal.avatarUploadError'));
          }
          const file = event.target.files[0];
          const fileExt = file.name.split('.').pop();
          
          if (!userId) {
            throw new Error("User ID is not available. Cannot upload avatar.");
          }

          const fileName = `${userId}_${Date.now()}.${fileExt}`;
          const filePath = `${userId}/${fileName}`;

          setLocalAvatarPreview(URL.createObjectURL(file));

          let { error: uploadError } = await supabase.storage.from('user_avatars').upload(filePath, file, {
            cacheControl: '3600',
            upsert: false 
          });

          if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw uploadError;
          }

          const { data: publicUrlData } = supabase.storage.from('user_avatars').getPublicUrl(filePath);
          
          if (!publicUrlData || !publicUrlData.publicUrl) {
             throw new Error("Failed to get public URL for avatar.");
          }
          setAvatarUrl(publicUrlData.publicUrl);
          toast({ title: t('userProfileSetupModal.avatarUploadSuccess') });

        } catch (error) {
          console.error('Avatar upload error details:', error);
          toast({ 
            title: t('userProfileSetupModal.avatarUploadError'), 
            description: error.message || "An unexpected error occurred during upload.", 
            variant: 'destructive' 
          });
          setLocalAvatarPreview(avatarUrl); 
        } finally {
          setUploading(false);
        }
      };

      const handleSave = async () => {
        if (!name.trim()) {
          toast({ title: t('common:toast.errorTitle'), description: t('userProfileSetupModal.nameRequired'), variant: 'destructive' });
          return;
        }
        await i18n.changeLanguage(selectedLanguage);
        onProfileSetupComplete({
          first_name: name,
          avatar_url: avatarUrl,
          user_language_code: selectedLanguage,
        });
        toast({ title: t('userProfileSetupModal.profileSaved') });
        setIsOpen(false);
      };
      
      const handleLanguageChange = (langCode) => {
        setSelectedLanguage(langCode);
      };

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[480px] bg-gray-800/80 backdrop-blur-md border-purple-500/50 text-gray-100 p-4 sm:p-6">
            <DialogHeader className="text-center sm:text-left">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400 mb-1 sm:mb-2">
                {t('userProfileSetupModal.title')}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-purple-300">
                {t('userProfileSetupModal.description')}
              </DialogDescription>
            </DialogHeader>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-800">
                  <AvatarImage src={localAvatarPreview || avatarUrl} alt={name || 'User'} />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl sm:text-3xl">
                    <User className="h-10 w-10 sm:h-12 sm:w-12" />
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="relative text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 border-purple-500 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200">
                  {uploading ? <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <UploadCloud className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  {uploading ? t('userProfileSetupModal.avatarUploading') : t('userProfileSetupModal.avatarUploadButton')}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </Button>
              </div>

              <div>
                <Label htmlFor="name" className="text-xs sm:text-sm text-purple-300">{t('userProfileSetupModal.nameLabel')}</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder={t('userProfileSetupModal.namePlaceholder')} 
                  className="mt-1 bg-gray-700/50 border-purple-600 text-gray-200 focus:ring-pink-500 text-xs sm:text-sm h-9 sm:h-10" 
                />
              </div>

              <div>
                <Label className="text-xs sm:text-sm text-purple-300 flex items-center mb-1.5 sm:mb-2">
                  <Languages className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
                  {t('userProfileSetupModal.languageLabel')}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 max-h-48 overflow-y-auto pr-1">
                  {appLanguages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full justify-start text-xs sm:text-sm py-1.5 sm:py-2 h-9 sm:h-10 ${
                        selectedLanguage === lang.code 
                        ? 'bg-pink-500 hover:bg-pink-600 text-white border-pink-500' 
                        : 'border-purple-500 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200'
                      }`}
                    >
                      <span className="mr-1.5 sm:mr-2 text-sm sm:text-base">{lang.flag}</span>
                      {lang.name}
                      {selectedLanguage === lang.code && <Check className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>

            <DialogFooter className="mt-2 sm:mt-3">
              <Button 
                onClick={handleSave} 
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-semibold text-xs sm:text-sm py-1.5 sm:py-2 h-9 sm:h-10"
              >
                {t('userProfileSetupModal.saveButton')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default UserProfileSetupModal;