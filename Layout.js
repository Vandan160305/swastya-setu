import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Doctor } from "@/entities/Doctor";
import {
  Heart,
  Stethoscope,
  Calendar,
  FileSearch,
  MessageCircle,
  Settings,
  LogOut,
  Globe,
  Menu,
  X,
  Shield,
  LayoutDashboard
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toaster";

// --- START: Language Context and Translations ---
const translations = {
  en: {
    "dashboard_welcome": "Welcome to your health dashboard",
    "quick_actions": "Quick Actions",
    "ai_health_assistant": "AI Health Assistant",
    "ai_assistant_desc": "Get instant medical guidance",
    "book_appointment": "Book Appointment",
    "book_appointment_desc": "Schedule with a doctor",
    "disease_predictor": "Disease Predictor",
    "disease_predictor_desc": "Analyze your symptoms",
    "recent_appointments": "Recent Appointments",
    "view_all": "View All",
    "no_appointments_yet": "No appointments yet",
    "book_first_appointment": "Book Your First Appointment",
    "my_appointments": "My Appointments",
    "admin_panel": "Admin Panel",
    "healthcare": "Healthcare",
    "account": "Account",
    "logout": "Logout",
    "loading_swastya_setu": "Loading Swastya-Setu...",
    "manage_doctors": "Manage Doctors",
    "all_appointments": "All Appointments",
    "admin_dashboard": "Admin Dashboard",
    "doctor_dashboard": "Doctor Dashboard"
  },
  hi: {
    "dashboard_welcome": "आपके स्वास्थ्य डैशबोर्ड में आपका स्वागत है",
    "quick_actions": "त्वरित कार्रवाई",
    "ai_health_assistant": "एआई स्वास्थ्य सहायक",
    "ai_assistant_desc": "तुरंत चिकित्सा मार्गदर्शन प्राप्त करें",
    "book_appointment": "अपॉइंटमेंट बुक करें",
    "book_appointment_desc": "डॉक्टर के साथ शेड्यूल करें",
    "disease_predictor": "रोग भविष्यवक्ता",
    "disease_predictor_desc": "अपने लक्षणों का विश्लेषण करें",
    "recent_appointments": "हाल के अपॉइंटमेंट",
    "view_all": "सभी देखें",
    "no_appointments_yet": "अभी तक कोई अपॉइंटमेंट नहीं है",
    "book_first_appointment": "अपना पहला अपॉइंटमेंट बुक करें",
    "my_appointments": "मेरे अपॉइंटमेंट्स",
    "admin_panel": "एडमिन पैनल",
    "healthcare": "स्वास्थ्य सेवा",
    "account": "खाता",
    "logout": "लॉगआउट",
    "loading_swastya_setu": "स्वास्थ्य-सेतु लोड हो रहा है...",
    "manage_doctors": "डॉक्टरों का प्रबंधन करें",
    "all_appointments": "सभी अपॉइंटमेंट्स",
    "admin_dashboard": "एडमिन डैशबोर्ड",
    "doctor_dashboard": "डॉक्टर डैशबोर्ड"
  },
  bn: {
    "dashboard_welcome": "আপনার স্বাস্থ্য ড্যাশবোর্ডে স্বাগতম",
    "quick_actions": "দ্রুত পদক্ষেপ",
    "ai_health_assistant": "এআই স্বাস্থ্য সহকারী",
    "ai_assistant_desc": "তাৎক্ষণিক চিকিৎসা নির্দেশিকা পান",
    "book_appointment": "অ্যাপয়েন্টমেন্ট বুক করুন",
    "book_appointment_desc": "ডাক্তারের সাথে সময়সূচী করুন",
    "disease_predictor": "রোগ ভবিষ্যদ্বাণীকারী",
    "disease_predictor_desc": "আপনার লক্ষণ বিশ্লেষণ করুন",
    "recent_appointments": "সাম্প্রতিক অ্যাপয়েন্টমেন্ট",
    "view_all": "সব দেখুন",
    "no_appointments_yet": "এখনও কোনো অ্যাপয়েন্টমেন্ট নেই",
    "book_first_appointment": "আপনার প্রথম অ্যাপয়েন্টমেন্ট বুক করুন",
    "my_appointments": "আমার অ্যাপয়েন্টমেন্ট",
    "admin_panel": "অ্যাডমিন প্যানেল",
    "healthcare": "স্বাস্থ্যসেবা",
    "account": "অ্যাকাউন্ট",
    "logout": "লগআউট",
    "loading_swastya_setu": "স্বাস্থ্য-সেতু লোড হচ্ছে...",
    "manage_doctors": "চিকিৎসক পরিচালনা করুন",
    "all_appointments": "সকল অ্যাপয়েন্টমেন্ট",
    "admin_dashboard": "অ্যাডমিন ড্যাশবোর্ড",
    "doctor_dashboard": "ডাক্তার ড্যাশবোর্ড"
  },
  ta: {
    "dashboard_welcome": "உங்கள் சுகாதார டாஷ்போர்டுக்கு வரவேற்கிறோம்",
    "quick_actions": "விரைவு நடவடிக்கைகள்",
    "ai_health_assistant": "AI சுகாதார உதவியாளர்",
    "ai_assistant_desc": "உடனடி மருத்துவ வழிகாட்டுதல் பெறுங்கள்",
    "book_appointment": "சந்திப்பை பதிவு செய்யவும்",
    "book_appointment_desc": "மருத்துவருடன் திட்டமிடுங்கள்",
    "disease_predictor": "நோய் முன்கணிப்பு",
    "disease_predictor_desc": "உங்கள் அறிகுறிகளை பகுப்பாய்வு செய்யுங்கள்",
    "recent_appointments": "சமீபத்திய சந்திப்புகள்",
    "view_all": "அனைத்தையும் காட்டு",
    "no_appointments_yet": "சந்திப்புகள் இன்னும் இல்லை",
    "book_first_appointment": "உங்கள் முதல் சந்திப்பை பதிவு செய்யுங்கள்",
    "my_appointments": "என் சந்திப்புகள்",
    "admin_panel": "நிர்வாக குழு",
    "healthcare": "சுகாதார பராமரிப்பு",
    "account": "கணக்கு",
    "logout": "வெளியேறு",
    "loading_swastya_setu": "ஸ்வஸ்த்ய-சேது ஏற்றுகிறது...",
    "manage_doctors": " மருத்துவர்களை நிர்வகிக்கவும்",
    "all_appointments": "அனைத்து சந்திப்புகளும்",
    "admin_dashboard": "நிர்வாகி டாஷ்போர்டு",
    "doctor_dashboard": "மருத்துவர் டாஷ்போர்டு"
  },
  mr: {
    "dashboard_welcome": "तुमच्या आरोग्य डॅशबोर्डमध्ये स्वागत आहे",
    "quick_actions": "त्वरित क्रिया",
    "ai_health_assistant": "एआय आरोग्य सहाय्यक",
    "ai_assistant_desc": "त्वरित वैद्यकीय मार्गदर्शन मिळवा",
    "book_appointment": "अपॉइंटमेंट बुक करा",
    "book_appointment_desc": "डॉक्टरसोबत शेड्यूल करा",
    "disease_predictor": "रोग 예측क",
    "disease_predictor_desc": "तुमच्या लक्षणांचे विश्लेषण करा",
    "recent_appointments": "अलीकडील अपॉइंटमेंट्स",
    "view_all": "सर्व पहा",
    "no_appointments_yet": "अद्याप अपॉइंटमेंट नाहीत",
    "book_first_appointment": "तुमची पहिली अपॉइंटमेंट बुक करा",
    "my_appointments": "माझ्या भेटी",
    "admin_panel": "प्रशासक पॅनेल",
    "healthcare": "आरोग्यसेवा",
    "account": "खाते",
    "logout": "लॉगआउट",
    "loading_swastya_setu": "स्वास्थ्य-सेतू लोड होत आहे...",
    "manage_doctors": "डॉक्टरांचे व्यवस्थापन करा",
    "all_appointments": "सर्व भेटी",
    "admin_dashboard": "प्रशासक डॅशबोर्ड",
    "doctor_dashboard": "डॉक्टर डॅशबोर्ड"
  },
  gu: {
    "dashboard_welcome": "તમારા સ્વાસ્થ્ય ડેશબોર્ડ પર આપનું સ્વાગત છે",
    "quick_actions": "ઝડપી ક્રિયાઓ",
    "ai_health_assistant": "AI સ્વાસ્થ્ય સહાયક",
    "ai_assistant_desc": "તાત્કાલિક તબીબી માર્ગદર્શન મેળવો",
    "book_appointment": "એપોઇન્ટમેન્ટ બુક કરો",
    "book_appointment_desc": "ડૉક્ટર સાથે શેડ્યૂલ કરો",
    "disease_predictor": "રોગ આગાહીકાર",
    "disease_predictor_desc": "તમારા લક્ષણોનું વિશ્લેષણ કરો",
    "recent_appointments": "તાજેતરની એપોઇન્ટમેન્ટ્સ",
    "view_all": "બધા જુઓ",
    "no_appointments_yet": "હજી સુધી કોઈ એપોઇન્ટમેન્ટ નથી",
    "book_first_appointment": "તમારી પ્રથમ એપોઇન્ટમેન્ટ બુક કરો",
    "my_appointments": "મારી નિમણૂંકો",
    "admin_panel": "એડમિન પેનલ",
    "healthcare": "આરોગ્ય સંભાળ",
    "account": "ખાતું",
    "logout": "લૉગઆઉટ",
    "loading_swastya_setu": "સ્વાસ્થ્ય-સેતુ લોડ કરી રહ્યું છે...",
    "manage_doctors": "ડૉક્ટરોનું સંચાલન કરો",
    "all_appointments": "બધી નિમણૂંકો",
    "admin_dashboard": "એડમિન ડેશબોર્ડ",
    "doctor_dashboard": "ડૉક્ટર ડેશબોર્ડ"
  },
  kn: {
    "dashboard_welcome": "ನಿಮ್ಮ ಆರೋಗ್ಯ ಡ್ಯಾಶ್ಬೋರ್ಡ್ಗೆ ಸ್ವಾಗತ",
    "quick_actions": "ತ್ವರಿತ ಕ್ರಮಗಳು",
    "ai_health_assistant": "AI ಆರೋಗ್ಯ ಸಹಾಯಕ",
    "ai_assistant_desc": "ತಕ್ಷಣದ ವೈದ್ಯಕೀಯ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ",
    "book_appointment": "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
    "book_appointment_desc": "ವೈದ್ಯರೊಂದಿಗೆ ನಿಗದಿಪಡಿಸಿ",
    "disease_predictor": "ರೋಗ ಮುನ್ಸೂಚಕ",
    "disease_predictor_desc": "ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    "recent_appointments": "ಇತ್ತೀಚಿನ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ಗಳು",
    "view_all": "ಎಲ್ಲವನ್ನು ನೋಡು",
    "no_appointments_yet": "ಇನ್ನೂ ಯಾವುದೇ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ಗಳಿಲ್ಲ",
    "book_first_appointment": "ನಿಮ್ಮ ಮೊದಲ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
    "my_appointments": "ನನ್ನ ನೇಮಕಾತಿಗಳು",
    "admin_panel": "ನಿರ್ವಾಹಕ ಫಲಕ",
    "healthcare": "ಆರೋಗ್ಯ ರಕ್ಷಣೆ",
    "account": "ಖಾತೆ",
    "logout": "ಲಾಗ್ ಔಟ್",
    "loading_swastya_setu": "ಸ್ವಾಸ್ಥ್ಯ-ಸೇತು ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "manage_doctors": "ವೈದ್ಯರನ್ನು ನಿರ್ವಹಿಸಿ",
    "all_appointments": "ಎಲ್ಲಾ ನೇಮಕಾತಿಗಳು",
    "admin_dashboard": "ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "doctor_dashboard": "ವೈದ್ಯರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"
  },
  te: {
    "dashboard_welcome": "మీ ఆరోగ్య డాష్‌బోర్డ్‌కు స్వాగతం",
    "quick_actions": "త్వరిత చర్యలు",
    "ai_health_assistant": "AI ఆరోగ్య సహాయకుడు",
    "ai_assistant_desc": "తక్షణ వైద్య మార్గదర్శకత్వం పొందండి",
    "book_appointment": "అపాయింట్‌మెంట్ బుక్ చేయండి",
    "book_appointment_desc": "డాక్టర్‌తో షెడ్యూల్ చేయండి",
    "disease_predictor": "వ్యాధి ప్రిడిక్టర్",
    "disease_predictor_desc": "మీ లక్షణాలను విశ్లేషించండి",
    "recent_appointments": "ఇటీవలి అపాయింట్‌మెంట్‌లు",
    "view_all": "అన్నీ చూడండి",
    "no_appointments_yet": "ఇంకా అపాయింట్‌మెంట్‌లు లేవు",
    "book_first_appointment": "మీ మొదటి అపాయింట్‌మెంట్ బుక్ చేయండి",
    "my_appointments": "నా నియామకాలు",
    "admin_panel": "అడ్మిన్ ప్యానెల్",
    "healthcare": "ఆరోగ్య సంరక్షణ",
    "account": "ఖాతా",
    "logout": "లాగ్ అవుట్",
    "loading_swastya_setu": "స్వాస్థ్య-సేతు లోడ్ అవుతోంది...",
    "manage_doctors": "వైద్యులను నిర్వహించండి",
    "all_appointments": "అన్ని నియామకాలు",
    "admin_dashboard": "అడ్మిన్ డాష్‌బోర్డ్",
    "doctor_dashboard": "డాక్టర్ డాష్‌బోర్డ్"
  },
  ml: {
    "dashboard_welcome": "നിങ്ങളുടെ ഹെൽത്ത് ഡാഷ്‌ബോർഡിലേക്ക് സ്വാഗതം",
    "quick_actions": "വേഗത്തിലുള്ള പ്രവർത്തനങ്ങൾ",
    "ai_health_assistant": "AI ഹെൽത്ത് അസിസ്റ്റന്റ്",
    "ai_assistant_desc": "ഉടനടി വൈദ്യസഹായം നേടുക",
    "book_appointment": "അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക",
    "book_appointment_desc": "ഡോക്ടറുമായി ഷെഡ്യൂൾ ചെയ്യുക",
    "disease_predictor": "രോഗ പ്രവചകൻ",
    "disease_predictor_desc": "നിങ്ങളുടെ രോഗലക്ഷണങ്ങൾ വിശകലനം ചെയ്യുക",
    "recent_appointments": "സമീപകാല അപ്പോയിന്റ്മെന്റുകൾ",
    "view_all": "എല്ലാം കാണുക",
    "no_appointments_yet": "അപ്പോയിന്റ്മെന്റുകൾ ഒന്നുമില്ല",
    "book_first_appointment": "നിങ്ങളുടെ ആദ്യ അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക",
    "my_appointments": "എന്റെ കൂടിക്കാഴ്‌ചകൾ",
    "admin_panel": "അഡ്മിൻ പാനൽ",
    "healthcare": "ആരോഗ്യ പരിപാലനം",
    "account": "അക്കൗണ്ട്",
    "logout": "ലോഗ് ഔട്ട്",
    "loading_swastya_setu": "സ്വാസ്ഥ്യ-സേതു ലോഡ് ചെയ്യുന്നു...",
    "manage_doctors": "ഡോക്ടർമാരെ നിയന്ത്രിക്കുക",
    "all_appointments": "എല്ലാ കൂടിക്കാഴ്‌ചകളും",
    "admin_dashboard": "അഡ്മിൻ ഡാഷ്‌ബോർഡ്",
    "doctor_dashboard": "ഡോക്ടർ ഡാഷ്‌ബോർഡ്"
  },
  pa: {
    "dashboard_welcome": "ਤੁਹਾਡੇ ਸਿਹਤ ਡੈਸ਼ਬੋਰਡ ਵਿੱਚ ਸੁਆਗਤ ਹੈ",
    "quick_actions": "ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ",
    "ai_health_assistant": "AI ਸਿਹਤ ਸਹਾਇਕ",
    "ai_assistant_desc": "ਤੁਰੰਤ ਡਾਕਟਰੀ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਾਪਤ ਕਰੋ",
    "book_appointment": "ਅਪாயଣ୍ਟਮੈਂਟ ਬੁੱਕ ਕਰੋ",
    "book_appointment_desc": "ਡਾਕਟਰ ਨਾਲ ਸਮਾਂ-ਸਾਰਣੀ ਬਣਾਓ",
    "disease_predictor": "ਬਿਮਾਰੀ ਭਵਿੱਖਬਾਣੀ",
    "disease_predictor_desc": "ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
    "recent_appointments": "ਹਾਲੀਆ ਅਪாயଣ୍ਟਮੈਂਟਾਂ",
    "view_all": "ਸਾਰੇ ਦੇਖੋ",
    "no_appointments_yet": "ਅਜੇ ਤੱਕ ਕੋਈ ਅਪாயଣ୍ਟਮੈਂਟ ਨਹੀਂ",
    "book_first_appointment": "ਆਪਣੀ ਪਹਿਲੀ ਅਪாயଣ୍ਟਮੈਂਟ ਬੁੱਕ ਕਰੋ",
    "my_appointments": "ਮੇਰੀਆਂ ਮੁਲਾਕਾਤਾਂ",
    "admin_panel": "ਐਡਮਿਨ ਪੈਨਲ",
    "healthcare": "ਸਿਹਤ ਸੰਭਾਲ",
    "account": "ਖਾਤਾ",
    "logout": "ਲਾੱਗ ਆਊਟ",
    "loading_swastya_setu": "ਸਵਾਸਥਯ-ਸੇਤੁ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    "manage_doctors": "ਡਾਕਟਰਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ",
    "all_appointments": "ਸਾਰੀਆਂ ਮੁਲਾਕਾਤਾਂ",
    "admin_dashboard": "ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ",
    "doctor_dashboard": "ਡਾਕਟਰ ਡੈਸ਼ਬੋਰਡ"
  }
};

const LanguageContext = createContext();

export function useTranslation() {
  return useContext(LanguageContext);
}

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('english'); // Stores full language name (e.g., "english", "hindi")

  const getLangCode = (lang) => {
    switch (lang) {
      case 'hindi': return 'hi';
      case 'bengali': return 'bn';
      case 'tamil': return 'ta';
      case 'marathi': return 'mr';
      case 'gujarati': return 'gu';
      case 'kannada': return 'kn';
      case 'telugu': return 'te';
      case 'malayalam': return 'ml';
      case 'punjabi': return 'pa';
      case 'english':
      default: return 'en';
    }
  };
  
  const [langCode, setLangCode] = useState(getLangCode(language));

  useEffect(() => {
    setLangCode(getLangCode(language));
  }, [language]);

  const t = useCallback((key) => {
    return translations[langCode]?.[key] || translations['en']?.[key] || key;
  }, [langCode]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
// --- END: Language Context and Translations ---


const languages = {
  english: "English",
  hindi: "हिंदी",
  bengali: "বাংলা",
  tamil: "தமிழ்",
  marathi: "मराठी",
  gujarati: "ગુજરાતી",
  kannada: "ಕನ್ನಡ",
  telugu: "తెలుగు",
  malayalam: "മലയാളം",
  punjabi: "ਪੰਜਾਬੀ"
};

const userNavigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    t_key: "dashboard_welcome"
  },
  {
    title: "AI Assistant",
    url: createPageUrl("AIAssistant"),
    icon: MessageCircle,
    t_key: "ai_health_assistant"
  },
  {
    title: "Book Appointment",
    url: createPageUrl("BookAppointment"),
    icon: Calendar,
    t_key: "book_appointment"
  },
   {
    title: "Disease Predictor",
    url: createPageUrl("DiseasePredictor"),
    icon: FileSearch,
    t_key: "disease_predictor"
  },
  {
    title: "My Appointments",
    url: createPageUrl("MyAppointments"),
    icon: Stethoscope,
    t_key: "my_appointments"
  }
];

