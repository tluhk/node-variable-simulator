const scenarios = [
  {
    id: "primitive-copy",
    title: "Primitive copy",
    kicker: "Pass by value",
    summary: "Numbers, strings, booleans, null, undefined, symbols, and bigints are copied as values.",
    code: ["let x = 10;", "let y = x;", "y = 20;"],
    steps: [
      {
        line: 0,
        title: "Declare x",
        explanation:
          "The binding x is created in the current stack frame and stores the primitive value 10 directly.",
        stack: [{ name: "global", bindings: [{ name: "x", value: primitive("10") }] }],
        heap: []
      },
      {
        line: 1,
        title: "Copy x into y",
        explanation:
          "The value in x is copied into y. The two bindings are independent because there is no shared heap object.",
        stack: [
          {
            name: "global",
            bindings: [
              { name: "x", value: primitive("10") },
              { name: "y", value: primitive("10") }
            ]
          }
        ],
        heap: []
      },
      {
        line: 2,
        title: "Reassign y",
        explanation:
          "Changing y replaces only y's value. x still holds 10, which is the key pass-by-value behavior for primitives.",
        stack: [
          {
            name: "global",
            bindings: [
              { name: "x", value: primitive("10") },
              { name: "y", value: primitive("20") }
            ]
          }
        ],
        heap: []
      }
    ]
  },
  {
    id: "object-reference",
    title: "Object reference copy",
    kicker: "Shared heap object",
    summary: "Variables that hold objects store references. Copying the variable copies the reference.",
    code: ["const a = { count: 1 };", "const b = a;", "b.count = 2;"],
    steps: [
      {
        line: 0,
        title: "Allocate object",
        explanation:
          "The object is allocated on the heap. The const binding a stores a reference to that heap object.",
        stack: [{ name: "global", bindings: [{ name: "a", value: ref("Object #1") }] }],
        heap: [{ id: "Object #1", properties: [{ name: "count", value: primitive("1") }] }]
      },
      {
        line: 1,
        title: "Copy the reference",
        explanation:
          "b receives a copy of the reference held by a. Both bindings now point to the same heap object.",
        stack: [
          {
            name: "global",
            bindings: [
              { name: "a", value: ref("Object #1") },
              { name: "b", value: ref("Object #1") }
            ]
          }
        ],
        heap: [{ id: "Object #1", properties: [{ name: "count", value: primitive("1") }] }]
      },
      {
        line: 2,
        title: "Mutate through b",
        explanation:
          "The property update changes Object #1 on the heap. a sees the same count because a points to that object too.",
        stack: [
          {
            name: "global",
            bindings: [
              { name: "a", value: ref("Object #1") },
              { name: "b", value: ref("Object #1") }
            ]
          }
        ],
        heap: [{ id: "Object #1", properties: [{ name: "count", value: primitive("2") }] }]
      }
    ]
  },
  {
    id: "function-arguments",
    title: "Function arguments",
    kicker: "Reference value passed",
    summary: "JavaScript passes argument values. For objects, that value is a reference.",
    code: [
      "function update(n, user) {",
      "  n = n + 1;",
      "  user.score += 1;",
      "}",
      "let score = 4;",
      "let player = { score: 4 };",
      "update(score, player);"
    ],
    steps: [
      {
        line: 4,
        title: "Create primitive",
        explanation: "score is a primitive binding in the global stack frame.",
        stack: [{ name: "global", bindings: [{ name: "score", value: primitive("4") }] }],
        heap: []
      },
      {
        line: 5,
        title: "Create player object",
        explanation:
          "player stores a reference to a heap object. The object's score property is a primitive value.",
        stack: [
          {
            name: "global",
            bindings: [
              { name: "score", value: primitive("4") },
              { name: "player", value: ref("Object #1") }
            ]
          }
        ],
        heap: [{ id: "Object #1", properties: [{ name: "score", value: primitive("4") }] }]
      },
      {
        line: 6,
        title: "Call update",
        explanation:
          "A new stack frame is pushed. n receives a copy of 4, while user receives a copy of the reference to Object #1.",
        stack: [
          {
            name: "update",
            bindings: [
              { name: "n", value: primitive("4") },
              { name: "user", value: ref("Object #1") }
            ]
          },
          {
            name: "global",
            bindings: [
              { name: "score", value: primitive("4") },
              { name: "player", value: ref("Object #1") }
            ]
          }
        ],
        heap: [{ id: "Object #1", properties: [{ name: "score", value: primitive("4") }] }]
      },
      {
        line: 1,
        title: "Reassign local primitive",
        explanation:
          "n changes inside the function frame only. The outer score binding remains 4.",
        stack: [
          {
            name: "update",
            bindings: [
              { name: "n", value: primitive("5") },
              { name: "user", value: ref("Object #1") }
            ]
          },
          {
            name: "global",
            bindings: [
              { name: "score", value: primitive("4") },
              { name: "player", value: ref("Object #1") }
            ]
          }
        ],
        heap: [{ id: "Object #1", properties: [{ name: "score", value: primitive("4") }] }]
      },
      {
        line: 2,
        title: "Mutate shared object",
        explanation:
          "user.score mutates the heap object. The global player binding still points at that same changed object.",
        stack: [
          {
            name: "update",
            bindings: [
              { name: "n", value: primitive("5") },
              { name: "user", value: ref("Object #1") }
            ]
          },
          {
            name: "global",
            bindings: [
              { name: "score", value: primitive("4") },
              { name: "player", value: ref("Object #1") }
            ]
          }
        ],
        heap: [{ id: "Object #1", properties: [{ name: "score", value: primitive("5") }] }]
      },
      {
        line: 3,
        title: "Return from function",
        explanation:
          "The update frame is popped from the call stack. The heap object remains because player still references it.",
        stack: [
          {
            name: "global",
            bindings: [
              { name: "score", value: primitive("4") },
              { name: "player", value: ref("Object #1") }
            ]
          }
        ],
        heap: [{ id: "Object #1", properties: [{ name: "score", value: primitive("5") }] }]
      }
    ]
  },
  {
    id: "const-binding",
    title: "const binding",
    kicker: "Binding vs contents",
    summary: "const prevents rebinding the variable. It does not freeze the object it references.",
    code: ["const settings = { theme: 'light' };", "settings.theme = 'dark';", "settings = {};"],
    steps: [
      {
        line: 0,
        title: "const stores a reference",
        explanation:
          "settings is a const binding, but the value held by that binding is still a reference to a heap object.",
        stack: [{ name: "global", bindings: [{ name: "settings", value: ref("Object #1") }] }],
        heap: [{ id: "Object #1", properties: [{ name: "theme", value: primitive("'light'") }] }]
      },
      {
        line: 1,
        title: "Object contents can change",
        explanation:
          "The const binding still points to Object #1. Mutating a property changes the heap object, not the binding itself.",
        stack: [{ name: "global", bindings: [{ name: "settings", value: ref("Object #1") }] }],
        heap: [{ id: "Object #1", properties: [{ name: "theme", value: primitive("'dark'") }] }]
      },
      {
        line: 2,
        title: "Rebinding is blocked",
        explanation:
          "Assigning a different object to settings would replace the binding's reference, so JavaScript throws a TypeError.",
        stack: [{ name: "global", bindings: [{ name: "settings", value: ref("Object #1") }] }],
        heap: [{ id: "Object #1", properties: [{ name: "theme", value: primitive("'dark'") }] }]
      }
    ]
  },
  {
    id: "closure",
    title: "Closure retention",
    kicker: "Heap keeps environment alive",
    summary: "Functions can keep access to variables after the outer call has returned.",
    code: [
      "function makeCounter() {",
      "  let count = 0;",
      "  return function inc() {",
      "    count += 1;",
      "    return count;",
      "  };",
      "}",
      "const inc = makeCounter();",
      "inc();"
    ],
    steps: [
      {
        line: 7,
        title: "Call makeCounter",
        explanation:
          "makeCounter gets its own stack frame. count starts as a primitive local variable in that frame.",
        stack: [
          { name: "makeCounter", bindings: [{ name: "count", value: primitive("0") }] },
          { name: "global", bindings: [] }
        ],
        heap: []
      },
      {
        line: 2,
        title: "Create inner function",
        explanation:
          "The inner function needs count, so the environment containing count is retained with the function object.",
        stack: [
          { name: "makeCounter", bindings: [{ name: "count", value: primitive("0") }] },
          { name: "global", bindings: [] }
        ],
        heap: [
          {
            id: "Function inc",
            properties: [{ name: "[[Environment]]", value: ref("Env #1") }]
          },
          { id: "Env #1", properties: [{ name: "count", value: primitive("0") }] }
        ]
      },
      {
        line: 7,
        title: "Return inc",
        explanation:
          "makeCounter returns and its stack frame is gone. The inc binding points to the function, which keeps Env #1 alive.",
        stack: [{ name: "global", bindings: [{ name: "inc", value: ref("Function inc") }] }],
        heap: [
          {
            id: "Function inc",
            properties: [{ name: "[[Environment]]", value: ref("Env #1") }]
          },
          { id: "Env #1", properties: [{ name: "count", value: primitive("0") }] }
        ]
      },
      {
        line: 8,
        title: "Call inc",
        explanation:
          "Calling inc creates a new stack frame, but count is read from the retained environment on the heap.",
        stack: [
          { name: "inc", bindings: [{ name: "count", value: ref("Env #1.count") }] },
          { name: "global", bindings: [{ name: "inc", value: ref("Function inc") }] }
        ],
        heap: [
          {
            id: "Function inc",
            properties: [{ name: "[[Environment]]", value: ref("Env #1") }]
          },
          { id: "Env #1", properties: [{ name: "count", value: primitive("1") }] }
        ]
      }
    ]
  },
  {
    id: "variable-shadowing",
    title: "Variable shadowing",
    kicker: "Nearest scope wins",
    summary: "An inner scope can declare a variable with the same name as an outer binding.",
    code: [
      "let value = 'global';",
      "function showValue() {",
      "  let value = 'local';",
      "  value = 'changed local';",
      "}",
      "showValue();",
      "value;"
    ],
    steps: [
      {
        line: 0,
        title: "Create outer binding",
        explanation:
          "The global stack frame gets a binding named value. It stores the primitive string 'global'.",
        stack: [{ name: "global", bindings: [{ name: "value", value: primitive("'global'") }] }],
        heap: []
      },
      {
        line: 5,
        title: "Call showValue",
        explanation:
          "Calling showValue pushes a new stack frame. The outer value binding still exists in the global frame.",
        stack: [
          { name: "showValue", bindings: [] },
          { name: "global", bindings: [{ name: "value", value: primitive("'global'") }] }
        ],
        heap: []
      },
      {
        line: 2,
        title: "Declare local value",
        explanation:
          "The function declares its own value binding. This shadows the outer value while execution is inside showValue.",
        stack: [
          { name: "showValue", bindings: [{ name: "value", value: primitive("'local'") }] },
          { name: "global", bindings: [{ name: "value", value: primitive("'global'") }] }
        ],
        heap: []
      },
      {
        line: 3,
        title: "Change the local binding",
        explanation:
          "The assignment uses the nearest value binding, so only the local value changes. The global value is untouched.",
        stack: [
          {
            name: "showValue",
            bindings: [{ name: "value", value: primitive("'changed local'") }]
          },
          { name: "global", bindings: [{ name: "value", value: primitive("'global'") }] }
        ],
        heap: []
      },
      {
        line: 6,
        title: "Return to outer scope",
        explanation:
          "After showValue returns, its local frame is gone. Reading value again finds the global binding.",
        stack: [{ name: "global", bindings: [{ name: "value", value: primitive("'global'") }] }],
        heap: []
      }
    ]
  },
  {
    id: "primitive-vs-structure-reassign",
    title: "Primitive vs data structure reassignment",
    kicker: "Binding changes, object identity stays separate",
    summary: "Primitive reassignment replaces the binding's value. Data structure reassignment points the binding at another heap object.",
    code: [
      "let label = 'first';",
      "label = 'second';",
      "let list = ['a'];",
      "let alias = list;",
      "list.push('b');",
      "list = ['new'];"
    ],
    steps: [
      {
        line: 0,
        title: "Create primitive binding",
        explanation:
          "label is a binding in the global frame. Conceptually, it holds the primitive string 'first'.",
        stack: [{ name: "global", bindings: [{ name: "label", value: primitive("'first'") }] }],
        heap: []
      },
      {
        line: 1,
        title: "Reassign primitive value",
        explanation:
          "Reassigning label changes the value held by that binding. There is no shared heap object to mutate.",
        stack: [{ name: "global", bindings: [{ name: "label", value: primitive("'second'") }] }],
        heap: []
      },
      {
        line: 2,
        title: "Create data structure",
        explanation:
          "The array is allocated on the heap. The list binding holds a reference to Array #1.",
        stack: [
          {
            name: "global",
            bindings: [
              { name: "label", value: primitive("'second'") },
              { name: "list", value: ref("Array #1") }
            ]
          }
        ],
        heap: [{ id: "Array #1", properties: [{ name: "0", value: primitive("'a'") }] }]
      },
      {
        line: 3,
        title: "Copy the reference",
        explanation:
          "alias receives a copy of the reference. list and alias now point at the same array on the heap.",
        stack: [
          {
            name: "global",
            bindings: [
              { name: "label", value: primitive("'second'") },
              { name: "list", value: ref("Array #1") },
              { name: "alias", value: ref("Array #1") }
            ]
          }
        ],
        heap: [{ id: "Array #1", properties: [{ name: "0", value: primitive("'a'") }] }]
      },
      {
        line: 4,
        title: "Mutate shared array",
        explanation:
          "push changes Array #1 itself. Both list and alias see the added item because both references target that same heap object.",
        stack: [
          {
            name: "global",
            bindings: [
              { name: "label", value: primitive("'second'") },
              { name: "list", value: ref("Array #1") },
              { name: "alias", value: ref("Array #1") }
            ]
          }
        ],
        heap: [
          {
            id: "Array #1",
            properties: [
              { name: "0", value: primitive("'a'") },
              { name: "1", value: primitive("'b'") }
            ]
          }
        ]
      },
      {
        line: 5,
        title: "Reassign data structure binding",
        explanation:
          "Reassigning list points it at a new array. alias still points at Array #1, so the old array remains reachable.",
        stack: [
          {
            name: "global",
            bindings: [
              { name: "label", value: primitive("'second'") },
              { name: "list", value: ref("Array #2") },
              { name: "alias", value: ref("Array #1") }
            ]
          }
        ],
        heap: [
          {
            id: "Array #1",
            properties: [
              { name: "0", value: primitive("'a'") },
              { name: "1", value: primitive("'b'") }
            ]
          },
          { id: "Array #2", properties: [{ name: "0", value: primitive("'new'") }] }
        ]
      }
    ]
  }
];

