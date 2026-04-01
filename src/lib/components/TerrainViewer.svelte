<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	type Resolution = '100m' | '1km' | '10km';
	type WindDirection = 'along' | 'cross';
	type Overlay = 'texture' | 'mesh';

	let mapContainer: HTMLDivElement;
	let windCanvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let map: any;
	let maplibregl: any;
	let mapLoaded = false;
	let animFrameId: number;
	let currentResolution: Resolution = $state('1km');
	let currentWind: WindDirection = $state('along');
	let currentOverlay: Overlay = $state('texture');
	let protocolRegistered = false;

	const CENTER: [number, number] = [131.0369, -25.3444];
	const SPEED_FACTOR = 0.00004;
	const PARTICLE_MAX_AGE = 60;
	const TRAIL_LENGTH = 6;

	const PARTICLE_COUNT = 150;

	// ─── Elevation grid for custom terrain DEM ───
	interface ElevGrid {
		cols: number;
		rows: number;
		data: Float32Array;
		lons: number[];
		lats: number[];
		minLon: number;
		maxLon: number;
		minLat: number;
		maxLat: number;
		useNearest: boolean;
	}
	let elevGrid: ElevGrid | null = null;

	function sampleElevation(lon: number, lat: number): number {
		if (!elevGrid) return 500;
		const g = elevGrid;
		if (lon < g.minLon || lon > g.maxLon || lat < g.minLat || lat > g.maxLat) return 500;

		const fx = ((lon - g.minLon) / (g.maxLon - g.minLon)) * (g.cols - 1);
		const fy = ((lat - g.minLat) / (g.maxLat - g.minLat)) * (g.rows - 1);

		if (g.useNearest || g.cols < 30) {
			const ix = Math.min(Math.round(fx), g.cols - 1);
			const iy = Math.min(Math.round(fy), g.rows - 1);
			return g.data[iy * g.cols + ix];
		}
		// Bilinear
		const ix = Math.min(Math.floor(fx), g.cols - 2);
		const iy = Math.min(Math.floor(fy), g.rows - 2);
		const dx = fx - ix;
		const dy = fy - iy;
		const i00 = iy * g.cols + ix;
		return (1 - dx) * (1 - dy) * g.data[i00]
			+ dx * (1 - dy) * g.data[i00 + 1]
			+ (1 - dx) * dy * g.data[i00 + g.cols]
			+ dx * dy * g.data[i00 + g.cols + 1];
	}

	async function loadElevGrid(resolution: Resolution): Promise<ElevGrid | null> {
		try {
			const resp = await fetch(`/data/downscaling/terrain_${resolution}.csv`);
			if (!resp.ok) return null;
			const text = await resp.text();
			const lines = text.trim().split('\n');
			const header = lines[0].split(',').map((h) => h.trim());
			const lonIdx = header.indexOf('lon');
			const latIdx = header.indexOf('lat');
			const zIdx = header.indexOf('z');

			const raw: { lon: number; lat: number; z: number }[] = [];
			for (let i = 1; i < lines.length; i++) {
				const c = lines[i].split(',').map(Number);
				raw.push({ lon: c[lonIdx], lat: c[latIdx], z: c[zIdx] });
			}

			const lonSet = [...new Set(raw.map((p) => +p.lon.toFixed(6)))].sort((a, b) => a - b);
			const latSet = [...new Set(raw.map((p) => +p.lat.toFixed(6)))].sort((a, b) => a - b);
			const cols = lonSet.length;
			const rows = latSet.length;
			const data = new Float32Array(cols * rows);
			data.fill(500); // default

			const lookup = new Map<string, number>();
			for (let i = 0; i < raw.length; i++) {
				lookup.set(`${raw[i].lon.toFixed(6)},${raw[i].lat.toFixed(6)}`, i);
			}
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols; col++) {
					const key = `${lonSet[col].toFixed(6)},${latSet[row].toFixed(6)}`;
					const pi = lookup.get(key);
					if (pi !== undefined) data[row * cols + col] = raw[pi].z;
				}
			}

			return {
				cols, rows, data, lons: lonSet, lats: latSet,
				minLon: lonSet[0], maxLon: lonSet[cols - 1],
				minLat: latSet[0], maxLat: latSet[rows - 1],
				useNearest: resolution !== '100m'
			};
		} catch { return null; }
	}

	// Tile bounds from z/x/y (Web Mercator)
	function tileBounds(z: number, x: number, y: number) {
		const n = Math.pow(2, z);
		const west = (x / n) * 360 - 180;
		const east = ((x + 1) / n) * 360 - 180;
		const north = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * (180 / Math.PI);
		const south = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * (180 / Math.PI);
		return { west, east, north, south };
	}

	// ─── Wind field ───
	interface WindGrid {
		lons: number[];
		lats: number[];
		cols: number;
		rows: number;
		u: Float32Array;
		v: Float32Array;
		minLon: number;
		maxLon: number;
		minLat: number;
		maxLat: number;
		useNearest: boolean;
	}
	let windGrid: WindGrid | null = null;

	async function loadWindGrid(resolution: Resolution, direction: WindDirection): Promise<WindGrid | null> {
		try {
			const resp = await fetch(`/data/downscaling/wind_${direction}_${resolution}.csv`);
			if (!resp.ok) return null;
			const text = await resp.text();
			const lines = text.trim().split('\n');
			const header = lines[0].split(',').map((h) => h.trim());
			const lonIdx = header.indexOf('lon');
			const latIdx = header.indexOf('lat');
			const uIdx = header.indexOf('u');
			const vIdx = header.indexOf('v');

			const raw: { lon: number; lat: number; u: number; v: number }[] = [];
			for (let i = 1; i < lines.length; i++) {
				const c = lines[i].split(',').map(Number);
				raw.push({ lon: c[lonIdx], lat: c[latIdx], u: c[uIdx], v: c[vIdx] });
			}

			const lonSet = [...new Set(raw.map((p) => +p.lon.toFixed(6)))].sort((a, b) => a - b);
			const latSet = [...new Set(raw.map((p) => +p.lat.toFixed(6)))].sort((a, b) => a - b);
			const cols = lonSet.length;
			const rows = latSet.length;
			const u = new Float32Array(cols * rows);
			const v = new Float32Array(cols * rows);

			const lookup = new Map<string, number>();
			for (let i = 0; i < raw.length; i++) {
				lookup.set(`${raw[i].lon.toFixed(6)},${raw[i].lat.toFixed(6)}`, i);
			}
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols; col++) {
					const key = `${lonSet[col].toFixed(6)},${latSet[row].toFixed(6)}`;
					const idx = row * cols + col;
					const pi = lookup.get(key);
					if (pi !== undefined) { u[idx] = raw[pi].u; v[idx] = raw[pi].v; }
				}
			}

			return {
				lons: lonSet, lats: latSet, cols, rows, u, v,
				minLon: lonSet[0], maxLon: lonSet[cols - 1],
				minLat: latSet[0], maxLat: latSet[rows - 1],
				useNearest: resolution !== '100m'
			};
		} catch { return null; }
	}

	function sampleWind(grid: WindGrid, lon: number, lat: number): [number, number] | null {
		if (lon < grid.minLon || lon > grid.maxLon || lat < grid.minLat || lat > grid.maxLat) return null;
		const fx = ((lon - grid.minLon) / (grid.maxLon - grid.minLon)) * (grid.cols - 1);
		const fy = ((lat - grid.minLat) / (grid.maxLat - grid.minLat)) * (grid.rows - 1);

		if (grid.useNearest) {
			const ix = Math.min(Math.round(fx), grid.cols - 1);
			const iy = Math.min(Math.round(fy), grid.rows - 1);
			const idx = iy * grid.cols + ix;
			return [grid.u[idx], grid.v[idx]];
		}
		const ix = Math.min(Math.floor(fx), grid.cols - 2);
		const iy = Math.min(Math.floor(fy), grid.rows - 2);
		const dx = fx - ix;
		const dy = fy - iy;
		const i00 = iy * grid.cols + ix;
		const uV = (1 - dx) * (1 - dy) * grid.u[i00] + dx * (1 - dy) * grid.u[i00 + 1]
			+ (1 - dx) * dy * grid.u[i00 + grid.cols] + dx * dy * grid.u[i00 + grid.cols + 1];
		const vV = (1 - dx) * (1 - dy) * grid.v[i00] + dx * (1 - dy) * grid.v[i00 + 1]
			+ (1 - dx) * dy * grid.v[i00 + grid.cols] + dx * dy * grid.v[i00 + grid.cols + 1];
		return [uV, vV];
	}

	// ─── Mesh overlay ───
	const MESH_LINE_WIDTH: Record<Resolution, number> = { '100m': 0.5, '1km': 1.5, '10km': 2.5 };
	const MESH_POINT_RADIUS: Record<Resolution, number> = { '100m': 1.5, '1km': 3, '10km': 5 };

	function buildMeshGeoJSON(grid: ElevGrid) {
		const { lons, lats, cols, rows } = grid;
		const lineFeatures: any[] = [];
		for (let r = 0; r < rows; r++) {
			const coords: [number, number][] = [];
			for (let c = 0; c < cols; c++) coords.push([lons[c], lats[r]]);
			lineFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} });
		}
		for (let c = 0; c < cols; c++) {
			const coords: [number, number][] = [];
			for (let r = 0; r < rows; r++) coords.push([lons[c], lats[r]]);
			lineFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} });
		}
		const pointFeatures: any[] = [];
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				pointFeatures.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [lons[c], lats[r]] }, properties: {} });
			}
		}
		return {
			lines: { type: 'FeatureCollection', features: lineFeatures },
			points: { type: 'FeatureCollection', features: pointFeatures }
		};
	}

	// ─── Particles (flat arrays) ───
	let numParticles = 0;
	let pLon: Float64Array;
	let pLat: Float64Array;
	let pAge: Int16Array;
	let pMaxAge: Int16Array;
	let pTrailX: Float32Array;
	let pTrailY: Float32Array;
	let pTrailLen: Uint8Array;

	// Warm Windy-style color palette
	const COLOR_LUT: string[] = [];
	(function buildLUT() {
		const stops = [
			{ t: 0.00, r: 30, g: 60, b: 120 },
			{ t: 0.12, r: 40, g: 140, b: 160 },
			{ t: 0.25, r: 100, g: 200, b: 100 },
			{ t: 0.40, r: 230, g: 230, b: 40 },
			{ t: 0.55, r: 255, g: 170, b: 20 },
			{ t: 0.75, r: 240, g: 60, b: 30 },
			{ t: 1.00, r: 200, g: 20, b: 60 },
		];
		for (let i = 0; i < 256; i++) {
			const t = i / 255;
			let si = 0;
			for (let s = 0; s < stops.length - 1; s++) {
				if (t >= stops[s].t) si = s;
			}
			const s0 = stops[si], s1 = stops[si + 1];
			const f = (t - s0.t) / (s1.t - s0.t);
			const r = Math.round(s0.r + (s1.r - s0.r) * f);
			const g = Math.round(s0.g + (s1.g - s0.g) * f);
			const b = Math.round(s0.b + (s1.b - s0.b) * f);
			COLOR_LUT[i] = `rgb(${r},${g},${b})`;
		}
	})();

	function resetParticle(i: number) {
		if (!windGrid || !map) return;
		pLon[i] = windGrid.minLon + Math.random() * (windGrid.maxLon - windGrid.minLon);
		pLat[i] = windGrid.minLat + Math.random() * (windGrid.maxLat - windGrid.minLat);
		pAge[i] = 0;
		pMaxAge[i] = (PARTICLE_MAX_AGE * (0.5 + Math.random())) | 0;
		const pt = map.project([pLon[i], pLat[i]]);
		const base = i * TRAIL_LENGTH;
		for (let t = 0; t < TRAIL_LENGTH; t++) {
			pTrailX[base + t] = pt.x;
			pTrailY[base + t] = pt.y;
		}
		pTrailLen[i] = 1;
	}

	function initParticles(count: number) {
		numParticles = count;
		pLon = new Float64Array(count);
		pLat = new Float64Array(count);
		pAge = new Int16Array(count);
		pMaxAge = new Int16Array(count);
		pTrailX = new Float32Array(count * TRAIL_LENGTH);
		pTrailY = new Float32Array(count * TRAIL_LENGTH);
		pTrailLen = new Uint8Array(count);
		for (let i = 0; i < count; i++) {
			resetParticle(i);
			pAge[i] = (Math.random() * pMaxAge[i]) | 0;
		}
	}

	function syncScreenPositions() {
		if (!map) return;
		for (let i = 0; i < numParticles; i++) {
			const pt = map.project([pLon[i], pLat[i]]);
			const base = i * TRAIL_LENGTH;
			for (let t = 0; t < TRAIL_LENGTH; t++) {
				pTrailX[base + t] = pt.x;
				pTrailY[base + t] = pt.y;
			}
			pTrailLen[i] = 1;
		}
	}

	// ─── Animation ───
	function animate() {
		if (!ctx || !map || !windGrid) {
			animFrameId = requestAnimationFrame(animate);
			return;
		}
		const cw = windCanvas.width;
		const ch = windCanvas.height;

		// Fade previous frame for trail persistence
		ctx.globalCompositeOperation = 'destination-in';
		ctx.fillStyle = 'rgba(0,0,0,0.93)';
		ctx.fillRect(0, 0, cw, ch);
		ctx.globalCompositeOperation = 'lighter';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		for (let i = 0; i < numParticles; i++) {
			const wind = sampleWind(windGrid, pLon[i], pLat[i]);
			if (!wind || pAge[i] > pMaxAge[i]) { resetParticle(i); continue; }

			pLon[i] += wind[0] * SPEED_FACTOR;
			pLat[i] += wind[1] * SPEED_FACTOR;
			pAge[i]++;

			const pt = map.project([pLon[i], pLat[i]]);
			if (pt.x < -20 || pt.x > cw + 20 || pt.y < -20 || pt.y > ch + 20) { resetParticle(i); continue; }

			// Push new position into trail buffer
			const base = i * TRAIL_LENGTH;
			const len = Math.min(pTrailLen[i] + 1, TRAIL_LENGTH);
			for (let t = len - 1; t > 0; t--) {
				pTrailX[base + t] = pTrailX[base + t - 1];
				pTrailY[base + t] = pTrailY[base + t - 1];
			}
			pTrailX[base] = pt.x;
			pTrailY[base] = pt.y;
			pTrailLen[i] = len;

			if (len < 2) continue;

			const ar = pAge[i] / pMaxAge[i];
			const alpha = ar < 0.08 ? ar * 12.5 : ar > 0.85 ? (1 - ar) * 6.67 : 1.0;
			const speed = Math.sqrt(wind[0] * wind[0] + wind[1] * wind[1]);
			const ci = Math.min(Math.round((speed / 20) * 255), 255);

			// Thick Windy-style strokes
			ctx.lineWidth = 2.5 + (speed / 15) * 3.5;
			ctx.globalAlpha = Math.min(alpha * 0.35, 0.35);
			ctx.strokeStyle = COLOR_LUT[ci];

			// Smooth curve through last 3 trail positions (quadratic Bézier)
			ctx.beginPath();
			if (len >= 3) {
				ctx.moveTo(pTrailX[base + 2], pTrailY[base + 2]);
				ctx.quadraticCurveTo(
					pTrailX[base + 1], pTrailY[base + 1],
					pTrailX[base], pTrailY[base]
				);
			} else {
				ctx.moveTo(pTrailX[base + 1], pTrailY[base + 1]);
				ctx.lineTo(pTrailX[base], pTrailY[base]);
			}
			ctx.stroke();
		}

		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'source-over';
		animFrameId = requestAnimationFrame(animate);
	}

	function resizeCanvas() {
		if (!windCanvas || !mapContainer) return;
		const rect = mapContainer.getBoundingClientRect();
		windCanvas.width = rect.width;
		windCanvas.height = rect.height;
		windCanvas.style.width = rect.width + 'px';
		windCanvas.style.height = rect.height + 'px';
		ctx = windCanvas.getContext('2d');
	}

	// ─── Update everything on resolution/wind change ───
	let terrainVersion = 0;

	async function updateView() {
		if (!map || !mapLoaded) return;

		// Load data
		const [newElev, newWind] = await Promise.all([
			loadElevGrid(currentResolution),
			loadWindGrid(currentResolution, currentWind)
		]);

		elevGrid = newElev;
		windGrid = newWind;

		// Switch terrain source to force MapLibre to re-fetch tiles from our protocol
		terrainVersion++;
		const srcId = `csvdem-${terrainVersion}`;

		if (map.getTerrain()) map.setTerrain(null);
		// Remove old sources
		for (const id of Object.keys(map.getStyle().sources)) {
			if (id.startsWith('csvdem-')) {
				try { map.removeSource(id); } catch {}
			}
		}

		map.addSource(srcId, {
			type: 'raster-dem',
			tiles: [`csvdem://tile/{z}/{x}/{y}?v=${terrainVersion}`],
			encoding: 'terrarium',
			tileSize: 256,
			maxzoom: 14
		});
		map.setTerrain({ source: srcId, exaggeration: 2.0 });

		// Update mesh overlay
		if (elevGrid) {
			const mesh = buildMeshGeoJSON(elevGrid);
			const linesSrc = map.getSource('mesh-lines');
			const pointsSrc = map.getSource('mesh-points');
			if (linesSrc) (linesSrc as any).setData(mesh.lines);
			if (pointsSrc) (pointsSrc as any).setData(mesh.points);
			if (map.getLayer('mesh-lines-layer')) {
				map.setPaintProperty('mesh-lines-layer', 'line-width', MESH_LINE_WIDTH[currentResolution]);
			}
			if (map.getLayer('mesh-points-layer')) {
				map.setPaintProperty('mesh-points-layer', 'circle-radius', MESH_POINT_RADIUS[currentResolution]);
			}
		}

		// Reset particles
		if (windGrid) {
			initParticles(PARTICLE_COUNT);
			if (ctx) ctx.clearRect(0, 0, windCanvas.width, windCanvas.height);
		}
	}

	function setResolution(res: Resolution) {
		currentResolution = res;
		updateView();
	}

	function setWind(dir: WindDirection) {
		currentWind = dir;
		updateView();
	}

	function setOverlay(mode: Overlay) {
		currentOverlay = mode;
		if (!map || !mapLoaded) return;
		map.setLayoutProperty('satellite-layer', 'visibility', mode === 'texture' ? 'visible' : 'none');
		const meshVis = mode === 'mesh' ? 'visible' : 'none';
		if (map.getLayer('mesh-lines-layer')) map.setLayoutProperty('mesh-lines-layer', 'visibility', meshVis);
		if (map.getLayer('mesh-points-layer')) map.setLayoutProperty('mesh-points-layer', 'visibility', meshVis);
	}

	// ─── Mount ───
	onMount(async () => {
		maplibregl = await import('maplibre-gl');

		// Register custom protocol for terrain from CSV
		if (!protocolRegistered) {
			maplibregl.addProtocol('csvdem', async (params: any) => {
				const match = params.url.match(/csvdem:\/\/tile\/(\d+)\/(\d+)\/(\d+)/);
				if (!match) return { data: new ArrayBuffer(0) };

				const z = +match[1], x = +match[2], y = +match[3];
				const bounds = tileBounds(z, x, y);

				const canvas = document.createElement('canvas');
				canvas.width = 256;
				canvas.height = 256;
				const tCtx = canvas.getContext('2d')!;
				const imageData = tCtx.createImageData(256, 256);
				const d = imageData.data;

				for (let py = 0; py < 256; py++) {
					const lat = bounds.north - (py / 255) * (bounds.north - bounds.south);
					for (let px = 0; px < 256; px++) {
						const lon = bounds.west + (px / 255) * (bounds.east - bounds.west);
						const elev = sampleElevation(lon, lat);

						// Terrarium: height = (R * 256 + G + B / 256) - 32768
						const enc = elev + 32768;
						const r = Math.floor(enc / 256);
						const g = Math.floor(enc % 256);
						const b = Math.round((enc % 1) * 256);

						const idx = (py * 256 + px) * 4;
						d[idx] = r;
						d[idx + 1] = g;
						d[idx + 2] = b;
						d[idx + 3] = 255;
					}
				}

				tCtx.putImageData(imageData, 0, 0);
				const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
				const data = await blob.arrayBuffer();
				return { data };
			});
			protocolRegistered = true;
		}

		map = new maplibregl.Map({
			container: mapContainer,
			style: {
				version: 8,
				sources: {
					satellite: {
						type: 'raster',
						tiles: [
							'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
						],
						tileSize: 256,
						maxzoom: 18
					}
				},
				layers: [
					{ id: 'dark-background', type: 'background', paint: { 'background-color': '#0f172a' } },
					{ id: 'satellite-layer', type: 'raster', source: 'satellite' }
				]
			},
			center: CENTER,
			zoom: 13,
			pitch: 60,
			bearing: -30,
			maxPitch: 85
		});

		map.addControl(new maplibregl.NavigationControl(), 'top-right');
		map.on('moveend', syncScreenPositions);

		map.on('load', async () => {
			mapLoaded = true;

			// Mesh overlay sources & layers (hidden by default)
			map.addSource('mesh-lines', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
			map.addSource('mesh-points', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
			map.addLayer({
				id: 'mesh-lines-layer', type: 'line', source: 'mesh-lines',
				layout: { visibility: 'none' },
				paint: { 'line-color': '#38bdf8', 'line-width': 1.5, 'line-opacity': 0.6 }
			});
			map.addLayer({
				id: 'mesh-points-layer', type: 'circle', source: 'mesh-points',
				layout: { visibility: 'none' },
				paint: { 'circle-color': '#38bdf8', 'circle-radius': 3, 'circle-opacity': 0.9, 'circle-stroke-color': '#fff', 'circle-stroke-width': 0.5 }
			});

			resizeCanvas();
			await updateView();
			animate();
		});

		window.addEventListener('resize', resizeCanvas);
	});

	onDestroy(() => {
		if (animFrameId) cancelAnimationFrame(animFrameId);
		if (map) map.remove();
		if (browser) window.removeEventListener('resize', resizeCanvas);
	});

	const resolutions: { key: Resolution; label: string; detail: string }[] = [
		{ key: '10km', label: '10 km', detail: 'Global' },
		{ key: '1km', label: '1 km', detail: 'Meso' },
		{ key: '100m', label: '100 m', detail: 'CFD' }
	];
	const windDirs: { key: WindDirection; label: string }[] = [
		{ key: 'along', label: 'Along' },
		{ key: 'cross', label: 'Cross' }
	];
	const overlays: { key: Overlay; label: string }[] = [
		{ key: 'texture', label: 'Satellite' },
		{ key: 'mesh', label: 'Mesh' }
	];
</script>

{#if browser}
	<div class="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
		<div bind:this={mapContainer} class="w-full h-[500px] sm:h-[600px]"></div>
		<canvas bind:this={windCanvas} class="absolute inset-0 pointer-events-none" style="mix-blend-mode: screen;"></canvas>

		<!-- Resolution -->
		<div class="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-1 shadow-xl">
			<span class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-2 pb-1 border-b border-gray-700">Resolution</span>
			{#each resolutions as res}
				<button onclick={() => setResolution(res.key)}
					class="flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all cursor-pointer
						{currentResolution === res.key ? 'bg-blue-500 text-white shadow-md' : 'text-gray-300 hover:bg-white/10'}">
					<span class="font-mono font-bold w-12 text-right">{res.label}</span>
					<span class="text-xs opacity-60">{res.detail}</span>
				</button>
			{/each}
		</div>

		<!-- Wind -->
		<div class="absolute top-4 left-48 bg-black/80 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-1 shadow-xl">
			<span class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-2 pb-1 border-b border-gray-700">Wind</span>
			{#each windDirs as dir}
				<button onclick={() => setWind(dir.key)}
					class="px-3 py-1.5 rounded text-sm transition-all cursor-pointer
						{currentWind === dir.key ? 'bg-blue-500 text-white shadow-md' : 'text-gray-300 hover:bg-white/10'}">
					{dir.label}
				</button>
			{/each}
		</div>

		<!-- Surface -->
		<div class="absolute top-4 left-[300px] bg-black/80 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-1 shadow-xl">
			<span class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-2 pb-1 border-b border-gray-700">Surface</span>
			{#each overlays as ov}
				<button onclick={() => setOverlay(ov.key)}
					class="px-3 py-1.5 rounded text-sm transition-all cursor-pointer
						{currentOverlay === ov.key ? 'bg-blue-500 text-white shadow-md' : 'text-gray-300 hover:bg-white/10'}">
					{ov.label}
				</button>
			{/each}
		</div>

		<!-- Legend -->
		<div class="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 shadow-xl">
			<span class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-2">Wind speed (m/s)</span>
			<div class="flex items-center gap-1.5">
				<span class="text-xs text-gray-400">0</span>
				<div class="w-28 h-2.5 rounded-full" style="background: linear-gradient(to right, #1e3c78, #288ca0, #64c864, #e6e628, #ffaa14, #f03c1e, #c8143c);"></div>
				<span class="text-xs text-gray-400">20</span>
			</div>
		</div>
	</div>
{/if}

<style>
</style>
