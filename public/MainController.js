angular.module('graph',[])
.controller('mainCtrl',MainCtrl)
.factory('graphApi',graphApi)
.constant('apiUrl','http://localhost:1917');


function MainCtrl($scope,graphApi){
  var g = new dagreD3.graphlib.Graph().setGraph({})
  .setDefaultEdgeLabel(function () {
    return {};
  });

  var render = new dagreD3.render();
  var svg = d3.select("svg"),
  inner = svg.append("g");



  var populateD3 = function() {

  }

  var renderAgain = function() {
    g.nodes().forEach(function (v) {
      var node = g.node(v);
      node.rx = node.ry = 5;
    });
    g.edges().forEach(function (e) {
      var edge = g.edge(e.v, e.w);
      edge.lineInterpolate = 'basis';
    });
    var zoom = d3.behavior.zoom().on("zoom", function () {
      inner.attr("transform", "translate(" + d3.event.translate + ")" +
      "scale(" + d3.event.scale + ")");
    });
    render(inner, g);
    var initialScale = 1.0;
    zoom.translate([(svg.attr("width") - g.graph().width * initialScale) / 2, 20])
    .scale(initialScale)
    .event(svg);
    svg.attr("height", g.graph().height * initialScale + 40);



    svg.selectAll("g.node")
    .on("dblclick", function(d){
      console.log(d);
      getAncestors(d);
    });

    svg.selectAll("g.node rect")
    .attr("id", function (d) {
      return "node" + d;
    });
    svg.selectAll("g.edgePath path")
    .attr("id", function (e) {
      return e.v + "-" + e.w;
    });
    svg.selectAll("g.edgeLabel g")
    .attr("id", function (e) {
      return 'label_'+e.v + "-" + e.w;
    });

    g.nodes().forEach(function (v) {
      var node = g.node(v);
      node.customId = "node" + v;
    })
    g.edges().forEach(function (e) {
      var edge = g.edge(e.v, e.w);
      edge.customId = e.v + "-" + e.w
    });


    var nodeDrag = d3.behavior.drag()
    .on("dragstart", dragstart)
    .on("drag", dragmove);

    var edgeDrag = d3.behavior.drag()
    .on("dragstart", dragstart)
    .on('drag', function (d) {
      translateEdge(g.edge(d.v, d.w), d3.event.dx, d3.event.dy);
      $('#' + g.edge(d.v, d.w).customId).attr('d', calcPoints(d));
    });

    nodeDrag.call(svg.selectAll("g.node"));
    edgeDrag.call(svg.selectAll("g.edgePath"));

  }

  function dragstart(d) {
    d3.event.sourceEvent.stopPropagation();
  }

  function dragmove(d) {
    var node = d3.select(this),
    selectedNode = g.node(d);
    var prevX = selectedNode.x,
    prevY = selectedNode.y;

    selectedNode.x += d3.event.dx;
    selectedNode.y += d3.event.dy;
    node.attr('transform', 'translate(' + selectedNode.x + ',' + selectedNode.y + ')');

    var dx = selectedNode.x - prevX,
    dy = selectedNode.y - prevY;

    g.edges().forEach(function (e) {
      if (e.v == d || e.w == d) {
        edge = g.edge(e.v, e.w);
        translateEdge(g.edge(e.v, e.w), dx, dy);
        $('#' + edge.customId).attr('d', calcPoints(e));
        label = $('#label_' + edge.customId);
        var xforms = label.attr('transform');
        var parts  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms);
        var X = parseInt(parts[1])+dx, Y = parseInt(parts[2])+dy;
        label.attr('transform','translate('+X+','+Y+')');

      }
    })
  }

  function translateEdge(e, dx, dy) {
    e.points.forEach(function (p) {
      p.x = p.x + dx;
      p.y = p.y + dy;
    });
  }

  function calcPoints(e) {
    var edge = g.edge(e.v, e.w),
    tail = g.node(e.v),
    head = g.node(e.w);
    var points = edge.points.slice(1, edge.points.length - 1);
    var afterslice = edge.points.slice(1, edge.points.length - 1)
    points.unshift(intersectRect(tail, points[0]));
    points.push(intersectRect(head, points[points.length - 1]));
    return d3.svg.line()
    .x(function (d) {
      return d.x;
    })
    .y(function (d) {
      return d.y;
    })
    .interpolate("basis")
    (points);
  }

  function intersectRect(node, point) {
    var x = node.x;
    var y = node.y;
    var dx = point.x - x;
    var dy = point.y - y;
    var w = $("#" + node.customId).attr('width') / 2;
    var h = $("#" + node.customId).attr('height') / 2;
    var sx = 0,
    sy = 0;
    if (Math.abs(dy) * w > Math.abs(dx) * h) {
      if (dy < 0) {
        h = -h;
      }
      sx = dy === 0 ? 0 : h * dx / dy;
      sy = h;
    } else {
      if (dx < 0) {
        w = -w;
      }
      sx = w;
      sy = dx === 0 ? 0 : w * dy / dx;
    }
    return {
      x: x + sx,
      y: y + sy
    };
  }
  /*
  When we get new json from the api:
  1) Call populateD3 with new json
  2) Render Again.
  */
  var lookUpTable = {};

  function makeNode(id, label) {
    g.setNode(id, {
      label: label
    });
  }

  function makeEdge(parent_id, child_id) {
    g.setEdge(parent_id, child_id);
  }

  function getNodes(data, child_id) {
    console.log(data);
    for(var i = 0; i < data.length; i++) {
      parent_identity = data[i].identity;
      if(lookUpTable[parent_identity] == null) {
        makeNode(parent_identity, data[i].generation + "");
        lookUpTable[parent_identity] = data[i];
      }
      if(child_id != null) {
        makeEdge(parent_identity, child_id);
      }
    }
  }

  function getAncestors(child_id){
    console.log(child_id);
    var child_uuid = lookUpTable[child_id].uuid;
    graphApi.getAncestors(child_uuid)
    .success(function(data){
      getNodes(data, child_id);
      console.log(lookUpTable);
      renderAgain();
    })
    .error(function(){console.log("An error occured when tried to get ancestors");});
  }


  function getWinners(){
    $scope.errorMessage='';
    graphApi.getWinners()
    .success(function(data){
      console.log(data[0].generation);
      getNodes(data, null);
      renderAgain();
      $scope.winners=data;
    })
    .error(function () {
      $scope.errorMessage="Unable to load winners:  Database request failed";
    });
  }
  getWinners();

}
function graphApi($http,apiUrl){
  return{
    getWinners: function(){
      var url = apiUrl + '/getWinners';
      return $http.get(url);
    },
    getAncestors: function(uuid){
      var url = apiUrl + '/getAncestors?child_uuid='+uuid;
      return $http.get(url);
    }
  }
}