function primitive(label) {
  return { kind: "primitive", label };
}

function ref(label) {
  return { kind: "reference", label };
}

const state = {
  scenarioIndex: 0,
  stepIndex: 0
};

const storageKey = "node-variable-simulator-state";

const elements = {
  scenarioList: document.querySelector("#scenarioList"),
  scenarioKicker: document.querySelector("#scenarioKicker"),
  scenarioTitle: document.querySelector("#scenarioTitle"),
  codeBlock: document.querySelector("#codeBlock"),
  stackFrames: document.querySelector("#stackFrames"),
  heapObjects: document.querySelector("#heapObjects"),
  memoryRows: document.querySelector("#memoryRows"),
  stepTitle: document.querySelector("#stepTitle"),
  stepExplanation: document.querySelector("#stepExplanation"),
  stepCounter: document.querySelector("#stepCounter"),
  progressBar: document.querySelector("#progressBar"),
  prevBtn: document.querySelector("#prevBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  resetBtn: document.querySelector("#resetBtn")
};

function loadSavedState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(storageKey));

    if (!savedState) {
      return;
    }

    const scenario = scenarios[savedState.scenarioIndex];

    if (!scenario) {
      return;
    }

    state.scenarioIndex = savedState.scenarioIndex;
    state.stepIndex = Math.min(Math.max(savedState.stepIndex || 0, 0), scenario.steps.length - 1);
  } catch {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage errors so the simulator still works in restricted browsers.
    }
  }
}

