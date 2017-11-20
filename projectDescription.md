# Project Description  
## Background  
Graph Databases such as neo4J, OrientDB, titan, etc... have powerful capabilities, and specialize in not only storing vast amounts of data, but describing how the points of data are related. However, a common issue with graph databases is the ways (or lack thereof) to visualize this connected data. Nic McPhee has used graph databases to visualize Evolutionary Computation runs in order to find inefficiencies in EC algorithms. This work has used static pdf's to visualize runs, but these can be massive and hard to read. In many cases just visualizing a subspace of an EC graph, and being able to interact with it may allow better insights into the run.  
## Our Project  
Ideally, our project would use some sort of js library/clojurescript library to create interactive graphs of subsections of an EC run. Our project would load subsections of data from the neo4J graph database, and represent that subsection in the browser. Users would be able to click/hover over nodes and edjes to find out more information about them. Moreover, they would be able to click on the outer nodes and our system would query the database for a subsection that centers around that node, and render the new subsection quickly.  
## Possible Libraries  
 * sigma.js
 * three.js
 * alchemy.js
 * D3.js [example](http://jimkang.com/quadtreevis/)
