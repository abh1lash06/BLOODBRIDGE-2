package com.bloodbridge.notification;

import com.bloodbridge.common.NotificationType;
import com.bloodbridge.exception.ForbiddenException;
import com.bloodbridge.exception.ResourceNotFoundException;
import com.bloodbridge.notification.dto.NotificationResponse;
import com.bloodbridge.security.UserPrincipal;
import com.bloodbridge.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(User recipient, String title, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(type);
        notification.setReadStatus(false);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(UserPrincipal currentUser, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(this::toResponse);
    }

    public NotificationResponse markAsRead(UserPrincipal currentUser, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Not authorized to access this notification");
        }

        notification.setReadStatus(true);
        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    public void markAllAsRead(UserPrincipal currentUser) {
        notificationRepository.markAllAsReadByRecipientId(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UserPrincipal currentUser) {
        return notificationRepository.countByRecipientIdAndReadStatus(currentUser.getId(), false);
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getNotificationType(),
                notification.isReadStatus(),
                notification.getCreatedAt()
        );
    }
}
