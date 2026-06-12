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

const learningMaterials = {
  "primitive-copy": {
    kicker: "Primitive values",
    title: "Copying a primitive copies the value",
    body:
      "This scenario focuses on the observable behavior of primitive values. The two bindings become independent because there is no shared object behind the number.",
    bullets: [
      "Primitives are immutable language values.",
      "Assigning x into y copies x's current value into a new binding.",
      "Reassigning y later does not change x."
    ],
    notes: [
      ["Watch the stack", "Both x and y live in the global frame."],
      ["No heap object", "The heap stays empty because numbers are shown as primitive values."],
      ["Key takeaway", "Primitive copy and reassignment do not create shared mutable state."]
    ]
  },
  "object-reference": {
    kicker: "Object references",
    title: "Copying an object variable copies a reference",
    body:
      "This scenario shows why object variables can feel different from primitive variables. a and b hold separate copies of the same reference value, so both point at Object #1.",
    bullets: [
      "The object is represented as a heap allocation.",
      "Both bindings hold reference values that point to the same heap object.",
      "Mutating b.count changes Object #1, so a observes the changed object too."
    ],
    notes: [
      ["Watch the heap", "Object #1 remains the single shared object."],
      ["Watch the bindings", "a and b are different bindings with the same reference target."],
      ["Key takeaway", "Sharing happens through the referenced object, not through the variable names."]
    ]
  },
  "function-arguments": {
    kicker: "Function calls",
    title: "Arguments are passed as values",
    body:
      "JavaScript passes argument values into parameter bindings. For a primitive, that value is the primitive itself. For an object, that value is a reference to the heap object.",
    bullets: [
      "n is a local parameter binding, so changing n does not change score.",
      "user holds a copied reference to Object #1.",
      "Mutating user.score changes the object that player also references."
    ],
    notes: [
      ["Watch the call stack", "The update frame appears above the global frame during the call."],
      ["Watch the heap", "Object #1 survives after the function returns because player still references it."],
      ["Key takeaway", "Passing an object does not copy the object; it copies the reference value."]
    ]
  },
  "const-binding": {
    kicker: "Constant bindings",
    title: "const protects the binding, not object contents",
    body:
      "A const declaration makes the variable identifier non-reassignable. If the binding holds an object reference, the object itself may still be mutable.",
    bullets: [
      "settings cannot be rebound to a different object.",
      "settings.theme can change because it mutates Object #1.",
      "The simulator separates the const binding from the heap object it references."
    ],
    notes: [
      ["Watch the binding", "settings keeps pointing at Object #1."],
      ["Watch the property", "theme changes from 'light' to 'dark' on the heap."],
      ["Key takeaway", "const means immutable binding, not deeply immutable value."]
    ]
  },
  closure: {
    kicker: "Closures",
    title: "A function can retain its lexical environment",
    body:
      "This scenario shows a returned inner function keeping access to count after makeCounter has returned. The simulator represents that retained environment on the heap.",
    bullets: [
      "inc is created inside makeCounter.",
      "The function keeps a reference to the environment containing count.",
      "Calling inc later can still update the retained count."
    ],
    notes: [
      ["Watch Function inc", "It points at Env #1 through [[Environment]]."],
      ["Watch Env #1", "The retained count value changes when inc runs."],
      ["Key takeaway", "Closures preserve access to variables from their creation scope."]
    ]
  },
  "variable-shadowing": {
    kicker: "Scope and shadowing",
    title: "The nearest binding wins name lookup",
    body:
      "An inner scope can declare a binding with the same name as an outer binding. Inside that scope, the local binding shadows the outer one.",
    bullets: [
      "The global value binding starts as 'global'.",
      "showValue creates a separate local value binding.",
      "Changing local value does not overwrite global value."
    ],
    notes: [
      ["Watch both frames", "The same name appears in two different stack frames."],
      ["Watch assignment", "value = 'changed local' updates the nearest value binding."],
      ["Key takeaway", "Shadowing changes lookup, not the outer binding."]
    ]
  },
  "primitive-vs-structure-reassign": {
    kicker: "Reassignment",
    title: "Primitive rebinding and reference rebinding side by side",
    body:
      "This scenario compares changing a primitive binding with changing a data structure binding. The array case shows both mutation of a shared object and reassignment to a new object.",
    bullets: [
      "label changes from 'first' to 'second' as a primitive binding.",
      "list and alias first point at the same Array #1.",
      "After list is reassigned, alias still points at Array #1 while list points at Array #2."
    ],
    notes: [
      ["Watch mutation", "list.push('b') changes Array #1."],
      ["Watch reassignment", "list = ['new'] points list at Array #2."],
      ["Key takeaway", "Mutating an object and reassigning a binding are different operations."]
    ]
  }
};

