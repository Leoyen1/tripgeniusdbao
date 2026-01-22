
import React from 'react';
import { Button } from '../components/Button';
import { CheckCircleIcon } from '../components/Icons';

interface MerchantViewProps {
  onBack: () => void;
}

const MerchantView: React.FC<MerchantViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden relative">
        {/* Decorative Header */}
        <div className="bg-slate-900 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2 text-amber-400">诚邀加入商业推广计划</h2>
            <p className="text-slate-300 text-sm">欢迎加入 TripGenius，与我们共创价值</p>
          </div>
        </div>
        
        <div className="p-8">
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
               <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                 为什么加入我们？
               </h3>
               <ul className="space-y-2 text-sm text-amber-900/80">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 mt-0.5 text-amber-600" /> 
                    <span>精准触达高净值自由行用户</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 mt-0.5 text-amber-600" /> 
                    <span>AI 场景化植入，告别硬广打扰</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 mt-0.5 text-amber-600" /> 
                    <span>提供数据驱动的营销转化报告</span>
                  </li>
               </ul>
            </div>

            <div className="text-center space-y-4">
               <p className="text-slate-600 leading-relaxed">
                 我们正在寻找能够提供<strong>地道体验、优质服务</strong>的酒店、餐饮及活动供应商。如果您希望您的品牌出现在 AI 生成的专属行程中，请通过以下方式联系我们。
               </p>
               
               <div className="py-6 border-t border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">欢迎参与商业推广，联系微信号</p>
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-2xl font-mono font-bold text-slate-800 selection:bg-amber-200">HappyPanda233</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">（添加时请备注：品牌名称+合作意向）</p>
               </div>
            </div>

            <Button onClick={onBack} variant="secondary" className="w-full">
              返回登录页面
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantView;
