
package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Response.Report.HealthReportDto;

public interface PdfGeneratorService {

    byte[] generateHealthReportPdf(HealthReportDto reportDto);

}
