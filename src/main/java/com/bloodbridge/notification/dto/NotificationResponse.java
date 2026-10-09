package com.bloodbridge.notification.dto;

import com.bloodbridge.common.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    String title,
    String message,
    NotificationType notificationType,
    boolean readStatus,
    LocalDateTime createdAt
) {}