const learningMaterialsEt = {
  "primitive-copy": {
    kicker: "Primitiivsed väärtused",
    title: "Primitiivse väärtuse kopeerimine kopeerib väärtuse",
    body:
      "See stsenaarium keskendub primitiivsete väärtuste nähtavale käitumisele. Kaks sidet muutuvad sõltumatuks, sest arvu taga ei ole jagatud objekti.",
    bullets: [
      "Primitiivid on muutumatud keele väärtused.",
      "x-i määramine y-le kopeerib x-i hetkeväärtuse uude sidemesse.",
      "y hilisem ümbermääramine ei muuda x-i."
    ],
    notes: [
      ["Vaata pinu", "Nii x kui ka y asuvad globaalses raamis."],
      ["Heap-objekti pole", "Heap jääb tühjaks, sest arvud on näidatud primitiivsete väärtustena."],
      ["Põhiidee", "Primitiivi kopeerimine ja ümbermääramine ei loo jagatud muudetavat olekut."]
    ]
  },
  "object-reference": {
    kicker: "Objektiviited",
    title: "Objektimuutuja kopeerimine kopeerib viite",
    body:
      "See stsenaarium näitab, miks objektimuutujad käituvad primitiividest erinevalt. a ja b hoiavad sama viiteväärtuse eraldi koopiaid, seega osutavad mõlemad objektile Object #1.",
    bullets: [
      "Objekt on kujutatud heap-is paikneva väärtusena.",
      "Mõlemad sidemed hoiavad viiteväärtust samale heap-objektile.",
      "b.count muutmine muudab Object #1 sisu, seega näeb muutust ka a."
    ],
    notes: [
      ["Vaata heap-i", "Object #1 jääb ainsaks jagatud objektiks."],
      ["Vaata sidemeid", "a ja b on erinevad sidemed, mille viite sihtmärk on sama."],
      ["Põhiidee", "Jagamine toimub viidatud objekti, mitte muutujanimede kaudu."]
    ]
  },
  "function-arguments": {
    kicker: "Funktsioonikutsed",
    title: "Argumendid antakse edasi väärtustena",
    body:
      "JavaScript annab argumendi väärtused parameetrisidemetesse. Primitiivi puhul on see väärtus primitiiv ise. Objekti puhul on see viide heap-objektile.",
    bullets: [
      "n on lokaalne parameetriside, seega n muutmine ei muuda score väärtust.",
      "user hoiab kopeeritud viidet objektile Object #1.",
      "user.score muutmine muudab objekti, millele player samuti viitab."
    ],
    notes: [
      ["Vaata call stack-i", "update raam ilmub kutse ajal globaalse raami kohale."],
      ["Vaata heap-i", "Object #1 jääb pärast funktsiooni lõppu alles, sest player viitab sellele."],
      ["Põhiidee", "Objekti edasiandmine ei kopeeri objekti; see kopeerib viiteväärtuse."]
    ]
  },
  "const-binding": {
    kicker: "Konstantsed sidemed",
    title: "const kaitseb sidet, mitte objekti sisu",
    body:
      "const deklaratsioon ei luba muutuja identifikaatorit ümber määrata. Kui side hoiab objektiviidet, võib objekt ise siiski muudetav olla.",
    bullets: [
      "settings ei saa osutada teisele objektile.",
      "settings.theme saab muutuda, sest see muudab Object #1 sisu.",
      "Simulaator eraldab const-sideme heap-objektist, millele see viitab."
    ],
    notes: [
      ["Vaata sidet", "settings osutab endiselt objektile Object #1."],
      ["Vaata omadust", "theme muutub heap-is väärtusest 'light' väärtuseks 'dark'."],
      ["Põhiidee", "const tähendab muutumatut sidet, mitte sügavalt muutumatut väärtust."]
    ]
  },
  closure: {
    kicker: "Sulundid",
    title: "Funktsioon võib säilitada oma leksilise keskkonna",
    body:
      "See stsenaarium näitab, kuidas tagastatud sisemine funktsioon pääseb count väärtusele ligi ka pärast makeCounter lõppu. Simulaator kujutab säilitatud keskkonda heap-is.",
    bullets: [
      "inc luuakse makeCounter sees.",
      "Funktsioon hoiab viidet keskkonnale, kus count asub.",
      "inc hilisem kutsumine saab säilitatud count väärtust muuta."
    ],
    notes: [
      ["Vaata Function inc", "See osutab Env #1 keskkonnale läbi [[Environment]] välja."],
      ["Vaata Env #1", "Säilitatud count väärtus muutub, kui inc käivitub."],
      ["Põhiidee", "Sulundid säilitavad ligipääsu loomisskoobi muutujatele."]
    ]
  },
  "variable-shadowing": {
    kicker: "Skoop ja varjutamine",
    title: "Nimeotsing kasutab lähimat sidet",
    body:
      "Sisemine skoop võib deklareerida sama nimega sideme kui väline skoop. Selle sees varjutab lokaalne side välist sidet.",
    bullets: [
      "Globaalne value side algab väärtusega 'global'.",
      "showValue loob eraldi lokaalse value sideme.",
      "Lokaalse value muutmine ei kirjuta globaalset value sidet üle."
    ],
    notes: [
      ["Vaata mõlemat raami", "Sama nimi ilmub korraga kahes erinevas stack-raamis."],
      ["Vaata omistamist", "value = 'changed local' uuendab lähimat value sidet."],
      ["Põhiidee", "Varjutamine muudab nimeotsingut, mitte välist sidet."]
    ]
  },
  "primitive-vs-structure-reassign": {
    kicker: "Ümbermääramine",
    title: "Primitiivi ja viite ümbermääramine kõrvuti",
    body:
      "See stsenaarium võrdleb primitiivse sideme muutmist andmestruktuuri sideme muutmisega. Massiivi näide näitab nii jagatud objekti muutmist kui ka uuele objektile ümbermääramist.",
    bullets: [
      "label muutub primitiivse sidemena väärtusest 'first' väärtuseks 'second'.",
      "list ja alias osutavad alguses samale Array #1 väärtusele.",
      "Pärast list ümbermääramist osutab alias endiselt Array #1-le, aga list osutab Array #2-le."
    ],
    notes: [
      ["Vaata muutmist", "list.push('b') muudab Array #1 sisu."],
      ["Vaata ümbermääramist", "list = ['new'] paneb list-i osutama Array #2-le."],
      ["Põhiidee", "Objekti muutmine ja sideme ümbermääramine on erinevad operatsioonid."]
    ]
  }
};