function saveState() {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        scenarioIndex: state.scenarioIndex,
        stepIndex: state.stepIndex
      })
    );
  } catch {
    // The in-memory state is still enough for the current page session.
  }
}

function renderScenarioList() {
  elements.scenarioList.innerHTML = "";

  scenarios.forEach((scenario, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.scenarioIndex = String(index);
    button.className = `scenario-card${index === state.scenarioIndex ? " active" : ""}`;
    button.innerHTML = `<strong>${scenario.title}</strong><span>${scenario.summary}</span>`;
    button.addEventListener("click", () => {
      state.scenarioIndex = index;
      state.stepIndex = 0;
      saveState();
      render();
    });
    elements.scenarioList.append(button);
  });
}

function updateScenarioListState() {
  elements.scenarioList.querySelectorAll(".scenario-card").forEach((button) => {
    const isActive = Number(button.dataset.scenarioIndex) === state.scenarioIndex;
    button.classList.toggle("active", isActive);
  });
}

function renderCode(scenario, step) {
  elements.codeBlock.innerHTML = "";

  scenario.code.forEach((line, index) => {
    const lineEl = document.createElement("span");
    lineEl.className = `code-line${index === step.line ? " active" : ""}`;
    lineEl.textContent = line || " ";
    elements.codeBlock.append(lineEl);
  });
}

