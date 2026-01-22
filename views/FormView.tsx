import React, { useState, useEffect } from 'react';
import { TravelFormData } from '../types';
import { Button } from '../components/Button';
import { MapPinIcon, CalendarIcon, WalletIcon } from '../components/Icons';

interface FormViewProps {
  onSubmit: (data: TravelFormData) => void;
  error: string | null;
}

// Expanded Travel Styles
const TRAVEL_STYLES = [
  '当地美食', '网红打卡', '历史文化', '自然风光', 
  '休闲度假', '特种兵', '夜生活', '亲子游', 
  '博物馆', '购物血拼', '摄影采风', '探险徒步'
];

const FormView: React.FC<FormViewProps> = ({ onSubmit, error }) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0];

  const [formData, setFormData] = useState<TravelFormData>({
    destination: '',
    origin: '',
    people_count: 2,
    room_count: 1, // Default to 1 room
    budget: 5000,
    start_date: today,
    start_time: '09:00',
    end_date: tomorrow,
    end_time: '18:00',
    is_student: false,
    travel_style: [],
    accommodation_budget: 400, // Default 400
    remarks: ''
  });

  const [durationDays, setDurationDays] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-calculate duration
  useEffect(() => {
    const start = new Date(`${formData.start_date}T${formData.start_time}`);
    const end = new Date(`${formData.end_date}T${formData.end_time}`);
    
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      // If start and end are same day, it counts as 1 day
      setDurationDays(diffDays === 0 ? 1 : diffDays);
    }
  }, [formData.start_date, formData.start_time, formData.end_date, formData.end_time]);

  // Auto-suggest room count when people count changes (Standard 2 people per room)
  useEffect(() => {
    const suggestedRooms = Math.ceil(formData.people_count / 2);
    setFormData(prev => ({ ...prev, room_count: suggestedRooms }));
  }, [formData.people_count]);

  const toggleStyle = (style: string) => {
    setFormData(prev => {
      const exists = prev.travel_style.includes(style);
      if (exists) {
        return { ...prev, travel_style: prev.travel_style.filter(s => s !== style) };
      }
      if (prev.travel_style.length >= 5) return prev; // Max 5 tags
      return { ...prev, travel_style: [...prev.travel_style, style] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.travel_style.length === 0) {
      alert("请至少选择一种旅行风格。");
      return;
    }
    
    if (new Date(`${formData.start_date}T${formData.start_time}`) >= new Date(`${formData.end_date}T${formData.end_time}`)) {
      alert("返程时间必须晚于出发时间。");
      return;
    }

    // Validate Accommodation Budget
    if (formData.accommodation_budget % 100 !== 0) {
      alert("酒店预算必须是 100 的整倍数（例如：300, 400, 1500）。");
      return;
    }

    if (formData.accommodation_budget <= 0) {
       alert("酒店预算必须大于 0。");
       return;
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8 text-center">
        {/* 修改 1: 标题更名为 "TripGenius AI规划" */}
        <h2 className="text-3xl font-bold text-slate-800 font-serif">TripGenius AI规划</h2>
        <p className="text-slate-500 mt-2">基于全网大数据与深度学习，为您定制最地道的个性化旅程。</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <strong>错误：</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
        
        {/* Origin & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-blue-500" /> 出发地 <span className="text-xs text-slate-400 font-normal">（用于推荐交通及优惠）</span>
            </label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="例如：广东佛山"
              value={formData.origin}
              onChange={e => setFormData({...formData, origin: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-red-500" /> 目的地
            </label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="例如：四川成都"
              value={formData.destination}
              onChange={e => setFormData({...formData, destination: e.target.value})}
            />
          </div>
        </div>

        {/* Date & Time Range */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
           <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> 行程时间
              </label>
              <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                共 {durationDays} 天
              </span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">出发日期与时间</span>
                <div className="flex gap-2">
                  <input 
                    type="date" required
                    className="flex-1 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                  />
                  <input 
                    type="time" required
                    className="w-24 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.start_time}
                    onChange={e => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">返程日期与时间</span>
                <div className="flex gap-2">
                  <input 
                    type="date" required
                    className="flex-1 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                  />
                   <input 
                    type="time" required
                    className="w-24 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.end_time}
                    onChange={e => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>
           </div>
        </div>

        {/* Numbers & Overall Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">出行人数</label>
            <input 
              type="number" 
              min="1" max="50" required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.people_count}
              onChange={e => setFormData({...formData, people_count: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <WalletIcon className="w-4 h-4" /> 人均总预算 (含吃喝玩乐)
            </label>
            <div className="relative">
               <span className="absolute left-4 top-3.5 text-slate-400">¥</span>
               <input 
                type="number" 
                min="500" required
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.budget}
                onChange={e => setFormData({...formData, budget: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">身份类型</label>
             <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!formData.is_student ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                  onClick={() => setFormData({...formData, is_student: false})}
                >
                  成人
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.is_student ? 'bg-blue-600 shadow text-white' : 'text-slate-500'}`}
                  onClick={() => setFormData({...formData, is_student: true})}
                >
                  学生
                </button>
             </div>
          </div>
        </div>
        
        {/* Accommodation Specifics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
           <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">房间数</label>
            <input 
              type="number" 
              min="1" max="25" required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.room_count}
              onChange={e => setFormData({...formData, room_count: parseInt(e.target.value)})}
            />
          </div>
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">酒店预算 (每间/每晚)</label>
             <div className="relative">
               <span className="absolute left-4 top-3.5 text-slate-400">¥</span>
               <input
                 type="number"
                 step="100"
                 min="100"
                 required
                 className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="例如：400"
                 value={formData.accommodation_budget}
                 onChange={e => setFormData({...formData, accommodation_budget: parseInt(e.target.value)})}
               />
             </div>
             {/* 修改 2: 提示文字强制分两行显示 */}
             <div className="mt-2 text-xs flex flex-col gap-1">
                <p className="text-slate-500">* 请输入 100 的整倍数</p>
                <p className="text-orange-600">注：基于大数据分析真实房价</p>
             </div>
           </div>
        </div>

        {formData.is_student && <p className="text-xs text-blue-600 -mt-2">AI 将为您检索学生优惠门票信息！</p>}

        {/* Styles */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">旅行风格（可多选）</label>
          <div className="flex flex-wrap gap-3">
            {TRAVEL_STYLES.map(style => {
              const isSelected = formData.travel_style.includes(style);
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced / More Settings */}
        <div className="border-t border-slate-100 pt-4">
           <button 
             type="button"
             onClick={() => setShowAdvanced(!showAdvanced)}
             className="flex items-center text-blue-600 font-medium hover:text-blue-800"
           >
             {showAdvanced ? '收起更多设置' : '更多设置（选填）'} 
             <svg className={`w-4 h-4 ml-1 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
           </button>
           
           {showAdvanced && (
             <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-4">
                  💡 填写越详细，大数据模型匹配的行程越精准！
                </div>
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-2">备注 / 特殊需求</label>
                   <textarea
                     className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                     placeholder="例如：我不吃辣；我想去某个特定的小众景点；需要租车服务等..."
                     value={formData.remarks}
                     onChange={e => setFormData({...formData, remarks: e.target.value})}
                   />
                </div>
             </div>
           )}
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full py-4 text-lg">
            启动 AI 大数据规划
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormView;