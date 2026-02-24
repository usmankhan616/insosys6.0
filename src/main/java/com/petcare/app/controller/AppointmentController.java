package com.petcare.app.controller;

import com.petcare.app.model.Appointment;
import com.petcare.app.model.BlockedSlot;
import com.petcare.app.model.User;
import com.petcare.app.repository.AppointmentRepository;
import com.petcare.app.repository.BlockedSlotRepository; // Added import
import com.petcare.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private BlockedSlotRepository blockedSlotRepo; // Added missing repository injection

    // Combined logic: Filters bookings AND blocked slots to show true vacancy
    @GetMapping("/busy-slots")
    public List<String> getBusySlots(@RequestParam Long doctorId, @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);

        // 1. Get existing bookings that are NOT completed
        List<String> bookedSlots = appointmentRepo.findAll().stream()
                .filter(a -> a.getDoctor().getId().equals(doctorId) &&
                        a.getAppointmentTime().toLocalDate().equals(localDate) &&
                        !a.getStatus().equals("COMPLETED"))
                .map(a -> a.getAppointmentTime().toLocalTime().toString().substring(0, 5))
                .collect(Collectors.toList());

        // 2. Get blocked slots from Time Table Management
        List<String> blockedSlots = blockedSlotRepo.findByDoctorIdAndDate(doctorId, localDate)
                .stream()
                .map(BlockedSlot::getSlotTime)
                .collect(Collectors.toList());

        bookedSlots.addAll(blockedSlots);
        return bookedSlots;
    }

    // Book Appointment: Handles Online/Offline selection
    @PostMapping("/book")
    public String bookAppointment(@RequestBody Appointment appointment, @RequestParam String ownerEmail) {
        User owner = userRepo.findByEmail(ownerEmail).orElseThrow();
        appointment.setOwner(owner);
        appointment.setStatus("PENDING");
        appointmentRepo.save(appointment);
        return "Appointment booked successfully!";
    }

    // Complete Appointment: Frees up the slot for next patients
    @PostMapping("/complete/{id}")
    public String completeAppointment(@PathVariable Long id) {
        Appointment app = appointmentRepo.findById(id).orElseThrow();
        app.setStatus("COMPLETED");
        appointmentRepo.save(app);
        return "Consultation completed. Slot is now vacant.";
    }

    // Doctor View: Fetches active appointments for the logged-in doctor
    @GetMapping("/doctor/{email}")
    public List<Appointment> getDoctorAppointments(@PathVariable String email) {
        User doctor = userRepo.findByEmail(email).orElseThrow();
        return appointmentRepo.findAll().stream()
                .filter(a -> a.getDoctor().getId().equals(doctor.getId()))
                .filter(a -> a.getStatus().equals("PENDING"))
                .collect(Collectors.toList());
    }

    // New: Handle blocking/unblocking slots for Time Table Management
    @PostMapping("/manage-slots")
    public String manageSlots(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        LocalDate date = LocalDate.parse(payload.get("date"));
        String slotTime = payload.get("slotTime");

        User doctor = userRepo.findByEmail(email).orElseThrow();

        // Toggle logic: If already blocked, delete it; otherwise, add it
        List<BlockedSlot> existing = blockedSlotRepo.findByDoctorIdAndDate(doctor.getId(), date)
                .stream()
                .filter(s -> s.getSlotTime().equals(slotTime))
                .collect(Collectors.toList());

        if (existing.isEmpty()) {
            BlockedSlot newBlock = new BlockedSlot();
            newBlock.setDoctor(doctor);
            newBlock.setDate(date);
            newBlock.setSlotTime(slotTime);
            blockedSlotRepo.save(newBlock);
            return "Slot Blocked";
        } else {
            blockedSlotRepo.deleteAll(existing);
            return "Slot Unblocked";
        }
    }

    @GetMapping("/blocked")
    public List<String> getBlockedByDoctor(@RequestParam String email, @RequestParam String date) {
        User doctor = userRepo.findByEmail(email).orElseThrow();
        return blockedSlotRepo.findByDoctorIdAndDate(doctor.getId(), LocalDate.parse(date))
                .stream()
                .map(BlockedSlot::getSlotTime)
                .collect(Collectors.toList());
    }
    @GetMapping("/history/{email}")
    public List<Appointment> getDoctorHistory(@PathVariable String email) {
        User doctor = userRepo.findByEmail(email).orElseThrow();
        // Fetches all past appointments for history view
        return appointmentRepo.findAll().stream()
                .filter(a -> a.getDoctor().getId().equals(doctor.getId()))
                .sorted((a, b) -> b.getAppointmentTime().compareTo(a.getAppointmentTime()))
                .collect(Collectors.toList());
    }
}