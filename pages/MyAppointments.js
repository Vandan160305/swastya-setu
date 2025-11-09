
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { Appointment } from '@/entities/Appointment';
import { Doctor } from '@/entities/Doctor';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Calendar, Stethoscope, MessageSquare, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const formatSpecialization = (spec) => {
  if (!spec) return '';
  return spec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            const userAppointments = await Appointment.filter({ patient_id: user.id }, "-appointment_date");

            if (userAppointments.length > 0) {
                const doctorIds = [...new Set(userAppointments.map(apt => apt.doctor_id))];
                const doctorData = await Doctor.filter({ id: { '$in': doctorIds } });
                const doctorsMap = doctorData.reduce((acc, doc) => {
                    acc[doc.id] = doc;
                    return acc;
                }, {});
                setDoctors(doctorsMap);
            }

            setAppointments(userAppointments);
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
            toast({
                title: 'Error',
                description: 'Could not load your appointments.',
                variant: 'destructive',
                className: "bg-red-500 text-white border-red-600"
            });
        }
        setIsLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleCancelAppointment = async (appointmentId) => {
        try {
            await Appointment.update(appointmentId, { status: 'cancelled' });
            toast({
                title: '✅ Success',
                description: 'Your appointment has been cancelled.',
                className: "bg-green-600 text-white border-green-700 shadow-lg opacity-100 font-semibold"
            });
            fetchAppointments();
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
            toast({
                title: '❌ Error',
                description: 'Could not cancel the appointment. Please try again.',
                variant: 'destructive',
                className: "bg-red-600 text-white border-red-700 opacity-100"
            });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const upcomingAppointments = appointments.filter(apt => ['pending', 'approved'].includes(apt.status) && new Date(apt.appointment_date) >= new Date().setHours(0,0,0,0));
    const pastAppointments = appointments.filter(apt => !upcomingAppointments.includes(apt));

    if (isLoading) {
        return (
            <div className="p-6 min-h-screen flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }
    
    return (
        <div className="p-6 bg-gradient-to-br from-orange-50 via-white to-green-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Appointments</h1>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming & Pending</h2>
                    {upcomingAppointments.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingAppointments.map(apt => {
                                const doctor = doctors[apt.doctor_id];
                                return (
                                    <Card key={apt.id} className="shadow-lg border-0">
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>{format(new Date(apt.appointment_date), 'MMM d, yyyy')}</span>
                                                <Badge className={getStatusBadge(apt.status)}>{apt.status}</Badge>
                                            </CardTitle>
                                            <p className="text-sm text-gray-600">{apt.appointment_time}</p>
                                        </CardHeader>
                                        <CardContent>
                                            {doctor && (
                                                <div className="flex items-center gap-3">
                                                    <img src={doctor.profile_image} alt={doctor.name} className="w-12 h-12 rounded-full object-cover"/>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{doctor.name}</p>
                                                        <p className="text-sm text-gray-600">{formatSpecialization(doctor.specialization)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-sm text-gray-700 mt-3"><span className="font-semibold">Symptoms:</span> {apt.symptoms}</p>
                                        </CardContent>
                                        <CardFooter className="flex justify-between">
                                            <Button variant="outline" size="sm" onClick={() => handleCancelAppointment(apt.id)} disabled={apt.status === 'cancelled'}>Cancel</Button>
                                            {apt.status === 'approved' && (
                                                <Link to={createPageUrl(`Chat?appointmentId=${apt.id}`)}>
                                                    <Button size="sm" className="bg-green-500 hover:bg-green-600"><MessageSquare className="w-4 h-4 mr-2"/> Chat with Doctor</Button>
                                                </Link>
                                            )}
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                       <div className="text-center py-12 bg-white rounded-lg shadow-md">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800">No Upcoming Appointments</h3>
                            <p className="text-gray-500">You can book a new appointment with our expert doctors.</p>
                       </div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Past Appointments</h2>
                     {pastAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {pastAppointments.map(apt => {
                                 const doctor = doctors[apt.doctor_id];
                                 return (
                                    <Card key={apt.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-white shadow-sm">
                                        <div className="flex items-center gap-4 mb-3 md:mb-0">
                                            {doctor && <img src={doctor.profile_image} alt={doctor.name} className="w-12 h-12 rounded-full object-cover"/>}
                                            <div>
                                                <p className="font-bold">{doctor?.name}</p>
                                                <p className="text-sm text-gray-600">{format(new Date(apt.appointment_date), 'MMM d, yyyy')} - {apt.appointment_time}</p>
                                            </div>
                                        </div>
                                        <Badge className={getStatusBadge(apt.status)}>{apt.status}</Badge>
                                    </Card>
                                 )
                            })}
                        </div>
                     ) : (
                         <div className="text-center py-12 bg-white rounded-lg shadow-md">
                            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800">No Past Appointments</h3>
                            <p className="text-gray-500">Your appointment history will appear here.</p>
                       </div>
                     )}
                </section>
            </div>
        </div>
    );
}
