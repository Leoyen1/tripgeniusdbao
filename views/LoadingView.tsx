import React from 'react';
import { GenerationStep } from '../types';
import { CheckCircleIcon, LoaderIcon } from '../components/Icons';

interface LoadingViewProps {
  steps: GenerationStep[];
}

const LoadingView: React.FC<LoadingViewProps> = ({ steps }) => {
  // Calculate progress
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  // Give a small boost to the active step for smoother visual
  const activeStep = steps.find(s => s.status === 'active');
  const activeBonus = activeStep ? 0.6 : 0;
  
  // Cap at 99% if not all steps are strictly completed
  let progressRaw = ((completedSteps + activeBonus) / totalSteps) * 100;
  if (completedSteps < totalSteps && progressRaw > 99) {
    progressRaw = 99;
  }
  
  const progressPercent = Math.min(100, Math.round(progressRaw));

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h3 className="text-2xl font-bold text-center mb-8 text-slate-800 font-serif">正在为您规划行程</h3>
        
        <div className="space-y-6 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center transition-all duration-300">
                {step.status === 'completed' ? (
                  <div className="text-emerald-500 scale-110">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                ) : step.status === 'active' ? (
                  <div className="text-blue-600 animate-spin">
                    <LoaderIcon className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-2.5 h-2.5 bg-slate-200 rounded-full ml-1" />
                )}
              </div>
              
              <div className={`flex-1 transition-all duration-500 ${step.status === 'pending' ? 'opacity-30 blur-[0.5px]' : 'opacity-100'}`}>
                <p className={`font-medium text-sm md:text-base ${step.status === 'active' ? 'text-blue-700' : 'text-slate-700'}`}>
                  {step.label}
                </p>
                {step.status === 'active' && (
                  <p className="text-xs text-blue-400 mt-0.5 animate-pulse">AI 正在处理...</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar Container */}
        <div className="relative pt-2">
           <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>处理进度</span>
              <span className="font-mono">{progressPercent}%</span>
           </div>
           <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                 className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out relative"
                 style={{ width: `${progressPercent}%` }}
              >
                 {/* Shimmer overlay */}
                 <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-[pulse_2s_infinite]"></div>
              </div>
           </div>
           <p className="text-center text-[10px] text-slate-300 mt-3">
             基于 Doubao AI 深度推理，全程约需 30-50 秒
           </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingView;