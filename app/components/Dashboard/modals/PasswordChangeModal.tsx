import { useState, Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { RotateCw, X as CloseIcon } from 'lucide-react';
import type { Game } from '@/lib/store/useGameStore';
import useGameStore from '@/lib/store/useGameStore';
import { toast } from 'react-hot-toast';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
}

export default function PasswordChangeModal({ isOpen, onClose, game }: PasswordChangeModalProps) {
  const { games } = useGameStore();
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const [resolvedGameId, setResolvedGameId] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  
  // Resolve game information when the modal opens
  useEffect(() => {
    if (isOpen && game) {
      console.log('Games from store (Password Change):', games.map(g => ({
        id: g.id,
        code: g.code,
        title: g.title
      })));
      
      console.log('Trying to match game for password change:', {
        id: game.id,
        code: game.code,
        title: game.title
      });
      
      // Try to find the game by code in the games list
      const matchedGame = games.find(g => g.code === game.code);
      
      if (matchedGame) {
        console.log('Found matching game in game list for password change:', matchedGame);
        setResolvedGameId(matchedGame.id.toString());
      } else {
        console.log('No exact match found for password change, trying case insensitive match');
        // Try case insensitive match
        const caseInsensitiveMatch = games.find(g => 
          g.code.toLowerCase() === game.code.toLowerCase()
        );
        
        if (caseInsensitiveMatch) {
          console.log('Found case insensitive match for password change:', caseInsensitiveMatch);
          setResolvedGameId(caseInsensitiveMatch.id.toString());
        } else {
          console.warn('No matching game found in game list for password change code:', game.code);
          // Fallback to the provided game
          setResolvedGameId(game.id.toString());
        }
      }
    }
  }, [isOpen, game, games]);

  // Check password strength when password changes
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(null);
      return;
    }
    
    // Simple password strength checker
    if (newPassword.length < 8) {
      setPasswordStrength('weak');
    } else if (
      newPassword.length >= 8 && 
      /[A-Z]/.test(newPassword) && 
      /[a-z]/.test(newPassword) && 
      /[0-9]/.test(newPassword)
    ) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  }, [newPassword]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Use the resolved game information
      const gameIdToUse = resolvedGameId || game.id.toString();
      const username = `user_${game.code.toLowerCase()}`; // User the same format as displayed in the UI
      
      console.log('Changing password for game with resolved info:', {
        originalId: game.id,
        resolvedId: gameIdToUse,
        gameTitle: game.title,
        username: username
      });
      
      let token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      if (!token) {
        const localStorageToken = localStorage.getItem('accessToken');
        if (localStorageToken) {
          token = localStorageToken;
        }
      }
      
      const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
      
      if (!whitelabel_admin_uuid || !token) {
        console.error('Missing auth data for password change:', { 
          hasToken: !!token, 
          hasUUID: !!whitelabel_admin_uuid
        });
        throw new Error('Authentication data missing. Please log in again.');
      }
      
      const payload = {
        whitelabel_admin_uuid: whitelabel_admin_uuid,
        game_id: gameIdToUse,
        username: username,
        password: newPassword
      };
      
      // More detailed payload logging (omit password for security)
      console.log('Sending password change request with payload:', {
        ...payload,
        password: '********', // Hide actual password in logs
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.substring(0, 10)}...`, // Log partial token for security
        }
      });
      
      const response = await fetch('https://serverhub.biz/games/change_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.clear();
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password. Please try again.');
      }
      
      const result = await response.json();
      console.log('Password change successful:', result);
      
      // Use message from the API response if available, otherwise use our fallback message
      const successMessage = result.message || `Password successfully changed for ${game.title}`;
      
      toast.success(successMessage);
      setNewPassword('');
      onClose();
    } catch (err) {
      console.error('Password change error:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
      toast.error(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        initialFocus={initialFocusRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl 
                bg-[#1a1f2d] p-6 shadow-xl transition-all focus:outline-none
                border border-[#00bbff]/10">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#00bbff] rounded-lg flex items-center justify-center">
                        <RotateCw className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg tracking-wide">Change Password</span>
                        <span className="text-xs text-white/70 font-normal">{game.title}</span>
                      </div>
                    </Dialog.Title>
                    <button 
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                      aria-label="Close dialog"
                    >
                      <CloseIcon className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20" role="alert">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="new-password" className="text-[#00ffff] text-sm">
                          New Password
                        </label>
                        {passwordStrength && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            passwordStrength === 'weak' ? 'bg-red-500/10 text-red-400' :
                            passwordStrength === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-green-500/10 text-green-400'
                          }`}>
                            {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          ref={initialFocusRef}
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-3 pl-10 pr-10 bg-black/20 text-white placeholder-white/40
                            rounded-lg border border-white/10 focus:border-[#00bbff]
                            focus:outline-none focus:ring-1 focus:ring-[#00bbff] transition-colors"
                          required
                          minLength={6}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00bbff]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white
                            focus:outline-none transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      {/* Password strength indicator */}
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStrengthColor()} transition-all duration-300 ${getStrengthWidth()}`}
                        ></div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-md ${newPassword.length >= 8 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                          8+ chars
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-md ${/[A-Z]/.test(newPassword) ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                          Uppercase
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-md ${/[a-z]/.test(newPassword) ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                          Lowercase
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-md ${/[0-9]/.test(newPassword) ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                          Number
                        </span>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting || !newPassword || newPassword.length < 6}
                      className="w-full p-3 bg-[#00bbff] hover:bg-[#00bbff]/90
                        text-white rounded-lg text-base font-medium
                        transition-all duration-200 flex items-center justify-center gap-2
                        focus:outline-none focus:ring-2 focus:ring-[#00bbff] focus:ring-offset-2 focus:ring-offset-[#1a1f2d]
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <RotateCw className="w-5 h-5" />
                          <span>Change Password</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 