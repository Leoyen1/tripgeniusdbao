
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { PlaneIcon } from '../components/Icons';

interface LoginViewProps {
  onLogin: () => void;
  onPrivacy: () => void;
  onMerchant: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onPrivacy, onMerchant }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <PlaneIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">欢迎来到 TripGenius</h2>
          <p className="text-blue-100">您的 AI 智能旅行伴侣</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">电子邮箱</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              登录
            </Button>
            
            <div className="flex justify-between items-center mt-4">
               <button type="button" className="text-sm text-blue-600 hover:underline">
                 注册新账号
               </button>
               <button 
                type="button" 
                onClick={onPrivacy}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                隐私政策
              </button>
            </div>
          </form>

          {/* Business / Merchant Entry */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 mb-3">合作与推广</p>
            <button 
              onClick={onMerchant}
              className="w-full py-2 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-amber-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              商家推广计划入口
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
