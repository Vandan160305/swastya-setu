import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Stethoscope, Calendar, Users, Shield } from 'lucide-react';

export default function AdminDashboard() {
    
    const adminActions = [
        {
            title: "Manage Doctors",
            description: "View, add, or edit doctor profiles.",
            icon: Stethoscope,
            url: createPageUrl("ManageDoctors"),
            color: "bg-blue-500",
        },
        {
            title: "Manage Appointments",
            description: "View and manage all user appointments.",
            icon: Calendar,
            url: createPageUrl("AllAppointments"),
            color: "bg-green-500",
        },
        {
            title: "Manage Users",
            description: "View all registered users.",
            icon: Users,
            url: "#", // Add later if needed
            color: "bg-purple-500",
        }
    ];

    return (
        <div className="p-6 bg-gradient-to-br from-red-50 via-white to-orange-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-red-600" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">Oversee and manage the Swastya-Setu platform.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminActions.map((action, index) => (
                        <Link to={action.url} key={index}>
                            <Card className="border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <action.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>{action.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">{action.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}