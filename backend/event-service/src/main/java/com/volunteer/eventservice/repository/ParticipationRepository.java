package com.volunteer.eventservice.repository;

import com.volunteer.eventservice.domain.Participation;
import com.volunteer.eventservice.domain.ParticipationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, UUID> {
  List<Participation> findByEventId(UUID eventId);
  List<Participation> findByVolunteerId(UUID volunteerId);
  Optional<Participation> findByEventIdAndVolunteerId(UUID eventId, UUID volunteerId);
  List<Participation> findByEventIdAndStatus(UUID eventId, ParticipationStatus status);
  long countByEventIdAndStatus(UUID eventId, ParticipationStatus status);

  @Modifying
  @Query("UPDATE Participation p SET p.volunteerEmail = :email, p.volunteerName = :name " +
      "WHERE p.volunteerId = :volunteerId")
  int updateVolunteerDenormalizedFields(@Param("volunteerId") UUID volunteerId,
      @Param("email") String email, @Param("name") String name);
}