const localizedLearningMaterials = {
  en: learningMaterials,
  et: learningMaterialsEt
};

const scenarioTranslations = {
  et: {
    "primitive-copy": {
      title: "Primitiivi kopeerimine",
      kicker: "Väärtusena edastamine",
      summary: "Arvud, sõned, tõeväärtused, null, undefined, sümbolid ja bigint-id kopeeritakse väärtustena.",
      steps: [
        ["Deklareeri x", "Side x luuakse praeguses stack-raamis ja see hoiab otse primitiivset väärtust 10."],
        ["Kopeeri x väärtus y-sse", "x-is olev väärtus kopeeritakse y-sse. Need kaks sidet on sõltumatud, sest jagatud heap-objekti ei ole."],
        ["Määra y ümber", "y muutmine asendab ainult y väärtuse. x hoiab endiselt väärtust 10, mis on primitiivide väärtusena edastamise põhiidee."]
      ]
    },
    "object-reference": {
      title: "Objektiviite kopeerimine",
      kicker: "Jagatud heap-objekt",
      summary: "Objekte hoidvad muutujad salvestavad viiteid. Muutuja kopeerimine kopeerib viite.",
      steps: [
        ["Loo objekt", "Objekt paigutatakse heap-i. const-side a hoiab viidet sellele heap-objektile."],
        ["Kopeeri viide", "b saab koopia viitest, mida hoiab a. Mõlemad sidemed osutavad nüüd samale heap-objektile."],
        ["Muuda läbi b", "Omaduse uuendus muudab heap-is olevat Object #1 väärtust. a näeb sama count väärtust, sest a osutab samale objektile."]
      ]
    },
    "function-arguments": {
      title: "Funktsiooni argumendid",
      kicker: "Viiteväärtus edastatakse",
      summary: "JavaScript edastab argumendi väärtused. Objektide puhul on see väärtus viide.",
      steps: [
        ["Loo primitiiv", "score on primitiivne side globaalses stack-raamis."],
        ["Loo player objekt", "player hoiab viidet heap-objektile. Objekti score omadus on primitiivne väärtus."],
        ["Kutsu update", "Uus stack-raam lisatakse. n saab väärtuse 4 koopia, user saab koopia viitest Object #1-le."],
        ["Määra lokaalne primitiiv ümber", "n muutub ainult funktsiooni raamis. Väline score side jääb väärtuseks 4."],
        ["Muuda jagatud objekti", "user.score muudab heap-objekti. Globaalne player side osutab endiselt samale muudetud objektile."],
        ["Naase funktsioonist", "update raam eemaldatakse call stack-ist. Heap-objekt jääb alles, sest player viitab sellele endiselt."]
      ]
    },
    "const-binding": {
      title: "const-side",
      kicker: "Side vs sisu",
      summary: "const takistab muutuja ümber sidumist. See ei külmuta objekti, millele muutuja viitab.",
      steps: [
        ["const hoiab viidet", "settings on const-side, aga selles hoitav väärtus on endiselt viide heap-objektile."],
        ["Objekti sisu võib muutuda", "const-side osutab endiselt Object #1-le. Omaduse muutmine muudab heap-objekti, mitte sidet ennast."],
        ["Ümbersidumine on keelatud", "Teise objekti määramine settings muutujale asendaks sideme viite, seega JavaScript viskab TypeError-i."]
      ]
    },
    closure: {
      title: "Sulundi säilitamine",
      kicker: "Heap hoiab keskkonda elus",
      summary: "Funktsioonid võivad säilitada ligipääsu muutujatele ka pärast välise kutse lõppu.",
      steps: [
        ["Kutsu makeCounter", "makeCounter saab oma stack-raami. count algab selles raamis primitiivse lokaalse muutujana."],
        ["Loo sisemine funktsioon", "Sisemine funktsioon vajab count väärtust, seega säilitatakse count-i sisaldav keskkond koos funktsiooniobjektiga."],
        ["Tagasta inc", "makeCounter tagastab ja selle stack-raam kaob. inc side osutab funktsioonile, mis hoiab Env #1 elus."],
        ["Kutsu inc", "inc kutsumine loob uue stack-raami, aga count loetakse heap-is säilitatud keskkonnast."]
      ]
    },
    "variable-shadowing": {
      title: "Muutuja varjutamine",
      kicker: "Lähim skoop võidab",
      summary: "Sisemine skoop võib deklareerida sama nimega muutuja kui väline side.",
      steps: [
        ["Loo väline side", "Globaalne stack-raam saab sideme nimega value. See hoiab primitiivset sõne 'global'."],
        ["Kutsu showValue", "showValue kutsumine lisab uue stack-raami. Väline value side on endiselt globaalses raamis olemas."],
        ["Deklareeri lokaalne value", "Funktsioon deklareerib oma value sideme. See varjutab välist value sidet showValue täitmise ajal."],
        ["Muuda lokaalset sidet", "Omistamine kasutab lähimat value sidet, seega muutub ainult lokaalne value. Globaalne value jääb puutumata."],
        ["Naase välisesse skoopi", "Pärast showValue lõppu kaob selle lokaalne raam. value lugemine leiab taas globaalse sideme."]
      ]
    },
    "primitive-vs-structure-reassign": {
      title: "Primitiivi ja andmestruktuuri ümbermääramine",
      kicker: "Side muutub, objekti identiteet jääb eraldi",
      summary: "Primitiivi ümbermääramine asendab sideme väärtuse. Andmestruktuuri ümbermääramine paneb sideme osutama teisele heap-objektile.",
      steps: [
        ["Loo primitiivne side", "label on side globaalses raamis. Kontseptuaalselt hoiab see primitiivset sõne 'first'."],
        ["Määra primitiivne väärtus ümber", "label ümbermääramine muudab selle sideme väärtust. Jagatud heap-objekti, mida muuta, ei ole."],
        ["Loo andmestruktuur", "Massiiv paigutatakse heap-i. list side hoiab viidet Array #1-le."],
        ["Kopeeri viide", "alias saab viite koopia. list ja alias osutavad nüüd samale heap-is olevale massiivile."],
        ["Muuda jagatud massiivi", "push muudab Array #1 sisu. Nii list kui alias näevad lisatud elementi, sest mõlemad viited osutavad samale heap-objektile."],
        ["Määra andmestruktuuri side ümber", "list ümbermääramine paneb selle osutama uuele massiivile. alias osutab endiselt Array #1-le, seega vana massiiv on veel kättesaadav."]
      ]
    }
  }
};

