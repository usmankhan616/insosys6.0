package com.petcare.app.controller;

import com.petcare.app.model.Appointment;
import com.petcare.app.model.BlockedSlot;
import com.petcare.app.model.User;
import com.petcare.app.repository.AppointmentRepository;
import com.petcare.app.repository.BlockedSlotRepository; // Added import
import com.petcare.app.repository.UserRepository;
import com.petcare.app.repository.PetRepository;
import com.petcare.app.model.Pet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

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

    @Autowired
    private PetRepository petRepo;

    // Combined logic: Filters bookings AND blocked slots to show true vacancy
    @GetMapping("/busy-slots")
    public List<String> getBusySlots(@RequestParam("doctorId") Long doctorId, @RequestParam("date") String date) {
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
    public String bookAppointment(@RequestBody Appointment appointment, @RequestParam("ownerEmail") String ownerEmail,
            @RequestParam(required = false, name = "petName") String petName,
            @RequestParam(required = false, name = "petId") Long petId) {
        User owner = userRepo.findByEmail(ownerEmail).orElseThrow();
        appointment.setOwner(owner);
        appointment.setStatus("PENDING");

        if (petId != null) {
            Pet pet = petRepo.findById(petId).orElseThrow(() -> new RuntimeException("Pet not found"));
            appointment.setPet(pet);
        } else if (petName != null && !petName.isBlank()) {
            Pet pet = petRepo.findByName(petName).orElse(null);
            if (pet == null) {
                pet = new Pet();
                pet.setName(petName);
                pet.setOwner(owner);
                petRepo.save(pet);
            }
            appointment.setPet(pet);
        }

        appointmentRepo.save(appointment);
        return "Appointment booked successfully!";
    }

    // Complete Appointment: Frees up the slot for next patients
    @PostMapping("/complete/{id}")
    public String completeAppointment(@PathVariable("id") Long id) {
        Appointment app = appointmentRepo.findById(id).orElseThrow();
        app.setStatus("COMPLETED");
        appointmentRepo.save(app);
        return "Consultation completed. Slot is now vacant.";
    }

    // Assign or update pet associated with an appointment (used by doctors when pet
    // was missing)
    @PatchMapping("/{id}/assign-pet")
    public ResponseEntity<?> assignPetToAppointment(@PathVariable("id") Long id, @RequestParam("petId") Long petId) {
        Appointment app = appointmentRepo.findById(id).orElseThrow();
        Pet pet = petRepo.findById(petId).orElse(null);
        if (pet == null) {
            return ResponseEntity.status(404).body("Pet not found");
        }
        app.setPet(pet);
        appointmentRepo.save(app);
        return ResponseEntity.ok(app);
    }

    // Doctor View: Fetches active appointments for the logged-in doctor
    @GetMapping("/doctor/{email}")
    public List<Appointment> getDoctorAppointments(@PathVariable("email") String email) {
        User doctor = userRepo.findByEmail(email).orElseThrow();
        // Return only today's pending appointments to show current schedule
        java.time.LocalDate today = java.time.LocalDate.now();
        return appointmentRepo.findAll().stream()
                .filter(a -> a.getDoctor().getId().equals(doctor.getId()))
                .filter(a -> !a.getStatus().equals("COMPLETED"))
                .filter(a -> a.getAppointmentTime() != null && a.getAppointmentTime().toLocalDate().equals(today))
                .collect(Collectors.toList());
    }

    // Handle Accept/Reject statuses
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable("id") Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "reason", required = false) String reason) {
        Appointment app = appointmentRepo.findById(id).orElse(null);
        if (app == null) {
            return ResponseEntity.status(404).body("Appointment not found");
        }

        // Ensure valid status
        if (!status.equals("ACCEPTED") && !status.equals("REJECTED") && !status.equals("COMPLETED")) {
            return ResponseEntity.badRequest().body("Invalid Status");
        }

        app.setStatus(status);
        if (status.equals("REJECTED") && reason != null) {
            app.setRejectionReason(reason);
        }
        appointmentRepo.save(app);
        return ResponseEntity.ok("Status updated to " + status);
    }

    // Allow doctors to delete a rejected appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable("id") Long id) {
        if (!appointmentRepo.existsById(id)) {
            return ResponseEntity.status(404).body("Appointment not found");
        }
        appointmentRepo.deleteById(id);
        return ResponseEntity.ok("Appointment deleted successfully.");
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
    public List<String> getBlockedByDoctor(@RequestParam("email") String email, @RequestParam("date") String date) {
        User doctor = userRepo.findByEmail(email).orElseThrow();
        return blockedSlotRepo.findByDoctorIdAndDate(doctor.getId(), LocalDate.parse(date))
                .stream()
                .map(BlockedSlot::getSlotTime)
                .collect(Collectors.toList());
    }

    @GetMapping("/history/{email}")
    public List<Appointment> getDoctorHistory(@PathVariable("email") String email) {
        User doctor = userRepo.findByEmail(email).orElseThrow();
        // Fetches all past appointments for history view
        return appointmentRepo.findAll().stream()
                .filter(a -> a.getDoctor().getId().equals(doctor.getId()))
                .sorted((a, b) -> b.getAppointmentTime().compareTo(a.getAppointmentTime()))
                .collect(Collectors.toList());
    }

    @GetMapping("/owner-history/{email}")
    public List<Appointment> getOwnerHistory(@PathVariable("email") String email) {
        User owner = userRepo.findByEmail(email).orElseThrow();
        return appointmentRepo.findAll().stream()
                .filter(a -> a.getOwner().getId().equals(owner.getId()))
                .filter(a -> a.getStatus() != null && a.getStatus().equals("COMPLETED"))
                // Sorting so the newest is first
                .sorted((a, b) -> b.getAppointmentTime().compareTo(a.getAppointmentTime()))
                .collect(Collectors.toList());
    }

    // New: Fetch all appointments for a user across all statuses (for Meetings
    // dashboard)
    @GetMapping("/owner-all/{email}")
    public List<Appointment> getAllOwnerAppointments(@PathVariable("email") String email) {
        User owner = userRepo.findByEmail(email).orElseThrow();
        return appointmentRepo.findAll().stream()
                .filter(a -> a.getOwner().getId().equals(owner.getId()))
                .sorted((a, b) -> b.getAppointmentTime().compareTo(a.getAppointmentTime()))
                .collect(Collectors.toList());
    }
}
