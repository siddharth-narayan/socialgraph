import { driver, auth } from 'neo4j-driver'

// URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
const URI = 'neo4j://localhost'
const USER = 'neo4j'
const PASSWORD = '***REMOVED***'

let neo4j_driver = driver(URI, auth.basic(USER, PASSWORD))
let session = await neo4j_driver.session()

export async function load({ params }) {

    let nodes_result = await session.run("MATCH (n) RETURN n;")
    let nodes = nodes_result.records.map(record => {
        return JSON.stringify(record)
    })

    let links_result = await session.run("MATCH ()-[r]-() RETURN r;")
    let links = links_result.records.map(record => {
        return JSON.stringify(record)
    })

    return {
        nodes,
        links
    }
}

export const actions = {
    addnode: async ({ request }) => {
        const data = await request.formData()
        const name = data.get("name")?.toString()
        await session.run("CREATE (:Person { name: $name })", { name: name })
    },

    delnode: async ({ request }) => {
        const data = await request.formData()
        const name = data.get("name")?.toString()
        await session.run(`
            MATCH (n) WHERE elementId(n) = $name
            OPTIONAL MATCH (n)-[rel]->()
            OPTIONAL MATCH ()-[rel2]->(n)
            DELETE rel, rel2
            DELETE n`, { name: name })
    },

    addrel: async ({ request }) => {
        const data = await request.formData();
        const id_1 = data.get("id-1")?.toString()
        const rel = data.get("rel")?.toString()
        const id_2 = data.get("id-2")?.toString()

        console.log(`id_1: ${id_1}, rel: ${rel}, id_2: ${id_2}`)

        if (!["Knows", "Related", "Likes", "Dislikes"].includes(rel!)) {
            return
        }

        let res = await session.run(
            `MATCH (n) WHERE elementId(n) = $id_1
                MATCH (n2) WHERE elementId(n2) = $id_2
                MATCH (n)-[rel:${rel}]->(n2)
                RETURN rel`,
            { id_1: id_1, id_2: id_2 }
        )

        let directional_extra = (() => {
            if (isUndirected(rel!)) {
                return `,(n2)-[:${rel}]->(n)`
            } else {
                return ''
            }
        })()

        console.log(`directional_extra: ${directional_extra}`)

        if (res.records.length == 0) {
            console.log("Record didn't exist for this relationship")
            await session.run(
                `MATCH (n) WHERE elementId(n) = $id_1
                MATCH (n2) WHERE elementId(n2) = $id_2
                CREATE (n)-[:${rel}]->(n2)${directional_extra}`, { id_1: id_1, rel: rel, id_2: id_2 }
            )
        }

    },

    delrel: async ({ request }) => {
        const data = await request.formData();
        const id_1 = data.get("id-1")?.toString()
        const rel = data.get("rel")?.toString()
        const id_2 = data.get("id-2")?.toString()

        if (!["Knows", "Related", "Likes", "Dislikes"].includes(rel!)) {
            return
        }

        let directional_extra = (() => {
            if (isUndirected(rel!)) {
                return `, rel2`
            } else {
                return ''
            }
        })()

        console.log(`directional_extra: ${directional_extra}`)

        await session.run(`
            MATCH (n) WHERE elementId(n) = $id_1
            MATCH (n2) WHERE elementId(n2) = $id_2
            MATCH (n)-[rel:${rel}]->(n2)
            MATCH (n2)-[rel2:${rel}]->(n)
            DELETE rel${directional_extra}`, {id_1: id_1, id_2: id_2})
    }
};

function isUndirected(type: string) {
    return ['Knows', 'Related'].includes(type);
}