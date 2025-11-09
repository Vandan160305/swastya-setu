
import React, { useState, useEffect, useRef, useCallback } from "react";
import { User } from "@/entities/User";
import { AIConsultation } from "@/entities/AIConsultation";
import { Doctor } from "@/entities/Doctor";
import { InvokeLLM, UploadFile } from "@/integrations/Core"; // Kept UploadFile as it's used in handleImageUpload and outline implied adding/changing others, not removing this functional dependency without replacement.
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Replaced Input with Textarea
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Kept Badge as it is used and not specified for removal.
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added AlertTitle
import { ScrollArea } from "@/components/ui/scroll-area"; // Added ScrollArea
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Added Avatar components
import { useTranslation } from "@/layout"; // Added useTranslation
import {
  MessageCircle,
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  Calendar,
  AlertTriangle,
  Heart,
  Bot,
  User as UserIcon,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AIAssistant() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null); // Not used in current code, but present in original file. Kept.
  const recognitionRef = useRef(null);

  const { t } = useTranslation(); // Added useTranslation hook call

  const initializeAssistant = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Add welcome message
      const welcomeMessage = getWelcomeMessage(userData.preferred_language || 'english');
      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error("Error initializing AI assistant:", error);
    }
  }, []);

  const setupSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = getLanguageCode(user?.preferred_language || 'english');

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [user?.preferred_language]);

  useEffect(() => {
    initializeAssistant();
    setupSpeechRecognition();
  }, [initializeAssistant, setupSpeechRecognition]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getWelcomeMessage = (language) => {
    // This could potentially use `t()` from useTranslation for more robust i18n
    const welcomeMessages = {
      english: "Hello! I'm your AI Health Assistant. I can help you understand your symptoms, provide health guidance, and suggest when to see a doctor. How are you feeling today?",
      hindi: "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं। मैं आपके लक्षणों को समझने, स्वास्थ्य मार्गदर्शन प्रदान करने और डॉक्टर से कब मिलना चाहिए इसका सुझाव देने में मदद कर सकता हूं। आज आप कैसा महसूस कर रहे हैं?",
      bengali: "হ্যালো! আমি আপনার AI স্বাস্থ্য সহায়ক। আমি আপনার উপসর্গগুলি বুঝতে, স্বাস্থ্য নির্দেশনা প্রদান করতে এবং কখন ডাক্তার দেখাতে হবে তার পরামর্শ দিতে পারি। আজ আপনার কেমন লাগছে?"
    };

    return welcomeMessages[language] || welcomeMessages.english;
  };

  const getLanguageCode = (language) => {
    const languageCodes = {
      english: 'en-IN',
      hindi: 'hi-IN',
      bengali: 'bn-IN',
      tamil: 'ta-IN',
      marathi: 'mr-IN',
      gujarati: 'gu-IN',
      kannada: 'kn-IN',
      telugu: 'te-IN',
      malayalam: 'ml-IN',
      punjabi: 'pa-IN'
    };

    return languageCodes[language] || 'en-IN';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.lang = getLanguageCode(user?.preferred_language || 'english');
      recognitionRef.current.start();
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);

    for (const file of files) {
      try {
        const { file_url } = await UploadFile({ file });
        setUploadedImages(prev => [...prev, file_url]);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && uploadedImages.length === 0) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      images: uploadedImages,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const medicalPrompt = `
        You are a compassionate AI medical assistant for Swastya-Setu, designed to help Indian patients. 
        
        User's preferred language: ${user?.preferred_language || 'english'}
        User's profile: Age: ${user?.age || 'Not specified'}, Gender: ${user?.gender || 'Not specified'}
        
        Please respond in ${user?.preferred_language === 'hindi' ? 'Hindi' : user?.preferred_language === 'bengali' ? 'Bengali' : 'English'} language.
        
        User's message: "${inputMessage}"
        ${uploadedImages.length > 0 ? `User has uploaded ${uploadedImages.length} image(s) for analysis.` : ''}
        
        Guidelines:
        1. Be empathetic and professional
        2. Provide helpful medical guidance but always emphasize that this is not a substitute for professional medical advice
        3. If symptoms seem serious, strongly recommend consulting a doctor
        4. Ask follow-up questions to better understand the condition
        5. Consider Indian context, climate, and common diseases
        6. If you determine this is urgent/serious, suggest booking an appointment immediately
        7. Assess severity level: low, medium, high, or emergency
        8. Recommend appropriate medical specialization if needed
        
        Response format should include:
        - Empathetic response to their concern
        - Possible conditions or explanations
        - Self-care recommendations (if applicable)
        - When to seek medical attention
        - Severity assessment
        - Recommended medical specialization (if needed)
      `;

      const response = await InvokeLLM({
        prompt: medicalPrompt,
        file_urls: uploadedImages.length > 0 ? uploadedImages : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            severity_level: { type: "string", enum: ["low", "medium", "high", "emergency"] },
            recommended_specialization: { type: "string" },
            suggest_appointment: { type: "boolean" },
            follow_up_questions: { type: "array", items: { type: "string" } }
          }
        }
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        severity: response.severity_level,
        specialization: response.recommended_specialization,
        suggestAppointment: response.suggest_appointment,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save consultation to database
      const consultationData = {
        user_id: user.id,
        symptoms: inputMessage,
        conversation: [...messages, userMessage, assistantMessage],
        severity_level: response.severity_level,
        recommended_specialization: response.recommended_specialization,
        image_urls: uploadedImages,
        language: user?.preferred_language || 'english',
        appointment_suggested: response.suggest_appointment
      };

      if (currentConsultation) {
        await AIConsultation.update(currentConsultation.id, consultationData);
      } else {
        const newConsultation = await AIConsultation.create(consultationData);
        setCurrentConsultation(newConsultation);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again or consult a healthcare professional directly.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setInputMessage("");
    setUploadedImages([]);
    setIsLoading(false);
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { color: "bg-green-100 text-green-800", label: "Low Priority" },
      medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium Priority" },
      high: { color: "bg-red-100 text-red-800", label: "High Priority" },
      emergency: { color: "bg-red-500 text-white", label: "Emergency" }
    };

    return severityConfig[severity] || severityConfig.low;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Health Assistant</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Get instant medical guidance in your preferred language
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-0">
            <ScrollArea className="h-96 p-6 space-y-4"> {/* Replaced div with ScrollArea */}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8"> {/* Replaced div with Avatar */}
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500">
                        <Bot className="w-4 h-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {message.images && message.images.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.images.map((imageUrl, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={imageUrl}
                            alt="Uploaded medical image"
                            className="max-w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    {message.severity && (
                      <div className="mt-3 flex items-center gap-2">
                        <Badge className={getSeverityBadge(message.severity).color}>
                          {getSeverityBadge(message.severity).label}
                        </Badge>
                        {message.suggestAppointment && (
                          <Link to={createPageUrl("BookAppointment")}>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              Book Appointment
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8"> {/* Replaced div with Avatar */}
                      <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-400">
                        <UserIcon className="w-4 h-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start gap-3">
                  <Avatar className="w-8 h-8"> {/* Replaced div with Avatar */}
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500">
                      <Bot className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-gray-600">AI is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            {uploadedImages.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={startVoiceRecording}
                  disabled={isLoading || isListening}
                  className={isListening ? "bg-red-100 border-red-300" : ""}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>

              <Textarea // Replaced Input with Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Describe your symptoms or ask a health question..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()} // Kept onKeyPress; for multiline Textarea, often Shift+Enter is newline, Enter is send. This depends on desired UX.
                disabled={isLoading}
                className="flex-1 min-h-[40px]" // Added min-h for consistent initial height
              />

              <Button
                onClick={sendMessage}
                disabled={isLoading || (!inputMessage.trim() && uploadedImages.length === 0)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Disclaimer</AlertTitle> {/* Added AlertTitle */}
          <AlertDescription>
            This AI assistant provides general health information only and is not a substitute for professional medical advice.
            For serious symptoms or emergencies, please consult a healthcare professional immediately.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
