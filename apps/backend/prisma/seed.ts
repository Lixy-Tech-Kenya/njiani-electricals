import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PRODUCT_CATEGORIES } from '@njiani/shared';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── 1. Admin user ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@2024', 10);
  await prisma.user.upsert({
    where: { email: 'admin@njiani.co.ke' },
    update: { passwordHash },
    create: {
      email: 'admin@njiani.co.ke',
      passwordHash,
      name: 'Njiani Admin',
      role: 'ADMIN',
    },
  });
  console.log('✓ Admin user: admin@njiani.co.ke / Admin@2024');

  // ─── 2. Categories (all 21) ─────────────────────────────────────────────────
  const categoryMap = new Map<string, string>();
  for (let i = 0; i < PRODUCT_CATEGORIES.length; i++) {
    const catName = PRODUCT_CATEGORIES[i];
    const slug = slugify(catName, { lower: true, strict: true });
    const category = await prisma.category.upsert({
      where: { name: catName },
      update: { sortOrder: i },
      create: { name: catName, slug, sortOrder: i },
    });
    categoryMap.set(catName, category.id);
  }
  console.log(`✓ ${PRODUCT_CATEGORIES.length} categories seeded`);

  // ─── 3. Sample products ─────────────────────────────────────────────────────
  // Catalogue products extracted from supplier PDFs (local uploads)
  const catalogueProducts = [
    {
      name: "Aluminium Wall Bracket Light E27",
      sku: 'WB-001',
      price: 38000,
      category: "Wall Brackets",
      description: "Classic E27 wall bracket fitting in powder-coated aluminium. Suitable for verandas, corridors and compound walls. IP44 rated.",
      isFeatured: true,
      imageUrls: ['/uploads/f72865cb-813c-4e16-a6e2-818598276572.jpeg'],
    },
    {
      name: "Modern LED Twin-Head Wall Sconce",
      sku: 'WB-002',
      price: 62000,
      category: "Wall Brackets",
      description: "Contemporary twin-head LED wall light, 2x5W warm white. Brushed chrome finish. Ideal for bedroom and living room feature walls.",
      isFeatured: true,
      imageUrls: ['/uploads/2502e708-0671-489e-ac1a-72a354e73407.jpeg'],
    },
    {
      name: "Outdoor Solar Wall Light with PIR",
      sku: 'WB-003',
      price: 85000,
      category: "Wall Brackets",
      description: "Solar-powered wall light with passive infrared motion sensor. Auto-activates at dusk, switches off at dawn. IP65 rated.",
      isFeatured: true,
      imageUrls: ['/uploads/c0bdb0b6-e161-494a-9fe6-d69c099619be.jpeg'],
    },
    {
      name: "Garden Lawn Post Light 60cm",
      sku: 'UDL-001',
      price: 72000,
      category: "Up & Down Lights",
      description: "60cm aluminium post light for garden lawns and pathways. E27 socket, IP65. Powder-coated black finish.",
      isFeatured: true,
      imageUrls: ['/uploads/be7819c6-4fbf-444d-968b-c7bfcdf16cc4.jpeg'],
    },
    {
      name: "Brushed Steel Up-Down Wall Light",
      sku: 'UDL-002',
      price: 54000,
      category: "Up & Down Lights",
      description: "Architectural up-down wall fitting in brushed steel. Creates dramatic light patterns on wall surfaces. 2xGU10 sockets.",
      isFeatured: false,
      imageUrls: ['/uploads/59b86a18-9a55-4d57-8962-7f4914a242c8.jpeg'],
    },
    {
      name: "Vintage Outdoor Wall Lantern E27",
      sku: 'WB-004',
      price: 48000,
      category: "Wall Brackets",
      description: "Traditional lantern-style wall fitting with seeded glass panels. E27 socket. IP44 weatherproof. Antique bronze finish.",
      isFeatured: false,
      imageUrls: ['/uploads/b2cb37ba-5ab4-4e17-8b6f-2e41bf3062ed.jpeg'],
    },
    {
      name: "LED Courtyard Lawn Bollard 80cm",
      sku: 'UDL-003',
      price: 96000,
      category: "Up & Down Lights",
      description: "Stainless steel bollard light for driveways and courtyards. 8W LED, 3000K warm white. IP65. 80cm height.",
      isFeatured: false,
      imageUrls: ['/uploads/606c9e33-223d-4a4f-9307-59f1c87b96b4.jpeg'],
    },
    {
      name: "Waterproof Recessed Step Light 3W",
      sku: 'STL-001',
      price: 32000,
      category: "Staircase Lights",
      description: "Low-profile 3W LED step light for indoor and outdoor staircases. Cool white 6000K. IP65. Aluminium face plate.",
      isFeatured: false,
      imageUrls: ['/uploads/55bd8fb4-f0c5-4e8e-945c-9fafeaf74af5.jpeg'],
    },
    {
      name: "Compound Gate Wall Fitting E27",
      sku: 'WB-005',
      price: 42000,
      category: "Wall Brackets",
      description: "Sturdy die-cast aluminium gate fitting for compound walls. E27 socket. IP54 rated. Suitable for security and decorative use.",
      isFeatured: false,
      imageUrls: ['/uploads/5f9c448f-ff21-4eae-bc6f-3ea2a4656216.jpeg'],
    },
    {
      name: "Solar Garden Pathway Spike Light 4pk",
      sku: 'OG-002',
      price: 28000,
      category: "Outdoor & Garden Electrical Accessories",
      description: "Pack of 4 solar spike lights for garden paths and flower beds. 6-hour runtime. Stainless steel stake. Auto dusk-to-dawn.",
      isFeatured: false,
      imageUrls: ['/uploads/dabbb96e-17db-4d60-9c13-0443edac8b3d.jpeg'],
    },
    {
      name: "Crystal Pendant Light 3-Head",
      sku: 'CH-002',
      price: 120000,
      category: "Chandeliers",
      description: "Elegant 3-head crystal pendant light for dining tables and islands. G9 sockets. Chrome finish. Adjustable cable length.",
      isFeatured: true,
      imageUrls: ['/uploads/ce51679c-098c-41ae-88a0-f5a9c64479b6.jpeg'],
    },
    {
      name: "LED Panel Light 60x60cm 48W",
      sku: 'OFL-001',
      price: 95000,
      category: "Office Lights",
      description: "Recessed 60x60cm LED panel, 48W, 4000K neutral white. Suitable for offices, schools and retail spaces. Flicker-free driver.",
      isFeatured: true,
      imageUrls: ['/uploads/6bd1e0f5-ca78-4e77-b65d-c1e7221fab0e.jpeg'],
    },
    {
      name: "Decorative String Lights 10m 100-LED",
      sku: 'STR-001',
      price: 35000,
      category: "String Lights",
      description: "10-metre warm white fairy string lights with 100 LEDs and 8 lighting modes. Ideal for events, parties and indoor decor.",
      isFeatured: true,
      imageUrls: ['/uploads/dc373e7c-68ea-4024-8ede-99e0cb3108c2.jpeg'],
    },
    {
      name: "LED Mirror Light 50cm Warm White",
      sku: 'MIR-001',
      price: 68000,
      category: "Mirror Lights",
      description: "50cm bathroom mirror light, IP44, warm white 3000K. Chrome finish. Easy surface mount. Ideal above vanity mirrors.",
      isFeatured: false,
      imageUrls: ['/uploads/335143f3-1c52-4e4c-8c70-55d0f2a62041.jpeg'],
    },
    {
      name: "LED Staircase Step Light 3W Round",
      sku: 'STL-002',
      price: 27000,
      category: "Staircase Lights",
      description: "Round 3W LED recessed step light for staircases and skirting boards. Aluminium body, cool white. IP20 for indoor use.",
      isFeatured: false,
      imageUrls: ['/uploads/639a952f-7a80-43f9-bbfc-6be9698fd051.jpeg'],
    },
    {
      name: "Round LED Ceiling Light 24W",
      sku: 'LCL-002',
      price: 48000,
      category: "LED Ceiling Lights",
      description: "Slim round LED ceiling light, 24W, 6000K cool white. No bulb required. Flush-mount. Suitable for bedrooms and offices.",
      isFeatured: false,
      imageUrls: ['/uploads/7b1c251e-b5af-45a6-93c1-db07a4471c78.jpeg'],
    },
    {
      name: "Smart Touch Dimmer Switch 1-Gang",
      sku: 'SW-002',
      price: 22000,
      category: "Switches",
      description: "Touch-sensitive dimmer switch compatible with LED and incandescent bulbs. Tempered glass panel. UK standard fitting.",
      isFeatured: false,
      imageUrls: ['/uploads/8d5c75f5-3035-43e5-b0e7-7a5978d2dd55.jpeg'],
    },
    {
      name: "LED Tube Light 18W T8 1.2m",
      sku: 'OFL-002',
      price: 18000,
      category: "Office Lights",
      description: "18W T8 LED tube, 1.2m, 6500K daylight. Direct replacement for fluorescent tubes. 1800lm output. Frosted diffuser.",
      isFeatured: false,
      imageUrls: ['/uploads/2976f361-a396-4a6b-9bc8-22ab03152c8a.jpeg'],
    },
    {
      name: "Decorative Cat Out 4A DP 2-Pack",
      sku: 'CAT-001',
      price: 12000,
      category: "Cat Outs",
      description: "4A double-pole cat out fuse carrier with base. Pack of 2. BS1361 compliant. Suitable for household distribution boards.",
      isFeatured: false,
      imageUrls: ['/uploads/5b1e7b7a-b9ba-46bb-8edf-35f6729c44c2.jpeg'],
    },
    {
      name: "Fancy Cluster Pendant Chandelier 12-Arm",
      sku: 'CH-003',
      price: 185000,
      category: "Chandeliers",
      description: "Multi-arm cluster pendant chandelier with 12 adjustable G4 arms. Rose-gold finish. Creates a dramatic focal point. 120cm span.",
      isFeatured: false,
      imageUrls: ['/uploads/2c28bd31-a5ca-47d5-b83e-3461457bd941.jpeg'],
    },
    {
      name: "LED Downlight 7W GU10 Recessed",
      sku: 'LCL-003',
      price: 15000,
      category: "LED Ceiling Lights",
      description: "7W GU10 LED recessed downlight, cool white 6000K. Tiltable head. Compatible with standard GU10 downlight frames. 600lm.",
      isFeatured: false,
      imageUrls: ['/uploads/06bd9aa4-fdaf-4bdd-b14e-03f989de7964.jpeg'],
    },
    {
      name: "40-LED Rechargeable Emergency Lamp",
      sku: 'RL-002',
      price: 78000,
      category: "Rechargeable Lamps",
      description: "Portable 40-LED rechargeable lamp with 10-hour battery backup. Hook and wall bracket included. Auto-activation on power cut.",
      isFeatured: false,
      imageUrls: ['/uploads/f20ad174-240d-4a76-b25d-5987472f23c9.jpeg'],
    },
    {
      name: "Single-Phase Digital Power Meter",
      sku: 'PM-001',
      price: 145000,
      category: "Power Meters",
      description: "DIN-rail single-phase digital energy meter. Measures kWh, voltage, current and power factor. LCD display. MID approved.",
      isFeatured: false,
      imageUrls: ['/uploads/ee9d96ea-a004-4199-b240-ab49bf8a144a.jpeg'],
    },
    {
      name: "Warm White Fairy String Lights 5m",
      sku: 'STR-002',
      price: 22000,
      category: "String Lights",
      description: "5m warm white LED string lights on copper wire. Battery powered, 3 modes. Flexible and bendable. Ideal for jars and decor.",
      isFeatured: false,
      imageUrls: ['/uploads/b78aef74-d84e-4d3f-911f-903f4e64210a.jpeg'],
    },
    {
      name: "LED Mirror Front Bar Light 80cm",
      sku: 'MIR-002',
      price: 95000,
      category: "Mirror Lights",
      description: "80cm LED mirror bar light, IP44, 4000K neutral white. Horizontal or vertical mount. Chrome finish. 900lm output.",
      isFeatured: false,
      imageUrls: ['/uploads/10c2c834-864a-4c16-9876-fd1348715af5.jpeg'],
    },
    {
      name: "Modern K9 Crystal Chandelier 18-Head",
      sku: 'CH-004',
      price: 280000,
      category: "Chandeliers",
      description: "Grand 18-head K9 crystal chandelier for living rooms and hotel lobbies. Chrome frame. LED G9 compatible. 80cm diameter.",
      isFeatured: true,
      imageUrls: ['/uploads/53eee44b-1a60-4ca4-b96f-d961edcc9c13.jpeg'],
    },
    {
      name: "200W Solar LED Floodlight with Remote",
      sku: 'SFL-002',
      price: 185000,
      category: "Solar Floodlights",
      description: "200W high-output solar floodlight with remote control and adjustable solar panel. Motion sensor, 3 modes. IP67 waterproof.",
      isFeatured: true,
      imageUrls: ['/uploads/7c377695-07e0-43fc-8881-4e3a21d8fe5e.jpeg'],
    },
    {
      name: "80W Slim LED Floodlight IP65",
      sku: 'LF-002',
      price: 75000,
      category: "LED Floodlights",
      description: "Slim-profile 80W LED floodlight, 6400lm, cool white. Die-cast aluminium housing. IP65 waterproof. For outdoor security.",
      isFeatured: true,
      imageUrls: ['/uploads/85559eac-6b66-47ac-87d4-6cf1d94c245c.jpeg'],
    },
    {
      name: "All-in-One Solar Streetlight 100W",
      sku: 'SSL-002',
      price: 320000,
      category: "Solar Streetlights",
      description: "100W all-in-one integrated solar streetlight. Built-in LiFePO4 battery. Motion-sensing 3-step dimming. 10-year panel life.",
      isFeatured: true,
      imageUrls: ['/uploads/c9438bff-5e85-4041-b6ed-778cd9d3f18f.jpeg'],
    },
    {
      name: "13A Double Socket White Switched",
      sku: 'SOC-002',
      price: 18000,
      category: "Sockets (Waterproof & Non-Waterproof)",
      description: "Standard 13A double socket with individual switches. White polycarbonate face plate. BS standard. Child-proof safety shutters.",
      isFeatured: false,
      imageUrls: ['/uploads/89b2254c-ad42-4217-9cb9-1f5dfc8c2d87.jpeg'],
    },
    {
      name: "13A Single Socket with USB-A Port",
      sku: 'SOC-003',
      price: 22000,
      category: "Sockets (Waterproof & Non-Waterproof)",
      description: "13A single socket with integrated USB-A charging port (2.1A). White finish. UK standard back box fitting.",
      isFeatured: false,
      imageUrls: ['/uploads/d01b41c6-ca7e-478f-85ab-6b327a003377.jpeg'],
    },
    {
      name: "2-Gang 1-Way Wall Switch White",
      sku: 'SW-003',
      price: 8500,
      category: "Switches",
      description: "Standard 2-gang 1-way wall switch, white, 10A. Screwless clip-on face plate. Fits standard UK 35mm back boxes.",
      isFeatured: false,
      imageUrls: ['/uploads/dbf17203-042e-4aeb-b003-ba8bad4649fa.jpeg'],
    },
    {
      name: "150W Dual-Head Solar Floodlight",
      sku: 'SFL-003',
      price: 245000,
      category: "Solar Floodlights",
      description: "150W dual-head solar floodlight with 180-degree adjustable panels and heads. PIR motion sensor. IP67. Comes with remote.",
      isFeatured: false,
      imageUrls: ['/uploads/c60fa583-ef88-4010-b0dc-1a3b7cedbc78.jpeg'],
    },
    {
      name: "100W LED Floodlight IP66",
      sku: 'LF-003',
      price: 98000,
      category: "LED Floodlights",
      description: "100W IP66 LED floodlight with 9000lm output. Suitable for sports courts, warehouses and parking areas. 50,000hr rated life.",
      isFeatured: false,
      imageUrls: ['/uploads/b8cfbccc-532c-4669-8f01-5d6914f86257.jpeg'],
    },
    {
      name: "60W Integrated Solar Streetlight",
      sku: 'SSL-003',
      price: 195000,
      category: "Solar Streetlights",
      description: "60W all-in-one solar street light with integrated MPPT controller and lithium battery. Auto on/off, 3-step motion dimming.",
      isFeatured: false,
      imageUrls: ['/uploads/e4e3f104-f17f-44fc-9752-a7f1007b5d37.jpeg'],
    },
    {
      name: "1.5mm 3-Core PVC Cable 100m",
      sku: 'EC-001',
      price: 85000,
      category: "Electrical Cables",
      description: "100m drum of 1.5mm 3-core PVC-insulated and sheathed cable. Suitable for domestic lighting circuits. BS6004 compliant.",
      isFeatured: false,
      imageUrls: ['/uploads/afd3d6ca-29e1-4694-aff8-50b5eaee0ef3.jpeg'],
    },
    {
      name: "2.5mm 4-Core Armoured Cable 50m",
      sku: 'EC-002',
      price: 145000,
      category: "Electrical Cables",
      description: "50m 2.5mm 4-core steel wire armoured (SWA) cable. For underground and outdoor runs. BS5467 compliant. Gland pack included.",
      isFeatured: false,
      imageUrls: ['/uploads/fb067d26-cade-4866-950e-bd32da4a11b2.jpeg'],
    },
    {
      name: "4-Way Extension Board 2m Surge",
      sku: 'EX-002',
      price: 22000,
      category: "Extension Cables",
      description: "2-metre 4-way extension board with surge protection and individual rocker switches. 13A rated. Child-safety shutters.",
      isFeatured: false,
      imageUrls: ['/uploads/b83402fb-35ef-4f2b-acc6-b9b880706a0c.jpeg'],
    },
    {
      name: "6-Way Surge Protected Extension Lead",
      sku: 'EX-003',
      price: 32000,
      category: "Extension Cables",
      description: "6-way surge-protected extension lead, 3m cable, 3000J surge rating. Master switch. Suitable for computers and AV equipment.",
      isFeatured: false,
      imageUrls: ['/uploads/0485b2be-8a8b-4904-a2b7-c0d7501881fe.jpeg'],
    },
    {
      name: "3-Phase Digital Energy Meter",
      sku: 'PM-002',
      price: 280000,
      category: "Power Meters",
      description: "DIN-rail 3-phase 4-wire digital energy meter. Measures kWh, voltage, current, PF and THD per phase. RS485 Modbus output.",
      isFeatured: false,
      imageUrls: ['/uploads/d6974f4d-750a-45d7-853b-5fa8bff5bd56.jpeg'],
    },
    {
      name: "32A Double-Pole MCB Breaker",
      sku: 'CAT-002',
      price: 18000,
      category: "Cat Outs",
      description: "32A 6kA double-pole miniature circuit breaker (MCB), Type B curve. DIN rail mount. IEC 60898-1 certified.",
      isFeatured: false,
      imageUrls: ['/uploads/68c4f5de-4524-40c3-9474-74ceb58b7b03.jpeg'],
    },
    {
      name: "Copper Earth Bar 25mm Strip 3m",
      sku: 'CT-001',
      price: 75000,
      category: "Copper Tapes & Lightning Arrestors",
      description: "25mm x 3m bare copper earth bar strip for earthing systems. 99.9% copper purity. Suitable for LV panels and earth electrodes.",
      isFeatured: false,
      imageUrls: ['/uploads/bbd951b6-5521-49d3-9303-a0d327e33bd9.jpeg'],
    },
    {
      name: "Lightning Arrestor Class C 10kA",
      sku: 'CT-002',
      price: 95000,
      category: "Copper Tapes & Lightning Arrestors",
      description: "Class C (Type 3) surge protection device (SPD), 10kA max discharge, 275V. DIN rail mount. LED status indicator.",
      isFeatured: false,
      imageUrls: ['/uploads/0549c9cb-fbe6-47a5-a135-f9a8591a05d7.jpeg'],
    },
    {
      name: "LED Office Troffer Light 40W 600x600",
      sku: 'OFL-003',
      price: 125000,
      category: "Office Lights",
      description: "40W recessed LED troffer for suspended ceilings. 600x600mm. 4000K neutral white, 4000lm. UGR<19. Flicker-free driver.",
      isFeatured: false,
      imageUrls: ['/uploads/5e072889-283f-46ad-9e36-93ed429c8f3f.jpeg'],
    },
    {
      name: "LED High Bay Light 150W UFO",
      sku: 'OFL-004',
      price: 210000,
      category: "Office Lights",
      description: "150W UFO LED high bay light for warehouses and workshops. 19500lm, 6000K, IP65. Hanging bracket included.",
      isFeatured: false,
      imageUrls: ['/uploads/3501a68a-2095-4b3f-9a20-501ffcda1bc3.jpeg'],
    },
    {
      name: "LED Strip Light Kit 5m 24W 12V",
      sku: 'STR-003',
      price: 45000,
      category: "String Lights",
      description: "5m SMD5050 LED strip, 24W, warm white 3000K with 12V power supply. Self-adhesive backing. Cuttable every 3 LEDs. IP20.",
      isFeatured: false,
      imageUrls: ['/uploads/94a1a3a8-dba3-47c3-b34c-55069f71bd29.jpeg'],
    },
    {
      name: "Smart WiFi Double Socket 13A",
      sku: 'SOC-004',
      price: 38000,
      category: "Sockets (Waterproof & Non-Waterproof)",
      description: "13A smart WiFi double socket. Controls via app, Alexa and Google Home. Energy monitoring built-in. White finish. UK standard.",
      isFeatured: false,
      imageUrls: ['/uploads/a8573855-0bdf-4297-bd8d-49d9225836a6.jpeg'],
    },
    {
      name: "80W Automatic Solar Streetlight",
      sku: 'SSL-004',
      price: 240000,
      category: "Solar Streetlights",
      description: "80W automatic all-in-one solar streetlight with scheduled on/off and 50% mid-night dimming. IP66. 5-year panel warranty.",
      isFeatured: false,
      imageUrls: ['/uploads/6d04b6cd-e036-4b8d-9f9a-97c2d156226b.jpeg'],
    },
    {
      name: "Rose Gold Crystal Ceiling Chandelier 24-Head",
      sku: 'CH-005',
      price: 350000,
      category: "Chandeliers",
      description: "Luxurious 24-head rose-gold crystal chandelier with K9 crystal drops. LED G9 compatible. 100cm diameter. For large rooms.",
      isFeatured: false,
      imageUrls: ['/uploads/17d17b76-f9cc-4779-ba10-30eba4cfa60d.jpeg'],
    },
    {
      name: "30-LED Rechargeable Emergency Lantern",
      sku: 'RL-003',
      price: 68000,
      category: "Rechargeable Lamps",
      description: "Portable folding 30-LED rechargeable lantern with handle. 8-hour runtime, 3 brightness levels. USB-C charging port.",
      isFeatured: false,
      imageUrls: ['/uploads/6f4512a2-a6d5-4849-9fab-ff146e576cb1.jpeg'],
    },
  ];

  const sampleProducts = [
    // Featured (first 4)
    {
      name: 'Modern Crystal Chandelier 24-Head',
      sku: 'CH-001',
      price: 1500000,
      category: 'Chandeliers',
      description:
        'Elegant 24-head crystal chandelier for modern dining rooms and living areas. Energy-efficient LED bulbs included. Ceiling mount kit provided.',
      isFeatured: true,
      imageUrls: ['/uploads/53478c60-368e-4606-8199-57cf6b3619f6.jpeg'],
    },
    {
      name: 'Solar Floodlight 100W with Remote',
      sku: 'SFL-001',
      price: 850000,
      category: 'Solar Floodlights',
      description:
        'High-brightness 100W solar floodlight with motion sensor and remote control. Automatic dusk-to-dawn operation. IP67 waterproof rating.',
      isFeatured: true,
      imageUrls: ['/uploads/f25cb21d-45cb-4803-98e2-70f9a3052eb7.jpeg'],
    },
    {
      name: 'LED Ceiling Light 36W Round',
      sku: 'LED-001',
      price: 320000,
      category: 'LED Ceiling Lights',
      description:
        'Slim 36W LED ceiling light with cool white illumination. Flush mount design suitable for bedrooms, offices and corridors. No bulbs required.',
      isFeatured: true,
      imageUrls: ['/uploads/3325d4ca-47ae-432e-aa6a-af61ea778012.jpeg'],
    },
    {
      name: 'Solar LED Streetlight 60W All-in-One',
      sku: 'SSL-001',
      price: 2200000,
      category: 'Solar Streetlights',
      description:
        'All-in-one solar streetlight with built-in panel, battery and LED chip. Suitable for roads, parking lots and compounds. Auto on/off with motion sensing.',
      isFeatured: true,
      imageUrls: ['/uploads/4a002499-4939-4e0f-992b-f71dd707cc10.png'],
    },
    // Non-featured
    {
      name: 'Smart WiFi Switch (Single Gang)',
      sku: 'SW-001',
      price: 185000,
      category: 'Switches',
      description:
        'Smart single-gang WiFi switch compatible with Alexa and Google Home. Requires neutral wire. Fits standard UK wall boxes.',
      isFeatured: false,
      imageUrls: ['/uploads/bf8a21c2-0ec5-4a61-944a-32cb93ce3f51.jpeg'],
    },
    {
      name: 'Weatherproof Outdoor Wall Light',
      sku: 'OG-001',
      price: 450000,
      category: 'Outdoor & Garden Electrical Accessories',
      description:
        'IP65-rated outdoor wall lantern for gates, verandas and compound entrances. Warm white E27 bulb socket. Powder-coated aluminium body.',
      isFeatured: false,
      imageUrls: ['/uploads/dc4d40df-8af3-4ac6-b9cc-a5a6de268c5f.jpeg'],
    },
    {
      name: 'Heavy Duty Extension Cable 5m (4-Way)',
      sku: 'EX-001',
      price: 180000,
      category: 'Extension Cables',
      description:
        '5-metre 4-way extension cable with surge protection and individual switches per socket. 13A rated. Child safety shutters on all sockets.',
      isFeatured: false,
      imageUrls: ['/uploads/1f9d04b3-5d47-4d4c-9ac2-42097f8850d2.jpeg'],
    },
    {
      name: 'LED Floodlight 50W (Cool White)',
      sku: 'LF-001',
      price: 280000,
      category: 'LED Floodlights',
      description:
        'Slim 50W LED floodlight for security lighting and sports courts. IP65 waterproof. Die-cast aluminium housing. 4500 lumens output.',
      isFeatured: false,
      imageUrls: ['/uploads/267e79e7-110e-4735-bda7-774463232266.jpeg'],
    },
    {
      name: 'Waterproof Double Socket (IP66)',
      sku: 'SOC-001',
      price: 125000,
      category: 'Sockets (Waterproof & Non-Waterproof)',
      description:
        'IP66-rated outdoor double socket with protective covers. Suitable for garages, bathrooms and outdoor kitchens. 13A, BS standard.',
      isFeatured: false,
      imageUrls: ['/uploads/4ebe0731-389f-479a-823d-fde8cac4e0c0.jpeg'],
    },
    {
      name: 'Rechargeable Emergency Lamp 30 LED',
      sku: 'RL-001',
      price: 95000,
      category: 'Rechargeable Lamps',
      description:
        'Portable 30-LED rechargeable lamp with up to 8 hours backup. Wall-mount bracket included. Auto-activates during power outages.',
      isFeatured: false,
      imageUrls: ['/uploads/8a25bad5-fca9-417e-8366-dacbddb8a268.jpeg'],
    },
    {
      name: 'Cable Junction Box IP65 Weatherproof',
      sku: 'OTH-001',
      price: 8500,
      category: 'Other Items',
      description: 'IP65-rated weatherproof cable junction box for outdoor electrical connections. Grey polycarbonate body with knock-outs. 100x100x60mm.',
      isFeatured: false,
      imageUrls: ['/uploads/bb82f18d-e520-4dfd-8f8e-4afcf7e7d087.jpeg'],
    },
  ];

  const allProducts = [...sampleProducts, ...catalogueProducts];

  // Remove any legacy products not in the current seed
  const currentSkus = allProducts.map(p => p.sku);
  await prisma.product.deleteMany({ where: { sku: { notIn: currentSkus } } });

  let created = 0;
  for (const p of allProducts) {
    const slug = slugify(p.name, { lower: true, strict: true });
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        slug,
        price: p.price,
        description: p.description,
        imageUrls: p.imageUrls,
        isFeatured: p.isFeatured,
        categoryId: categoryMap.get(p.category)!,
      },
      create: {
        name: p.name,
        sku: p.sku,
        slug,
        price: p.price,
        description: p.description,
        categoryId: categoryMap.get(p.category)!,
        status: 'ACTIVE',
        isFeatured: p.isFeatured,
        stockQuantity: 50,
        lowStockThreshold: 5,
        imageUrls: p.imageUrls,
      },
    });
    created++;
  }
  const featuredCount = allProducts.filter(p => p.isFeatured).length;
  console.log(`✓ ${created} products seeded (${featuredCount} featured)`);

  console.log('\n🎉 Seed complete!');
  console.log('   Admin login: admin@njiani.co.ke / Admin@2024');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
