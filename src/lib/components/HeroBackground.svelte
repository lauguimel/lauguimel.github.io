<script lang="ts">
	import { onMount } from 'svelte';

	// Seeded random
	function sr(seed: number): number {
		const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
		return x - Math.floor(x);
	}

	function ln(a: {x:number;y:number}, b: {x:number;y:number}) {
		return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
	}

	// === 3D MESH CUBE (isometric, 3 visible faces) ===
	const G = 7; // subdivisions per edge
	const S = 30; // cube size in viewBox units
	const C = { x: 17, y: 50 }; // center position

	// Isometric axes
	const ax = { x: 0.75, y: 0.38 };
	const ay = { x: -0.75, y: 0.38 };
	const az = { x: 0, y: -0.76 };

	function iso(gx: number, gy: number, gz: number) {
		const s = S / G;
		return {
			x: C.x + (gx * ax.x + gy * ay.x + gz * az.x) * s,
			y: C.y + (gx * ax.y + gy * ay.y + gz * az.y) * s
		};
	}

	type Line2D = { x1: number; y1: number; x2: number; y2: number };

	const meshLines: Line2D[] = [];
	const meshDots: {x: number; y: number}[] = [];

	// Top face (z = G) — the flat top of the cube
	for (let i = 0; i <= G; i++) {
		for (let j = 0; j <= G; j++) {
			meshDots.push(iso(i, j, G));
			if (i < G) meshLines.push(ln(iso(i, j, G), iso(i+1, j, G)));
			if (j < G) meshLines.push(ln(iso(i, j, G), iso(i, j+1, G)));
		}
	}

	// Front-left face (y = 0)
	for (let i = 0; i <= G; i++) {
		for (let k = 0; k <= G; k++) {
			if (k < G) meshDots.push(iso(i, 0, k));
			if (i < G) meshLines.push(ln(iso(i, 0, k), iso(i+1, 0, k)));
			if (k < G) meshLines.push(ln(iso(i, 0, k), iso(i, 0, k+1)));
		}
	}

	// Front-right face (x = G)
	for (let j = 0; j <= G; j++) {
		for (let k = 0; k <= G; k++) {
			if (k < G) meshDots.push(iso(G, j, k));
			if (j < G) meshLines.push(ln(iso(G, j, k), iso(G, j+1, k)));
			if (k < G) meshLines.push(ln(iso(G, j, k), iso(G, j, k+1)));
		}
	}

	// === NEURAL NETWORK ===
	const NN_LEFT = 63;
	const NN_RIGHT = 96;
	const layers = [7, 9, 11, 9, 7, 4];

	type Neuron = { x: number; y: number; layer: number };
	type Synapse = { from: Neuron; to: Neuron; w: number };

	const neurons: Neuron[] = [];
	const synapses: Synapse[] = [];

	layers.forEach((count, li) => {
		const x = NN_LEFT + (li / (layers.length - 1)) * (NN_RIGHT - NN_LEFT);
		const spacing = Math.min(7, 60 / count);
		const top = 50 - (count - 1) * spacing / 2;
		for (let i = 0; i < count; i++) {
			neurons.push({ x, y: top + i * spacing, layer: li });
		}
	});

	// ~35% connectivity
	for (let l = 0; l < layers.length - 1; l++) {
		const from = neurons.filter(n => n.layer === l);
		const to = neurons.filter(n => n.layer === l + 1);
		from.forEach((f, fi) => {
			to.forEach((t, ti) => {
				if (sr(l * 1000 + fi * 100 + ti) < 0.35) {
					synapses.push({ from: f, to: t, w: sr(l * 500 + fi * 50 + ti + 7) });
				}
			});
		});
	}

	// Firing neurons (~20%)
	const firing = new Set<number>();
	neurons.forEach((_, i) => { if (sr(i * 41 + 3) > 0.8) firing.add(i); });

	// Animated pulses on ~15 synapses
	const pulses = synapses.filter((_, i) => sr(i * 37 + 5) > 0.75).slice(0, 15);

	// === FLOW CURVES (cube → NN) ===
	// Right edge of cube
	const cubeRightX = iso(G, 0, G / 2).x + 3;
	const firstLayerNeurons = neurons.filter(n => n.layer === 0);

	const flows: { d: string; delay: number; dur: number }[] = [];
	for (let i = 0; i < 8; i++) {
		const t = (i + 0.5) / 8;
		const sy = 22 + t * 56;
		const target = firstLayerNeurons[Math.min(Math.floor(t * firstLayerNeurons.length), firstLayerNeurons.length - 1)];
		const ey = target.y;
		const mx = (cubeRightX + NN_LEFT) / 2;
		const wave = (sr(i * 19) - 0.5) * 10;
		flows.push({
			d: `M ${cubeRightX} ${sy} C ${mx - 4} ${sy + wave} ${mx + 4} ${ey - wave} ${NN_LEFT} ${ey}`,
			delay: i * 0.5,
			dur: 3.5 + sr(i * 11) * 2.5
		});
	}

	let mounted = $state(false);
	onMount(() => { mounted = true; });
</script>

