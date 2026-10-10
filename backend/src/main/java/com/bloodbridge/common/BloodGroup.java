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

    /**
     * Standard RBC / whole blood clinical compatibility rules.
     * Returns list of donor blood groups that this recipient blood group can safely receive.
     */
    public java.util.List<BloodGroup> getCompatibleDonorGroups() {
        return switch (this) {
            case A_POSITIVE -> java.util.List.of(A_POSITIVE, A_NEGATIVE, O_POSITIVE, O_NEGATIVE);
            case A_NEGATIVE -> java.util.List.of(A_NEGATIVE, O_NEGATIVE);
            case B_POSITIVE -> java.util.List.of(B_POSITIVE, B_NEGATIVE, O_POSITIVE, O_NEGATIVE);
            case B_NEGATIVE -> java.util.List.of(B_NEGATIVE, O_NEGATIVE);
            case AB_POSITIVE -> java.util.List.of(A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE);
            case AB_NEGATIVE -> java.util.List.of(AB_NEGATIVE, A_NEGATIVE, B_NEGATIVE, O_NEGATIVE);
            case O_POSITIVE -> java.util.List.of(O_POSITIVE, O_NEGATIVE);
            case O_NEGATIVE -> java.util.List.of(O_NEGATIVE);
        };
    }

    /**
     * Returns true if this recipient blood group can receive blood from the specified donor blood group.
     */
    public boolean canReceiveFrom(BloodGroup donorGroup) {
        if (donorGroup == null) return false;
        return getCompatibleDonorGroups().contains(donorGroup);
    }

    /**
     * Returns list of recipient blood groups that this donor blood group can safely donate to.
     */
    public java.util.List<BloodGroup> getCompatibleRecipientGroups() {
        return switch (this) {
            case A_POSITIVE -> java.util.List.of(A_POSITIVE, AB_POSITIVE);
            case A_NEGATIVE -> java.util.List.of(A_POSITIVE, A_NEGATIVE, AB_POSITIVE, AB_NEGATIVE);
            case B_POSITIVE -> java.util.List.of(B_POSITIVE, AB_POSITIVE);
            case B_NEGATIVE -> java.util.List.of(B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE);
            case AB_POSITIVE -> java.util.List.of(AB_POSITIVE);
            case AB_NEGATIVE -> java.util.List.of(AB_POSITIVE, AB_NEGATIVE);
            case O_POSITIVE -> java.util.List.of(O_POSITIVE, A_POSITIVE, B_POSITIVE, AB_POSITIVE);
            case O_NEGATIVE -> java.util.List.of(A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE);
        };
    }
}
