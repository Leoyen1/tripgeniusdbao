import React, { useState, useRef, useEffect } from 'react';
import { TripPlan, TravelFormData, ChatMessage } from '../types';
import { queryTripAssistant } from '../services/aiService';
import { Button } from '../components/Button';
import { DownloadIcon, MapPinIcon, CalendarIcon, WalletIcon, SunIcon, CheckCircleIcon, ChatIcon, XIcon, SendIcon } from '../components/Icons';

interface ResultViewProps {
  plan: TripPlan;
  formData: TravelFormData;
  onBack: () => void;
  onRegenerate: (rejectedIndices: Set<string>, remark: string) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ plan, formData, onBack, onRegenerate }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Track rejected items by "dayIndex-activityIndex"
  const [rejectedIndices, setRejectedIndices] = useState<Set<string>>(new Set());
  // User input for modification
  const [modificationRemark, setModificationRemark] = useState("");

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: `你好！我是您的专属旅行伴侣。关于这次去 ${plan.destination} 的行程，有什么我可以帮您的吗？`, timestamp: Date.now() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    
    const element = document.getElementById('printable-area');
    
    // HTML2PDF options optimized for continuous scroll
    const opt = {
      margin:       0, // Zero margin for full bleed cover
      filename:     `TripGenius_${plan.destination}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save()
        .then(() => setIsDownloading(false))
        .catch((err: any) => {
          console.error(err);
          alert("导出失败");
          setIsDownloading(false);
        });
    } else {
      alert("PDF 组件未加载");
      setIsDownloading(false);
    }
  };

  const toggleActivity = (dayIdx: number, actIdx: number) => {
    const key = `${dayIdx}-${actIdx}`;
    setRejectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key); 
      } else {
        next.add(key); 
      }
      return next;
    });
  };

  const handleRegenerateClick = () => {
    if (rejectedIndices.size === 0) return;
    onRegenerate(rejectedIndices, modificationRemark);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const responseText = await queryTripAssistant(plan, chatMessages, userMsg.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const hasDailyPlan = plan.daily_plan && plan.daily_plan.length > 0;
  const hasChanges = rejectedIndices.size > 0;

  // Render logic for temperature badge color
  const getTempColor = (tempStr: string = "") => {
    if (tempStr.includes("-")) {
      const avg = parseInt(tempStr.split("-")[0]);
      if (avg < 10) return "bg-blue-50 text-blue-700 border-blue-100";
      if (avg > 28) return "bg-orange-50 text-orange-700 border-orange-100";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  const getPriceCategoryColor = (category: string = "") => {
    if (category.includes("奢华") || category.includes("High")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (category.includes("舒适") || category.includes("Mid")) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32 relative">
      {/* Actions (Hidden in PDF via html2canvas-ignore) */}
      <div className="flex justify-between items-center mb-6 no-print" data-html2canvas-ignore="true">
        <Button variant="outline" onClick={onBack} disabled={isDownloading}>
          <span className="font-serif">TripGenius</span> <span className="text-xs ml-2 text-slate-400">重新规划</span>
        </Button>
        <div className="flex gap-4">
          {!hasChanges ? (
            <Button variant="primary" onClick={handleDownloadPDF} isLoading={isDownloading} className="bg-slate-900 hover:bg-black text-white border-none shadow-xl">
              <DownloadIcon className="w-4 h-4" /> 导出 PDF 方案书
            </Button>
          ) : (
             // Hidden when editing, shown in the bottom bar instead
             <div className="text-sm text-slate-500 italic">请在下方输入调整需求...</div>
          )}
        </div>
      </div>

      {/* Main Document Content */}
      <div id="printable-area" className="bg-white shadow-2xl text-slate-900 print:shadow-none mx-auto font-sans" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
        
        {/* --- MAGAZINE STYLE COVER PAGE --- */}
        <div className="relative h-[1123px] flex flex-col justify-between p-0 page-break bg-slate-50 overflow-hidden">
           {/* Decorative Background */}
           <div className="absolute top-0 inset-x-0 h-2/3 bg-gradient-to-b from-slate-200 to-slate-50 z-0"></div>
           <div className="absolute top-0 right-0 w-full h-full opacity-10" style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

           <div className="relative z-10 p-16 h-full flex flex-col">
             <div className="flex justify-between items-start border-b border-slate-900 pb-6 mb-12">
                <span className="text-2xl font-serif font-bold tracking-tight">TripGenius</span>
                <div className="text-right">
                   <span className="block text-xs uppercase tracking-[0.3em] text-slate-500">目的地</span>
                   <span className="text-xl font-bold uppercase">{plan.destination}</span>
                </div>
             </div>

             <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-xl font-medium text-slate-500 italic mb-6 font-serif">{plan.sub_title}</h2>
                <h1 className="text-8xl md:text-9xl font-serif font-black leading-[0.85] tracking-tighter text-slate-900 mb-12">
                   {plan.destination}
                   <span className="block text-blue-600 text-6xl mt-2">指南</span>
                </h1>
                
                <div className="grid grid-cols-3 gap-8 border-t border-slate-300 pt-8 mt-8">
                   <div>
                      <span className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">时长</span>
                      <span className="text-3xl font-serif">{plan.daily_plan.length} 天</span>
                   </div>
                   <div>
                      <span className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">人数</span>
                      <span className="text-3xl font-serif">{formData.people_count} 人</span>
                   </div>
                   <div>
                      <span className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">预估预算</span>
                      <span className="text-3xl font-serif">¥{formData.budget}</span>
                   </div>
                </div>
             </div>

             <div className="mt-auto pt-12">
                <div className="bg-white p-8 shadow-lg border-l-4 border-blue-600">
                   <p className="font-serif text-xl italic text-slate-600 leading-relaxed">
                      "{plan.summary}"
                   </p>
                </div>
                <div className="mt-8 flex justify-between items-end text-sm text-slate-400 font-medium">
                   <span>{plan.travel_date_range}</span>
                   <span>Powered by Doubao AI</span>
                </div>
             </div>
           </div>
        </div>

        {/* --- CONTENT PAGE 1: OVERVIEW & LOGIC --- */}
        <div className="p-12 md:p-16 bg-white page-break">
           <div className="flex items-baseline gap-4 mb-12 border-b border-slate-100 pb-4">
              <span className="text-blue-600 font-bold text-lg">01</span>
              <h2 className="text-4xl font-serif font-bold text-slate-900">行程总览</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Left Column: Context */}
              <div className="md:col-span-1 space-y-8">
                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">出行档案</h3>
                    <ul className="space-y-4">
                       <li className="flex justify-between border-b border-slate-50 pb-2">
                          <span className="text-slate-500">出发地</span>
                          <span className="font-medium">{formData.origin}</span>
                       </li>
                       <li className="flex justify-between border-b border-slate-50 pb-2">
                          <span className="text-slate-500">日期</span>
                          <span className="font-medium text-right text-xs">{formData.start_date}<br/>至 {formData.end_date}</span>
                       </li>
                       <li className="flex justify-between border-b border-slate-50 pb-2">
                          <span className="text-slate-500">团体</span>
                          <span className="font-medium">{formData.people_count} 人</span>
                       </li>
                    </ul>
                 </div>
                 
                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">旅行偏好</h3>
                    <div className="flex flex-wrap gap-2">
                        {formData.travel_style.map(s => (
                           <span key={s} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">{s}</span>
                        ))}
                    </div>
                 </div>
              </div>

              {/* Right Column: Logic & Weather */}
              <div className="md:col-span-2">
                 <div className="mb-10">
                    <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4">规划师逻辑</h3>
                    <div className="prose text-slate-600 leading-loose">
                       <p>{plan.recommendation_logic}</p>
                    </div>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-lg">
                    <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                      <SunIcon className="w-4 h-4" /> 当地天气预报
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                       {plan.daily_plan.slice(0, 3).map((day, i) => (
                          <div key={i} className="text-center p-3 bg-white rounded shadow-sm">
                             <span className="block text-xs text-slate-400 mb-1">第 {day.day} 天</span>
                             <span className="block font-bold text-slate-800">{day.temperature || "N/A"}</span>
                             <span className="block text-xs text-slate-500 mt-1 truncate">{day.weather}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- CONTENT PAGE 2: BUDGET & NOTES --- */}
        <div className="p-12 md:p-16 bg-white page-break">
          <div className="flex items-baseline gap-4 mb-12 border-b border-slate-100 pb-4">
              <span className="text-blue-600 font-bold text-lg">02</span>
              <h2 className="text-4xl font-serif font-bold text-slate-900">预算与须知</h2>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-8 mb-12 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="text-center md:text-left">
                      <span className="block text-slate-400 text-sm uppercase tracking-widest mb-1">预估总费用 (全员)</span>
                      <span className="text-5xl font-serif font-bold text-white">{plan.budget_total_team}</span>
                  </div>
                  <div className="h-px w-full md:w-px md:h-16 bg-slate-700"></div>
                  <div className="text-center md:text-right">
                      <span className="block text-slate-400 text-sm uppercase tracking-widest mb-1">人均预估</span>
                      <span className="text-3xl font-serif text-blue-400">{plan.budget_total_per_person}</span>
                  </div>
              </div>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div>
                <h3 className="font-serif text-xl font-bold mb-6">费用明细</h3>
                <div className="space-y-4">
                   {(plan.budget_breakdown || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-3">
                         <div>
                            <span className="font-bold text-slate-700 block">{item.item}</span>
                            <span className="text-xs text-slate-400">{item.remark}</span>
                         </div>
                         <span className="font-mono font-medium text-slate-600">{item.cost_per_person}</span>
                      </div>
                   ))}
                </div>
             </div>
             
             <div>
                <h3 className="font-serif text-xl font-bold mb-6">重要提醒</h3>
                <ul className="space-y-3">
                   {(plan.important_notes || []).map((note, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                         <span className="text-blue-500 font-bold">•</span>
                         <span dangerouslySetInnerHTML={{ __html: note }}></span>
                      </li>
                   ))}
                </ul>
             </div>
          </div>
        </div>

        {/* --- ACCOMMODATION --- */}
        <div className="p-12 md:p-16 bg-white page-break">
            <div className="flex items-baseline gap-4 mb-12 border-b border-slate-100 pb-4">
              <span className="text-blue-600 font-bold text-lg">03</span>
              <h2 className="text-4xl font-serif font-bold text-slate-900">精选酒店</h2>
            </div>
             <p className="mb-8 text-slate-500 italic">抵达 {plan.destination} 后，基于 **全网实时比价** 为您甄选的酒店。</p>
             <div className="grid grid-cols-1 gap-8">
                {(plan.accommodation_info || []).map((acc, i) => (
                   <div key={i} className="flex flex-col md:flex-row gap-8 bg-slate-50 p-8 rounded-none border-l-4 border-slate-900 relative overflow-hidden">
                      {/* Price Tier Badge */}
                      <div className={`absolute top-0 right-0 px-4 py-1 text-xs font-bold uppercase tracking-widest ${getPriceCategoryColor(acc.price_category)}`}>
                         {acc.price_category || "舒适"}
                      </div>

                      <div className="flex-1 mt-4 md:mt-0">
                         <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">{acc.name}</h3>
                         <p className="text-slate-500 mb-6 flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4" /> {acc.address}
                         </p>
                         <div className="flex flex-wrap gap-2">
                            {(acc.features || []).map((f, fi) => (
                               <span key={fi} className="text-xs px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 uppercase tracking-wider">{f}</span>
                            ))}
                         </div>
                      </div>
                      <div className="md:w-56 flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-8">
                          <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">实时参考价</span>
                          <span className="font-serif font-bold text-xl text-blue-600">{acc.booking_info}</span>
                          {!acc.booking_info?.includes("晚") && <span className="text-[10px] text-slate-400">每晚</span>}
                      </div>
                   </div>
                ))}
             </div>
        </div>

        {/* --- DAILY PLANNER --- */}
        <div className="bg-slate-50/50">
          {!hasDailyPlan ? (
             <div className="p-16 text-center">正在生成行程计划...</div>
          ) : (
            (plan.daily_plan || []).map((day, dIdx) => (
              <div key={dIdx} className="break-inside-avoid page-break p-12 md:p-16">
                 {/* Day Header */}
                 <div className="flex items-end justify-between border-b-2 border-slate-900 pb-6 mb-10">
                    <div>
                       <span className="text-blue-600 font-bold text-lg mb-1 block">0{dIdx + 4}</span>
                       <h2 className="text-6xl font-serif font-black text-slate-900 mb-2">第 {day.day} 天</h2>
                       <p className="text-slate-500 font-medium">{day.date_display}</p>
                    </div>
                    <div className="text-right">
                       {day.highlight_tag && (
                          <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider mb-2">
                             {day.highlight_tag}
                          </span>
                       )}
                       <div className="flex items-center justify-end gap-2 text-sm font-medium text-slate-600">
                          <span className={`px-2 py-0.5 rounded border ${getTempColor(day.temperature)}`}>
                             {day.temperature}
                          </span>
                          <span>{day.weather}</span>
                       </div>
                    </div>
                 </div>

                 {/* Editor Comment */}
                 {day.editor_comment && (
                    <div className="mb-10 text-lg font-serif italic text-slate-600 leading-relaxed max-w-3xl">
                      "{day.editor_comment}"
                    </div>
                 )}

                 {/* Elegant Timeline */}
                 <div className="relative pl-6 border-l border-slate-300 space-y-12">
                    {(day.activities || []).map((act, aIdx) => {
                      const isRejected = rejectedIndices.has(`${dIdx}-${aIdx}`);
                      const containerClass = isRejected ? "opacity-40 grayscale" : "";

                      const primaryRestaurants = act.restaurants?.filter(r => !r.is_backup) || [];
                      const backupRestaurants = act.restaurants?.filter(r => r.is_backup) || [];
                      
                      if (act.restaurants && act.restaurants.length > 0 && primaryRestaurants.length === 0 && backupRestaurants.length === 0) {
                         primaryRestaurants.push(act.restaurants[0]);
                         if (act.restaurants.length > 1) {
                            backupRestaurants.push(...act.restaurants.slice(1));
                         }
                      }

                      return (
                        <div key={aIdx} className={`relative group break-inside-avoid ${containerClass}`}>
                            <div className="absolute -right-2 top-0 z-20 no-print" data-html2canvas-ignore="true">
                               <button 
                                 onClick={() => toggleActivity(dIdx, aIdx)}
                                 className={`text-xs px-2 py-1 rounded border transition-colors ${isRejected ? 'bg-slate-200 text-slate-600' : 'bg-white text-slate-300 hover:text-blue-500 border-slate-100'}`}
                               >
                                  {isRejected ? "已取消" : "更换"}
                               </button>
                            </div>

                            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-4 border-slate-50"></div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                               <div className="md:col-span-2">
                                  <span className="font-mono font-bold text-slate-500">{act.time}</span>
                               </div>
                               
                               <div className="md:col-span-10">
                                  <h4 className="text-xl font-bold text-slate-900 mb-2">{act.title}</h4>
                                  <p className="text-slate-600 leading-relaxed mb-4">{act.description}</p>
                                  
                                  <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                                     <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                        <WalletIcon className="w-3 h-3" /> 
                                        <span>{act.cost_per_person}</span>
                                     </span>
                                     
                                     {act.transport_detail && (
                                       <span className="flex items-center gap-1 border-l border-slate-300 pl-3">
                                          🚗 {act.transport_detail}
                                       </span>
                                     )}
                                  </div>

                                  {act.tips && (
                                     <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded border-l-2 border-amber-400">
                                        <span className="font-bold mr-2">贴士:</span> {act.tips}
                                     </div>
                                  )}

                                  {(primaryRestaurants.length > 0 || backupRestaurants.length > 0) && (
                                     <div className="mt-6 space-y-4">
                                        <div className="text-xs font-bold uppercase text-slate-400 tracking-widest">推荐餐饮</div>
                                        
                                        {primaryRestaurants.map((res, rIdx) => (
                                          <div key={`pri-${rIdx}`} className="bg-white border-l-4 border-l-orange-500 border-y border-r border-slate-200 p-4 rounded-r shadow-sm">
                                              <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                   <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">必吃榜</span>
                                                   <div className="font-serif font-bold text-slate-800 text-lg">{res.name}</div>
                                                </div>
                                                <div className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">
                                                    {res.cost.includes("人均") ? res.cost : `人均 ${res.cost}`}
                                                </div>
                                              </div>
                                              <div className="text-xs text-slate-400 mt-1">{res.type}</div>
                                              <div className="text-sm text-slate-600 mt-2">"{res.reason}"</div>
                                          </div>
                                        ))}

                                        {backupRestaurants.length > 0 && (
                                           <div className="mt-3">
                                              <div className="text-[10px] font-bold uppercase text-slate-400 mb-2 pl-1">备选方案</div>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                 {backupRestaurants.map((res, rIdx) => (
                                                   <div key={`bak-${rIdx}`} className="bg-slate-50 border border-slate-100 p-3 rounded hover:bg-white transition-colors">
                                                      <div className="flex justify-between items-start">
                                                         <div className="font-bold text-slate-700 text-sm">{res.name}</div>
                                                         <div className="text-[10px] text-slate-400">
                                                            {res.cost.includes("人均") ? res.cost : `人均 ${res.cost}`}
                                                         </div>
                                                      </div>
                                                      <div className="text-[10px] text-slate-400">{res.type}</div>
                                                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{res.reason}</div>
                                                   </div>
                                                 ))}
                                              </div>
                                           </div>
                                        )}
                                     </div>
                                  )}
                               </div>
                            </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
            ))
          )}
        </div>
        
        {/* Real Data References Section (Generic) */}
        {plan.references && plan.references.length > 0 && (
          <div className="p-12 md:p-16 bg-slate-100 page-break">
             <div className="flex items-center gap-2 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">数据来源</h3>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">实时搜索</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.references.map((ref, idx) => (
                   <a 
                     key={idx} 
                     href={ref.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="block p-3 bg-white rounded border border-slate-200 hover:border-blue-400 transition-colors group"
                   >
                      <div className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-600">{ref.title}</div>
                      <div className="text-xs text-slate-400 truncate mt-1 flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                         {ref.url}
                      </div>
                   </a>
                ))}
             </div>
             <p className="text-xs text-slate-400 mt-4 italic">
                * 天气、价格和库存信息基于 Doubao AI 实时联网数据。
             </p>
          </div>
        )}
        
        {/* Footer */}
        <div className="bg-slate-900 text-slate-400 py-16 px-16 mt-0">
           <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div>
                 <div className="text-3xl font-serif font-bold text-white mb-2">TripGenius</div>
                 <p className="text-sm tracking-wide">Powered by Doubao AI</p>
              </div>
              <div className="text-right text-xs text-slate-600">
                 <p>生成于 {new Date().toLocaleDateString()}</p>
                 <p>已启用实时数据联网</p>
              </div>
           </div>
        </div>
      </div>
      
      {/* Floating Action Bar (User Modification Input) */}
      {hasChanges && (
         <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-50 no-print" data-html2canvas-ignore="true">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                        您已选择调整 {rejectedIndices.size} 个项目，请告诉 AI 具体要求：
                    </label>
                    <input 
                       type="text"
                       placeholder="例如：我不想吃辣；这个景点太远了换一个；想要更轻松的安排..."
                       className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                       value={modificationRemark}
                       onChange={(e) => setModificationRemark(e.target.value)}
                    />
                </div>
                <Button 
                   variant="primary" 
                   onClick={handleRegenerateClick} 
                   className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-lg whitespace-nowrap"
                >
                   提交修改需求
                </Button>
            </div>
         </div>
      )}

       {/* Floating Chat Bubble */}
       <div className="fixed bottom-6 right-6 z-40 no-print" data-html2canvas-ignore="true">
         {!isChatOpen && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
            >
               <ChatIcon className="w-6 h-6" />
            </button>
         )}
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 no-print" style={{height: '500px'}} data-html2canvas-ignore="true">
           {/* Header */}
           <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                 <span className="font-medium">AI 旅行助手</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                 <XIcon className="w-5 h-5" />
              </button>
           </div>
           
           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {chatMessages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                       msg.role === 'user' 
                       ? 'bg-blue-600 text-white rounded-tr-none' 
                       : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                       {msg.text}
                    </div>
                 </div>
              ))}
              {isChatLoading && (
                 <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1 items-center">
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                 </div>
              )}
              <div ref={chatEndRef} />
           </div>

           {/* Input */}
           <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="对行程有什么疑问吗？"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button 
                type="submit" 
                disabled={!chatInput.trim() || isChatLoading}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors"
              >
                 <SendIcon className="w-4 h-4" />
              </button>
           </form>
        </div>
      )}
    </div>
  );
};

export default ResultView;