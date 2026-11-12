import "dotenv/config";
import { getDb } from "./db.js";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const hosts = [
  { name: "Maya Rahman", email: "maya.host@studiospace.dev", image: "https://i.pravatar.cc/150?img=47" },
  { name: "Arif Chowdhury", email: "arif.host@studiospace.dev", image: "https://i.pravatar.cc/150?img=12" },
  { name: "Nusrat Jahan", email: "nusrat.host@studiospace.dev", image: "https://i.pravatar.cc/150?img=32" },
];

const studios = [
  {
    title: "Cyclorama White Box",
    category: "Photo Studio",
    hourlyRate: 45,
    securityDeposit: 100,
    maxCapacity: 12,
    location: "Gulshan 2, Dhaka",
    images: ["1516035069371-29a1b244cc32", "1452860606245-08befc0ff44b", "1492691527719-9d1e07e534b4"],
    amenities: ["Cyc Wall", "Studio Lighting", "Backdrop Stands", "Makeup Room", "Wi-Fi", "Air Conditioning"],
    overview:
      "A 900 sq ft seamless white cyclorama with a floor that has no visible corner, built for product shoots, fashion lookbooks and e-commerce catalogues. Strobes, softboxes and a rolling rack are already on site, so you can walk in with just your camera.",
    reviews: [
      ["Tanvir Ahmed", 5, "The cyc wall is spotless and the lighting kit saved us a full day of rental. Shot 40 products in one session."],
      ["Sadia Islam", 5, "Clean space, friendly host, and a proper makeup room for the models."],
      ["Rafi Hasan", 4, "Great studio. Parking nearby is tight on weekdays, otherwise perfect."],
    ],
    host: 0,
  },
  {
    title: "Golden Hour Loft",
    category: "Photo Studio",
    hourlyRate: 38,
    securityDeposit: 80,
    maxCapacity: 8,
    location: "Dhanmondi, Dhaka",
    images: ["1452860606245-08befc0ff44b", "1516035069371-29a1b244cc32"],
    amenities: ["Wi-Fi", "Air Conditioning", "Props Library", "Changing Room", "Kitchenette"],
    overview:
      "A top-floor loft with tall west-facing windows that flood the room with warm light from mid afternoon. Exposed brick, vintage furniture and a small props library make it a favourite for portraits, couples sessions and lifestyle content.",
    reviews: [
      ["Mehnaz Akter", 5, "The afternoon light here is unreal. Our portrait session needed almost no extra lighting."],
      ["Imran Khan", 4, "Lovely props and a calm space. The staircase is steep if you carry heavy gear."],
    ],
    host: 0,
  },
  {
    title: "Monolith Sound Stage",
    category: "Film Stage",
    hourlyRate: 120,
    securityDeposit: 300,
    maxCapacity: 40,
    location: "Tejgaon, Dhaka",
    images: ["1536440136628-849c177e76a1", "1485846234645-a62644f84728", "1574717024653-61fd2cf4d44d"],
    amenities: ["Soundproofing", "Studio Lighting", "Green Screen", "Dolly & Track", "Blackout Curtains", "Parking", "Wi-Fi"],
    overview:
      "A 3,000 sq ft soundproofed stage with a 14 ft grid, a motorised green screen and a drive-in loading bay. Built for short films, music videos and TVC shoots that need full control over light and sound.",
    reviews: [
      ["Farhan Sattar", 5, "We shot a three-day music video here. The grid and power supply were exactly as described."],
      ["Lamia Noor", 5, "Silent between takes, which is rare in Dhaka. Highly recommended."],
      ["Shuvo Das", 4, "Brilliant stage. Book early because weekends fill up fast."],
    ],
    host: 1,
  },
  {
    title: "Harbor Light Film Set",
    category: "Film Stage",
    hourlyRate: 95,
    securityDeposit: 250,
    maxCapacity: 30,
    location: "Agrabad, Chattogram",
    images: ["1485846234645-a62644f84728", "1536440136628-849c177e76a1"],
    amenities: ["Studio Lighting", "Blackout Curtains", "Props Library", "Parking", "Air Conditioning", "Changing Room"],
    overview:
      "A flexible film set with three ready-made rooms: a retro diner, a warehouse corner and a plain interview space. Crews can shoot all three looks in a single day without moving equipment across town.",
    reviews: [
      ["Rakib Hossain", 4, "The diner set saved our art department a week. Staff helped us load in quickly."],
      ["Anika Tabassum", 5, "Perfect for our web series. Three looks, one location, zero stress."],
    ],
    host: 1,
  },
  {
    title: "Velvet Mic Podcast Room",
    category: "Podcast Lounge",
    hourlyRate: 28,
    securityDeposit: 50,
    maxCapacity: 5,
    location: "Banani, Dhaka",
    images: ["1478737270239-2f02b77fc618", "1590602847861-f357a9332bbc", "1598488035139-bdbb2231ce04"],
    amenities: ["Podcast Mics", "Soundproofing", "Wi-Fi", "Air Conditioning", "Mixing Console"],
    overview:
      "A treated four-person podcast room with four dynamic microphones, a mixing desk and a sound engineer on request. The walls are lined with acoustic panels, so you get clean audio with no editing for room echo.",
    reviews: [
      ["Zahid Alam", 5, "Our audio quality jumped the moment we moved here. The mics are excellent."],
      ["Priya Sen", 5, "Comfortable chairs and a very quiet room. We recorded two episodes in a single booking."],
      ["Mahin Rahman", 4, "Great setup. Bring your own headphones if you like your own sound."],
    ],
    host: 2,
  },
  {
    title: "The Talk Shack",
    category: "Podcast Lounge",
    hourlyRate: 22,
    securityDeposit: 40,
    maxCapacity: 4,
    location: "Zindabazar, Sylhet",
    images: ["1590602847861-f357a9332bbc", "1478737270239-2f02b77fc618"],
    amenities: ["Podcast Mics", "Soundproofing", "Wi-Fi", "Kitchenette"],
    overview:
      "A cosy two-mic recording nook with a sofa-style seating area, ideal for interviews and small talk shows. Tea and coffee are available in the kitchenette between recordings.",
    reviews: [
      ["Jubayer Ahmed", 4, "Simple, quiet and affordable. Exactly what a new podcast needs."],
      ["Tasnia Karim", 5, "Our guests loved the cosy feel. Sound is clear and the host is very helpful."],
    ],
    host: 2,
  },
  {
    title: "Echo Chamber Recording Suite",
    category: "Music Suite",
    hourlyRate: 60,
    securityDeposit: 150,
    maxCapacity: 10,
    location: "Uttara, Dhaka",
    images: ["1520523839897-bd0b52f945a0", "1598653222000-6b7b7a552625", "1571330735066-03aaa9429d89"],
    amenities: ["Mixing Console", "Soundproofing", "Podcast Mics", "Air Conditioning", "Wi-Fi", "Parking"],
    overview:
      "A professional two-room recording suite with a live room, an isolated vocal booth and a control room built around a 24-channel console. Bring your band or book an in-house engineer for tracking and mixing.",
    reviews: [
      ["Nabil Chowdhury", 5, "We tracked a full EP in two days. The vocal booth sounds fantastic."],
      ["Ritu Barua", 5, "Engineer was patient and skilled. The control room monitors are very accurate."],
      ["Sakib Mahmud", 4, "Top gear and a comfortable lounge. Slightly pricey, but worth it."],
    ],
    host: 1,
  },
  {
    title: "Drumline Rehearsal Room",
    category: "Music Suite",
    hourlyRate: 35,
    securityDeposit: 90,
    maxCapacity: 8,
    location: "GEC Circle, Chattogram",
    images: ["1511671782779-c97d3d27a1d4", "1598520106830-8c45c2035460"],
    amenities: ["Drum Kit", "Soundproofing", "Air Conditioning", "Wi-Fi", "Parking"],
    overview:
      "A soundproofed rehearsal room with a full drum kit, two guitar amps, a bass amp and a PA system. Bands can plug in and start playing within minutes, with no setup fee.",
    reviews: [
      ["Ador Rahman", 4, "Solid backline and no complaints from neighbours. Perfect for weekly rehearsals."],
      ["Mithila Das", 5, "Our band practices here every Friday. The drum kit is well looked after."],
    ],
    host: 0,
  },
  {
    title: "Clay & Canvas Workshop",
    category: "Workshop",
    hourlyRate: 25,
    securityDeposit: 60,
    maxCapacity: 15,
    location: "Mirpur, Dhaka",
    images: ["1513364776144-60967b0f800f", "1460661419201-fd4cecdf8a8b"],
    amenities: ["Easels", "Wi-Fi", "Air Conditioning", "Kitchenette", "Props Library"],
    overview:
      "A bright open workshop with fifteen easels, two pottery wheels and a kiln shared with the host. Suitable for painting classes, ceramics sessions and corporate art-therapy days.",
    reviews: [
      ["Sumaiya Akter", 5, "We ran a weekend painting class here. Easels and lighting were great."],
      ["Kamrul Hasan", 4, "Roomy and clean. Wish the kiln schedule was a bit more flexible."],
    ],
    host: 2,
  },
  {
    title: "Print & Pigment Lab",
    category: "Workshop",
    hourlyRate: 30,
    securityDeposit: 70,
    maxCapacity: 12,
    location: "Khulshi, Chattogram",
    images: ["1460661419201-fd4cecdf8a8b", "1513364776144-60967b0f800f"],
    amenities: ["Easels", "Wi-Fi", "Air Conditioning", "Backdrop Stands", "Props Library"],
    overview:
      "A screen-printing and mixed-media lab with two printing tables, a drying rack and a washout sink. Perfect for zine makers, poster artists and design collectives who need a proper print setup.",
    reviews: [
      ["Oishee Roy", 5, "Printed our whole poster run in one afternoon. The washout sink is a lifesaver."],
      ["Tahmid Hossain", 4, "Well-equipped lab. A little warm in summer, so bring a fan."],
    ],
    host: 0,
  },
  {
    title: "Shoreditch Daylight Studio",
    category: "Photo Studio",
    hourlyRate: 70,
    securityDeposit: 180,
    maxCapacity: 14,
    location: "Shoreditch, London",
    images: ["1492691527719-9d1e07e534b4", "1516035069371-29a1b244cc32"],
    amenities: ["Cyc Wall", "Studio Lighting", "Makeup Room", "Wi-Fi", "Kitchenette", "Backdrop Stands"],
    overview:
      "A converted warehouse studio with a north-facing skylight and a white cyc wall. The makeup room and a small lounge make it comfortable for long editorial and campaign shoots.",
    reviews: [
      ["Oliver Grant", 5, "Natural light all day and a great cyc. Our fashion team loved it."],
      ["Hana Yilmaz", 4, "Excellent studio in a convenient area. Booking was simple."],
    ],
    host: 1,
  },
  {
    title: "Noir Screening Room",
    category: "Film Stage",
    hourlyRate: 80,
    securityDeposit: 200,
    maxCapacity: 25,
    location: "Kolatoli, Cox's Bazar",
    images: ["1536440136628-849c177e76a1", "1574717024653-61fd2cf4d44d"],
    amenities: ["Blackout Curtains", "Studio Lighting", "Soundproofing", "Air Conditioning", "Wi-Fi"],
    overview:
      "A dark-walled screening and shooting room with blackout curtains, a 4K projector and tiered seating for twenty-five. Used for private screenings, noir-style shoots and short film previews.",
    reviews: [
      ["Fahim Ahmed", 5, "We held our short film premiere here. The projector and sound were spot on."],
      ["Lutfa Begum", 4, "Atmospheric room and great for dark, moody shoots."],
    ],
    host: 2,
  },
];

