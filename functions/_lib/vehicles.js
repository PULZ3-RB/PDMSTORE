export const TAX_RATE = 0.098;

export const MARKUP_BY_CLASS = {
  claseD: 1.00, // +100%
  claseC: 0.80, // +80%
  claseB: 0.40, // +40%
  claseA: 0.20, // +20%
  claseS: 0.00  // cámbialo aquí si luego defines un margen para S
};

export const COMMISSION_BY_CLASS = {
  claseD: 0.05, // 5%
  claseC: 0.04, // 4%
  claseB: 0.03, // 3%
  claseA: 0.02, // 2%
  claseS: 0.01  // 1%
};

/*
  ESTE ES EL ARCHIVO PRINCIPAL QUE MODIFICAS PARA LOS COCHES.

  - cost = lo que PDM paga por el coche.
  - stock = 0 significa "Solo por reserva".
  - stock > 0 significa unidades inmediatas.
  - El precio de venta se calcula automáticamente por clase.
*/
export const vehicles = [
  /* ================= CLASE A ================= */
  {
    id: "sultanrsx",
    brand: "Karin",
    name: "Sultan RSX",
    type: "claseA",
    cost: 192500,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbsultanrsx.webp"
  },
  {
    id: "romulus",
    brand: "Annis",
    name: "Romulus",
    type: "claseA",
    cost: 95000,
    stock: 0,
    image: ""
  },
  {
    id: "panthere",
    brand: "Toundra",
    name: "Panthere",
    type: "claseA",
    cost: 170000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/panthere.webp"
  },
  {
    id: "vigerov1",
    brand: "Declasse",
    name: "Vigero VL1",
    type: "claseA",
    cost: 192000,
    stock: 0,
    image: ""
  },
  {
    id: "rt3000",
    brand: "Dinka",
    name: "RT3000",
    type: "claseA",
    cost: 165000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/rt3000.webp"
  },
  {
    id: "coquetted5",
    brand: "Invetero",
    name: "Coquette D5",
    type: "claseA",
    cost: 155000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/coquette6.webp"
  },
  {
    id: "remus",
    brand: "Annis",
    name: "Remus",
    type: "claseA",
    cost: 95000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/remus.webp"
  },
  {
    id: "remusii",
    brand: "Annis",
    name: "Remus II",
    type: "claseA",
    cost: 125000,
    stock: 0,
    image: ""
  },
  {
    id: "argento7f",
    brand: "Obey",
    name: "Argento 7F",
    type: "claseA",
    cost: 190000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbargento7f.webp"
  },
  {
    id: "penumbraff",
    brand: "Maibatsu",
    name: "Penumbra FF",
    type: "claseA",
    cost: 155000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/penumbra2.webp"
  },
  /* ================= CLASE B ================= */
   {
    id: "woodlander",
    brand: "Karin",
    name: "Woodlander",
    type: "claseB",
    cost: 62500,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/woodlander.webp"
  },
  {
    id: "elegyrh4",
    brand: "Annis",
    name: "Elegy RH4",
    type: "claseB",
    cost: 48000,
    stock: 0,
    image: "https://cdnb.artstation.com/p/assets/images/images/039/467/855/large/oleg-z-rh42.jpg?1626009295"
  },
  {
    id: "mojave",
    brand: "Karin",
    name: "Mojave",
    type: "claseB",
    cost: 60000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbmojave.webp"
  },
  {
    id: "vagrant",
    brand: "Maxwell",
    name: "Vagrant",
    type: "claseB",
    cost: 58000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/vagrant.webp"
  },
  {
    id: "kuruma",
    brand: "Karin",
    name: "Kuruma",
    type: "claseB",
    cost: 47000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/kuruma.webp"
  },
  {
    id: "raptor",
    brand: "BF",
    name: "Raptor",
    type: "claseB",
    cost: 42000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/raptor.webp"
  },
  {
    id: "uranus",
    brand: "Vapid",
    name: "Uranus",
    type: "claseB",
    cost: 55000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/uranus.webp"
  },
  {
    id: "comet",
    brand: "Pfister",
    name: "Comet",
    type: "claseB",
    cost: 56000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/comet2.webp"
  },
  {
    id: "rocoto",
    brand: "Obey",
    name: "Rocoto",
    type: "claseB",
    cost: 38999,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/rocoto.webp"
  },
  {
    id: "mogul",
    brand: "Karin",
    name: "Mogul RS",
    type: "claseB",
    cost: 75000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbmogulrs.webp"
  },
  {
    id: "caracara",
    brand: "Vapid",
    name: "Caracara",
    type: "claseB",
    cost: 70000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/caracara.webp"
  },
  {
    id: "sentinel",
    brand: "ubermacht",
    name: "Sentinel",
    type: "claseB",
    cost: 50000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/sentinel.webp"
  },
  {
    id: "hardy",
    brand: "Annis",
    name: "Hardy",
    type: "claseB",
    cost: 48000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/hardy.webp"
  },
  {
    id: "oracle",
    brand: "Ubermacht",
    name: "Oracle",
    type: "claseB",
    cost: 45000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/oracle.webp"
  },
  {
    id: "alamo",
    brand: "Declasse",
    name: "Alamo",
    type: "claseB",
    cost: 60000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/onx_tfalamo.webp"
  },
  {
    id: "omnis",
    brand: "Obey",
    name: "Omnis",
    type: "claseB",
    cost: 45000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/omnis.webp"
  },
  {
    id: "dubsta6x6",
    brand: "Benefactor",
    name: "Dubsta 6x6",
    type: "claseB",
    cost: 45000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/dubsta3.webp"
  },
  {
    id: "chinquemile",
    brand: "Lampadati",
    name: "Cinquemila",
    type: "claseB",
    cost: 55000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/cinquemila.webp"
  },
  {
    id: "minimus",
    brand: "Annis",
    name: "Minimus",
    type: "claseB",
    cost: 49000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/minimus.webp"
  },
  {
    id: "regent",
    brand: "Brute",
    name: "Regent",
    type: "claseB",
    cost: 60000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/onx_tfregent.webp"
  },
  {
    id: "issimetro",
    brand: "Weeny",
    name: "Issi Metro",
    type: "claseB",
    cost: 70000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbissimetro.webp"
  },
  {
    id: "desertraid",
    brand: "Vapid",
    name: "Desert Raid",
    type: "claseB",
    cost: 68000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/trophytruck2.webp"
  },
  {
    id: "sentinelclassic",
    brand: "Ubermacht",
    name: "Sentinel Classic",
    type: "claseB",
    cost: 65000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/sentinel3.webp"
  },
  {
    id: "impaler",
    brand: "Declasse",
    name: "Impaler",
    type: "claseB",
    cost: 47500,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/impaler.webp"
  },
  {
    id: "scoutgsx",
    brand: "Vapid",
    name: "Scout GSX",
    type: "claseB",
    cost: 62000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbscoutgsx.webp"
  },
  {
    id: "dominatorfx",
    brand: "Vapid",
    name: "Dominator FX",
    type: "claseB",
    cost: 61000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/driftdominator10.webp"
  },
  {
    id: "fr36",
    brand: "Fathom",
    name: "FR36",
    type: "claseB",
    cost: 65000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/fr36.webp"
  },
  {
    id: "invictus",
    brand: "Canis",
    name: "Invictus",
    type: "claseB",
    cost: 65000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/onx_invictus.webp"
  },
  {
    id: "tokage",
    brand: "Dinka",
    name: "Tokage",
    type: "claseB",
    cost: 52000,
    stock: 0,
    image: "https://dunb17ur4ymx4.cloudfront.net/wysiwyg/1031918/e6b2651f26e777cc70818931f1e7db132dcac967.jpg"
  },
  {
    id: "terminusoverland",
    brand: "Canis",
    name: "Terminus Overland",
    type: "claseB",
    cost: 73000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/onx_terminus2.webp"
  },
  {
    id: "torero",
    brand: "Pegassi",
    name: "Torero",
    type: "claseB",
    cost: 56000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/torero.webp"
  },
  {
    id: "brawler",
    brand: "Coil",
    name: "Brawler",
    type: "claseB",
    cost: 70000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/brawler.webp"
  },
  {
    id: "turismoclassic",
    brand: "Grotti",
    name: "Turismo Classic",
    type: "claseB",
    cost: 75000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/turismo2.webp"
  },
  {
    id: "viseris",
    brand: "lampadati",
    name: "Viseris",
    type: "claseB",
    cost: 69000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/viseris.webp"
  },
  {
    id: "tropos rallye",
    brand: "lampadati",
    name: "Tropos Rallye",
    type: "claseB",
    cost: 52500,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/tropos.webp"
  },
  {
    id: "hellion",
    brand: "Annis",
    name: "Hellion",
    type: "claseB",
    cost: 43000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/hellion.webp"
  },
  {
    id: "chavosv6",
    brand: "Dinka",
    name: "Chavos V6",
    type: "claseB",
    cost: 60000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/chavosv6.webp"
  },
  {
    id: "tamworth",
    brand: "Weeny",
    name: "Tamworth",
    type: "claseB",
    cost: 45000,
    stock: 0,
    image: ""
  },
  {
    id: "dominator645",
    brand: "Vapid",
    name: "Dominator 645 Cabrio",
    type: "claseB",
    cost: 66000,
    stock: 0,
    image: ""
  },
  {
    id: "rebla",
    brand: "Ubermacht",
    name: "Rebla",
    type: "claseB",
    cost: 70000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/rebla.webp"
  },
  {
    id: "dominatorgtt",
    brand: "Vapid",
    name: "Dominator GTT",
    type: "claseB",
    cost: 66000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/dominator8.webp"
  },
  {
    id: "hedra",
    brand: "Vulcar",
    name: "Hedra",
    type: "claseB",
    cost: 62000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbhedra.webp"
  },
  {
    id: "scout2025",
    brand: "Vapid",
    name: "Scout 2025",
    type: "claseB",
    cost: 62000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/onx_scout25.webp"
  },
  {
    id: "meritppv",
    brand: "Cheval",
    name: "merit PPV",
    type: "claseB",
    cost: 60000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/onx_merit3.webp"
  },
  {
    id: "sugoi",
    brand: "Dinka",
    name: "Sugoi",
    type: "claseB",
    cost: 70000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/sugoi.webp"
  },
  {
    id: "kanjojs",
    brand: "Dinka",
    name: "Kanjo SJ",
    type: "claseB",
    cost: 72000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/kanjosj.webp"
  },
  {
    id: "oraclexsle",
    brand: "Ubermacht",
    name: "Oracle XS-LE",
    type: "claseB",
    cost: 65000,
    stock: 0,
    image: ""
  },
  {
    id: "argento",
    brand: "Obey",
    name: "Argento",
    type: "claseB",
    cost: 56000,
    stock: 0,
    image: ""
  },
  {
    id: "hedra2",
    brand: "vulcar",
    name: "Hedra Kombi",
    type: "claseB",
    cost: 73000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbhedrakombi.webp"
  },
  {
    id: "previon",
    brand: "Karin",
    name: "Previon",
    type: "claseB",
    cost: 50000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/previon.webp"
  },
  {
    id: "briosora",
    brand: "Grotti",
    name: "Brioso R/A",
    type: "claseB",
    cost: 67000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/brioso.webp"
  },
  {
    id: "tahomagt",
    brand: "Declasse",
    name: "Tahoma GT",
    type: "claseB",
    cost: 67000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbtahomagt.webp"
  },
  {
    id: "vivant",
    brand: "Bordeaux",
    name: "Vivant",
    type: "claseB",
    cost: 57000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbvivant.webp"
  },
  {
    id: "bison35xd",
    brand: "Bravado",
    name: "Bison 35 XD",
    type: "claseB",
    cost: 72000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/onx_tfbison.webp"
  },
  {
    id: "raidillon",
    brand: "Toundra",
    name: "Raidillon",
    type: "claseB",
    cost: 67200,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbraidillon.webp"
  },
  {
    id: "190z",
    brand: "Karin",
    name: "190z",
    type: "claseB",
    cost: 55000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/z190.webp"
  },
  {
    id: "picador",
    brand: "Cheval",
    name: "Picador",
    type: "claseB",
    cost: 42000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/picador.webp"
  },
  {
    id: "vivanite",
    brand: "Karin",
    name: "Vivanite",
    type: "claseB",
    cost: 46500,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/vivanite.webp"
  },
  {
    id: "windsordrop",
    brand: "Enus",
    name: "Windsor Drop",
    type: "claseB",
    cost: 63000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/windsor2.webp"
  },
  {
    id: "issihardtop",
    brand: "Weeny",
    name: "Issi Hardtop",
    type: "claseB",
    cost: 42000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/issi2.webp"
  },
  {
    id: "irisz",
    brand: "Bollokan",
    name: "Iris Z",
    type: "claseB",
    cost: 76000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbirisz.webp"
  },
  {
    id: "sentinelxs4",
    brand: "Ubermacht",
    name: "Sentinel XS4",
    type: "claseB",
    cost: 60000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/sentinel6.webp"
  },
  {
    id: "stratum",
    brand: "Zirconium",
    name: "Stratum",
    type: "claseB",
    cost: 45000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/stratum.webp"
  },
  {
    id: "sultanclassic",
    brand: "Karin",
    name: "Sultan Classic",
    type: "claseB",
    cost: 70000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/sultan2.webp"
  },
  {
    id: "everon",
    brand: "Karin",
    name: "Everon",
    type: "claseB",
    cost: 62000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/everon.webp"
  },
  {
    id: "sandstormd205xl",
    brand: "Vapid",
    name: "Sandstorm D205 XL",
    type: "claseB",
    cost: 67000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/onx_sandstormxl.webp"
  },
  {
    id: "vorschlaghammer",
    brand: "Benefactor",
    name: "Vorschlaghammer",
    type: "claseB",
    cost: 70000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/vorschlaghammer.webp"
  },
  {
    id: "buffaloac",
    brand: "Bravado",
    name: "Buffalo A/C",
    type: "claseB",
    cost: 70000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/onx_buffaloac.webp"
  },
  {
    id: "xls",
    brand: "Benefactor",
    name: "XLS",
    type: "claseB",
    cost: 55000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/xls.webp"
  },
  {
    id: "guardianswb",
    brand: "Vapid",
    name: "Guardian SWB",
    type: "claseB",
    cost: 70000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/onx_guardian.webp"
  },
  {
    id: "mochi",
    brand: "Annis",
    name: "Mochi",
    type: "claseB",
    cost: 47000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/gbmochi.webp"
  },
  {
    id: "komoda",
    brand: "Lampadati",
    name: "Komoda",
    type: "claseB",
    cost: 66000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/komoda.webp"
  },
  {
    id: "terminus",
    brand: "Canis",
    name: "Terminus",
    type: "claseB",
    cost: 62500,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/terminus.webp"
  },
  {
    id: "castigator",
    brand: "Canis",
    name: "Castigator",
    type: "claseB",
    cost: 60000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/castigator.webp"
  },

  /* ================= CLASE C ================= */
  {
    id: "patriot",
    brand: "Mammoth",
    name: "Patriot",
    type: "claseC",
    cost: 10000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/patriot.webp"
  },
  {
    id: "sandking-d155-xl",
    brand: "Vapid",
    name: "Sandking D155 XL",
    type: "claseC",
    cost: 17500,
    stock: 3,
    image: "https://cdn.prodigyrp.net/vehicles/onx_sandking3.webp"
  },
  {
    id: "primo",
    brand: "Albany",
    name: "Primo",
    type: "claseC",
    cost: 10000,
    stock: 2,
    image: "https://cdn.prodigyrp.net/vehicles/primo.webp"
  },
  {
    id: "washington",
    brand: "Albany",
    name: "Washington",
    type: "claseC",
    cost: 3200,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/washington.webp"
  },
  {
    id: "comet-cl",
    brand: "Pfister",
    name: "Comet CL",
    type: "claseC",
    cost: 16000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/gbcometcl.webp"
  },
  {
    id: "asterope",
    brand: "Karin",
    name: "Asterope",
    type: "claseC",
    cost: 10000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/asterope.webp"
  },
  {
    id: "sandking-d155-swb",
    brand: "Vapid",
    name: "Sandking D155 SWB",
    type: "claseC",
    cost: 17000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/onx_sandking2.webp"
  },
  {
    id: "baller-ii",
    brand: "Gallivan",
    name: "Baller II",
    type: "claseC",
    cost: 10000,
    stock: 2,
    image: "https://cdn.prodigyrp.net/vehicles/baller2.webp"
  },
  {
    id: "contender",
    brand: "Vapid",
    name: "Contender",
    type: "claseC",
    cost: 17555.56,
    stock: 2,
    image: "https://cdn.prodigyrp.net/vehicles/contender.webp"
  },
  {
    id: "jogger-passenger-lwb-4x4",
    brand: "Benefactor",
    name: "Jogger Passenger LWB 4x4",
    type: "claseC",
    cost: 19000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/onx_tfjoggerpl3.webp"
  },

  /* ================= CLASE D ================= */
  {
    id: "tow-truck",
    brand: "Stanley",
    name: "Tow Truck",
    type: "claseD",
    cost: 3000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/towtruck2.webp"
  },
  {
    id: "paradise",
    brand: "Bravado",
    name: "Paradise",
    type: "claseD",
    cost: 5000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/paradise.webp"
  },
  {
    id: "speedo",
    brand: "Vapid",
    name: "Speedo",
    type: "claseD",
    cost: 2000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/speedo.webp"
  },
  {
    id: "ratbike",
    brand: "Western",
    name: "Ratbike",
    type: "claseD",
    cost: 1000,
    stock: 3,
    image: "https://cdn.prodigyrp.net/vehicles/ratbike.webp"
  }
];

