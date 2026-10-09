package com.bloodbridge.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);
    
    @Modifying
    @Query("UPDATE Notification n SET n.readStatus = true WHERE n.recipient.id = :userId")
    void markAllAsReadByRecipientId(@Param("userId") Long userId);
    
    long countByRecipientIdAndReadStatus(Long recipientId, boolean readStatus);
}
