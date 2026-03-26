package com.portiva.backend.service;

import com.portiva.backend.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Email service — HTML transactional emails via Spring Mail / Gmail SMTP.
 * All send operations are @Async — never blocks the request thread.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Send 6-digit OTP email — includes 10 minute expiry notice.
     */
    @Async
    public void sendOtpEmail(String toEmail, String name, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Your Portiva verification code");
            helper.setText(buildOtpEmailHtml(name, otp), true);

            mailSender.send(message);
            log.info("OTP email sent: email={}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email: email={} error={}", toEmail, e.getMessage());
        }
    }

    /**
     * Send welcome email after successful OTP verification.
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Portiva — let's build your portfolio!");
            helper.setText(buildWelcomeEmailHtml(name), true);

            mailSender.send(message);
            log.info("Welcome email sent: email={}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send welcome email: email={} error={}", toEmail, e.getMessage());
        }
    }

    private String buildOtpEmailHtml(String name, String otp) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify your Portiva account</title>
            </head>
            <body style="margin:0; padding:0; background-color:#f1f5f9;
                         font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

              <!-- Preheader (hidden preview text) -->
              <div style="display:none;max-height:0;overflow:hidden;color:#f1f5f9;">
                Your Portiva verification code is %s — expires in 10 minutes.
              </div>

              <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#f1f5f9; padding:40px 16px;">
                <tr>
                  <td align="center">

                    <!-- Card -->
                    <table width="560" cellpadding="0" cellspacing="0" role="presentation"
                           style="background:#ffffff; border-radius:20px;
                                  box-shadow:0 4px 32px rgba(0,0,0,0.07); overflow:hidden;">

                      <!-- Header band -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#6366f1 0%%,#8b5cf6 100%%);
                                   padding:36px 48px 32px;">
                          <table cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td>
                                <span style="font-size:26px; font-weight:800; color:#ffffff;
                                             letter-spacing:-0.5px;">Portiva</span>
                                <span style="font-size:12px; color:rgba(255,255,255,0.75);
                                             background:rgba(255,255,255,0.15); border-radius:20px;
                                             padding:3px 10px; margin-left:10px;
                                             vertical-align:middle; font-weight:500;">
                                  AI Portfolio Builder
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px 48px 32px;">

                          <p style="font-size:22px; font-weight:700; color:#0f172a;
                                    margin:0 0 8px; line-height:1.3;">
                            Hi %s, here's your verification code
                          </p>
                          <p style="font-size:15px; color:#64748b; margin:0 0 32px;
                                    line-height:1.6;">
                            Someone (hopefully you!) requested access to Portiva
                            using this email address. Enter the code below to
                            verify your account and get started.
                          </p>

                          <!-- OTP box -->
                          <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                                 style="margin-bottom:32px;">
                            <tr>
                              <td align="center"
                                  style="background:#f8faff; border:2px solid #e0e7ff;
                                         border-radius:16px; padding:28px 24px;">
                                <p style="margin:0 0 8px; font-size:12px; font-weight:600;
                                          color:#6366f1; letter-spacing:1.5px;
                                          text-transform:uppercase;">
                                  Verification Code
                                </p>
                                <p style="margin:0; font-size:48px; font-weight:800;
                                          letter-spacing:14px; color:#1e293b;
                                          font-variant-numeric:tabular-nums;">
                                  %s
                                </p>
                                <p style="margin:12px 0 0; font-size:13px; color:#94a3b8;">
                                  &#128274;&nbsp; Expires in <strong>10 minutes</strong>
                                </p>
                              </td>
                            </tr>
                          </table>

                          <!-- How to use -->
                          <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                                 style="background:#fafafa; border-radius:12px;
                                        border-left:4px solid #6366f1; margin-bottom:32px;">
                            <tr>
                              <td style="padding:16px 20px;">
                                <p style="margin:0; font-size:14px; color:#475569; line-height:1.6;">
                                  <strong style="color:#1e293b;">How to use:</strong>
                                  Go back to the Portiva registration page and enter this
                                  6-digit code. The code is single-use and valid for one session only.
                                </p>
                              </td>
                            </tr>
                          </table>

                          <!-- Security warning -->
                          <p style="font-size:13px; color:#94a3b8; margin:0;
                                    line-height:1.6; border-top:1px solid #f1f5f9; padding-top:24px;">
                            &#128276;&nbsp;<strong>Didn't request this?</strong>
                            If you did not try to create a Portiva account, please ignore this email —
                            no action is needed. Your email address will not be used.
                          </p>

                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#f8fafc; border-top:1px solid #e2e8f0;
                                   padding:24px 48px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td>
                                <p style="margin:0 0 6px; font-size:13px; font-weight:600;
                                          color:#6366f1;">
                                  Portiva — AI Portfolio Builder
                                </p>
                                <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">
                                  Build stunning AI-powered portfolios in minutes. &nbsp;|&nbsp;
                                  <a href="%s" style="color:#6366f1; text-decoration:none;">
                                    Visit Portiva
                                  </a>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                    <!-- /Card -->

                    <p style="margin:20px 0 0; font-size:11px; color:#94a3b8; text-align:center;">
                      &copy; 2025 Portiva. All rights reserved.
                    </p>

                  </td>
                </tr>
              </table>

            </body>
            </html>
            """.formatted(otp, name, otp, frontendUrl);
    }

    private String buildWelcomeEmailHtml(String name) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Portiva</title>
            </head>
            <body style="margin:0; padding:0; background-color:#f1f5f9;
                         font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

              <div style="display:none;max-height:0;overflow:hidden;color:#f1f5f9;">
                Welcome to Portiva, %s! Your portfolio journey starts now.
              </div>

              <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#f1f5f9; padding:40px 16px;">
                <tr>
                  <td align="center">

                    <table width="560" cellpadding="0" cellspacing="0" role="presentation"
                           style="background:#ffffff; border-radius:20px;
                                  box-shadow:0 4px 32px rgba(0,0,0,0.07); overflow:hidden;">

                      <!-- Header band -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#6366f1 0%%,#8b5cf6 100%%);
                                   padding:36px 48px 32px;">
                          <span style="font-size:26px; font-weight:800; color:#ffffff;
                                       letter-spacing:-0.5px;">Portiva</span>
                          <span style="font-size:12px; color:rgba(255,255,255,0.75);
                                       background:rgba(255,255,255,0.15); border-radius:20px;
                                       padding:3px 10px; margin-left:10px;
                                       vertical-align:middle; font-weight:500;">
                            AI Portfolio Builder
                          </span>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px 48px 32px;">

                          <p style="font-size:30px; margin:0 0 4px;">&#127881;</p>
                          <p style="font-size:22px; font-weight:700; color:#0f172a;
                                    margin:0 0 12px; line-height:1.3;">
                            Welcome aboard, %s!
                          </p>
                          <p style="font-size:15px; color:#64748b; margin:0 0 32px;
                                    line-height:1.6;">
                            Your email is verified and your free Portiva account is ready.
                            You're all set to build your AI-powered professional portfolio —
                            it takes less than 3 minutes.
                          </p>

                          <!-- Feature pills -->
                          <table cellpadding="0" cellspacing="0" role="presentation"
                                 style="margin-bottom:32px;">
                            <tr>
                              <td style="padding:8px 16px; background:#f0fdf4;
                                         border-radius:20px; font-size:13px;
                                         color:#16a34a; font-weight:600; margin-right:8px;">
                                &#10003;&nbsp; AI-generated in minutes
                              </td>
                            </tr>
                            <tr><td style="height:8px;"></td></tr>
                            <tr>
                              <td style="padding:8px 16px; background:#eff6ff;
                                         border-radius:20px; font-size:13px;
                                         color:#2563eb; font-weight:600;">
                                &#10003;&nbsp; Custom slug URL — portiva.com/yourname
                              </td>
                            </tr>
                            <tr><td style="height:8px;"></td></tr>
                            <tr>
                              <td style="padding:8px 16px; background:#fdf4ff;
                                         border-radius:20px; font-size:13px;
                                         color:#9333ea; font-weight:600;">
                                &#10003;&nbsp; Share in one click
                              </td>
                            </tr>
                          </table>

                          <!-- CTA -->
                          <a href="%s/create"
                             style="display:inline-block; background:linear-gradient(135deg,#6366f1,#8b5cf6);
                                    color:#ffffff; text-decoration:none; padding:16px 36px;
                                    border-radius:12px; font-weight:700; font-size:16px;
                                    letter-spacing:0.2px;">
                            Build My Portfolio &rarr;
                          </a>

                          <p style="font-size:13px; color:#94a3b8; margin:32px 0 0;
                                    line-height:1.6; border-top:1px solid #f1f5f9; padding-top:24px;">
                            Questions? Just reply to this email — we're happy to help.
                          </p>

                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#f8fafc; border-top:1px solid #e2e8f0;
                                   padding:24px 48px;">
                          <p style="margin:0 0 6px; font-size:13px; font-weight:600; color:#6366f1;">
                            Portiva — AI Portfolio Builder
                          </p>
                          <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">
                            Build stunning AI-powered portfolios in minutes. &nbsp;|&nbsp;
                            <a href="%s" style="color:#6366f1; text-decoration:none;">Visit Portiva</a>
                          </p>
                        </td>
                      </tr>

                    </table>

                    <p style="margin:20px 0 0; font-size:11px; color:#94a3b8; text-align:center;">
                      &copy; 2025 Portiva. All rights reserved.
                    </p>

                  </td>
                </tr>
              </table>

            </body>
            </html>
            """.formatted(name, name, frontendUrl, frontendUrl);
    }
}