export function calculateSalePrice(cost, type) {
  const markup = MARKUP_BY_CLASS[type] ?? 0;
  return Math.round(Number(cost || 0) * (1 + markup));
}

export function calculateTax(price) {
  return Math.round(Number(price || 0) * TAX_RATE);
}

export function calculateTotalWithTax(price) {
  return Number(price || 0) + calculateTax(price);
}

export function calculateCommission(price, type) {
  const rate = COMMISSION_BY_CLASS[type] ?? 0;
  return Math.round(Number(price || 0) * rate);
}

export function getClassName(type) {
  return ({
    claseS: "Clase S",
    claseA: "Clase A",
    claseB: "Clase B",
    claseC: "Clase C",
    claseD: "Clase D"
  })[type] || type;
}

export function getVehicleById(id) {
  return vehicles.find(vehicle => vehicle.id === id);
}

export function getPublicVehicle(vehicle) {
  const price = calculateSalePrice(vehicle.cost, vehicle.type);
  const tax = calculateTax(price);
  const total = calculateTotalWithTax(price);

  return {
    id: vehicle.id,
    brand: vehicle.brand,
    name: vehicle.name,
    type: vehicle.type,
    className: getClassName(vehicle.type),
    stock: Number(vehicle.stock || 0),
    image: vehicle.image || "",
    price,
    tax,
    total,
    availability: Number(vehicle.stock || 0) > 0 ? "inmediata" : "reserva"
  };
}
