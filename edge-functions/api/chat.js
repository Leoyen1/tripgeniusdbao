/**
 * TripGenius EdgeOne Pages Edge Function
 * 路径：/api/chat
 * 符合EdgeOne Pages边缘函数规范：export default function onRequest(context)
 */

export default async function onRequest(context) {
  const { request, env } = context;
  
  // 设置CORS头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // 处理OPTIONS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  // 只允许POST请求
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // 获取环境变量
    const API_KEY = env.API_KEY;
    const MODEL_ID = env.DOUBAO_MODEL_ID || 'Doubao-Seed-1.6-flash';

    if (!API_KEY) {
      return new Response(JSON.stringify({ 
        error: '服务器配置错误：缺少API_KEY环境变量' 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }

    // 解析请求体
    const { action, data } = await request.json();

    // 辅助函数：天气代码转换
    function wmoCodeToChinese(code) {
      if (code === 0) return "晴朗";
      if (code >= 1 && code <= 3) return "多云";
      if (code === 45 || code === 48) return "雾/霾";
      if (code >= 51 && code <= 55) return "毛毛雨";
      if (code >= 56 && code <= 57) return "冻雨";
      if (code >= 61 && code <= 65) return "降雨";
      if (code >= 66 && code <= 67) return "强冻雨";
      if (code >= 71 && code <= 77) return "降雪";
      if (code >= 80 && code <= 82) return "阵雨";
      if (code >= 85 && code <= 86) return "阵雪";
      if (code >= 95) return "雷雨";
      if (code >= 96 && code <= 99) return "雷暴伴冰雹";
      return "多云";
    }

    // 获取目的地坐标
    async function getDestinationCoords(city) {
      try {
        const cleanCity = city.replace(/(市|县|区)$/g, "");
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=zh&format=json`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return { 
            lat: data.results[0].latitude, 
            lon: data.results[0].longitude, 
            name: data.results[0].name 
          };
        }
      } catch (e) {
        console.error("Geocoding failed:", e);
      }
      return null;
    }

    // 获取真实天气数据
    async function getRealWeather(lat, lon, startDate, endDate) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${startDate}&end_date=${endDate}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        
        const data = await res.json();
        if (!data.daily) return null;

        let weatherReport = "【官方实时气象台数据】：\n";
        const daily = data.daily;
        
        for (let i = 0; i < daily.time.length; i++) {
          const date = daily.time[i];
          const maxT = daily.temperature_2m_max[i];
          const minT = daily.temperature_2m_min[i];
          const weather = wmoCodeToChinese(daily.weather_code[i]);
          weatherReport += `- ${date}: ${weather}, ${minT}°C 至 ${maxT}°C\n`;
        }
        return weatherReport;
      } catch (e) {
        console.error("Weather fetch failed:", e);
        return null;
      }
    }

    // JSON结构指令
    const JSON_STRUCTURE_INSTRUCTION = `
请严格按照以下 JSON 格式输出，不要包含任何 markdown 代码块标记（如 \\`\\`\\`json），只返回纯 JSON 字符串：

{
  "title": "旅行标题",
  "sub_title": "副标题",
  "destination": "目的地",
  "summary": "一段精彩的行程总结",
  "recommendation_logic": "推荐逻辑（基于天气、预算等的分析）",
  "travel_date_range": "日期范围",
  "members_note": "人员构成备注",
  "budget_total_per_person": "人均总预算",
  "budget_total_team": "团队总预算",
  "budget_breakdown": [
    { "item": "项目名", "cost_per_person": "人均花费", "cost_total": "总花费", "remark": "备注" }
  ],
  "important_notes": ["注意事项1", "注意事项2"],
  "daily_plan": [
    {
      "day": 1,
      "date_display": "日期",
      "weather": "天气（必须使用提供的实时数据）",
      "temperature": "温度范围（必须使用提供的实时数据）",
      "theme": "当日主题",
      "highlight_tag": "亮点标签",
      "editor_comment": "小编点评",
      "activities": [
        {
          "time": "时间",
          "title": "活动名称",
          "description": "详细描述",
          "transport_detail": "交通耗时",
          "location": "地点",
          "cost_per_person": "人均费用",
          "cost_total": "总费用",
          "tips": "贴士",
          "restaurants": [
            { "name": "餐厅名", "type": "菜系", "cost": "人均", "reason": "推荐理由", "is_backup": false }
          ]
        }
      ]
    }
  ],
  "packing_list": ["物品1", "物品2"],
  "accommodation_info": [
    {
      "name": "酒店名",
      "price_category": "舒适/奢华/经济",
      "address": "地址",
      "features": ["特点1"],
      "booking_info": "具体价格（必须符合用户预算）"
    }
  ],
  "references": [
    { "title": "数据来源", "url": "网址" }
  ]
}
`;

    const SYSTEM_INSTRUCTION = `
你是 TripGenius，由 **Doubao-Seed-1.6-flash** 驱动的顶级旅行规划专家。
请始终使用 **简体中文** 回复。

**核心原则与指令**：
1. **真实天气强制执行**：
   - 系统将为你提供【官方实时气象台数据】。
   - 你生成的 JSON 中，daily_plan 里的 \\`weather\\` 和 \\`temperature\\` 字段 **必须** 直接复制这些真实数据，严禁自行编造或使用模糊描述。
   - 如果遇到雨天，行程安排必须推荐室内活动或备选方案。

2. **预算严格执法 (Critical)**：
   - 用户的【住宿预算】是硬性指标。
   - **严格匹配**：酒店的 \\`booking_info\\` 价格必须在用户预算的 **±20%** 范围内。
   - 错误示例：用户预算 400元，你推荐 1200元的酒店（❌ 绝对禁止）。
   - 正确示例：用户预算 400元，你推荐 350元-450元的酒店（✅ 正确）。
   - 如果该价格段很难找到豪华酒店，请诚实推荐高评分的经济型酒店或民宿，并在 \\`recommendation_logic\\` 中说明。

3. **完整性**：确保所有字段都有值。严禁输出多余的寒暄语，只输出 JSON。

${JSON_STRUCTURE_INSTRUCTION}
`;

    let messages = [];
    let realWeatherContext = "";

    // 根据action类型构建消息
    if (action === 'generate' && data.destination && data.start_date && data.end_date) {
      const coords = await getDestinationCoords(data.destination);
      if (coords) {
        const weather = await getRealWeather(coords.lat, coords.lon, data.start_date, data.end_date);
        if (weather) {
          realWeatherContext = `\n\n=== ⚠️ 必须使用的实时数据 ===\n${weather}\n请根据上述具体的每日天气安排行程。`;
        }
      }
    }

    if (action === 'generate') {
      const formData = data;
      const userPrompt = `
        请为我生成一份去 ${formData.destination} 的旅行计划。
        参数: ${formData.start_date}至${formData.end_date}, ${formData.people_count}人, 住宿预算${formData.accommodation_budget}元, 总预算${formData.budget}元/人, 风格${formData.travel_style.join(",")}.
        备注: ${formData.remarks || "无"}
        ${realWeatherContext}
        请生成详细 JSON。
      `;
      messages = [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: userPrompt }
      ];
    } else if (action === 'modify') {
      const { currentPlan, rejectedItems, userRemark } = data;
      const rejectedDesc = rejectedItems.map(item => `第 ${item.day} 天: ${item.activityTitle}`).join(", ");
      const planContext = JSON.stringify(currentPlan).slice(0, 15000);
      messages = [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: `原计划参考: ${planContext}... \\n\\n 用户移除: ${rejectedDesc}。反馈: "${userRemark}"。请重新规划。` }
      ];
    } else if (action === 'chat') {
      const { currentPlan, chatHistory, userMessage } = data;
      const systemContext = `你是一个旅行助手。基于此计划回答: ${JSON.stringify(currentPlan).slice(0, 8000)}...`;
      const recentHistory = (chatHistory || []).slice(-6).map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user', 
        content: m.text
      }));
      messages = [
        { role: "system", content: systemContext },
        ...recentHistory,
        { role: "user", content: userMessage }
      ];
    }

    // 调用火山引擎API
    const upstreamResponse = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: messages,
        temperature: 0.5,
        stream: true
      })
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      return new Response(JSON.stringify({ 
        error: `AI 服务调用失败: ${upstreamResponse.status} ${errText}` 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }

    // 返回流式响应
    return new Response(upstreamResponse.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ 
      error: `服务器内部错误: ${error.message}` 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }
}