package com.petcare.petwellness.DTO.Response;

import java.util.List;

public class AdminDashboardResponseDto {

    private long totalRegisteredUsers;
    private long pendingApprovalRequests;
    private long appointmentsBooked;
    private long marketplaceListings;
    private List<DashboardRegistrationPointDto> registrationTrend;
    private List<DashboardAppointmentPointDto> weeklyAppointments;
    private List<DashboardActivityItemDto> recentActivities;

    public long getTotalRegisteredUsers() {
        return totalRegisteredUsers;
    }

    public void setTotalRegisteredUsers(long totalRegisteredUsers) {
        this.totalRegisteredUsers = totalRegisteredUsers;
    }

    public long getPendingApprovalRequests() {
        return pendingApprovalRequests;
    }

    public void setPendingApprovalRequests(long pendingApprovalRequests) {
        this.pendingApprovalRequests = pendingApprovalRequests;
    }

    public long getAppointmentsBooked() {
        return appointmentsBooked;
    }

    public void setAppointmentsBooked(long appointmentsBooked) {
        this.appointmentsBooked = appointmentsBooked;
    }

    public long getMarketplaceListings() {
        return marketplaceListings;
    }

    public void setMarketplaceListings(long marketplaceListings) {
        this.marketplaceListings = marketplaceListings;
    }

    public List<DashboardRegistrationPointDto> getRegistrationTrend() {
        return registrationTrend;
    }

    public void setRegistrationTrend(List<DashboardRegistrationPointDto> registrationTrend) {
        this.registrationTrend = registrationTrend;
    }

    public List<DashboardAppointmentPointDto> getWeeklyAppointments() {
        return weeklyAppointments;
    }

    public void setWeeklyAppointments(List<DashboardAppointmentPointDto> weeklyAppointments) {
        this.weeklyAppointments = weeklyAppointments;
    }

    public List<DashboardActivityItemDto> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<DashboardActivityItemDto> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
