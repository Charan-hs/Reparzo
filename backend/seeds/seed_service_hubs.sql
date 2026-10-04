INSERT OR IGNORE INTO service_hubs (
  id, code, name, area, city, pincode, full_address, latitude, longitude, radius_km, base_eta_minutes, per_km_eta_minutes, is_active, display_order
) VALUES 
('hub-blr-hsr', 'BLR-HSR-01', 'HSR Layout Sector 2 Hub', 'HSR Layout, Sector 2', 'Bengaluru', '560102', '14th Main Road, HSR Layout Sector 2, Bengaluru, Karnataka 560102', 12.9116, 77.6389, 8.0, 18, 2.0, 1, 1),
('hub-blr-kor', 'BLR-KOR-02', 'Koramangala 4th Block Hub', 'Koramangala 4th Block', 'Bengaluru', '560034', '80 Feet Road, 4th Block Koramangala, Bengaluru, Karnataka 560034', 12.9345, 77.6264, 7.5, 20, 2.2, 1, 2),
('hub-blr-ind', 'BLR-IND-03', 'Indiranagar 100ft Road Hub', 'Indiranagar 100ft Road', 'Bengaluru', '560038', '12th Main, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038', 12.9719, 77.6412, 8.0, 22, 2.0, 1, 3),
('hub-blr-whf', 'BLR-WHF-04', 'Whitefield Inner Circle Hub', 'Whitefield Inner Circle', 'Bengaluru', '560066', 'ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066', 12.9698, 77.7500, 10.0, 25, 2.5, 1, 4),
('hub-blr-jay', 'BLR-JAY-05', 'Jayanagar 4th T Block Hub', 'Jayanagar 4th T Block', 'Bengaluru', '560041', '11th Main, 4th Block Jayanagar, Bengaluru, Karnataka 560041', 12.9250, 77.5838, 7.0, 20, 2.0, 1, 5);
