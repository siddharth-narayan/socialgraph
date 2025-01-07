<script lang="ts">
	import { writable } from 'svelte/store';

	import '../app.css';
	import NodeGraph from '../components/NodeGraph.svelte';
	import { selected_nodes } from '../stores';
	import { type Node, type Link } from '../type';

	let { data } = $props();

	let nodes: Node[] = $state([]);
	let links: Link[] = $state([]);

	for (let i = 0; i < data.nodes.length; i++) {
		let node_json = JSON.parse(data.nodes[i])['_fields'][0];
		let node = {
			id: node_json['elementId'],
			name: node_json['properties']['name'],
			x: 500,
			y: 500
		};
		nodes.push(node);
	}

	for (let i = 0; i < data.links.length; i++) {
		// console.log(JSON.parse(data.links[i]))
		let node_json = JSON.parse(data.links[i])['_fields'][0];
		let link = {
			source: node_json['startNodeElementId'],
			target: node_json['endNodeElementId'],
			type: node_json['type']
		};
		links.push(link);
	}
	console.log(data.links);
	console.log(links);
</script>

<svelte:head>
	<title>My Personal Website</title>
</svelte:head>
<div class="flex h-dvh">
	<div class="flex flex-col h-full w-1/5 gap-16 bg-primary border-primary rounded-md border-2 p-4">
		<form method="POST" action="?/addnode" class="flex flex-col content-center gap-2">
			<h1>Add a Person</h1>
			<input name="name" type="text" class="bg-secondary p-2" placeholder="Person Name" required />
			<input type="submit" class="bg-secondary p-2" value="Add Person" />
		</form>

		<form method="POST" action="?/delnode" class="flex flex-col content-center gap-2">
			<h1>Delete a Person</h1>
			<input
				name="name"
				type="text"
				class="bg-secondary p-2"
				placeholder="Person ID"
				required
				value={$selected_nodes[0]?.id}
			/>
			<input type="submit" class="bg-secondary p-2" value="Delete Person" />
		</form>

		<form method="POST" action="?/addrel" class="flex flex-col content-center gap-2">
			<h1>Add a Relationship</h1>
			<input
				name="id-1"
				type="text"
				class="bg-secondary p-2"
				placeholder="Person ID"
				required
				value={$selected_nodes[0]?.id}
			/>
			<div class="flex">
				<select name="rel" class="bg-secondary p-2" required>
					<option value="Knows">Knows</option>
					<option value="Related">Related</option>
					<option value="Likes">Likes</option>
					<option value="Dislikes">Dislikes</option>
				</select>
			</div>
			<input
				name="id-2"
				type="text"
				class="bg-secondary p-2"
				placeholder="Secondary ID"
				required
				value={$selected_nodes[1]?.id}
			/>
			<input type="submit" class="bg-secondary p-2" value="Submit" />
		</form>

		<form method="POST" action="?/delrel" class="flex flex-col content-center gap-2">
			<h1>Delte a Relationship</h1>
			<input
				name="id-1"
				type="text"
				class="bg-secondary p-2"
				placeholder="Person ID"
				required
				value={$selected_nodes[0]?.id}
			/>
			<div class="flex">
				<select name="rel" class="bg-secondary p-2" required>
					<option value="Knows">Knows</option>
					<option value="Related">Related</option>
					<option value="Likes">Likes</option>
					<option value="Dislikes">Dislikes</option>
				</select>
			</div>
			<input
				name="id-2"
				type="text"
				class="bg-secondary p-2"
				placeholder="Secondary ID"
				required
				value={$selected_nodes[1]?.id}
			/>
			<input type="submit" class="bg-secondary p-2" value="Submit" />
		</form>
	</div>

	<NodeGraph {nodes} {links}></NodeGraph>
</div>

<style>
	h1 {
		font-size: 1.25rem;
		text-align: center;
	}
</style>
