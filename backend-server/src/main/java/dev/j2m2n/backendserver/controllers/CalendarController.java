package dev.j2m2n.backendserver.controllers;

import dev.j2m2n.backendserver.dtos.LostArkCalendarDto;
import dev.j2m2n.backendserver.services.LostArkApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final LostArkApiService lostArkApiService;

    @GetMapping
    public ResponseEntity<List<LostArkCalendarDto>> getCalendar() {
        return ResponseEntity.ok(lostArkApiService.getCalendar());
    }
}