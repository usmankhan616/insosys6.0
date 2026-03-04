package com.petcare.app.controller;

import com.petcare.app.model.Pet;
import com.petcare.app.model.VaccinationRecord;
import com.petcare.app.repository.PetRepository;
import com.petcare.app.repository.VaccinationRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vaccinations")
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class VaccinationController {

    @Autowired
    private VaccinationRecordRepository vaccinationRepo;

    @Autowired
    private PetRepository petRepo;

    // Get all vaccination records for a pet
    @GetMapping("/pet/{petId}")
    public List<VaccinationRecord> getByPet(@PathVariable("petId") Long petId) {
        return vaccinationRepo.findByPetId(petId);
    }

    // Get all vaccination records for all pets of an owner
    @GetMapping("/owner/{ownerId}")
    public List<VaccinationRecord> getByOwner(@PathVariable("ownerId") Long ownerId) {
        return vaccinationRepo.findByPetOwnerId(ownerId);
    }

    // Add a new vaccination record
    @PostMapping("/add")
    public ResponseEntity<?> addVaccination(@RequestBody Map<String, String> payload) {
        Long petId = Long.parseLong(payload.get("petId"));
        Pet pet = petRepo.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        VaccinationRecord record = new VaccinationRecord();
        record.setPet(pet);
        record.setVaccineName(payload.get("vaccineName"));
        record.setVaccineType(payload.get("vaccineType"));
        record.setDateAdministered(LocalDate.parse(payload.get("dateAdministered")));
        record.setNextDueDate(LocalDate.parse(payload.get("nextDueDate")));
        record.setVeterinarianName(payload.get("veterinarianName"));

        VaccinationRecord saved = vaccinationRepo.save(record);
        return ResponseEntity.ok(saved);
    }

    // Delete a vaccination record
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteVaccination(@PathVariable("id") Long id) {
        vaccinationRepo.deleteById(id);
        return ResponseEntity.ok("Vaccination record deleted");
    }

    // Mark or unmark vaccination as completed
    @PatchMapping("/complete/{id}")
    public ResponseEntity<?> setCompleted(@PathVariable("id") Long id, @RequestBody Map<String, Boolean> payload) {
        boolean completed = payload.getOrDefault("completed", true);
        VaccinationRecord rec = vaccinationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaccination record not found"));
        rec.setIsCompleted(completed);
        vaccinationRepo.save(rec);
        return ResponseEntity.ok(rec);
    }
}
