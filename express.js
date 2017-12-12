var express=require('express'),
app = express(),
port = process.env.PORT || 1917;
app.use(express.static(__dirname + '/public'));

const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver("bolt://127.0.0.1:7687", neo4j.auth.basic("neo4j", "password"));
const session = driver.session();

app.get("/totalError", function(req, res) {
  var totalError = req.param('totalError');
  const actorPromise = session.run(
    "MATCH(n: Individual) - [HasTotalError] -> (x: TotalError {TotalError: " + totalError + "}) RETURN n LIMIT 100;"
  )
  .then(function(result) {
    var fields = packageFields(result);
    res.send(fields);
    console.log("Node: ");
    console.log(node);
    session.close();
  });
});

function packageFields(result) {
  var fields = [];
  for(i = 0; i < result.records.length; i++) {
    var individual = result.records[i]._fields;
    //console.log(individual);
    fields[i] = individual;
  }
  console.log(fields);
  return fields;
}

app.listen(port);