function renderStack(step) {
  elements.stackFrames.innerHTML = "";

  if (!step.stack.length) {
    elements.stackFrames.append(emptyState("No stack frames yet"));
    return;
  }

  step.stack.forEach((frame) => {
    const frameEl = document.createElement("article");
    frameEl.className = "frame";
    frameEl.innerHTML = `<div class="frame-title">${frame.name} frame</div>`;

    if (!frame.bindings.length) {
      frameEl.append(emptyState("No local bindings"));
    }

    frame.bindings.forEach((binding) => {
      frameEl.append(bindingRow(binding.name, binding.value));
    });

    elements.stackFrames.append(frameEl);
  });
}

function renderHeap(step) {
  elements.heapObjects.innerHTML = "";

  if (!step.heap.length) {
    elements.heapObjects.append(emptyState("No heap objects allocated"));
    return;
  }

  step.heap.forEach((object) => {
    const objectEl = document.createElement("article");
    objectEl.className = "heap-card";
    objectEl.innerHTML = `<div class="heap-title">${object.id}</div>`;

    object.properties.forEach((property) => {
      objectEl.append(propertyRow(property.name, property.value));
    });

    elements.heapObjects.append(objectEl);
  });
}

function renderMemoryTable(step) {
  elements.memoryRows.innerHTML = "";

  const rows = [
    ...step.stack.flatMap((frame) =>
      frame.bindings.map((binding) => ({
        area: `${frame.name} frame`,
        name: binding.name,
        value: binding.value
      }))
    ),
    ...step.heap.flatMap((object) =>
      object.properties.map((property) => ({
        area: object.id,
        name: property.name,
        value: property.value
      }))
    )
  ];

  if (!rows.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="table-empty">No bindings or heap properties yet</td>`;
    elements.memoryRows.append(row);
    return;
  }

  rows.forEach((rowData) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${rowData.area}</td>
      <td><span class="name">${rowData.name}</span></td>
      <td>${rowData.value.kind}</td>
      <td>${valueMarkup(rowData.value)}</td>
    `;
    elements.memoryRows.append(row);
  });
}