const doctorNavigationItems = [
    {
        title: "Doctor Dashboard",
        url: createPageUrl("DoctorDashboard"),
        icon: LayoutDashboard,
        t_key: "doctor_dashboard"
    }
];

const adminNavigationItems = [
  {
    title: "Admin Dashboard",
    url: createPageUrl("AdminDashboard"),
    icon: Shield,
    t_key: "admin_dashboard"
  },
  {
    title: "Manage Doctors",
    url: createPageUrl("ManageDoctors"),
    icon: Stethoscope,
    t_key: "manage_doctors"
  },
  {
    title: "All Appointments",
    url: createPageUrl("AllAppointments"),
    icon: Calendar,
    t_key: "all_appointments"
  }
];

function AppLayout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('patient'); // patient, doctor, admin
  const [isLoading, setIsLoading] = useState(true);
  const { language, setLanguage, t } = useTranslation();
  
  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const isPublicPage = ["Guest", "CompleteProfile"].includes(currentPageName);
    try {
      const userData = await User.me();
      setUser(userData);
      setLanguage(userData.preferred_language || "english");

      // Determine user role
      if (userData.email === "admin@swastyasetu.com") {
        setUserRole("admin");
      } else {
        const doctorProfile = await Doctor.filter({ user_email: userData.email });
        if (doctorProfile.length > 0) {
          setUserRole("doctor");
          // if doctor just signed up, maybe redirect to a doctor profile completion page
        } else {
          setUserRole("patient");
        }
      }
      
      // If user profile is incomplete (and they are a patient), redirect to completion page
      if (userRole === 'patient' && !userData.phone && currentPageName !== "CompleteProfile") {
        navigate(createPageUrl("CompleteProfile"));
      }

    } catch (error) {
      if (!isPublicPage) navigate(createPageUrl("Guest"));
    }
    setIsLoading(false);
  }, [navigate, currentPageName, setLanguage, userRole]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl("Guest"));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const changeLanguage = async (languageKey) => {
    setLanguage(languageKey);
    if (user) {
      try {
        await User.updateMyUserData({ preferred_language: languageKey });
      } catch (error) {
        console.error("Failed to update user language preference:", error);
      }
    }
  };

  const getNavigationItems = () => {
      switch (userRole) {
          case 'admin': return adminNavigationItems;
          case 'doctor': return doctorNavigationItems;
          default: return userNavigationItems;
      }
  }

  const navigationItems = getNavigationItems();

  const isGuestPage = currentPageName === "Guest";
  const isProfileCompletionPage = currentPageName === "CompleteProfile";
  const isChatPage = currentPageName === "Chat";


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-700">{t("loading_swastya_setu")}</span>
        </div>
      </div>
    );
  }

  if (isGuestPage || isProfileCompletionPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: 251, 146, 60;
          --primary-dark: 234, 88, 12;
          --secondary: 34, 197, 94;
          --accent: 59, 130, 246;
          --background: 255, 251, 235;
          --surface: 255, 255, 255;
          --text: 31, 41, 55;
          --text-muted: 107, 114, 128;
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 via-white to-green-50">
        <Sidebar className="border-r border-orange-200">
          <SidebarHeader className="border-b border-orange-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">स्वास्थ्य-सेतु</h2>
                <p className="text-xs text-orange-600 font-medium">Swastya-Setu</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                {userRole === 'admin' ? t("admin_panel") : (userRole === 'doctor' ? 'Doctor Panel' : t("healthcare"))}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-orange-50 text-orange-700 font-bold' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{t(item.t_key)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                {t("account")}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full flex items-center gap-2 justify-start">
                        <Globe className="w-4 h-4" />
                        {languages[language]}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {Object.entries(languages).map(([key, value]) => (
                        <DropdownMenuItem key={key} onClick={() => changeLanguage(key)}>
                          {value}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 justify-start hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-orange-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                {userRole !== 'patient' && (
                  <Badge variant="secondary" className="text-xs mt-1 bg-orange-100 text-orange-700 capitalize">
                    {userRole}
                  </Badge>
                )}
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className={`flex-1 flex flex-col ${isChatPage ? 'h-screen' : ''}`}>
          {/* Mobile Header */}
          <header className="bg-white/90 backdrop-blur-md border-b border-orange-200 px-4 py-3 md:hidden">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="hover:bg-orange-100 p-2 rounded-lg transition-colors duration-200" />
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-orange-500" />
                <h1 className="text-lg font-bold">स्वास्थ्य-सेतु</h1>
              </div>
              <div className="w-8 h-8"></div>
            </div>
          </header>

          {/* Main content area */}
          <div className={`flex-1 ${isChatPage ? 'flex flex-col overflow-hidden' : 'overflow-auto'}`}>
            {children}
            <Toaster />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function LayoutWrapper(props) {
  return (
    <LanguageProvider>
      <AppLayout {...props} />
    </LanguageProvider>
  );
}