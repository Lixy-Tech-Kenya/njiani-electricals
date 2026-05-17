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
      imageUrls: ['/uploads/f72865cb-813c-4e16-a6e2-818598276572.jpeg', '/uploads/ebb424d4-0819-44b1-ac1c-74666cf6df7f.jpeg', '/uploads/8a587c62-d955-46ae-b777-34350302e360.jpeg', '/uploads/d4156713-5682-497b-86b8-7266dd4c2724.jpeg', '/uploads/96792fcd-2f23-4451-bfbc-b343e95fd4cc.jpeg', '/uploads/1ad2a816-1dd2-4083-bd6a-b552f51e6da0.jpeg'],
    },
    {
      name: "Modern LED Twin-Head Wall Sconce",
      sku: 'WB-002',
      price: 62000,
      category: "Wall Brackets",
      description: "Contemporary twin-head LED wall light, 2x5W warm white. Brushed chrome finish. Ideal for bedroom and living room feature walls.",
      isFeatured: true,
      imageUrls: ['/uploads/2502e708-0671-489e-ac1a-72a354e73407.jpeg', '/uploads/80a92143-958a-406c-9b63-e1193b1e3f10.jpeg', '/uploads/9dd16030-a847-4ae5-b4b4-b354d2d5d30d.jpeg', '/uploads/21b014ae-6fcd-4e95-879e-0e372f6bc415.jpeg', '/uploads/91c96e61-b05c-4a5b-969d-57e7542c6749.jpeg', '/uploads/14c0a990-445f-424d-9250-2afb80be48e1.jpeg'],
    },
    {
      name: "Outdoor Solar Wall Light with PIR",
      sku: 'WB-003',
      price: 85000,
      category: "Wall Brackets",
      description: "Solar-powered wall light with passive infrared motion sensor. Auto-activates at dusk, switches off at dawn. IP65 rated.",
      isFeatured: true,
      imageUrls: ['/uploads/c0bdb0b6-e161-494a-9fe6-d69c099619be.jpeg', '/uploads/0766be76-b19b-4930-9a42-14fb71152306.jpeg', '/uploads/4793363b-54be-4a47-afd6-a5e0c0cd4cab.jpeg', '/uploads/e3788535-dbad-4cf1-abd1-51381e90e1fc.jpeg', '/uploads/385bf82c-db68-4e09-a90a-790512fa3d42.jpeg', '/uploads/0333550c-1070-4cc4-9801-8ac570f9ba32.jpeg'],
    },
    {
      name: "Garden Lawn Post Light 60cm",
      sku: 'UDL-001',
      price: 72000,
      category: "Up & Down Lights",
      description: "60cm aluminium post light for garden lawns and pathways. E27 socket, IP65. Powder-coated black finish.",
      isFeatured: true,
      imageUrls: ['/uploads/be7819c6-4fbf-444d-968b-c7bfcdf16cc4.jpeg', '/uploads/7fa785af-9a93-49c3-af6e-00e7de551e4d.png', '/uploads/91034bc5-1d07-48af-a78f-2c07ac15b554.png', '/uploads/63fa7308-986a-409f-88fe-a187ddb4e99b.jpeg', '/uploads/6dfb93dd-c2a0-4290-b639-00c9806f05f3.jpeg', '/uploads/59f94e8d-eb5a-4876-83cd-f505be88eb69.jpeg'],
    },
    {
      name: "Brushed Steel Up-Down Wall Light",
      sku: 'UDL-002',
      price: 54000,
      category: "Up & Down Lights",
      description: "Architectural up-down wall fitting in brushed steel. Creates dramatic light patterns on wall surfaces. 2xGU10 sockets.",
      isFeatured: false,
      imageUrls: ['/uploads/59b86a18-9a55-4d57-8962-7f4914a242c8.jpeg', '/uploads/8dcd7fb9-5bfe-4434-af49-e45308f2cf49.jpeg', '/uploads/773b42a5-ceab-47c6-b4c2-25eeefac868c.jpeg', '/uploads/4a63cf2f-30e4-4601-a340-6bae8e0fe73a.jpeg', '/uploads/8713eda1-632b-4008-9f46-e79a23a936db.jpeg', '/uploads/db44db05-ac3e-4ba9-8caa-9ba26a4d2ebd.jpeg'],
    },
    {
      name: "Vintage Outdoor Wall Lantern E27",
      sku: 'WB-004',
      price: 48000,
      category: "Wall Brackets",
      description: "Traditional lantern-style wall fitting with seeded glass panels. E27 socket. IP44 weatherproof. Antique bronze finish.",
      isFeatured: false,
      imageUrls: ['/uploads/b2cb37ba-5ab4-4e17-8b6f-2e41bf3062ed.jpeg', '/uploads/bd1a7d33-f20e-44f4-b588-22b6a0f13a26.jpeg', '/uploads/05dab02d-eefa-4262-807a-14c422fe2416.jpeg', '/uploads/e363a6ad-deb0-4ecc-9b88-d76c1e5281f6.jpeg', '/uploads/e3d9f255-92a4-4d8b-9ba4-1e4df56a6263.jpeg', '/uploads/196bb8ac-4c68-4da0-8a4c-10c85aa32047.jpeg'],
    },
    {
      name: "LED Courtyard Lawn Bollard 80cm",
      sku: 'UDL-003',
      price: 96000,
      category: "Up & Down Lights",
      description: "Stainless steel bollard light for driveways and courtyards. 8W LED, 3000K warm white. IP65. 80cm height.",
      isFeatured: false,
      imageUrls: ['/uploads/606c9e33-223d-4a4f-9307-59f1c87b96b4.jpeg', '/uploads/f92f433f-cbf8-47df-bdfe-24cb7fdf2c2c.jpeg', '/uploads/4559ae1c-a4ad-4a36-9c26-4cbb3c58376d.jpeg', '/uploads/0f898442-146b-4665-b1d6-ecb1663a87e6.jpeg', '/uploads/4a29ab80-f9a7-4042-8d6b-45be6900e215.jpeg', '/uploads/d07634bb-1c58-4a23-aad9-a47fc034c634.jpeg'],
    },
    {
      name: "Waterproof Recessed Step Light 3W",
      sku: 'STL-001',
      price: 32000,
      category: "Staircase Lights",
      description: "Low-profile 3W LED step light for indoor and outdoor staircases. Cool white 6000K. IP65. Aluminium face plate.",
      isFeatured: false,
      imageUrls: ['/uploads/55bd8fb4-f0c5-4e8e-945c-9fafeaf74af5.jpeg', '/uploads/2bbc53a7-2f0a-44d2-81ba-ebf065fcce69.jpeg', '/uploads/95f0bbdc-2aa4-4243-b66f-ecc7235d8742.jpeg', '/uploads/de528b29-5066-48ce-9978-76b5a683c81d.jpeg', '/uploads/ba7cfae2-58c5-48c5-8165-d8cb5fc66e53.jpeg', '/uploads/f61b07ba-ea10-47bc-9476-6509e2fdaf4e.png'],
    },
    {
      name: "Compound Gate Wall Fitting E27",
      sku: 'WB-005',
      price: 42000,
      category: "Wall Brackets",
      description: "Sturdy die-cast aluminium gate fitting for compound walls. E27 socket. IP54 rated. Suitable for security and decorative use.",
      isFeatured: false,
      imageUrls: ['/uploads/5f9c448f-ff21-4eae-bc6f-3ea2a4656216.jpeg', '/uploads/4763fe7e-058a-438f-bf38-0f99aeac294b.png', '/uploads/bdcf4f81-5c06-4317-803e-aba164d56b0c.jpeg', '/uploads/0e12a8e2-de4c-442d-9ad3-3f0f1d51cd47.jpeg', '/uploads/2c30d7f0-42a1-491f-a97d-7c024e5c4ae1.jpeg', '/uploads/b0d1655c-3c36-44f4-8e39-d0f37b78b0a0.jpeg'],
    },
    {
      name: "Solar Garden Pathway Spike Light 4pk",
      sku: 'OG-002',
      price: 28000,
      category: "Outdoor & Garden Electrical Accessories",
      description: "Pack of 4 solar spike lights for garden paths and flower beds. 6-hour runtime. Stainless steel stake. Auto dusk-to-dawn.",
      isFeatured: false,
      imageUrls: ['/uploads/dabbb96e-17db-4d60-9c13-0443edac8b3d.jpeg', '/uploads/dfde35fc-233f-4392-ba70-3f045bec1a7d.jpeg', '/uploads/97b8931c-5886-4f41-8cc7-39d9d02b134c.jpeg', '/uploads/eb418e46-e755-4d45-af37-6072aa6faecc.jpeg', '/uploads/03f22714-c265-465f-9962-e1d662c85af5.jpeg', '/uploads/7b90b539-7e2f-432c-8e45-d5c1a00ba3ed.jpeg'],
    },
    {
      name: "Crystal Pendant Light 3-Head",
      sku: 'CH-002',
      price: 120000,
      category: "Chandeliers",
      description: "Elegant 3-head crystal pendant light for dining tables and islands. G9 sockets. Chrome finish. Adjustable cable length.",
      isFeatured: true,
      imageUrls: ['/uploads/ce51679c-098c-41ae-88a0-f5a9c64479b6.jpeg', '/uploads/74c6c7fe-c269-4d9c-9dfd-612935603d17.jpeg', '/uploads/810c281a-c3c0-40fa-9b69-fbbed44ffe92.jpeg', '/uploads/1622b0f5-8fc2-46bc-bd17-8db99545d8ee.jpeg', '/uploads/7a2adb17-9578-4bc3-9d5b-7f9564b05ff5.jpeg', '/uploads/59ea08f9-ed9b-4636-98aa-47620de295fc.jpeg'],
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
      imageUrls: ['/uploads/639a952f-7a80-43f9-bbfc-6be9698fd051.jpeg', '/uploads/eacc5411-aaf2-4bd6-9e81-5c240724f5e3.png', '/uploads/a3e1bbc3-f231-43f5-baeb-0d595a28bed6.jpeg', '/uploads/c1affb7a-01ea-418c-86be-f24476e98b36.jpeg', '/uploads/bdda9db0-fe87-45ae-a43a-41d5333ce70a.jpeg', '/uploads/f4dee2a1-7e80-4cf7-b0ab-f7a29ee78625.jpeg'],
    },
    {
      name: "Round LED Ceiling Light 24W",
      sku: 'LCL-002',
      price: 48000,
      category: "LED Ceiling Lights",
      description: "Slim round LED ceiling light, 24W, 6000K cool white. No bulb required. Flush-mount. Suitable for bedrooms and offices.",
      isFeatured: false,
      imageUrls: ['/uploads/7b1c251e-b5af-45a6-93c1-db07a4471c78.jpeg', '/uploads/94bcfc1c-4ade-4a93-84d1-53c647c68d87.jpeg', '/uploads/ed9c8018-ef8c-4305-a5c8-77ce8fb9ddc5.jpeg', '/uploads/25909fcf-8121-43f2-950a-8993234521d8.jpeg', '/uploads/b571f6c5-442f-4bdd-bef7-112f6ee0e558.jpeg', '/uploads/7151e65f-c6c9-4900-a4de-7b5bc2ed6138.jpeg'],
    },
    {
      name: "Smart Touch Dimmer Switch 1-Gang",
      sku: 'SW-002',
      price: 22000,
      category: "Switches",
      description: "Touch-sensitive dimmer switch compatible with LED and incandescent bulbs. Tempered glass panel. UK standard fitting.",
      isFeatured: false,
      imageUrls: ['/uploads/8d5c75f5-3035-43e5-b0e7-7a5978d2dd55.jpeg', '/uploads/48bf41fa-13da-4f2d-a821-e1c034c11c31.jpeg', '/uploads/bdfbfc52-0129-4c89-88b5-7aa3f9da661b.jpeg', '/uploads/68cf21ff-6d63-4da5-9c17-46e742565dd9.jpeg', '/uploads/30efb04f-30e8-403f-80ca-fec785812727.jpeg', '/uploads/b4190dfa-a0b0-44a8-9f11-aa28a65f067b.jpeg'],
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
      imageUrls: ['/uploads/5b1e7b7a-b9ba-46bb-8edf-35f6729c44c2.jpeg', '/uploads/20c40656-375b-4bb9-ad1a-17fa8b345156.jpeg', '/uploads/15c218f9-c3e7-4369-848c-3266056e842f.jpeg', '/uploads/4fabb237-554d-41d8-af43-6589aa7da565.jpeg', '/uploads/dad9acfb-475e-4a84-8e14-5bb75430a2ba.jpeg', '/uploads/9aabc453-4731-4ca0-811e-b4198a7e7389.jpeg'],
    },
    {
      name: "Fancy Cluster Pendant Chandelier 12-Arm",
      sku: 'CH-003',
      price: 185000,
      category: "Chandeliers",
      description: "Multi-arm cluster pendant chandelier with 12 adjustable G4 arms. Rose-gold finish. Creates a dramatic focal point. 120cm span.",
      isFeatured: false,
      imageUrls: ['/uploads/2c28bd31-a5ca-47d5-b83e-3461457bd941.jpeg', '/uploads/d0d74f68-494b-4e84-9944-8a0095c7078a.jpeg', '/uploads/cd1a0f9e-23a2-4f9b-9b5f-d583ec49fd77.jpeg', '/uploads/f44ab319-2f68-4c9c-8d5b-e83f6c57fa63.jpeg', '/uploads/d0f0af77-c37d-44ae-aa84-212c46d97b58.jpeg', '/uploads/bfc9d854-0218-4152-8050-3b77c3b08658.jpeg'],
    },
    {
      name: "LED Downlight 7W GU10 Recessed",
      sku: 'LCL-003',
      price: 15000,
      category: "LED Ceiling Lights",
      description: "7W GU10 LED recessed downlight, cool white 6000K. Tiltable head. Compatible with standard GU10 downlight frames. 600lm.",
      isFeatured: false,
      imageUrls: ['/uploads/06bd9aa4-fdaf-4bdd-b14e-03f989de7964.jpeg', '/uploads/7bfe85e5-aad2-4f3c-bbb8-0bfa0bd23283.jpeg', '/uploads/3227d8dc-1d6f-4fcc-a6f8-fcad05156e0d.jpeg', '/uploads/7bbb1eda-81c4-4aff-820e-52c2d8cde07d.jpeg', '/uploads/b3f8d1d9-79cf-4c35-81f3-c7a26cf95b0a.jpeg', '/uploads/05807dd8-8137-4326-82b3-083c4dc0cc01.jpeg'],
    },
    {
      name: "40-LED Rechargeable Emergency Lamp",
      sku: 'RL-002',
      price: 78000,
      category: "Rechargeable Lamps",
      description: "Portable 40-LED rechargeable lamp with 10-hour battery backup. Hook and wall bracket included. Auto-activation on power cut.",
      isFeatured: false,
      imageUrls: ['/uploads/f20ad174-240d-4a76-b25d-5987472f23c9.jpeg', '/uploads/e8c26e3f-a036-4938-a53a-45d83c41e4c2.jpeg', '/uploads/a6d3169b-4130-4a13-ae54-24a70cb05371.jpeg', '/uploads/116c2e07-ebb5-4afb-804d-d8816630987a.jpeg', '/uploads/f2437c21-3733-437f-806a-cda9bf6485a5.jpeg', '/uploads/d8b4056a-b87c-40ba-a616-3838a9b35241.jpeg'],
    },
    {
      name: "Single-Phase Digital Power Meter",
      sku: 'PM-001',
      price: 145000,
      category: "Power Meters",
      description: "DIN-rail single-phase digital energy meter. Measures kWh, voltage, current and power factor. LCD display. MID approved.",
      isFeatured: false,
      imageUrls: ['/uploads/ee9d96ea-a004-4199-b240-ab49bf8a144a.jpeg', '/uploads/06961fca-7ba8-4230-a780-0442fb2146c0.jpeg', '/uploads/f149c5b1-74fc-46ca-97d7-4a9cb5727233.jpeg', '/uploads/67901bea-bff3-4651-ba7d-80c4388f2f47.jpeg', '/uploads/01eff7ee-0ecb-4562-baa6-ad700a74c2ea.jpeg', '/uploads/e75f7f48-61a9-45dc-a417-477d8540b53d.jpeg'],
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
      imageUrls: ['/uploads/53eee44b-1a60-4ca4-b96f-d961edcc9c13.jpeg', '/uploads/c33de70d-fca7-410f-b6d0-a62e2166768b.jpeg', '/uploads/e66fbcb6-8068-4bfc-8348-beb636f04bb5.jpeg', '/uploads/7c7c581c-fb4f-4a05-9fb6-5b52660ce340.jpeg', '/uploads/b3e8b835-1d6e-40c1-968b-d47c647ef39c.jpeg', '/uploads/3d255edb-5ab0-447c-abf4-9df9f47df6ba.jpeg'],
    },
    {
      name: "200W Solar LED Floodlight with Remote",
      sku: 'SFL-002',
      price: 185000,
      category: "Solar Floodlights",
      description: "200W high-output solar floodlight with remote control and adjustable solar panel. Motion sensor, 3 modes. IP67 waterproof.",
      isFeatured: true,
      imageUrls: ['/uploads/7c377695-07e0-43fc-8881-4e3a21d8fe5e.jpeg', '/uploads/fe12ecc6-60f6-4083-9093-2f47c551d18c.jpeg', '/uploads/37e7deb7-b277-456c-8a05-c2fc4f1ef2f8.jpeg', '/uploads/cf7ef47b-48cc-4c5e-b1d6-fdcb292ee35a.jpeg', '/uploads/9b7a21d6-367b-408c-b143-e524a833564e.jpeg', '/uploads/dc9ea49a-cb36-4833-8bfb-a1d01ff2e262.jpeg'],
    },
    {
      name: "80W Slim LED Floodlight IP65",
      sku: 'LF-002',
      price: 75000,
      category: "LED Floodlights",
      description: "Slim-profile 80W LED floodlight, 6400lm, cool white. Die-cast aluminium housing. IP65 waterproof. For outdoor security.",
      isFeatured: true,
      imageUrls: ['/uploads/85559eac-6b66-47ac-87d4-6cf1d94c245c.jpeg', '/uploads/43fdb026-5527-41d0-815c-978e1a95e31f.jpeg', '/uploads/e64f7c91-e826-49c2-8a93-ed2e69525ccf.jpeg', '/uploads/30f024b6-353c-4344-9f1b-0edd55b14194.jpeg', '/uploads/b9932a37-be9c-470c-8d24-49617a11c770.jpeg', '/uploads/ccd21370-5385-4f64-a51b-f9ec4a9375a8.jpeg'],
    },
    {
      name: "All-in-One Solar Streetlight 100W",
      sku: 'SSL-002',
      price: 320000,
      category: "Solar Streetlights",
      description: "100W all-in-one integrated solar streetlight. Built-in LiFePO4 battery. Motion-sensing 3-step dimming. 10-year panel life.",
      isFeatured: true,
      imageUrls: ['/uploads/c9438bff-5e85-4041-b6ed-778cd9d3f18f.jpeg', '/uploads/5020c8a8-0f48-447f-850f-c009c3cc65f3.jpeg', '/uploads/37fb3edf-41b5-4ccf-a66a-c5d3a3ca5bbf.jpeg', '/uploads/78f8390a-7ea7-41f2-8eda-f113e292fb76.jpeg', '/uploads/7a3f36ce-79d5-45b5-a133-59e0b88db1f9.jpeg', '/uploads/7765a474-bded-4191-a345-d482da08cb5c.jpeg'],
    },
    {
      name: "13A Double Socket White Switched",
      sku: 'SOC-002',
      price: 18000,
      category: "Sockets (Waterproof & Non-Waterproof)",
      description: "Standard 13A double socket with individual switches. White polycarbonate face plate. BS standard. Child-proof safety shutters.",
      isFeatured: false,
      imageUrls: ['/uploads/89b2254c-ad42-4217-9cb9-1f5dfc8c2d87.jpeg', '/uploads/cc06abe0-bf4f-42b7-9447-027775784f55.jpeg', '/uploads/90bbf54e-898a-4a52-a0dd-182389313c5c.jpeg', '/uploads/6d29de1a-4206-4862-b37e-95f32fd6a55d.jpeg', '/uploads/06b16c37-be90-4795-a97f-78cdcc154eaf.jpeg', '/uploads/01d1f155-3d2c-4c01-a35e-87ec105f1e4b.jpeg'],
    },
    {
      name: "13A Single Socket with USB-A Port",
      sku: 'SOC-003',
      price: 22000,
      category: "Sockets (Waterproof & Non-Waterproof)",
      description: "13A single socket with integrated USB-A charging port (2.1A). White finish. UK standard back box fitting.",
      isFeatured: false,
      imageUrls: ['/uploads/d01b41c6-ca7e-478f-85ab-6b327a003377.jpeg', '/uploads/1f7a7a91-6c65-4a3d-a888-f3988a4ac88a.jpeg', '/uploads/11499e4f-2c76-475b-9dd0-4037c13f6d00.jpeg', '/uploads/0f248622-0bce-4eed-a295-1e85fb6c19fb.jpeg', '/uploads/e6fc70a3-ff6e-4738-8398-ec8ded72b2e8.jpeg', '/uploads/a8581dd6-6633-40d3-a74f-52abd7d7066a.jpeg'],
    },
    {
      name: "2-Gang 1-Way Wall Switch White",
      sku: 'SW-003',
      price: 8500,
      category: "Switches",
      description: "Standard 2-gang 1-way wall switch, white, 10A. Screwless clip-on face plate. Fits standard UK 35mm back boxes.",
      isFeatured: false,
      imageUrls: ['/uploads/dbf17203-042e-4aeb-b003-ba8bad4649fa.jpeg', '/uploads/e23f9d62-fd1b-4ce1-8077-d56f7c50ec0f.jpeg', '/uploads/4958bee5-7e6a-4b16-a27d-dbb824876638.jpeg', '/uploads/4f6b025d-6433-477f-abf0-cf5f2b7a5f63.jpeg', '/uploads/72e6f77f-7862-427a-adbb-72c9934e67d0.jpeg', '/uploads/31f8e486-eb5c-455e-9a4d-a49ab8a65685.jpeg'],
    },
    {
      name: "150W Dual-Head Solar Floodlight",
      sku: 'SFL-003',
      price: 245000,
      category: "Solar Floodlights",
      description: "150W dual-head solar floodlight with 180-degree adjustable panels and heads. PIR motion sensor. IP67. Comes with remote.",
      isFeatured: false,
      imageUrls: ['/uploads/c60fa583-ef88-4010-b0dc-1a3b7cedbc78.jpeg', '/uploads/da1a0fa7-ffa3-4e99-bd3a-a221af0ad5fe.jpeg', '/uploads/f6992283-499d-4b59-b81d-3a9ae3d23ed7.jpeg', '/uploads/c6e2ac96-548c-4fed-967a-70cbfd3e635d.jpeg', '/uploads/cfb87f3d-4667-48d2-8efb-c3e18c48c566.jpeg', '/uploads/02aa9d0c-8651-46de-af65-255207e8a4a0.jpeg'],
    },
    {
      name: "100W LED Floodlight IP66",
      sku: 'LF-003',
      price: 98000,
      category: "LED Floodlights",
      description: "100W IP66 LED floodlight with 9000lm output. Suitable for sports courts, warehouses and parking areas. 50,000hr rated life.",
      isFeatured: false,
      imageUrls: ['/uploads/b8cfbccc-532c-4669-8f01-5d6914f86257.jpeg', '/uploads/48073b7d-7b65-451b-ac89-ef2ba814ff47.jpeg', '/uploads/5ec70f0a-ac42-4b26-8d25-12e4c7f062ee.jpeg', '/uploads/d654ea64-5b0b-4912-bb0e-28a64b2c34ac.jpeg', '/uploads/63a233a6-26d0-4ea6-becb-040e7649eb13.jpeg', '/uploads/18c6f0fd-319d-4e06-971e-f3c75bd9b464.jpeg'],
    },
    {
      name: "60W Integrated Solar Streetlight",
      sku: 'SSL-003',
      price: 195000,
      category: "Solar Streetlights",
      description: "60W all-in-one solar street light with integrated MPPT controller and lithium battery. Auto on/off, 3-step motion dimming.",
      isFeatured: false,
      imageUrls: ['/uploads/e4e3f104-f17f-44fc-9752-a7f1007b5d37.jpeg', '/uploads/d4ad423b-2188-41df-9b67-5e2cd2f81b22.jpeg', '/uploads/16d07875-42a3-4748-bef7-6d35985c62e7.jpeg', '/uploads/773b4bba-578f-432a-a659-8ac58719f182.jpeg', '/uploads/70b93871-91a6-436c-ae84-679160c36de2.jpeg', '/uploads/524beaff-f21a-41df-9062-0cd5be1e18e6.jpeg'],
    },
    {
      name: "1.5mm 3-Core PVC Cable 100m",
      sku: 'EC-001',
      price: 85000,
      category: "Electrical Cables",
      description: "100m drum of 1.5mm 3-core PVC-insulated and sheathed cable. Suitable for domestic lighting circuits. BS6004 compliant.",
      isFeatured: false,
      imageUrls: ['/uploads/afd3d6ca-29e1-4694-aff8-50b5eaee0ef3.jpeg', '/uploads/c085bc1f-0fb1-4bf0-a019-ba626c8e498d.jpeg', '/uploads/a771bdec-877e-4810-bed9-e9f9203bf408.jpeg', '/uploads/97f619b4-d85c-4929-87de-9f6c280c01b6.jpeg', '/uploads/aacdb5a6-32fa-4d6b-a936-83307fc80d12.jpeg', '/uploads/9ca4e279-f986-40b2-a479-7a0825423264.jpeg'],
    },
    {
      name: "2.5mm 4-Core Armoured Cable 50m",
      sku: 'EC-002',
      price: 145000,
      category: "Electrical Cables",
      description: "50m 2.5mm 4-core steel wire armoured (SWA) cable. For underground and outdoor runs. BS5467 compliant. Gland pack included.",
      isFeatured: false,
      imageUrls: ['/uploads/fb067d26-cade-4866-950e-bd32da4a11b2.jpeg', '/uploads/b577f7f4-85d9-46d6-b4c4-115d1e867296.jpeg', '/uploads/28906631-d556-4f73-a347-4c8fc885e2f5.jpeg', '/uploads/f2c8e656-6450-4d00-bc46-a2ee33be5095.jpeg', '/uploads/15a93375-49cd-4b51-ac01-1a08f5cacf02.jpeg', '/uploads/46738be7-fb38-4cbb-834c-e40027ea9659.jpeg'],
    },
    {
      name: "4-Way Extension Board 2m Surge",
      sku: 'EX-002',
      price: 22000,
      category: "Extension Cables",
      description: "2-metre 4-way extension board with surge protection and individual rocker switches. 13A rated. Child-safety shutters.",
      isFeatured: false,
      imageUrls: ['/uploads/b83402fb-35ef-4f2b-acc6-b9b880706a0c.jpeg', '/uploads/e48c51e7-0163-4991-99ff-1681faf5ed3e.jpeg', '/uploads/279a08bb-a1ae-485f-a4ef-2fab5c52a4e0.jpeg', '/uploads/5aba1de9-577a-4152-9e53-aee666880fa0.jpeg', '/uploads/1a63d8e0-ef72-43ec-90d7-7f801ef8c2cf.jpeg', '/uploads/84a7df85-0cc6-4d97-9315-c9ccc7bf0704.jpeg'],
    },
    {
      name: "6-Way Surge Protected Extension Lead",
      sku: 'EX-003',
      price: 32000,
      category: "Extension Cables",
      description: "6-way surge-protected extension lead, 3m cable, 3000J surge rating. Master switch. Suitable for computers and AV equipment.",
      isFeatured: false,
      imageUrls: ['/uploads/0485b2be-8a8b-4904-a2b7-c0d7501881fe.jpeg', '/uploads/5d8e9551-b80c-4b7a-a215-bc601a9f9a71.jpeg', '/uploads/2686bd9b-af37-40d9-9965-98cef9d2e83a.jpeg', '/uploads/e303e6fd-f513-4a2a-a7a3-48a24749b7ab.jpeg', '/uploads/48627ccc-89ba-45da-b07d-bfb2da709b9a.jpeg', '/uploads/2ac92438-0f1f-418e-bf0e-5837583d9ee2.jpeg'],
    },
    {
      name: "3-Phase Digital Energy Meter",
      sku: 'PM-002',
      price: 280000,
      category: "Power Meters",
      description: "DIN-rail 3-phase 4-wire digital energy meter. Measures kWh, voltage, current, PF and THD per phase. RS485 Modbus output.",
      isFeatured: false,
      imageUrls: ['/uploads/d6974f4d-750a-45d7-853b-5fa8bff5bd56.jpeg', '/uploads/d7ae4857-30f3-4bba-98e7-ba8babd86ef5.jpeg', '/uploads/3fa96d52-8102-48ee-a213-e9fb27cdbcfa.jpeg', '/uploads/0368b1b6-9195-49c7-8b80-e44b7253c22e.jpeg', '/uploads/ddcb5fd5-8f66-4cdc-b1a6-6128d2a263e9.jpeg', '/uploads/8642a065-0219-41c0-95a5-9b5dc41a65d2.jpeg'],
    },
    {
      name: "32A Double-Pole MCB Breaker",
      sku: 'CAT-002',
      price: 18000,
      category: "Cat Outs",
      description: "32A 6kA double-pole miniature circuit breaker (MCB), Type B curve. DIN rail mount. IEC 60898-1 certified.",
      isFeatured: false,
      imageUrls: ['/uploads/68c4f5de-4524-40c3-9474-74ceb58b7b03.jpeg', '/uploads/4955091e-dc8a-4dc3-8c9c-fc6eeb3bdc15.jpeg', '/uploads/5cca1546-f7fc-40e6-94df-2f9bb5a793c1.jpeg', '/uploads/08b1f218-9303-4591-a84d-8e01da60fbda.jpeg', '/uploads/108103c6-7b4d-439c-974a-b775bb2c5785.jpeg', '/uploads/0bbbccb1-56ac-4ccd-8b23-978b0b65e911.jpeg'],
    },
    {
      name: "Copper Earth Bar 25mm Strip 3m",
      sku: 'CT-001',
      price: 75000,
      category: "Copper Tapes & Lightning Arrestors",
      description: "25mm x 3m bare copper earth bar strip for earthing systems. 99.9% copper purity. Suitable for LV panels and earth electrodes.",
      isFeatured: false,
      imageUrls: ['/uploads/bbd951b6-5521-49d3-9303-a0d327e33bd9.jpeg', '/uploads/5d081cdb-e547-475f-b5fa-5ce5c82acdce.jpeg', '/uploads/03b3edde-d3c3-424e-ae36-08ee7c91a670.jpeg', '/uploads/1d67590e-3fce-450f-b62f-f40331216d86.jpeg', '/uploads/0b7efbdb-452c-4689-8443-6c6c2454a97f.jpeg', '/uploads/7cfe89db-268e-48e9-910f-9a7ccfb3f6a5.jpeg'],
    },
    {
      name: "Lightning Arrestor Class C 10kA",
      sku: 'CT-002',
      price: 95000,
      category: "Copper Tapes & Lightning Arrestors",
      description: "Class C (Type 3) surge protection device (SPD), 10kA max discharge, 275V. DIN rail mount. LED status indicator.",
      isFeatured: false,
      imageUrls: ['/uploads/0549c9cb-fbe6-47a5-a135-f9a8591a05d7.jpeg', '/uploads/a5b75d58-7885-45e4-a631-315253fe4fee.jpeg', '/uploads/e935aca5-dee1-4d3c-8650-7c8afab0ae6d.jpeg', '/uploads/119c6d04-1cad-4330-af7c-fc97d5e037c1.jpeg', '/uploads/419cb462-756e-4ae2-8419-069c9110140a.jpeg', '/uploads/f008a2d7-2103-4cb3-9a9d-9665bbd800a2.jpeg'],
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
      imageUrls: ['/uploads/a8573855-0bdf-4297-bd8d-49d9225836a6.jpeg', '/uploads/d4fc07c3-819d-492b-a013-4d871ad1a5e7.jpeg', '/uploads/c48c4242-1f47-4205-b773-82a5d16e1732.jpeg', '/uploads/c15ebf76-12db-4f2e-8d3d-f73985fb945d.jpeg', '/uploads/2e5bab97-8a67-40d4-b6d9-68014bdac9cb.jpeg', '/uploads/a7a44d1b-44b6-4c19-a4dc-e6d276afb14d.jpeg'],
    },
    {
      name: "80W Automatic Solar Streetlight",
      sku: 'SSL-004',
      price: 240000,
      category: "Solar Streetlights",
      description: "80W automatic all-in-one solar streetlight with scheduled on/off and 50% mid-night dimming. IP66. 5-year panel warranty.",
      isFeatured: false,
      imageUrls: ['/uploads/6d04b6cd-e036-4b8d-9f9a-97c2d156226b.jpeg', '/uploads/c897c6e5-a1e3-4c40-9078-689377cf8fd9.jpeg', '/uploads/54100677-7eff-4796-930a-caf29962bde6.jpeg', '/uploads/f2f377fe-6e0c-4933-a5bc-2052c072f1f0.jpeg', '/uploads/958e8003-3f2d-4823-a7e6-2b80fc1c98e5.jpeg', '/uploads/4c96cd3c-97aa-4cf5-a184-935570081c08.jpeg'],
    },
    {
      name: "Rose Gold Crystal Ceiling Chandelier 24-Head",
      sku: 'CH-005',
      price: 350000,
      category: "Chandeliers",
      description: "Luxurious 24-head rose-gold crystal chandelier with K9 crystal drops. LED G9 compatible. 100cm diameter. For large rooms.",
      isFeatured: false,
      imageUrls: ['/uploads/17d17b76-f9cc-4779-ba10-30eba4cfa60d.jpeg', '/uploads/4bd595c2-ca86-42b8-a282-fa21c5155aa4.jpeg', '/uploads/a1870ddc-153f-401d-bdfa-ff8709b5e210.jpeg', '/uploads/261f1a08-2710-402e-97d5-4c0a9ccfd7de.jpeg', '/uploads/aa7d7b26-95f7-4968-b885-2196e176398a.jpeg', '/uploads/e1d00b81-77f8-4b67-8c67-cdc768b87a20.jpeg'],
    },
    {
      name: "30-LED Rechargeable Emergency Lantern",
      sku: 'RL-003',
      price: 68000,
      category: "Rechargeable Lamps",
      description: "Portable folding 30-LED rechargeable lantern with handle. 8-hour runtime, 3 brightness levels. USB-C charging port.",
      isFeatured: false,
      imageUrls: ['/uploads/6f4512a2-a6d5-4849-9fab-ff146e576cb1.jpeg', '/uploads/b9b13108-5c52-473c-a363-c7fdf5849823.jpeg', '/uploads/b5e6528f-a344-4228-b517-d72198e91fa1.jpeg', '/uploads/29ee601f-9765-4a00-8d5c-81c15c8afd3a.jpeg', '/uploads/ffb3e0af-2499-43a5-a603-94db8d7025ac.jpeg', '/uploads/f69ba2de-606e-4ab6-a2f6-5ad0c0ec5ff3.jpeg'],
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
      imageUrls: ['/uploads/53478c60-368e-4606-8199-57cf6b3619f6.jpeg', '/uploads/b2a26f32-6db4-462a-ab59-0bc3f98cf05c.jpeg', '/uploads/6e030a64-4966-4789-ac16-8484e89461ee.jpeg', '/uploads/964b9984-1f3a-44a2-b6eb-828e6262794d.jpeg', '/uploads/37d409a2-6de6-4518-9b75-e6b16b70508f.jpeg', '/uploads/ea17959f-5f21-4804-bbc8-6f7ea5b1f2f0.jpeg'],
    },
    {
      name: 'Solar Floodlight 100W with Remote',
      sku: 'SFL-001',
      price: 850000,
      category: 'Solar Floodlights',
      description:
        'High-brightness 100W solar floodlight with motion sensor and remote control. Automatic dusk-to-dawn operation. IP67 waterproof rating.',
      isFeatured: true,
      imageUrls: ['/uploads/f25cb21d-45cb-4803-98e2-70f9a3052eb7.jpeg', '/uploads/638c0a3e-3697-444b-bee1-fcf0aa898e86.jpeg', '/uploads/4494b4bb-5d8e-42cb-9231-107196742850.jpeg', '/uploads/f086cb4e-df68-4eb9-98bb-697145af1df9.jpeg', '/uploads/6c4c8578-8027-4bdc-ab4d-1fbb5ab05fea.jpeg', '/uploads/f18dbf41-b1eb-40fd-9cb3-a19eda7c3050.jpeg'],
    },
    {
      name: 'LED Ceiling Light 36W Round',
      sku: 'LED-001',
      price: 320000,
      category: 'LED Ceiling Lights',
      description:
        'Slim 36W LED ceiling light with cool white illumination. Flush mount design suitable for bedrooms, offices and corridors. No bulbs required.',
      isFeatured: true,
      imageUrls: ['/uploads/3325d4ca-47ae-432e-aa6a-af61ea778012.jpeg', '/uploads/5fd95651-aea3-4b1a-804f-bf2b26bfeeb4.jpeg', '/uploads/d9839e7f-eabc-4702-9b33-0bbb12dfe458.jpeg', '/uploads/9432aa51-6ee7-4a4f-9272-e64e8ba70af6.jpeg'],
    },
    {
      name: 'Solar LED Streetlight 60W All-in-One',
      sku: 'SSL-001',
      price: 2200000,
      category: 'Solar Streetlights',
      description:
        'All-in-one solar streetlight with built-in panel, battery and LED chip. Suitable for roads, parking lots and compounds. Auto on/off with motion sensing.',
      isFeatured: true,
      imageUrls: ['/uploads/4a002499-4939-4e0f-992b-f71dd707cc10.png', '/uploads/d7d948ca-e9a1-420e-ad30-024df202e16e.jpeg', '/uploads/2e3ad729-8198-4522-a66c-9b678fded698.jpeg', '/uploads/2ce5086a-d00f-4517-943c-0353afae5c02.jpeg', '/uploads/ca019081-ca35-43f3-863c-b7c950f366b7.jpeg', '/uploads/4dff543a-5dc0-46ea-b744-de300bf16b44.jpeg'],
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
      imageUrls: ['/uploads/bf8a21c2-0ec5-4a61-944a-32cb93ce3f51.jpeg', '/uploads/c90ccfa4-5f67-4856-aa79-de9d8598316b.jpeg', '/uploads/7abdb583-1999-426a-a83c-161ed9e1aeff.jpeg', '/uploads/0ff7a689-a28f-4ac7-867d-ecb2b6c302b1.jpeg', '/uploads/7b12250d-f792-4612-bb72-8a3ed2df39a8.jpeg', '/uploads/f189dbe2-e6e2-4e38-a48f-60d3a434b0ea.jpeg'],
    },
    {
      name: 'Weatherproof Outdoor Wall Light',
      sku: 'OG-001',
      price: 450000,
      category: 'Outdoor & Garden Electrical Accessories',
      description:
        'IP65-rated outdoor wall lantern for gates, verandas and compound entrances. Warm white E27 bulb socket. Powder-coated aluminium body.',
      isFeatured: false,
      imageUrls: ['/uploads/dc4d40df-8af3-4ac6-b9cc-a5a6de268c5f.jpeg', '/uploads/4ebe0731-389f-479a-823d-fde8cac4e0c0.jpeg', '/uploads/8a25bad5-fca9-417e-8366-dacbddb8a268.jpeg', '/uploads/a0023d10-bce2-4060-998c-7145bb57c029.jpeg', '/uploads/ffe34ebd-29e2-44b5-8b5d-9dc5ea04bfde.png', '/uploads/d38b1029-b4ea-4ea6-bdff-da177ed79294.jpeg'],
    },
    {
      name: 'Heavy Duty Extension Cable 5m (4-Way)',
      sku: 'EX-001',
      price: 180000,
      category: 'Extension Cables',
      description:
        '5-metre 4-way extension cable with surge protection and individual switches per socket. 13A rated. Child safety shutters on all sockets.',
      isFeatured: false,
      imageUrls: ['/uploads/1f9d04b3-5d47-4d4c-9ac2-42097f8850d2.jpeg', '/uploads/7362bcea-16a6-481c-a2d3-3ea4d64f9ad9.jpeg', '/uploads/df7764de-da13-40d1-a5cf-612e17b9798f.jpeg', '/uploads/406f2f62-9357-4283-b150-dbe0d6ad5866.jpeg', '/uploads/9d0011d5-b981-4234-a333-876a5f365c48.jpeg', '/uploads/eb06120f-81b3-4b84-975b-6f8fc0a40d50.jpeg'],
    },
    {
      name: 'LED Floodlight 50W (Cool White)',
      sku: 'LF-001',
      price: 280000,
      category: 'LED Floodlights',
      description:
        'Slim 50W LED floodlight for security lighting and sports courts. IP65 waterproof. Die-cast aluminium housing. 4500 lumens output.',
      isFeatured: false,
      imageUrls: ['/uploads/d07b45d9-a356-4002-ba0a-f7723d82bf4f.jpeg', '/uploads/f6874b23-bd72-49a2-86e2-17f1926eb1d4.jpeg', '/uploads/2b3dd9e4-a0f3-4c9c-b69c-c649950f15c5.jpeg', '/uploads/72ba9e82-dfc7-448e-a833-93f2119c352f.jpeg', '/uploads/0a85beea-2726-4c68-817f-8ebb825ae5fa.jpeg', '/uploads/f265612c-b7c8-48e3-a622-56d0fa541cb0.jpeg'],
    },
    {
      name: 'Waterproof Double Socket (IP66)',
      sku: 'SOC-001',
      price: 125000,
      category: 'Sockets (Waterproof & Non-Waterproof)',
      description:
        'IP66-rated outdoor double socket with protective covers. Suitable for garages, bathrooms and outdoor kitchens. 13A, BS standard.',
      isFeatured: false,
      imageUrls: ['/uploads/6fd843c8-8b29-44e0-b789-922f39c12086.jpeg', '/uploads/2b0427a7-4c87-4e5e-b2fb-7c9944200036.jpeg', '/uploads/ccdfd0f9-a34d-4809-9a27-7a55a3f04568.jpeg', '/uploads/3ab3d53a-a1bc-472d-9cb6-9e1d8a8ccd94.jpeg', '/uploads/25ac968c-b3da-4e07-972b-fecd52be8a76.jpeg', '/uploads/3e148176-0eda-4aa0-a107-48d1789b697d.jpeg'],
    },
    {
      name: 'Rechargeable Emergency Lamp 30 LED',
      sku: 'RL-001',
      price: 95000,
      category: 'Rechargeable Lamps',
      description:
        'Portable 30-LED rechargeable lamp with up to 8 hours backup. Wall-mount bracket included. Auto-activates during power outages.',
      isFeatured: false,
      imageUrls: ['/uploads/34730e20-08ea-4304-95bb-3630b437b931.jpeg', '/uploads/b525d953-23ab-42e1-9b35-42069501dd05.jpeg', '/uploads/2032312f-d163-4ee5-a0de-650805f42ef0.jpeg', '/uploads/9ed0286a-edf2-404d-af74-5022148c3d1f.jpeg', '/uploads/c7b11c5e-1eec-43fc-aedd-eb6ee2bae792.jpeg', '/uploads/e7f6b76c-014b-40f5-bbe6-e135ae625a45.jpeg'],
    },
    {
      name: 'Cable Junction Box IP65 Weatherproof',
      sku: 'OTH-001',
      price: 8500,
      category: 'Other Items',
      description: 'IP65-rated weatherproof cable junction box for outdoor electrical connections. Grey polycarbonate body with knock-outs. 100x100x60mm.',
      isFeatured: false,
      imageUrls: ['/uploads/bb82f18d-e520-4dfd-8f8e-4afcf7e7d087.jpeg', '/uploads/6c559477-ab0d-4902-b22c-43615463f57d.jpeg', '/uploads/faf20b33-f608-41e7-8409-0da039f6d9a4.jpeg', '/uploads/5807c89b-7250-4ea1-b197-582d2baa27c7.jpeg', '/uploads/f5deb2be-22dc-4535-89ff-397cad102af8.jpeg', '/uploads/0887d0db-bd88-4625-8b4b-c4f1973eee9f.jpeg'],
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
