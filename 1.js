//تعریف  dfa اولیه
class DFA {
    constructor(states, alphabet, startState, acceptingStates, transitionFunction) {
      this.states = new Set(states);
      this.alphabet = new Set(alphabet);
      this.startState = startState;
      this.acceptingStates = new Set(acceptingStates);
      this.transitionFunction = transitionFunction;
    }
  
    transition(state, symbol) {
      return this.transitionFunction[`<span class="math-inline">\{state\},</span>{symbol}`];
    }
  }
  
  const { XMLParser } = require('xml2js');
  const parser = new XMLParser();
  
  function createDFAFromXML(xmlString) {
    let xmlDoc;
    try {
      const result = parser.parse(xmlString);
      xmlDoc = result.Automata;
    } catch (error) {
      console.error("خطا در تجزیه فایل XML:", error);
      return null;
    }
  
    const type = xmlDoc.$ ? xmlDoc.$.type : null;
    if (type !== "DFA") {
      console.error("فایل XML نشان دهنده یک DFA نیست.");
      return null;
    }
  
    const alphabets = xmlDoc.Alphabets ? xmlDoc.Alphabets[0].alphabet : [];
    const alphabet = alphabets.map(el => el.$.letter);
  
    const statesElement = xmlDoc.States ? xmlDoc.States[0].state : [];
    const states = statesElement.map(el => el.$.name);
  
    const initialStateElement = xmlDoc.States ? xmlDoc.States[0].initialState : [];
    const startState = initialStateElement.length > 0 ? initialStateElement[0].$.name : null;
  
    const finalStatesElement = xmlDoc.States ? xmlDoc.States[0].FinalStates : [];
    const finalStateElements = finalStatesElement.length > 0 ? finalStatesElement[0].finalState : [];
    const acceptingStates = finalStateElements.map(el => el.$.name);
  
    const transitionsElement = xmlDoc.Transitions ? xmlDoc.Transitions[0].transition : [];
    const transitionFunction = {};
    transitionsElement.forEach(el => {
      const source = el.$.source;
      const destination = el.$.destination;
      const label = el.$.label;
      transitionFunction[`<span class="math-inline">\{source\},</span>{label}`] = destination;
    });
  
    return new DFA(states, alphabet, startState, acceptingStates, transitionFunction);
  }
  
  // ورودی XML شما
  const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
  <Automata type=”DFA”>
  <Alphabets numberOfAlphabets=2>
  <alphabet letter=”a”/>
  <alphabet letter=”b”/>
  </Alphabets>
  <States numberOfStates=6>
  <state name=”q0” />
  <state name=”q1” />
  <state name=”q2” />
  <state name=”q3” />
  <state name=”q4” />
  <state name=”q5” />
  <initialState name=”q0”/>
  <FinalStates numberOfFinalStates=2>
  <finalState name=”q3”/>
  <finalState name=”q5”/>
  </FinalStates>
  </States>
  <Transitions numberOfTrans=12>
  <transition source=”q0” destination=”q1” label=”a”/>
  <transition source=”q0” destination=”q3” label=”b”/>
  <transition source=”q1” destination=”q0” label=”a”/>
  <transition source=”q1” destination=”q3” label=”b”/>
  <transition source=”q2” destination=”q1” label=”a”/>
  <transition source=”q2” destination=”q4” label=”b”/>
  <transition source=”q3” destination=”q5” label=”a”/>
  <transition source=”q3” destination=”q5” label=”b”/>
  <transition source=”q4” destination=”q3” label=”a”/>
  <transition source=”q4” destination=”q3” label=”b”/>
  <transition source=”q5” destination=”q5” label=”a”/>
  <transition source=”q5” destination=”q5” label=”b”/>
  </Transitions>
  </Automata>`;
  
  // ایجاد DFA از XML
  const dfaFromXML = createDFAFromXML(xmlData);
  console.log("DFA ایجاد شده از XML:", dfaFromXML);
  
  // ... بقیه کد شما برای جدول تمایز و DFA کمینه ...
  function createDistinguishabilityTable(states) {
    const table = {};
    const sortedStates = [...states].sort(); // برای ترتیب یکسان
  
    for (let i = 0; i < sortedStates.length; i++) {
      table[sortedStates[i]] = {};
      for (let j = i + 1; j < sortedStates.length; j++) {
        table[sortedStates[i]][sortedStates[j]] = false; // false به معنی غیرقابل تشخیص در ابتدا
      }
    }
    return table;
  }
  
  const distinguishabilityTableFromXML = createDistinguishabilityTable(dfaFromXML.states);
  console.log("جدول تمایز برای DFA ایجاد شده از XML (اولیه):", distinguishabilityTableFromXML);
  
  // جدول تمایز بعد از پر کردن
  function fillDistinguishabilityTable(dfa, table) {
    const states = [...dfa.states].sort();
    let changed = true;
  
    // مرحله اول: علامت‌گذاری حالت‌های پایانی و غیرپایانی
    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const state1 = states[i];
        const state2 = states[j];
        const isState1Accepting = dfa.acceptingStates.has(state1);
        const isState2Accepting = dfa.acceptingStates.has(state2);
  
        if (isState1Accepting !== isState2Accepting) {
          table[state1][state2] = true;
        }
      }
    }
  
    // مرحله دوم: بررسی انتقال‌ها به صورت تکراری
    while (changed) {
      changed = false;
      for (let i = 0; i < states.length; i++) {
        for (let j = i + 1; j < states.length; j++) {
          const state1 = states[i];
          const state2 = states[j];
  
          if (!table[state1]?. [state2] && !table[state2]?. [state1]) { // اگر هنوز غیرقابل تشخیص است
            for (const symbol of dfa.alphabet) {
              const nextState1 = dfa.transition(state1, symbol);
              const nextState2 = dfa.transition(state2, symbol);
  
              // بررسی ترتیب برای دسترسی به جدول
              const s1 = nextState1 < nextState2 ? nextState1 : nextState2;
              const s2 = nextState1 < nextState2 ? nextState2 : nextState1;
  
              if (s1 !== s2 && (table[s1]?. [s2] || table[s2]?. [s1])) {
                table[state1][state2] = true;
                changed = true;
                break; // نیازی به بررسی نمادهای دیگر نیست
              }
            }
          }
        }
      }
    }
  }
  
  fillDistinguishabilityTable(dfaFromXML, distinguishabilityTableFromXML);
  console.log("جدول تمایز برای DFA ایجاد شده از XML (پس از پر کردن):", distinguishabilityTableFromXML);
  
  function groupUndistinguishableStates(states, table) {
    const groups = [];
    const visited = new Set();
    const sortedStates = [...states].sort();
  
    for (const state of sortedStates) {
      if (!visited.has(state)) {
        const group = [state];
        visited.add(state);
        for (const otherState of sortedStates) {
          if (state !== otherState && !visited.has(otherState)) {
            const s1 = state < otherState ? state : otherState;
            const s2 = state < otherState ? otherState : state;
            if (!table[s1]?. [s2] && !table[s2]?. [s1]) {
              group.push(otherState);
              visited.add(otherState);
            }
          }
        }
        groups.push(group);
      }
    }
    return groups;
  }
  
  const stateGroupsFromXML = groupUndistinguishableStates(dfaFromXML.states, distinguishabilityTableFromXML);
  console.log("گروه‌های حالت‌های غیرقابل تشخیص برای DFA ایجاد شده از XML:", stateGroupsFromXML);
  
  function createMinimalDFA(dfa, stateGroups) {
    const minimalStates = stateGroups.map((group, index) => `Q${index}`);
    const minimalStartState = stateGroups.findIndex(group => group.includes(dfa.startState));
    const minimalAcceptingStates = new Set(
      stateGroups.filter(group => group.some(state => dfa.acceptingStates.has(state))).map((_, index) => `Q${index}`)
    );
    const minimalTransitionFunction = {};
  
    for (let i = 0; i < stateGroups.length; i++) {
      const group = stateGroups[i];
      const minimalState = `Q${i}`;
      for (const symbol of dfa.alphabet) {
        const representativeState = group[0]; // انتخاب اولین حالت به عنوان نماینده
        const nextState = dfa.transition(representativeState, symbol);
        const nextGroupIndex = stateGroups.findIndex(g => g.includes(nextState));
        minimalTransitionFunction[`<span class="math-inline">\{minimalState\},</span>{symbol}`] = `Q${nextGroupIndex}`;
      }
    }
  
    return new DFA(
      minimalStates,
      [...dfa.alphabet],
      `Q${minimalStartState}`,
      minimalAcceptingStates,
      minimalTransitionFunction
    );
  }
  
  const minimalDFAFromXML = createMinimalDFA(dfaFromXML, stateGroupsFromXML);
  console.log("DFA کمینه ایجاد شده از XML:", minimalDFAFromXML);