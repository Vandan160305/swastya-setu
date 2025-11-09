
import React, { useState, useEffect } from "react";
import { Doctor } from "@/entities/Doctor";
import { Appointment } from "@/entities/Appointment";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Star, IndianRupee, Stethoscope, Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

const specializations = [
  "general_physician", "cardiologist", "dermatologist", "pediatrician", "orthopedic", 
  "neurologist", "psychiatrist", "gynecologist", "ent_specialist", "ophthalmologist"
];

const formatSpecialization = (spec) => {
  return spec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [doctorData, userData] = await Promise.all([
          Doctor.list("-rating"),
          User.me()
        ]);
        setDoctors(doctorData);
        setFilteredDoctors(doctorData);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ 
          title: "Error", 
          description: "Failed to load doctors.", 
          variant: "destructive",
          className: "bg-red-500 text-white border-red-600"
        });
      }
      setIsLoading(false);
    };
    fetchData();
  }, [toast]);

  useEffect(() => {
    let results = doctors;
    if (searchTerm) {
      results = results.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (specializationFilter !== "all") {
      results = results.filter(doc => doc.specialization === specializationFilter);
    }
    setFilteredDoctors(results);
  }, [searchTerm, specializationFilter, doctors]);

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
    setSelectedDate(null);
    setSelectedTime(null);
    setSymptoms("");
  };

  const generateTimeSlots = (start, end) => {
      const slots = [];
      let currentTime = new Date(`1970-01-01T${start}:00`);
      const endTime = new Date(`1970-01-01T${end}:00`);

      while(currentTime < endTime) {
          slots.push(format(currentTime, "HH:mm"));
          currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
      return slots;
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDoctor || !selectedDate) return [];
    
    const dayOfWeek = format(selectedDate, "EEEE");
    const availability = selectedDoctor.availability?.find(a => a.day === dayOfWeek);

    if (!availability) return [];

    return generateTimeSlots(availability.start_time, availability.end_time);
  };
  
  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !symptoms) {
      toast({ 
        title: "Missing Information", 
        description: "Please fill all fields.", 
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700 opacity-100"
      });
      return;
    }
    setIsConfirming(true);
    try {
      await Appointment.create({
        patient_id: user.id,
        doctor_id: selectedDoctor.id,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: selectedTime,
        symptoms,
        consultation_type: "video_call",
        status: "pending",
        amount: selectedDoctor.consultation_fee,
        payment_status: "pending"
      });
      toast({ 
        title: "✅ Success!", 
        description: `Appointment request sent to ${selectedDoctor.name}. You will be notified upon confirmation.`,
        className: "bg-green-600 text-white border-green-700 shadow-lg opacity-100 font-semibold"
      });
      setIsBookingModalOpen(false);
    } catch(error) {
      console.error("Booking error:", error);
      toast({ 
        title: "❌ Booking Failed", 
        description: "Could not request appointment. Please try again.", 
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700 opacity-100"
      });
    }
    setIsConfirming(false);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-orange-50 via-white to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
        <p className="text-gray-600 mb-8">Find the right doctor and schedule your consultation.</p>

        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by doctor's name..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map(spec => (
                  <SelectItem key={spec} value={spec}>{formatSpecialization(spec)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <Card key={doctor.id} className="shadow-lg hover:shadow-xl transition-shadow border-0 flex flex-col bg-white">
                <CardHeader className="flex flex-row items-start gap-4">
                  <img src={doctor.profile_image} alt={doctor.name} className="w-20 h-20 rounded-full object-cover border-2 border-orange-200" />
                  <div className="flex-1">
                    <CardTitle className="text-xl">{doctor.name}</CardTitle>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 mt-1">{formatSpecialization(doctor.specialization)}</Badge>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 
                      <span>{doctor.rating?.toFixed(1) || 'N/A'}</span>
                      <span className="truncate">({doctor.total_consultations || 0} consultations)</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-600 mb-3">{doctor.qualification}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <IndianRupee className="w-4 h-4" /> 
                    <span className="font-semibold">{doctor.consultation_fee}</span>
                    <span>Consultation Fee</span>
                  </div>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600" onClick={() => handleBookClick(doctor)}>Book Now</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {filteredDoctors.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">No Doctors Found</h3>
            <p className="text-gray-500">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>

      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-[800px] bg-white">
          <DialogHeader>
            <DialogTitle>Book Appointment with {selectedDoctor?.name}</DialogTitle>
            <DialogDescription>Select a date and time for your consultation.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 py-4">
            <div>
              <Label className="font-semibold mb-2 block">1. Select Date</Label>
              <style>{`
                .rdp-day_selected {
                  background-color: #f97316 !important;
                  color: white !important;
                  font-weight: bold;
                }
                .rdp-day_selected:hover {
                  background-color: #ea580c !important;
                }
                .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
                  background-color: #fed7aa !important;
                  color: #000 !important;
                }
              `}</style>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                    const dayOfWeek = format(date, "EEEE");
                    const isAvailable = selectedDoctor?.availability?.some(a => a.day === dayOfWeek);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || !isAvailable;
                }}
                className="rounded-md border"
              />
            </div>
            <div className="flex flex-col">
              <Label className="font-semibold mb-2 block">2. Select Time</Label>
              <div className="grid grid-cols-3 gap-2 flex-grow overflow-y-auto pr-2 max-h-48">
                {selectedDate && getAvailableTimeSlots().map(time => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className={selectedTime === time ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                  >
                    {time}
                  </Button>
                ))}
                {selectedDate && getAvailableTimeSlots().length === 0 && (
                    <p className="col-span-3 text-sm text-center text-gray-500 pt-4">No slots available for this day. Please select another date.</p>
                )}
                 {!selectedDate && (
                    <p className="col-span-3 text-sm text-center text-gray-500 pt-4">Please select a date to see available times.</p>
                )}
              </div>
              <div className="mt-4">
                  <Label htmlFor="symptoms" className="font-semibold mb-2 block">3. Briefly describe your symptoms</Label>
                  <Input 
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g., fever and headache"
                  />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmBooking} 
              disabled={isConfirming || !selectedTime || !symptoms}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            >
              {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Appointment (₹{selectedDoctor?.consultation_fee})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
