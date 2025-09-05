// Dados das disciplinas
const disciplinas = [
  // 1º Semestre
  { 
    id: "intro-eng", 
    name: "Int. à Eng. de Controle e Automação", 
    semester: 1, 
    horas: { total: 36, praticas: 0, teoricas: 2 },
    type: "theoretical",
    x: 0, y: 0
  },
  { 
    id: "desenho-basico", 
    name: "Desenho Básico", 
    semester: 1, 
    horas: { total: 72, praticas: 72, teoricas: 0 },
    type: "practical",
    x: 0, y: 0
  },
  { 
    id: "lingua-portuguesa", 
    name: "Língua Portuguesa", 
    semester: 1, 
    horas: { total: 72, praticas: 0, teoricas: 72 },
    type: "theoretical",
    x: 0, y: 0
  },
  { 
    id: "intro-comp", 
    name: "Int. aos Sistemas Computacionais", 
    semester: 1, 
    horas: { total: 72, praticas: 18, teoricas: 54 },
    type: "mixed",
    x: 0, y: 0
  },
  { 
    id: "calculo-1", 
    name: "Cálculo Dif. e Integral I", 
    semester: 1, 
    horas: { total: 108, praticas: 0, teoricas: 108 },
    type: "theoretical",
    x: 0, y: 0
  },
  { 
    id: "geometria", 
    name: "Geometria Analítica", 
    semester: 1, 
    horas: { total: 72, praticas: 0, teoricas: 72 },
    type: "theoretical",
    x: 0, y: 0
  },
  { 
    id: "quimica", 
    name: "Química Geral", 
    semester: 1, 
    horas: { total: 72, praticas: 18, teoricas: 54 },
    type: "mixed",
    x: 0, y: 0
  },
  
  // 2º Semestre
  { 
    id: "desenho-tecnico", 
    name: "Des. Técnico Assistido por Computador", 
    semester: 2, 
    horas: { total: 72, praticas: 72, teoricas: 0 },
    type: "practical",
    x: 0, y: 0
  },
  { 
    id: "estrutura-dados", 
    name: "Estrutura de Dados", 
    semester: 2, 
    horas: { total: 72, praticas: 18, teoricas: 54 },
    type: "mixed",
    x: 0, y: 0
  },
  { 
    id: "algebra", 
    name: "Álgebra Linear", 
    semester: 2, 
    horas: { total: 72, praticas: 0, teoricas: 72 },
    type: "theoretical",
    x: 0, y: 0
  },
  { 
    id: "calculo-2", 
    name: "Cálculo Dif. e Integral II", 
    semester: 2, 
    horas: { total: 108, praticas: 0, teoricas: 108 },
    type: "theoretical",
    x: 0, y: 0
  },
  { 
    id: "mecanica", 
    name: "Mecânica", 
    semester: 2, 
    horas: { total: 108, praticas: 26, teoricas: 82 },
    type: "mixed",
    x: 0, y: 0
  },
  { 
    id: "sistemas-digitais", 
    name: "Sistemas Digitais", 
    semester: 2, 
    horas: { total: 72, praticas: 18, teoricas: 54 },
    type: "mixed",
    x: 0, y: 0
  }
];

// Pré-requisitos
const preRequisitos = [
  { source: "desenho-basico", target: "desenho-tecnico" },
  { source: "calculo-1", target: "calculo-2" },
  { source: "intro-comp", target: "estrutura-dados" },
  { source: "geometria", target: "algebra" }
];

// Configurações do gráfico
let width, height;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const nodeWidth = 150;
const nodeHeight = 80;
const semesterGap = 250;
const nodeGap = 100;

// Cores para os tipos de disciplinas
const colorMap = {
  theoretical: "#4DB3E6",
  practical: "#9ECE7F",
  mixed: "#FF9D6F"
};

// Variáveis globais
let svg, zoomGroup, currentScale;

