# Socialgraph
Written with SvelteKit and Tailwind
This project uses a neo4j database as a backend and uses d3.js's force simulation to position nodes

To run this project, first have a neo4j database installed and running on the same machine that serves the content. 
The ```neo4j``` user is what the backend uses to access the database.

First clone this repository:
```
git clone https://github.com/siddharth-narayan/socialgraph.git
cd socialgraph
```
Then make sure you create a .env file with your neo4j password in this format:
```
DATABASE_PASSWORD="yourpasswordhere"
```

Finally, run the server:
```
npm install
npm run dev
```

Navigate to localhost:7000 and you will see the app!

![image](https://github.com/user-attachments/assets/7bc7f30e-bd4f-4f88-93bf-5f1e80d91082)

You can add people and their relationships with the toolbar on the side.
