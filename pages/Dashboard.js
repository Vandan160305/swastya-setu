import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Appointment } from "@/entities/Appointment";
import { AIConsultation } from "@/entities/AIConsultation";
import { DiseasePrediction } from "@/entities/DiseasePrediction";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CompleteProfileModal from "../components/CompleteProfileModal";
import { useTranslation } from "@/layout";
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  FileSearch,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedConsultations: 0,
    upcomingAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { t, language } = useTranslation();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Check if user profile is incomplete
      if (!userData.phone || !userData.age) {
        setShowProfileModal(true);
      }

      // Load user's appointments
      const userAppointments = await Appointment.filter(
        { patient_id: userData.id },
        "-created_date",
        5
      );
      setAppointments(userAppointments);

      // Load user's AI consultations
      const userConsultations = await AIConsultation.filter(
        { user_id: userData.id },
        "-created_date",
        3
      );
      setConsultations(userConsultations);
      
      // Load user's Disease Predictions
      const userPredictions = await DiseasePrediction.filter(
        { user_id: userData.id },
        "-created_date",
        1
      );
      setPredictions(userPredictions);

      // Calculate stats
      const totalAppts = await Appointment.filter({ patient_id: userData.id });
      const completedConsults = await AIConsultation.filter({ user_id: userData.id });
      const upcomingAppts = totalAppts.filter(apt => 
        apt.status === 'approved' && new Date(apt.appointment_date) >= new Date()
      );

      setStats({
        totalAppointments: totalAppts.length,
        completedConsultations: completedConsults.length,
        upcomingAppointments: upcomingAppts.length
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };
  
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setShowProfileModal(false);
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (language === 'hindi') {
        return hour < 12 ? 'सुप्रभात' : hour < 17 ? 'नमस्कार' : 'शुभ संध्या';
    }
    // Default to English
    return hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  };

  const quickActions = [
    {
      title: t('ai_health_assistant'),
      description: t('ai_assistant_desc'),
      icon: MessageCircle,
      url: createPageUrl("AIAssistant"),
      color: "bg-blue-500",
    },
    {
      title: t('book_appointment'),
      description: t('book_appointment_desc'),
      icon: Calendar,
      url: createPageUrl("BookAppointment"),
      color: "bg-green-500",
    },
    {
      title: t('disease_predictor'),
      description: t('disease_predictor_desc'),
      icon: FileSearch,
      url: createPageUrl("DiseasePredictor"),
      color: "bg-purple-500",
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-700">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-orange-50 via-white to-green-50 min-h-screen">
      
      <CompleteProfileModal 
        isOpen={showProfileModal} 
        user={user} 
        onClose={() => setShowProfileModal(false)}
        onProfileUpdate={handleProfileUpdate}
      />

      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {user?.full_name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">{t('dashboard_welcome')}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">AI Consultations</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedConsultations}</p>

                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingAppointments}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  {t('quick_actions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.url}>
                      <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Disease Prediction */}
            {predictions.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                    <FileSearch className="w-5 h-5 text-purple-500" />
                    Last Symptom Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">Based on your symptoms: <span className="font-medium text-gray-800">"{predictions[0].symptoms}"</span></p>
                  <div className="space-y-2">
                    {predictions[0].predictions.slice(0, 2).map((p, i) => (
                      <div key={i} className="p-3 bg-purple-50 rounded-lg">
                        <p className="font-semibold text-purple-900">{p.name} <span className="text-xs font-normal">({p.confidence} confidence)</span></p>
                        <p className="text-sm text-purple-700">{p.next_steps}</p>
                      </div>
                    ))}
                  </div>
                   <Link to={createPageUrl("DiseasePredictor")} className="w-full">
                      <Button variant="link" size="sm" className="mt-2 text-purple-600">Analyze new symptoms</Button>
                    </Link>
                </CardContent>
              </Card>
            )}

            {/* Recent Appointments */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    {t('recent_appointments')}
                  </CardTitle>
                  <Link to={createPageUrl("MyAppointments")}>
                    <Button variant="outline" size="sm">{t('view_all')}</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-full shadow-sm">
                            <Calendar className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.appointment_time}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={appointment.status === 'completed' ? 'default' : 'secondary'}
                          className={
                            appointment.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                             'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('no_appointments_yet')}</p>
                    <Link to={createPageUrl("BookAppointment")}>
                      <Button className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                        {t('book_first_appointment')}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent AI Consultations */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Recent AI Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consultations.length > 0 ? (
                  <div className="space-y-4">
                    {consultations.map((consultation) => (
                      <div key={consultation.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-full shadow-sm">
                            <MessageCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-2">
                              {consultation.symptoms?.substring(0, 100)}...
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary"
                                className={
                                  consultation.severity_level === 'high' || consultation.severity_level === 'emergency' 
                                    ? 'bg-red-100 text-red-800' 
                                    : consultation.severity_level === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }
                              >
                                {consultation.severity_level}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {format(new Date(consultation.created_date), 'MMM d')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link to={createPageUrl("AIAssistant")}>
                      <Button variant="outline" size="sm" className="w-full">
                        Start New Consultation
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No AI consultations yet</p>
                    <Link to={createPageUrl("AIAssistant")}>
                      <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                        Try AI Assistant
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}