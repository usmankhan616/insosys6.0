package com.petcare.app.service;

import com.petcare.app.model.Pet;
import com.petcare.app.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PetService {
    @Autowired
    private PetRepository petRepository;

    public Pet savePet(Pet pet) {
        return petRepository.save(pet);
    }

    public List<Pet> getPetsByOwner(Long ownerId) {
        return petRepository
                .findByOwnerId(ownerId);
    }


}