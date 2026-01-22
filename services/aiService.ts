import { TravelFormData, TripPlan, ChatMessage } from "../types";

// Retry helper: 专治 405 和 404，兼容EdgeOne Pages多种函数类型
const retryFetch = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  const baseUrl = url.split('?')[0].replace(/\/$/, ''); // 移除可能的尾部斜杠和查询参数
  const query = url.split('?')[1] ? `?${url.split('?')[1]}` : '';

  let lastError: any;

  // 尝试策略：
  // 1. 原始路径 (/api/chat) - EdgeOne Pages标准路径
  // 2. 带斜杠路径 (/api/chat/) - 兼容某些配置
  // 3. 备用路径 (/edgeone/chat) - 兼容旧版配置
  // 4. 再次尝试原始路径
  const tryUrls = [
    `${baseUrl}${query}`,
    `${baseUrl}/${query}`, 
    `${baseUrl.replace('/api/', '/edgeone/')}${query}`,
    `${baseUrl}${query}`
  ];

  for (let i = 0; i < retries; i++) {
    const currentUrl = tryUrls[i] || tryUrls[0];
    try {
      console.log(`[AI Service] Attempt ${i+1}: POST ${currentUrl}`);
      const res = await fetch(currentUrl, options);
      
      // 如果是 200 OK，直接返回
      if (res.ok) return res;
      
      // 如果是 404 或 405，这通常是路由问题，继续重试下一个 URL 格式
      if (res.status === 404 || res.status === 405) {
        console.warn(`[AI Service] Failed with ${res.status} at ${currentUrl}. Retrying with alternate path...`);
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, 500));
          continue; 
        }
      }
      
      // 其他错误 (500等) 抛出异常
      throw new Error(`HTTP Error ${res.status}`);
      
    } catch (err: any) {
      lastError = err;
      if (i < retries - 1) await new Promise(r => setTimeout(r, 500));
    }
  }
  throw lastError;
};

const callBackendAPI = async (action: 'generate' | 'modify' | 'chat', data: any) => {
  try {
    // EdgeOne Pages边缘函数路径
    const apiUrl = `/api/chat?t=${Date.now()}`;

    const response = await retryFetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: 'no-store',
      body: JSON.stringify({ action, data })
    }, 3);

    if (!response.ok) {
      if (response.status === 404) throw new Error("错误 (404): 未找到API服务。\n可能原因：\n1. EdgeOne Pages边缘函数未正确部署\n2. 检查 edge-functions/api/chat.js 是否存在\n3. 检查 node-functions/api/chat.js 是否存在");
      if (response.status === 405) throw new Error("错误 (405): 请求方法不被允许。\n可能原因：\n1. 请求打到了静态页面而非函数\n2. EdgeOne Pages路由配置问题\n3. 函数文件格式不符合规范\n\n解决方案：\n1. 检查EdgeOne Pages控制台函数部署状态\n2. 确认环境变量 API_KEY 已正确设置");
      
      let msg = `请求失败 (${response.status})`;
      try { const json = await response.json(); if(json.error) msg = json.error; } catch(e){}
      throw new Error(msg);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let resultText = "";
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resultText += decoder.decode(value, { stream: true });
      }
    } else {
      resultText = await response.text();
    }
    return resultText;

  } catch (error: any) {
    console.error("API Error:", error);
    if (error.message.includes("Failed to fetch")) throw new Error("网络连接失败，请检查网络。");
    throw error;
  }
};

const cleanAndParseJSON = (text: string): any => {
    let cleanText = text.trim();
    // 移除 markdown 代码块
    cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').replace(/^```/, '');
    // 移除可能存在的 "data: " 前缀 (SSE 残留)
    cleanText = cleanText.replace(/^data:\s*/, '');
    try { return JSON.parse(cleanText); } 
    catch (e) { throw new Error("AI 数据格式错误，请重试。"); }
};

export const generateTripPlan = async (formData: TravelFormData): Promise<TripPlan> => {
  const rawText = await callBackendAPI('generate', formData);
  return cleanAndParseJSON(rawText) as TripPlan;
};

export const modifyTripPlan = async (currentPlan: TripPlan, rejectedItems: any[], userRemark: string): Promise<TripPlan> => {
  const rawText = await callBackendAPI('modify', { currentPlan, rejectedItems, userRemark });
  return cleanAndParseJSON(rawText) as TripPlan;
};

export const queryTripAssistant = async (currentPlan: TripPlan, chatHistory: ChatMessage[], userMessage: string): Promise<string> => {
  return await callBackendAPI('chat', { currentPlan, chatHistory, userMessage });
};