function average(reviews) {
  const total = reviews.reduce((sum, review) => sum + review[1], 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

function dateFromToday(days) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

async function seed() {
  const db = await getDb();

  await db.collection("studios").deleteMany({ seeded: true });
  await db.collection("bookings").deleteMany({ seeded: true });

  const documents = studios.map((studio, index) => {
    const host = hosts[studio.host];
    const images = studio.images.map(photo);

    return {
      title: studio.title,
      category: studio.category,
      hourlyRate: studio.hourlyRate,
      securityDeposit: studio.securityDeposit,
      maxCapacity: studio.maxCapacity,
      location: studio.location,
      image: images[0],
      gallery: images,
      amenities: studio.amenities,
      overview: studio.overview,
      ownerName: host.name,
      ownerEmail: host.email,
      ownerImage: host.image,
      rating: average(studio.reviews),
      reviews: studio.reviews.map(([name, rating, comment]) => ({ name, rating, comment })),
      seeded: true,
      createdAt: new Date(Date.now() - index * 3600000),
    };
  });

  const result = await db.collection("studios").insertMany(documents);
  const ids = Object.values(result.insertedIds);

  const bookings = [];

  ids.slice(0, 3).forEach((id, index) => {
    for (let day = 1; day <= 14; day++) {
      bookings.push({
        studioId: id.toString(),
        studioTitle: documents[index].title,
        studioImage: documents[index].image,
        location: documents[index].location,
        ownerEmail: documents[index].ownerEmail,
        ownerName: documents[index].ownerName,
        userEmail: "guest.booker@studiospace.dev",
        userName: "Guest Booker",
        date: dateFromToday(day),
        startTime: "10:00",
        endTime: "14:00",
        hours: 4,
        hourlyRate: documents[index].hourlyRate,
        securityDeposit: documents[index].securityDeposit,
        totalPrice: 4 * documents[index].hourlyRate,
        status: "Confirmed",
        seeded: true,
        createdAt: new Date(),
      });
    }
  });

  await db.collection("bookings").insertMany(bookings);
  await db.collection("bookings").createIndex({ studioId: 1, date: 1, status: 1 });
  await db.collection("bookings").createIndex({ userEmail: 1 });
  await db.collection("bookings").createIndex({ ownerEmail: 1 });
  await db.collection("studios").createIndex({ ownerEmail: 1 });

  console.log(`Seeded ${documents.length} studios and ${bookings.length} confirmed bookings`);
  process.exit(0);
}

seed();
