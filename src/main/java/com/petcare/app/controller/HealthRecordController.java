package com.petcare.app.controller;

import com.petcare.app.model.HealthRecord;
import com.petcare.app.model.Pet;
import com.petcare.app.repository.HealthRecordRepository;
import com.petcare.app.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "http://localhost:3000")
public class HealthRecordController {

    @Autowired
    private PetRepository petRepo;

    @Autowired
    private HealthRecordRepository healthRecordRepo;

    @PostMapping("/add-prescription")
    public ResponseEntity<?> addPrescription(@RequestBody Map<String, String> payload) {
        // Changed to use petId for better database accuracy
        Long petId = Long.parseLong(payload.get("petId"));
        String details = payload.get("details"); // This now contains the concatenated medication list
        String doctorEmail = payload.get("doctorEmail");

        // Find pet by ID instead of name to avoid conflicts with pets of the same name
        Pet pet = petRepo.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found with ID: " + petId));

        HealthRecord record = new HealthRecord();
        record.setPet(pet);

        // Saves the full list of tablets including schedules and courses
        record.setDetails("PRESCRIPTION by " + doctorEmail + ": " + details);
        record.setRecordType("PRESCRIPTION");

        // Requirement: Saves exact date and time of the prescription
        record.setDate(LocalDateTime.now());

        healthRecordRepo.save(record);
        return ResponseEntity.ok("Prescription Saved and Shared with Owner");
    }
}