import { driver, auth, stringify} from 'neo4j-driver'
export async function load({ params }) {

    // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
    const URI = 'neo4j://localhost'
    const USER = 'neo4j'
    const PASSWORD = 'sidis2cool4u!'
    console.log("test")

    let neo4j_driver = driver(URI, auth.basic(USER, PASSWORD))
    let session = await neo4j_driver.session()
    let result =  await session.run("MATCH p=()-[]->() RETURN p LIMIT 25;")

    // const { keys, records, summary } = await neo4j_driver.executeQuery("MATCH p=()-[]->() RETURN p LIMIT 25;")
    // neo4j_driver.close()
    // console.log("Keys: " + keys)
    let records = result.records.map(record => record.toObject())
    console.log("Records: " + records[0])
    // let records_ser = records[0].entries()
    // console.log("Summary: " + summary)

    return {
        records
    }
}