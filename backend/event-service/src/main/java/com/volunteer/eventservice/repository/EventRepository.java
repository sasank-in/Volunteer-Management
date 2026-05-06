package com.volunteer.eventservice.repository;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
  List<Event> findByOrganizerId(UUID organizerId);
  List<Event> findByStatus(EventStatus status);
  List<Event> findByEventDateAfter(LocalDateTime date);
  List<Event> findByStatusAndEventDateAfter(EventStatus status, LocalDateTime date);
  List<Event> findByStatusAndEventDateBetween(EventStatus status, LocalDateTime start, LocalDateTime end);

  /**
   * Atomically reserves a volunteer slot. Returns 1 if a slot was reserved,
   * 0 if the event is already full or in a non-OPEN state. The single SQL
   * statement makes the capacity check race-free.
   */
  @Modifying
  @Query(value = "UPDATE events SET registered_volunteers = registered_volunteers + 1, " +
      "status = CASE WHEN registered_volunteers + 1 >= required_volunteers THEN 'FULL' ELSE status END " +
      "WHERE id = :eventId AND status = 'OPEN' " +
      "AND registered_volunteers < required_volunteers", nativeQuery = true)
  int reserveSlot(@Param("eventId") UUID eventId);

  /**
   * Atomically releases a reserved slot when a volunteer cancels.
   */
  @Modifying
  @Query(value = "UPDATE events SET registered_volunteers = GREATEST(registered_volunteers - 1, 0), " +
      "status = CASE WHEN status = 'FULL' THEN 'OPEN' ELSE status END " +
      "WHERE id = :eventId", nativeQuery = true)
  int releaseSlot(@Param("eventId") UUID eventId);

  @Modifying
  @Query("UPDATE Event e SET e.organizerEmail = :email, e.organizerName = :name " +
      "WHERE e.organizerId = :organizerId")
  int updateOrganizerDenormalizedFields(@Param("organizerId") UUID organizerId,
      @Param("email") String email, @Param("name") String name);
}
