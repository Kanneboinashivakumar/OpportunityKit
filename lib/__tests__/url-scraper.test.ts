import { describe, it, expect } from 'vitest';
import { isPrivateIP, extractCleanTextFromHtml } from '../url-scraper';

describe('url-scraper SSRF protection (isPrivateIP)', () => {
  it('identifies loopback addresses as private', () => {
    expect(isPrivateIP('127.0.0.1')).toBe(true);
    expect(isPrivateIP('127.10.20.30')).toBe(true);
    expect(isPrivateIP('::1')).toBe(true);
  });

  it('identifies RFC 1918 private ranges as private', () => {
    // 10.0.0.0/8
    expect(isPrivateIP('10.0.0.1')).toBe(true);
    expect(isPrivateIP('10.254.254.254')).toBe(true);

    // 172.16.0.0/12
    expect(isPrivateIP('172.16.0.1')).toBe(true);
    expect(isPrivateIP('172.31.255.255')).toBe(true);
    expect(isPrivateIP('172.32.0.1')).toBe(false); // public

    // 192.168.0.0/16
    expect(isPrivateIP('192.168.1.1')).toBe(true);
    expect(isPrivateIP('192.168.254.1')).toBe(true);
  });

  it('identifies cloud metadata and link-local addresses as private', () => {
    expect(isPrivateIP('169.254.169.254')).toBe(true);
    expect(isPrivateIP('169.254.1.1')).toBe(true);
    expect(isPrivateIP('fe80::1')).toBe(true);
  });

  it('allows safe public IP addresses', () => {
    expect(isPrivateIP('8.8.8.8')).toBe(false);
    expect(isPrivateIP('1.1.1.1')).toBe(false);
    expect(isPrivateIP('142.250.190.46')).toBe(false);
  });
});

describe('extractCleanTextFromHtml', () => {
  it('extracts page title correctly', () => {
    const html = '<html><head><title>Google Summer Internship 2025</title></head><body><h1>Internship</h1><p>Requirements: Python</p></body></html>';
    const result = extractCleanTextFromHtml(html);
    expect(result.title).toBe('Google Summer Internship 2025');
    expect(result.text).toContain('Internship');
    expect(result.text).toContain('Requirements: Python');
  });

  it('strips script and style tags and leaves plain readable text', () => {
    const html = `
      <html>
        <head><title>Tech Fellow</title></head>
        <style>.hidden { display: none; }</style>
        <script>alert("malicious");</script>
        <body>
          <nav>Navigation links</nav>
          <h1>Fellowship Program</h1>
          <p>Must have CGPA &gt;= 8.0 &amp; 3rd year standing.</p>
          <footer>Footer copyright 2025</footer>
        </body>
      </html>
    `;
    const result = extractCleanTextFromHtml(html);
    expect(result.title).toBe('Tech Fellow');
    expect(result.text).not.toContain('alert');
    expect(result.text).not.toContain('.hidden');
    expect(result.text).not.toContain('Navigation links');
    expect(result.text).not.toContain('Footer copyright');
    expect(result.text).toContain('Fellowship Program');
    expect(result.text).toContain('CGPA >= 8.0 & 3rd year');
  });
});
