package com.bloodbridge.common;

public enum RequestStatus {
    PENDING,
    APPROVED,
    FULFILLED,
    CANCELLED,
    REJECTED;

    public boolean canTransitionTo(RequestStatus target) {
        return switch (this) {
            case PENDING -> target == APPROVED || target == REJECTED || target == CANCELLED;
            case APPROVED -> target == FULFILLED || target == CANCELLED;
            case FULFILLED, CANCELLED, REJECTED -> false;
        };
    }
}