function bindingRow(name, value) {
  const row = document.createElement("div");
  row.className = "binding";
  row.innerHTML = `<span class="name">${name}</span>${valueMarkup(value)}`;
  return row;
}

function propertyRow(name, value) {
  const row = document.createElement("div");
  row.className = "property-row";
  row.innerHTML = `<span class="name">${name}</span>${valueMarkup(value)}`;
  return row;
}

function valueMarkup(value) {
  if (value.kind === "reference") {
    return `<span class="value"><span class="arrow">-></span><span class="pill reference">${value.label}</span></span>`;
  }

  return `<span class="value"><span class="pill primitive">${value.label}</span></span>`;
}

function emptyState(label) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = label;
  return empty;
}

function render() {
  const scenario = scenarios[state.scenarioIndex];
  const step = scenario.steps[state.stepIndex];

  updateScenarioListState();
  renderCode(scenario, step);
  renderStack(step);
  renderHeap(step);
  renderMemoryTable(step);

  elements.scenarioKicker.textContent = scenario.kicker;
  elements.scenarioTitle.textContent = scenario.title;
  elements.stepTitle.textContent = step.title;
  elements.stepExplanation.textContent = step.explanation;
  elements.stepCounter.textContent = `Step ${state.stepIndex + 1} of ${scenario.steps.length}`;
  elements.progressBar.style.width = `${((state.stepIndex + 1) / scenario.steps.length) * 100}%`;

  elements.prevBtn.disabled = state.stepIndex === 0;
  elements.nextBtn.disabled = state.stepIndex === scenario.steps.length - 1;
}

elements.prevBtn.addEventListener("click", () => {
  state.stepIndex = Math.max(0, state.stepIndex - 1);
  saveState();
  render();
});

elements.nextBtn.addEventListener("click", () => {
  const scenario = scenarios[state.scenarioIndex];
  state.stepIndex = Math.min(scenario.steps.length - 1, state.stepIndex + 1);
  saveState();
  render();
});

elements.resetBtn.addEventListener("click", () => {
  state.stepIndex = 0;
  saveState();
  render();
});

loadSavedState();
renderScenarioList();
render();
