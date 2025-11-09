
import React, { useState, useEffect, useCallback } from 'react';
import { Appointment } from '@/entities/Appointment';
import { Doctor } from '@/entities/Doctor';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Calendar, Check, X, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState({});
    const [doctor, setDoctor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            const doctorProfile = await Doctor.filter({ user_email: currentUser.email });

            if (doctorProfile.length === 0) {
                // This user is not a doctor
                setIsLoading(false);
                return;
            }
            setDoctor(doctorProfile[0]);

            const doctorAppointments = await Appointment.filter({ doctor_id: doctorProfile[0].id }, "-created_date");
            setAppointments(doctorAppointments);

            if (doctorAppointments.length > 0) {
                const patientIds = [...new Set(doctorAppointments.map(apt => apt.patient_id))];
                const patientData = await User.filter({ id: { '$in': patientIds } });
                const patientsMap = patientData.reduce((acc, p) => {
                    acc[p.id] = p;
                    return acc;
                }, {});
                setPatients(patientsMap);
            }
        } catch (error) {
            console.error("Failed to fetch doctor dashboard:", error);
            toast({ title: 'Error', description: 'Could not load your dashboard.', variant: 'destructive' });
        }
        setIsLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleUpdateStatus = async (appointmentId, status) => {
        try {
            await Appointment.update(appointmentId, { status });
            toast({ 
                title: '✅ Success', 
                description: `Appointment has been ${status}.`,
                className: "bg-green-600 text-white border-green-700 shadow-lg opacity-100 font-semibold"
            });
            fetchDashboardData();
        } catch (error) {
            console.error(`Failed to ${status} appointment:`, error);
            toast({ 
                title: '❌ Error', 
                description: 'Could not update the appointment.', 
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

    if (isLoading) {
        return <div className="p-6 min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
    }

    if (!doctor) {
        return <div className="p-6 text-center">You do not have access to this page.</div>;
    }

    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const upcomingAppointments = appointments.filter(a => a.status === 'approved' && new Date(a.appointment_date) >= new Date());
    const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || new Date(a.appointment_date) < new Date());

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
                <p className="text-gray-600 mb-8">Welcome back, {doctor.name}!</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pending Requests ({pendingAppointments.length})</h2>
                    {pendingAppointments.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingAppointments.map(apt => {
                                const patient = patients[apt.patient_id];
                                return (
                                    <Card key={apt.id} className="shadow-lg border-0">
                                        <CardHeader>
                                            <CardTitle className="flex items-start justify-between">
                                                <span>{patient?.full_name || 'Patient'}</span>
                                                <Badge className={getStatusBadge(apt.status)}>{apt.status}</Badge>
                                            </CardTitle>
                                            <p className="text-sm text-gray-600">{format(new Date(apt.appointment_date), 'MMM d, yyyy')} - {apt.appointment_time}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Symptoms:</span> {apt.symptoms}</p>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(apt.id, 'cancelled')}><X className="w-4 h-4 mr-1"/> Cancel</Button>
                                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleUpdateStatus(apt.id, 'approved')}><Check className="w-4 h-4 mr-1"/> Approve</Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : <div className="text-center py-12 bg-white rounded-lg shadow-md"><p>No pending appointment requests.</p></div>}
                </section>
                
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Appointments ({upcomingAppointments.length})</h2>
                    {upcomingAppointments.length > 0 ? (
                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingAppointments.map(apt => {
                                const patient = patients[apt.patient_id];
                                return (
                                    <Card key={apt.id} className="shadow-lg border-0 bg-blue-50">
                                        <CardHeader>
                                             <CardTitle className="flex items-start justify-between">
                                                <span>{patient?.full_name || 'Patient'}</span>
                                                <Badge className={getStatusBadge(apt.status)}>{apt.status}</Badge>
                                            </CardTitle>
                                            <p className="text-sm text-gray-600">{format(new Date(apt.appointment_date), 'MMM d, yyyy')} - {apt.appointment_time}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Symptoms:</span> {apt.symptoms}</p>
                                        </CardContent>
                                        <CardFooter className="flex justify-end">
                                            {/* Chat button will be added here */}
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                         </div>
                    ) : <div className="text-center py-12 bg-white rounded-lg shadow-md"><p>No upcoming appointments.</p></div>}
                </section>
            </div>
        </div>
    );
}
