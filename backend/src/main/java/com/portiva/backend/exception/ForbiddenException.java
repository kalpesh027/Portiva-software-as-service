package com.portiva.backend.exception;

public class ForbiddenException extends RuntimeException {
    private final boolean upgradeRequired;
    private final String requiredPlan;

    public ForbiddenException(String message) {
        super(message);
        this.upgradeRequired = false;
        this.requiredPlan = null;
    }

    public ForbiddenException(String message, String requiredPlan) {
        super(message);
        this.upgradeRequired = true;
        this.requiredPlan = requiredPlan;
    }

    public boolean isUpgradeRequired() { return upgradeRequired; }
    public String getRequiredPlan() { return requiredPlan; }
}