// Inicializar o SVG
function initSVG() {
  width = document.getElementById('flowchart').clientWidth;
  height = document.getElementById('flowchart').clientHeight;

  // Selecionar ou criar o SVG
  svg = d3.select("#flowchart").select("svg");
  if (svg.empty()) {
    svg = d3.select("#flowchart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  } else {
    svg.attr("width", width).attr("height", height);
  }

  // Adicionar definições para marcadores de seta (se não existirem)
  if (svg.select("defs").empty()) {
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#106d78");
  }

  // Inicializar o grupo de zoom
  zoomGroup = svg.append("g");
  currentScale = 1;
}

// Ferramenta de dica
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Posicionar os nós
function positionNodes() {
  const semesterGroups = {
    1: disciplinas.filter(d => d.semester === 1),
    2: disciplinas.filter(d => d.semester === 2)
  };

  // Posicionar disciplinas do 1º semestre
  const semester1X = width / 2 - semesterGap;
  semesterGroups[1].forEach((d, i) => {
    d.x = semester1X;
    d.y = margin.top + (i * nodeGap) + 50;
  });

  // Posicionar disciplinas do 2º semestre
  const semester2X = width / 2 + semesterGap;
  semesterGroups[2].forEach((d, i) => {
    d.x = semester2X;
    d.y = margin.top + (i * nodeGap) + 50;
  });
}

// Desenhar o fluxograma
function drawFlowchart() {
  positionNodes();
  
  // Limpar o SVG
  svg.selectAll("*").remove();
  
  // Adicionar definições para marcadores de seta (novamente, pois limpamos o SVG)
  svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#106d78");
  
  // Adicionar títulos dos semestres
  svg.append("text")
    .attr("class", "semester-title")
    .attr("x", width / 2 - semesterGap)
    .attr("y", margin.top - 20)
    .text("1º Semestre");
    
  svg.append("text")
    .attr("class", "semester-title")
    .attr("x", width / 2 + semesterGap)
    .attr("y", margin.top - 20)
    .text("2º Semestre");

  // Desenhar links (setas)
  const links = svg.selectAll(".link")
    .data(preRequisitos)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d => {
      const source = disciplinas.find(node => node.id === d.source);
      const target = disciplinas.find(node => node.id === d.target);
      return `M${source.x},${source.y} L${target.x},${target.y}`;
    });

  // Desenhar nós
  const nodes = svg.selectAll(".node")
    .data(disciplinas)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .on("mouseover", function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`
        <strong>${d.name}</strong><br/>
        Total: ${d.horas.total}h<br/>
        Práticas: ${d.horas.praticas}h<br/>
        Teóricas: ${d.horas.teoricas}h
      `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Adicionar retângulos aos nós
  nodes.append("rect")
    .attr("width", nodeWidth)
    .attr("height", nodeHeight)
    .attr("x", -nodeWidth/2)
    .attr("y", -nodeHeight/2)
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("fill", d => colorMap[d.type])
    .attr("stroke", "#106d78")
    .attr("stroke-width", 2);

  // Adicionar texto aos nós
  nodes.append("text")
    .attr("class", "node-text")
    .attr("dy", -nodeHeight/2 + 20)
    .selectAll("tspan")
    .data(d => d.name.split(/(?=[A-Z][a-z])/)) // Quebra o texto em partes
    .enter().append("tspan")
    .attr("x", 0)
    .attr("dy", (d, i) => i ? "1.2em" : 0)
    .attr("text-anchor", "middle")
    .text(d => d);

  // Adicionar informações de horas
  nodes.append("text")
    .attr("class", "node-text")
    .attr("dy", nodeHeight/2 - 10)
    .text(d => `${d.horas.total}h | ${d.horas.praticas}P | ${d.horas.teoricas}T`);

  // Aplicar o zoom atual
  updateZoom();
}

// Funções de zoom
function zoomIn() {
  currentScale += 0.1;
  updateZoom();
}

function zoomOut() {
  if (currentScale > 0.5) {
    currentScale -= 0.1;
  }
  updateZoom();
}

function resetZoom() {
  currentScale = 1;
  updateZoom();
}

function updateZoom() {
  svg.selectAll("g")
    .attr("transform", `translate(${width/2},${height/2}) scale(${currentScale}) translate(${-width/2},${-height/2})`);
}

// Inicializar o fluxograma
window.onload = function() {
  initSVG();
  drawFlowchart();
};

window.addEventListener('resize', function() {
  initSVG();
  drawFlowchart();
});