const uiText = {
  en: {
    "intro.eyebrow": "JavaScript memory model",
    "intro.title": "Node.js Variable Memory Simulator",
    "intro.lede": "Step through small JavaScript examples and watch primitive values, object references, stack frames, and heap objects change.",
    "labels.scenarios": "Scenarios",
    "buttons.prev": "Prev",
    "buttons.next": "Next",
    "buttons.reset": "Reset",
    "legend.primitive": "Primitive value",
    "legend.reference": "Reference",
    "legend.heap": "Heap object",
    "labels.code": "Code",
    "labels.callStack": "Call stack",
    "labels.bindingsLiveHere": "bindings live here",
    "labels.heap": "Heap",
    "labels.objectsLiveHere": "objects live here",
    "labels.memoryTable": "Conceptual memory table",
    "labels.notPhysicalAddresses": "not physical addresses",
    "table.area": "Area",
    "table.name": "Name",
    "table.kind": "Kind",
    "table.holds": "Holds",
    "learning.eyebrow": "Learning materials",
    "learning.title": "What this simulator teaches",
    "learning.description": "Use these notes as a companion to the scenarios. The visuals are conceptual: they explain observable JavaScript behavior, not exact V8 memory addresses.",
    "basics.title": "Visual model basics",
    "basics.stack.title": "Call stack",
    "basics.stack.body": "The call stack shows the currently active execution contexts. In this simulator, the newest function call appears above the older caller so you can see which bindings are currently closest to execution.",
    "basics.stack.item1": "The global frame is the outer script-level context.",
    "basics.stack.item2": "Function frames appear when a function is called.",
    "basics.stack.item3": "A frame disappears when that function returns.",
    "basics.frames.title": "Frame types",
    "basics.frames.body": "A frame is a conceptual container for local bindings. The label tells you which scope the bindings belong to: `global frame`, a named function frame such as `update frame`, or a returned closure's active frame such as `inc frame`.",
    "basics.frames.item1": "Global bindings are visible from top-level code.",
    "basics.frames.item2": "Function bindings include parameters and local variables.",
    "basics.frames.item3": "Shadowed names can exist in multiple frames at once.",
    "basics.heap.title": "Heap",
    "basics.heap.body": "The heap represents objects, arrays, functions, and retained closure environments. Variables do not contain these structures directly in the visual model; they hold reference values that point to heap entries.",
    "basics.heap.item1": "Object and array properties are shown inside heap cards.",
    "basics.heap.item2": "Multiple bindings can reference the same heap object.",
    "basics.heap.item3": "Heap entries remain shown while some binding or closure still reaches them.",
    "learning.inScenario": "In this scenario",
    "references.title": "References",
    "aria.workspace": "Simulator workspace",
    "aria.scenarioSelector": "Scenario selector",
    "aria.stepControls": "Step controls",
    "aria.prev": "Previous step",
    "aria.next": "Next step",
    "aria.reset": "Reset scenario",
    "aria.progress": "Scenario progress",
    "aria.legend": "Visual legend",
    "aria.memoryVisualization": "Memory visualization",
    "status.step": "Step {current} of {total}",
    "empty.noStack": "No stack frames yet",
    "empty.noBindings": "No local bindings",
    "empty.noHeap": "No heap objects allocated",
    "empty.noRows": "No bindings or heap properties yet",
    "frame.global": "global frame",
    "frame.named": "{name} frame",
    "kind.primitive": "primitive",
    "kind.reference": "reference"
  },
  et: {
    "intro.eyebrow": "JavaScripti mälumudel",
    "intro.title": "Node.js muutujate mälu simulaator",
    "intro.lede": "Liigu läbi väikeste JavaScripti näidete ja vaata, kuidas muutuvad primitiivsed väärtused, objektiviited, stack-raamid ja heap-objektid.",
    "labels.scenarios": "Stsenaariumid",
    "buttons.prev": "Eelmine",
    "buttons.next": "Järgmine",
    "buttons.reset": "Algusesse",
    "legend.primitive": "Primitiivne väärtus",
    "legend.reference": "Viide",
    "legend.heap": "Heap-objekt",
    "labels.code": "Kood",
    "labels.callStack": "Call stack",
    "labels.bindingsLiveHere": "sidemed asuvad siin",
    "labels.heap": "Heap",
    "labels.objectsLiveHere": "objektid asuvad siin",
    "labels.memoryTable": "Kontseptuaalne mälutabel",
    "labels.notPhysicalAddresses": "mitte füüsilised aadressid",
    "table.area": "Ala",
    "table.name": "Nimi",
    "table.kind": "Tüüp",
    "table.holds": "Hoiab",
    "learning.eyebrow": "Õppematerjalid",
    "learning.title": "Mida see simulaator õpetab",
    "learning.description": "Kasuta neid märkmeid stsenaariumide kõrval. Visuaalid on kontseptuaalsed: need selgitavad JavaScripti nähtavat käitumist, mitte täpseid V8 mälu aadresse.",
    "basics.title": "Visuaalse mudeli põhitõed",
    "basics.stack.title": "Call stack",
    "basics.stack.body": "Call stack näitab parajasti aktiivseid täitmiskontekste. Selles simulaatoris ilmub uusim funktsioonikutse vanema kutsuja kohale, et oleks näha, millised sidemed on täitmisele kõige lähemal.",
    "basics.stack.item1": "Globaalne raam on skripti välimine kontekst.",
    "basics.stack.item2": "Funktsiooniraamid ilmuvad siis, kui funktsioon kutsutakse välja.",
    "basics.stack.item3": "Raam kaob, kui funktsioon tagastab.",
    "basics.frames.title": "Raamide tüübid",
    "basics.frames.body": "Raam on kontseptuaalne konteiner lokaalsete sidemete jaoks. Silt näitab, millisesse skoopi sidemed kuuluvad: globaalne raam, nimeline funktsiooniraam nagu update frame või sulundi aktiivne raam nagu inc frame.",
    "basics.frames.item1": "Globaalsed sidemed on nähtavad tipptaseme koodist.",
    "basics.frames.item2": "Funktsioonisidemed sisaldavad parameetreid ja lokaalseid muutujaid.",
    "basics.frames.item3": "Varjutatud nimed võivad korraga eksisteerida mitmes raamis.",
    "basics.heap.title": "Heap",
    "basics.heap.body": "Heap tähistab objekte, massiive, funktsioone ja säilitatud sulundikeskkondi. Muutujad ei sisalda selles visuaalses mudelis neid struktuure otse; nad hoiavad viiteväärtusi heap-kirjetele.",
    "basics.heap.item1": "Objekti ja massiivi omadused on näidatud heap-kaartide sees.",
    "basics.heap.item2": "Mitu sidet võib viidata samale heap-objektile.",
    "basics.heap.item3": "Heap-kirjed jäävad nähtavale seni, kuni mõni side või sulund nendeni ulatub.",
    "learning.inScenario": "Selles stsenaariumis",
    "references.title": "Viited",
    "aria.workspace": "Simulaatori tööala",
    "aria.scenarioSelector": "Stsenaariumi valik",
    "aria.stepControls": "Sammude juhtnupud",
    "aria.prev": "Eelmine samm",
    "aria.next": "Järgmine samm",
    "aria.reset": "Lähtesta stsenaarium",
    "aria.progress": "Stsenaariumi edenemine",
    "aria.legend": "Visuaalne legend",
    "aria.memoryVisualization": "Mälu visualiseerimine",
    "status.step": "Samm {current}/{total}",
    "empty.noStack": "Stack-raame pole veel",
    "empty.noBindings": "Lokaalseid sidemeid pole",
    "empty.noHeap": "Heap-objekte pole loodud",
    "empty.noRows": "Sidemeid ega heap-omadusi pole veel",
    "frame.global": "globaalne raam",
    "frame.named": "{name} raam",
    "kind.primitive": "primitiiv",
    "kind.reference": "viide"
  }
};

