import React, { useState, useEffect } from 'react';
import { AppView, TravelFormData, TripPlan, GenerationStep } from './types';
import { generateTripPlan, modifyTripPlan } from './services/aiService';
import { PlaneIcon } from './components/Icons';
import LoginView from './views/LoginView';
import FormView from './views/FormView';
import LoadingView from './views/LoadingView';
import ResultView from './views/ResultView';
import PrivacyView from './views/PrivacyView';
import MerchantView from './views/MerchantView';

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [formData, setFormData] = useState<TravelFormData | null>(null);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    { id: 1, label: '连接 Doubao AI 智能服务...', status: 'pending' },
    { id: 2, label: 'AI 正在检索当地气候与环境...', status: 'pending' },
    { id: 3, label: '大数据比价：酒店与餐饮...', status: 'pending' },
    { id: 4, label: '正在计算最佳游玩路线...', status: 'pending' },
    { id: 5, label: '最终生成个性化方案...', status: 'pending' },
  ]);

  const handleLoginSuccess = () => {
    setCurrentView(AppView.FORM);
  };

  // Smart simulation that hangs on the final step until API is actually complete
  const simulateSteps = async (statusRef: { isComplete: boolean }) => {
    const updateStep = (id: number, status: 'active' | 'completed') => {
      setGenerationSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    const stepsTiming = [
      { id: 1, duration: 1500 },  // Connect
      { id: 2, duration: 3000 },  // Search Weather
      { id: 3, duration: 6000 },  // Search Hotels (Longer)
      { id: 4, duration: 10000 }, // Reasoning
      { id: 5, duration: 2000 }   // Finalizing
    ];

    const totalSteps = stepsTiming.length;

    for (let i = 0; i < totalSteps; i++) {
      const step = stepsTiming[i];
      const isLastStep = i === totalSteps - 1;

      // If API finished early, fast forward remaining steps
      if (statusRef.isComplete) {
         updateStep(step.id, 'completed');
         await new Promise(r => setTimeout(r, 100)); // Fast visual skip
         continue;
      }

      updateStep(step.id, 'active');
      
      // If it is the LAST step, we MUST wait for the API to finish
      // This ensures 100% only happens when data is ready
      if (isLastStep) {
         while (!statusRef.isComplete) {
            // Check every 200ms
            await new Promise(r => setTimeout(r, 200));
         }
      } else {
         // Normal duration wait logic for earlier steps
         const checkInterval = 200;
         let elapsed = 0;
         while (elapsed < step.duration) {
            if (statusRef.isComplete) break; // Break loop to fast forward
            await new Promise(r => setTimeout(r, checkInterval));
            elapsed += checkInterval;
         }
      }
      
      updateStep(step.id, 'completed');
    }
  };

  const handleFormSubmit = async (data: TravelFormData) => {
    setFormData(data);
    setCurrentView(AppView.LOADING);
    setError(null);
    
    // Reset steps
    setGenerationSteps([
      { id: 1, label: '连接 Doubao AI 智能服务...', status: 'pending' },
      { id: 2, label: 'AI 正在检索当地气候与环境...', status: 'pending' },
      { id: 3, label: '大数据比价：酒店与餐饮...', status: 'pending' },
      { id: 4, label: '正在计算最佳游玩路线...', status: 'pending' },
      { id: 5, label: '最终生成个性化方案...', status: 'pending' },
    ]);

    // Status ref to share state between API promise and Simulation
    const statusRef = { isComplete: false };

    // Create the promise for the API call
    const planPromise = generateTripPlan(data).then(res => {
        statusRef.isComplete = true; // Signal simulation to finish
        return res;
    });
    
    // Create a promise for the simulation
    const simulationPromise = simulateSteps(statusRef);
    
    try {
      // Run in parallel
      const [plan] = await Promise.all([planPromise, simulationPromise]);
      
      setTripPlan(plan);
      setCurrentView(AppView.RESULT);
    } catch (err: any) {
      console.error("Plan Generation Error:", err);
      statusRef.isComplete = true; // Stop simulation on error
      setError(err.message || "生成计划时发生未知错误，请重试。");
      setCurrentView(AppView.FORM); 
    }
  };

  const handleRegenerate = async (rejectedIndices: Set<string>, remark: string) => {
    if (!tripPlan) return;
    
    setCurrentView(AppView.LOADING);
    setGenerationSteps([
      { id: 1, label: 'AI 正在分析您的调整需求...', status: 'pending' },
      { id: 2, label: '实时检索替代景点与最新评价...', status: 'pending' },
      { id: 3, label: '重新规划路线与时间...', status: 'pending' },
      { id: 4, label: '核算最新价格与预算...', status: 'pending' },
      { id: 5, label: '生成新的行程单...', status: 'pending' },
    ]);

    const rejectedItems: { day: number, activityTitle: string }[] = [];
    Array.from(rejectedIndices).forEach(indexStr => {
      const [dayIdx, actIdx] = indexStr.split('-').map(Number);
      const activity = tripPlan.daily_plan[dayIdx]?.activities[actIdx];
      if (activity) {
        rejectedItems.push({
          day: tripPlan.daily_plan[dayIdx].day,
          activityTitle: activity.title
        });
      }
    });

    const statusRef = { isComplete: false };

    const modifyPromise = modifyTripPlan(tripPlan, rejectedItems, remark).then(res => {
      statusRef.isComplete = true;
      return res;
    });

    const simulationPromise = simulateSteps(statusRef);

    try {
      const [newPlan] = await Promise.all([modifyPromise, simulationPromise]);
      setTripPlan(newPlan);
      setCurrentView(AppView.RESULT);
    } catch (err: any) {
      console.error("Regeneration Error:", err);
      statusRef.isComplete = true;
      alert("调整失败: " + err.message);
      setCurrentView(AppView.RESULT);
    }
  };

  const handleRestart = () => {
    setTripPlan(null);
    setFormData(null);
    setGenerationSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
    setCurrentView(AppView.FORM);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.LOGIN:
        return <LoginView 
          onLogin={handleLoginSuccess} 
          onPrivacy={() => setCurrentView(AppView.PRIVACY)} 
          onMerchant={() => setCurrentView(AppView.MERCHANT)}
        />;
      case AppView.PRIVACY:
        return <PrivacyView onBack={() => setCurrentView(AppView.LOGIN)} />;
      case AppView.MERCHANT:
        return <MerchantView onBack={() => setCurrentView(AppView.LOGIN)} />;
      case AppView.FORM:
        return <FormView onSubmit={handleFormSubmit} error={error} />;
      case AppView.LOADING:
        return <LoadingView steps={generationSteps} />;
      case AppView.RESULT:
        return tripPlan && formData ? (
          <ResultView 
            plan={tripPlan} 
            formData={formData} 
            onBack={handleRestart} 
            onRegenerate={handleRegenerate}
          />
        ) : null;
      default:
        return <div>Unknown View</div>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 py-4 px-6 no-print sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView(AppView.LOGIN)}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <PlaneIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
              TripGenius
            </h1>
          </div>
          {currentView !== AppView.LOGIN && currentView !== AppView.PRIVACY && currentView !== AppView.MERCHANT && (
             <div className="text-sm text-slate-500 hidden sm:block">
               Doubao AI 驱动 | 实时数据已开启
             </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto w-full relative">
        {renderView()}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm no-print">
        <p>&copy; {new Date().getFullYear()} TripGenius. Powered by Doubao AI.</p>
      </footer>
    </div>
  );
};

export default App;