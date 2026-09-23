'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Package, Plus, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onAddProductClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAddProductClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/dashboard"
          className="flex items-center space-x-3 text-sky-400 font-bold text-lg hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Package className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-white bg-clip-text text-transparent font-extrabold tracking-tight">
            ProductAdmin
          </span>
        </Link>

        {/* Right User Actions */}
        <div className="flex items-center space-x-3">
          {onAddProductClick && (
            <button
              onClick={onAddProductClick}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-sky-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}

          {/* User Profile Badge */}
          {user && (
            <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                {user.image ? (
                  // eslint-disable-next-next/no-img-element
                  <img
                    src={user.image}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-slate-200">
                  {user.firstName || user.username}
                </p>
                <p className="text-[10px] text-slate-400">@{user.username}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
