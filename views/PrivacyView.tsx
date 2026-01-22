import React from 'react';
import { Button } from '../components/Button';

interface PrivacyViewProps {
  onBack: () => void;
}

const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">隐私政策</h2>
      <div className="prose text-slate-700 space-y-4">
        <p><strong>生效日期：</strong> 2025年5月</p>
        <p>TripGenius 非常重视您的隐私。本政策概述了我们如何处理您的数据。</p>
        
        <h3 className="text-xl font-semibold mt-4">1. 我们收集的信息</h3>
        <p>我们收集您直接提供的信息，例如您的旅行目的地偏好、预算和旅行日期，这些信息仅用于生成您的旅行行程。</p>
        
        <h3 className="text-xl font-semibold mt-4">2. AI 的使用</h3>
        <p>您的数据将由人工智能模型（具体为 Doubao AI）处理以生成旅行计划。数据会安全地传输至 API 提供商。</p>
        
        <h3 className="text-xl font-semibold mt-4">3. 数据保留</h3>
        <p>我们不会在服务器上永久存储您的个人旅行计划。它们是实时生成的并直接传递给您的浏览器。</p>
      </div>
      <div className="mt-8">
        <Button onClick={onBack} variant="outline">返回登录</Button>
      </div>
    </div>
  );
};

export default PrivacyView;