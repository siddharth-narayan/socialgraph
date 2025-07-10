<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import data from '../routes/+page.svelte';
	import { selected_nodes } from '../stores';

	let { nodes, links } = $props();

	let hovered_node: Node | null;

	let canvas_el: HTMLCanvasElement;
	let node_radius: number;

	onMount(() => {
		canvas_el = document.getElementById('canvas') as HTMLCanvasElement;
		canvas_el.width = canvas_el.clientWidth * 4;
		canvas_el.height = canvas_el.clientHeight * 4;

		node_radius = canvas_el.height / 30;
		simulateNodes();
	});

	function simulateNodes() {
		d3.forceSimulation(nodes)
			// .alphaMin(.05)
			// .force('centerX', d3.forceX(0).strength(.03))
			// .force('centerY', d3.forceY(0).strength(.03))
			// // .velocityDecay(.1)
			// .alphaTarget(.1) // apply the simulation to our array of nodes
			// Force #1: links between nodes


			// Force #2 prevent overlap in the nodes

			// Force #3: attraction or repulsion between nodes
			.force('charge', d3.forceManyBody().strength(-400))
			// Force #4: nodes are attracted by the center of the chart area
			.force('center', d3.forceCenter(canvas_el.width / 2, canvas_el.height / 2))
			.force(
				'link',
				d3
					.forceLink(links)
					.distance(node_radius * 8)
					.strength(.5)
					.id((d: Node) => d.id)
			)
			.force('collide', d3.forceCollide().radius(node_radius))
			.on('tick', () => {
				drawNetwork();
			});
	}

	function drawNetwork() {
		let context = canvas_el.getContext('2d')!;

		let width = canvas_el.width;
		let height = canvas_el.height;

		context.clearRect(0, 0, width, height);
		context.lineWidth = 5;
		// Draw the links first
		links.forEach((link) => {
			const head_len = node_radius / 4;
			context.beginPath();
			console.log(`Adding link from ${link.source.name} to ${link.target.name}`);

			let fromx = link.source.x;
			let fromy = link.source.y;
			let tox = link.target.x;
			let toy = link.target.y;

			let angle = Math.atan2(toy - fromy, tox - fromx);

			tox = link.target.x - node_radius * Math.cos(angle);
			toy = link.target.y - node_radius * Math.sin(angle);

			// Line
			context.moveTo(fromx, fromy);
			context.lineTo(tox, toy);

			// Arrow
			if (!isUndirected(link.type)) {
				context.lineTo(
					tox - head_len * Math.cos(angle - Math.PI / 6),
					toy - head_len * Math.sin(angle - Math.PI / 6)
				);
				context.moveTo(tox, toy);
				context.lineTo(
					tox - head_len * Math.cos(angle + Math.PI / 6),
					toy - head_len * Math.sin(angle + Math.PI / 6)
				);
			}

			switch (link.type) {
				case "Likes":
					context.strokeStyle = '#284f3c'
					break;
				
				case "Knows":
				default:
					context.strokeStyle = '#92b8e4'
					break;
			}
			context.stroke();
		});

		// Draw the nodes
		nodes.forEach((node) => {
			if (!node.x || !node.y) {
				return;
			}
			context.beginPath();
			context.moveTo(node.x + node_radius, node.y);
			context.arc(node.x, node.y, node_radius, 0, 2 * Math.PI);

			if ($selected_nodes.includes(node)) {
				context.strokeStyle = '#31412e'; // Tertiary - tailwind
				context.fillStyle = '#31412e';
			} else if (hovered_node === node) {
				context.strokeStyle = '#232323'; // Tertiary - tailwind
				context.fillStyle = '#232323';
			} else {
				context.strokeStyle = '#424242'; // Tertiary - tailwind
				context.fillStyle = '#424242';
			}

			context.stroke();
			context.fill();

			context.textAlign = 'center';
			context.textBaseline = 'middle';

			context.strokeStyle = '#afafaf';
			context.fillStyle = '#afafaf';

			let display_name = node.name;
			if (node.name.length > 8) {
				display_name = node.name.substring(0, 8) + '...';
			}
			context.font = 'normal normal 100 60px sans-serif';
			context.strokeText(display_name, node.x, node.y);
			context.fillText(display_name, node.x, node.y);
			context.closePath();
		});
	}

	function isUndirected(type: string) {
		return ['Knows', 'Related'].includes(type);
	}

	function onmousemove(e: MouseEvent) {
		let x = e.offsetX * 4;
		let y = e.offsetY * 4;

		let node;
		if (hovered_node) {
			if (!isHovering(hovered_node, x, y)) {
				canvas_el.style.cursor = 'default';
				hovered_node = null;
				drawNetwork();
			}
		} else {
			for (const n of nodes) {
				if (isHovering(n, x, y)) {
					canvas_el.style.cursor = 'pointer';
					hovered_node = n;
					drawNetwork();
				}
			}
		}
	}

	function onmouseup(e: MouseEvent) {
		if (!hovered_node) {
			$selected_nodes = [];
			drawNetwork();
			return;
		}

		if (e.shiftKey) {
			$selected_nodes.push(hovered_node);
		} else {
			$selected_nodes = [hovered_node];
		}

		drawNetwork();
	}

	function isHovering(n: Node, x: number, y: number) {
		let x_squared = Math.pow(n.x - x, 2);
		let y_squared = Math.pow(n.y - y, 2);

		let distance = Math.sqrt(x_squared + y_squared);
		return distance < node_radius;
	}
</script>

<canvas id="canvas" class="w-4/5" {onmousemove} {onmouseup}></canvas>
<div
	id="nodegraph-info"
	class="flex flex-col gap-4 w-1/6 h-2/5 mb-4 mr-4 absolute right-0 bottom-0 bg-primary p-4 rounded-md border-primary"
>
<div class="flex-grow">
	<p>Name: {$selected_nodes[0]?.name}</p>
	<p>id: {$selected_nodes[0]?.id}</p>
</div>
<div class="flex flex-col gap-8 w-auto">
	<div class="flex flex-row gap-4"><p class="w-8 bg-[#92b8e4]">.</p><p>Knows</p></div>
	
	<div class="flex flex-row gap-4"><p class="w-8 bg-[#284f3c]">.</p><p>Likes</p></div>
	<!-- <div></div><p class="w-8 bg-[#ffffff]">.</p></div> -->
</div>
</div>
