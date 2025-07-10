export interface Node extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    x: number;
    y: number;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
    type: string;
}