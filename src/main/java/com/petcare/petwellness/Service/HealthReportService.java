package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Response.Report.HealthReportPdfDto;

public interface HealthReportService {

    HealthReportPdfDto generatePetHealthReport(Long petId, Long userId);
}
