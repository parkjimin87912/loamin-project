package dev.j2m2n.backendserver.controllers;

import dev.j2m2n.backendserver.dtos.LostArkCharacterDto;
import dev.j2m2n.backendserver.services.LostArkApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/characters")
@RequiredArgsConstructor
public class CharacterController {

    private final LostArkApiService lostArkApiService;

    @GetMapping("/{characterName}")
    public LostArkCharacterDto getCharacterInfo(@PathVariable String characterName) {
        return lostArkApiService.getCharacterInfo(characterName);
    }
}