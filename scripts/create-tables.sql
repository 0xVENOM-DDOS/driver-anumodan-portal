-- Create the drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  valid_from DATE NOT NULL,
  valid_upto DATE NOT NULL,
  vehicle_number TEXT NOT NULL,
  license_number TEXT NOT NULL,
  dl_fetched BOOLEAN DEFAULT FALSE,
  anumodan_fetched BOOLEAN DEFAULT FALSE,
  certificate_file TEXT NOT NULL,
  certificate_url TEXT NOT NULL,
  certificate_size INTEGER NOT NULL,
  driver_photo_file TEXT,
  driver_photo_url TEXT,
  driver_photo_size INTEGER,
  license_photo_file TEXT,
  license_photo_url TEXT,
  license_photo_size INTEGER,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_drivers_name ON drivers(driver_name);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle ON drivers(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_drivers_license ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_drivers_date_added ON drivers(date_added);

-- Add unique constraints if needed
ALTER TABLE drivers ADD CONSTRAINT unique_vehicle_number UNIQUE(vehicle_number);
ALTER TABLE drivers ADD CONSTRAINT unique_license_number UNIQUE(license_number);
