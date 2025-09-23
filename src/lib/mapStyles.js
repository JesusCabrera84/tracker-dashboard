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
