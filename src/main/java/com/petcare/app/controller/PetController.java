package com.petcare.app.controller;

import com.petcare.app.model.Pet;
import com.petcare.app.model.User;
import com.petcare.app.service.PetService;
import com.petcare.app.service.UserService;
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

    @PostMapping("/add")
    public Pet addPet(@RequestBody Pet pet, @RequestParam String email) {
        User owner = userService.getUserByEmail(email);
        pet.setOwner(owner); // Links pet to owner in MySQL
        return petService.savePet(pet);
    }

    @GetMapping("/owner")
    public List<Pet> getPetsByOwner(@RequestParam String email) {
        User owner = userService.getUserByEmail(email);
        return petService.getPetsByOwner(owner.getId());
    }
}