<div class="hero-bg" class:mounted>
	<svg
		viewBox="0 0 100 100"
		preserveAspectRatio="xMidYMid slice"
		class="absolute inset-0 w-full h-full"
		xmlns="http://www.w3.org/2000/svg"
	>
		<defs>
			<filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
				<feGaussianBlur stdDeviation="0.5" result="b"/>
				<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
			</filter>
			<filter id="glowBig" x="-100%" y="-100%" width="300%" height="300%">
				<feGaussianBlur stdDeviation="1" result="b"/>
				<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
			</filter>
		</defs>

		<!-- 3D MESH CUBE -->
		<g class="cube">
			{#each meshLines as l}
				<line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} class="mesh-edge"/>
			{/each}
			{#each meshDots as d, i}
				{#if i % 2 === 0}
					<circle cx={d.x} cy={d.y} r="0.3" class="mesh-dot"
						style="animation-delay: {sr(i) * 5}s"/>
				{/if}
			{/each}
		</g>

		<!-- FLOW CURVES -->
		<g class="flows">
			{#each flows as f}
				<path d={f.d} fill="none" class="flow-line" style="animation-delay: {f.delay}s"/>
				<circle r="0.45" class="flow-dot" filter="url(#glow)">
					<animateMotion dur="{f.dur}s" repeatCount="indefinite" begin="{f.delay}s" path={f.d}/>
				</circle>
			{/each}
		</g>

		<!-- NEURAL NETWORK -->
		<g class="nn">
			<!-- Synapses -->
			{#each synapses as s}
				<line x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y}
					class="synapse" style="opacity: {0.03 + s.w * 0.1}"/>
			{/each}

			<!-- Weight pulses -->
			{#each pulses as p, i}
				<circle r="0.3" class="pulse" filter="url(#glow)">
					<animateMotion
						dur="{2 + sr(i * 23) * 2.5}s"
						repeatCount="indefinite"
						begin="{sr(i * 31) * 4}s"
						path="M {p.from.x} {p.from.y} L {p.to.x} {p.to.y}"
					/>
				</circle>
			{/each}

			<!-- Neurons -->
			{#each neurons as n, i}
				<circle cx={n.x} cy={n.y} r="1.1"
					class="neuron-ring" class:firing={firing.has(i)}
					style="animation-delay: {sr(i * 17) * 5}s"
					filter={firing.has(i) ? "url(#glowBig)" : "none"}
				/>
				<circle cx={n.x} cy={n.y} r="0.45"
					class="neuron-core" class:core-on={firing.has(i)}
					style="animation-delay: {sr(i * 17) * 5}s"
				/>
			{/each}
		</g>
	</svg>
</div>

<style>
	.hero-bg {
		position: absolute;
		inset: 0;
		overflow: hidden;
		opacity: 0;
		transition: opacity 1.5s ease-out;
	}
	.hero-bg.mounted { opacity: 1; }

	/* MESH CUBE */
	.mesh-edge {
		stroke: var(--color-primary-400);
		stroke-width: 0.12;
		opacity: 0.18;
	}
	.mesh-dot {
		fill: var(--color-primary-400);
		opacity: 0.3;
		animation: dotPulse 3.5s ease-in-out infinite alternate;
	}
	:global(.dark) .mesh-edge {
		stroke: var(--color-primary-300);
		opacity: 0.22;
	}
	:global(.dark) .mesh-dot {
		fill: var(--color-primary-300);
		opacity: 0.4;
	}
	@keyframes dotPulse {
		0% { opacity: 0.15; }
		100% { opacity: 0.5; }
	}

	/* FLOW */
	.flow-line {
		stroke: var(--color-primary-400);
		stroke-width: 0.18;
		opacity: 0.12;
		stroke-dasharray: 2.5 1.5;
		animation: dash 6s linear infinite;
	}
	.flow-dot {
		fill: var(--color-primary-300);
		opacity: 0.55;
	}
	:global(.dark) .flow-line {
		stroke: var(--color-primary-300);
		opacity: 0.18;
	}
	:global(.dark) .flow-dot {
		fill: var(--color-primary-200);
		opacity: 0.65;
	}
	@keyframes dash {
		to { stroke-dashoffset: -16; }
	}

	/* NEURAL NETWORK */
	.synapse {
		stroke: var(--color-primary-400);
		stroke-width: 0.1;
	}
	.pulse {
		fill: var(--color-primary-300);
		opacity: 0.5;
	}
	:global(.dark) .synapse {
		stroke: var(--color-primary-300);
	}
	:global(.dark) .pulse {
		fill: var(--color-primary-200);
		opacity: 0.6;
	}

	.neuron-ring {
		fill: none;
		stroke: var(--color-primary-400);
		stroke-width: 0.18;
		opacity: 0.2;
		animation: nPulse 4s ease-in-out infinite alternate;
	}
	.neuron-ring.firing {
		stroke: var(--color-primary-300);
		opacity: 0.55;
		animation: nFire 2.5s ease-in-out infinite alternate;
	}
	.neuron-core {
		fill: var(--color-primary-500);
		opacity: 0.15;
	}
	.neuron-core.core-on {
		fill: var(--color-primary-400);
		opacity: 0.5;
		animation: cFire 2.5s ease-in-out infinite alternate;
	}

	:global(.dark) .neuron-ring {
		stroke: var(--color-primary-300);
		opacity: 0.25;
	}
	:global(.dark) .neuron-ring.firing {
		stroke: var(--color-primary-200);
		opacity: 0.7;
	}
	:global(.dark) .neuron-core {
		fill: var(--color-primary-400);
	}
	:global(.dark) .neuron-core.core-on {
		fill: var(--color-primary-200);
		opacity: 0.7;
	}

	@keyframes nPulse {
		0% { opacity: 0.12; }
		100% { opacity: 0.3; }
	}
	@keyframes nFire {
		0% { opacity: 0.35; stroke-width: 0.18; }
		100% { opacity: 0.7; stroke-width: 0.3; }
	}
	@keyframes cFire {
		0% { opacity: 0.3; }
		100% { opacity: 0.7; }
	}
</style>