const state = {
  scenarioIndex: 0,
  stepIndex: 0,
  language: "en"
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
  scenarioLessonKicker: document.querySelector("#scenarioLessonKicker"),
  scenarioLessonTitle: document.querySelector("#scenarioLessonTitle"),
  scenarioLessonBody: document.querySelector("#scenarioLessonBody"),
  scenarioLessonBullets: document.querySelector("#scenarioLessonBullets"),
  scenarioNotes: document.querySelector("#scenarioNotes"),
  stepTitle: document.querySelector("#stepTitle"),
  stepExplanation: document.querySelector("#stepExplanation"),
  stepCounter: document.querySelector("#stepCounter"),
  progressBar: document.querySelector("#progressBar"),
  languageOptions: document.querySelectorAll("[data-language]"),
  prevBtn: document.querySelector("#prevBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  resetBtn: document.querySelector("#resetBtn")
};

function t(key, replacements = {}) {
  const text = uiText[state.language]?.[key] || uiText.en[key] || key;

  return Object.entries(replacements).reduce(
    (result, [name, value]) => result.replace(`{${name}}`, value),
    text
  );
}

function getScenarioText(scenario) {
  return {
    title: scenarioTranslations[state.language]?.[scenario.id]?.title || scenario.title,
    kicker: scenarioTranslations[state.language]?.[scenario.id]?.kicker || scenario.kicker,
    summary: scenarioTranslations[state.language]?.[scenario.id]?.summary || scenario.summary
  };
}

function getStepText(scenario, stepIndex) {
  const translatedStep = scenarioTranslations[state.language]?.[scenario.id]?.steps?.[stepIndex];
  const step = scenario.steps[stepIndex];

  return {
    title: translatedStep?.[0] || step.title,
    explanation: translatedStep?.[1] || step.explanation
  };
}

function frameLabel(name) {
  if (name === "global") {
    return t("frame.global");
  }

  return t("frame.named", { name });
}

function kindLabel(kind) {
  return t(`kind.${kind}`);
}

function renderStaticText() {
  document.documentElement.lang = state.language;
  document.title = t("intro.title");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });

  elements.languageOptions.forEach((button) => {
    const isActive = button.dataset.language === state.language;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  elements.scenarioList.querySelectorAll(".scenario-card").forEach((button) => {
    const scenario = scenarios[Number(button.dataset.scenarioIndex)];
    const scenarioText = getScenarioText(scenario);
    button.querySelector("strong").textContent = scenarioText.title;
    button.querySelector("span").textContent = scenarioText.summary;
  });
}

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
    state.language = uiText[savedState.language] ? savedState.language : state.language;
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
        stepIndex: state.stepIndex,
        language: state.language
      })
    );
  } catch {
    // The in-memory state is still enough for the current page session.
  }
}

