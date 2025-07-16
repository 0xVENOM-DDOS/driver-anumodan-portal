-- Insert sample driver data for testing
INSERT INTO drivers (
  driver_name,
  date_of_birth,
  valid_from,
  valid_upto,
  vehicle_number,
  license_number,
  dl_fetched,
  anumodan_fetched,
  certificate_file,
  certificate_url,
  certificate_size
) VALUES 
(
  'John Smith',
  '1985-03-15',
  '2024-01-01',
  '2024-12-31',
  'ABC-1234',
  'DL123456789',
  true,
  true,
  'john_smith_certificate.pdf',
  'https://example.com/sample.pdf',
  1024000
),
(
  'Sarah Johnson',
  '1990-07-22',
  '2024-02-01',
  '2025-01-31',
  'XYZ-5678',
  'DL987654321',
  false,
  true,
  'sarah_johnson_certificate.pdf',
  'https://example.com/sample.pdf',
  1024000
),
(
  'Mike Wilson',
  '1988-11-10',
  '2024-03-01',
  '2024-11-30',
  'DEF-9012',
  'DL456789123',
  true,
  false,
  'mike_wilson_certificate.pdf',
  'https://example.com/sample.pdf',
  1024000
)
ON CONFLICT (vehicle_number) DO NOTHING;
