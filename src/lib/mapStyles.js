// Paleta de colores consistente con tu UI
export const COLORS = {
	grayLight: '#f0f0f0',
	grayText: '#555555',
	waterBlue: '#a2cffe',
	roadGray: '#d6d6d6',
	parkGray: '#cdd3d8',
	adminGray: '#d6d6d6'
};

// Estilo del mapa (gris + azul)
export const grayBlueMapStyle = [
	{ elementType: 'geometry', stylers: [{ color: COLORS.grayLight }] },
	{ elementType: 'labels.text.fill', stylers: [{ color: COLORS.grayText }] },
	{ elementType: 'labels.text.stroke', stylers: [{ color: COLORS.grayLight }] },
	{
		featureType: 'water',
		elementType: 'geometry',
		stylers: [{ color: COLORS.waterBlue }]
	},
	{
		featureType: 'road',
		elementType: 'geometry',
		stylers: [{ color: COLORS.roadGray }]
	},
	{
		featureType: 'road',
		elementType: 'labels.text.fill',
		stylers: [{ color: COLORS.grayText }]
	},
	{
		featureType: 'poi.park',
		elementType: 'geometry',
		stylers: [{ color: COLORS.parkGray }]
	},
	{
		featureType: 'administrative',
		elementType: 'geometry',
		stylers: [{ color: COLORS.adminGray }]
	}
];

// Paleta gris oscura para tema 'dark' (sin azules)
export const DGREY = {
  bg: '#0f1115',
  land: '#111318',
  road: '#1b1f26',
  roadStroke: '#0b0d11',
  arterial: '#232833',
  highway: '#2c3340',
  water: '#0f1217',
  park: '#151922',
  poi: '#141820',
  text: '#c5cbd5',
  textStroke: '#0f1115',
  admin: '#1a1f29'
};

// Estilo oscuro en escala de grises
export const darkGrayMapStyle = [
  { elementType: 'geometry', stylers: [{ color: DGREY.land }] },
  { elementType: 'labels.text.fill', stylers: [{ color: DGREY.text }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: DGREY.textStroke }] },

  { featureType: 'water', elementType: 'geometry', stylers: [{ color: DGREY.water }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: DGREY.text }] },

  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: DGREY.park }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: DGREY.poi }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: DGREY.text }] },

  { featureType: 'road', elementType: 'geometry', stylers: [{ color: DGREY.road }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: DGREY.roadStroke }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: DGREY.text }] },

  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: DGREY.arterial }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: DGREY.highway }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: DGREY.road }] },

  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: DGREY.admin }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: DGREY.text }] },

  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: DGREY.land }] }
];

// src/lib/mapStyles.js
export const DBLUE = {
	bg: '#0b1524', // fondo global
	land: '#0e1b2c', // geometría base
	road: '#1c2f44', // calles
	roadStroke: '#0a111b', // borde de calles
	arterial: '#2a4766', // arterias principales
	highway: '#375c80',
	water: '#0a2138',
	park: '#102537',
	poi: '#12283b',
	text: '#7aa2c4',
	textStroke: '#0b1524',
	admin: '#1a2840'
};

// Estilo tipo “car UI” (oscuro, azules, labels discretos)
export const darkBlueCarStyle = [
	{ elementType: 'geometry', stylers: [{ color: DBLUE.land }] },
	{ elementType: 'labels.text.fill', stylers: [{ color: DBLUE.text }] },
	{ elementType: 'labels.text.stroke', stylers: [{ color: DBLUE.textStroke }] },

	// Agua
	{ featureType: 'water', elementType: 'geometry', stylers: [{ color: DBLUE.water }] },
	{ featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: DBLUE.text }] },

	// Parques/POIs
	{ featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: DBLUE.park }] },
	{ featureType: 'poi', elementType: 'geometry', stylers: [{ color: DBLUE.poi }] },
	{ featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
	{ featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: DBLUE.text }] },

	// Carreteras
	{ featureType: 'road', elementType: 'geometry', stylers: [{ color: DBLUE.road }] },
	{ featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: DBLUE.roadStroke }] },
	{ featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: DBLUE.text }] },

	// Arterias y autopistas con un poco más de contraste azul
	{ featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: DBLUE.arterial }] },
	{ featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: DBLUE.highway }] },
	{ featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: DBLUE.road }] },

	// Áreas administrativas
	{ featureType: 'administrative', elementType: 'geometry', stylers: [{ color: DBLUE.admin }] },
	{
		featureType: 'administrative.locality',
		elementType: 'labels.text.fill',
		stylers: [{ color: DBLUE.text }]
	},

	// Desaturar tránsito y paisajes extra
	{ featureType: 'transit', stylers: [{ visibility: 'off' }] },
	{ featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: DBLUE.land }] }
];