function renderScenarioList() {
  elements.scenarioList.innerHTML = "";

  scenarios.forEach((scenario, index) => {
    const scenarioText = getScenarioText(scenario);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.scenarioIndex = String(index);
    button.className = `scenario-card${index === state.scenarioIndex ? " active" : ""}`;
    button.innerHTML = `<strong></strong><span></span>`;
    button.querySelector("strong").textContent = scenarioText.title;
    button.querySelector("span").textContent = scenarioText.summary;
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
    elements.stackFrames.append(emptyState(t("empty.noStack")));
    return;
  }

  step.stack.forEach((frame) => {
    const frameEl = document.createElement("article");
    frameEl.className = "frame";
    frameEl.innerHTML = `<div class="frame-title"></div>`;
    frameEl.querySelector(".frame-title").textContent = frameLabel(frame.name);

    if (!frame.bindings.length) {
      frameEl.append(emptyState(t("empty.noBindings")));
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
    elements.heapObjects.append(emptyState(t("empty.noHeap")));
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
        areaLabel: frameLabel(frame.name),
        name: binding.name,
        value: binding.value
      }))
    ),
    ...step.heap.flatMap((object) =>
      object.properties.map((property) => ({
        area: object.id,
        areaLabel: object.id,
        name: property.name,
        value: property.value
      }))
    )
  ];

  if (!rows.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="table-empty">${t("empty.noRows")}</td>`;
    elements.memoryRows.append(row);
    return;
  }

  rows.forEach((rowData) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${rowData.areaLabel}</td>
      <td><span class="name">${rowData.name}</span></td>
      <td>${kindLabel(rowData.value.kind)}</td>
      <td>${valueMarkup(rowData.value)}</td>
    `;
    elements.memoryRows.append(row);
  });
}

