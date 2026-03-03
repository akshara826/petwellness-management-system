package com.petcare.petwellness.Service.ServiceImp;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.petcare.petwellness.DTO.Response.Report.HealthReportDto;
import com.petcare.petwellness.Exceptions.CustomException.PdfGenerationException;
import com.petcare.petwellness.Service.PdfGeneratorService;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayOutputStream;

@Service
public class PdfGeneratorServiceImp implements PdfGeneratorService {

    private final SpringTemplateEngine templateEngine;

    public PdfGeneratorServiceImp(SpringTemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    @Override
    public byte[] generateHealthReportPdf(HealthReportDto reportDto) {

        String templateName = "health-report";
        String htmlContent;

        try {
            Context context = new Context();
            context.setVariable("report", reportDto);

            htmlContent = templateEngine.process(templateName, context);
        } catch (Exception e) {
            throw new PdfGenerationException(
                    "TEMPLATE_RENDER",
                    "Failed to render template '" + templateName + "'",
                    e
            );
        }

        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(outputStream);
            builder.run();

            return outputStream.toByteArray();
        } catch (Exception e) {
            int htmlLength = htmlContent == null ? 0 : htmlContent.length();
            throw new PdfGenerationException(
                    "PDF_RENDER",
                    "Failed to render PDF from template '" + templateName + "'. HTML length=" + htmlLength,
                    e
            );
        }
    }
}
