package com.petcare.app.controller;

import com.petcare.app.model.Pet;
import com.petcare.app.model.User;
import com.petcare.app.service.PetService;
import com.petcare.app.service.UserService;
import com.petcare.app.repository.VaccinationRecordRepository;
import com.petcare.app.repository.HealthRecordRepository;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "http://localhost:3000")
public class PetController {

    @Autowired
    private PetService petService;

    @Autowired
    private UserService userService; // Fixed: Resolves red error in IDE

    @Autowired
    private VaccinationRecordRepository vaccinationRepo;

    @Autowired
    private HealthRecordRepository healthRecordRepo;

    @PostMapping("/add")
    public Pet addPet(@RequestBody Pet pet, @RequestParam("email") String email) {
        User owner = userService.getUserByEmail(email);
        pet.setOwner(owner); // Links pet to owner in MySQL
        return petService.savePet(pet);
    }

    @GetMapping("/owner")
    public List<Pet> getPetsByOwner(@RequestParam("email") String email) {
        User owner = userService.getUserByEmail(email);
        return petService.getPetsByOwner(owner.getId());
    }

    // Returns each pet along with vaccinations and health records for doctor overview
    @GetMapping("/owner/full")
    public List<Map<String, Object>> getPetsWithHistory(@RequestParam("email") String email) {
        User owner = userService.getUserByEmail(email);
        Long ownerId = owner.getId();
        List<Pet> pets = petService.getPetsByOwner(ownerId);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Pet p : pets) {
            Map<String, Object> item = new HashMap<>();
            item.put("pet", p);
            item.put("vaccinations", vaccinationRepo.findByPetId(p.getId()));
            item.put("healthRecords", healthRecordRepo.findByPetId(p.getId()));
            out.add(item);
        }
        return out;
    }
}
