package com.petcare.app.controller;

import com.petcare.app.model.HealthRecord;
import com.petcare.app.model.Pet;
import com.petcare.app.repository.HealthRecordRepository;
import com.petcare.app.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "http://localhost:3000")
public class HealthRecordController {

    @Autowired
    private PetRepository petRepo;

    @Autowired
    private HealthRecordRepository healthRecordRepo;

    // GET all health records for a specific pet
    @GetMapping("/pet/{petId}")
    public List<HealthRecord> getRecordsByPet(@PathVariable("petId") Long petId) {
        return healthRecordRepo.findByPetId(petId);
    }

    @PostMapping("/add-prescription")
    public ResponseEntity<?> addPrescription(@RequestBody Map<String, String> payload) {
        // Log incoming payload and headers for debugging when called from browser
        System.out.println("[HealthRecordController] add-prescription called. payload=" + payload);
        try {
            HttpServletRequest request = ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes()).getRequest();
            System.out.println("[HealthRecordController] Origin header: " + request.getHeader("Origin") + ", Referer: " + request.getHeader("Referer"));
        } catch (Exception e) {
            // ignore logging failures
        }
        try {
            // Try to read petId first; fall back to petName lookup if not provided
            String petIdStr = payload.get("petId");
            Pet pet = null;
            if (petIdStr != null && !petIdStr.isBlank()) {
                Long petId = Long.parseLong(petIdStr);
                pet = petRepo.findById(petId).orElse(null);
            }

            // If pet not found by id, try lookup by name
            if (pet == null && payload.get("petName") != null) {
                pet = petRepo.findByName(payload.get("petName")).stream().findFirst().orElse(null);
            }

            if (pet == null) return ResponseEntity.status(400).body("Pet not found");

            String details = payload.getOrDefault("details", "");
            String doctorEmail = payload.getOrDefault("doctorEmail", "unknown");

            HealthRecord record = new HealthRecord();
            record.setPet(pet);
            record.setDetails("PRESCRIPTION by " + doctorEmail + ":\n" + details);
            record.setRecordType("PRESCRIPTION");
            record.setDate(LocalDateTime.now());

            HealthRecord saved = healthRecordRepo.save(record);
            System.out.println("[HealthRecordController] Prescription saved for petId=" + pet.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save prescription: " + ex.getMessage());
        }
    }

    // Generic endpoint to add a medical/clinical history record (used by doctors)
    @PostMapping("/add-record")
    public ResponseEntity<?> addRecord(@RequestBody Map<String, String> payload) {
        try {
            String petIdStr = payload.get("petId");
            Pet pet = null;
            if (petIdStr != null && !petIdStr.isBlank()) {
                Long petId = Long.parseLong(petIdStr);
                pet = petRepo.findById(petId).orElse(null);
            }
            if (pet == null && payload.get("petName") != null) {
                pet = petRepo.findByName(payload.get("petName")).stream().findFirst().orElse(null);
            }
            if (pet == null) return ResponseEntity.status(400).body("Pet not found");

            String details = payload.getOrDefault("details", "");
            String recordType = payload.getOrDefault("recordType", "MEDICAL_HISTORY");
            String doctorEmail = payload.getOrDefault("doctorEmail", "unknown");

            HealthRecord record = new HealthRecord();
            record.setPet(pet);
            record.setDetails(details);
            record.setRecordType(recordType);
            record.setDate(LocalDateTime.now());

            HealthRecord saved = healthRecordRepo.save(record);
            System.out.println("[HealthRecordController] Record (" + recordType + ") saved for petId=" + pet.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save record: " + ex.getMessage());
        }
    }
}
