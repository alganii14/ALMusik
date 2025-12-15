"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

const SignupBar = () => {
  const { user } = useAuth();

  if (user) return null;

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 z-[100] flex w-full items-center justify-between bg-gradient-to-r from-[#af2896] to-[#509bf5] px-6 py-3"
      data-testid="signup-bar"
      aria-label="Sign up for ALMusik"
    >
      <div className="flex flex-col gap-1 text-white">
        <p className="text-xs font-bold tracking-wide">
          Preview of ALMusik
        </p>
        <p className="text-[14px] font-medium leading-tight">
          Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.
        </p>
      </div>
      <div className="ml-6 flex-shrink-0">
        <Link
          href="/signup"
          className="flex min-w-fit cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-white px-8 py-3 text-sm font-bold text-black transition-transform duration-100 hover:scale-105 active:scale-100"
        >
          Sign up free
        </Link>
      </div>
    </aside>
  );
};

export default SignupBar;