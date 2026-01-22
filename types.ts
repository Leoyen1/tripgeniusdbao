
export interface TravelFormData {
  destination: string;
  origin: string; 
  people_count: number;
  room_count: number; // New: Number of hotel rooms
  budget: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  is_student: boolean; 
  travel_style: string[];
  accommodation_budget: number; // Changed: User input specific budget (multiple of 100)
  remarks: string; 
}

export interface BudgetItem {
  item: string;
  cost_per_person: string; // New: Split cost
  cost_total: string;      // New: Split cost
  remark: string;
}

export interface AccommodationDetail {
  name: string;
  price_category: string; // New: "奢华", "舒适", "经济"
  address: string;
  features: string[]; 
  booking_info: string; 
}

export interface RestaurantRecommendation {
  name: string;
  type: string; 
  cost: string; 
  reason: string; 
  is_backup?: boolean; // New: Mark if this is an alternative option
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  transport_detail?: string;
  location: string;
  cost_per_person: string; // New: Detailed cost
  cost_total: string;      // New: Detailed cost
  tips?: string;
  restaurants?: RestaurantRecommendation[]; 
}

export interface DailyPlan {
  day: number;
  date_display?: string; 
  weather?: string; 
  temperature?: string; // New: Temperature range (e.g. "20°C - 25°C")
  theme?: string;
  highlight_tag?: string; // New: A catchy tag for the day (e.g. "出片神地")
  editor_comment?: string; // New: Emotional, personalized recommendation reason
  activities: Activity[];
}

export interface OutboundInfo {
  required: boolean;
  visa_info?: string;
  currency_info?: string;
  timezone_info?: string;
  adapter_info?: string; 
  embassy_phone?: string;
}

export interface TripPlan {
  title: string; 
  sub_title: string; 
  destination: string;
  summary: string;
  
  // New: The logic behind the AI's design
  recommendation_logic: string;

  travel_date_range: string; 
  members_note: string; 
  
  // Budget Table
  budget_total_per_person: string;
  budget_total_team: string; // New: Total for the whole group
  budget_breakdown: BudgetItem[];

  // Precautions
  important_notes: string[]; 

  // Outbound info
  outbound_info?: OutboundInfo;

  daily_plan: DailyPlan[];
  
  // Attachments
  packing_list: string[];
  accommodation_info: AccommodationDetail[];
  transport_tips: string[]; 

  // Real-world data references
  references?: { title: string; url: string }[];
}

export enum AppView {
  LOGIN = 'LOGIN',
  PRIVACY = 'PRIVACY',
  MERCHANT = 'MERCHANT',
  FORM = 'FORM',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
}

export interface GenerationStep {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}