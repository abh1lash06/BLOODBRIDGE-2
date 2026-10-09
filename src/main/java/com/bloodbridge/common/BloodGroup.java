package com.bloodbridge.common;

public enum BloodGroup {
    A_POSITIVE("A+"),
    A_NEGATIVE("A-"),
    B_POSITIVE("B+"),
    B_NEGATIVE("B-"),
    AB_POSITIVE("AB+"),
    AB_NEGATIVE("AB-"),
    O_POSITIVE("O+"),
    O_NEGATIVE("O-");

    private final String displayLabel;

    BloodGroup(String displayLabel) {
        this.displayLabel = displayLabel;
    }

    public String getDisplayLabel() {
        return displayLabel;
    }

    public String getLabel() {
        return displayLabel;
    }

    public static BloodGroup fromDisplayLabel(String label) {
        for (BloodGroup bg : values()) {
            if (bg.displayLabel.equals(label)) {
                return bg;
            }
        }
        throw new IllegalArgumentException("Unknown blood group label: " + label);
    }
}
