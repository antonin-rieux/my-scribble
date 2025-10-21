<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { ws } from "../lib/websocket";
	import type { Point, DrawStroke } from "../lib/types";

	export let width: number = 800;
	export let height: number = 600;
	export let canDraw: boolean = true;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let isDrawing: boolean = false;
	let currentStroke: Point[] = [];

	let brushColor: string = "#000000";
	let brushWidth: number = 3;

	onMount(() => {
		const context = canvas.getContext("2d");
		if (!context) {
			console.error("Failed to get canvas context");
			return;
		}

		ctx = context;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		ws.on<DrawStroke>("DrawStroke", (data: DrawStroke) => {
			drawStroke(data.points, data.color, data.width);
		});
	});

	function getMousePos(e: MouseEvent): Point {
		const rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}

	function getTouchPos(e: TouchEvent): Point {
		const rect = canvas.getBoundingClientRect();
		const touch = e.touches[0];
		return {
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top,
		};
	}

	function startDrawing(e: MouseEvent | TouchEvent): void {
		if (!canDraw || !ctx) return;

		isDrawing = true;
		currentStroke = [];

		const pos =
			e instanceof MouseEvent
				? getMousePos(e)
				: getTouchPos(e);
		currentStroke.push(pos);

		ctx.beginPath();
		ctx.moveTo(pos.x, pos.y);
	}

	function draw(e: MouseEvent | TouchEvent): void {
		if (!isDrawing || !canDraw || !ctx) return;

		e.preventDefault();

		const pos =
			e instanceof MouseEvent
				? getMousePos(e)
				: getTouchPos(e);
		currentStroke.push(pos);

		ctx.strokeStyle = brushColor;
		ctx.lineWidth = brushWidth;
		ctx.lineTo(pos.x, pos.y);
		ctx.stroke();
	}

	function stopDrawing(): void {
		if (!isDrawing || currentStroke.length === 0) return;

		isDrawing = false;

		const stroke: DrawStroke = {
			points: currentStroke,
			color: brushColor,
			width: brushWidth,
		};

		ws.send({
			type: "Draw",
			data: stroke,
		});

		currentStroke = [];
	}

	function drawStroke(
		points: Point[],
		color: string,
		width: number,
	): void {
		if (!ctx || points.length === 0) return;

		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);

		for (let i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}

		ctx.stroke();
	}

	function clearCanvas(): void {
		if (!ctx) return;
		ctx.clearRect(0, 0, width, height);
	}

	function changeColor(color: string): void {
		brushColor = color;
	}

	function changeWidth(w: number): void {
		brushWidth = w;
	}

	onDestroy(() => {
		ws.off("DrawStroke");
	});
</script>

<div class="canvas-container">
	<div class="toolbar">
		<button
			on:click={() => changeColor("#000000")}
			class:active={brushColor === "#000000"}
			aria-label="Black color"
		>
			<div
				class="color-swatch"
				style="background: #000000"
			></div>
		</button>
		<button
			on:click={() => changeColor("#ff0000")}
			class:active={brushColor === "#ff0000"}
			aria-label="Red color"
		>
			<div
				class="color-swatch"
				style="background: #ff0000"
			></div>
		</button>
		<button
			on:click={() => changeColor("#00ff00")}
			class:active={brushColor === "#00ff00"}
			aria-label="Green color"
		>
			<div
				class="color-swatch"
				style="background: #00ff00"
			></div>
		</button>
		<button
			on:click={() => changeColor("#0000ff")}
			class:active={brushColor === "#0000ff"}
			aria-label="Blue color"
		>
			<div
				class="color-swatch"
				style="background: #0000ff"
			></div>
		</button>

		<div class="separator"></div>

		<button
			on:click={() => changeWidth(2)}
			class:active={brushWidth === 2}
		>
			Thin
		</button>
		<button
			on:click={() => changeWidth(5)}
			class:active={brushWidth === 5}
		>
			Medium
		</button>
		<button
			on:click={() => changeWidth(10)}
			class:active={brushWidth === 10}
		>
			Thick
		</button>

		<div class="separator"></div>

		<button on:click={clearCanvas}>Clear</button>
	</div>

	<canvas
		bind:this={canvas}
		{width}
		{height}
		on:mousedown={startDrawing}
		on:mousemove={draw}
		on:mouseup={stopDrawing}
		on:mouseleave={stopDrawing}
		on:touchstart={startDrawing}
		on:touchmove={draw}
		on:touchend={stopDrawing}
		class:can-draw={canDraw}
		class:no-draw={!canDraw}
	/>
</div>

<style>
	.canvas-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.toolbar {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background: #f5f5f5;
		border-radius: 8px;
		align-items: center;
	}

	.toolbar button {
		padding: 0.5rem 1rem;
		border: 2px solid #ddd;
		background: white;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.toolbar button:hover {
		border-color: #999;
	}

	.toolbar button.active {
		border-color: #4caf50;
		background: #e8f5e9;
	}

	.color-swatch {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid #fff;
	}

	.separator {
		width: 1px;
		height: 30px;
		background: #ddd;
		margin: 0 0.5rem;
	}

	canvas {
		border: 3px solid #333;
		border-radius: 8px;
		background: white;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		touch-action: none;
	}

	.can-draw {
		cursor: crosshair;
	}

	.no-draw {
		cursor: not-allowed;
		opacity: 0.7;
	}
</style>
