import { writable, type Writable } from "svelte/store"

export const selected_nodes: Writable<Node[]> = writable([])