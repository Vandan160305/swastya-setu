
import React, { useState, useEffect, useCallback } from 'react';
import { Doctor } from '@/entities/Doctor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ManageDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchDoctors = useCallback(async () => {
        setIsLoading(true);
        try {
            const doctorData = await Doctor.list("-created_date");
            setDoctors(doctorData);
        } catch (error) {
            console.error("Failed to fetch doctors:", error);
            toast({ 
                title: "Error", 
                description: "Could not load doctors.", 
                variant: "destructive",
                className: "bg-red-500 text-white border-red-600"
            });
        }
        setIsLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleDeleteDoctor = async (doctorId) => {
        // Add confirmation dialog in a real app
        try {
            await Doctor.delete(doctorId);
            toast({ 
                title: "✅ Success", 
                description: "Doctor profile deleted.",
                className: "bg-green-600 text-white border-green-700 shadow-lg opacity-100 font-semibold"
            });
            fetchDoctors();
        } catch (error) {
            console.error("Failed to delete doctor:", error);
            toast({ 
                title: "❌ Error", 
                description: "Could not delete doctor.", 
                variant: "destructive",
                className: "bg-red-600 text-white border-red-700 opacity-100"
            });
        }
    };
    
    if (isLoading) {
        return <div className="p-6 min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
    }

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
                    <Button><UserPlus className="w-4 h-4 mr-2"/>Add New Doctor</Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {doctors.map(doctor => (
                        <Card key={doctor.id} className="shadow-lg border-0">
                             <CardHeader className="flex flex-row items-center gap-4">
                                <img src={doctor.profile_image} alt={doctor.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-200" />
                                <div>
                                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                                    <p className="text-sm text-gray-600">{doctor.specialization.replace(/_/g, ' ')}</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-800 font-medium">{doctor.user_email}</p>
                                <p className="text-xs text-gray-500">{doctor.qualification}</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteDoctor(doctor.id)}>
                                    <Trash2 className="w-4 h-4 mr-2"/>
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
