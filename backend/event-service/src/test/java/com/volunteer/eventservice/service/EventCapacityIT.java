package com.volunteer.eventservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.volunteer.eventservice.IntegrationTestBase;
import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.EventStatus;
import com.volunteer.eventservice.repository.EventRepository;
import com.volunteer.eventservice.repository.ParticipationRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

/**
 * Verifies the atomic slot-reservation prevents oversubscription when
 * many volunteers register concurrently. Without
 * {@code EventRepository.reserveSlot}, this test will leak slots.
 */
class EventCapacityIT extends IntegrationTestBase {

  @Autowired
  private ParticipationService participationService;

  @Autowired
  private EventRepository eventRepository;

  @Autowired
  private ParticipationRepository participationRepository;

  private Event newOpenEvent(int capacity) {
    Event e = new Event();
    long stamp = System.nanoTime();
    e.setTitle("Capacity Test " + stamp);
    e.setSlug("capacity-test-" + stamp);
    e.setDescription("Test");
    e.setLocation("Test Hall");
    e.setEventDate(LocalDateTime.now().plusDays(7));
    e.setRequiredVolunteers(capacity);
    e.setRegisteredVolunteers(0);
    e.setOrganizerId(UUID.randomUUID());
    e.setOrganizerName("Org");
    e.setOrganizerEmail("org@example.com");
    e.setStatus(EventStatus.OPEN);
    return eventRepository.save(e);
  }

  @Test
  @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NEVER)
  void concurrentRegistrationsDoNotExceedCapacity() throws Exception {
    int capacity = 5;
    int contenders = 20;
    Event event = newOpenEvent(capacity);
    UUID eventId = event.getId();

    ExecutorService pool = Executors.newFixedThreadPool(10);
    CountDownLatch start = new CountDownLatch(1);
    AtomicInteger successes = new AtomicInteger();
    AtomicInteger rejections = new AtomicInteger();

    for (int i = 0; i < contenders; i++) {
      final int idx = i;
      pool.submit(() -> {
        try {
          start.await();
          participationService.registerForEvent(
              eventId,
              UUID.randomUUID(),
              "Volunteer " + idx,
              "v" + idx + "@example.com",
              null);
          successes.incrementAndGet();
        } catch (Exception e) {
          rejections.incrementAndGet();
        }
        return null;
      });
    }

    start.countDown();
    pool.shutdown();
    boolean finished = pool.awaitTermination(30, TimeUnit.SECONDS);
    assertThat(finished).isTrue();

    assertThat(successes.get()).as("at most capacity successes").isEqualTo(capacity);
    assertThat(rejections.get()).isEqualTo(contenders - capacity);

    Event reloaded = eventRepository.findById(eventId).orElseThrow();
    assertThat(reloaded.getRegisteredVolunteers()).isEqualTo(capacity);
    assertThat(reloaded.getStatus()).isEqualTo(EventStatus.FULL);

    List<?> participations = participationRepository.findByEventId(eventId);
    assertThat(participations).hasSize(capacity);
  }

  @Test
  @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NEVER)
  void cancellingFreesASlotForANewVolunteer() {
    Event event = newOpenEvent(2);
    UUID eventId = event.getId();
    UUID v1 = UUID.randomUUID();

    participationService.registerForEvent(eventId, v1, "V1", "v1@example.com", null);
    participationService.registerForEvent(eventId, UUID.randomUUID(), "V2", "v2@example.com", null);
    assertThat(eventRepository.findById(eventId).orElseThrow().getStatus()).isEqualTo(EventStatus.FULL);

    participationService.cancelParticipation(eventId, v1, null);
    Event reopened = eventRepository.findById(eventId).orElseThrow();
    assertThat(reopened.getStatus()).isEqualTo(EventStatus.OPEN);
    assertThat(reopened.getRegisteredVolunteers()).isEqualTo(1);

    participationService.registerForEvent(eventId, UUID.randomUUID(), "V3", "v3@example.com", null);
    Event finalState = eventRepository.findById(eventId).orElseThrow();
    assertThat(finalState.getRegisteredVolunteers()).isEqualTo(2);
    assertThat(finalState.getStatus()).isEqualTo(EventStatus.FULL);
  }
}
