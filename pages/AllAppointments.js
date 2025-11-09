
import React, { useState, useEffect, useCallback } from 'react';
import { Appointment } from '@/entities/Appointment';
import { Doctor } from '@/entities/Doctor';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Calendar, Check, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AllAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState({});
    const [patients, setPatients] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [appointmentData, doctorData, patientData] = await Promise.all([
                Appointment.list("-created_date"),
                Doctor.list(),
                User.list()
            ]);

            setAppointments(appointmentData);

            const doctorsMap = doctorData.reduce((acc, doc) => { acc[doc.id] = doc; return acc; }, {});
            const patientsMap = patientData.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
            
            setDoctors(doctorsMap);
            setPatients(patientsMap);

        } catch (error) {
            console.error("Failed to fetch data for admin:", error);
            toast({ 
                title: 'Error', 
                description: 'Could not load all appointments.', 
                variant: 'destructive',
                className: "bg-red-500 text-white border-red-600"
            });
        }
        setIsLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleUpdateStatus = async (appointmentId, status) => {
        try {
            await Appointment.update(appointmentId, { status });
            toast({ 
                title: '✅ Success', 
                description: `Appointment has been ${status}.`,
                className: "bg-green-600 text-white border-green-700 shadow-lg opacity-100 font-semibold"
            });
            fetchAllData();
        } catch (error) {
            toast({ 
                title: '❌ Error', 
                description: 'Could not update the appointment.', 
                variant: 'destructive',
                className: "bg-red-600 text-white border-red-700 opacity-100"
            });
        }
    };

    const handleDelete = async (appointmentId) => {
         try {
            await Appointment.delete(appointmentId);
            toast({ 
                title: '✅ Success', 
                description: `Appointment has been deleted.`,
                className: "bg-green-600 text-white border-green-700 shadow-lg opacity-100 font-semibold"
            });
            fetchAllData();
        } catch (error) {
            toast({ 
                title: '❌ Error', 
                description: 'Could not delete the appointment.', 
                variant: 'destructive',
                className: "bg-red-600 text-white border-red-700 opacity-100"
            });
        }
    }
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return <div className="p-6 min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
    }

    return (
        <div className="p-6 bg-gradient-to-br from-green-50 via-white to-teal-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">All Appointments</h1>
                <div className="space-y-4">
                    {appointments.map(apt => {
                        const doctor = doctors[apt.doctor_id] || {};
                        const patient = patients[apt.patient_id] || {};
                        return (
                            <Card key={apt.id} className="shadow-md border-0">
                                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                                    <div className="md:col-span-2">
                                        <p className="font-bold text-gray-800">Dr. {doctor.name}</p>
                                        <p className="text-sm text-gray-600">Patient: {patient.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{format(new Date(apt.appointment_date), 'EEE, MMM d, yyyy')}</p>
                                        <p className="text-sm text-gray-500">{apt.appointment_time}</p>
                                    </div>
                                     <div>
                                        <Badge className={getStatusBadge(apt.status)}>{apt.status}</Badge>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        {apt.status === 'pending' && (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(apt.id, 'cancelled')}><X className="w-4 h-4"/> </Button>
                                                <Button size="sm" onClick={() => handleUpdateStatus(apt.id, 'approved')}><Check className="w-4 h-4"/> </Button>
                                            </>
                                        )}
                                         <Button size="sm" variant="destructive" onClick={() => handleDelete(apt.id)}><Trash2 className="w-4 h-4"/> </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
