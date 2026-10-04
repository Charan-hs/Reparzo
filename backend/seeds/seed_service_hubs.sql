INSERT OR IGNORE INTO service_hubs (
  id, code, name, area, city, pincode, full_address, latitude, longitude, radius_km, base_eta_minutes, per_km_eta_minutes, is_active, display_order
) VALUES 
('hub-dvg-vid', 'DVG-VID-01', 'Vidyanagar Hub', 'Vidyanagar, Bapuji Institute Road', 'Davangere', '577005', 'Near Bapuji College, Vidyanagar, Davangere, Karnataka 577005', 14.4485, 75.9189, 10.0, 15, 2.0, 1, 1),
('hub-dvg-mcc', 'DVG-MCC-02', 'MCC ''B'' Block Hub', 'MCC ''B'' Block, Kuvempu Nagar', 'Davangere', '577004', 'Opposite Kuvempu Park, MCC ''B'' Block, Davangere, Karnataka 577004', 14.4690, 75.9220, 10.0, 15, 2.0, 1, 2),
('hub-dvg-pbr', 'DVG-PBR-03', 'PB Road Central Hub', 'PB Road, Clock Tower', 'Davangere', '577002', 'PB Road Central, City Center, Davangere, Karnataka 577002', 14.4660, 75.9260, 12.0, 15, 2.0, 1, 3),
('hub-dvg-nij', 'DVG-NIJ-04', 'Nijalingappa Layout Hub', 'Nijalingappa Layout, Ring Road', 'Davangere', '577004', 'Near Shamanur Shivashankarappa Hospital, Davangere, Karnataka 577004', 14.4550, 75.9350, 9.0, 18, 2.2, 1, 4),
('hub-dvg-ktj', 'DVG-KTJ-05', 'KTJ Nagar Hub', 'KTJ Nagar, Main Market', 'Davangere', '577002', 'Old Bus Stand Road, KTJ Nagar, Davangere, Karnataka 577002', 14.4750, 75.9120, 9.0, 18, 2.0, 1, 5);
