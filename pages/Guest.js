import React, { useState } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DemoVideoModal from "../components/common/DemoVideoModal";
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  Video, 
  Star,
  Shield,
  Clock,
  Users,
  ChevronRight,
  Play
} from "lucide-react";

export default function Guest() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      // This function handles both login and signup for new users via Google.
      // After login, the layout will redirect them to complete their profile if needed.
      await User.login();
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: "AI Health Assistant",
      description: "Get instant medical guidance with our advanced AI assistant supporting multiple Indian languages",
      color: "bg-blue-500"
    },
    {
      icon: Calendar,
      title: "Easy Appointment Booking",
      description: "Book appointments with qualified doctors across various specializations",
      color: "bg-green-500"
    },
    {
      icon: Video,
      title: "Telemedicine",
      description: "Connect with doctors through video and voice calls from the comfort of your home",
      color: "bg-purple-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade security measures",
      color: "bg-orange-500"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Patients" },
    { number: "500+", label: "Qualified Doctors" },
    { number: "50+", label: "Specializations" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <>
      <DemoVideoModal isOpen={isVideoPlaying} onClose={() => setIsVideoPlaying(false)} />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-white to-green-100"></div>
          <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-16 h-16 bg-green-200 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute top-1/3 right-20 w-12 h-12 bg-blue-200 rounded-full opacity-30"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg mb-6">
                <Heart className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Trusted Healthcare Platform</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                आपका स्वास्थ्य,
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-green-500 bg-clip-text text-transparent">
                  हमारी प्राथमिकता
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Experience the future of healthcare with AI-powered consultations, 
                easy appointment booking, and telemedicine - all in your preferred language
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={handleLogin}
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {isLoading ? "Signing In..." : "Get Started Free"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 hover:border-orange-300 px-8 py-4 text-lg font-semibold"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Complete Healthcare Solution
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From AI-powered consultations to video calls with specialists, 
                we provide everything you need for your health journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-orange-500 via-red-500 to-green-500">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Swastya-Setu for their healthcare needs. 
              Start your journey to better health today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleLogin}
                disabled={isLoading}
                className="bg-white text-orange-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {isLoading ? "Signing In..." : "Create Free Account"}
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">स्वास्थ्य-सेतु</h3>
                  <p className="text-sm text-gray-400">Swastya-Setu</p>
                </div>
              </div>
              
              <p className="text-gray-400 mb-6">
                Connecting India with quality healthcare through technology
              </p>
              
              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
                <span>© 2024 Swastya-Setu</span>
                <span>•</span>
                <span>Made in India with ❤️</span>
                <span>•</span>
                <span>Privacy Policy</span>
                <span>•</span>
                <span>Terms of Service</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}