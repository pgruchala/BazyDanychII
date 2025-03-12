DROP TABLE IF EXISTS products;
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stockCount INTEGER DEFAULT 0,
    brand VARCHAR(100) NOT NULL,
    imageUrl TEXT,
    isAvailable BOOLEAN DEFAULT true,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ('Honorable', 'drones', 'Insert of Intralum Dev into L Brach Art, Perc Endo Approach', 3816.63, 41, 'GigaPulse', 'http://dummyimage.com/182x128.png/ff4444/ffffff', false, '2012-05-27T09:13:39Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ('Mrs', 'smart home devices', 'Restriction of Bladder with Intralum Dev, Perc Approach', 1541.48, 95, 'CyberWave', 'http://dummyimage.com/247x138.png/dddddd/000000', false, '2010-03-09T21:36:53Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ('Honorable', 'headphones', 'Extirpation of Matter from Stomach, Perc Endo Approach', 514.21, 33, 'TechNova', 'http://dummyimage.com/180x120.png/dddddd/000000', true, '2022-03-18T20:33:50Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ('Ms', 'office electronics', 'Supplement Right Fibula with Synth Sub, Perc Endo Approach', 2463.04, 29, 'TechFusion', 'http://dummyimage.com/120x161.png/5fa2dd/ffffff', true, '2025-06-28T01:24:13Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ('Dr', 'smart home devices', 'Excision of Brain, Open Approach', 3646.39, 89, 'GigaTech', 'http://dummyimage.com/237x217.png/cc0000/ffffff', false, '2022-04-05T10:20:33Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ('Mrs', 'headphones', 'Introduce Analg/Hypnot/Sedat in Pericard Cav, Perc', 2617.15, 93, 'ElectroPulse', 'http://dummyimage.com/122x235.png/cc0000/ffffff', false, '2016-07-16T00:50:17Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ('Mrs', 'smart home devices', 'Reattachment of Neck Skin, External Approach', 984.09, 49, 'TechLink', 'http://dummyimage.com/184x102.png/cc0000/ffffff', true, '2017-06-01T12:20:48Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ('Honorable', 'drones', 'Destruction of Cervical Vertebra, Perc Endo Approach', 3039.48, 65, 'ElectroLink', 'http://dummyimage.com/128x232.png/cc0000/ffffff', false, '2014-08-07T12:44:10Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ('Honorable', 'gaming consoles', 'Bypass R Int Iliac Art to L Int Ilia w Synth Sub, Perc Endo', 3396.83, 46, 'SmartTech', 'http://dummyimage.com/157x194.png/cc0000/ffffff', false, '2016-03-17T17:45:24Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Ms', 'e-readers', 'Measurement of Venous Pulse, Pulmonary, Open Approach', 2868.21, 20, 'GigaWave', 'http://dummyimage.com/243x216.png/cc0000/ffffff', true, '2014-09-02T09:41:46Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Rev', 'computer accessories', 'Drainage of Left Nipple, Endo', 1702.38, 43, 'ElectroPulse', 'http://dummyimage.com/168x107.png/ff4444/ffffff', false, '2010-04-19T23:57:16Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Mrs', 'audio equipment', 'Drainage of Left Hip Joint, Percutaneous Approach, Diagn', 2553.63, 26, 'DigitalTech', 'http://dummyimage.com/194x147.png/ff4444/ffffff', true, '2016-12-23T06:39:01Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Ms', 'smartwatches', 'Revision of Nonaut Sub in L Elbow Jt, Perc Endo Approach', 61.84, 77, 'PowerTech', 'http://dummyimage.com/172x231.png/cc0000/ffffff', true, '2014-05-10T22:15:47Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Ms', 'home appliances', 'Repair Buttock Subcutaneous Tissue and Fascia, Perc Approach', 1951.8, 13, 'CyberWave', 'http://dummyimage.com/244x133.png/dddddd/000000', false, '2021-05-02T06:46:33Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Mr', 'smartwatches', 'Insertion of Infusion Dev into L Verteb Art, Open Approach', 2814.73, 6, 'InnoPulse', 'http://dummyimage.com/237x135.png/ff4444/ffffff', false, '2015-05-30T21:36:52Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Ms', 'video game accessories', 'Replacement of Hepatic Artery with Nonaut Sub, Open Approach', 111.45, 22, 'SmartTech', 'http://dummyimage.com/137x249.png/cc0000/ffffff', true, '2025-06-02T04:53:53Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Mr', 'office electronics', 'Supplement Bladder with Autologous Tissue Substitute, Endo', 2651.34, 49, 'TechPulse', 'http://dummyimage.com/247x243.png/dddddd/000000', true, '2019-12-06T21:10:01Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Ms', 'laptops', 'Bypass L Brach Art to L Up Arm Art w Autol Art, Open', 3514.13, 8, 'CyberMax', 'http://dummyimage.com/163x144.png/5fa2dd/ffffff', false, '2018-12-22T06:24:50Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Dr', 'smart home devices', 'Repair Left Ankle Tendon, Open Approach', 1872.5, 51, 'TechVibe', 'http://dummyimage.com/243x195.png/5fa2dd/ffffff', false, '2012-09-28T00:10:23Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Mr', 'computer accessories', 'Excision of Right Vocal Cord, Percutaneous Approach, Diagn', 2240.42, 52, 'ElectroMax', 'http://dummyimage.com/113x225.png/5fa2dd/ffffff', true, '2017-07-18T05:50:07Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Mrs', 'computer accessories', 'Revision of Ext Fix in L Tarsal Jt, Open Approach', 1257.1, 54, 'ElectroTech', 'http://dummyimage.com/140x144.png/ff4444/ffffff', true, '2020-11-04T10:37:54Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Honorable', 'computer accessories', 'Drainage of Left Wrist Bursa and Ligament, Perc Approach', 1660.74, 80, 'ElectroFusion', 'http://dummyimage.com/192x210.png/dddddd/000000', false, '2024-05-21T17:39:28Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Honorable', 'home appliances', 'Extirpation of Matter from R Thumb Phalanx, Perc Approach', 2341.27, 29, 'DigitalTech', 'http://dummyimage.com/166x215.png/ff4444/ffffff', true, '2011-06-07T02:04:34Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Mrs', 'computer accessories', 'Revision of Synth Sub in Uterus & Cervix, Via Opening', 342.05, 57, 'SmartTech', 'http://dummyimage.com/222x106.png/dddddd/000000', false, '2025-05-25T17:10:47Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Honorable', 'laptops', 'Drainage of Skull, Percutaneous Endoscopic Approach, Diagn', 1022.44, 71, 'ElectroPulse', 'http://dummyimage.com/106x238.png/ff4444/ffffff', true, '2010-12-19T10:56:59Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Dr', 'drones', 'Excision of Superior Mesenteric Artery, Perc Approach', 2982.9, 29, 'ElectroLink', 'http://dummyimage.com/225x166.png/5fa2dd/ffffff', false, '2017-10-05T15:31:28Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Dr', 'computer accessories', 'Drainage of Left Internal Carotid Artery, Perc Approach', 1874.01, 4, 'InnoTech', 'http://dummyimage.com/192x175.png/dddddd/000000', false, '2013-08-09T21:26:31Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Ms', 'cameras', 'Bypass R Com Carotid to R Extracran Art w Autol Vn, Open', 3109.06, 18, 'ElectroLink', 'http://dummyimage.com/198x213.png/ff4444/ffffff', false, '2012-10-26T04:09:39Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Rev', 'computer accessories', 'Revision of Nonaut Sub in Hepatobil Duct, Open Approach', 3484.62, 29, 'InnoWave', 'http://dummyimage.com/167x175.png/dddddd/000000', true, '2018-08-03T02:10:39Z');
insert into products (name, category, description, price, stockCount, brand, imageUrl, isAvailable, createdAt) values ( 'Mrs', 'computer accessories', 'Replacement of L Ethmoid Bone with Autol Sub, Open Approach', 396.76, 19, 'ElectroVibe', 'http://dummyimage.com/120x153.png/ff4444/ffffff', false, '2023-04-17T18:59:08Z');

