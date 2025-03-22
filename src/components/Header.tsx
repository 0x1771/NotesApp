import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function Header() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className="bg-[#262626] p-4 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-[#FE6902]">
          Notes
        </Link>

        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <Link
                to="/pricing"
                className="text-[#E5E5E5] hover:text-[#FE6902] transition-colors"
              >
                {profile.subscription_tier === 'free' ? 'Upgrade' : 'Subscription'}
              </Link>
              <div className="flex items-center gap-2 text-[#E5E5E5]">
                <User size={20} />
                <span>{profile.full_name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-[#393737] transition-colors"
              >
                <LogOut size={20} className="text-[#E5E5E5]" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 bg-[#FE6902] text-white rounded-lg hover:bg-[#ff7b1d] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}