function renderLearningGuide(scenario) {
  const material =
    localizedLearningMaterials[state.language]?.[scenario.id] || localizedLearningMaterials.en[scenario.id];

  elements.scenarioLessonKicker.textContent = material.kicker;
  elements.scenarioLessonTitle.textContent = material.title;
  elements.scenarioLessonBody.textContent = material.body;
  elements.scenarioLessonBullets.innerHTML = "";
  elements.scenarioNotes.innerHTML = "";

  material.bullets.forEach((bullet) => {
    const item = document.createElement("li");
    item.textContent = bullet;
    elements.scenarioLessonBullets.append(item);
  });

  material.notes.forEach(([title, detail]) => {
    const note = document.createElement("div");
    const noteTitle = document.createElement("strong");
    const noteDetail = document.createElement("span");

    noteTitle.textContent = title;
    noteDetail.textContent = detail;
    note.append(noteTitle, noteDetail);
    elements.scenarioNotes.append(note);
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
  const scenarioText = getScenarioText(scenario);
  const stepText = getStepText(scenario, state.stepIndex);

  renderStaticText();
  updateScenarioListState();
  renderCode(scenario, step);
  renderStack(step);
  renderHeap(step);
  renderMemoryTable(step);
  renderLearningGuide(scenario);

  elements.scenarioKicker.textContent = scenarioText.kicker;
  elements.scenarioTitle.textContent = scenarioText.title;
  elements.stepTitle.textContent = stepText.title;
  elements.stepExplanation.textContent = stepText.explanation;
  elements.stepCounter.textContent = t("status.step", {
    current: state.stepIndex + 1,
    total: scenario.steps.length
  });
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

elements.languageOptions.forEach((button) => {
  button.addEventListener("click", () => {
    state.language = button.dataset.language;
    saveState();
    render();
  });
});

loadSavedState();
renderScenarioList();
render();
