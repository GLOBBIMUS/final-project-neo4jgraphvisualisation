// Using express similar to lab 9
var express=require('express'),
app = express(),
port = process.env.PORT || 1917;
app.use(express.static(__dirname + '/public'));

// Setting up the connection to the neo4j by using "neo4j-driver"
const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver("bolt://127.0.0.1:7687", neo4j.auth.basic("neo4j", "password"));
const session = driver.session(); //connection

/*
 * handles the /getWinners API. Gets Individuals whose TotalError is 0
 */
app.get("/getWinners",function(req,res){
  const actorPromise = session.run(
    "MATCH(n: Individual) - [HasTotalError] -> (x: TotalError {TotalError:  0 }) RETURN n LIMIT 100;"
  ).then(function(result) {
    var fields = packageFields(result);
    res.send(fields);
    session.close();
    driver.close();
  });
});

/*
 * This API queries the neo4j to get the ancestors of the specific individual
 */
app.get("/getAncestors",function(req,res){
  var child_uuid = req.param('child_uuid');
  var cypher =   "MATCH (n: Individual)-[: ParentOf]->(i: Individual {uuid: \'"+ child_uuid +"\'}) RETURN n;"
  const ancestorsPromise = session.run(
  cypher
  ).then(function(result) {
    var fields = packageFields(result);
    res.send(fields);
    session.close();
    driver.close();
  });
});

/*
 * This method extracts the data that we need from the recieved result.
 */
function packageFields(result) {
  var fields = [];
  for(i = 0; i < result.records.length; i++) {
    var individual = result.records[i]._fields[0];
    var transformedIndividual = transform(individual);
    fields[i] = transformedIndividual;
  }
  return fields;
}

/*
 * Helper method, transforms data that we need into appropriate format
 */
function transform(individual){
  var transformedIndividual = {};
  transformedIndividual.identity = individual.identity.low;
  transformedIndividual.label = individual.labels[0];
  transformedIndividual.generation = individual.properties.generation.low;
  transformedIndividual.location = individual.properties.location.low;
  transformedIndividual.uuid = individual.properties.uuid;
  return transformedIndividual;
}

app.listen(port);
